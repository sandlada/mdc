/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Mapping-format suite: every row is `[input, expected, opts?]` where `opts`
 * selects the fixture/entry and any warning or containment assertions.
 * Row order follows the original Issue 1–17 grouping (kept as comments).
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { mapStateTriggers } from './map-state-triggers'
import {
    compileAtRulesSheet,
    expandDeclaration,
    splitCssValues,
    replaceTargetInBranch,
    removeAmpersandForHostSubtree,
    isAtRulesStylesheet,
    hasDefiniteAtRules,
    rewriteStateVariables
} from './at-rules-compiler'
import { compileStateSheet, extractStateTokenMetadata, type StyleDiagnosticWarning } from './state-sheet-compiler'

function normalizeCss(css: string | readonly string[]): string {
    const text: string = typeof css === 'string' ? css : css.join(' ')
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

const ComboSchema = defineSchema([['medium', 'large'], ['enabled', 'disabled']] as const)
const ComboDef = createStyleDefinition(ComboSchema)({
    'size': { 'medium': '12px', 'large': '16px' },
    'opacity': { 'enabled': '1', 'disabled': '0.38' }
})
const ComboTriggers = mapStateTriggers({
    'medium': '.medium',
    'large': '.large',
    'enabled': '',
    'disabled': '[disabled]'
})

const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
const SizeDef = createStyleDefinition(SizeSchema)({ 'size': [12, 14, 16] })
const SizeTriggers = mapStateTriggers({
    'small': '.small',
    'medium': '.medium',
    'large': '.large'
})

const TwoStateSchema = defineSchema(['small', 'medium'] as const)
const TwoStateDef = createStyleDefinition(TwoStateSchema)({ 'size': [12, 14] })
const TwoStateTriggers = mapStateTriggers({ 'small': '.small', 'medium': '.medium' })

const LargeComboSchema = defineSchema([
    ['d1a', 'd1b', 'd1c'],
    ['d2a', 'd2b', 'd2c'],
    ['d3a', 'd3b', 'd3c'],
    ['d4a', 'd4b', 'd4c'],
    ['d5a', 'd5b', 'd5c']
] as const)
const LargeComboDef = createStyleDefinition(LargeComboSchema)({
    'size': { 'd1a': 10, 'd1b': 12, 'd1c': 14 }
})

type WarnExpect = string | { type: string; count?: number; min?: number }

interface SheetOpts {
    readonly fixture?: 'combo' | 'size' | 'two-state' | 'large-combo'
    readonly entry?: 'atrules'
    readonly warn?: WarnExpect
    readonly absent?: string | readonly string[]
    readonly present?: string | readonly string[]
}

type SheetRow = readonly [input: string, expected: string | readonly string[] | null, opts?: SheetOpts]

const fixtures = {
    'combo': { def: ComboDef, registry: ComboTriggers },
    'size': { def: SizeDef, registry: SizeTriggers },
    'two-state': { def: TwoStateDef, registry: TwoStateTriggers },
    'large-combo': { def: LargeComboDef, registry: undefined }
} as const

function runSheetRow([input, expected, opts]: SheetRow): void {
    const warnings: StyleDiagnosticWarning[] = []
    const onWarn = (w: StyleDiagnosticWarning): void => {
        warnings.push(w)
    }
    const fixture = opts?.fixture !== undefined ? fixtures[opts.fixture] : undefined
    const def = fixture?.def ?? {}
    const options = fixture?.registry !== undefined
        ? { registry: fixture.registry, onWarn }
        : { onWarn }
    const output = opts?.entry === 'atrules'
        ? compileAtRulesSheet(def, input, options)
        : compileStateSheet(def, input, options)

    if (expected !== null) {
        expect(normalizeCss(output)).toBe(normalizeCss(expected))
    }
    if (opts?.present !== undefined) {
        const present = Array.isArray(opts.present) ? opts.present : [opts.present]
        for (const snippet of present) {
            expect(normalizeCss(output)).toContain(normalizeCss(snippet))
        }
    }
    if (opts?.absent !== undefined) {
        const absent = Array.isArray(opts.absent) ? opts.absent : [opts.absent]
        for (const snippet of absent) {
            expect(output).not.toContain(snippet)
        }
    }
    if (opts?.warn !== undefined) {
        const type = typeof opts.warn === 'string' ? opts.warn : opts.warn.type
        const count = typeof opts.warn === 'string' ? undefined : opts.warn.count
        const min = typeof opts.warn === 'string' ? undefined : opts.warn.min
        expect(warnings.some((w) => w.type === type)).toBe(true)
        if (count !== undefined) {
            expect(warnings.length).toBe(count)
        }
        if (min !== undefined) {
            expect(warnings.length).toBeGreaterThanOrEqual(min)
        }
    }
}

describe('at-rules-compiler — Adversarial Reviewer Verification Suite', () => {
    const sheetRows: SheetRow[] = [
        // Issue 1: Outer :host attributes/modifiers preservation when hoisting @when
        [':host([dense]) { .wrapper { @when(:host([checked])) { button { color: red; } } } }', ':host([dense]) { .wrapper {} } :host([dense][checked]) { .wrapper { button { color: red; } } }'],
        [':where(:host) { .card { @when(:host([checked])) { padding: 8px; } } }', ':where(:host) { .card {} } :where(:host([checked])) { .card { padding: 8px; } }'],
        [':host([dense]) { .card { @when(:host([a]), :host([b])) { padding: 4px; } } }', ':host([dense]) { .card {} } :host([dense][a]), :host([dense][b]) { .card { padding: 4px; } }'],
        // Issue 2: Combo state matrix in nested @when inside @state
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} :host([dense]) { button.medium { height: 32px; } button.medium[disabled] { height: 32px; } button.large { height: 32px; } button.large[disabled] { height: 32px; } }', { fixture: 'combo' }],
        [':host([variant="filled"]) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} } :host([variant="filled"][checked]) { button.medium { color: red; } button.medium[disabled] { color: red; } button.large { color: red; } button.large[disabled] { color: red; } }', { fixture: 'combo' }],
        // Issue 3: Rule R8 failure when target does not match non-& selector (no per-state duplication + warning)
        ['@state(button) .card { color: red; }', '.card { color: red; }', { fixture: 'size', entry: 'atrules', warn: { type: 'invalid-state-target', count: 1 } }],
        // Issue 3: R7 — normalize & only when followed by whitespace and an element
        ['.wrapper { @state(button) & button {} }', '.wrapper { button.small {} button.medium {} button.large {} }', { fixture: 'size' }],
        // Issue 5: Non-host conditions in @when (Rule W1) — warning, no hoisting
        ['.card { @when(.dense) { padding: 4px; } }', '.card { .dense { padding: 4px; } }', { entry: 'atrules', warn: { type: 'invalid-when-condition', count: 1 }, absent: '.dense { .card' }],
        // Issue 6: empty/malformed @variant — warning, no empty-shell output
        ['@variant() { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-variant', min: 1 }, absent: ' {}' }],
        // Issue 6: wildcards and negations in @variant
        ['@variant(*, !tonal) { button { color: red; } }', null, { entry: 'atrules', warn: 'invalid-variant-name' }],
        // Issue 7: Zero-& enforcement in hoisted :host subtrees (Rule H2 & W3)
        ['.wrapper { & .inner { @when(:host([checked])) { color: red; } } }', null, { absent: ':host([checked]) { .wrapper { & .inner', present: ':host([checked]) { .wrapper { .inner { color: red; } } }' }],
        // Issue 10: isolation containers preserve outer ancestor context during hoisting
        ['.card { @reduced-motion { @when(:host([dense])) { padding: 4px; } } }', '.card { @media (prefers-reduced-motion: reduce) { :host([dense]) { .card { padding: 4px; } } } }'],
        // Issue 11: invalid @contrast arguments
        ['.card { @contrast(invalid) { color: black; } }', null, { entry: 'atrules', warn: 'invalid-a11y-macro' }],
        // Issue 11: excessive state nesting depth >= 3
        ['@state(button) button { @state(button) button { @state(button) button { @state(button) button { color: red; } } } }', null, { entry: 'atrules', fixture: 'two-state', warn: 'excessive-state-nesting' }],
        // Issue 11: explosive Cartesian combinations exceeding threshold
        ['@state(button) button { color: red; }', null, { entry: 'atrules', fixture: 'large-combo', warn: 'explosive-cartesian-matrix' }],
        // Issue 13: compileStateSheet routes to compileAtRulesSheet even with options.onWarn
        ['.card { @when(:host([dense])) { padding: 4px; } }', '.card {} :host([dense]) { .card { padding: 4px; } }'],
        ['button { shape: 8px 16px; }', 'button { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; }'],
        ['button { @reduced-motion { transition: none; } }', 'button { @media (prefers-reduced-motion: reduce) { transition: none; } }'],
        // Issue 13: invalid-when-condition warning through compileStateSheet entrypoint
        ['.card { @when(.dense) { padding: 4px; } }', '.card { .dense { padding: 4px; } }', { warn: { type: 'invalid-when-condition', count: 1 } }],
        // Issue 15: empty @when() condition list validation
        ['@when() { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-when', count: 1 }, absent: ['{} {', ' {}'] }],
        ['@when(   ) { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-when', count: 1 } }],
        // Issue 16: malformed @state syntax validation (Rule R1)
        ['@state(button) { color: red; }', null, { entry: 'atrules', warn: 'invalid-state-syntax' }],
        ['@state() button { color: red; }', null, { entry: 'atrules', warn: 'invalid-state-syntax' }],
        // Issue 17: deep multi-rule integration composing @variant, @state, @when, and property expanders
        ['@variant(filled) { @state(button) button { shape: 8px 16px; @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.medium { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.large { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } } :host([variant="filled"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }', { fixture: 'size' }],
        // Issue 18: state variable rewriting in @state blocks for multi-state tokens
        ['@state(button) button { height: var(--_size); }', 'button.small { height: var(--_small-size); } button.medium { height: var(--_medium-size); } button.large { height: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button { height: var(--_size, 16px); }', 'button.small { height: var(--_small-size, 16px); } button.medium { height: var(--_medium-size, 16px); } button.large { height: var(--_large-size, 16px); }', { fixture: 'size' }],
        ['@state(button) button { min-width: calc(var(--_size) * 2); }', 'button.small { min-width: calc(var(--_small-size) * 2); } button.medium { min-width: calc(var(--_medium-size) * 2); } button.large { min-width: calc(var(--_large-size) * 2); }', { fixture: 'size' }],
        ['@state(button) button::before { width: var(--_size); }', 'button.small::before { width: var(--_small-size); } button.medium::before { width: var(--_medium-size); } button.large::before { width: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button, button .icon { width: var(--_size); }', 'button.small, button.small .icon { width: var(--_small-size); } button.medium, button.medium .icon { width: var(--_medium-size); } button.large, button.large .icon { width: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button { height: var(--_size); opacity: var(--_opacity); }', 'button.medium { height: var(--_medium-size); opacity: var(--_enabled-opacity); } button.medium[disabled] { height: var(--_medium-size); opacity: var(--_disabled-opacity); } button.large { height: var(--_large-size); opacity: var(--_enabled-opacity); } button.large[disabled] { height: var(--_large-size); opacity: var(--_disabled-opacity); }', { fixture: 'combo' }],
        ['@state(button) button { @when(:host([checked])) { height: var(--_size); } }', 'button.small {} button.medium {} button.large {} :host([checked]) { button.small { height: var(--_small-size); } button.medium { height: var(--_medium-size); } button.large { height: var(--_large-size); } }', { fixture: 'size' }],
    ]

    for (const row of sheetRows) {
        it(row[0], () => {
            runSheetRow(row)
        })
    }

    // Issue 4 + Issue 9: expandDeclaration — rows are [[prop, value], expanded]
    const declRows: Array<[[string, string], string]> = [
        // Issue 4: CSS custom properties without --_ and whitespace
        [['shape', 'var( --mdc-shape )'], 'border-start-start-radius: var(--mdc-shape-start-start); border-start-end-radius: var(--mdc-shape-start-end); border-end-end-radius: var(--mdc-shape-end-end); border-end-start-radius: var(--mdc-shape-end-start);'],
        [['padding', 'var(--mdc-padding)'], 'padding-inline-start: var(--mdc-padding-inline-start); padding-inline-end: var(--mdc-padding-inline-end); padding-block-start: var(--mdc-padding-block-start); padding-block-end: var(--mdc-padding-block-end);'],
        [['typescale', 'var(--mdc-typescale)'], 'font-family: var(--mdc-typescale-font); font-size: var(--mdc-typescale-size); line-height: var(--mdc-typescale-leading); font-weight: var(--mdc-typescale-weight); letter-spacing: var(--mdc-typescale-tracking);'],
        // Issue 9: calc(), multi-value, comments
        [['shape', 'calc(10px + 2px)'], 'border-start-start-radius: calc(10px + 2px); border-start-end-radius: calc(10px + 2px); border-end-end-radius: calc(10px + 2px); border-end-start-radius: calc(10px + 2px);'],
        [['shape', 'calc(10px + 2px) 4px'], 'border-start-start-radius: calc(10px + 2px); border-start-end-radius: 4px; border-end-end-radius: calc(10px + 2px); border-end-start-radius: 4px;'],
        [['padding', 'calc(10px + 2px) 16px'], 'padding-inline-start: 16px; padding-inline-end: 16px; padding-block-start: calc(10px + 2px); padding-block-end: calc(10px + 2px);'],
        [['margin', '8px calc(12px - 4px)'], 'margin-inline-start: calc(12px - 4px); margin-inline-end: calc(12px - 4px); margin-block-start: 8px; margin-block-end: 8px;'],
        [['padding', '8px;'], 'padding: 8px;'],
        [['shape', '8px /* top */ 16px;'], 'border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px;'],
        [['typescale', 'var(--mdc-body /* comment */)'], 'font-family: var(--mdc-body-font); font-size: var(--mdc-body-size); line-height: var(--mdc-body-leading); font-weight: var(--mdc-body-weight); letter-spacing: var(--mdc-body-tracking);'],
    ]

    for (const [[prop, value], expected] of declRows) {
        it(`${prop}: ${value}`, () => {
            expect(expandDeclaration(prop, value)).toBe(expected)
        })
    }

    // Issue 9: splitCssValues — rows are [input, tokens]
    const tokensRows: Array<[string, readonly string[]]> = [
        ['calc(10px + 2px) var(--pad, 4px 8px) 16px', ['calc(10px + 2px)', 'var(--pad, 4px 8px)', '16px']],
    ]

    for (const [input, expected] of tokensRows) {
        it(`split: ${input}`, () => {
            expect(splitCssValues(input)).toEqual(expected)
        })
    }

    // Issue 7: removeAmpersandForHostSubtree — rows are [input, expected]
    const ampRows: Array<[string, string]> = [
        ['& .inner', '.inner'],
        ['& > .inner', '> .inner'],
        ['&', ''],
        ['.card', '.card'],
    ]

    for (const [input, expected] of ampRows) {
        it(`ampersand: ${input}`, () => {
            expect(removeAmpersandForHostSubtree(input)).toBe(expected)
        })
    }

    // Issue 8 + Issue 14: replaceTargetInBranch — rows are [[branch, target, modifier], expectedResult]
    const replaceRows: Array<[[string, string, string], string]> = [
        // Issue 8: tag-attached class / ID targets
        [['div.card', '.card', '.small'], 'div.card.small'],
        [['button#submit', '#submit', '.small'], 'button#submit.small'],
        // Issue 14: combinator variable whitespace in descendant targets
        [['.container   .card', '.container .card', '.active'], '.container   .card.active'],
        [['.container \t .card::before', '.container .card::before', '.active'], '.container \t .card.active::before'],
    ]

    for (const [[branch, target, modifier], expected] of replaceRows) {
        it(`replace ${target} in ${branch}`, () => {
            const res = replaceTargetInBranch(branch, target, modifier)
            expect(res.matched).toBe(true)
            expect(res.result).toBe(expected)
        })
    }

    // Issue 12: isAtRulesStylesheet / hasDefiniteAtRules — rows are [kind, input, expected]
    const flagRows: Array<['is' | 'has', string, boolean]> = [
        ['is', 'button { padding: 16px; }', false],
        ['is', 'button { margin: 0; }', false],
        ['is', 'button { padding: 8px 16px; }', true],
        ['is', 'button { padding: var(--_padding); }', true],
        ['is', 'button { shape: 8px; }', true],
        ['is', 'button { typescale: var(--_label); }', true],
        ['has', '.card { @when(:host([dense])) {} }', true],
        ['has', 'button { shape: 8px; }', true],
        ['has', 'button { @reduced-motion {} }', true],
        ['has', 'div { color: red; }', false],
    ]

    for (const [kind, input, expected] of flagRows) {
        it(`${kind}: ${input}`, () => {
            const actual = kind === 'is' ? isAtRulesStylesheet(input) : hasDefiniteAtRules(input)
            expect(actual).toBe(expected)
        })
    }

    // Issue 6: malformed inputs must not throw or loop
    const malformedInputs: string[] = [
        '@variant(filled { button {} }',
        '@when(:host([checked] { button {}',
        'button { shape: var(--_shape',
        'div { color: "unclosed string',
        '{{{{}}}}',
    ]

    for (const input of malformedInputs) {
        it(`malformed: ${input}`, () => {
            expect(() => compileAtRulesSheet({}, input)).not.toThrow()
        })
    }

    // Issue 18: rewriteStateVariables unit tests
    describe('rewriteStateVariables — exact replacement contract', () => {
        const schema = defineSchema(['small', 'large'] as const)
        const def = createStyleDefinition(schema)({
            'size': ['12px', '16px'],
            'padding': ['4px', '8px'],
            'color': '#ffffff',
            'size-offset': '2px'
        })
        const meta = extractStateTokenMetadata(def)

        it('rewrites state tokens for specified state', () => {
            const input = 'height: var(--_size); padding: var(--_padding);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('height: var(--_small-size); padding: var(--_small-padding);')
        })

        it('preserves fallback values inside var()', () => {
            const input = 'height: var(--_size, 10px); color: var(--_color, red);'
            const result = rewriteStateVariables(input, ['large'], meta)
            expect(result).toBe('height: var(--_large-size, 10px); color: var(--_color, red);')
        })

        it('does not corrupt invariant tokens or tokens with prefix substrings', () => {
            const input = 'color: var(--_color); offset: var(--_size-offset);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('color: var(--_color); offset: var(--_size-offset);')
        })

        it('handles mathematical and nested function expressions', () => {
            const input = 'width: calc(var(--_size) * 2); min-height: min(var(--_size), 30px);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('width: calc(var(--_small-size) * 2); min-height: min(var(--_small-size), 30px);')
        })
    })
})

