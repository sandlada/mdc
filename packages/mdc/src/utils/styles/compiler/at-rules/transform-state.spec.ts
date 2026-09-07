/**
 * @version 2026.9.7
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @state 选择器规格：只测选择器 / 壳分裂 / 提升，不测声明内容。
 * 绿队 = 合法输入必须展开；红队 = 非法输入必须安全失败（[P] 保留嵌套 / [D] 输出空串）。
 */

import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from '../../create-style-definition'
import { defineSchema } from '../../define-schema'
import { mapStateTriggers } from '../../map-state-triggers'
import { compileStateSheet } from '../compile-state-sheet'

type MappingRow = ReadonlyArray<readonly [input: string, expected: string | readonly string[]]>

function canonical(css: string | readonly string[]): string {
    // 数组以单空格连接；换行仅统一 \r\n，不折叠中间空白。
    const text = typeof css === 'string' ? css : css.join(' ')
    return text.replace(/\r\n/g, '\n').trim()
}

describe('@state: small, medium, .large', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
        'color': [null, 'red', 'blue'],
        'width': {
            small: `120px`,
            medium: `130px`,
            large: `140px`,
        }
    })
    const SizeTriggers = mapStateTriggers({
        'small': '.small',
        'medium': '.medium',
        'large': '.large',
    })

    /**
     * @state(target) selector { body }：target 与 selector 皆必填。
     * R1 target 与 selector 皆必填；R2 全量替换并尾部追加状态；R3 函数参数与属性值内子串不匹配；
     * R4 连字前缀不算匹配；R5 逗号分支独立注入；R6 壳内并列；R7 嵌套内 & button 正规化为 button，单独 & 丢弃；
     * R8 全部分支零匹配即丢弃整块。
     */
    const greenMapping: MappingRow = [
        ['@state(button) button {}', ['button.small {}', 'button.medium {}', 'button.large {}']],
        ['@state(button) button .label {}', ['button.small .label {}', 'button.medium .label {}', 'button.large .label {}']],
        ['@state(button) button :is(.icon, .label) {}', [
            'button.small :is(.icon, .label) {}',
            'button.medium :is(.icon, .label) {}',
            'button.large :is(.icon, .label) {}',
        ]],
        ['@state(button) button { :is(.icon, .label) {} }', [
            'button.small { :is(.icon, .label) {} }',
            'button.medium { :is(.icon, .label) {} }',
            'button.large { :is(.icon, .label) {} }',
        ]],
        ['@state(button) button { &:is(.icon, .label) {} }', [
            'button.small { &:is(.icon, .label) {} }',
            'button.medium { &:is(.icon, .label) {} }',
            'button.large { &:is(.icon, .label) {} }',
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
        ['.container { @state(button) &button:has(.label) { .label {} } }', [
            '.container { &button.small:has(.label) { .label {} } }',
            '.container { &button.medium:has(.label) { .label {} } }',
            '.container { &button.large:has(.label) { .label {} } }',
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
        ['@state(button.show) button.show.ahaha.hummm {}', [
            'button.show.small.ahaha.hummm {}',
            'button.show.medium.ahaha.hummm {}',
            'button.show.large.ahaha.hummm {}',
        ]],
        ['@state(button.show) .container > button.show.ahaha.hummm {}', [
            '.container > button.show.small.ahaha.hummm {}',
            '.container > button.show.medium.ahaha.hummm {}',
            '.container > button.show.large.ahaha.hummm {}',
        ]],
        ['.container { @state(button.show) button.show.ahaha.hummm {} }', [
            '.container { button.show.small.ahaha.hummm {} }',
            '.container { button.show.medium.ahaha.hummm {} }',
            '.container { button.show.large.ahaha.hummm {} }',
        ]],
        ['@state(button.show) button.show.ahaha.hummm .label {}', [
            'button.show.small.ahaha.hummm .label {}',
            'button.show.medium.ahaha.hummm .label {}',
            'button.show.large.ahaha.hummm .label {}'
        ]],
        ['@state(button.show) button.show.ahaha.hummm button.label .show button {}', [
            'button.show.small.ahaha.hummm button.label .show button {}',
            'button.show.medium.ahaha.hummm button.label .show button {}',
            'button.show.large.ahaha.hummm button.label .show button {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm {}', [
            'button.show[selected][data-wow="yes"].small.ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm .label {}', [
            'button.show[selected][data-wow="yes"].small.ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm .label {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm button.label .show button {}', [
            'button.show[selected][data-wow="yes"].small.ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm button.label .show button {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm {}', [
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm .label {}', [
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm .label {}'
        ]],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm button.label .show button {}', [
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm button.label .show button {}'
        ]],
        ['@state(#submit) #submit {}', [
            '#submit.small {}',
            '#submit.medium {}',
            '#submit.large {}'
        ]],
        ['@state(#submit) #submit .label {}', [
            '#submit.small .label {}',
            '#submit.medium .label {}',
            '#submit.large .label {}'
        ]],
        ['@state(*) * {}', [
            '*.small {}',
            '*.medium {}',
            '*.large {}'
        ]],
        ['@state(*) * .label {}', [
            '*.small .label {}',
            '*.medium .label {}',
            '*.large .label {}'
        ]],
        ['@state(button) button#submit {}', [
            'button.small#submit {}',
            'button.medium#submit {}',
            'button.large#submit {}'
        ]],
        ['@state(button) button#submit.primary {}', [
            'button.small#submit.primary {}',
            'button.medium#submit.primary {}',
            'button.large#submit.primary {}'
        ]],
        ['@state(button#submit) button#submit.primary {}', [
            'button#submit.small.primary {}',
            'button#submit.medium.primary {}',
            'button#submit.large.primary {}'
        ]],
        ['@state(button) * button {}', [
            '* button.small {}', '* button.medium {}', '* button.large {}'
        ]],
        ['@state(button) .container .label button {}', [
            '.container .label button.small {}', '.container .label button.medium {}', '.container .label button.large {}'
        ]],
        ['@state(button) button[type="submit"] {}', [
            'button.small[type="submit"] {}', 'button.medium[type="submit"] {}', 'button.large[type="submit"] {}'
        ]],
        ['@state(button) button[type=\'submit\'] {}', [
            'button.small[type=\'submit\'] {}', 'button.medium[type=\'submit\'] {}', 'button.large[type=\'submit\'] {}'
        ]],
        ['@state(button) button[title~="word"] {}', [
            'button.small[title~="word"] {}', 'button.medium[title~="word"] {}', 'button.large[title~="word"] {}'
        ]],
        ['@state(button) button[lang|="en"] {}', [
            'button.small[lang|="en"] {}', 'button.medium[lang|="en"] {}', 'button.large[lang|="en"] {}'
        ]],
        ['@state(button) button[href^="https"] {}', [
            'button.small[href^="https"] {}', 'button.medium[href^="https"] {}', 'button.large[href^="https"] {}'
        ]],
        ['@state(button) button[href$=".pdf"] {}', [
            'button.small[href$=".pdf"] {}', 'button.medium[href$=".pdf"] {}', 'button.large[href$=".pdf"] {}'
        ]],
        ['@state(button) button[class*="btn-"] {}', [
            'button.small[class*="btn-"] {}', 'button.medium[class*="btn-"] {}', 'button.large[class*="btn-"] {}'
        ]],
        ['@state(button) button[data-wow="yes" i] {}', [
            'button.small[data-wow="yes" i] {}', 'button.medium[data-wow="yes" i] {}', 'button.large[data-wow="yes" i] {}'
        ]],
        ['@state(button) button[data-label="button"] {}', [
            'button.small[data-label="button"] {}', 'button.medium[data-label="button"] {}', 'button.large[data-label="button"] {}'
        ]],
        ['@state(button) button:hover {}', [
            'button.small:hover {}',
            'button.medium:hover {}',
            'button.large:hover {}'
        ]],
        ['@state(button) button:focus-visible {}', [
            'button.small:focus-visible {}',
            'button.medium:focus-visible {}',
            'button.large:focus-visible {}'
        ]],
        ['@state(button) button:active {}', [
            'button.small:active {}',
            'button.medium:active {}',
            'button.large:active {}'
        ]],
        ['@state(button) button:hover:active {}', [
            'button.small:hover:active {}',
            'button.medium:hover:active {}',
            'button.large:hover:active {}'
        ]],
        ['@state(button) button:disabled {}', [
            'button.small:disabled {}',
            'button.medium:disabled {}',
            'button.large:disabled {}'
        ]],
        ['@state(button) button:checked {}', [
            'button.small:checked {}',
            'button.medium:checked {}',
            'button.large:checked {}'
        ]],
        ['@state(button) button:hover:focus-visible {}', [
            'button.small:hover:focus-visible {}',
            'button.medium:hover:focus-visible {}',
            'button.large:hover:focus-visible {}'
        ]],
        ['@state(button) button:not(.disabled) {}', [
            'button.small:not(.disabled) {}',
            'button.medium:not(.disabled) {}',
            'button.large:not(.disabled) {}'
        ]],
        ['@state(button) button:not([disabled]) {}', [
            'button.small:not([disabled]) {}',
            'button.medium:not([disabled]) {}',
            'button.large:not([disabled]) {}'
        ]],
        ['@state(button) button:not([disabled="true"]) {}', [
            'button.small:not([disabled="true"]) {}',
            'button.medium:not([disabled="true"]) {}',
            'button.large:not([disabled="true"]) {}'
        ]],
        ['@state(button) button:not([disabled="false"]) {}', [
            'button.small:not([disabled="false"]) {}',
            'button.medium:not([disabled="false"]) {}',
            'button.large:not([disabled="false"]) {}'
        ]],
        ['@state(button) button:not(.a):not([disabled]) {}', [
            'button.small:not(.a):not([disabled]) {}',
            'button.medium:not(.a):not([disabled]) {}',
            'button.large:not(.a):not([disabled]) {}'
        ]],
        ['@state(button) .wrap button:not(.a):not([disabled]) {}', [
            '.wrap button.small:not(.a):not([disabled]) {}',
            '.wrap button.medium:not(.a):not([disabled]) {}',
            '.wrap button.large:not(.a):not([disabled]) {}'
        ]],
        ['.wrap { @state(button) button:not(.a):not([disabled]) {} }', [
            '.wrap { button.small:not(.a):not([disabled]) {} }',
            '.wrap { button.medium:not(.a):not([disabled]) {} }',
            '.wrap { button.large:not(.a):not([disabled]) {} }',
        ]],
        ['.wrap { @state(button) &button:not(.a):not([disabled]) {} }', [
            '.wrap { &button.small:not(.a):not([disabled]) {} }',
            '.wrap { &button.medium:not(.a):not([disabled]) {} }',
            '.wrap { &button.large:not(.a):not([disabled]) {} }',
        ]],
        ['@state(button) button:where(.icon, .label) {}', [
            'button.small:where(.icon, .label) {}',
            'button.medium:where(.icon, .label) {}',
            'button.large:where(.icon, .label) {}'
        ]],
        ['@state(button) button { :where(.icon, .label) {} }', [
            'button.small { :where(.icon, .label) {} }',
            'button.medium { :where(.icon, .label) {} }',
            'button.large { :where(.icon, .label) {} }',
        ]],
        ['@state(button) button { &:where(.icon, .label) {} }', [
            'button.small { &:where(.icon, .label) {} }',
            'button.medium { &:where(.icon, .label) {} }',
            'button.large { &:where(.icon, .label) {} }',
        ]],
        ['@state(button) button:is(:hover, :focus-visible) {}', [
            'button.small:is(:hover, :focus-visible) {}',
            'button.medium:is(:hover, :focus-visible) {}',
            'button.large:is(:hover, :focus-visible) {}'
        ]],
        ['@state(button) button:first-child {}', [
            'button.small:first-child {}',
            'button.medium:first-child {}',
            'button.large:first-child {}'
        ]],
        ['@state(button) button:last-child {}', [
            'button.small:last-child {}',
            'button.medium:last-child {}',
            'button.large:last-child {}'
        ]],
        ['@state(button) button:only-child {}', [
            'button.small:only-child {}',
            'button.medium:only-child {}',
            'button.large:only-child {}'
        ]],
        ['@state(button) button:nth-child(2n+1) {}', [
            'button.small:nth-child(2n+1) {}',
            'button.medium:nth-child(2n+1) {}',
            'button.large:nth-child(2n+1) {}'
        ]],
        ['@state(button) button:nth-of-type(odd) {}', [
            'button.small:nth-of-type(odd) {}',
            'button.medium:nth-of-type(odd) {}',
            'button.large:nth-of-type(odd) {}'
        ]],
        ['@state(button) button:empty {}', [
            'button.small:empty {}',
            'button.medium:empty {}',
            'button.large:empty {}'
        ]],
        ['@state(button) button::before {}', [
            'button.small::before {}',
            'button.medium::before {}',
            'button.large::before {}'
        ]],
        ['@state(button) button::after {}', [
            'button.small::after {}',
            'button.medium::after {}',
            'button.large::after {}'
        ]],
        ['@state(button) button:hover::before {}', [
            'button.small:hover::before {}',
            'button.medium:hover::before {}',
            'button.large:hover::before {}'
        ]],
        ['@state(button) button::marker {}', [
            'button.small::marker {}',
            'button.medium::marker {}',
            'button.large::marker {}'
        ]],
        ['@state(button) button::selection {}', [
            'button.small::selection {}',
            'button.medium::selection {}',
            'button.large::selection {}'
        ]],
        ['@state(button) button::first-letter {}', [
            'button.small::first-letter {}',
            'button.medium::first-letter {}',
            'button.large::first-letter {}'
        ]],
        ['@state(button) button::first-line {}', [
            'button.small::first-line {}',
            'button.medium::first-line {}',
            'button.large::first-line {}'
        ]],
        ['@state(button) button::backdrop {}', [
            'button.small::backdrop {}',
            'button.medium::backdrop {}',
            'button.large::backdrop {}'
        ]],
        ['@state(button) button::part(label) {}', [
            'button.small::part(label) {}',
            'button.medium::part(label) {}',
            'button.large::part(label) {}'
        ]],
        ['@state(button) button ~ .label {}', [
            'button.small ~ .label {}',
            'button.medium ~ .label {}',
            'button.large ~ .label {}'
        ]],
        ['@state(button) button~.label {}', [
            'button.small~.label {}',
            'button.medium~.label {}',
            'button.large~.label {}'
        ]],
        ['@state(button) button+.label {}', [
            'button.small+.label {}',
            'button.medium+.label {}',
            'button.large+.label {}'
        ]],
        ['@state(button) .container~button:has(.label)~.label {}', [
            '.container~button.small:has(.label)~.label {}',
            '.container~button.medium:has(.label)~.label {}',
            '.container~button.large:has(.label)~.label {}'
        ]],
        ['@state(.label) .container~button:has(.label)~.label {}', [
            '.container~button:has(.label.small)~.label.small {}',
            '.container~button:has(.label.medium)~.label.medium {}',
            '.container~button:has(.label.large)~.label.large {}'
        ]],
        ['@state(button) button ~ button {}', [
            'button.small ~ button.small {}',
            'button.medium ~ button.medium {}',
            'button.large ~ button.large {}'
        ]],
        ['@state(button) button + button {}', [
            'button.small + button.small {}',
            'button.medium + button.medium {}',
            'button.large + button.large {}'
        ]],
        ['@state(button+button) button+button {}', [
            'button+button.small {}',
            'button+button.medium {}',
            'button+button.large {}'
        ]],
        ['@state(button+ button) button+ button {}', [
            'button+ button.small {}',
            'button+ button.medium {}',
            'button+ button.large {}'
        ]],
        // R2 空白敏感：target 必须字面全等
        ['@state(button+button) button+ button {}', [
            'button+ button {}'
        ]],
        ['@state(button +button) button+ button {}', [
            'button+ button {}'
        ]],
        ['@state(button + button) button+ button {}', [
            'button+ button {}'
        ]],
        ['@state(button + button) button + button {}', [
            'button + button.small {}',
            'button + button.medium {}',
            'button + button.large {}'
        ]],
        ['@state(button) button { &+button {} }', [
            'button.small { &+button {} }',
            'button.medium { &+button {} }',
            'button.large { &+button {} }'
        ]],
        ['@state(td) col.selected || td {}', [
            'col.selected || td.small {}',
            'col.selected || td.medium {}',
            'col.selected || td.large {}'
        ]],
        ['@state(button) button, button .label {}', [
            'button.small, button.small .label {}',
            'button.medium, button.medium .label {}',
            'button.large, button.large .label {}'
        ]],
        ['@state(button) button, .label {}', [
            'button.small, .label {}',
            'button.medium, .label {}',
            'button.large, .label {}'
        ]],
        ['@state(button) :host button {}', [
            ':host button.small {}',
            ':host button.medium {}',
            ':host button.large {}'
        ]],
        ['@state(button) :host([dense]) button:has(.label) {}', [
            ':host([dense]) button.small:has(.label) {}',
            ':host([dense]) button.medium:has(.label) {}',
            ':host([dense]) button.large:has(.label) {}'
        ]],
        ['@state(button) slot::slotted(button) {}', [
            'slot::slotted(button.small) {}',
            'slot::slotted(button.medium) {}',
            'slot::slotted(button.large) {}'
        ]],
        ['@state(.card) .card {}', [
            '.card.small {}',
            '.card.medium {}',
            '.card.large {}'
        ]],
        ['@state(.card) .card .label {}', [
            '.card.small .label {}',
            '.card.medium .label {}',
            '.card.large .label {}'
        ]],
        ['@state([selected]) button[selected] {}', [
            'button[selected].small {}',
            'button[selected].medium {}',
            'button[selected].large {}'
        ]],
        ['@state(button:hover) button:hover .label {}', [
            'button:hover.small .label {}',
            'button:hover.medium .label {}',
            'button:hover.large .label {}'
        ]],
        ['@state(button::before) button::before {}', [
            'button.small::before {}',
            'button.medium::before {}',
            'button.large::before {}'
        ]],
        ['@state(button::after) button::after {}', [
            'button.small::after {}',
            'button.medium::after {}',
            'button.large::after {}'
        ]],
        // R3/R4 子串安全：函数参数、连字前缀、属性值内不匹配
        ['@state(button) button:has(button) {}', [
            'button.small:has(button) {}',
            'button.medium:has(button) {}',
            'button.large:has(button) {}'
        ]],
        ['@state(button) button:is(button, .label) {}', [
            'button.small:is(button, .label) {}',
            'button.medium:is(button, .label) {}',
            'button.large:is(button, .label) {}'
        ]],
        ['@state(button) button:where(button) {}', [
            'button.small:where(button) {}',
            'button.medium:where(button) {}',
            'button.large:where(button) {}'
        ]],
        ['@state(button) button:not(button) {}', [
            'button.small:not(button) {}',
            'button.medium:not(button) {}',
            'button.large:not(button) {}'
        ]],
        ['@state(button) .button-label button {}', [
            '.button-label button.small {}',
            '.button-label button.medium {}',
            '.button-label button.large {}'
        ]],
        ['@state(button) .container button[data-wow="button"]>.label {}', [
            '.container button.small[data-wow="button"]>.label {}',
            '.container button.medium[data-wow="button"]>.label {}',
            '.container button.large[data-wow="button"]>.label {}'
        ]],
        // R6 壳内并列
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
        // R7 单独 & 丢弃
        ['button { @state(button) & {} }', 'button {}'],
        ['.wrapper { @state(button) &.active button {} }', '.wrapper { &.active button.small {} &.active button.medium {} &.active button.large {} }'],
        ['.wrapper { @state(button) & button {} }', '.wrapper { & button.small {} & button.medium {} & button.large {} }'],
        ['.wrapper { @state(button.show[selected]) button.show[selected].foo {} }', '.wrapper { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],
        ['.wrapper { @state(button) button {}; @state(.card) .card {} }', '.wrapper { button.small {} button.medium {} button.large {} .card.small {} .card.medium {} .card.large {} }'],
        // R5 部分分支保留
        ['.wrapper { @state(button) button, button .label {} }', '.wrapper { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        ['.wrapper { @state(button) button, .label {} }', '.wrapper { button.small, .label {} button.medium, .label {} button.large, .label {} }'],
        // R2 多处匹配全部替换
        ['.wrapper { @state(button) button ~ button {} }', '.wrapper { button.small ~ button.small {} button.medium ~ button.medium {} button.large ~ button.large {} }'],
        ['.wrapper { @state(button) button~button {} }', '.wrapper { button.small~button.small {} button.medium~button.medium {} button.large~button.large {} }'],
        ['.wrapper { @state(button) button~ button {} }', '.wrapper { button.small~ button.small {} button.medium~ button.medium {} button.large~ button.large {} }'],
        ['.wrapper { @state(button) button ~button {} }', '.wrapper { button.small ~button.small {} button.medium ~button.medium {} button.large ~button.large {} }'],
        ['@state(button) button { color: var(--_color); }', [
            'button.medium { color: var(--_medium-color); }',
            'button.large { color: var(--_large-color); }'
        ]],
        ['@state(button) button { width: var(--_width); }', [
            'button.small { width: var(--_small-width); }',
            'button.medium { width: var(--_medium-width); }',
            'button.large { width: var(--_large-width); }'
        ]],
        ['@state(button) button { color: var(--_color); width: var(--_width); }', [
            'button.small { width: var(--_small-width); }',
            'button.medium { color: var(--_medium-color); width: var(--_medium-width); }',
            'button.large { color: var(--_large-color); width: var(--_large-width); }'
        ]],
    ]

    /**
     * 红队：R1 缺 selector/target [D]；R8 全零匹配 [D]。R3/R4/R5 展开形见绿队。
     */
    const redMapping: MappingRow = [
        // R1 缺 selector/target
        ['@state(button) { color: red; }', ''],
        ['@state() { color: red; }', ''],
        // R8 全零匹配
        ['@state(button) .card { color: red; }', ''],
        ['@state() button { color: red; }', ''],
        ['@state[] .a { color: red; }', ''],
        ['@state { color: red; }', ''],
        ['@state .a { color: red; }', ''],
        ['@state () { color: red; }', ''],
        ['@state .a (.a) { color: red; }', ''],
        ['@state .a () { color: red; }', ''],
        // R8 嵌套外层零匹配
        ['@state(button) .container { button:has(.label) {} }', ''],
        ['@state(button) .container { &button:has(.label) {} }', ''],
        ['@state(button) .container { button:has(.label) { .label {} } }', ''],
        ['@state(button.show) .container { button.show.ahaha.hummm {} }', ''],
        ['@state(button) .wrap { button:not(.a):not([disabled]) {} }', ''],
        ['@state(button) .wrap { &button:not(.a):not([disabled]) {} }', ''],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
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
     * :host（沿用 R1–R8）：enabled 原样；hovered 挂 :host（:host(:hover)）；disabled 另起 :host([...]) 壳。
     * H1 壳分裂；H2 零 &；H3 括号内合并；H4 :is/:where 包裹 :host 按分支合并。
     */
    const greenMapping: MappingRow = [
        ['@state(:host) :host {}', [
            ':host {}', ':host(:hover) {}', ':host([disabled]) {}'
        ]],
        ['@state(:host) :host .label {}', [
            ':host .label {}', ':host(:hover) .label {}', ':host([disabled]) .label {}'
        ]],
        ['@state(:host) :host > .container {}', [
            ':host > .container {}', ':host(:hover) > .container {}', ':host([disabled]) > .container {}'
        ]],
        ['@state(:host) :host .a .b {}', [
            ':host .a .b {}', ':host(:hover) .a .b {}', ':host([disabled]) .a .b {}'
        ]],
        ['@state(:host) :host .a ~ .b {}', [
            ':host .a ~ .b {}', ':host(:hover) .a ~ .b {}', ':host([disabled]) .a ~ .b {}'
        ]],
        ['@state(:host) :host(.active) {}', [
            ':host(.active) {}', ':host(.active:hover) {}', ':host(.active[disabled]) {}'
        ]],
        ['@state(:host) :host([dense]) {}', [
            ':host([dense]) {}', ':host([dense]:hover) {}', ':host([dense][disabled]) {}'
        ]],
        ['@state(:host) :host([variant="filled"]) {}', [
            ':host([variant="filled"]) {}', ':host([variant="filled"]:hover) {}', ':host([variant="filled"][disabled]) {}'
        ]],
        ['@state(:host) :host(.a.b) {}', [
            ':host(.a.b) {}', ':host(.a.b:hover) {}', ':host(.a.b[disabled]) {}'
        ]],
        ['@state(:host) :host([a][b="c"]) {}', [
            ':host([a][b="c"]) {}', ':host([a][b="c"]:hover) {}', ':host([a][b="c"][disabled]) {}'
        ]],
        ['@state(:host) :host([v="x" i]) {}', [
            ':host([v="x" i]) {}', ':host([v="x" i]:hover) {}', ':host([v="x" i][disabled]) {}'
        ]],
        ['@state(:host) :host(.active) .label {}', [
            ':host(.active) .label {}', ':host(.active:hover) .label {}', ':host(.active[disabled]) .label {}'
        ]],
        ['@state(:host) :host([dense]) > .container {}', [
            ':host([dense]) > .container {}', ':host([dense]:hover) > .container {}', ':host([dense][disabled]) > .container {}'
        ]],
        ['@state(:host) :host(:not(.a)) {}', [
            ':host(:not(.a)) {}', ':host(:not(.a):hover) {}', ':host(:not(.a)[disabled]) {}'
        ]],
        ['@state(:host) :host(:not(.a):not([b])) {}', [
            ':host(:not(.a):not([b])) {}', ':host(:not(.a):not([b]):hover) {}', ':host(:not(.a):not([b])[disabled]) {}'
        ]],
        ['@state(:host) :host(:is(.a,.b)) {}', [
            ':host(:is(.a,.b)) {}', ':host(:is(.a,.b):hover) {}', ':host(:is(.a,.b)[disabled]) {}'
        ]],
        ['@state(:host) :host(:where(.a)) {}', [
            ':host(:where(.a)) {}', ':host(:where(.a):hover) {}', ':host(:where(.a)[disabled]) {}'
        ]],
        ['@state(:host) :host(:has(.label)) {}', [
            ':host(:has(.label)) {}', ':host(:has(.label):hover) {}', ':host(:has(.label)[disabled]) {}'
        ]],
        ['@state(:host) :host(:focus-visible) {}', [
            ':host(:focus-visible) {}', ':host(:focus-visible:hover) {}', ':host(:focus-visible[disabled]) {}'
        ]],
        ['@state(:host) :host(:first-child) {}', [
            ':host(:first-child) {}', ':host(:first-child:hover) {}', ':host(:first-child[disabled]) {}'
        ]],
        ['@state(:host) :host(:empty) {}', [
            ':host(:empty) {}', ':host(:empty:hover) {}', ':host(:empty[disabled]) {}'
        ]],
        // R3 属性值内不匹配
        ['@state(:host) :host[data-label=":host"] {}', [
            ':host[data-label=":host"] {}', ':host[data-label=":host"]:hover {}', ':host[data-label=":host"][disabled] {}'
        ]],
        // R5
        ['@state(:host) :host(.a), :host(.b) {}', [
            ':host(.a), :host(.b) {}', ':host(.a:hover), :host(.b:hover) {}', ':host(.a[disabled]), :host(.b[disabled]) {}'
        ]],
        ['@state(:host) :host, .label {}', [
            ':host, .label {}', ':host(:hover), .label {}', ':host([disabled]), .label {}'
        ]],
        // H4
        ['@state(:where(:host)) :where(:host) {}', [
            ':where(:host) {}', ':where(:host(:hover)) {}', ':where(:host([disabled])) {}'
        ]],
        ['@state(:is(:host)) :is(:host) {}', [
            ':is(:host) {}', ':is(:host(:hover)) {}', ':is(:host([disabled])) {}'
        ]],
        ['@state(:where(:host([a]), :host([b]))) :where(:host([a]), :host([b])) {}', [
            ':where(:host([a]), :host([b])) {}', ':where(:host([a]:hover), :host([b]:hover)) {}', ':where(:host([a][disabled]), :host([b][disabled])) {}'
        ]],
        ['@state(:is(:host(.a), :host([b]))) :is(:host(.a), :host([b])) {}', [
            ':is(:host(.a), :host([b])) {}', ':is(:host(.a:hover), :host([b]:hover)) {}', ':is(:host(.a[disabled]), :host([b][disabled])) {}'
        ]],
        ['@state(:where(:host)) :where(:host) .label {}', [
            ':where(:host) .label {}', ':where(:host(:hover)) .label {}', ':where(:host([disabled])) .label {}'
        ]],
        ['@state(:where(:host([variant="x"]), :host(:has(.x)))) :where(:host([variant="x"]), :host(:has(.x))) {}', [
            ':where(:host([variant="x"]), :host(:has(.x))) {}', ':where(:host([variant="x"]:hover), :host(:has(.x):hover)) {}', ':where(:host([variant="x"][disabled]), :host(:has(.x)[disabled])) {}'
        ]],
        // R6 壳内并列
        ['@state(:host) :host { .label {} }', [
            ':host { .label {} }', ':host(:hover) { .label {} }', ':host([disabled]) { .label {} }'
        ]],
        ['@state(:host) :host(.active) { .label {} }', [
            ':host(.active) { .label {} }', ':host(.active:hover) { .label {} }', ':host(.active[disabled]) { .label {} }'
        ]],
        // H1 壳分裂
        [':host { @state(button) button {} }', ':host { button {} button:hover {} } :host([disabled]) { button {} }'],
        [':host([dense]) { @state(button) button .label {} }', ':host([dense]) { button .label {} button:hover .label {} } :host([dense][disabled]) { button .label {} }'],
        [':host(:not(.a)) { @state(button) button {} }', ':host(:not(.a)) { button {} button:hover {} } :host(:not(.a)[disabled]) { button {} }'],
        [':host { .wrapper { @state(button) button {} } }', ':host { .wrapper { button {} button:hover {} } } :host([disabled]) { .wrapper { button {} } }'],
        [':host { @state(button) button, button .label {} }', ':host { button, button .label {} button:hover, button:hover .label {} } :host([disabled]) { button, button .label {} }'],
        [':host { @state(button) button {}; @state(.card) .card {} }', ':host { button {} button:hover {} .card {} .card:hover {} } :host([disabled]) { button {} .card {} }'],
        [':where(:host) { @state(button) button {} }', ':where(:host) { button {} button:hover {} } :where(:host([disabled])) { button {} }'],

    ]

    /**
     * 红队：R8 [D]。
     */
    const redMapping: MappingRow = [
        ['@state(:host) .label {}', ''],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
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
     * combo（沿用 R1–R8）：状态挂 @state(target) 上，不跳到 :host。
     * 展开顺序固定：[medium,enabled] → [medium,disabled] → [large,enabled] → [large,disabled]。
     */
    const greenMapping: MappingRow = [
        ['@state(button) button {}', ['button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}']],
        ['@state(button) button .label {}', ['button.medium .label {}', 'button.medium[disabled] .label {}', 'button.large .label {}', 'button.large[disabled] .label {}']],
        ['@state(button) button:has(.label) {}', ['button.medium:has(.label) {}', 'button.medium[disabled]:has(.label) {}', 'button.large:has(.label) {}', 'button.large[disabled]:has(.label) {}']],
        ['@state(button) .container>button:has(.label)>.label {}', ['.container>button.medium:has(.label)>.label {}', '.container>button.medium[disabled]:has(.label)>.label {}', '.container>button.large:has(.label)>.label {}', '.container>button.large[disabled]:has(.label)>.label {}']],
        ['@state(button.show) button.show.foo {}', ['button.show.medium.foo {}', 'button.show.medium[disabled].foo {}', 'button.show.large.foo {}', 'button.show.large[disabled].foo {}']],
        ['@state(button.show[selected]) button.show[selected].foo {}', ['button.show[selected].medium.foo {}', 'button.show[selected].medium[disabled].foo {}', 'button.show[selected].large.foo {}', 'button.show[selected].large[disabled].foo {}']],
        ['@state(button) button:is(.icon,.label) {}', ['button.medium:is(.icon,.label) {}', 'button.medium[disabled]:is(.icon,.label) {}', 'button.large:is(.icon,.label) {}', 'button.large[disabled]:is(.icon,.label) {}']],
        ['@state(button) :host button {}', [':host button.medium {}', ':host button.medium[disabled] {}', ':host button.large {}', ':host button.large[disabled] {}']],
        ['@state(:host) :host {}', [':host(.medium) {}', ':host(.medium[disabled]) {}', ':host(.large) {}', ':host(.large[disabled]) {}']],
        ['@state(:host) :host .label {}', [':host(.medium) .label {}', ':host(.medium[disabled]) .label {}', ':host(.large) .label {}', ':host(.large[disabled]) .label {}']],
        ['@state(button) button[type="submit"] {}', ['button.medium[type="submit"] {}', 'button.medium[disabled][type="submit"] {}', 'button.large[type="submit"] {}', 'button.large[disabled][type="submit"] {}']],
        ['@state(button) button[class*="btn-"] {}', ['button.medium[class*="btn-"] {}', 'button.medium[disabled][class*="btn-"] {}', 'button.large[class*="btn-"] {}', 'button.large[disabled][class*="btn-"] {}']],
        ['@state(button) button::before {}', ['button.medium::before {}', 'button.medium[disabled]::before {}', 'button.large::before {}', 'button.large[disabled]::before {}']],
        ['@state(#submit) #submit {}', ['#submit.medium {}', '#submit.medium[disabled] {}', '#submit.large {}', '#submit.large[disabled] {}']],
        ['@state(*) * {}', ['*.medium {}', '*.medium[disabled] {}', '*.large {}', '*.large[disabled] {}']],
        // R5
        ['@state(button) button, button .label {}', ['button.medium, button.medium .label {}', 'button.medium[disabled], button.medium[disabled] .label {}', 'button.large, button.large .label {}', 'button.large[disabled], button.large[disabled] .label {}']],
        ['@state(button) button, .label {}', ['button.medium, .label {}', 'button.medium[disabled], .label {}', 'button.large, .label {}', 'button.large[disabled], .label {}']],
        // R3 子串安全
        ['@state(button) button:has(button) {}', ['button.medium:has(button) {}', 'button.medium[disabled]:has(button) {}', 'button.large:has(button) {}', 'button.large[disabled]:has(button) {}']],
        ['@state(button) .container button[data-x="button"] {}', ['.container button.medium[data-x="button"] {}', '.container button.medium[disabled][data-x="button"] {}', '.container button.large[data-x="button"] {}', '.container button.large[disabled][data-x="button"] {}']],
        // R6 壳内并列
        ['@state(button) button { .label {} }', ['button.medium { .label {} }', 'button.medium[disabled] { .label {} }', 'button.large { .label {} }', 'button.large[disabled] { .label {} }']],
        ['.wrapper { @state(button) button {} }', '.wrapper { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],
        ['.wrapper { @state(button) button .label {} }', '.wrapper { button.medium .label {} button.medium[disabled] .label {} button.large .label {} button.large[disabled] .label {} }'],
        [':host { @state(button) button {} }', ':host { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} }'],

    ]

    /**
     * 红队：R1/R8 [D]。
     */
    const redMapping: MappingRow = [
        ['@state(button) { color: red; }', ''],
        ['@state(button) .card { color: red; }', ''],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(ComboDef, input, { registry: ComboTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(ComboDef, input, { registry: ComboTriggers })
            expect(canonical(output)).toBe(canonical(expected))
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
     * custom-state：S1 挂元素；S2 挂 :host 合入括号；S3 与 @when 协同提升。
     */
    const greenMapping: MappingRow = [
        ['@state(button) button {}', ['button {}', 'button:state(checked) {}', 'button:state(disabled) {}']],
        ['@state(button) button .label {}', ['button .label {}', 'button:state(checked) .label {}', 'button:state(disabled) .label {}']],
        ['@state(:host) :host {}', [':host {}', ':host(:state(checked)) {}', ':host(:state(disabled)) {}']],
        ['@state(:host) :host([dense]) {}', [':host([dense]) {}', ':host([dense]:state(checked)) {}', ':host([dense]:state(disabled)) {}']],
        ['@when(:host(:state(checked))) { button {} }', ':host(:state(checked)) { button {} }'],
        ['.container { button { @when(:host(:state(checked))) { color: red; } } }', '.container { button {} } :host(:state(checked)) { .container { button { color: red; } } }'],
    ]

    /**
     * 红队：R8 [D]；W1 非 host 条件保留嵌套。
     */
    const redMapping: MappingRow = [
        ['@state(button) .card { color: red; }', ''],
        ['.card { @when(.dense) { padding: 4px; } }', '.card { .dense { padding: 4px; } }'],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(StateDef, input, { registry: StateTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(StateDef, input, { registry: StateTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

describe('empty-emission', () => {
    const SmlSchema = defineSchema(['s', 'm', 'l'] as const)
    const NullBaseDef = createStyleDefinition(SmlSchema)({
        'size': [null, '12px', '14px'],
    })
    const NullBaseTriggers = mapStateTriggers({
        's': '.s',
        'm': '.m',
        'l': '.l',
    })
    const StaticDef = createStyleDefinition(SmlSchema)({
        'color': '#6750a4',
    })

    /**
     * 发射规则：空 body 且该 state 无定义者不发射；有内容恒发射；纯静态 def 全量发射。
     */
    const greenMapping: MappingRow = [
        ['@state(.btn) .btn {}', ['.btn.m {}', '.btn.l {}']],
        ['.container { @state(.btn) .btn {} }', '.container { .btn.m {} .btn.l {} }'],
        ['@state(.btn) .btn { width: var(--_size); }', ['.btn.m { width: var(--_m-size); }', '.btn.l { width: var(--_l-size); }']],
    ]

    const redMapping: MappingRow = []

    it('green: empty body + null base emits only defined states', () => {
        const output = compileStateSheet(NullBaseDef, '@state(.btn) .btn {}', { registry: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m {}', '.btn.l {}']))
    })

    it('green: nested empty body respects outer shell', () => {
        const output = compileStateSheet(NullBaseDef, '.container { @state(.btn) .btn {} }', { registry: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical('.container { .btn.m {} .btn.l {} }'))
    })

    it('green: filtered-empty body is not emitted', () => {
        const output = compileStateSheet(NullBaseDef, '@state(.btn) .btn { width: var(--_size); }', { registry: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m { width: var(--_m-size); }', '.btn.l { width: var(--_l-size); }']))
    })

    it('green: static-only def still emits all shells', () => {
        const output = compileStateSheet(StaticDef, '@state(.btn) .btn {}', { registry: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.s {}', '.btn.m {}', '.btn.l {}']))
    })

    it('green: combo members without definition are not emitted', () => {
        const ComboNullSchema = defineSchema([['m', 'l'], ['enabled', 'disabled']] as const)
        const ComboNullDef = createStyleDefinition(ComboNullSchema)({
            'size': { 'm': '12px' },
            'opacity': { 'enabled': '1', 'disabled': '0.38' },
        })
        const ComboNullTriggers = mapStateTriggers({
            'm': '.m',
            'l': '.l',
            'enabled': '',
            'disabled': '[disabled]',
        })
        const output = compileStateSheet(ComboNullDef, '@state(.btn) .btn {}', { registry: ComboNullTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m {}', '.btn.m[disabled] {}']))
    })

    it('green: host split shell without definition is not emitted', () => {
        const HostNullSchema = defineSchema(['enabled', 'disabled'] as const)
        const HostNullDef = createStyleDefinition(HostNullSchema)({
            'opacity': ['1', null],
        })
        const HostNullTriggers = mapStateTriggers({
            'enabled': '',
            'disabled': '[disabled]',
        })
        const output = compileStateSheet(HostNullDef, ':host { @state(button) button {} }', { registry: HostNullTriggers })
        expect(canonical(output)).toBe(canonical(':host { button {} }'))
    })

    for (const [input, expected] of greenMapping) {
        it(`green-table: ${input}`, () => {
            const output = compileStateSheet(NullBaseDef, input, { registry: NullBaseTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(NullBaseDef, input, { registry: NullBaseTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})
