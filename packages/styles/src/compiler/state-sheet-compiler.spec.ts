/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Scope: single-engine `compileStateSheet` — plain CSS and `@keyframes` pass
 * through unchanged (state-variable rewriting only happens inside `@state`
 * blocks, oracled in `at-rules/`), while removed-DSL stylesheets (`@anchor`,
 * `@slot` / `@slotted`, `@size`, `@elevation`) drop to empty with an
 * `invalid-legacy-syntax` warning. The compiler-output helpers
 * (`stripComments`, `splitSelectorByComma`, `appendToHostSelector`,
 * `composeStateSelector`) are covered below; `@state` / exact `@variant` /
 * `@when(:host(...))` semantics live in `at-rules/`.
 *
 * Mapping-format suite: compiler outputs use
 * `[label, css, mustContain, mustNotContain?, fixture?]`; string helpers use
 * `[input, expected]` rows. Containment here is exact-substring on raw output.
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { emptyTables, withState, type TriggerTables } from '../triggers'
import { compileStateSheet, stripComments, composeStateSelector, appendToHostSelector, splitSelectorByComma } from './index'

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
const baseTriggers = withState({
    'enabled': '',
    'hovered': ':hover',
    'pressed': ':active',
    'disabled': '[disabled]'
})(emptyTables)

const loweringSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
const loweringDef = createStyleDefinition(loweringSchema)({
    'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#9e9e9e']
})
const loweringTriggers = withState({
    'enabled': '',
    'hovered': ':hover',
    'disabled': '[disabled]'
})(emptyTables)

const shorthandSchema = defineSchema(['enabled', 'hovered'] as const)
const shorthandDef = createStyleDefinition(shorthandSchema)({
    'outline-color': ['#79747e', '#6750a4'],
    'label-color': ['#49454f', '#1d192b'],
    'container-color': ['transparent', '#e8def8']
})
const shorthandTriggers = withState({
    'enabled': '',
    'hovered': ':hover'
})(emptyTables)

const wrapperSchema = defineSchema(['enabled', 'hovered'] as const)
const wrapperDef = createStyleDefinition(wrapperSchema)({
    'container-color': ['#6750a4', '#7f67be']
})
const wrapperTriggers = withState({
    'enabled': '',
    'hovered': ':hover'
})(emptyTables)

const taskButtonSchema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)
const taskButtonDef = createStyleDefinition(taskButtonSchema)({
    'container-shape': '20px',
    'container-height': '40px',
    'container-color': ['#6750a4', '#7f67be', '#4f378b', '#6750a4', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9e9e9e']
})
const taskButtonTriggers = withState({
    'enabled': '',
    'hovered': ':hover',
    'pressed': ':active',
    'focused': ':focus-visible',
    'disabled': '[disabled]'
})(emptyTables)

const checkboxSchema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)
const checkboxDef = createStyleDefinition(checkboxSchema)({
    'container-size': '18px',
    'container-shape': '2px',
    'container-color': ['transparent', '#6750a4', '#6750a4'],
    'outline-color': ['#79747e', 'transparent', 'transparent'],
    'icon-color': ['transparent', '#ffffff', '#ffffff']
})
const checkboxTriggers = withState({
    'enabled': '',
    'checked': '[checked]',
    'indeterminate': '[indeterminate]'
})(emptyTables)

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
    'comma': { def: commaDef, tables: undefined },
    'base': { def: baseDef, tables: baseTriggers },
    'lowering': { def: loweringDef, tables: undefined },
    'lowering-triggers': { def: loweringDef, tables: loweringTriggers },
    'shorthand': { def: shorthandDef, tables: shorthandTriggers },
    'wrapper': { def: wrapperDef, tables: wrapperTriggers },
    'task-button': { def: taskButtonDef, tables: taskButtonTriggers },
    'checkbox': { def: checkboxDef, tables: checkboxTriggers },
    'badge': { def: badgeDef, tables: undefined },
    'loading': { def: loadingDef, tables: undefined }
} as const

type ContainsRow = readonly [
    label: string,
    css: string,
    mustContain: readonly string[],
    mustNotContain?: readonly string[],
    fixture?: keyof typeof fixtures
]

function runContainsRow([, css, mustContain, mustNotContain = [], fixture = 'comma']: ContainsRow): void {
    const compiled = compileStateSheet(fixtures[fixture].def, css, { tables: fixtures[fixture].tables })
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
        const hoveredTriggers = withState({ 'hovered': ':hover' })(emptyTables)
        const selectedTriggers = withState({ 'selected': '[selected]' })(emptyTables)

        const mapping: Array<[string, { anchor: string; targetSelector: string; states: string[] }, string, TriggerTables]> = [
            ['pseudo-element modifier attaches before pseudo-element',
                { anchor: '.container::after', targetSelector: '.container::after', states: ['hovered'] },
                '.container:hover::after', hoveredTriggers],
            ['host trigger on container anchor',
                { anchor: '.container', targetSelector: '.container .label', states: ['selected'] },
                ':host([selected]) .container .label', selectedTriggers],
        ]

        for (const [label, args, expected, tables] of mapping) {
            it(label, () => {
                expect(composeStateSelector({ ...args, tables })).toBe(expected)
            })
        }
    })

    describe('Comma-Separated :host Selector Lists', () => {
        const mapping: ContainsRow[] = [
            ['one valid rule per :host branch instead of a corrupted combination',
                ':host([focused]), :host([persistent]) { display: flex; opacity: 1; color: var(--_color); }',
                [':host([focused]), :host([persistent]) {', 'display: flex;', 'color: var(--_color);'],
                ['[focused][', '])(['],
                'comma'],
            ['comma :host branches valid inside @starting-style and @media wrappers',
                '@starting-style { :host([focused]), :host([persistent]) { opacity: 0; } } @media (forced-colors: active) { :host([focused]), :host([persistent]) { color: Highlight; } }',
                ['@starting-style', '@media (forced-colors: active)', ':host([focused]), :host([persistent]) {'],
                ['[focused][', '])(['],
                'comma'],
            ['single :host selectors and :host with pseudo-classes pass through unchanged',
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

    describe('Plain Rules Pass Through Without State Expansion', () => {
        const mapping: ContainsRow[] = [
            ['invariant declarations and nested rules pass through as written',
                '.container { border-radius: var(--_container-shape); display: flex; height: 40px; }',
                ['.container {', 'border-radius: var(--_container-shape);', 'display: flex;', 'height: 40px;'],
                [':hover', ':active', '[disabled]'],
                'base'],
            ['unprefixed state-token references pass through untouched outside @state',
                '.container { background-color: var(--_container-color); } .container .label { color: var(--_label-color); }',
                ['.container {', 'background-color: var(--_container-color);', 'color: var(--_label-color);'],
                ['--_enabled-', '--_hovered-', '--_disabled-'],
                'base'],
        ]

        for (const row of mapping) {
            it(row[0], () => {
                runContainsRow(row)
            })
        }
    })

    describe('Removed DSL Drops To Empty', () => {
        const dropRows: Array<[label: string, css: string, fixture?: keyof typeof fixtures]> = [
            ['@anchor base rule', '@anchor .container { border-radius: var(--_container-shape); background-color: var(--_container-color); .label { color: var(--_label-color); } }', 'base'],
            ['@anchor with @when conditions', '@anchor .container { @when(.dense) { padding: 4px; } @when(:host([variant="elevated"])) { box-shadow: 0 2px 4px rgba(0,0,0,0.2); } }', 'lowering'],
            ['@anchor with exact @variant names', '@anchor .container { @variant(outlined) { border: 1px solid var(--_label-color); } @variant(filled, tonal) { background-color: var(--_container-color); } }', 'lowering'],
            ['@anchor with @slot and @slotted', '@anchor .container { @slot(leading) { margin-inline-end: 8px; } @slot(default) { flex: 1; } @slotted(leading) { color: inherit; } @slotted(default) { font-weight: 500; } }', 'lowering'],
            ['@anchor with @size sugar', '@anchor .container { @size(small) { height: 32px; } @size(large) { height: 48px; } }', 'lowering'],
            ['@anchor with @elevation', '@anchor .container { background-color: var(--_container-color); transition: transform 200ms ease; @elevation(1) }', 'lowering-triggers'],
            ['@anchor with border shorthand', '@anchor .container { border: 1px solid var(--_label-color); }', 'shorthand'],
            ['@anchor with outline shorthand', '@anchor .container { outline: 2px solid var(--_outline-color); }', 'shorthand'],
            ['@anchor with background shorthand', '@anchor .container { background: var(--_container-color); }', 'shorthand'],
            ['@anchor task-button scenario', '@anchor .container { display: inline-flex; align-items: center; justify-content: center; height: var(--_container-height); border-radius: var(--_container-shape); background-color: var(--_container-color); .label { color: var(--_label-color); font-family: Roboto, sans-serif; } @slot(leading) { margin-inline-end: 8px; } @variant(outlined) { background-color: transparent; border: 1px solid var(--_label-color); } @elevation(1) }', 'task-button'],
            ['@anchor checkbox scenario', '@anchor .container { width: var(--_container-size); height: var(--_container-size); border-radius: var(--_container-shape); background-color: var(--_container-color); border: 2px solid var(--_outline-color); .mark { fill: var(--_icon-color); } }', 'checkbox'],
            ['@anchor badge scenario with @size', '@anchor .container { background-color: var(--_container-color); color: var(--_label-color); border-radius: var(--_container-shape); width: var(--_container-size); height: var(--_container-size); @size(large) { padding-inline: 4px; } }', 'badge'],
            ['@anchor with unmapped custom state', '@anchor .container { color: var(--_color); }', 'loading'],
        ]

        for (const [label, css, fixture = 'comma'] of dropRows) {
            it(label, () => {
                const warnings: Array<{ type: string }> = []
                const compiled = compileStateSheet(fixtures[fixture].def, css, {
                    tables: fixtures[fixture].tables,
                    onWarn: (w) => warnings.push(w)
                })
                expect(compiled).toBe('')
                expect(warnings.map((w) => w.type)).toContain('invalid-legacy-syntax')
            })
        }

        it('@anchor inside @layer and @media wrappers drops content but keeps isolation shells', () => {
            const warnings: Array<{ type: string }> = []
            const compiled = compileStateSheet(
                fixtures['wrapper'].def,
                '@layer components { @media (min-width: 600px) { @anchor .container { background-color: var(--_container-color); } } }',
                { tables: fixtures['wrapper'].tables, onWarn: (w) => warnings.push(w) }
            )
            expect(compiled).toBe('@layer components { @media (min-width: 600px) {} }')
            expect(warnings.map((w) => w.type)).toContain('invalid-legacy-syntax')
        })
    })

    describe('Wrapper At-Rules & Keyframes Pass Through', () => {
        const mapping: ContainsRow[] = [
            ['preserves @keyframes without state expansion',
                '@keyframes pulse { 0% { background-color: var(--_container-color); } 100% { opacity: 0; } }',
                ['@keyframes pulse {', 'background-color: var(--_container-color);'],
                ['@keyframes pulse:hover', 'var(--_hovered-container-color)'],
                'wrapper'],
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
    })
})
