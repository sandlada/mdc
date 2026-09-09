/**
 * @version 2026.9.8
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

    /**
     * @state(target) selector { body }：target 与 selector 皆必填。
     */
    const greenMapping: StateMapping = [
        ['@state(button) button', '', [], joinExpected(['button.small {}', 'button.medium {}', 'button.large {}'])],
        ['@state(button) button .label', '', [], joinExpected(['button.small .label {}', 'button.medium .label {}', 'button.large .label {}'])],
        ['@state(button) button :is(.icon, .label)', '', [], joinExpected([
            'button.small :is(.icon, .label) {}',
            'button.medium :is(.icon, .label) {}',
            'button.large :is(.icon, .label) {}'
        ])],
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
        ['@state(button) button:is(.icon, .label)', '', [], joinExpected([
            'button.small:is(.icon, .label) {}',
            'button.medium:is(.icon, .label) {}',
            'button.large:is(.icon, .label) {}'
        ])],
        ['@state(button) button:has(.label)', '', [], joinExpected([
            'button.small:has(.label) {}',
            'button.medium:has(.label) {}',
            'button.large:has(.label) {}'
        ])],
        ['@state(button) .container button:has(.label) .label', '', [], joinExpected([
            '.container button.small:has(.label) .label {}',
            '.container button.medium:has(.label) .label {}',
            '.container button.large:has(.label) .label {}'
        ])],
        ['@state(button) &button:has(.label)', '.label {}', ['.container'], joinExpected([
            '&button.small:has(.label) { .label {} }',
            '&button.medium:has(.label) { .label {} }',
            '&button.large:has(.label) { .label {} }'
        ])],
        ['@state(button) .container>button:has(.label)>.label', '', [], joinExpected([
            '.container>button.small:has(.label)>.label {}',
            '.container>button.medium:has(.label)>.label {}',
            '.container>button.large:has(.label)>.label {}'
        ])],
        ['@state(button) .container[show]>button:has(.label)>.label', '', [], joinExpected([
            '.container[show]>button.small:has(.label)>.label {}',
            '.container[show]>button.medium:has(.label)>.label {}',
            '.container[show]>button.large:has(.label)>.label {}'
        ])],
        ['@state(button) .container[show="true"]>button:has(.label)>.label', '', [], joinExpected([
            '.container[show="true"]>button.small:has(.label)>.label {}',
            '.container[show="true"]>button.medium:has(.label)>.label {}',
            '.container[show="true"]>button.large:has(.label)>.label {}'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg:disabled {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg:disabled {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg:disabled {} }'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg[disabled] {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled] {} }'
        ])],
        ['@state(button) .container[show="true"]+.wrapper>button:has(.label)>.label', '.text-bg[disabled="true"] {}', [], joinExpected([
            '.container[show="true"]+.wrapper>button.small:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.medium:has(.label)>.label { .text-bg[disabled="true"] {} }',
            '.container[show="true"]+.wrapper>button.large:has(.label)>.label { .text-bg[disabled="true"] {} }'
        ])],
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
        ['@state(#submit) #submit', '', [], joinExpected(['#submit.small {}', '#submit.medium {}', '#submit.large {}'])],
        ['@state(#submit) #submit .label', '', [], joinExpected(['#submit.small .label {}', '#submit.medium .label {}', '#submit.large .label {}'])],
        ['@state(*) *', '', [], joinExpected(['*.small {}', '*.medium {}', '*.large {}'])],
        ['@state(*) * .label', '', [], joinExpected(['*.small .label {}', '*.medium .label {}', '*.large .label {}'])],
        ['@state(button) button#submit', '', [], joinExpected([
            'button.small#submit {}', 'button.medium#submit {}', 'button.large#submit {}'
        ])],
        ['@state(button) button#submit.primary', '', [], joinExpected([
            'button.small#submit.primary {}', 'button.medium#submit.primary {}', 'button.large#submit.primary {}'
        ])],
        ['@state(button#submit) button#submit.primary', '', [], joinExpected([
            'button#submit.small.primary {}', 'button#submit.medium.primary {}', 'button#submit.large.primary {}'
        ])],
        ['@state(button) * button', '', [], joinExpected(['* button.small {}', '* button.medium {}', '* button.large {}'])],
        ['@state(button) .container .label button', '', [], joinExpected([
            '.container .label button.small {}', '.container .label button.medium {}', '.container .label button.large {}'
        ])],
        ['@state(button) button[type="submit"]', '', [], joinExpected([
            'button.small[type="submit"] {}', 'button.medium[type="submit"] {}', 'button.large[type="submit"] {}'
        ])],
        ['@state(button) button[type=\'submit\']', '', [], joinExpected([
            'button.small[type=\'submit\'] {}', 'button.medium[type=\'submit\'] {}', 'button.large[type=\'submit\'] {}'
        ])],
        ['@state(button) button[title~="word"]', '', [], joinExpected([
            'button.small[title~="word"] {}', 'button.medium[title~="word"] {}', 'button.large[title~="word"] {}'
        ])],
        ['@state(button) button[lang|="en"]', '', [], joinExpected([
            'button.small[lang|="en"] {}', 'button.medium[lang|="en"] {}', 'button.large[lang|="en"] {}'
        ])],
        ['@state(button) button[href^="https"]', '', [], joinExpected([
            'button.small[href^="https"] {}', 'button.medium[href^="https"] {}', 'button.large[href^="https"] {}'
        ])],
        ['@state(button) button[href$=".pdf"]', '', [], joinExpected([
            'button.small[href$=".pdf"] {}', 'button.medium[href$=".pdf"] {}', 'button.large[href$=".pdf"] {}'
        ])],
        ['@state(button) button[class*="btn-"]', '', [], joinExpected([
            'button.small[class*="btn-"] {}', 'button.medium[class*="btn-"] {}', 'button.large[class*="btn-"] {}'
        ])],
        ['@state(button) button[data-wow="yes" i]', '', [], joinExpected([
            'button.small[data-wow="yes" i] {}', 'button.medium[data-wow="yes" i] {}', 'button.large[data-wow="yes" i] {}'
        ])],
        ['@state(button) button[data-label="button"]', '', [], joinExpected([
            'button.small[data-label="button"] {}', 'button.medium[data-label="button"] {}', 'button.large[data-label="button"] {}'
        ])],
        ['@state(button) button:hover', '', [], joinExpected([
            'button.small:hover {}', 'button.medium:hover {}', 'button.large:hover {}'
        ])],
        ['@state(button) button:focus-visible', '', [], joinExpected([
            'button.small:focus-visible {}', 'button.medium:focus-visible {}', 'button.large:focus-visible {}'
        ])],
        ['@state(button) button:active', '', [], joinExpected([
            'button.small:active {}', 'button.medium:active {}', 'button.large:active {}'
        ])],
        ['@state(button) button:hover:active', '', [], joinExpected([
            'button.small:hover:active {}', 'button.medium:hover:active {}', 'button.large:hover:active {}'
        ])],
        ['@state(button) button:disabled', '', [], joinExpected([
            'button.small:disabled {}', 'button.medium:disabled {}', 'button.large:disabled {}'
        ])],
        ['@state(button) button:checked', '', [], joinExpected([
            'button.small:checked {}', 'button.medium:checked {}', 'button.large:checked {}'
        ])],
        ['@state(button) button:hover:focus-visible', '', [], joinExpected([
            'button.small:hover:focus-visible {}', 'button.medium:hover:focus-visible {}', 'button.large:hover:focus-visible {}'
        ])],
        ['@state(button) button:not(.disabled)', '', [], joinExpected([
            'button.small:not(.disabled) {}', 'button.medium:not(.disabled) {}', 'button.large:not(.disabled) {}'
        ])],
        ['@state(button) button:not([disabled])', '', [], joinExpected([
            'button.small:not([disabled]) {}', 'button.medium:not([disabled]) {}', 'button.large:not([disabled]) {}'
        ])],
        ['@state(button) button:not([disabled="true"])', '', [], joinExpected([
            'button.small:not([disabled="true"]) {}', 'button.medium:not([disabled="true"]) {}', 'button.large:not([disabled="true"]) {}'
        ])],
        ['@state(button) button:not([disabled="false"])', '', [], joinExpected([
            'button.small:not([disabled="false"]) {}', 'button.medium:not([disabled="false"]) {}', 'button.large:not([disabled="false"]) {}'
        ])],
        ['@state(button) button:not(.a):not([disabled])', '', [], joinExpected([
            'button.small:not(.a):not([disabled]) {}', 'button.medium:not(.a):not([disabled]) {}', 'button.large:not(.a):not([disabled]) {}'
        ])],
        ['@state(button) .wrap button:not(.a):not([disabled])', '', [], joinExpected([
            '.wrap button.small:not(.a):not([disabled]) {}',
            '.wrap button.medium:not(.a):not([disabled]) {}',
            '.wrap button.large:not(.a):not([disabled]) {}'
        ])],
        ['@state(button) button:not(.a):not([disabled])', '', ['.wrap'], joinExpected([
            'button.small:not(.a):not([disabled]) {}',
            'button.medium:not(.a):not([disabled]) {}',
            'button.large:not(.a):not([disabled]) {}'
        ])],
        ['@state(button) &button:not(.a):not([disabled])', '', ['.wrap'], joinExpected([
            '&button.small:not(.a):not([disabled]) {}',
            '&button.medium:not(.a):not([disabled]) {}',
            '&button.large:not(.a):not([disabled]) {}'
        ])],
        ['@state(button) button:where(.icon, .label)', '', [], joinExpected([
            'button.small:where(.icon, .label) {}',
            'button.medium:where(.icon, .label) {}',
            'button.large:where(.icon, .label) {}'
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
            'button.small:is(:hover, :focus-visible) {}',
            'button.medium:is(:hover, :focus-visible) {}',
            'button.large:is(:hover, :focus-visible) {}'
        ])],
        ['@state(button) button:first-child', '', [], joinExpected([
            'button.small:first-child {}', 'button.medium:first-child {}', 'button.large:first-child {}'
        ])],
        ['@state(button) button:last-child', '', [], joinExpected([
            'button.small:last-child {}', 'button.medium:last-child {}', 'button.large:last-child {}'
        ])],
        ['@state(button) button:only-child', '', [], joinExpected([
            'button.small:only-child {}', 'button.medium:only-child {}', 'button.large:only-child {}'
        ])],
        ['@state(button) button:nth-child(2n+1)', '', [], joinExpected([
            'button.small:nth-child(2n+1) {}', 'button.medium:nth-child(2n+1) {}', 'button.large:nth-child(2n+1) {}'
        ])],
        ['@state(button) button:nth-of-type(odd)', '', [], joinExpected([
            'button.small:nth-of-type(odd) {}', 'button.medium:nth-of-type(odd) {}', 'button.large:nth-of-type(odd) {}'
        ])],
        ['@state(button) button:empty', '', [], joinExpected([
            'button.small:empty {}', 'button.medium:empty {}', 'button.large:empty {}'
        ])],
        ['@state(button) button::before', '', [], joinExpected([
            'button.small::before {}', 'button.medium::before {}', 'button.large::before {}'
        ])],
        ['@state(button) button::after', '', [], joinExpected([
            'button.small::after {}', 'button.medium::after {}', 'button.large::after {}'
        ])],
        ['@state(button) button:hover::before', '', [], joinExpected([
            'button.small:hover::before {}', 'button.medium:hover::before {}', 'button.large:hover::before {}'
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
            '.container~button.small:has(.label)~.label {}',
            '.container~button.medium:has(.label)~.label {}',
            '.container~button.large:has(.label)~.label {}'
        ])],
        // R3 函数参数内永不匹配：`:has(.label)` 内层原样，仅尾部展开
        ['@state(.label) .container~button:has(.label)~.label', '', [], joinExpected([
            '.container~button:has(.label)~.label.small {}',
            '.container~button:has(.label)~.label.medium {}',
            '.container~button:has(.label)~.label.large {}'
        ])],
        ['@state(button) button ~ button', '', [], joinExpected([
            'button.small ~ button.small {}', 'button.medium ~ button.medium {}', 'button.large ~ button.large {}'
        ])],
        ['@state(button) button + button', '', [], joinExpected([
            'button.small + button.small {}', 'button.medium + button.medium {}', 'button.large + button.large {}'
        ])],
        ['@state(button+button) button+button', '', [], joinExpected([
            'button+button.small {}', 'button+button.medium {}', 'button+button.large {}'
        ])],
        ['@state(button+ button) button+ button', '', [], joinExpected([
            'button+ button.small {}', 'button+ button.medium {}', 'button+ button.large {}'
        ])],
        // R2 空白敏感：字面全等才命中分支；此处 target 经空白归一化后仍命中（见实现），全量展开
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
        ['@state(button) button', '&+button {}', [], joinExpected([
            'button.small { &+button {} }', 'button.medium { &+button {} }', 'button.large { &+button {} }'
        ])],
        ['@state(td) col.selected || td', '', [], joinExpected([
            'col.selected || td.small {}', 'col.selected || td.medium {}', 'col.selected || td.large {}'
        ])],
        ['@state(button) button, button .label', '', [], joinExpected([
            'button.small, button.small .label {}',
            'button.medium, button.medium .label {}',
            'button.large, button.large .label {}'
        ])],
        ['@state(button) button, .label', '', [], joinExpected([
            'button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}'
        ])],
        ['@state(button) :host button', '', [], joinExpected([
            ':host button.small {}', ':host button.medium {}', ':host button.large {}'
        ])],
        ['@state(button) :host([dense]) button:has(.label)', '', [], joinExpected([
            ':host([dense]) button.small:has(.label) {}',
            ':host([dense]) button.medium:has(.label) {}',
            ':host([dense]) button.large:has(.label) {}'
        ])],
        ['@state(button) slot::slotted(button)', '', [], joinExpected([
            'slot::slotted(button.small) {}', 'slot::slotted(button.medium) {}', 'slot::slotted(button.large) {}'
        ])],
        ['@state(.card) .card', '', [], joinExpected(['.card.small {}', '.card.medium {}', '.card.large {}'])],
        ['@state(.card) .card .label', '', [], joinExpected([
            '.card.small .label {}', '.card.medium .label {}', '.card.large .label {}'
        ])],
        ['@state([selected]) button[selected]', '', [], joinExpected([
            'button[selected].small {}', 'button[selected].medium {}', 'button[selected].large {}'
        ])],
        ['@state(button:hover) button:hover .label', '', [], joinExpected([
            'button:hover.small .label {}', 'button:hover.medium .label {}', 'button:hover.large .label {}'
        ])],
        ['@state(button::before) button::before', '', [], joinExpected([
            'button.small::before {}', 'button.medium::before {}', 'button.large::before {}'
        ])],
        ['@state(button::after) button::after', '', [], joinExpected([
            'button.small::after {}', 'button.medium::after {}', 'button.large::after {}'
        ])],
        // R3/R4 子串安全：函数参数、连字前缀、属性值内不匹配
        ['@state(button) button:has(button)', '', [], joinExpected([
            'button.small:has(button) {}', 'button.medium:has(button) {}', 'button.large:has(button) {}'
        ])],
        ['@state(button) button:is(button, .label)', '', [], joinExpected([
            'button.small:is(button, .label) {}', 'button.medium:is(button, .label) {}', 'button.large:is(button, .label) {}'
        ])],
        ['@state(button) button:where(button)', '', [], joinExpected([
            'button.small:where(button) {}', 'button.medium:where(button) {}', 'button.large:where(button) {}'
        ])],
        ['@state(button) button:not(button)', '', [], joinExpected([
            'button.small:not(button) {}', 'button.medium:not(button) {}', 'button.large:not(button) {}'
        ])],
        ['@state(button) .button-label button', '', [], joinExpected([
            '.button-label button.small {}', '.button-label button.medium {}', '.button-label button.large {}'
        ])],
        ['@state(button) .container button[data-wow="button"]>.label', '', [], joinExpected([
            '.container button.small[data-wow="button"]>.label {}',
            '.container button.medium[data-wow="button"]>.label {}',
            '.container button.large[data-wow="button"]>.label {}'
        ])],
        // R6 外层路径经 ancestors 传入（外壳包裹归 dispatcher）
        ['@state(button) button', '', ['.wrapper'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button .label', '', ['.wrapper'], joinExpected([
            'button.small .label {}', 'button.medium .label {}', 'button.large .label {}'
        ])],
        ['@state(button) button:has(.label)', '', ['.wrapper'], joinExpected([
            'button.small:has(.label) {}', 'button.medium:has(.label) {}', 'button.large:has(.label) {}'
        ])],
        ['@state(button) button:hover::before', '', ['.wrapper'], joinExpected([
            'button.small:hover::before {}', 'button.medium:hover::before {}', 'button.large:hover::before {}'
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
            'button.small:has(.label)>.label {}',
            'button.medium:has(.label)>.label {}',
            'button.large:has(.label)>.label {}'
        ])],
        ['@state(button) button', '', [':host'], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
        ['@state(button) button:has(.label)', '', [':host([dense])'], joinExpected([
            'button.small:has(.label) {}', 'button.medium:has(.label) {}', 'button.large:has(.label) {}'
        ])],
        // R7:保留 & 前綴選擇器；單獨 & 無 target 走 R8 [D]（見紅隊）；支持 &.active 前綴
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
        // R5 部分分支保留
        ['@state(button) button, button .label', '', ['.wrapper'], joinExpected([
            'button.small, button.small .label {}',
            'button.medium, button.medium .label {}',
            'button.large, button.large .label {}'
        ])],
        ['@state(button) button, .label', '', ['.wrapper'], joinExpected([
            'button.small, .label {}', 'button.medium, .label {}', 'button.large, .label {}'
        ])],
        // R2 多处匹配全部替换
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
        // 關於 :host：R2 尾部追加，修飾符併入 :host() 內尾端
        ['@state(:host) :host(:where(.a))', '', [], joinExpected([
            ':host(:where(.a).small) {}', ':host(:where(.a).medium) {}', ':host(:where(.a).large) {}'
        ])],
    ]

    const redMapping: StateMapping = [
        // R1 缺 selector/target
        ['@state(button)', 'color: red;', [], ''],
        ['@state()', 'color: red;', [], ''],
        // R8 全零匹配
        ['@state(button) .card', 'color: red;', [], ''],
        ['@state() button', 'color: red;', [], ''],
        ['@state[] .a', 'color: red;', [], ''],
        ['@state', 'color: red;', [], ''],
        ['@state .a', 'color: red;', [], ''],
        ['@state ()', 'color: red;', [], ''],
        ['@state .a (.a)', 'color: red;', [], ''],
        ['@state .a ()', 'color: red;', [], ''],
        // R8 嵌套外层零匹配
        ['@state(button) .container', 'button:has(.label) {}', [], ''],
        ['@state(button) .container', '&button:has(.label) {}', [], ''],
        ['@state(button) .container', 'button:has(.label) { .label {} }', [], ''],
        ['@state(button.show) .container', 'button.show.ahaha.hummm {}', [], ''],
        ['@state(button) .wrap', 'button:not(.a):not([disabled]) {}', [], ''],
        ['@state(button) .wrap', '&button:not(.a):not([disabled]) {}', [], ''],
        // R7 单独 &：不含 target，R8 [D]（外层 `button {}` 包裹归 dispatcher）
        ['@state(button) &', '', [], ''],
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

describe(':host', () => {
    const hostStates: readonly StateDimensionItem[] = [
        { name: 'enabled', modifier: '', target: 'self' },
        { name: 'hovered', modifier: ':hover', target: 'host' },
        { name: 'disabled', modifier: '[disabled]', target: 'host' }
    ]
    const hostCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: hostStates,
        isCombo: false,
        ancestorPath: ancestors
    })

    /**
     * :host（沿用 R1–R8）：enabled 原样；hovered 挂 :host（:host(:hover)）；disabled 另起 :host([...]) 壳。
     * H1 壳分裂；H2 祖先包裹保留相對 &（如 & .inner、& > .inner 保留，單獨 & 本體丟棄）；H3 括号内合并；H4 :is/:where 包裹 :host 按分支合并。
     * 分裂出的外壳经 hoisted 返回（合并归 dispatcher / mergeHoistedRules）。
     */
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
        // R3 属性值内不匹配
        ['@state(:host) :host[data-label=":host"]', '', [], joinExpected([
            ':host[data-label=":host"] {}',
            ':host[data-label=":host"]:hover {}',
            ':host[data-label=":host"][disabled] {}'
        ])],
        // R5
        ['@state(:host) :host(.a), :host(.b)', '', [], joinExpected([
            ':host(.a), :host(.b) {}', ':host(.a:hover), :host(.b:hover) {}', ':host(.a[disabled]), :host(.b[disabled]) {}'
        ])],
        ['@state(:host) :host, .label', '', [], joinExpected([
            ':host, .label {}', ':host(:hover), .label {}', ':host([disabled]), .label {}'
        ])],
        // H4
        ['@state(:where(:host)) :where(:host)', '', [], joinExpected([
            ':where(:host) {}', ':where(:host(:hover)) {}', ':where(:host([disabled])) {}'
        ])],
        ['@state(:is(:host)) :is(:host)', '', [], joinExpected([
            ':is(:host) {}', ':is(:host(:hover)) {}', ':is(:host([disabled])) {}'
        ])],
        ['@state(:where(:host([a]), :host([b]))) :where(:host([a]), :host([b]))', '', [], joinExpected([
            ':where(:host([a]), :host([b])) {}',
            ':where(:host([a]:hover), :host([b]:hover)) {}',
            ':where(:host([a][disabled]), :host([b][disabled])) {}'
        ])],
        ['@state(:is(:host(.a), :host([b]))) :is(:host(.a), :host([b]))', '', [], joinExpected([
            ':is(:host(.a), :host([b])) {}',
            ':is(:host(.a:hover), :host([b]:hover)) {}',
            ':is(:host(.a[disabled]), :host([b][disabled])) {}'
        ])],
        ['@state(:where(:host)) :where(:host) .label', '', [], joinExpected([
            ':where(:host) .label {}', ':where(:host(:hover)) .label {}', ':where(:host([disabled])) .label {}'
        ])],
        ['@state(:where(:host([variant="x"]), :host(:has(.x)))) :where(:host([variant="x"]), :host(:has(.x)))', '', [], joinExpected([
            ':where(:host([variant="x"]), :host(:has(.x))) {}',
            ':where(:host([variant="x"]:hover), :host(:has(.x):hover)) {}',
            ':where(:host([variant="x"][disabled]), :host(:has(.x)[disabled])) {}'
        ])],
        // R6 壳内并列
        ['@state(:host) :host', '.label {}', [], joinExpected([
            ':host { .label {} }', ':host(:hover) { .label {} }', ':host([disabled]) { .label {} }'
        ])],
        ['@state(:host) :host(.active)', '.label {}', [], joinExpected([
            ':host(.active) { .label {} }', ':host(.active:hover) { .label {} }', ':host(.active[disabled]) { .label {} }'
        ])],
        // H1 壳分裂（分裂外壳经 hoisted 返回）
        ['@state(button) button', '', [':host'], joinExpected([
            'button {}',
            ':host(:hover) { button {} }',
            ':host([disabled]) { button {} }'
        ])],
        ['@state(button) button .label', '', [':host([dense])'], joinExpected([
            'button .label {}',
            ':host([dense]:hover) { button .label {} }',
            ':host([dense][disabled]) { button .label {} }'
        ])],
        ['@state(button) button', '', [':host(:not(.a))'], joinExpected([
            'button {}',
            ':host(:not(.a):hover) { button {} }',
            ':host(:not(.a)[disabled]) { button {} }'
        ])],
        ['@state(button) button', '', [':host', '.wrapper'], joinExpected([
            'button {}',
            ':host(:hover) { .wrapper { button {} } }',
            ':host([disabled]) { .wrapper { button {} } }'
        ])],
        ['@state(button) button, button .label', '', [':host'], joinExpected([
            'button, button .label {}',
            ':host(:hover) { button, button .label {} }',
            ':host([disabled]) { button, button .label {} }'
        ])],
        ['@state(button) button', '', [':where(:host)'], joinExpected([
            'button {}',
            ':where(:host(:hover)) { button {} }',
            ':where(:host([disabled])) { button {} }'
        ])],
        // host-like target 不分裂外層 host：原地合併（H4），@state 不做提升
        ['@state(:host) :host', '', [':host'], joinExpected([
            ':host {}',
            ':host(:hover) {}',
            ':host([disabled]) {}'
        ])],
        ['@state(:where(:host)) :where(:host) .label', '', [':host'], joinExpected([
            ':where(:host) .label {}',
            ':where(:host(:hover)) .label {}',
            ':where(:host([disabled])) .label {}'
        ])],
    ]

    /**
     * 红队：R8 [D]。
     */
    const redMapping: StateMapping = [
        ['@state(:host) .label', '', [], ''],
    ]

    for (const [header, body, ancestors, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, hostCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, ancestors, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const output = handleStateBlock(header, body, hostCtx(ancestors), echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }
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
            'button.medium:has(.label) {}', 'button.medium[disabled]:has(.label) {}',
            'button.large:has(.label) {}', 'button.large[disabled]:has(.label) {}'
        ])],
        ['@state(button) .container>button:has(.label)>.label', '', [], joinExpected([
            '.container>button.medium:has(.label)>.label {}', '.container>button.medium[disabled]:has(.label)>.label {}',
            '.container>button.large:has(.label)>.label {}', '.container>button.large[disabled]:has(.label)>.label {}'
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
            'button.medium:is(.icon,.label) {}', 'button.medium[disabled]:is(.icon,.label) {}',
            'button.large:is(.icon,.label) {}', 'button.large[disabled]:is(.icon,.label) {}'
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
            'button.medium[type="submit"] {}', 'button.medium[disabled][type="submit"] {}',
            'button.large[type="submit"] {}', 'button.large[disabled][type="submit"] {}'
        ])],
        ['@state(button) button[class*="btn-"]', '', [], joinExpected([
            'button.medium[class*="btn-"] {}', 'button.medium[disabled][class*="btn-"] {}',
            'button.large[class*="btn-"] {}', 'button.large[disabled][class*="btn-"] {}'
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
            'button.medium:has(button) {}', 'button.medium[disabled]:has(button) {}',
            'button.large:has(button) {}', 'button.large[disabled]:has(button) {}'
        ])],
        ['@state(button) .container button[data-x="button"]', '', [], joinExpected([
            '.container button.medium[data-x="button"] {}', '.container button.medium[disabled][data-x="button"] {}',
            '.container button.large[data-x="button"] {}', '.container button.large[disabled][data-x="button"] {}'
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

    /**
     * custom-state：S1 挂元素；S2 挂 :host 合入括号。
     * S3（与 @when 协同提升）与 @when 嵌套行归 when-spec / 集成层。
     */
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

    /**
     * 红队：R8 [D]。
     */
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

describe('when-in-body', () => {
    const sizeStates: readonly StateDimensionItem[] = [
        { name: 'small', modifier: '.small', target: 'self' },
        { name: 'medium', modifier: '.medium', target: 'self' },
        { name: 'large', modifier: '.large', target: 'self' }
    ]
    const stateCtx = (ancestors: readonly string[] = []) => fakeBaseCtx({
        states: sizeStates,
        isCombo: false,
        ancestorPath: ancestors
    })

    /**
     * S3：@state 体内的 @when 按状态展开后提升；非法 @when 表头静默跳过。
     */
    const greenMapping: StateMapping = [
        ['@state(button) button', '@when(:host([checked])) { color: red; }', [], joinExpected([
            'button.small {}',
            'button.medium {}',
            'button.large {}',
            ':host([checked]) { button.small { color: red } button.medium { color: red } button.large { color: red } }'
        ])],
        ['@state(button) button', '@when(:host([checked])) { color: red; }', ['.wrapper'], joinExpected([
            'button.small {}',
            'button.medium {}',
            'button.large {}',
            ':host([checked]) { .wrapper { button.small { color: red } button.medium { color: red } button.large { color: red } } }'
        ])],
        ['@state(button) button', '@when() { color: red; }', [], joinExpected([
            'button.small {}', 'button.medium {}', 'button.large {}'
        ])],
    ]

    const redMapping: StateMapping = []

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
