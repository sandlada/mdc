/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Scope: legacy routing branch of `compileStateSheet` — wildcard (`*`) and
 * negation (`!`) `@variant` patterns, `matchVariants`, custom `variantSelector`,
 * and `@variant` × `@slot` / `@size` compositions below only apply when the
 * stylesheet routes to the legacy engine (e.g. contains `@anchor` / `@size` /
 * wildcard `@variant`). On the new path (oracled in `at-rules.spec.ts`,
 * V-spec) variant names must be exact dictionary keys; `*` / `!name` emit
 * `invalid-variant-name` instead of filtering.
 *
 * Mapping-format suite: compiler outputs use
 * `[label, css, mustContain, mustNotContain?, opts?]`; unit helpers use
 * `[[args], expected]` rows; diagnostics use `[label, css, checks]` rows.
 */

import { describe, it, expect, vi } from 'vitest'
import { compileStateSheet, matchVariants, appendToHostSelector, type StyleDiagnosticWarning } from './state-sheet-compiler'
import { createStyleSheet } from './create-style-sheet'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { mapStateTriggers } from './map-state-triggers'

const Schema = defineSchema(['enabled', 'hovered', 'disabled'] as const)

const BarVerticalDef = createStyleDefinition(Schema)({
    'container-width': '104px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'vertical-only-token': ['#aaa', '#bbb', '#ccc']
})

const BarHorizontalDef = createStyleDefinition(Schema)({
    'container-width': '92px',
    'container-height': '64px',
    'common-color': ['#111', '#222', '#333'],
    'horizontal-only-token': ['#ddd', '#eee', '#fff']
})

const RailVerticalDef = createStyleDefinition(Schema)({
    'container-width': '80px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'vertical-only-token': ['#aaa', '#bbb', '#ccc']
})

const DrawerDef = createStyleDefinition(Schema)({
    'container-width': '336px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'drawer-only-token': ['#123', '#456', '#789']
})

const MultiVariants = {
    'bar-vertical': BarVerticalDef,
    'bar-horizontal': BarHorizontalDef,
    'rail-vertical': RailVerticalDef,
    'drawer': DrawerDef
} as const

const allVariants = ['bar-vertical', 'bar-horizontal', 'rail-vertical', 'rail-horizontal', 'drawer', 'drawer-horizontal']

const triggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover',
    'disabled': '[disabled]'
})

const customSelector = (v: string): string => `:where(:host([variant="${v}"]), :host(:has(.${v})))`

interface ContainsOpts {
    readonly selector?: 'custom'
    readonly triggers?: boolean
    readonly via?: 'hof'
}

type ContainsRow = readonly [
    label: string,
    css: string,
    mustContain: readonly string[],
    mustNotContain?: readonly string[],
    opts?: ContainsOpts
]

function runContainsRow([label, css, mustContain, mustNotContain = [], opts]: ContainsRow): void {
    let compiled: string
    if (opts?.via === 'hof') {
        const sheet = createStyleSheet({ variantSelector: customSelector })(MultiVariants)(css)
        compiled = sheet.cssText
    } else {
        compiled = compileStateSheet(MultiVariants, css, {
            registry: opts?.triggers === true ? triggers : undefined,
            variantSelector: opts?.selector === 'custom' ? customSelector : undefined
        })
    }
    for (const snippet of mustContain) {
        expect(compiled).toContain(snippet)
    }
    for (const snippet of mustNotContain) {
        expect(compiled).not.toContain(snippet)
    }
}

describe('matchVariants helper', () => {
    const mapping: Array<[[readonly string[], readonly string[]], readonly string[]]> = [
        [[['bar-vertical', 'drawer'], allVariants], ['bar-vertical', 'drawer']],
        [[['*-vertical'], allVariants], ['bar-vertical', 'rail-vertical']],
        [[['bar-*', 'rail-*'], allVariants], ['bar-vertical', 'bar-horizontal', 'rail-vertical', 'rail-horizontal']],
        [[['!drawer*'], allVariants], ['bar-vertical', 'bar-horizontal', 'rail-vertical', 'rail-horizontal']],
        [[['bar-*', '!*-horizontal'], allVariants], ['bar-vertical']],
    ]

    for (const [[patterns, names], expected] of mapping) {
        it(`match ${patterns.join(' ')}`, () => {
            expect(matchVariants(patterns, names)).toEqual(expected)
        })
    }
})

describe('Multi-Variant @variant Compiler', () => {
    const mapping: ContainsRow[] = [
        ['single and comma-separated @variant with default selector',
            '@variant(bar-vertical, rail-vertical) { .container { width: 100%; } }',
            [':host([variant="bar-vertical"]) .container, :host([variant="rail-vertical"]) .container {', 'width: 100%;']],
        ['wildcard pattern matching (*-vertical)',
            '@variant(*-vertical) { .indicator { display: block; } }',
            [':host([variant="bar-vertical"]) .indicator, :host([variant="rail-vertical"]) .indicator {']],
        ['negation pattern matching (!drawer)',
            '@variant(!drawer) { .indicator { border-radius: 8px; } }',
            [':host([variant="bar-vertical"]) .indicator, :host([variant="bar-horizontal"]) .indicator, :host([variant="rail-vertical"]) .indicator {'],
            ['variant="drawer"']],
        ['custom variantSelector option in compileStateSheet',
            '@variant(bar-vertical) { .container { height: 56px; } }',
            [':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container {'],
            [],
            { selector: 'custom' }],
        ['custom variantSelector in createStyleSheet HOF',
            '@variant(drawer) { .container { max-width: 336px; } }',
            [':where(:host([variant="drawer"]), :host(:has(.drawer))) .container {'],
            [],
            { via: 'hof' }],
        ['state triggers composed with @variant rules',
            '@variant(bar-vertical) { @anchor .container { background-color: var(--_common-color); } }',
            [':host([variant="bar-vertical"]) .container {\n    background-color: var(--_enabled-common-color);\n}',
                ':host([variant="bar-vertical"]) .container:hover {\n    background-color: var(--_hovered-common-color);\n}',
                ':host([variant="bar-vertical"][disabled]) .container {\n    background-color: var(--_disabled-common-color);\n}'],
            [],
            { triggers: true }],
        ['bidirectional nesting: @variant inside @anchor and @anchor inside @variant',
            '@anchor .container { @variant(bar-vertical) { padding: 8px; } } @variant(drawer) { @anchor .label { font-size: 14px; } }',
            [':host([variant="bar-vertical"]) .container {\n    padding: 8px;\n}',
                ':host([variant="drawer"]) .label {\n    font-size: 14px;\n}']],
        ['nested @variant blocks',
            '@variant(*-vertical) { @variant(!bar-*) { .indicator { width: 56px; } } }',
            [':host([variant="rail-vertical"]) .indicator {\n    width: 56px;\n}'],
            ['variant="bar-vertical"']],
        ['complex custom variantSelector with @when and state triggers',
            '@variant(bar-vertical) { @anchor .container { background-color: var(--_common-color); @when(:host([checked])) { border-color: #f00; } } }',
            [':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container {\n    background-color: var(--_enabled-common-color);\n}',
                ':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container:hover {\n    background-color: var(--_hovered-common-color);\n}',
                ':where(:host([variant="bar-vertical"][disabled]), :host(:has(.bar-vertical)[disabled])) .container {\n    background-color: var(--_disabled-common-color);\n}',
                ':where(:host([variant="bar-vertical"][checked]), :host(:has(.bar-vertical)[checked])) .container {\n    border-color: #f00;\n}'],
            [],
            { selector: 'custom', triggers: true }],
        ['@variant nested with @slot and @slotted',
            '@variant(bar-vertical) { @slot(icon) { .slot-container { display: flex; } } @slotted(icon) { color: red; } }',
            [':host([variant="bar-vertical"]:has([slot="icon"])) .slot-container {', '::slotted([slot="icon"]) {']],
        ['outer host modifiers preserved in deeply nested @when, @size, and @variant blocks',
            '@when(:host([checked])) { @size(large) { @variant(*-vertical) { @variant(!bar-*) { .indicator { width: 56px; } } } } }',
            [':host([variant="rail-vertical"][checked][size="large"]) .indicator {\n    width: 56px;\n}'],
            ['variant="bar-vertical"']],
        [':host and :host(...) selector headers inside @variant blocks',
            '@variant(bar-vertical) { :host { width: 104px; } :host([checked]) { opacity: 1; } }',
            [':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) {\n    width: 104px;\n}',
                ':where(:host([variant="bar-vertical"][checked]), :host(:has(.bar-vertical)[checked])) {\n    opacity: 1;\n}'],
            [],
            { selector: 'custom' }],
        ['unparenthesized :host:hover and :host[disabled] inside @variant blocks',
            '@variant(bar-vertical) { :host:hover { opacity: 0.8; } :host[disabled] { cursor: not-allowed; } }',
            [':where(:host([variant="bar-vertical"]:hover), :host(:has(.bar-vertical):hover)) {\n    opacity: 0.8;\n}',
                ':where(:host([variant="bar-vertical"][disabled]), :host(:has(.bar-vertical)[disabled])) {\n    cursor: not-allowed;\n}'],
            [':host:host'],
            { selector: 'custom' }],
        ['dead rules pruned when nested @variant filters match empty set',
            '@variant(*-vertical) { @variant(drawer) { .indicator { width: 999px; } } }',
            [],
            ['999px', 'drawer']],
    ]

    for (const row of mapping) {
        it(row[0], () => {
            runContainsRow(row)
        })
    }
})

describe('appendToHostSelector unit tests', () => {
    const mapping: Array<[[string, string], string]> = [
        [[ ':host', '[disabled]' ], ':host([disabled])'],
        [[ ':host', ':hover' ], ':host(:hover)'],
        [[ ':host', '.active' ], ':host(.active)'],
        [[ ':host', ':host([disabled])' ], ':host([disabled])'],
        [[ ':host', ':host[disabled]' ], ':host([disabled])'],
        [[ ':host', ':host:hover' ], ':host:hover'],
        [[ ':host', ':host.active' ], ':host(.active)'],
        [[ ':host', ':where(:host([a]), :host([b]))' ], ':where(:host([a]), :host([b]))'],
        [[ ':where(:host([a]), :host([b]))', ':host:hover' ], ':where(:host([a]:hover), :host([b]:hover))'],
        [[ ':where(:host([a]), :host([b]))', ':host[disabled]' ], ':where(:host([a][disabled]), :host([b][disabled]))'],
        [[ ':host([variant="bar"])', ':host[disabled]' ], ':host([variant="bar"][disabled])'],
        [[ ':host([variant="bar"])', ':host:hover' ], ':host([variant="bar"]:hover)'],
        [[ ':host([variant="bar"])', ':host.foo' ], ':host([variant="bar"].foo)'],
        [[ ':host([variant="bar"])', ':host([checked])' ], ':host([variant="bar"][checked])'],
        [[ ':host([variant="bar"])', '[checked]' ], ':host([variant="bar"][checked])'],
        [[ ':host:hover', '[disabled]' ], ':host([disabled]):hover'],
        [[ ':host:hover', ':host[disabled]' ], ':host([disabled]):hover'],
    ]

    for (const [[base, modifier], expected] of mapping) {
        it(`append ${modifier} to ${base}`, () => {
            expect(appendToHostSelector(base, modifier)).toBe(expected)
        })
    }
})

interface WarnChecks {
    readonly type?: string
    readonly token?: string
    readonly variant?: string
    readonly variants?: readonly string[]
    readonly variantsEqual?: readonly string[]
    readonly missingVariants?: readonly string[]
    readonly tokens?: readonly string[]
    readonly sequence?: readonly string[]
    readonly count?: number
    readonly min?: number
}

type WarnRow = readonly [label: string, css: string, checks: WarnChecks]

function runWarnRow([, css, checks]: WarnRow): void {
    const warnings: StyleDiagnosticWarning[] = []
    const onWarn = (w: StyleDiagnosticWarning): void => {
        warnings.push(w)
    }
    compileStateSheet(MultiVariants, css, { onWarn })

    if (checks.count !== undefined) {
        expect(warnings.length).toBe(checks.count)
    }
    if (checks.min !== undefined) {
        expect(warnings.length).toBeGreaterThanOrEqual(checks.min)
    }
    if (checks.sequence !== undefined) {
        expect(warnings.map((w) => w.variant)).toEqual(checks.sequence)
    }
    if (checks.tokens !== undefined) {
        const tokens = warnings.map((w) => w.token)
        for (const token of checks.tokens) {
            expect(tokens).toContain(token)
        }
    }
    const candidate = warnings.find((w) =>
        (checks.type === undefined || w.type === checks.type) &&
        (checks.token === undefined || w.token === checks.token) &&
        (checks.variant === undefined || w.variant === checks.variant))
    if (checks.type !== undefined || checks.token !== undefined || checks.variant !== undefined) {
        expect(candidate).toBeDefined()
    }
    if (checks.variants !== undefined) {
        for (const name of checks.variants) {
            expect(candidate?.variants).toContain(name)
        }
    }
    if (checks.variantsEqual !== undefined) {
        expect(candidate?.variants).toEqual(checks.variantsEqual)
    }
    if (checks.missingVariants !== undefined) {
        for (const name of checks.missingVariants) {
            expect(candidate?.missingVariants).toContain(name)
        }
    }
}

describe('AST Diagnostic Warnings for Token Scopes', () => {
    const mapping: WarnRow[] = [
        ['top-level shared scope references a token missing from some variants',
            '.container { color: var(--_vertical-only-token); }',
            { type: 'missing-token-in-shared-scope', token: 'vertical-only-token', variants: ['bar-vertical', 'rail-vertical'], missingVariants: ['bar-horizontal', 'drawer'], min: 1 }],
        ['@variant scope references a token missing from that variant',
            '@variant(bar-horizontal) { .container { color: var(--_vertical-only-token); } }',
            { type: 'missing-token-in-variant-scope', token: 'vertical-only-token', variant: 'bar-horizontal' }],
        ['unknown variant name specified in @variant',
            '@variant(nonexistent-variant) { .container { color: red; } }',
            { type: 'unknown-variant', variant: 'nonexistent-variant', variantsEqual: ['bar-vertical', 'bar-horizontal', 'rail-vertical', 'drawer'], min: 1 }],
        ['no warning when token is present across all variants or in target variant',
            '.container { background: var(--_common-color); } @variant(bar-vertical) { .icon { color: var(--_vertical-only-token); } }',
            { count: 0 }],
        ['no false warning with explicit state-prefixed token references',
            '.container { background: var(--_enabled-common-color); } @variant(bar-vertical) { .icon { color: var(--_enabled-vertical-only-token); } }',
            { count: 0 }],
        ['multiple unknown variants in a single @variant declaration',
            '@variant(unknown-1, unknown-2) { .container { color: blue; } }',
            { count: 2, sequence: ['unknown-1', 'unknown-2'] }],
        ['multiple tokens in a single declaration value each warn',
            '.container { box-shadow: 0 0 4px var(--_vertical-only-token), 0 0 8px var(--_drawer-only-token); }',
            { count: 2, tokens: ['vertical-only-token', 'drawer-only-token'] }],
    ]

    for (const row of mapping) {
        it(row[0], () => {
            runWarnRow(row)
        })
    }

    const consoleWarnInputs: string[] = [
        '.container { color: var(--_vertical-only-token); }',
    ]

    for (const css of consoleWarnInputs) {
        it(`console.warn fallback: ${css}`, () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            try {
                compileStateSheet(MultiVariants, css)
                expect(spy).toHaveBeenCalled()
                expect(spy.mock.calls[0][0]).toContain('[MDC Style Warning]')
            } finally {
                spy.mockRestore()
            }
        })
    }
})

describe('Advanced Edge Cases & At-Rule Compositions', () => {
    const mapping: ContainsRow[] = [
        ['multiple negative patterns in @variant',
            '@variant(!drawer, !*-horizontal) { .indicator { height: 32px; } }',
            [':host([variant="bar-vertical"]) .indicator, :host([variant="rail-vertical"]) .indicator {'],
            ['variant="drawer"', 'variant="bar-horizontal"']],
        ['positive wildcard combined with specific negative patterns',
            '@variant(bar-*, !bar-horizontal) { .container { display: grid; } }',
            [':host([variant="bar-vertical"]) .container {\n    display: grid;\n}'],
            ['variant="bar-horizontal"']],
        ['extra whitespace and trailing commas in @variant parameter',
            '@variant(  bar-vertical ,  drawer  , ) { .badge { display: flex; } }',
            [':host([variant="bar-vertical"]) .badge, :host([variant="drawer"]) .badge {']],
        ['@variant nested inside @layer and @media wrapper at-rules',
            '@layer components { @variant(bar-vertical) { .container { width: 104px; } } } @media (min-width: 600px) { @variant(drawer) { .container { max-width: 400px; } } }',
            ['@layer components {\n:host([variant="bar-vertical"]) .container {\n    width: 104px;\n}\n}',
                '@media (min-width: 600px) {\n:host([variant="drawer"]) .container {\n    max-width: 400px;\n}\n}']],
        ['@variant nested inside @starting-style',
            '@starting-style { @variant(drawer) { .indicator { opacity: 0; } } }',
            ['@starting-style {\n:host([variant="drawer"]) .indicator {\n    opacity: 0;\n}\n}']],
    ]

    for (const row of mapping) {
        it(row[0], () => {
            runContainsRow(row)
        })
    }
})
