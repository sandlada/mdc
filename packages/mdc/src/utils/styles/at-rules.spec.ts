/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 */

import { describe, it, expect } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { defineSchema } from './define-schema'
import { mapStateTriggers } from './map-state-triggers'
import { compileStateSheet } from './compile-state-sheet'

function normalizeCss(css: string | string[]): string {
    const text = Array.isArray(css) ? css.join(' ') : css
    return text
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\{\s+/g, '{ ')
        .replace(/\s+\}/g, ' }')
        .replace(/\{\s*\}/g, '{}')
        .replace(/;\s*\}/g, '; }')
        .trim()
}

describe('button', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
    })
    const SizeTriggers = mapStateTriggers({
        'small': '.small',
        'medium': '.medium',
        'large': '.large',
    })

    /**
     * State 語法（新範式，原 `@anchor` 已更名為 `@state` 以對齊 StateSchema 並避免與 CSS Anchor Positioning 衝突）：
     *   state-rule  := "@state" "(" target ")" selector "{" body "}"
     *   target      := compound-selector | combinator-sequence（不可含逗號、&，不可省略）
     *     e.g. button | button.show[selected][data-wow="yes"] | #submit | .card | [selected] | * | button:hover | button::before | button+button
     *   selector    := complex-selector（完整複雜選擇器，必填，不可省略；須包含 target）
     *     e.g. button.show.ahaha.hummm | .container button:has(.label)>.label | button, button .label
     *   body        := declarations | nested-rules（B1 保留嵌套，見 R6）
     * Rule R1: target 與 selector 皆必填，不可省略；`@state(button)`（缺 selector）與 `@state`（缺 target）皆為非法
     * Rule R2: 替換 selector 中所有匹配 target 者（不做魔法），在其尾部追加 .state；若包含 ::before/::after 等偽元素，狀態修飾符置於偽元素之前
     * Rule R3: 函數偽類參數（:is/:where/:has/:not 括號內）與屬性值內子字串永不匹配
     * Rule R4: 連字前綴（.button-label 中的 button）不算匹配
     * Rule R5: 逗號列表每分支獨立注入；不含 target 的分支原樣透傳
     * Rule R6: 保留嵌套 — 结构保留，狀態在內層並列
     * Rule R7: 嵌套內僅帶空格的 "& button" 後代形式正規化為 "button"；單獨的 "&" 不主動反解為外層標籤
     * Rule R8: selector 未字面包含 target 者屬無效用法（原樣透傳 + onWarn），典型如 button { @state(button) & {} }
     */
    const mapping: Array<[string, string | string[]]> = [
        // Single Target
        ['@state(button) button {}', ['button.small {}', 'button.medium {}', 'button.large {}']],
        ['@state(button) button .label {}', ['button.small .label {}', 'button.medium .label {}', 'button.large .label {}']],
        ['@state(button) button :is(.icon, .label) {}', [
            'button.small :is(.icon, .label) {}',
            'button.medium :is(.icon, .label) {}',
            'button.large :is(.icon, .label) {}',
        ]],
        ['@state(button) button:is(.icon, .label) {}', [
            'button.small:is(.icon, .label) {}',
            'button.medium:is(.icon, .label) {}',
            'button.large:is(.icon, .label) {}',
        ]],
        ['@state(button) button:has(.label) {}', [
            'button.small:has(.label) {}',
            'button.medium:has(.label) {}',
            'button.large:has(.label) {}',
        ]],
        ['@state(button) .container button:has(.label) {}', [
            '.container button.small:has(.label) {}',
            '.container button.medium:has(.label) {}',
            '.container button.large:has(.label) {}',
        ]],
        ['@state(button) .container button:has(.label) .label {}', [
            '.container button.small:has(.label) .label {}',
            '.container button.medium:has(.label) .label {}',
            '.container button.large:has(.label) .label {}',
        ]],
        ['@state(button) .container>button:has(.label)>.label {}', [
            '.container>button.small:has(.label)>.label {}',
            '.container>button.medium:has(.label)>.label {}',
            '.container>button.large:has(.label)>.label {}',
        ]],
        ['@state(button) .container[show]>button:has(.label)>.label {}', [
            '.container[show]>button.small:has(.label)>.label {}',
            '.container[show]>button.medium:has(.label)>.label {}',
            '.container[show]>button.large:has(.label)>.label {}',
        ]],
        ['@state(button) .container[show="true"]>button:has(.label)>.label {}', [
            '.container[show="true"]>button.small:has(.label)>.label {}',
            '.container[show="true"]>button.medium:has(.label)>.label {}',
            '.container[show="true"]>button.large:has(.label)>.label {}',
        ]],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg:disabled {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg:disabled {} }',
        ]],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg[disabled] {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled] {} }',
        ]],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg[disabled="true"] {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled="true"] {} }',
        ]],
        // Complex Target
        ['@state(button.show) button.show.ahaha.hummm {}', ['button.show.small.ahaha.hummm {}', 'button.show.medium.ahaha.hummm {}', 'button.show.large.ahaha.hummm {}']],
        ['@state(button.show) button.show.ahaha.hummm .label {}', ['button.show.small.ahaha.hummm .label {}', 'button.show.medium.ahaha.hummm .label {}', 'button.show.large.ahaha.hummm .label {}']],
        ['@state(button.show) button.show.ahaha.hummm button.label .show button {}', ['button.show.small.ahaha.hummm button.label .show button {}', 'button.show.medium.ahaha.hummm button.label .show button {}', 'button.show.large.ahaha.hummm button.label .show button {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm .label {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm .label {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm button.label .show button {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm button.label .show button {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm .label {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm .label {}']],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm button.label .show button {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm button.label .show button {}']],
        // ID / Universal / Type + ID compound
        ['@state(#submit) #submit {}', ['#submit.small {}', '#submit.medium {}', '#submit.large {}']],
        ['@state(#submit) #submit .label {}', ['#submit.small .label {}', '#submit.medium .label {}', '#submit.large .label {}']],
        ['@state(*) * {}', ['*.small {}', '*.medium {}', '*.large {}']],
        ['@state(*) * .label {}', ['*.small .label {}', '*.medium .label {}', '*.large .label {}']],
        ['@state(button) button#submit {}', ['button.small#submit {}', 'button.medium#submit {}', 'button.large#submit {}']],
        ['@state(button) button#submit.primary {}', ['button.small#submit.primary {}', 'button.medium#submit.primary {}', 'button.large#submit.primary {}']],
        ['@state(button#submit) button#submit.primary {}', ['button#submit.small.primary {}', 'button#submit.medium.primary {}', 'button#submit.large.primary {}']],
        ['@state(button) * button {}', ['* button.small {}', '* button.medium {}', '* button.large {}']],
        ['@state(button) .container .label button {}', ['.container .label button.small {}', '.container .label button.medium {}', '.container .label button.large {}']],
        // Attribute operators
        ['@state(button) button[type="submit"] {}', ['button.small[type="submit"] {}', 'button.medium[type="submit"] {}', 'button.large[type="submit"] {}']],
        ['@state(button) button[type=\'submit\'] {}', ['button.small[type=\'submit\'] {}', 'button.medium[type=\'submit\'] {}', 'button.large[type=\'submit\'] {}']],
        ['@state(button) button[title~="word"] {}', ['button.small[title~="word"] {}', 'button.medium[title~="word"] {}', 'button.large[title~="word"] {}']],
        ['@state(button) button[lang|="en"] {}', ['button.small[lang|="en"] {}', 'button.medium[lang|="en"] {}', 'button.large[lang|="en"] {}']],
        ['@state(button) button[href^="https"] {}', ['button.small[href^="https"] {}', 'button.medium[href^="https"] {}', 'button.large[href^="https"] {}']],
        ['@state(button) button[href$=".pdf"] {}', ['button.small[href$=".pdf"] {}', 'button.medium[href$=".pdf"] {}', 'button.large[href$=".pdf"] {}']],
        ['@state(button) button[class*="btn-"] {}', ['button.small[class*="btn-"] {}', 'button.medium[class*="btn-"] {}', 'button.large[class*="btn-"] {}']],
        ['@state(button) button[data-wow="yes" i] {}', ['button.small[data-wow="yes" i] {}', 'button.medium[data-wow="yes" i] {}', 'button.large[data-wow="yes" i] {}']],
        ['@state(button) button[data-label="button"] {}', ['button.small[data-label="button"] {}', 'button.medium[data-label="button"] {}', 'button.large[data-label="button"] {}']],
        // Pseudo-classes: user action + input
        ['@state(button) button:hover {}', ['button.small:hover {}', 'button.medium:hover {}', 'button.large:hover {}']],
        ['@state(button) button:focus-visible {}', ['button.small:focus-visible {}', 'button.medium:focus-visible {}', 'button.large:focus-visible {}']],
        ['@state(button) button:active {}', ['button.small:active {}', 'button.medium:active {}', 'button.large:active {}']],
        ['@state(button) button:disabled {}', ['button.small:disabled {}', 'button.medium:disabled {}', 'button.large:disabled {}']],
        ['@state(button) button:checked {}', ['button.small:checked {}', 'button.medium:checked {}', 'button.large:checked {}']],
        ['@state(button) button:hover:focus-visible {}', ['button.small:hover:focus-visible {}', 'button.medium:hover:focus-visible {}', 'button.large:hover:focus-visible {}']],
        ['@state(button) button:not(.disabled) {}', ['button.small:not(.disabled) {}', 'button.medium:not(.disabled) {}', 'button.large:not(.disabled) {}']],
        ['@state(button) button:not(.a):not([disabled]) {}', ['button.small:not(.a):not([disabled]) {}', 'button.medium:not(.a):not([disabled]) {}', 'button.large:not(.a):not([disabled]) {}']],
        ['@state(button) button:where(.icon, .label) {}', ['button.small:where(.icon, .label) {}', 'button.medium:where(.icon, .label) {}', 'button.large:where(.icon, .label) {}']],
        ['@state(button) button:is(:hover, :focus-visible) {}', ['button.small:is(:hover, :focus-visible) {}', 'button.medium:is(:hover, :focus-visible) {}', 'button.large:is(:hover, :focus-visible) {}']],
        // Pseudo-classes: structural
        ['@state(button) button:first-child {}', ['button.small:first-child {}', 'button.medium:first-child {}', 'button.large:first-child {}']],
        ['@state(button) button:last-child {}', ['button.small:last-child {}', 'button.medium:last-child {}', 'button.large:last-child {}']],
        ['@state(button) button:only-child {}', ['button.small:only-child {}', 'button.medium:only-child {}', 'button.large:only-child {}']],
        ['@state(button) button:nth-child(2n+1) {}', ['button.small:nth-child(2n+1) {}', 'button.medium:nth-child(2n+1) {}', 'button.large:nth-child(2n+1) {}']],
        ['@state(button) button:nth-of-type(odd) {}', ['button.small:nth-of-type(odd) {}', 'button.medium:nth-of-type(odd) {}', 'button.large:nth-of-type(odd) {}']],
        ['@state(button) button:empty {}', ['button.small:empty {}', 'button.medium:empty {}', 'button.large:empty {}']],
        // Pseudo-elements
        ['@state(button) button::before {}', ['button.small::before {}', 'button.medium::before {}', 'button.large::before {}']],
        ['@state(button) button::after {}', ['button.small::after {}', 'button.medium::after {}', 'button.large::after {}']],
        ['@state(button) button:hover::before {}', ['button.small:hover::before {}', 'button.medium:hover::before {}', 'button.large:hover::before {}']],
        ['@state(button) button::marker {}', ['button.small::marker {}', 'button.medium::marker {}', 'button.large::marker {}']],
        ['@state(button) button::selection {}', ['button.small::selection {}', 'button.medium::selection {}', 'button.large::selection {}']],
        ['@state(button) button::first-letter {}', ['button.small::first-letter {}', 'button.medium::first-letter {}', 'button.large::first-letter {}']],
        ['@state(button) button::first-line {}', ['button.small::first-line {}', 'button.medium::first-line {}', 'button.large::first-line {}']],
        ['@state(button) button::backdrop {}', ['button.small::backdrop {}', 'button.medium::backdrop {}', 'button.large::backdrop {}']],
        ['@state(button) button::part(label) {}', ['button.small::part(label) {}', 'button.medium::part(label) {}', 'button.large::part(label) {}']],
        // Combinators: ~, tight spacing, ||, comma lists
        ['@state(button) button ~ .label {}', ['button.small ~ .label {}', 'button.medium ~ .label {}', 'button.large ~ .label {}']],
        ['@state(button) button~.label {}', ['button.small~.label {}', 'button.medium~.label {}', 'button.large~.label {}']],
        ['@state(button) button+.label {}', ['button.small+.label {}', 'button.medium+.label {}', 'button.large+.label {}']],
        ['@state(button) .container~button:has(.label)~.label {}', ['.container~button.small:has(.label)~.label {}', '.container~button.medium:has(.label)~.label {}', '.container~button.large:has(.label)~.label {}']],
        ['@state(button) button ~ button {}', ['button.small ~ button.small {}', 'button.medium ~ button.medium {}', 'button.large ~ button.large {}']],
        ['@state(button) button + button {}', ['button.small + button.small {}', 'button.medium + button.medium {}', 'button.large + button.large {}']],
        ['@state(button+button) button+button {}', ['button+button.small {}', 'button+button.medium {}', 'button+button.large {}']],
        ['@state(button+ button) button+ button {}', ['button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}']],
        ['@state(button+button) button+ button {}', ['button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}']],
        ['@state(button +button) button+ button {}', ['button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}']],
        ['@state(button + button) button+ button {}', ['button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}']],
        ['@state(button + button) button + button {}', ['button + button.small {}', 'button + button.medium {}', 'button + button.large {}']],
        ['@state(button) button { &+button {} }', ['button.small { &+button {} }', 'button.medium { &+button {} }', 'button.large { &+button {} }']],
        ['@state(button) .col || button {}', ['.col || button.small {}', '.col || button.medium {}', '.col || button.large {}']],
        ['@state(button) button, button .label {}', ['button.small, button.small .label {}', 'button.medium, button.medium .label {}', 'button.large, button.large .label {}']],
        ['@state(button) button, .label {}', ['button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}']],
        // Shadow DOM: :host / ::slotted context
        ['@state(button) :host button {}', [':host button.small {}', ':host button.medium {}', ':host button.large {}']],
        ['@state(button) :host([dense]) button:has(.label) {}', [':host([dense]) button.small:has(.label) {}', ':host([dense]) button.medium:has(.label) {}', ':host([dense]) button.large:has(.label) {}']],
        ['@state(button) slot::slotted(button) {}', ['slot::slotted(button.small) {}', 'slot::slotted(button.medium) {}', 'slot::slotted(button.large) {}']],
        // Target forms: class / attribute / pseudo
        ['@state(.card) .card {}', ['.card.small {}', '.card.medium {}', '.card.large {}']],
        ['@state(.card) .card .label {}', ['.card.small .label {}', '.card.medium .label {}', '.card.large .label {}']],
        ['@state([selected]) button[selected] {}', ['button[selected].small {}', 'button[selected].medium {}', 'button[selected].large {}']],
        ['@state(button:hover) button:hover .label {}', ['button:hover.small .label {}', 'button:hover.medium .label {}', 'button:hover.large .label {}']],
        ['@state(button::before) button::before {}', ['button.small::before {}', 'button.medium::before {}', 'button.large::before {}']],
        ['@state(button::after) button::after {}', ['button.small::after {}', 'button.medium::after {}', 'button.large::after {}']],
        // Substring safety: functional args + hyphen prefix + attr value
        ['@state(button) button:has(button) {}', ['button.small:has(button) {}', 'button.medium:has(button) {}', 'button.large:has(button) {}']],
        ['@state(button) button:is(button, .label) {}', ['button.small:is(button, .label) {}', 'button.medium:is(button, .label) {}', 'button.large:is(button, .label) {}']],
        ['@state(button) button:where(button) {}', ['button.small:where(button) {}', 'button.medium:where(button) {}', 'button.large:where(button) {}']],
        ['@state(button) button:not(button) {}', ['button.small:not(button) {}', 'button.medium:not(button) {}', 'button.large:not(button) {}']],
        ['@state(button) .button-label button {}', ['.button-label button.small {}', '.button-label button.medium {}', '.button-label button.large {}']],
        ['@state(button) .container button[data-wow="button"]>.label {}', ['.container button.small[data-wow="button"]>.label {}', '.container button.medium[data-wow="button"]>.label {}', '.container button.large[data-wow="button"]>.label {}']],
        // Nested @anchor: B1 外殼保留、狀態在內層並列（R6）
        ['.wrapper { @state(button) button {} }', '.wrapper { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { @state(button) button .label {} }', '.wrapper { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['.wrapper { @state(button) button:has(.label) {} }', '.wrapper { button.small:has(.label) {} button.medium:has(.label) {} button.large:has(.label) {} }'],
        ['.wrapper { @state(button) button:hover::before {} }', '.wrapper { button.small:hover::before {} button.medium:hover::before {} button.large:hover::before {} }'],
        ['.wrapper[data-open] { @state(button) button {} }', '.wrapper[data-open] { button.small {} button.medium {} button.large {} }'],
        ['.wrapper > .inner { @state(button) button {} }', '.wrapper > .inner { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { .inner { @state(button) button {} } }', '.wrapper { .inner { button.small {} button.medium {} button.large {} } }'],
        ['.wrapper + .sibling { @state(button) button ~ .label {} }', '.wrapper + .sibling { button.small ~ .label {} button.medium ~ .label {} button.large ~ .label {} }'],
        ['.wrapper:not(.hidden) { @state(button) button:has(.label)>.label {} }', '.wrapper:not(.hidden) { button.small:has(.label)>.label {} button.medium:has(.label)>.label {} button.large:has(.label)>.label {} }'],
        [':host { @state(button) button {} }', ':host { button.small {} button.medium {} button.large {} }'],
        [':host([dense]) { @state(button) button:has(.label) {} }', ':host([dense]) { button.small:has(.label) {} button.medium:has(.label) {} button.large:has(.label) {} }'],
        ['button { @state(button) & {} }', 'button { & {} }'],
        ['.wrapper { @state(button) &.active button {} }', '.wrapper { &.active button.small {} &.active button.medium {} &.active button.large {} }'],
        // R7: & 先解為外層鏈再注入，嵌套內正規化為相對形式
        ['.wrapper { @state(button) & button {} }', '.wrapper { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { @state(button.show[selected]) button.show[selected].foo {} }', '.wrapper { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],
        ['.wrapper { @state(button) button {}; @state(.card) .card {} }', '.wrapper { button.small {} button.medium {} button.large {} .card.small {} .card.medium {} .card.large {} }'],
        // R5: 逗號分支獨立注入，B1 下同殼並列
        ['.wrapper { @state(button) button, button .label {} }', '.wrapper { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        // R5: 部分分支無 target 透傳
        ['.wrapper { @state(button) button, .label {} }', '.wrapper { button.small, .label {} button.medium, .label {} button.large, .label {} }'],
        // R2: 匹配多個全部替換（不做魔法）
        ['.wrapper { @state(button) button ~ button {} }', '.wrapper { button.small ~ button.small {} button.medium ~ button.medium {} button.large ~ button.large {} }'],
        ['.wrapper { @state(button) button~button {} }', '.wrapper { button.small~button.small {} button.medium~button.medium {} button.large~button.large {} }'],
        ['.wrapper { @state(button) button~ button {} }', '.wrapper { button.small~ button.small {} button.medium~ button.medium {} button.large~ button.large {} }'],
        ['.wrapper { @state(button) button ~button {} }', '.wrapper { button.small ~button.small {} button.medium ~button.medium {} button.large ~button.large {} }'],

    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe(':host', () => {
    const SizeSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
    })
    const SizeTriggers = mapStateTriggers({
        'enabled': '',
        'hovered': ':hover',
        'disabled': '[disabled]',
    })

    /**
     * :host 觸發語義（本 describe 專用，沿用 button 的 R1–R8）：
     *   enabled  := ''（base，原樣輸出）
     *   hovered  := ':hover'（host-target 掛 :host 上 → :host(:hover)；inner-target 掛自身 → button:hover）
     *   disabled := '[disabled]'（恆掛 :host，另起 :host([...]) 殼，見 H1）
     * H1 殼分裂：host 修飾另起頂層 :host([...]) 殼，不做 :host { :host(...) } 巢狀
     * H2 零 &：:host 子樹輸出禁止 &（Chrome 不解析 :host() 父層內的 &）
     * H3 修飾合併：appendToHostSelector 語義，一律括號內合併（:host(.a:hover)／:host([d][disabled])，Lit 要求偽類包在括號內）
     * H4 :is／:where 包裹 :host 視為 host-target，修飾按分支逐一合併（:where(:host([a][disabled]), …)）
     */
    const mapping: Array<[string, string | string[]]> = [
        // target = :host 基礎
        ['@state(:host) :host {}', [':host {}', ':host(:hover) {}', ':host([disabled]) {}']],
        ['@state(:host) :host .label {}', [':host .label {}', ':host(:hover) .label {}', ':host([disabled]) .label {}']],
        ['@state(:host) :host > .container {}', [':host > .container {}', ':host(:hover) > .container {}', ':host([disabled]) > .container {}']],
        ['@state(:host) :host .a .b {}', [':host .a .b {}', ':host(:hover) .a .b {}', ':host([disabled]) .a .b {}']],
        ['@state(:host) :host .a ~ .b {}', [':host .a ~ .b {}', ':host(:hover) .a ~ .b {}', ':host([disabled]) .a ~ .b {}']],
        // target = :host compound（class / attribute）
        ['@state(:host) :host(.active) {}', [':host(.active) {}', ':host(.active:hover) {}', ':host(.active[disabled]) {}']],
        ['@state(:host) :host([dense]) {}', [':host([dense]) {}', ':host([dense]:hover) {}', ':host([dense][disabled]) {}']],
        ['@state(:host) :host([variant="filled"]) {}', [':host([variant="filled"]) {}', ':host([variant="filled"]:hover) {}', ':host([variant="filled"][disabled]) {}']],
        ['@state(:host) :host(.a.b) {}', [':host(.a.b) {}', ':host(.a.b:hover) {}', ':host(.a.b[disabled]) {}']],
        ['@state(:host) :host([a][b="c"]) {}', [':host([a][b="c"]) {}', ':host([a][b="c"]:hover) {}', ':host([a][b="c"][disabled]) {}']],
        ['@state(:host) :host([v="x" i]) {}', [':host([v="x" i]) {}', ':host([v="x" i]:hover) {}', ':host([v="x" i][disabled]) {}']],
        ['@state(:host) :host(.active) .label {}', [':host(.active) .label {}', ':host(.active:hover) .label {}', ':host(.active[disabled]) .label {}']],
        ['@state(:host) :host([dense]) > .container {}', [':host([dense]) > .container {}', ':host([dense]:hover) > .container {}', ':host([dense][disabled]) > .container {}']],
        // target = :host functional（:not / :is / :where / :has）
        ['@state(:host) :host(:not(.a)) {}', [':host(:not(.a)) {}', ':host(:not(.a):hover) {}', ':host(:not(.a)[disabled]) {}']],
        ['@state(:host) :host(:not(.a):not([b])) {}', [':host(:not(.a):not([b])) {}', ':host(:not(.a):not([b]):hover) {}', ':host(:not(.a):not([b])[disabled]) {}']],
        ['@state(:host) :host(:is(.a,.b)) {}', [':host(:is(.a,.b)) {}', ':host(:is(.a,.b):hover) {}', ':host(:is(.a,.b)[disabled]) {}']],
        ['@state(:host) :host(:where(.a)) {}', [':host(:where(.a)) {}', ':host(:where(.a):hover) {}', ':host(:where(.a)[disabled]) {}']],
        ['@state(:host) :host(:has(.label)) {}', [':host(:has(.label)) {}', ':host(:has(.label):hover) {}', ':host(:has(.label)[disabled]) {}']],
        // target = :host structural pseudo（非觸發修飾，純結構）
        ['@state(:host) :host(:focus-visible) {}', [':host(:focus-visible) {}', ':host(:focus-visible:hover) {}', ':host(:focus-visible[disabled]) {}']],
        ['@state(:host) :host(:first-child) {}', [':host(:first-child) {}', ':host(:first-child:hover) {}', ':host(:first-child[disabled]) {}']],
        ['@state(:host) :host(:empty) {}', [':host(:empty) {}', ':host(:empty:hover) {}', ':host(:empty[disabled]) {}']],
        // R3：屬性值內子字串永不匹配
        ['@state(:host) :host[data-label=":host"] {}', [':host[data-label=":host"] {}', ':host[data-label=":host"]:hover {}', ':host[data-label=":host"][disabled] {}']],
        // R5：逗號分支獨立注入
        ['@state(:host) :host(.a), :host(.b) {}', [':host(.a), :host(.b) {}', ':host(.a:hover), :host(.b:hover) {}', ':host(.a[disabled]), :host(.b[disabled]) {}']],
        ['@state(:host) :host, .label {}', [':host, .label {}', ':host(:hover), .label {}', ':host([disabled]), .label {}']],
        // :is / :where 包裹 :host：視為 host-anchor，修飾按分支合併
        ['@state(:where(:host)) :where(:host) {}', [':where(:host) {}', ':where(:host(:hover)) {}', ':where(:host([disabled])) {}']],
        ['@state(:is(:host)) :is(:host) {}', [':is(:host) {}', ':is(:host(:hover)) {}', ':is(:host([disabled])) {}']],
        ['@state(:where(:host([a]), :host([b]))) :where(:host([a]), :host([b])) {}', [':where(:host([a]), :host([b])) {}', ':where(:host([a]:hover), :host([b]:hover)) {}', ':where(:host([a][disabled]), :host([b][disabled])) {}']],
        ['@state(:is(:host(.a), :host([b]))) :is(:host(.a), :host([b])) {}', [':is(:host(.a), :host([b])) {}', ':is(:host(.a:hover), :host([b]:hover)) {}', ':is(:host(.a[disabled]), :host([b][disabled])) {}']],
        ['@state(:where(:host)) :where(:host) .label {}', [':where(:host) .label {}', ':where(:host(:hover)) .label {}', ':where(:host([disabled])) .label {}']],
        ['@state(:where(:host([variant="x"]), :host(:has(.x)))) :where(:host([variant="x"]), :host(:has(.x))) {}', [':where(:host([variant="x"]), :host(:has(.x))) {}', ':where(:host([variant="x"]:hover), :host(:has(.x):hover)) {}', ':where(:host([variant="x"][disabled]), :host(:has(.x)[disabled])) {}']],
        // anchor 帶巢狀 body（B1：巢狀體隨殼展開）
        ['@state(:host) :host { .label {} }', [':host { .label {} }', ':host(:hover) { .label {} }', ':host([disabled]) { .label {} }']],
        ['@state(:host) :host(.active) { .label {} }', [':host(.active) { .label {} }', ':host(.active:hover) { .label {} }', ':host(.active[disabled]) { .label {} }']],
        // Nested：:host 作外層，B1 單字串（H1 殼分裂：disabled 另起殼）
        [':host { @state(button) button {} }', ':host { button {} button:hover {} } :host([disabled]) { button {} }'],
        [':host([dense]) { @state(button) button .label {} }', ':host([dense]) { button .label {} button:hover .label {} } :host([dense][disabled]) { button .label {} }'],
        [':host(:not(.a)) { @state(button) button {} }', ':host(:not(.a)) { button {} button:hover {} } :host(:not(.a)[disabled]) { button {} }'],
        [':host { .wrapper { @state(button) button {} } }', ':host { .wrapper { button {} button:hover {} } } :host([disabled]) { .wrapper { button {} } }'],
        [':host { @state(button) button, button .label {} }', ':host { button, button .label {} button:hover, button:hover .label {} } :host([disabled]) { button, button .label {} }'],
        [':host { @state(button) button {}; @state(.card) .card {} }', ':host { button {} button:hover {} .card {} .card:hover {} } :host([disabled]) { button {} .card {} }'],
        [':where(:host) { @state(button) button {} }', ':where(:host) { button {} button:hover {} } :where(:host([disabled])) { button {} }'],

    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('combo', () => {
    const ComboSchema = defineSchema([['medium', 'large'], ['enabled', 'disabled']] as const)
    const ComboDef = createStyleDefinition(ComboSchema)({
        'size': { 'medium': '12px', 'large': '16px' },
        'opacity': { 'enabled': '1', 'disabled': '0.38' },
    })
    const ComboTriggers = mapStateTriggers({
        'medium': '.medium',
        'large': '.large',
        'enabled': '',
        'disabled': '[disabled]',
    })

    /**
     * Combo 狀態組合（本 describe 專用，沿用 button 的 R1–R8）：
     *   dimensions := [['medium', 'large'], ['enabled', 'disabled']]（笛卡爾積 4 組合）
     *   medium／large := '.medium'／'.large'（掛錨點後）
     *   enabled      := ''（base，原樣）
     *   disabled     := { name: 'disabled', modifier: '[disabled]' }（裸記錄，不用 host/self 包裝；掛載點由 @state(target) 決定）
     * 掛載原則：狀態一律掛載在 @state(target) 的 target 上，不跳到 :host
     * 修飾順序：target ＋ 組合內修飾（維度順）＋ 餘部（如 :has／::before）
     * 展開順序＝笛卡爾積：[medium,enabled] → [medium,disabled] → [large,enabled] → [large,disabled]
     * Nested B1：4 組合同殼並列，無殼分裂
     */
    const mapping: Array<[string, string | string[]]> = [
        // 基礎矩陣（笛卡爾積 4 展開，狀態掛錨點）
        ['@state(button) button {}', ['button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}']],
        ['@state(button) button .label {}', ['button.medium .label {}', 'button.medium[disabled] .label {}', 'button.large .label {}', 'button.large[disabled] .label {}']],
        ['@state(button) button:has(.label) {}', ['button.medium:has(.label) {}', 'button.medium[disabled]:has(.label) {}', 'button.large:has(.label) {}', 'button.large[disabled]:has(.label) {}']],
        ['@state(button) .container>button:has(.label)>.label {}', ['.container>button.medium:has(.label)>.label {}', '.container>button.medium[disabled]:has(.label)>.label {}', '.container>button.large:has(.label)>.label {}', '.container>button.large[disabled]:has(.label)>.label {}']],
        // 複合 target：狀態插在 target 後、餘部前
        ['@state(button.show) button.show.foo {}', ['button.show.medium.foo {}', 'button.show.medium[disabled].foo {}', 'button.show.large.foo {}', 'button.show.large[disabled].foo {}']],
        ['@state(button.show[selected]) button.show[selected].foo {}', ['button.show[selected].medium.foo {}', 'button.show[selected].medium[disabled].foo {}', 'button.show[selected].large.foo {}', 'button.show[selected].large[disabled].foo {}']],
        // 函數偽類（非觸發修飾，原樣保留於餘部）
        ['@state(button) button:is(.icon,.label) {}', ['button.medium:is(.icon,.label) {}', 'button.medium[disabled]:is(.icon,.label) {}', 'button.large:is(.icon,.label) {}', 'button.large[disabled]:is(.icon,.label) {}']],
        // :host 前綴為結構上下文，原樣保留；狀態仍掛 button
        ['@state(button) :host button {}', [':host button.medium {}', ':host button.medium[disabled] {}', ':host button.large {}', ':host button.large[disabled] {}']],
        // target = :host × 組合（掛載點即 :host，類修飾入括號）
        ['@state(:host) :host {}', [':host(.medium) {}', ':host(.medium[disabled]) {}', ':host(.large) {}', ':host(.large[disabled]) {}']],
        ['@state(:host) :host .label {}', [':host(.medium) .label {}', ':host(.medium[disabled]) .label {}', ':host(.large) .label {}', ':host(.large[disabled]) .label {}']],
        // 屬性運算子／偽元素／ID／通配
        ['@state(button) button[type="submit"] {}', ['button.medium[type="submit"] {}', 'button.medium[disabled][type="submit"] {}', 'button.large[type="submit"] {}', 'button.large[disabled][type="submit"] {}']],
        ['@state(button) button[class*="btn-"] {}', ['button.medium[class*="btn-"] {}', 'button.medium[disabled][class*="btn-"] {}', 'button.large[class*="btn-"] {}', 'button.large[disabled][class*="btn-"] {}']],
        ['@state(button) button::before {}', ['button.medium::before {}', 'button.medium[disabled]::before {}', 'button.large::before {}', 'button.large[disabled]::before {}']],
        ['@state(#submit) #submit {}', ['#submit.medium {}', '#submit.medium[disabled] {}', '#submit.large {}', '#submit.large[disabled] {}']],
        ['@state(*) * {}', ['*.medium {}', '*.medium[disabled] {}', '*.large {}', '*.large[disabled] {}']],
        // R5：逗號分支獨立注入
        ['@state(button) button, button .label {}', ['button.medium, button.medium .label {}', 'button.medium[disabled], button.medium[disabled] .label {}', 'button.large, button.large .label {}', 'button.large[disabled], button.large[disabled] .label {}']],
        ['@state(button) button, .label {}', ['button.medium, .label {}', 'button.medium[disabled], .label {}', 'button.large, .label {}', 'button.large[disabled], .label {}']],
        // R3：函數參數／屬性值內子字串永不匹配
        ['@state(button) button:has(button) {}', ['button.medium:has(button) {}', 'button.medium[disabled]:has(button) {}', 'button.large:has(button) {}', 'button.large[disabled]:has(button) {}']],
        ['@state(button) .container button[data-x="button"] {}', ['.container button.medium[data-x="button"] {}', '.container button.medium[disabled][data-x="button"] {}', '.container button.large[data-x="button"] {}', '.container button.large[disabled][data-x="button"] {}']],
        // anchor 帶巢狀 body（B1：巢狀體隨組合展開）
        ['@state(button) button { .label {} }', ['button.medium { .label {} }', 'button.medium[disabled] { .label {} }', 'button.large { .label {} }', 'button.large[disabled] { .label {} }']],
        // Nested B1：4 組合同殼並列（單字串，無殼分裂）
        ['.wrapper { @state(button) button {} }', '.wrapper { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],
        ['.wrapper { @state(button) button .label {} }', '.wrapper { button.medium .label {} button.medium[disabled] .label {} button.large .label {} button.large[disabled] .label {} }'],
        [':host { @state(button) button {} }', ':host { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],

    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(ComboDef, input, { registry: ComboTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('variant', () => {
    const VariantSchema = defineSchema(['enabled'] as const)
    const FilledDef = createStyleDefinition(VariantSchema)({
        'color': '#6750a4',
    })
    const TonalDef = createStyleDefinition(VariantSchema)({
        'color': '#e8def8',
    })
    const OutlinedDef = createStyleDefinition(VariantSchema)({
        'color': '#ffffff',
    })
    const VariantDefs = { 'filled': FilledDef, 'tonal': TonalDef, 'outlined': OutlinedDef } as const
    const StateTriggers = mapStateTriggers({
        'enabled': '',
    })

    /**
     * Variant 名單格式（本 describe 專用，沿用 button 的 R1–R8）：
     *   variant-rule := "@variant" "(" name ("," name)* ","? ")" "{" body "}"
     *   name         := 變體字典中的確切 key（大小寫敏感，不可省略，不可為空）
     *   不支援通配符與否定：`*`、`!name` 屬無效用法（warn），不收錄於 mapping，另行斷言
     * V1 單名 → 單殼（:host([variant="filled"]) { … }）
     * V2 多名 → 逗號並殼（:host([variant="a"]), :host([variant="b"]) { … }，單規則單字串）
     * V3 B1 保留嵌套：body 原樣嵌於殼內；@state 可內嵌，注入照 R2 在內層執行
     * 本 describe 用單態 schema（enabled），聚焦名單格式；狀態×變體交織留待實現期按 Red 補
     */
    const mapping: Array<[string, string | string[]]> = [
        // V1：單名單殼
        ['@variant(filled) { button {} }', ':host([variant="filled"]) { button {} }'],
        ['@variant(tonal) { button .label {} }', ':host([variant="tonal"]) { button .label {} }'],
        ['@variant(outlined) { button:has(.label) {} }', ':host([variant="outlined"]) { button:has(.label) {} }'],
        // V2：多名逗號並殼
        ['@variant(filled, tonal) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],
        ['@variant(filled, tonal, outlined) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]), :host([variant="outlined"]) { button {} }'],
        ['@variant(tonal, outlined) { button .label {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button .label {} }'],
        ['@variant(filled, outlined) { button[type="submit"] {} }', ':host([variant="filled"]), :host([variant="outlined"]) { button[type="submit"] {} }'],
        ['@variant(outlined) { button::before {} }', ':host([variant="outlined"]) { button::before {} }'],
        // 名單格式寬容（空白／尾逗號）
        ['@variant(  filled ,  tonal  ) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],
        ['@variant(filled, tonal,) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],

    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(VariantDefs, input, { registry: StateTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('when', () => {
    /**
     * When 語法語義（宿主條件就近書寫、頂層外殼提升）：
     *   when-rule  := "@when" "(" condition ("," condition)* ","? ")" "{" body "}"
     *   condition  := host-selector（必須顯式包含 :host，如 :host([checked])、:where(:host)）
     *   不支援非 host 選擇器：`@when(.dense)` 等純內部選擇器屬無效用法（warn），請使用原生 CSS 巢狀 `&.dense`
     * W1 顯式宿主：條件必須顯式宣告 :host，未包含者發出 warn 或原樣透傳
     * W2 頂層外殼提升（Shell Hoisting）：無論巢狀於多深層的選擇器中，均將 :host 條件提升為最近隔離容器（@layer, @media, @supports, @scope）內部獨立的頂層外殼，內部保留完整上下文路徑
     * W3 零 & 原則（H2）：提升後的頂層 :host 外殼子樹內禁止輸出 &
     * W4 逗號多條件並列：多條件展開為並列頂層外殼（如 :host([a]), :host([b]) { … }）
     */
    const mapping: Array<[string, string | string[]]> = [
        // 基礎頂層 @when
        ['@when(:host([checked])) { button {} }', ':host([checked]) { button {} }'],
        ['@when(:host([dense])) { button .label {} }', ':host([dense]) { button .label {} }'],
        ['@when(:host(:not([disabled]))) { button:has(.label) {} }', ':host(:not([disabled])) { button:has(.label) {} }'],
        ['@when(:host(.active)) { .container button {} }', ':host(.active) { .container button {} }'],
        ['@when(:where(:host)) { button {} }', ':where(:host) { button {} }'],
        ['@when(:is(:host([a]), :host([b]))) { button {} }', ':is(:host([a]), :host([b])) { button {} }'],
        // W4：逗號多條件並列
        ['@when(:host([checked]), :host([active])) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(  :host([checked]) ,  :host([active])  ) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host([checked]), :host([active]),) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        // W2：深層巢狀外殼提升（Shell Hoisting）
        ['.container { button { @when(:host([checked])) { color: red; } } }', '.container { button {} } :host([checked]) { .container { button { color: red; } } }'],
        ['.wrapper { @when(:host([checked])) { button {} } }', '.wrapper {} :host([checked]) { .wrapper { button {} } }'],
        ['.card > .title { @when(:host([dense])) { font-size: 12px; } }', '.card > .title {} :host([dense]) { .card > .title { font-size: 12px; } }'],
        [':host { .wrapper { @when(:host([checked])) { button {} } } }', ':host { .wrapper {} } :host([checked]) { .wrapper { button {} } }'],
        [
            '.container { button { color: blue; @when(:host([checked])) { color: red; } } }',
            '.container { button { color: blue; } } :host([checked]) { .container { button { color: red; } } }'
        ],
        [
            '@layer components { .card { @when(:host([dense])) { padding: 4px; } } }',
            '@layer components { .card {} :host([dense]) { .card { padding: 4px; } } }'
        ],
    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('property-expanders', () => {
    /**
     * 屬性級展開巨集（Property Expanders）：
     *   P1 shape: 展開為四角（start-start, start-end, end-end, end-start）
     *   P2 padding: / margin: 展開為四方向邏輯邊距（inline-start, inline-end, block-start, block-end）
     *   P3 typescale: 展開為字體 5 要素（font-family, font-size, line-height, font-weight, letter-spacing；無 opacity，line-height 對應 leading，letter-spacing 對應 tracking）
     *   規則：若給定單一變數前綴（如 var(--_shape)），自動拼接後綴欄位；若給定靜態純值或簡寫值，則解構轉譯為 4 邏輯值
     */
    const mapping: Array<[string, string | string[]]> = [
        // P1: shape 變數前綴展開
        [
            'button { shape: var(--_shape); }',
            'button { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
        ],
        [
            'button { shape: var(--_container-shape); }',
            'button { border-start-start-radius: var(--_container-shape-start-start); border-start-end-radius: var(--_container-shape-start-end); border-end-end-radius: var(--_container-shape-end-end); border-end-start-radius: var(--_container-shape-end-start); }',
        ],
        // P1: shape 靜態純值均勻展開為 4 邏輯角
        [
            'button { shape: 8px; }',
            'button { border-start-start-radius: 8px; border-start-end-radius: 8px; border-end-end-radius: 8px; border-end-start-radius: 8px; }',
        ],
        [
            'button { shape: 8px 16px; }',
            'button { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; }',
        ],
        [
            'button { shape: 4px 8px 12px 16px; }',
            'button { border-start-start-radius: 4px; border-start-end-radius: 8px; border-end-end-radius: 12px; border-end-start-radius: 16px; }'
        ],
        // P2: padding 變數前綴展開
        [
            'button { padding: var(--_padding); }',
            'button { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
        ],
        // P2: padding 靜態簡寫解構為 4 邏輯邊距
        [
            'button { padding: 8px 16px; }',
            'button { padding-inline-start: 16px; padding-inline-end: 16px; padding-block-start: 8px; padding-block-end: 8px; }',
        ],
        // P2: margin 變數前綴展開
        [
            'button { margin: var(--_margin); }',
            'button { margin-inline-start: var(--_margin-inline-start); margin-inline-end: var(--_margin-inline-end); margin-block-start: var(--_margin-block-start); margin-block-end: var(--_margin-block-end); }',
        ],
        // P2: margin 靜態簡寫解構為 4 邏輯邊距
        [
            'button { margin: 4px 8px; }',
            'button { margin-inline-start: 8px; margin-inline-end: 8px; margin-block-start: 4px; margin-block-end: 4px; }',
        ],
        // P3: typescale 5 要素展開（無 opacity，line-height -> leading，letter-spacing -> tracking）
        [
            'button { typescale: var(--_label-text); }',
            'button { font-family: var(--_label-text-font); font-size: var(--_label-text-size); line-height: var(--_label-text-leading); font-weight: var(--_label-text-weight); letter-spacing: var(--_label-text-tracking); }',
        ],

    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('custom-state', () => {
    const StateSchema = defineSchema(['enabled', 'checked', 'disabled'] as const)
    const StateDef = createStyleDefinition(StateSchema)({
        'opacity': [1, 1, 0.38],
    })
    const StateTriggers = mapStateTriggers({
        'enabled': '',
        'checked': ':state(checked)',
        'disabled': ':state(disabled)',
    })

    /**
     * Custom State API (:state(...)) 觸發語義：
     *   S1 元素目標：掛載於目標元素後方（button:state(checked)）
     *   S2 宿主目標：掛載於 :host 時自動括號內合併（:host(:state(checked))，符合 H3）
     *   S3 與 @when 協同：支援 @when(:host(:state(...)))，深層就近宣告時提升為頂層獨立外殼
     */
    const mapping: Array<[string, string | string[]]> = [
        // S1: 元素目標掛載
        ['@state(button) button {}', ['button {}', 'button:state(checked) {}', 'button:state(disabled) {}']],
        ['@state(button) button .label {}', ['button .label {}', 'button:state(checked) .label {}', 'button:state(disabled) .label {}']],
        // S2: 宿主目標掛載（H3 括號內合入）
        ['@state(:host) :host {}', [':host {}', ':host(:state(checked)) {}', ':host(:state(disabled)) {}']],
        ['@state(:host) :host([dense]) {}', [':host([dense]) {}', ':host([dense]:state(checked)) {}', ':host([dense]:state(disabled)) {}']],
        // S3: 與 @when 協同（頂層提升）
        ['@when(:host(:state(checked))) { button {} }', ':host(:state(checked)) { button {} }'],
        ['.container { button { @when(:host(:state(checked))) { color: red; } } }', '.container { button {} } :host(:state(checked)) { .container { button { color: red; } } }'],
    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(StateDef, input, { registry: StateTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('a11y', () => {
    /**
     * 無障礙與使用者偏好巨集（A11y Presets）：
     *   A1 @reduced-motion: 展開為 @media (prefers-reduced-motion: reduce)
     *   A2 @forced-colors: 展開為 @media (forced-colors: active)
     *   A3 @contrast(more|less): 展開為 @media (prefers-contrast: more|less)
     *   A4 @reduced-transparency: 展開為 @media (prefers-reduced-transparency: reduce)
     *   所有規則均保持 CSS 原生巢狀（CSS Nesting Baseline 2026）
     */
    const mapping: Array<[string, string | string[]]> = [
        // A1: 減少動態
        ['@reduced-motion { button { transition: none; } }', '@media (prefers-reduced-motion: reduce) { button { transition: none; } }'],
        ['button { @reduced-motion { transition: none; } }', 'button { @media (prefers-reduced-motion: reduce) { transition: none; } }'],
        // A2: 強制色彩（高對比模式）
        ['@forced-colors { button { outline: 1px solid CanvasText; } }', '@media (forced-colors: active) { button { outline: 1px solid CanvasText; } }'],
        ['button { @forced-colors { outline: 1px solid CanvasText; } }', 'button { @media (forced-colors: active) { outline: 1px solid CanvasText; } }'],
        // A3: 對比度偏好
        ['button { @contrast(more) { outline: 2px solid black; } }', 'button { @media (prefers-contrast: more) { outline: 2px solid black; } }'],
        ['button { @contrast(less) { border: none; } }', 'button { @media (prefers-contrast: less) { border: none; } }'],
        // A4: 降低透明度
        ['.surface { @reduced-transparency { backdrop-filter: none; background: #ffffff; } }', '.surface { @media (prefers-reduced-transparency: reduce) { backdrop-filter: none; background: #ffffff; } }'],
    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})

describe('Intergration', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
    })
    const SizeTriggers = mapStateTriggers({
        'small': '.small',
        'medium': '.medium',
        'large': '.large',
    })
    const VariantSchema = defineSchema(['enabled'] as const)
    const FilledDef = createStyleDefinition(VariantSchema)({
        'color': '#6750a4',
    })
    const TonalDef = createStyleDefinition(VariantSchema)({
        'color': '#e8def8',
    })
    const OutlinedDef = createStyleDefinition(VariantSchema)({
        'color': '#ffffff',
    })
    const VariantDefs = { 'filled': FilledDef, 'tonal': TonalDef, 'outlined': OutlinedDef } as const

    /**
     * 跨 At-Rule 整合規格（Intergration）：
     *   涵蓋多個 at-rule（@variant, @state, @when, @reduced-motion, @forced-colors 等）
     *   在同一樣式表中巢狀、並列或交織出現時的協同編譯行為。
     *
     * I1: @variant + @state
     *   - 變體外殼包裹狀態目標，狀態按 R2 在內層展開；多態時笛卡爾展開
     * I2: @variant + @when
     *   - 變體外殼結合宿主條件提升，依 H3/W4 在括號內合併屬性（:host([variant="..."][...])）
     * I3: @when + @state
     *   - 雙向協同：外層 @when 包裹 @state，或 @state 內就近定義 @when 提升至頂層，狀態展開均保持一致
     * I4: @variant + @state + @when (三者交織)
     *   - 頂層外殼合併變體與 when 條件，內層元素精確注入 state 狀態
     * I5: @state + A11y 巨集 (@reduced-motion / @forced-colors)
     *   - 媒體查詢巨集保持原生 CSS 巢狀，並隨 state 狀態維度共同展開
     * I6: @variant + A11y 巨集
     *   - 變體外殼包裹媒體查詢巨集
     * I7: @state + Property Expanders (shape / padding)
     *   - 狀態展開與屬性巨集展開正交協同
     */
    const mapping: Array<[string, string | string[]]> = [
        // I1: @variant + @state
        ['@variant(filled) { @state(button) button {} }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} }'],
        ['@variant(tonal, outlined) { @state(button) button .label {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@variant(filled) { @state(button) button, button .label {} }', ':host([variant="filled"]) { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        ['@variant(tonal, outlined) { @state(button.show[selected]) button.show[selected].foo {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],

        // I2: @variant + @when
        ['@variant(filled) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"][checked]) { button {} }'],
        ['@variant(filled) { .container { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { .container {} } :host([variant="filled"][checked]) { .container { button {} } }'],
        ['@variant(filled, tonal) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]), :host([variant="tonal"]) {} :host([variant="filled"][checked]), :host([variant="tonal"][checked]) { button {} }'],
        ['@variant(filled) { @when(:host(:state(checked))) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]:state(checked)) { button {} }'],

        // I3: @when + @state
        ['@when(:host([checked])) { @state(button) button {} }', ':host([checked]) { button.small {} button.medium {} button.large {} }'],
        ['@when(:host([checked])) { @state(button) button .label {} }', ':host([checked]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.small {} button.medium {} button.large {} :host([dense]) { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } }'],
        ['.wrapper { @state(button) button { @when(:host([dense])) { height: 32px; } } }', '.wrapper { button.small {} button.medium {} button.large {} } :host([dense]) { .wrapper { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } } }'],

        // I4: @variant + @state + @when (三者交織)
        ['@variant(filled) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'],
        ['@variant(filled, tonal) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"][checked]), :host([variant="tonal"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'],

        // I5: @state + A11y 巨集
        [
            '@state(button) button { @reduced-motion { transition: none; } }',
            [
                'button.small { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.medium { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.large { @media (prefers-reduced-motion: reduce) { transition: none; } }',
            ],
        ],
        [
            '@state(button) button { @forced-colors { outline: 1px solid CanvasText; } }',
            [
                'button.small { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
                'button.medium { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
                'button.large { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
            ],
        ],

        // I6: @variant + A11y 巨集
        ['@variant(filled) { @reduced-motion { button { transition: none; } } }', ':host([variant="filled"]) { @media (prefers-reduced-motion: reduce) { button { transition: none; } } }'],
        ['@variant(filled, tonal) { @forced-colors { button { outline: 1px solid CanvasText; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { @media (forced-colors: active) { button { outline: 1px solid CanvasText; } } }'],

        // I7: @state + Property Expanders (shape / padding)
        [
            '@state(button) button { shape: var(--_shape); }',
            [
                'button.small { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.medium { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.large { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
            ],
        ],
        [
            '@state(button) button { padding: var(--_padding); }',
            [
                'button.small { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
                'button.medium { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
                'button.large { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
            ],
        ],
    ]

    for (const [input, expected] of mapping) {
        it(input, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    }
})
