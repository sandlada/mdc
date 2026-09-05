/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Scope: legacy routing branch of `compileStateSheet` (stylesheets containing
 * `@anchor <sel>` / `@size`; token-differential Base + Delta rules, legacy
 * `@when` / `@slot` / `@slotted` / `@size` / `@elevation` lowering).
 * New-system semantics (`@state` / exact `@variant` / `@when(:host(...))`) are
 * oracled in `at-rules.spec.ts` and must not be conflated with the legacy
 * expectations below (e.g. `@when(.dense)` lowers here, but is
 * `invalid-when-condition` on the new path per W1).
 *
 * Mapping-format suite: compiler outputs use
 * `[label, css, mustContain, mustNotContain?, fixture?]`; string helpers use
 * `[input, expected]` rows. Containment here is exact-substring on raw output.
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { mapStateTriggers } from './map-state-triggers'
import { compileStateSheet, stripComments, composeStateSelector, appendToHostSelector, splitSelectorByComma } from './state-sheet-compiler'

const commaSchema = defineSchema(['enabled'] as const)
const commaDef = createStyleDefinition(commaSchema)({
    'duration': '500ms',
    'color': '#000000'
})

const baseSchema = defineSchema(['enabled', 'hovered', 'pressed', 'disabled'] as const)
const baseDef = createStyleDefinition(baseSchema)({
    'container-shape': '8px',
    'container-color': ['#6750a4', '#7f67be', '#4f378b', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#ffffff', '#9e9e9e']
})
const baseTriggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover',
    'pressed': ':active',
    'disabled': '[disabled]'
})

const loweringSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
const loweringDef = createStyleDefinition(loweringSchema)({
    'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#9e9e9e']
})
const loweringTriggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover',
    'disabled': '[disabled]'
})

const shorthandSchema = defineSchema(['enabled', 'hovered'] as const)
const shorthandDef = createStyleDefinition(shorthandSchema)({
    'outline-color': ['#79747e', '#6750a4'],
    'label-color': ['#49454f', '#1d192b'],
    'container-color': ['transparent', '#e8def8']
})
const shorthandTriggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover'
})

const wrapperSchema = defineSchema(['enabled', 'hovered'] as const)
const wrapperDef = createStyleDefinition(wrapperSchema)({
    'container-color': ['#6750a4', '#7f67be']
})
const wrapperTriggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover'
})

const taskButtonSchema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)
const taskButtonDef = createStyleDefinition(taskButtonSchema)({
    'container-shape': '20px',
    'container-height': '40px',
    'container-color': ['#6750a4', '#7f67be', '#4f378b', '#6750a4', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9e9e9e']
})
const taskButtonTriggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover',
    'pressed': ':active',
    'focused': ':focus-visible',
    'disabled': '[disabled]'
})

const checkboxSchema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)
const checkboxDef = createStyleDefinition(checkboxSchema)({
    'container-size': '18px',
    'container-shape': '2px',
    'container-color': ['transparent', '#6750a4', '#6750a4'],
    'outline-color': ['#79747e', 'transparent', 'transparent'],
    'icon-color': ['transparent', '#ffffff', '#ffffff']
})
const checkboxTriggers = mapStateTriggers({
    'enabled': '',
    'checked': '[checked]',
    'indeterminate': '[indeterminate]'
})

const badgeSchema = defineSchema(['small', 'large'] as const)
const badgeDef = createStyleDefinition(badgeSchema)({
    'container-color': '#b3261e',
    'label-color': '#ffffff',
    'container-size': ['6px', '16px'],
    'container-shape': ['3px', '8px']
})

const loadingSchema = defineSchema(['enabled', 'loading'] as const)
const loadingDef = createStyleDefinition(loadingSchema)({
    'color': ['#000', '#fff']
})

const fixtures = {
    'comma': { def: commaDef, registry: undefined },
    'base': { def: baseDef, registry: baseTriggers },
    'lowering': { def: loweringDef, registry: undefined },
    'lowering-triggers': { def: loweringDef, registry: loweringTriggers },
    'shorthand': { def: shorthandDef, registry: shorthandTriggers },
    'wrapper': { def: wrapperDef, registry: wrapperTriggers },
    'task-button': { def: taskButtonDef, registry: taskButtonTriggers },
    'checkbox': { def: checkboxDef, registry: checkboxTriggers },
    'badge': { def: badgeDef, registry: undefined },
    'loading': { def: loadingDef, registry: undefined }
} as const

type ContainsRow = readonly [
    label: string,
    css: string,
    mustContain: readonly string[],
    mustNotContain?: readonly string[],
    fixture?: keyof typeof fixtures
]

function runContainsRow([, css, mustContain, mustNotContain = [], fixture = 'comma']: ContainsRow): void {
    const compiled = compileStateSheet(fixtures[fixture].def, css, { registry: fixtures[fixture].registry })
    for (const snippet of mustContain) {
        expect(compiled).toContain(snippet)
    }
    for (const snippet of mustNotContain) {
        expect(compiled).not.toContain(snippet)
    }
}

describe('state-sheet-compiler', () => {
    describe('stripComments', () => {
        const mapping: Array<[string, string]> = [
            ['/* header comment */ .container { color: red; /* inline */ }', '.container { color: red;  }'],
            ['// top comment\n.container {\n    color: red; // trailing\n}', '.container {\n    color: red; \n}'],
            ['.container { content: "/* not a comment */"; url: "//test.png"; }', '.container { content: "/* not a comment */"; url: "//test.png"; }'],
        ]

        for (const [input, expected] of mapping) {
            it(input, () => {
                expect(stripComments(input).trim()).toBe(expected)
            })
        }
    })

    describe('splitSelectorByComma', () => {
        const mapping: Array<[string, readonly string[]]> = [
            [':host([data-val="a, b"]), :host(:is(.x, .y)), .container', [':host([data-val="a, b"])', ':host(:is(.x, .y))', '.container']],
        ]

        for (const [input, expected] of mapping) {
            it(input, () => {
                expect(splitSelectorByComma(input)).toEqual(expected)
            })
        }
    })

    describe('appendToHostSelector', () => {
        const mapping: Array<[[string, string], string]> = [
            [[ ':host', '[selected]' ], ':host([selected])'],
            [[ ':host([variant="elevated"])', '[selected]' ], ':host([variant="elevated"][selected])'],
            [[ ':host(:not([disabled]))', '[selected]' ], ':host(:not([disabled])[selected])'],
            [[ ':host(:is([v="a"], [v="b"]))', '[selected]' ], ':host(:is([v="a"], [v="b"])[selected])'],
            [[ ':host([data-expr="fn(1, 2)"])', '[selected]' ], ':host([data-expr="fn(1, 2)"][selected])'],
        ]

        for (const [[base, modifier], expected] of mapping) {
            it(`append ${modifier} to ${base}`, () => {
                expect(appendToHostSelector(base, modifier)).toBe(expected)
            })
        }
    })

    describe('composeStateSelector', () => {
        const hoveredTriggers = mapStateTriggers({ 'hovered': ':hover' })
        const selectedTriggers = mapStateTriggers({ 'selected': '[selected]' })

        const mapping: Array<[string, { anchor: string; targetSelector: string; states: string[] }, string, ReturnType<typeof mapStateTriggers>]> = [
            ['pseudo-element modifier attaches before pseudo-element',
                { anchor: '.container::after', targetSelector: '.container::after', states: ['hovered'] },
                '.container:hover::after', hoveredTriggers],
            ['host trigger on container anchor',
                { anchor: '.container', targetSelector: '.container .label', states: ['selected'] },
                ':host([selected]) .container .label', selectedTriggers],
        ]

        for (const [label, args, expected, registry] of mapping) {
            it(label, () => {
                expect(composeStateSelector({ ...args, registry })).toBe(expected)
            })
        }
    })

    describe('Comma-Separated :host Selector Lists', () => {
        const mapping: ContainsRow[] = [
            ['one valid rule per :host branch instead of a corrupted combination',
                ':host([focused]), :host([persistent]) { display: flex; opacity: 1; color: var(--_color); }',
                [':host([focused]) {', ':host([persistent]) {', 'color: var(--_color);'],
                ['[focused][', '])([', ':host([focused]), :host([persistent]) {'],
                'comma'],
            ['comma :host branches valid inside @starting-style and @media wrappers',
                '@starting-style { :host([focused]), :host([persistent]) { opacity: 0; } } @media (forced-colors: active) { :host([focused]), :host([persistent]) { color: Highlight; } }',
                ['@starting-style', '@media (forced-colors: active)', ':host([focused]) {', ':host([persistent]) {'],
                ['[focused][', '])(['],
                'comma'],
            ['single :host selectors and :host with pseudo-classes stay on the legacy path',
                ':host([focused]:not([inward])) { animation-name: outward-grow; } :host { display: none; }',
                [':host([focused]:not([inward])) {', ':host {'],
                [],
                'comma'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('Base Rule & Differential Minimal Delta Rules', () => {
        const mapping: ContainsRow[] = [
            ['Base Rule with invariant tokens and enabled state private variables',
                '@anchor .container { border-radius: var(--_container-shape); background-color: var(--_container-color); .label { color: var(--_label-color); } }',
                ['.container {', 'border-radius: var(--_container-shape);', 'background-color: var(--_enabled-container-color);', '.container .label {', 'color: var(--_enabled-label-color);'],
                [],
                'base'],
            ['Delta Rules only for states where token values actually differ',
                '@anchor .container { background-color: var(--_container-color); .label { color: var(--_label-color); } }',
                ['.container:hover {', 'background-color: var(--_hovered-container-color);', '.container:active {', 'background-color: var(--_pressed-container-color);', ':host([disabled]) .container {', 'background-color: var(--_disabled-container-color);', ':host([disabled]) .container .label {', 'color: var(--_disabled-label-color);'],
                ['.container:hover .label', '.container:active .label'],
                'base'],
            ['zero Delta Rules when all referenced tokens in a rule block are invariant',
                '@anchor .container { border-radius: var(--_container-shape); display: flex; height: 40px; }',
                ['.container {', 'border-radius: var(--_container-shape);', 'display: flex;', 'height: 40px;'],
                [':hover', ':active', '[disabled]'],
                'base'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('ATRules Lowering Grammar', () => {
        const mapping: ContainsRow[] = [
            ['lowers @when(...) conditions',
                '@anchor .container { @when(.dense) { padding: 4px; } @when(:host([variant="elevated"])) { box-shadow: 0 2px 4px rgba(0,0,0,0.2); } }',
                ['.container.dense {', 'padding: 4px;', ':host([variant="elevated"]) .container {', 'box-shadow: 0 2px 4px rgba(0,0,0,0.2);'],
                [],
                'lowering'],
            ['lowers @variant(...) for single and comma-separated variants',
                '@anchor .container { @variant(outlined) { border: 1px solid var(--_label-color); } @variant(filled, tonal) { background-color: var(--_container-color); } }',
                [':host([variant="outlined"]) .container {', ':host([variant="filled"]) .container, :host([variant="tonal"]) .container {'],
                [],
                'lowering'],
            ['lowers @slot(...) and @slotted(...)',
                '@anchor .container { @slot(leading) { margin-inline-end: 8px; } @slot(default) { flex: 1; } @slotted(leading) { color: inherit; } @slotted(default) { font-weight: 500; } }',
                [':host(:has([slot="leading"])) .container {', 'margin-inline-end: 8px;', ':host(:has(:not([slot]))) .container {', 'flex: 1;', '::slotted([slot="leading"]) {', '::slotted(:not([slot])) {'],
                [],
                'lowering'],
            ['lowers @size(...) sugar',
                '@anchor .container { @size(small) { height: 32px; } @size(large) { height: 48px; } }',
                [':host([size="small"]) .container {', 'height: 32px;', ':host([size="large"]) .container {', 'height: 48px;'],
                [],
                'lowering'],
            ['expands @elevation(...) and merges transitions',
                '@anchor .container { background-color: var(--_container-color); transition: transform 200ms ease; @elevation(1) }',
                ['box-shadow: var(--mdc-elevation-level-1);', 'transition: transform 200ms ease, box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);', ':host([disabled]) .container {', 'box-shadow: none;'],
                [],
                'lowering-triggers'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('CSS Shorthand Decomposition', () => {
        const mapping: ContainsRow[] = [
            ['decomposes border shorthand into minimal border-color in delta rules',
                '@anchor .container { border: 1px solid var(--_label-color); }',
                ['.container {', 'border: 1px solid var(--_enabled-label-color);', '.container:hover {', 'border-color: var(--_hovered-label-color);'],
                ['border: 1px solid var(--_hovered-label-color);'],
                'shorthand'],
            ['decomposes outline shorthand into outline-color in delta rules',
                '@anchor .container { outline: 2px solid var(--_outline-color); }',
                ['.container {', 'outline: 2px solid var(--_enabled-outline-color);', '.container:hover {', 'outline-color: var(--_hovered-outline-color);'],
                [],
                'shorthand'],
            ['decomposes background shorthand into background-color in delta rules',
                '@anchor .container { background: var(--_container-color); }',
                ['.container:hover {', 'background-color: var(--_hovered-container-color);'],
                [],
                'shorthand'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('Wrapper At-Rules & Keyframes Isolation', () => {
        const mapping: ContainsRow[] = [
            ['preserves wrapper at-rules like @layer, @media, @supports, @container, @starting-style',
                '@layer components { @media (min-width: 600px) { @anchor .container { background-color: var(--_container-color); } } }',
                ['@layer components {', '@media (min-width: 600px) {', '.container {', 'background-color: var(--_enabled-container-color);', '.container:hover {', 'background-color: var(--_hovered-container-color);'],
                [],
                'wrapper'],
            ['preserves @keyframes without proliferating state delta rules',
                '@keyframes pulse { 0% { background-color: var(--_container-color); } 100% { opacity: 0; } }',
                ['@keyframes pulse {', 'background-color: var(--_enabled-container-color);'],
                ['@keyframes pulse:hover', 'var(--_hovered-container-color)'],
                'wrapper'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('End-to-End Scenarios from TASK.md', () => {
        const mapping: ContainsRow[] = [
            ['Scenario 1: Button Component with 5 states, variant, slot, and elevation',
                '@anchor .container { display: inline-flex; align-items: center; justify-content: center; height: var(--_container-height); border-radius: var(--_container-shape); background-color: var(--_container-color); .label { color: var(--_label-color); font-family: Roboto, sans-serif; } @slot(leading) { margin-inline-end: 8px; } @variant(outlined) { background-color: transparent; border: 1px solid var(--_label-color); } @elevation(1) }',
                ['.container {', 'background-color: var(--_enabled-container-color);', '.container .label {', ':host(:has([slot="leading"])) .container {', ':host([variant="outlined"]) .container {', '.container:hover {', '.container:active {', ':host([disabled]) .container {', 'box-shadow: none;'],
                [],
                'task-button'],
            ['Scenario 2: Checkbox Component with Boolean States',
                '@anchor .container { width: var(--_container-size); height: var(--_container-size); border-radius: var(--_container-shape); background-color: var(--_container-color); border: 2px solid var(--_outline-color); .mark { fill: var(--_icon-color); } }',
                ['.container {', 'border: 2px solid var(--_enabled-outline-color);', ':host([checked]) .container {', 'background-color: var(--_checked-container-color);', 'border-color: var(--_checked-outline-color);', ':host([indeterminate]) .container {', 'background-color: var(--_indeterminate-container-color);', 'border-color: var(--_indeterminate-outline-color);'],
                [],
                'checkbox'],
            ['Scenario 3: Badge Component with Size Schema & @size Sugar',
                '@anchor .container { background-color: var(--_container-color); color: var(--_label-color); border-radius: var(--_container-shape); width: var(--_container-size); height: var(--_container-size); @size(large) { padding-inline: 4px; } }',
                ['.container {', 'border-radius: var(--_small-container-shape);', 'width: var(--_small-container-size);', ':host([size="large"]) .container {', 'border-radius: var(--_large-container-shape);', 'width: var(--_large-container-size);', 'padding-inline: 4px;'],
                [],
                'badge'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('Edge Cases & Error Handling', () => {
        const emptyRows: Array<[string, string]> = [
            ['', ''],
            ['   ', ''],
        ]

        for (const [input, expected] of emptyRows) {
            it(`empty input: '${input}'`, () => {
                expect(compileStateSheet({}, input)).toBe(expected)
            })
        }

        const mapping: ContainsRow[] = [
            ['unmapped custom state with automatic heuristic fallback',
                '@anchor .container { color: var(--_color); }',
                ['.container.loading {', 'color: var(--_loading-color);'],
                [],
                'loading'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }

    })
})
