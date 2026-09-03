/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 */

import { describe } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { defineSchema } from './define-schema'
import { mapStateTriggers } from './map-state-triggers'

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
     * Anchor 語法（新範式，舊 `@anchor <sel>` 已棄用）：
     *   anchor-rule := "@anchor" "(" target ")" selector "{" body "}"
     *   target      := compound-selector（單一複合選擇器，不可含 combinator、逗號、&，不可省略）
     *     e.g. button | button.show[selected][data-wow="yes"] | #submit | .card | [selected] | * | button:hover | button::before
     *   selector    := complex-selector（完整複雜選擇器，必填，不可省略；須以獨立 compound 形式包含 target）
     *     e.g. button.show.ahaha.hummm | .container button:has(.label)>.label | button, button .label
     *   body        := declarations | nested-rules（B1 保留嵌套，見 R6）
     * Rule R1: target 與 selector 皆必填，不可省略；`@anchor(button)`（缺 selector）與 `@anchor`（缺 target）皆為非法
     * Rule R2: 只替換 selector 中第一個獨立 compound 匹配 target 者，在其尾部追加 .state
     * Rule R3: 函數偽類參數（:is/:where/:has/:not 括號內）與屬性值內子字串永不匹配
     * Rule R4: 連字前綴（.button-label 中的 button）不算匹配
     * Rule R5: 逗號列表每分支獨立注入；不含 target 的分支原樣透傳
     * Rule R6: B1 保留嵌套 — 外殼保留，狀態在內層並列；嵌套期望為單一字串
     * Rule R7: & 先解為外層鏈再注入；"& button" 嵌套內正規化為 "button"
     * Rule R8: selector 不含 target 屬無效用法（原樣透傳 + onWarn），不收錄於 mapping，另行斷言
     */
    const mapping: Array<[string, string | string[]]> = [
        // Single Target
        ['@anchor(button) button {}', ['button.small {}', 'button.medium {}', 'button.large {}']],
        ['@anchor(button) button .label {}', ['button.small .label {}', 'button.medium .label {}', 'button.large .label {}']],
        ['@anchor(button) button :is(.icon, .label) {}', [
            'button.small :is(.icon, .label) {}',
            'button.medium :is(.icon, .label) {}',
            'button.large :is(.icon, .label) {}',
        ]],
        ['@anchor(button) button:is(.icon, .label) {}', [
            'button.small:is(.icon, .label) {}',
            'button.medium:is(.icon, .label) {}',
            'button.large:is(.icon, .label) {}',
        ]],
        ['@anchor(button) button:has(.label) {}', [
            'button.small:has(.label) {}',
            'button.medium:has(.label) {}',
            'button.large:has(.label) {}',
        ]],
        ['@anchor(button) .container button:has(.label) {}', [
            '.container button.small:has(.label) {}',
            '.container button.medium:has(.label) {}',
            '.container button.large:has(.label) {}',
        ]],
        ['@anchor(button) .container button:has(.label) .label {}', [
            '.container button.small:has(.label) .label {}',
            '.container button.medium:has(.label) .label {}',
            '.container button.large:has(.label) .label {}',
        ]],
        ['@anchor(button) .container>button:has(.label)>.label {}', [
            '.container>button.small:has(.label)>.label {}',
            '.container>button.medium:has(.label)>.label {}',
            '.container>button.large:has(.label)>.label {}',
        ]],
        ['@anchor(button) .container[show]>button:has(.label)>.label {}', [
            '.container[show]>button.small:has(.label)>.label {}',
            '.container[show]>button.medium:has(.label)>.label {}',
            '.container[show]>button.large:has(.label)>.label {}',
        ]],
        ['@anchor(button) .container[show="true"]>button:has(.label)>.label {}', [
            '.container[show="true"]>button.small:has(.label)>.label {}',
            '.container[show="true"]>button.medium:has(.label)>.label {}',
            '.container[show="true"]>button.large:has(.label)>.label {}',
        ]],
        ['@anchor(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg:disabled {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg:disabled {} }',
        ]],
        ['@anchor(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg[disabled] {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled] {} }',
        ]],
        ['@anchor(button) .container[show="true"]+.wrapper>button:has(.label)>.label { .text-bg[disabled="true"] {} }', [
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled="true"] {} }',
        ]],
        // Complex Target
        ['@anchor(button.show) button.show.ahaha.hummm {}', ['button.show.small.ahaha.hummm {}', 'button.show.medium.ahaha.hummm {}', 'button.show.large.ahaha.hummm {}']],
        ['@anchor(button.show) button.show.ahaha.hummm .label {}', ['button.show.small.ahaha.hummm .label {}', 'button.show.medium.ahaha.hummm .label {}', 'button.show.large.ahaha.hummm .label {}']],
        ['@anchor(button.show) button.show.ahaha.hummm button.label .show button {}', ['button.show.small.ahaha.hummm button.label .show button {}', 'button.show.medium.ahaha.hummm button.label .show button {}', 'button.show.large.ahaha.hummm button.label .show button {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm .label {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm .label {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm button.label .show button {}', ['button.show[selected][data-wow="yes"].small.ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].medium.ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].large.ahaha.hummm button.label .show button {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm .label {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm .label {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm .label {}']],
        ['@anchor(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm button.label .show button {}', ['button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm button.label .show button {}', 'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm button.label .show button {}']],
        // ID / Universal / Type + ID compound
        ['@anchor(#submit) #submit {}', ['#submit.small {}', '#submit.medium {}', '#submit.large {}']],
        ['@anchor(#submit) #submit .label {}', ['#submit.small .label {}', '#submit.medium .label {}', '#submit.large .label {}']],
        ['@anchor(*) * {}', ['*.small {}', '*.medium {}', '*.large {}']],
        ['@anchor(*) * .label {}', ['*.small .label {}', '*.medium .label {}', '*.large .label {}']],
        ['@anchor(button) button#submit {}', ['button.small#submit {}', 'button.medium#submit {}', 'button.large#submit {}']],
        ['@anchor(button) button#submit.primary {}', ['button.small#submit.primary {}', 'button.medium#submit.primary {}', 'button.large#submit.primary {}']],
        ['@anchor(button#submit) button#submit.primary {}', ['button#submit.small.primary {}', 'button#submit.medium.primary {}', 'button#submit.large.primary {}']],
        ['@anchor(button) * button {}', ['* button.small {}', '* button.medium {}', '* button.large {}']],
        ['@anchor(button) .container .label button {}', ['.container .label button.small {}', '.container .label button.medium {}', '.container .label button.large {}']],
        // Attribute operators
        ['@anchor(button) button[type="submit"] {}', ['button.small[type="submit"] {}', 'button.medium[type="submit"] {}', 'button.large[type="submit"] {}']],
        ['@anchor(button) button[type=\'submit\'] {}', ['button.small[type=\'submit\'] {}', 'button.medium[type=\'submit\'] {}', 'button.large[type=\'submit\'] {}']],
        ['@anchor(button) button[title~="word"] {}', ['button.small[title~="word"] {}', 'button.medium[title~="word"] {}', 'button.large[title~="word"] {}']],
        ['@anchor(button) button[lang|="en"] {}', ['button.small[lang|="en"] {}', 'button.medium[lang|="en"] {}', 'button.large[lang|="en"] {}']],
        ['@anchor(button) button[href^="https"] {}', ['button.small[href^="https"] {}', 'button.medium[href^="https"] {}', 'button.large[href^="https"] {}']],
        ['@anchor(button) button[href$=".pdf"] {}', ['button.small[href$=".pdf"] {}', 'button.medium[href$=".pdf"] {}', 'button.large[href$=".pdf"] {}']],
        ['@anchor(button) button[class*="btn-"] {}', ['button.small[class*="btn-"] {}', 'button.medium[class*="btn-"] {}', 'button.large[class*="btn-"] {}']],
        ['@anchor(button) button[data-wow="yes" i] {}', ['button.small[data-wow="yes" i] {}', 'button.medium[data-wow="yes" i] {}', 'button.large[data-wow="yes" i] {}']],
        ['@anchor(button) button[data-label="button"] {}', ['button.small[data-label="button"] {}', 'button.medium[data-label="button"] {}', 'button.large[data-label="button"] {}']],
        // Pseudo-classes: user action + input
        ['@anchor(button) button:hover {}', ['button.small:hover {}', 'button.medium:hover {}', 'button.large:hover {}']],
        ['@anchor(button) button:focus-visible {}', ['button.small:focus-visible {}', 'button.medium:focus-visible {}', 'button.large:focus-visible {}']],
        ['@anchor(button) button:active {}', ['button.small:active {}', 'button.medium:active {}', 'button.large:active {}']],
        ['@anchor(button) button:disabled {}', ['button.small:disabled {}', 'button.medium:disabled {}', 'button.large:disabled {}']],
        ['@anchor(button) button:checked {}', ['button.small:checked {}', 'button.medium:checked {}', 'button.large:checked {}']],
        ['@anchor(button) button:hover:focus-visible {}', ['button.small:hover:focus-visible {}', 'button.medium:hover:focus-visible {}', 'button.large:hover:focus-visible {}']],
        ['@anchor(button) button:not(.disabled) {}', ['button.small:not(.disabled) {}', 'button.medium:not(.disabled) {}', 'button.large:not(.disabled) {}']],
        ['@anchor(button) button:not(.a):not([disabled]) {}', ['button.small:not(.a):not([disabled]) {}', 'button.medium:not(.a):not([disabled]) {}', 'button.large:not(.a):not([disabled]) {}']],
        ['@anchor(button) button:where(.icon, .label) {}', ['button.small:where(.icon, .label) {}', 'button.medium:where(.icon, .label) {}', 'button.large:where(.icon, .label) {}']],
        ['@anchor(button) button:is(:hover, :focus-visible) {}', ['button.small:is(:hover, :focus-visible) {}', 'button.medium:is(:hover, :focus-visible) {}', 'button.large:is(:hover, :focus-visible) {}']],
        // Pseudo-classes: structural
        ['@anchor(button) button:first-child {}', ['button.small:first-child {}', 'button.medium:first-child {}', 'button.large:first-child {}']],
        ['@anchor(button) button:last-child {}', ['button.small:last-child {}', 'button.medium:last-child {}', 'button.large:last-child {}']],
        ['@anchor(button) button:only-child {}', ['button.small:only-child {}', 'button.medium:only-child {}', 'button.large:only-child {}']],
        ['@anchor(button) button:nth-child(2n+1) {}', ['button.small:nth-child(2n+1) {}', 'button.medium:nth-child(2n+1) {}', 'button.large:nth-child(2n+1) {}']],
        ['@anchor(button) button:nth-of-type(odd) {}', ['button.small:nth-of-type(odd) {}', 'button.medium:nth-of-type(odd) {}', 'button.large:nth-of-type(odd) {}']],
        ['@anchor(button) button:empty {}', ['button.small:empty {}', 'button.medium:empty {}', 'button.large:empty {}']],
        // Pseudo-elements
        ['@anchor(button) button::before {}', ['button.small::before {}', 'button.medium::before {}', 'button.large::before {}']],
        ['@anchor(button) button::after {}', ['button.small::after {}', 'button.medium::after {}', 'button.large::after {}']],
        ['@anchor(button) button:hover::before {}', ['button.small:hover::before {}', 'button.medium:hover::before {}', 'button.large:hover::before {}']],
        ['@anchor(button) button::marker {}', ['button.small::marker {}', 'button.medium::marker {}', 'button.large::marker {}']],
        ['@anchor(button) button::selection {}', ['button.small::selection {}', 'button.medium::selection {}', 'button.large::selection {}']],
        ['@anchor(button) button::first-letter {}', ['button.small::first-letter {}', 'button.medium::first-letter {}', 'button.large::first-letter {}']],
        ['@anchor(button) button::first-line {}', ['button.small::first-line {}', 'button.medium::first-line {}', 'button.large::first-line {}']],
        ['@anchor(button) button::backdrop {}', ['button.small::backdrop {}', 'button.medium::backdrop {}', 'button.large::backdrop {}']],
        ['@anchor(button) button::part(label) {}', ['button.small::part(label) {}', 'button.medium::part(label) {}', 'button.large::part(label) {}']],
        // Combinators: ~, tight spacing, ||, comma lists
        ['@anchor(button) button ~ .label {}', ['button.small ~ .label {}', 'button.medium ~ .label {}', 'button.large ~ .label {}']],
        ['@anchor(button) button~.label {}', ['button.small~.label {}', 'button.medium~.label {}', 'button.large~.label {}']],
        ['@anchor(button) button+.label {}', ['button.small+.label {}', 'button.medium+.label {}', 'button.large+.label {}']],
        ['@anchor(button) .container~button:has(.label)~.label {}', ['.container~button.small:has(.label)~.label {}', '.container~button.medium:has(.label)~.label {}', '.container~button.large:has(.label)~.label {}']],
        ['@anchor(button) button ~ button {}', ['button.small ~ button {}', 'button.medium ~ button {}', 'button.large ~ button {}']],
        ['@anchor(button) button + button {}', ['button.small + button {}', 'button.medium + button {}', 'button.large + button {}']],
        ['@anchor(button) .col || button {}', ['.col || button.small {}', '.col || button.medium {}', '.col || button.large {}']],
        ['@anchor(button) button, button .label {}', ['button.small, button.small .label {}', 'button.medium, button.medium .label {}', 'button.large, button.large .label {}']],
        ['@anchor(button) button, .label {}', ['button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}']],
        // Shadow DOM: :host / ::slotted context
        ['@anchor(button) :host button {}', [':host button.small {}', ':host button.medium {}', ':host button.large {}']],
        ['@anchor(button) :host([dense]) button:has(.label) {}', [':host([dense]) button.small:has(.label) {}', ':host([dense]) button.medium:has(.label) {}', ':host([dense]) button.large:has(.label) {}']],
        ['@anchor(button) slot::slotted(button) {}', ['slot::slotted(button.small) {}', 'slot::slotted(button.medium) {}', 'slot::slotted(button.large) {}']],
        // Target forms: class / attribute / pseudo
        ['@anchor(.card) .card {}', ['.card.small {}', '.card.medium {}', '.card.large {}']],
        ['@anchor(.card) .card .label {}', ['.card.small .label {}', '.card.medium .label {}', '.card.large .label {}']],
        ['@anchor([selected]) button[selected] {}', ['button[selected].small {}', 'button[selected].medium {}', 'button[selected].large {}']],
        ['@anchor(button:hover) button:hover .label {}', ['button:hover.small .label {}', 'button:hover.medium .label {}', 'button:hover.large .label {}']],
        ['@anchor(button::before) button::before {}', ['button::before.small {}', 'button::before.medium {}', 'button::before.large {}']],
        // Substring safety: functional args + hyphen prefix + attr value
        ['@anchor(button) button:has(button) {}', ['button.small:has(button) {}', 'button.medium:has(button) {}', 'button.large:has(button) {}']],
        ['@anchor(button) button:is(button, .label) {}', ['button.small:is(button, .label) {}', 'button.medium:is(button, .label) {}', 'button.large:is(button, .label) {}']],
        ['@anchor(button) button:where(button) {}', ['button.small:where(button) {}', 'button.medium:where(button) {}', 'button.large:where(button) {}']],
        ['@anchor(button) button:not(button) {}', ['button.small:not(button) {}', 'button.medium:not(button) {}', 'button.large:not(button) {}']],
        ['@anchor(button) .button-label button {}', ['.button-label button.small {}', '.button-label button.medium {}', '.button-label button.large {}']],
        ['@anchor(button) .container button[data-wow="button"]>.label {}', ['.container button.small[data-wow="button"]>.label {}', '.container button.medium[data-wow="button"]>.label {}', '.container button.large[data-wow="button"]>.label {}']],
        // Nested @anchor: B1 外殼保留、狀態在內層並列（R6）
        ['.wrapper { @anchor(button) button {} }', '.wrapper { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { @anchor(button) button .label {} }', '.wrapper { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['.wrapper { @anchor(button) button:has(.label) {} }', '.wrapper { button.small:has(.label) {} button.medium:has(.label) {} button.large:has(.label) {} }'],
        ['.wrapper { @anchor(button) button:hover::before {} }', '.wrapper { button.small:hover::before {} button.medium:hover::before {} button.large:hover::before {} }'],
        ['.wrapper[data-open] { @anchor(button) button {} }', '.wrapper[data-open] { button.small {} button.medium {} button.large {} }'],
        ['.wrapper > .inner { @anchor(button) button {} }', '.wrapper > .inner { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { .inner { @anchor(button) button {} } }', '.wrapper { .inner { button.small {} button.medium {} button.large {} } }'],
        ['.wrapper + .sibling { @anchor(button) button ~ .label {} }', '.wrapper + .sibling { button.small ~ .label {} button.medium ~ .label {} button.large ~ .label {} }'],
        ['.wrapper:not(.hidden) { @anchor(button) button:has(.label)>.label {} }', '.wrapper:not(.hidden) { button.small:has(.label)>.label {} button.medium:has(.label)>.label {} button.large:has(.label)>.label {} }'],
        [':host { @anchor(button) button {} }', ':host { button.small {} button.medium {} button.large {} }'],
        [':host([dense]) { @anchor(button) button:has(.label) {} }', ':host([dense]) { button.small:has(.label) {} button.medium:has(.label) {} button.large:has(.label) {} }'],
        // R7: & 先解為外層鏈再注入，嵌套內正規化為相對形式
        ['.wrapper { @anchor(button) & button {} }', '.wrapper { button.small {} button.medium {} button.large {} }'],
        ['.wrapper { @anchor(button.show[selected]) button.show[selected].foo {} }', '.wrapper { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],
        ['.wrapper { @anchor(button) button {}; @anchor(.card) .card {} }', '.wrapper { button.small {} button.medium {} button.large {} .card.small {} .card.medium {} .card.large {} }'],
        // R5: 逗號分支獨立注入，B1 下同殼並列
        ['.wrapper { @anchor(button) button, button .label {} }', '.wrapper { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        // R5: 部分分支無 target 透傳
        ['.wrapper { @anchor(button) button, .label {} }', '.wrapper { button.small, .label {} button.medium, .label {} button.large, .label {} }'],
        // R2: 多次出現只替第一個（B1）
        ['.wrapper { @anchor(button) button ~ button {} }', '.wrapper { button.small ~ button {} button.medium ~ button {} button.large ~ button {} }'],

    ]
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
     *   hovered  := ':hover'（host-anchor 掛 :host 上 → :host(:hover)；inner-anchor 掛自身 → button:hover）
     *   disabled := '[disabled]'（恆掛 :host，另起 :host([...]) 殼，見 H1）
     * H1 殼分裂：host 修飾另起頂層 :host([...]) 殼，不做 :host { :host(...) } 巢狀
     * H2 零 &：:host 子樹輸出禁止 &（Chrome 不解析 :host() 父層內的 &）
     * H3 修飾合併：appendToHostSelector 語義，一律括號內合併（:host(.a:hover)／:host([d][disabled])，Lit 要求偽類包在括號內）
     * H4 :is／:where 包裹 :host 視為 host-anchor，修飾按分支逐一合併（:where(:host([a][disabled]), …)）
     */
    const mapping: Array<[string, string | string[]]> = [
        // target = :host 基礎
        ['@anchor(:host) :host {}', [':host {}', ':host(:hover) {}', ':host([disabled]) {}']],
        ['@anchor(:host) :host .label {}', [':host .label {}', ':host(:hover) .label {}', ':host([disabled]) .label {}']],
        ['@anchor(:host) :host > .container {}', [':host > .container {}', ':host(:hover) > .container {}', ':host([disabled]) > .container {}']],
        ['@anchor(:host) :host .a .b {}', [':host .a .b {}', ':host(:hover) .a .b {}', ':host([disabled]) .a .b {}']],
        ['@anchor(:host) :host .a ~ .b {}', [':host .a ~ .b {}', ':host(:hover) .a ~ .b {}', ':host([disabled]) .a ~ .b {}']],
        // target = :host compound（class / attribute）
        ['@anchor(:host) :host(.active) {}', [':host(.active) {}', ':host(.active:hover) {}', ':host(.active[disabled]) {}']],
        ['@anchor(:host) :host([dense]) {}', [':host([dense]) {}', ':host([dense]:hover) {}', ':host([dense][disabled]) {}']],
        ['@anchor(:host) :host([variant="filled"]) {}', [':host([variant="filled"]) {}', ':host([variant="filled"]:hover) {}', ':host([variant="filled"][disabled]) {}']],
        ['@anchor(:host) :host(.a.b) {}', [':host(.a.b) {}', ':host(.a.b:hover) {}', ':host(.a.b[disabled]) {}']],
        ['@anchor(:host) :host([a][b="c"]) {}', [':host([a][b="c"]) {}', ':host([a][b="c"]:hover) {}', ':host([a][b="c"][disabled]) {}']],
        ['@anchor(:host) :host([v="x" i]) {}', [':host([v="x" i]) {}', ':host([v="x" i]:hover) {}', ':host([v="x" i][disabled]) {}']],
        ['@anchor(:host) :host(.active) .label {}', [':host(.active) .label {}', ':host(.active:hover) .label {}', ':host(.active[disabled]) .label {}']],
        ['@anchor(:host) :host([dense]) > .container {}', [':host([dense]) > .container {}', ':host([dense]:hover) > .container {}', ':host([dense][disabled]) > .container {}']],
        // target = :host functional（:not / :is / :where / :has）
        ['@anchor(:host) :host(:not(.a)) {}', [':host(:not(.a)) {}', ':host(:not(.a):hover) {}', ':host(:not(.a)[disabled]) {}']],
        ['@anchor(:host) :host(:not(.a):not([b])) {}', [':host(:not(.a):not([b])) {}', ':host(:not(.a):not([b]):hover) {}', ':host(:not(.a):not([b])[disabled]) {}']],
        ['@anchor(:host) :host(:is(.a,.b)) {}', [':host(:is(.a,.b)) {}', ':host(:is(.a,.b):hover) {}', ':host(:is(.a,.b)[disabled]) {}']],
        ['@anchor(:host) :host(:where(.a)) {}', [':host(:where(.a)) {}', ':host(:where(.a):hover) {}', ':host(:where(.a)[disabled]) {}']],
        ['@anchor(:host) :host(:has(.label)) {}', [':host(:has(.label)) {}', ':host(:has(.label):hover) {}', ':host(:has(.label)[disabled]) {}']],
        // target = :host structural pseudo（非觸發修飾，純結構）
        ['@anchor(:host) :host(:focus-visible) {}', [':host(:focus-visible) {}', ':host(:focus-visible:hover) {}', ':host(:focus-visible[disabled]) {}']],
        ['@anchor(:host) :host(:first-child) {}', [':host(:first-child) {}', ':host(:first-child:hover) {}', ':host(:first-child[disabled]) {}']],
        ['@anchor(:host) :host(:empty) {}', [':host(:empty) {}', ':host(:empty:hover) {}', ':host(:empty[disabled]) {}']],
        // R3：屬性值內子字串永不匹配
        ['@anchor(:host) :host[data-label=":host"] {}', [':host[data-label=":host"] {}', ':host[data-label=":host"]:hover {}', ':host[data-label=":host"][disabled] {}']],
        // R5：逗號分支獨立注入
        ['@anchor(:host) :host(.a), :host(.b) {}', [':host(.a), :host(.b) {}', ':host(.a:hover), :host(.b:hover) {}', ':host(.a[disabled]), :host(.b[disabled]) {}']],
        ['@anchor(:host) :host, .label {}', [':host, .label {}', ':host(:hover), .label {}', ':host([disabled]), .label {}']],
        // :is / :where 包裹 :host：視為 host-anchor，修飾按分支合併
        ['@anchor(:where(:host)) :where(:host) {}', [':where(:host) {}', ':where(:host(:hover)) {}', ':where(:host([disabled])) {}']],
        ['@anchor(:is(:host)) :is(:host) {}', [':is(:host) {}', ':is(:host(:hover)) {}', ':is(:host([disabled])) {}']],
        ['@anchor(:where(:host([a]), :host([b]))) :where(:host([a]), :host([b])) {}', [':where(:host([a]), :host([b])) {}', ':where(:host([a]:hover), :host([b]:hover)) {}', ':where(:host([a][disabled]), :host([b][disabled])) {}']],
        ['@anchor(:is(:host(.a), :host([b]))) :is(:host(.a), :host([b])) {}', [':is(:host(.a), :host([b])) {}', ':is(:host(.a:hover), :host([b]:hover)) {}', ':is(:host(.a[disabled]), :host([b][disabled])) {}']],
        ['@anchor(:where(:host)) :where(:host) .label {}', [':where(:host) .label {}', ':where(:host(:hover)) .label {}', ':where(:host([disabled])) .label {}']],
        ['@anchor(:where(:host([variant="x"]), :host(:has(.x)))) :where(:host([variant="x"]), :host(:has(.x))) {}', [':where(:host([variant="x"]), :host(:has(.x))) {}', ':where(:host([variant="x"]:hover), :host(:has(.x):hover)) {}', ':where(:host([variant="x"][disabled]), :host(:has(.x)[disabled])) {}']],
        // anchor 帶巢狀 body（B1：巢狀體隨殼展開）
        ['@anchor(:host) :host { .label {} }', [':host { .label {} }', ':host(:hover) { .label {} }', ':host([disabled]) { .label {} }']],
        ['@anchor(:host) :host(.active) { .label {} }', [':host(.active) { .label {} }', ':host(.active:hover) { .label {} }', ':host(.active[disabled]) { .label {} }']],
        // Nested：:host 作外層，B1 單字串（H1 殼分裂：disabled 另起殼）
        [':host { @anchor(button) button {} }', ':host { button {} button:hover {} } :host([disabled]) { button {} }'],
        [':host([dense]) { @anchor(button) button .label {} }', ':host([dense]) { button .label {} button:hover .label {} } :host([dense][disabled]) { button .label {} }'],
        [':host(:not(.a)) { @anchor(button) button {} }', ':host(:not(.a)) { button {} button:hover {} } :host(:not(.a)[disabled]) { button {} }'],
        [':host { .wrapper { @anchor(button) button {} } }', ':host { .wrapper { button {} button:hover {} } } :host([disabled]) { .wrapper { button {} } }'],
        [':host { @anchor(button) button, button .label {} }', ':host { button, button .label {} button:hover, button:hover .label {} } :host([disabled]) { button, button .label {} }'],
        [':host { @anchor(button) button {}; @anchor(.card) .card {} }', ':host { button {} button:hover {} .card {} .card:hover {} } :host([disabled]) { button {} .card {} }'],
        [':where(:host) { @anchor(button) button {} }', ':where(:host) { button {} button:hover {} } :where(:host([disabled])) { button {} }'],

    ]
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
     *   disabled     := { name: 'disabled', modifier: '[disabled]' }（裸記錄，不用 host/self 包裝；掛載點由 @anchor(target) 決定）
     * 掛載原則：狀態一律掛載在 @anchor(target) 的 target 上，不跳到 :host
     * 修飾順序：target ＋ 組合內修飾（維度順）＋ 餘部（如 :has／::before）
     * 展開順序＝笛卡爾積：[medium,enabled] → [medium,disabled] → [large,enabled] → [large,disabled]
     * Nested B1：4 組合同殼並列，無殼分裂
     */
    const mapping: Array<[string, string | string[]]> = [
        // 基礎矩陣（笛卡爾積 4 展開，狀態掛錨點）
        ['@anchor(button) button {}', ['button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}']],
        ['@anchor(button) button .label {}', ['button.medium .label {}', 'button.medium[disabled] .label {}', 'button.large .label {}', 'button.large[disabled] .label {}']],
        ['@anchor(button) button:has(.label) {}', ['button.medium:has(.label) {}', 'button.medium[disabled]:has(.label) {}', 'button.large:has(.label) {}', 'button.large[disabled]:has(.label) {}']],
        ['@anchor(button) .container>button:has(.label)>.label {}', ['.container>button.medium:has(.label)>.label {}', '.container>button.medium[disabled]:has(.label)>.label {}', '.container>button.large:has(.label)>.label {}', '.container>button.large[disabled]:has(.label)>.label {}']],
        // 複合 target：狀態插在 target 後、餘部前
        ['@anchor(button.show) button.show.foo {}', ['button.show.medium.foo {}', 'button.show.medium[disabled].foo {}', 'button.show.large.foo {}', 'button.show.large[disabled].foo {}']],
        ['@anchor(button.show[selected]) button.show[selected].foo {}', ['button.show[selected].medium.foo {}', 'button.show[selected].medium[disabled].foo {}', 'button.show[selected].large.foo {}', 'button.show[selected].large[disabled].foo {}']],
        // 函數偽類（非觸發修飾，原樣保留於餘部）
        ['@anchor(button) button:is(.icon,.label) {}', ['button.medium:is(.icon,.label) {}', 'button.medium[disabled]:is(.icon,.label) {}', 'button.large:is(.icon,.label) {}', 'button.large[disabled]:is(.icon,.label) {}']],
        // :host 前綴為結構上下文，原樣保留；狀態仍掛 button
        ['@anchor(button) :host button {}', [':host button.medium {}', ':host button.medium[disabled] {}', ':host button.large {}', ':host button.large[disabled] {}']],
        // target = :host × 組合（掛載點即 :host，類修飾入括號）
        ['@anchor(:host) :host {}', [':host(.medium) {}', ':host(.medium[disabled]) {}', ':host(.large) {}', ':host(.large[disabled]) {}']],
        ['@anchor(:host) :host .label {}', [':host(.medium) .label {}', ':host(.medium[disabled]) .label {}', ':host(.large) .label {}', ':host(.large[disabled]) .label {}']],
        // 屬性運算子／偽元素／ID／通配
        ['@anchor(button) button[type="submit"] {}', ['button.medium[type="submit"] {}', 'button.medium[disabled][type="submit"] {}', 'button.large[type="submit"] {}', 'button.large[disabled][type="submit"] {}']],
        ['@anchor(button) button[class*="btn-"] {}', ['button.medium[class*="btn-"] {}', 'button.medium[disabled][class*="btn-"] {}', 'button.large[class*="btn-"] {}', 'button.large[disabled][class*="btn-"] {}']],
        ['@anchor(button) button::before {}', ['button.medium::before {}', 'button.medium[disabled]::before {}', 'button.large::before {}', 'button.large[disabled]::before {}']],
        ['@anchor(#submit) #submit {}', ['#submit.medium {}', '#submit.medium[disabled] {}', '#submit.large {}', '#submit.large[disabled] {}']],
        ['@anchor(*) * {}', ['*.medium {}', '*.medium[disabled] {}', '*.large {}', '*.large[disabled] {}']],
        // R5：逗號分支獨立注入
        ['@anchor(button) button, button .label {}', ['button.medium, button.medium .label {}', 'button.medium[disabled], button.medium[disabled] .label {}', 'button.large, button.large .label {}', 'button.large[disabled], button.large[disabled] .label {}']],
        ['@anchor(button) button, .label {}', ['button.medium, .label {}', 'button.medium[disabled], .label {}', 'button.large, .label {}', 'button.large[disabled], .label {}']],
        // R3：函數參數／屬性值內子字串永不匹配
        ['@anchor(button) button:has(button) {}', ['button.medium:has(button) {}', 'button.medium[disabled]:has(button) {}', 'button.large:has(button) {}', 'button.large[disabled]:has(button) {}']],
        ['@anchor(button) .container button[data-x="button"] {}', ['.container button.medium[data-x="button"] {}', '.container button.medium[disabled][data-x="button"] {}', '.container button.large[data-x="button"] {}', '.container button.large[disabled][data-x="button"] {}']],
        // anchor 帶巢狀 body（B1：巢狀體隨組合展開）
        ['@anchor(button) button { .label {} }', ['button.medium { .label {} }', 'button.medium[disabled] { .label {} }', 'button.large { .label {} }', 'button.large[disabled] { .label {} }']],
        // Nested B1：4 組合同殼並列（單字串，無殼分裂）
        ['.wrapper { @anchor(button) button {} }', '.wrapper { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],
        ['.wrapper { @anchor(button) button .label {} }', '.wrapper { button.medium .label {} button.medium[disabled] .label {} button.large .label {} button.large[disabled] .label {} }'],
        [':host { @anchor(button) button {} }', ':host { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],

    ]
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
     * V3 B1 保留嵌套：body 原樣嵌於殼內；@anchor 可內嵌，注入照 R2 在內層執行
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
        // V3：@anchor 內嵌（單態下注入即原樣，驗殼＋錨正交）
        ['@variant(filled) { @anchor(button) button {} }', ':host([variant="filled"]) { button {} }'],
        ['@variant(tonal, outlined) { @anchor(button.show[selected]) button.show[selected].foo {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.show[selected].foo {} }'],
        ['@variant(filled) { @anchor(button) button, button .label {} }', ':host([variant="filled"]) { button, button .label {} }'],

    ]
})

describe('when', () => {
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
    const VariantDefs = { 'filled': FilledDef, 'tonal': TonalDef } as const

    /**
     * When 語法語義（宿主條件就近書寫、頂層外殼提升）：
     *   when-rule  := "@when" "(" condition ("," condition)* ","? ")" "{" body "}"
     *   condition  := host-selector（必須顯式包含 :host，如 :host([checked])、:where(:host)）
     *   不支援非 host 選擇器：`@when(.dense)` 等純內部選擇器屬無效用法（warn），請使用原生 CSS 巢狀 `&.dense`
     * W1 顯式宿主：條件必須顯式宣告 :host，未包含者發出 warn 或原樣透傳
     * W2 頂層外殼提升（Shell Hoisting）：無論巢狀於多深層的選擇器中，均將 :host 條件提升為獨立的頂層外殼，內部保留完整上下文路徑
     * W3 零 & 原則（H2）：提升後的頂層 :host 外殼子樹內禁止輸出 &
     * W4 外層 Host 括號合併（H3）：處於 @variant 或頂層 :host 內部時，屬性合併至括號內（如 :host([variant="filled"][checked])）
     * W5 逗號多條件並列：多條件展開為並列頂層外殼（如 :host([a]), :host([b]) { … }）
     * W6 與 @anchor 雙向協同：外層包裹 @anchor 或於 @anchor 內部巢狀，提升之外殼均完整套用 anchor 狀態展開
     */
    const mapping: Array<[string, string | string[]]> = [
        // 基礎頂層 @when
        ['@when(:host([checked])) { button {} }', ':host([checked]) { button {} }'],
        ['@when(:host([dense])) { button .label {} }', ':host([dense]) { button .label {} }'],
        ['@when(:host(:not([disabled]))) { button:has(.label) {} }', ':host(:not([disabled])) { button:has(.label) {} }'],
        ['@when(:host(.active)) { .container button {} }', ':host(.active) { .container button {} }'],
        ['@when(:where(:host)) { button {} }', ':where(:host) { button {} }'],
        ['@when(:is(:host([a]), :host([b]))) { button {} }', ':is(:host([a]), :host([b])) { button {} }'],
        // W5：逗號多條件並列
        ['@when(:host([checked]), :host([active])) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(  :host([checked]) ,  :host([active])  ) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host([checked]), :host([active]),) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        // W2：深層巢狀外殼提升（Shell Hoisting）
        ['.container { button { @when(:host([checked])) { color: red; } } }', '.container { button {} } :host([checked]) { .container { button { color: red; } } }'],
        ['.wrapper { @when(:host([checked])) { button {} } }', '.wrapper {} :host([checked]) { .wrapper { button {} } }'],
        ['.card > .title { @when(:host([dense])) { font-size: 12px; } }', '.card > .title {} :host([dense]) { .card > .title { font-size: 12px; } }'],
        [':host { .wrapper { @when(:host([checked])) { button {} } } }', ':host { .wrapper {} } :host([checked]) { .wrapper { button {} } }'],
        // W4：與 @variant 巢狀與括號合併（H3）
        ['@variant(filled) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"][checked]) { button {} }'],
        ['@variant(filled) { .container { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { .container {} } :host([variant="filled"][checked]) { .container { button {} } }'],
        ['@variant(filled, tonal) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]), :host([variant="tonal"]) {} :host([variant="filled"][checked]), :host([variant="tonal"][checked]) { button {} }'],
        // W6：與 @anchor 雙向協同
        ['@when(:host([checked])) { @anchor(button) button {} }', ':host([checked]) { button.small {} button.medium {} button.large {} }'],
        ['@when(:host([checked])) { @anchor(button) button .label {} }', ':host([checked]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@anchor(button) button { @when(:host([dense])) { height: 32px; } }', 'button.small {} button.medium {} button.large {} :host([dense]) { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } }'],
        ['.wrapper { @anchor(button) button { @when(:host([dense])) { height: 32px; } } }', '.wrapper { button.small {} button.medium {} button.large {} } :host([dense]) { .wrapper { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } } }'],
        ['@variant(filled) { @anchor(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'],
    ]
})

describe('property-expanders', () => {
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
     * 屬性級展開巨集（Property Expanders）：
     *   P1 shape: 展開為四角（start-start, start-end, end-end, end-start）
     *   P2 padding: / margin: 展開為四方向邏輯邊距（inline-start, inline-end, block-start, block-end）
     *   P3 typescale: 展開為字體 6 要素（font-family, font-size, line-height, font-weight, letter-spacing, opacity）
     *   規則：若給定單一變數前綴（如 var(--_shape)），自動拼接後綴欄位；若給定靜態純值，則均勻應用至各欄位
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
        // P1: shape 靜態純值均勻展開
        [
            'button { shape: 8px; }',
            'button { border-start-start-radius: 8px; border-start-end-radius: 8px; border-end-end-radius: 8px; border-end-start-radius: 8px; }',
        ],
        // P2: padding 變數前綴展開
        [
            'button { padding: var(--_padding); }',
            'button { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
        ],
        // P2: margin 變數前綴展開
        [
            'button { margin: var(--_margin); }',
            'button { margin-inline-start: var(--_margin-inline-start); margin-inline-end: var(--_margin-inline-end); margin-block-start: var(--_margin-block-start); margin-block-end: var(--_margin-block-end); }',
        ],
        // P3: typescale 6 要素展開
        [
            'button { typescale: var(--_label-text); }',
            'button { font-family: var(--_label-text-font); font-size: var(--_label-text-size); line-height: var(--_label-text-line-height); font-weight: var(--_label-text-weight); letter-spacing: var(--_label-text-tracking); opacity: var(--_label-text-opacity); }',
        ],
        // 巢狀與 @anchor 協同
        [
            '@anchor(button) button { shape: var(--_shape); }',
            [
                'button.small { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.medium { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.large { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
            ],
        ],
    ]
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
     *   S1 元素錨點：掛載於目標元素後方（button:state(checked)）
     *   S2 宿主錨點：掛載於 :host 時自動括號內合併（:host(:state(checked))，符合 H3）
     *   S3 與 @when 協同：支援 @when(:host(:state(...)))，深層就近宣告時提升為頂層獨立外殼
     */
    const mapping: Array<[string, string | string[]]> = [
        // S1: 元素錨點掛載
        ['@anchor(button) button {}', ['button {}', 'button:state(checked) {}', 'button:state(disabled) {}']],
        ['@anchor(button) button .label {}', ['button .label {}', 'button:state(checked) .label {}', 'button:state(disabled) .label {}']],
        // S2: 宿主錨點掛載（H3 括號內合入）
        ['@anchor(:host) :host {}', [':host {}', ':host(:state(checked)) {}', ':host(:state(disabled)) {}']],
        ['@anchor(:host) :host([dense]) {}', [':host([dense]) {}', ':host([dense]:state(checked)) {}', ':host([dense]:state(disabled)) {}']],
        // S3: 與 @when 協同（頂層提升）
        ['@when(:host(:state(checked))) { button {} }', ':host(:state(checked)) { button {} }'],
        ['.container { button { @when(:host(:state(checked))) { color: red; } } }', '.container { button {} } :host(:state(checked)) { .container { button { color: red; } } }'],
        ['@variant(filled) { @when(:host(:state(checked))) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]:state(checked)) { button {} }'],
    ]
})

describe('a11y', () => {
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
        // A11y 與 @anchor 結合
        [
            '@anchor(button) button { @reduced-motion { transition: none; } }',
            [
                'button.small { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.medium { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.large { @media (prefers-reduced-motion: reduce) { transition: none; } }',
            ],
        ],
    ]
})
