/**
 * @version 2026.9.9
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import type { StateDimensionItem } from '../rewrite-state-variables'
import {
    canonicalHandlerResult,
    echoRecurse,
    fakeBaseCtx
} from './spec-fakes'
import { handleStateBlock } from './transform-state'

type StateRow = readonly [header: string, body: string, ancestors: readonly string[], expected: string]

type StateMapping = ReadonlyArray<StateRow>

const joinExpected = (rules: readonly string[]): string => rules.join(' ')

describe('@state: small, medium, .large', () => {
    const sizeStates: readonly StateDimensionItem[] = [
        { name: 'small', modifier: '.small', target: 'self' },
        { name: 'medium', modifier: '.medium', target: 'self' },
        { name: 'large', modifier: '.large', target: 'self' }
    ]
    const sizeCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: sizeStates,
        isCombo: false,
        ancestorPath: ancestors
    })

    const greenMapping: StateMapping = [
        // 選擇器與目標完全命中
        ['@state(button) button', '', [], joinExpected(['button.small {}', 'button.medium {}', 'button.large {}'])],
        ['@state(button) button .label', '', [], joinExpected(['button.small .label {}', 'button.medium .label {}', 'button.large .label {}'])],
        ['@state(button) button :is(.icon, .label)', '', [], joinExpected([
            'button.small :is(.icon, .label) {}',
            'button.medium :is(.icon, .label) {}',
            'button.large :is(.icon, .label) {}'
        ])],
        // state不做額外魔法，保留結構
        ['@state(button) button', ':is(.icon, .label) {}', [], joinExpected([
            'button.small { :is(.icon, .label) {} }',
            'button.medium { :is(.icon, .label) {} }',
            'button.large { :is(.icon, .label) {} }'
        ])],
        ['@state(button) button', '&:is(.icon, .label) {}', [], joinExpected([
            'button.small { &:is(.icon, .label) {} }',
            'button.medium { &:is(.icon, .label) {} }',
            'button.large { &:is(.icon, .label) {} }'
        ])],
        // 尾插 canonical：短 target 時 state 掛 compound-pre 尾（函數塊之後、:: 之前），如 button:is().small
        ['@state(button) button:is(.icon, .label)', '', [], joinExpected([
            'button:is(.icon, .label).small {}',
            'button:is(.icon, .label).medium {}',
            'button:is(.icon, .label).large {}'
        ])],
        ['@state(button) button:has(.label)', '', [], joinExpected([
            'button:has(.label).small {}',
            'button:has(.label).medium {}',
            'button:has(.label).large {}'
        ])],
        // button匹配不到[type="button"]上。
        ['@state(button) button[type="button"]', '', [], joinExpected([
            'button[type="button"].small {}', 'button[type="button"].medium {}', 'button[type="button"].large {}'
        ])],
        // 目標并不是總在第一個
        ['@state(button) .container button:has(.label) .label', '', [], joinExpected([
            '.container button:has(.label).small .label {}',
            '.container button:has(.label).medium .label {}',
            '.container button:has(.label).large .label {}'
        ])],
        ['@state(button) &button:has(.label)', '.label {}', ['.container'], joinExpected([
            '&button:has(.label).small { .label {} }',
            '&button:has(.label).medium { .label {} }',
            '&button:has(.label).large { .label {} }'
        ])],
        ['@state(button) .container>button:has(.label)>.label', '', [], joinExpected([
            '.container>button:has(.label).small>.label {}',
            '.container>button:has(.label).medium>.label {}',
            '.container>button:has(.label).large>.label {}'
        ])],
        ['@state(button) .container[show]>button:has(.label)>.label', '', [], joinExpected([
            '.container[show]>button:has(.label).small>.label {}',
            '.container[show]>button:has(.label).medium>.label {}',
            '.container[show]>button:has(.label).large>.label {}'
        ])],
        ['@state(button) .container[show="true"]>button:has(.label)>.label', '', [], joinExpected([
            '.container[show="true"]>button:has(.label).small>.label {}',
            '.container[show="true"]>button:has(.label).medium>.label {}',
            '.container[show="true"]>button:has(.label).large>.label {}'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg:disabled {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button:has(.label).small>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button:has(.label).medium>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button:has(.label).large>.label { .text-bg:disabled {} }'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg[disabled] {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button:has(.label).small>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button:has(.label).medium>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button:has(.label).large>.label { .text-bg[disabled] {} }'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg[disabled="true"] {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button:has(.label).small>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button:has(.label).medium>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button:has(.label).large>.label { .text-bg[disabled="true"] {} }'
        ])],
        // 目標并不總是簡單選擇器
        ['@state(button.show) button.show.ahaha.hummm', '', [], joinExpected([
            'button.show.small.ahaha.hummm {}',
            'button.show.medium.ahaha.hummm {}',
            'button.show.large.ahaha.hummm {}'
        ])],
        ['@state(button.show) .container > button.show.ahaha.hummm', '', [], joinExpected([
            '.container > button.show.small.ahaha.hummm {}',
            '.container > button.show.medium.ahaha.hummm {}',
            '.container > button.show.large.ahaha.hummm {}'
        ])],
        ['@state(button.show) button.show.ahaha.hummm', '', ['.container'], joinExpected([
            'button.show.small.ahaha.hummm {}',
            'button.show.medium.ahaha.hummm {}',
            'button.show.large.ahaha.hummm {}'
        ])],
        ['@state(button.show) button.show.ahaha.hummm .label', '', [], joinExpected([
            'button.show.small.ahaha.hummm .label {}',
            'button.show.medium.ahaha.hummm .label {}',
            'button.show.large.ahaha.hummm .label {}'
        ])],
        ['@state(button.show) button.show.ahaha.hummm button.label .show button', '', [], joinExpected([
            'button.show.small.ahaha.hummm button.label .show button {}',
            'button.show.medium.ahaha.hummm button.label .show button {}',
            'button.show.large.ahaha.hummm button.label .show button {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small.ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm .label', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small.ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm .label {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"].ahaha.hummm button.label .show button', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small.ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].medium.ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].large.ahaha.hummm button.label .show button {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm .label', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm .label {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm .label {}'
        ])],
        ['@state(button.show[selected][data-wow="yes"]) button.show[selected][data-wow="yes"]:has(dialog[open]).ahaha.hummm button.label .show button', '', [], joinExpected([
            'button.show[selected][data-wow="yes"].small:has(dialog[open]).ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].medium:has(dialog[open]).ahaha.hummm button.label .show button {}',
            'button.show[selected][data-wow="yes"].large:has(dialog[open]).ahaha.hummm button.label .show button {}'
        ])],
        // 目標還可以是ID選擇器
        ['@state(#submit) #submit', '', [], joinExpected(['#submit.small {}', '#submit.medium {}', '#submit.large {}'])],
        ['@state(#submit) #submit .label', '', [], joinExpected(['#submit.small .label {}', '#submit.medium .label {}', '#submit.large .label {}'])],
        // 目標也可以是全選選擇器
        // 不要把CSS的`*`視作Regex的`*`,CSS的`*`視作`匹配範圍内的所有元素`
        ['@state(*) *', '', [], joinExpected(['*.small {}', '*.medium {}', '*.large {}'])],
        ['@state(*) * .label', '', [], joinExpected(['*.small .label {}', '*.medium .label {}', '*.large .label {}'])],
        ['@state(*) .wrap * .label', '', [], joinExpected(['.wrap *.small .label {}', '.wrap *.medium .label {}', '.wrap *.large .label {}'])],
        ['@state(button) button#submit', '', [], joinExpected([
            'button#submit.small {}', 'button#submit.medium {}', 'button#submit.large {}'
        ])],
        ['@state(button) button#submit.primary', '', [], joinExpected([
            'button#submit.primary.small {}', 'button#submit.primary.medium {}', 'button#submit.primary.large {}'
        ])],
        ['@state(button#submit) button#submit.primary', '', [], joinExpected([
            'button#submit.small.primary {}', 'button#submit.medium.primary {}', 'button#submit.large.primary {}'
        ])],
        ['@state(button) * button', '', [], joinExpected(['* button.small {}', '* button.medium {}', '* button.large {}'])],
        ['@state(button) .container .label button', '', [], joinExpected([
            '.container .label button.small {}', '.container .label button.medium {}', '.container .label button.large {}'
        ])],
        ['@state(button) button[type="submit"]', '', [], joinExpected([
            'button[type="submit"].small {}', 'button[type="submit"].medium {}', 'button[type="submit"].large {}'
        ])],
        ['@state(button) button[type=\'submit\']', '', [], joinExpected([
            'button[type=\'submit\'].small {}', 'button[type=\'submit\'].medium {}', 'button[type=\'submit\'].large {}'
        ])],
        ['@state(button) button[title~="word"]', '', [], joinExpected([
            'button[title~="word"].small {}', 'button[title~="word"].medium {}', 'button[title~="word"].large {}'
        ])],
        ['@state(button) button[lang|="en"]', '', [], joinExpected([
            'button[lang|="en"].small {}', 'button[lang|="en"].medium {}', 'button[lang|="en"].large {}'
        ])],
        ['@state(button) button[href^="https"]', '', [], joinExpected([
            'button[href^="https"].small {}', 'button[href^="https"].medium {}', 'button[href^="https"].large {}'
        ])],
        ['@state(button) button[href$=".pdf"]', '', [], joinExpected([
            'button[href$=".pdf"].small {}', 'button[href$=".pdf"].medium {}', 'button[href$=".pdf"].large {}'
        ])],
        ['@state(button) button[class*="btn-"]', '', [], joinExpected([
            'button[class*="btn-"].small {}', 'button[class*="btn-"].medium {}', 'button[class*="btn-"].large {}'
        ])],
        ['@state(button) button[data-wow="yes" i]', '', [], joinExpected([
            'button[data-wow="yes" i].small {}', 'button[data-wow="yes" i].medium {}', 'button[data-wow="yes" i].large {}'
        ])],
        ['@state(button) button[data-label="button"]', '', [], joinExpected([
            'button[data-label="button"].small {}', 'button[data-label="button"].medium {}', 'button[data-label="button"].large {}'
        ])],
        ['@state(button) button:hover', '', [], joinExpected([
            'button:hover.small {}', 'button:hover.medium {}', 'button:hover.large {}'
        ])],
        ['@state(button) button:focus-visible', '', [], joinExpected([
            'button:focus-visible.small {}', 'button:focus-visible.medium {}', 'button:focus-visible.large {}'
        ])],
        ['@state(button) button:active', '', [], joinExpected([
            'button:active.small {}', 'button:active.medium {}', 'button:active.large {}'
        ])],
        ['@state(button) button:hover:active', '', [], joinExpected([
            'button:hover:active.small {}', 'button:hover:active.medium {}', 'button:hover:active.large {}'
        ])],
        ['@state(button) button:disabled', '', [], joinExpected([
            'button:disabled.small {}', 'button:disabled.medium {}', 'button:disabled.large {}'
        ])],
        ['@state(button) button:checked', '', [], joinExpected([
            'button:checked.small {}', 'button:checked.medium {}', 'button:checked.large {}'
        ])],
        ['@state(button) button:hover:focus-visible', '', [], joinExpected([
            'button:hover:focus-visible.small {}', 'button:hover:focus-visible.medium {}', 'button:hover:focus-visible.large {}'
        ])],
        ['@state(button) button:not(.disabled)', '', [], joinExpected([
            'button:not(.disabled).small {}', 'button:not(.disabled).medium {}', 'button:not(.disabled).large {}'
        ])],
        ['@state(button) button:not([disabled])', '', [], joinExpected([
            'button:not([disabled]).small {}', 'button:not([disabled]).medium {}', 'button:not([disabled]).large {}'
        ])],
        ['@state(button) button:not([disabled="true"])', '', [], joinExpected([
            'button:not([disabled="true"]).small {}', 'button:not([disabled="true"]).medium {}', 'button:not([disabled="true"]).large {}'
        ])],
        ['@state(button) button:not([disabled="false"])', '', [], joinExpected([
            'button:not([disabled="false"]).small {}', 'button:not([disabled="false"]).medium {}', 'button:not([disabled="false"]).large {}'
        ])],
        ['@state(button) button:not(.a):not([disabled])', '', [], joinExpected([
            'button:not(.a):not([disabled]).small {}', 'button:not(.a):not([disabled]).medium {}', 'button:not(.a):not([disabled]).large {}'
        ])],
        ['@state(button) .wrap button:not(.a):not([disabled])', '', [], joinExpected([
            '.wrap button:not(.a):not([disabled]).small {}',
            '.wrap button:not(.a):not([disabled]).medium {}',
            '.wrap button:not(.a):not([disabled]).large {}'
        ])],
        ['@state(button) button:not(.a):not([disabled])', '', ['.wrap'], joinExpected([
            'button:not(.a):not([disabled]).small {}',
            'button:not(.a):not([disabled]).medium {}',
            'button:not(.a):not([disabled]).large {}'
        ])],
        ['@state(button) &button:not(.a):not([disabled])', '', ['.wrap'], joinExpected([
            '&button:not(.a):not([disabled]).small {}',
            '&button:not(.a):not([disabled]).medium {}',
            '&button:not(.a):not([disabled]).large {}'
        ])],
        ['@state(button) button:where(.icon, .label)', '', [], joinExpected([
            'button:where(.icon, .label).small {}',
            'button:where(.icon, .label).medium {}',
            'button:where(.icon, .label).large {}'
        ])],
        ['@state(button) button', ':where(.icon, .label) {}', [], joinExpected([
            'button.small { :where(.icon, .label) {} }',
            'button.medium { :where(.icon, .label) {} }',
            'button.large { :where(.icon, .label) {} }'
        ])],
        ['@state(button) button', '&:where(.icon, .label) {}', [], joinExpected([
            'button.small { &:where(.icon, .label) {} }',
            'button.medium { &:where(.icon, .label) {} }',
            'button.large { &:where(.icon, .label) {} }'
        ])],
        ['@state(button) button:is(:hover, :focus-visible)', '', [], joinExpected([
            'button:is(:hover, :focus-visible).small {}',
            'button:is(:hover, :focus-visible).medium {}',
            'button:is(:hover, :focus-visible).large {}'
        ])],
        ['@state(button) button:first-child', '', [], joinExpected([
            'button:first-child.small {}', 'button:first-child.medium {}', 'button:first-child.large {}'
        ])],
        ['@state(button) button:last-child', '', [], joinExpected([
            'button:last-child.small {}', 'button:last-child.medium {}', 'button:last-child.large {}'
        ])],
        ['@state(button) button:only-child', '', [], joinExpected([
            'button:only-child.small {}', 'button:only-child.medium {}', 'button:only-child.large {}'
        ])],
        ['@state(button) button:nth-child(2n+1)', '', [], joinExpected([
            'button:nth-child(2n+1).small {}', 'button:nth-child(2n+1).medium {}', 'button:nth-child(2n+1).large {}'
        ])],
        ['@state(button) button:nth-of-type(odd)', '', [], joinExpected([
            'button:nth-of-type(odd).small {}', 'button:nth-of-type(odd).medium {}', 'button:nth-of-type(odd).large {}'
        ])],
        ['@state(button) button:empty', '', [], joinExpected([
            'button:empty.small {}', 'button:empty.medium {}', 'button:empty.large {}'
        ])],
        ['@state(button) button::before', '', [], joinExpected([
            'button.small::before {}', 'button.medium::before {}', 'button.large::before {}'
        ])],
        ['@state(button) button::after', '', [], joinExpected([
            'button.small::after {}', 'button.medium::after {}', 'button.large::after {}'
        ])],
        ['@state(button) button:hover::before', '', [], joinExpected([
            'button:hover.small::before {}', 'button:hover.medium::before {}', 'button:hover.large::before {}'
        ])],
        ['@state(button) button::marker', '', [], joinExpected([
            'button.small::marker {}', 'button.medium::marker {}', 'button.large::marker {}'
        ])],
        ['@state(button) button::selection', '', [], joinExpected([
            'button.small::selection {}', 'button.medium::selection {}', 'button.large::selection {}'
        ])],
        ['@state(button) button::first-letter', '', [], joinExpected([
            'button.small::first-letter {}', 'button.medium::first-letter {}', 'button.large::first-letter {}'
        ])],
        ['@state(button) button::first-line', '', [], joinExpected([
            'button.small::first-line {}', 'button.medium::first-line {}', 'button.large::first-line {}'
        ])],
        ['@state(button) button::backdrop', '', [], joinExpected([
            'button.small::backdrop {}', 'button.medium::backdrop {}', 'button.large::backdrop {}'
        ])],
        ['@state(button) button::part(label)', '', [], joinExpected([
            'button.small::part(label) {}', 'button.medium::part(label) {}', 'button.large::part(label) {}'
        ])],
        ['@state(button) button ~ .label', '', [], joinExpected([
            'button.small ~ .label {}', 'button.medium ~ .label {}', 'button.large ~ .label {}'
        ])],
        ['@state(button) button~.label', '', [], joinExpected([
            'button.small~.label {}', 'button.medium~.label {}', 'button.large~.label {}'
        ])],
        ['@state(button) button+.label', '', [], joinExpected([
            'button.small+.label {}', 'button.medium+.label {}', 'button.large+.label {}'
        ])],
        ['@state(button) .container~button:has(.label)~.label', '', [], joinExpected([
            '.container~button:has(.label).small~.label {}',
            '.container~button:has(.label).medium~.label {}',
            '.container~button:has(.label).large~.label {}'
        ])],
        // 匹配到了就展開，并非只匹配一個，因爲匹配範圍就是SELECTOR。例如button.button#button:has(.button)可以匹配到兩個.button
        ['@state(.label) .container~button:has(.label)~.label', '', [], joinExpected([
            '.container~button:has(.label.small)~.label.small {}',
            '.container~button:has(.label.medium)~.label.medium {}',
            '.container~button:has(.label.large)~.label.large {}'
        ])],
        ['@state(button) button:has(button)', '', [], joinExpected([
            'button:has(button.small).small {}', 'button:has(button.medium).medium {}', 'button:has(button.large).large {}'
        ])],
        ['@state(button) button:is(button, .label)', '', [], joinExpected([
            'button:is(button.small, .label).small {}', 'button:is(button.medium, .label).medium {}', 'button:is(button.large, .label).large {}'
        ])],
        ['@state(button) button:where(button)', '', [], joinExpected([
            'button:where(button.small).small {}', 'button:where(button.medium).medium {}', 'button:where(button.large).large {}'
        ])],
        ['@state(button) button:not(button)', '', [], joinExpected([
            'button:not(button.small).small {}', 'button:not(button.medium).medium {}', 'button:not(button.large).large {}'
        ])],
        ['@state(button) button ~ button', '', [], joinExpected([
            'button.small ~ button.small {}', 'button.medium ~ button.medium {}', 'button.large ~ button.large {}'
        ])],
        ['@state(button) button + button', '', [], joinExpected([
            'button.small + button.small {}', 'button.medium + button.medium {}', 'button.large + button.large {}'
        ])],
        // 不對原始SELECTOR做過多修改，例如空格如何擺放。
        // 需要在判斷時trim TARGET和SELECTOR。例如button+ button需要把空格trim掉。當然僅限在判斷時trim。
        ['@state(button+button) button+button', '', [], joinExpected([
            'button+button.small {}', 'button+button.medium {}', 'button+button.large {}'
        ])],
        ['@state(button+ button) button+ button', '', [], joinExpected([
            'button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}'
        ])],
        ['@state(button+button) button+ button', '', [], joinExpected([
            'button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}'
        ])],
        ['@state(button +button) button+ button', '', [], joinExpected([
            'button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}'
        ])],
        ['@state(button + button) button+ button', '', [], joinExpected([
            'button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}'
        ])],
        ['@state(button + button) button + button', '', [], joinExpected([
            'button + button.small {}', 'button + button.medium {}', 'button + button.large {}'
        ])],
        ['@state(button) button ~ button', '', ['.wrapper'], joinExpected([
            'button.small ~ button.small {}', 'button.medium ~ button.medium {}', 'button.large ~ button.large {}'
        ])],
        ['@state(button) button~button', '', ['.wrapper'], joinExpected([
            'button.small~button.small {}', 'button.medium~button.medium {}', 'button.large~button.large {}'
        ])],
        ['@state(button) button~ button', '', ['.wrapper'], joinExpected([
            'button.small~ button.small {}', 'button.medium~ button.medium {}', 'button.large~ button.large {}'
        ])],
        ['@state(button) button ~button', '', ['.wrapper'], joinExpected([
            'button.small ~button.small {}', 'button.medium ~button.medium {}', 'button.large ~button.large {}'
        ])],
        // 只匹配SELECTOR，不匹配内部或其它的SELECTOR
        ['@state(button) button', '&+button {}', [], joinExpected([
            'button.small { &+button {} }', 'button.medium { &+button {} }', 'button.large { &+button {} }'
        ])],
        ['@state(td) col.selected || td', '', [], joinExpected([
            'col.selected || td.small {}', 'col.selected || td.medium {}', 'col.selected || td.large {}'
        ])],
        // 通過逗號排列的多個選擇器都歸state管
        ['@state(button) button, button .label', '', [], joinExpected([
            'button.small, button.small .label {}',
            'button.medium, button.medium .label {}',
            'button.large, button.large .label {}'
        ])],
        ['@state(button) button, .label', '', [], joinExpected([
            'button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}'
        ])],
        // 即使用戶編寫了:host button，匹配目標是button，不要擅自修改:host
        ['@state(button) :host button', '', [], joinExpected([
            ':host button.small {}', ':host button.medium {}', ':host button.large {}'
        ])],
        ['@state(button) :host([dense]) button:has(.label)', '', [], joinExpected([
            ':host([dense]) button:has(.label).small {}',
            ':host([dense]) button:has(.label).medium {}',
            ':host([dense]) button:has(.label).large {}'
        ])],
        ['@state(button) slot::slotted(button)', '', [], joinExpected([
            'slot::slotted(button.small) {}', 'slot::slotted(button.medium) {}', 'slot::slotted(button.large) {}'
        ])],
        ['@state(.card) .card', '', [], joinExpected(['.card.small {}', '.card.medium {}', '.card.large {}'])],
        ['@state(.card) .card .label', '', [], joinExpected([
            '.card.small .label {}', '.card.medium .label {}', '.card.large .label {}'
        ])],
        // 儅目標是屬性選擇器時
        ['@state([selected]) button[selected]', '', [], joinExpected([
            'button[selected].small {}', 'button[selected].medium {}', 'button[selected].large {}'
        ])],
        // 儅目標包含僞類時（長 target 保留緊貼 target-end 差異，不向尾部搬移）
// 注意，button:hover.small 是尾插 canonical 形狀
        ['@state(button:hover) button:hover .label', '', [], joinExpected([
            'button:hover.small .label {}', 'button:hover.medium .label {}', 'button:hover.large .label {}'
        ])],
        // ::before和::after比較特別，後面不能緊跟其它選擇器
        ['@state(button::before) button::before', '', [], joinExpected([
            'button.small::before {}', 'button.medium::before {}', 'button.large::before {}'
        ])],
        ['@state(button::after) button::after', '', [], joinExpected([
            'button.small::after {}', 'button.medium::after {}', 'button.large::after {}'
        ])],
        ['@state(button) .button-label button', '', [], joinExpected([
            '.button-label button.small {}', '.button-label button.medium {}', '.button-label button.large {}'
        ])],
        ['@state(button) .container button[data-wow="button"]>.label', '', [], joinExpected([
            '.container button[data-wow="button"].small>.label {}',
            '.container button[data-wow="button"].medium>.label {}',
            '.container button[data-wow="button"].large>.label {}'
        ])],
        // 外层路径经 ancestors 传入，state無權干涉外層選擇器
        ['@state(button) button', '', ['.wrapper'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button .label', '', ['.wrapper'], joinExpected([
            'button.small .label {}', 'button.medium .label {}', 'button.large .label {}'
        ])],
        ['@state(button) button:has(.label)', '', ['.wrapper'], joinExpected([
            'button:has(.label).small {}', 'button:has(.label).medium {}', 'button:has(.label).large {}'
        ])],
        ['@state(button) button', '', ['.wrapper[data-open]'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button', '', ['.wrapper > .inner'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button', '', ['.wrapper', '.inner'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button ~ .label', '', ['.wrapper + .sibling'], joinExpected([
            'button.small ~ .label {}', 'button.medium ~ .label {}', 'button.large ~ .label {}'
        ])],
        ['@state(button) button:has(.label)>.label', '', ['.wrapper:not(.hidden)'], joinExpected([
            'button:has(.label).small>.label {}',
            'button:has(.label).medium>.label {}',
            'button:has(.label).large>.label {}'
        ])],
        ['@state(button) button', '', [':host'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button:has(.label)', '', [':host([dense])'], joinExpected([
            'button:has(.label).small {}', 'button:has(.label).medium {}', 'button:has(.label).large {}'
        ])],
        // hover 等搭配 ::before 時固定為 author + states + ::before
        ['@state(button) button:hover::before', '', ['.wrapper'], joinExpected([
            'button:hover.small::before {}', 'button:hover.medium::before {}', 'button:hover.large::before {}'
        ])],
        // 保留 & 前綴選擇器，&也是CSS選擇器的一部分，不做魔法
        ['@state(button) &.active button', '', ['.wrapper'], joinExpected([
            '&.active button.small {}', '&.active button.medium {}', '&.active button.large {}'
        ])],
        ['@state(button) & button', '', ['.wrapper'], joinExpected([
            '& button.small {}', '& button.medium {}', '& button.large {}'
        ])],
        ['@state(button) & button', '', [], joinExpected([
            '& button.small {}', '& button.medium {}', '& button.large {}'
        ])],
        ['@state(button.show[selected]) button.show[selected].foo', '', ['.wrapper'], joinExpected([
            'button.show[selected].small.foo {}',
            'button.show[selected].medium.foo {}',
            'button.show[selected].large.foo {}'
        ])],
        ['@state(button) button, button .label', '', ['.wrapper'], joinExpected([
            'button.small, button.small .label {}',
            'button.medium, button.medium .label {}',
            'button.large, button.large .label {}'
        ])],
        ['@state(button) button, .label', '', ['.wrapper'], joinExpected([
            'button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}'
        ])],
        // 儅目標是:host時。因爲Litjs的:host很特殊，很多時候需要使用:host()格式才能正常工作，所以需要采用:host(.other-selector)格式
        ['@state(:host) :host(:where(.a))', '', [], joinExpected([
            ':host(:where(.a).small) {}', ':host(:where(.a).medium) {}', ':host(:where(.a).large) {}'
        ])],
        ['@state(:host) :host(:where(.a))', 'button {}', [], joinExpected([
            ':host(:where(.a).small) { button {} }', ':host(:where(.a).medium) { button {} }', ':host(:where(.a).large) { button {} }'
        ])],
        [':host', '@state(.btn) .btn', [], joinExpected([
            ':host { .btn.small {} }', ':host { .btn.medium {} }', ':host { .btn.large {} }'
        ])],
    ]

    const redMapping: StateMapping = [
        // 什麽也沒匹配時輸出空白結果（相當於不輸出結果）
        ['@state(button) .card', 'color: red;', [], ''],
        ['@state(button) .container', 'button:has(.label) {}', [], ''],
        ['@state(button) .container', '&button:has(.label) {}', [], ''],
        ['@state(button) .container', 'button:has(.label) { .label {} }', [], ''],
        ['@state(button.show) .container', 'button.show.ahaha.hummm {}', [], ''],
        ['@state(button) .wrap', 'button:not(.a):not([disabled]) {}', [], ''],
        ['@state(button) .wrap', '&button:not(.a):not([disabled]) {}', [], ''],
        // 缺少TARGET和SELECTOR時，或是@state語法錯誤時
        ['@state(button)', 'color: red;', [], ''],
        ['@state()', 'color: red;', [], ''],
        ['@state ()', 'color: red;', [], ''],
        ['@state() button', 'color: red;', [], ''],
        ['@state[] .a', 'color: red;', [], ''],
        ['@state', 'color: red;', [], ''],
        ['@state .a', 'color: red;', [], ''],
        ['state .a .a', 'color: red;', [], ''],
        ['state (.a) .a', 'color: red;', [], ''],
        ['#state (.a) .a', 'color: red;', [], ''],
        ['AtState (.a) .a', 'color: red;', [], ''],
        // 字母敏感，@State與@state不相同
        ['@State(.a) .a', 'color: red;', [], ''],
        ['@state .a (.a)', 'color: red;', [], ''],
        ['@state .a ()', 'color: red;', [], ''],
        ['@state(button) &', '', [], ''],
        ['@state(button) *', '', [], ''],
        // 内部無效但不會導致外部無效
        [':host', '@state(:host) .btn {}', [], ':host {}'],
    ]

    for (const [header, body, ancestors, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, sizeCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, ancestors, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, sizeCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }
})

describe('@state: default, hover, disabled', () => {
    /**
     * Q: 爲什麽都挂載在'self'上？
     * A:
     *    1. `withState`不提供挂載選項
     *    2. `@state`不提供語句提升或修改内外部的功能；`@state`永遠只負責自己的語句
     */
    const stateItems: readonly StateDimensionItem[] = [
        { name: 'default', modifier: '', target: 'self' },
        { name: 'hover', modifier: ':hover', target: 'self' },
        { name: 'disabled', modifier: '[disabled]', target: 'self' }
    ]
    const stateCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: stateItems,
        isCombo: false,
        ancestorPath: ancestors
    })

    describe('element targets', () => {
        const greenMapping: StateMapping = [
            // 基礎標籤選擇器
            ['@state(button) button', '', [], joinExpected([
                'button {}', 'button:hover {}', 'button[disabled] {}'
            ])],
            ['@state(button) button .label', '', [], joinExpected([
                'button .label {}', 'button:hover .label {}', 'button[disabled] .label {}'
            ])],
            ['@state(button) button > .icon', '', [], joinExpected([
                'button > .icon {}', 'button:hover > .icon {}', 'button[disabled] > .icon {}'
            ])],
            ['@state(button) button + .badge', '', [], joinExpected([
                'button + .badge {}', 'button:hover + .badge {}', 'button[disabled] + .badge {}'
            ])],
            ['@state(button) button ~ .sibling', '', [], joinExpected([
                'button ~ .sibling {}', 'button:hover ~ .sibling {}', 'button[disabled] ~ .sibling {}'
            ])],
            // 屬性與類別修飾
            ['@state(button) button.primary', '', [], joinExpected([
                'button.primary {}', 'button.primary:hover {}', 'button.primary[disabled] {}'
            ])],
            ['@state(button.primary) button.primary', '', [], joinExpected([
                'button.primary {}', 'button.primary:hover {}', 'button.primary[disabled] {}'
            ])],
            ['@state(button) button[type="button"]', '', [], joinExpected([
                'button[type="button"] {}', 'button[type="button"]:hover {}', 'button[type="button"][disabled] {}'
            ])],
            ['@state(button[type="button"]) button[type="button"]', '', [], joinExpected([
                'button[type="button"] {}', 'button[type="button"]:hover {}', 'button[type="button"][disabled] {}'
            ])],
            ['@state(button) button[dense="true"]', '', [], joinExpected([
                'button[dense="true"] {}', 'button[dense="true"]:hover {}', 'button[dense="true"][disabled] {}'
            ])],
            // 偽類與偽元素，偽元素置於尾部
            ['@state(button) button:focus', '', [], joinExpected([
                'button:focus {}', 'button:focus:hover {}', 'button:focus[disabled] {}'
            ])],
            ['@state(button:focus) button:focus', '', [], joinExpected([
                'button:focus {}', 'button:focus:hover {}', 'button:focus[disabled] {}'
            ])],
            ['@state(button) button:focus-visible', '', [], joinExpected([
                'button:focus-visible {}', 'button:focus-visible:hover {}', 'button:focus-visible[disabled] {}'
            ])],
            ['@state(button) button::before', '', [], joinExpected([
                'button::before {}', 'button:hover::before {}', 'button[disabled]::before {}'
            ])],
            ['@state(button::before) button::before', '', [], joinExpected([
                'button::before {}', 'button:hover::before {}', 'button[disabled]::before {}'
            ])],
            ['@state(button) button::after', '', [], joinExpected([
                'button::after {}', 'button:hover::after {}', 'button[disabled]::after {}'
            ])],
            ['@state(button) button:hover::before', '', [], joinExpected([
                'button:hover::before {}', 'button:hover:hover::before {}', 'button:hover[disabled]::before {}'
            ])],
            // 偽類函數
            ['@state(button) button:is(.icon, .label)', '', [], joinExpected([
                'button:is(.icon, .label) {}', 'button:is(.icon, .label):hover {}', 'button:is(.icon, .label)[disabled] {}'
            ])],
            ['@state(button) button:has(.label)', '', [], joinExpected([
                'button:has(.label) {}', 'button:has(.label):hover {}', 'button:has(.label)[disabled] {}'
            ])],
            ['@state(button) button:not(.active)', '', [], joinExpected([
                'button:not(.active) {}', 'button:not(.active):hover {}', 'button:not(.active)[disabled] {}'
            ])],
            // 目標在中間或尾端
            ['@state(button) .container button .label', '', [], joinExpected([
                '.container button .label {}', '.container button:hover .label {}', '.container button[disabled] .label {}'
            ])],
            ['@state(button) .container > button', '', [], joinExpected([
                '.container > button {}', '.container > button:hover {}', '.container > button[disabled] {}'
            ])],
            ['@state(button) .container button:has(.label) .label', '', [], joinExpected([
                '.container button:has(.label) .label {}',
                '.container button:has(.label):hover .label {}',
                '.container button:has(.label)[disabled] .label {}'
            ])],
            // 多處匹配全部替換
            ['@state(button) button ~ button', '', [], joinExpected([
                'button ~ button {}', 'button:hover ~ button:hover {}', 'button[disabled] ~ button[disabled] {}'
            ])],
            ['@state(button) button + button', '', [], joinExpected([
                'button + button {}', 'button:hover + button:hover {}', 'button[disabled] + button[disabled] {}'
            ])],
            // 逗號多分支
            ['@state(button) button, button .label', '', [], joinExpected([
                'button, button .label {}',
                'button:hover, button:hover .label {}',
                'button[disabled], button[disabled] .label {}'
            ])],
            ['@state(button) button, .other', '', [], joinExpected([
                'button, .other {}', 'button:hover, .other {}', 'button[disabled], .other {}'
            ])],
            // 相對 & 前綴
            ['@state(button) &.active button', '', [], joinExpected([
                '&.active button {}', '&.active button:hover {}', '&.active button[disabled] {}'
            ])],
            // 類別作為 target
            ['@state(.btn) .btn', '', [], joinExpected([
                '.btn {}', '.btn:hover {}', '.btn[disabled] {}'
            ])],
            ['@state(.btn) .btn .label', '', [], joinExpected([
                '.btn .label {}', '.btn:hover .label {}', '.btn[disabled] .label {}'
            ])],
            ['@state(.btn) .container > .btn', '', [], joinExpected([
                '.container > .btn {}', '.container > .btn:hover {}', '.container > .btn[disabled] {}'
            ])],
            // 帶有內部規則體
            ['@state(button) button', '.label {}', [], joinExpected([
                'button { .label {} }', 'button:hover { .label {} }', 'button[disabled] { .label {} }'
            ])],
            ['@state(button) button', ':is(.icon, .label) {}', [], joinExpected([
                'button { :is(.icon, .label) {} }',
                'button:hover { :is(.icon, .label) {} }',
                'button[disabled] { :is(.icon, .label) {} }'
            ])],
            // 帶祖先路徑
            ['@state(button) button', '', ['.wrapper'], joinExpected([
                'button {}', 'button:hover {}', 'button[disabled] {}'
            ])],
            ['@state(button) button .label', '', ['.card'], joinExpected([
                'button .label {}', 'button:hover .label {}', 'button[disabled] .label {}'
            ])],
        ]

        const redMapping: StateMapping = [
            ['@state(button) .card', '', [], ''],
            ['@state(button) .container', 'button {}', [], ''],
            ['@state(button)', 'color: red;', [], ''],
            ['@state()', '', [], ''],
            ['@state(button) &', '', [], ''],
        ]

        for (const [header, body, ancestors, expected] of greenMapping) {
            it(`green: ${header} { ${body} }`, () => {
                const output = handleStateBlock(header, body, stateCtx(ancestors), echoRecurse)
                expect(canonicalHandlerResult(output)).toBe(expected)
            })
        }

        for (const [header, body, ancestors, expected] of redMapping) {
            it(`red: ${header} { ${body} }`, () => {
                const output = handleStateBlock(header, body, stateCtx(ancestors), echoRecurse)
                expect(canonicalHandlerResult(output)).toBe(expected)
            })
        }
    })

    describe(':host targets', () => {
        const greenMapping: StateMapping = [
            ['@state(:host) :host', '', [], joinExpected([':host {}', ':host(:hover) {}', ':host([disabled]) {}'])],
            ['@state(:host) :host .label', '', [], joinExpected([
                ':host .label {}', ':host(:hover) .label {}', ':host([disabled]) .label {}'
            ])],
            ['@state(:host) :host > .container', '', [], joinExpected([
                ':host > .container {}', ':host(:hover) > .container {}', ':host([disabled]) > .container {}'
            ])],
            ['@state(:host) :host .a .b', '', [], joinExpected([
                ':host .a .b {}', ':host(:hover) .a .b {}', ':host([disabled]) .a .b {}'
            ])],
            ['@state(:host) :host .a ~ .b', '', [], joinExpected([
                ':host .a ~ .b {}', ':host(:hover) .a ~ .b {}', ':host([disabled]) .a ~ .b {}'
            ])],
            ['@state(:host) :host(.active)', '', [], joinExpected([
                ':host(.active) {}', ':host(.active:hover) {}', ':host(.active[disabled]) {}'
            ])],
            ['@state(:host) :host([dense])', '', [], joinExpected([
                ':host([dense]) {}', ':host([dense]:hover) {}', ':host([dense][disabled]) {}'
            ])],
            ['@state(:host) :host([variant="filled"])', '', [], joinExpected([
                ':host([variant="filled"]) {}', ':host([variant="filled"]:hover) {}', ':host([variant="filled"][disabled]) {}'
            ])],
            ['@state(:host) :host(.a.b)', '', [], joinExpected([
                ':host(.a.b) {}', ':host(.a.b:hover) {}', ':host(.a.b[disabled]) {}'
            ])],
            ['@state(:host) :host([a][b="c"])', '', [], joinExpected([
                ':host([a][b="c"]) {}', ':host([a][b="c"]:hover) {}', ':host([a][b="c"][disabled]) {}'
            ])],
            ['@state(:host) :host([v="x" i])', '', [], joinExpected([
                ':host([v="x" i]) {}', ':host([v="x" i]:hover) {}', ':host([v="x" i][disabled]) {}'
            ])],
            ['@state(:host) :host(.active) .label', '', [], joinExpected([
                ':host(.active) .label {}', ':host(.active:hover) .label {}', ':host(.active[disabled]) .label {}'
            ])],
            ['@state(:host) :host([dense]) > .container', '', [], joinExpected([
                ':host([dense]) > .container {}', ':host([dense]:hover) > .container {}', ':host([dense][disabled]) > .container {}'
            ])],
            ['@state(:host) :host(:not(.a))', '', [], joinExpected([
                ':host(:not(.a)) {}', ':host(:not(.a):hover) {}', ':host(:not(.a)[disabled]) {}'
            ])],
            ['@state(:host) :host(:not(.a):not([b]))', '', [], joinExpected([
                ':host(:not(.a):not([b])) {}', ':host(:not(.a):not([b]):hover) {}', ':host(:not(.a):not([b])[disabled]) {}'
            ])],
            ['@state(:host) :host(:is(.a,.b))', '', [], joinExpected([
                ':host(:is(.a,.b)) {}', ':host(:is(.a,.b):hover) {}', ':host(:is(.a,.b)[disabled]) {}'
            ])],
            ['@state(:host) :host(:where(.a))', '', [], joinExpected([
                ':host(:where(.a)) {}', ':host(:where(.a):hover) {}', ':host(:where(.a)[disabled]) {}'
            ])],
            ['@state(:host) :host(:has(.label))', '', [], joinExpected([
                ':host(:has(.label)) {}', ':host(:has(.label):hover) {}', ':host(:has(.label)[disabled]) {}'
            ])],
            ['@state(:host) :host(:focus-visible)', '', [], joinExpected([
                ':host(:focus-visible) {}', ':host(:focus-visible:hover) {}', ':host(:focus-visible[disabled]) {}'
            ])],
            ['@state(:host) :host(:first-child)', '', [], joinExpected([
                ':host(:first-child) {}', ':host(:first-child:hover) {}', ':host(:first-child[disabled]) {}'
            ])],
            ['@state(:host) :host(:empty)', '', [], joinExpected([
                ':host(:empty) {}', ':host(:empty:hover) {}', ':host(:empty[disabled]) {}'
            ])],
            // 属性值内不匹配
            ['@state(:host) :host[data-label=":host"]', '', [], joinExpected([
                ':host[data-label=":host"] {}',
                ':host[data-label=":host"]:hover {}',
                ':host[data-label=":host"][disabled] {}'
            ])],
            ['@state(:host) :host(.a), :host(.b)', '', [], joinExpected([
                ':host(.a), :host(.b) {}', ':host(.a:hover), :host(.b:hover) {}', ':host(.a[disabled]), :host(.b[disabled]) {}'
            ])],
            ['@state(:host) :host, .label', '', [], joinExpected([
                ':host, .label {}', ':host(:hover), .label {}', ':host([disabled]), .label {}'
            ])],
            ['@state(:where(:host)) :where(:host)', '', [], joinExpected([
                ':where(:host) {}', ':where(:host):hover {}', ':where(:host)[disabled] {}'
            ])],
            ['@state(:is(:host)) :is(:host)', '', [], joinExpected([
                ':is(:host) {}', ':is(:host):hover {}', ':is(:host)[disabled] {}'
            ])],
            ['@state(:where(:host([a]), :host([b]))) :where(:host([a]), :host([b]))', '', [], joinExpected([
                ':where(:host([a]), :host([b])) {}',
                ':where(:host([a]), :host([b])):hover {}',
                ':where(:host([a]), :host([b]))[disabled] {}'
            ])],
            ['@state(:is(:host(.a), :host([b]))) :is(:host(.a), :host([b]))', '', [], joinExpected([
                ':is(:host(.a), :host([b])) {}',
                ':is(:host(.a), :host([b])):hover {}',
                ':is(:host(.a), :host([b]))[disabled] {}'
            ])],
            ['@state(:where(:host)) :where(:host) .label', '', [], joinExpected([
                ':where(:host) .label {}', ':where(:host):hover .label {}', ':where(:host)[disabled] .label {}'
            ])],
            ['@state(:where(:host([variant="x"]), :host(:has(.x)))) :where(:host([variant="x"]), :host(:has(.x)))', '', [], joinExpected([
                ':where(:host([variant="x"]), :host(:has(.x))) {}',
                ':where(:host([variant="x"]), :host(:has(.x))):hover {}',
                ':where(:host([variant="x"]), :host(:has(.x)))[disabled] {}'
            ])],
            // 壳内并列
            ['@state(:host) :host', '.label {}', [], joinExpected([
                ':host { .label {} }', ':host(:hover) { .label {} }', ':host([disabled]) { .label {} }'
            ])],
            ['@state(:host) :host(.active)', '.label {}', [], joinExpected([
                ':host(.active) { .label {} }', ':host(.active:hover) { .label {} }', ':host(.active[disabled]) { .label {} }'
            ])],
            // host 祖先 + 非 host target：無魔法，不觸及外層，不長臂管轄
            ['@state(button) button', '', [':host'], joinExpected([
                'button {}',
                'button:hover {}',
                'button[disabled] {}'
            ])],
            ['@state(button) button .label', '', [':host([dense])'], joinExpected([
                'button .label {}',
                'button:hover .label {}',
                'button[disabled] .label {}'
            ])],
            ['@state(button) button', '', [':host(:not(.a))'], joinExpected([
                'button {}',
                'button:hover {}',
                'button[disabled] {}'
            ])],
            ['@state(button) button', '', [':host', '.wrapper'], joinExpected([
                'button {}',
                'button:hover {}',
                'button[disabled] {}'
            ])],
            ['@state(button) button, button .label', '', [':host'], joinExpected([
                'button, button .label {}',
                'button:hover, button:hover .label {}',
                'button[disabled], button[disabled] .label {}'
            ])],
            ['@state(button) button', '', [':where(:host)'], joinExpected([
                'button {}',
                'button:hover {}',
                'button[disabled] {}'
            ])],
            // host-like target：與所有 target 一視同仁，原地合併（H1 已撤銷，無需特殊豁免）
            ['@state(:host) :host', '', [':host'], joinExpected([
                ':host {}',
                ':host(:hover) {}',
                ':host([disabled]) {}'
            ])],
            ['@state(:where(:host)) :where(:host) .label', '', [':host'], joinExpected([
                ':where(:host) .label {}',
                ':where(:host):hover .label {}',
                ':where(:host)[disabled] .label {}'
            ])],
        ]

        const redMapping: StateMapping = [
            ['@state(:host) .label', '', [], ''],
        ]

        for (const [header, body, ancestors, expected] of greenMapping) {
            it(`green: ${header} { ${body} }`, () => {
                const output = handleStateBlock(header, body, stateCtx(ancestors), echoRecurse)
                expect(canonicalHandlerResult(output)).toBe(expected)
            })
        }

        for (const [header, body, ancestors, expected] of redMapping) {
            it(`red: ${header} { ${body} }`, () => {
                const output = handleStateBlock(header, body, stateCtx(ancestors), echoRecurse)
                expect(canonicalHandlerResult(output)).toBe(expected)
            })
        }
    })
})

describe('combo', () => {
    const comboStates: readonly (readonly StateDimensionItem[])[] = [
        [
            { name: 'medium', modifier: '.medium', target: 'self' },
            { name: 'enabled', modifier: '', target: 'self' }
        ],
        [
            { name: 'medium', modifier: '.medium', target: 'self' },
            { name: 'disabled', modifier: '[disabled]', target: 'self' }
        ],
        [
            { name: 'large', modifier: '.large', target: 'self' },
            { name: 'enabled', modifier: '', target: 'self' }
        ],
        [
            { name: 'large', modifier: '.large', target: 'self' },
            { name: 'disabled', modifier: '[disabled]', target: 'self' }
        ]
    ]
    const comboCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: comboStates,
        isCombo: true,
        ancestorPath: ancestors
    })

    /**
     * combo（沿用 R1–R8）：状态挂 @state(target) 上，不跳到 :host。
     * 展开顺序固定：[medium,enabled] → [medium,disabled] → [large,enabled] → [large,disabled]。
     */
    const greenMapping: StateMapping = [
        ['@state(button) button', '', [], joinExpected([
            'button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}'
        ])],
        ['@state(button) button .label', '', [], joinExpected([
            'button.medium .label {}', 'button.medium[disabled] .label {}', 'button.large .label {}', 'button.large[disabled] .label {}'
        ])],
        ['@state(button) button:has(.label)', '', [], joinExpected([
            'button:has(.label).medium {}', 'button:has(.label).medium[disabled] {}',
            'button:has(.label).large {}', 'button:has(.label).large[disabled] {}'
        ])],
        ['@state(button) .container>button:has(.label)>.label', '', [], joinExpected([
            '.container>button:has(.label).medium>.label {}', '.container>button:has(.label).medium[disabled]>.label {}',
            '.container>button:has(.label).large>.label {}', '.container>button:has(.label).large[disabled]>.label {}'
        ])],
        ['@state(button.show) button.show.foo', '', [], joinExpected([
            'button.show.medium.foo {}', 'button.show.medium[disabled].foo {}',
            'button.show.large.foo {}', 'button.show.large[disabled].foo {}'
        ])],
        ['@state(button.show[selected]) button.show[selected].foo', '', [], joinExpected([
            'button.show[selected].medium.foo {}', 'button.show[selected].medium[disabled].foo {}',
            'button.show[selected].large.foo {}', 'button.show[selected].large[disabled].foo {}'
        ])],
        ['@state(button) button:is(.icon,.label)', '', [], joinExpected([
            'button:is(.icon,.label).medium {}', 'button:is(.icon,.label).medium[disabled] {}',
            'button:is(.icon,.label).large {}', 'button:is(.icon,.label).large[disabled] {}'
        ])],
        ['@state(button) :host button', '', [], joinExpected([
            ':host button.medium {}', ':host button.medium[disabled] {}', ':host button.large {}', ':host button.large[disabled] {}'
        ])],
        ['@state(:host) :host', '', [], joinExpected([
            ':host(.medium) {}', ':host(.medium[disabled]) {}', ':host(.large) {}', ':host(.large[disabled]) {}'
        ])],
        ['@state(:host) :host .label', '', [], joinExpected([
            ':host(.medium) .label {}', ':host(.medium[disabled]) .label {}',
            ':host(.large) .label {}', ':host(.large[disabled]) .label {}'
        ])],
        ['@state(button) button[type="submit"]', '', [], joinExpected([
            'button[type="submit"].medium {}', 'button[type="submit"].medium[disabled] {}',
            'button[type="submit"].large {}', 'button[type="submit"].large[disabled] {}'
        ])],
        ['@state(button) button[class*="btn-"]', '', [], joinExpected([
            'button[class*="btn-"].medium {}', 'button[class*="btn-"].medium[disabled] {}',
            'button[class*="btn-"].large {}', 'button[class*="btn-"].large[disabled] {}'
        ])],
        ['@state(button) button::before', '', [], joinExpected([
            'button.medium::before {}', 'button.medium[disabled]::before {}',
            'button.large::before {}', 'button.large[disabled]::before {}'
        ])],
        ['@state(#submit) #submit', '', [], joinExpected([
            '#submit.medium {}', '#submit.medium[disabled] {}', '#submit.large {}', '#submit.large[disabled] {}'
        ])],
        ['@state(*) *', '', [], joinExpected([
            '*.medium {}', '*.medium[disabled] {}', '*.large {}', '*.large[disabled] {}'
        ])],
        // R5
        ['@state(button) button, button .label', '', [], joinExpected([
            'button.medium, button.medium .label {}', 'button.medium[disabled], button.medium[disabled] .label {}',
            'button.large, button.large .label {}', 'button.large[disabled], button.large[disabled] .label {}'
        ])],
        ['@state(button) button, .label', '', [], joinExpected([
            'button.medium, .label {}', 'button.medium[disabled], .label {}',
            'button.large, .label {}', 'button.large[disabled], .label {}'
        ])],
        // R3 子串安全
        ['@state(button) button:has(button)', '', [], joinExpected([
            'button:has(button).medium {}', 'button:has(button).medium[disabled] {}',
            'button:has(button).large {}', 'button:has(button).large[disabled] {}'
        ])],
        ['@state(button) .container button[data-x="button"]', '', [], joinExpected([
            '.container button[data-x="button"].medium {}', '.container button[data-x="button"].medium[disabled] {}',
            '.container button[data-x="button"].large {}', '.container button[data-x="button"].large[disabled] {}'
        ])],
        // R6 壳内并列
        ['@state(button) button', '.label {}', [], joinExpected([
            'button.medium { .label {} }', 'button.medium[disabled] { .label {} }',
            'button.large { .label {} }', 'button.large[disabled] { .label {} }'
        ])],
        ['@state(button) button', '', ['.wrapper'], joinExpected([
            'button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}'
        ])],
        ['@state(button) button .label', '', ['.wrapper'], joinExpected([
            'button.medium .label {}', 'button.medium[disabled] .label {}',
            'button.large .label {}', 'button.large[disabled] .label {}'
        ])],
        ['@state(button) button', '', [':host'], joinExpected([
            'button.medium {}', 'button.medium[disabled] {}', 'button.large {}', 'button.large[disabled] {}'
        ])],
    ]

    /**
     * 红队：R1/R8 [D]。
     */
    const redMapping: StateMapping = [
        ['@state(button)', 'color: red;', [], ''],
        ['@state(button) .card', 'color: red;', [], ''],
    ]

    for (const [header, body, ancestors, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, comboCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, ancestors, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, comboCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }
})

describe('custom-state', () => {
    const customStates: readonly StateDimensionItem[] = [
        { name: 'enabled', modifier: '', target: 'self' },
        { name: 'checked', modifier: ':state(checked)', target: 'self' },
        { name: 'disabled', modifier: ':state(disabled)', target: 'self' }
    ]
    const customCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: customStates,
        isCombo: false,
        ancestorPath: ancestors
    })

    const greenMapping: StateMapping = [
        ['@state(button) button', '', [], joinExpected([
            'button {}', 'button:state(checked) {}', 'button:state(disabled) {}'
        ])],
        ['@state(button) button .label', '', [], joinExpected([
            'button .label {}', 'button:state(checked) .label {}', 'button:state(disabled) .label {}'
        ])],
        ['@state(:host) :host', '', [], joinExpected([
            ':host {}', ':host(:state(checked)) {}', ':host(:state(disabled)) {}'
        ])],
        ['@state(:host) :host([dense])', '', [], joinExpected([
            ':host([dense]) {}', ':host([dense]:state(checked)) {}', ':host([dense]:state(disabled)) {}'
        ])],
    ]

    const redMapping: StateMapping = [
        ['@state(button) .card', 'color: red;', [], ''],
    ]

    for (const [header, body, ancestors, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, customCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, ancestors, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, customCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }
})
