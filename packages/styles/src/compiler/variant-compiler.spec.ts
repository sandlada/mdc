/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Scope: single-engine `@variant` semantics — exact dictionary names expand
 * (variant shells come from `TriggerTables`, see `withVariant`), while wildcard
 * (`*`) and negation (`!`) patterns are rejected fail-fast (`[D]` empty output
 * + `invalid-variant-name` warning, oracled in `at-rules/transform-variant.spec.ts`).
 * Removed-DSL compositions (`@anchor` / `@slot` / `@slotted` / `@size` inside
 * `@variant`) drop to empty with `invalid-legacy-syntax` and are covered in the
 * dedicated drop suite below.
 *
 * Mapping-format suite: compiler outputs use
 * `[label, css, mustContain, mustNotContain?, opts?]`; diagnostics use
 * `[label, css, checks]` rows.
 */

import { describe, it, expect } from 'vitest'
import {
    compileStateSheet,
    appendToHostSelector,
    createStyleSheet,
    type StyleDiagnosticWarning
} from './index'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { emptyTables, withState, withVariant } from '../triggers'

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

const triggers = withState({
    'enabled': '',
    'hovered': ':hover',
    'disabled': '[disabled]'
})(emptyTables)

const variantShells = {
    'bar-vertical': ':host([variant="bar-vertical"])',
    'bar-horizontal': ':host([variant="bar-horizontal"])',
    'rail-vertical': ':host([variant="rail-vertical"])',
    'rail-horizontal': ':host([variant="rail-horizontal"])',
    'drawer': ':host([variant="drawer"])',
    'drawer-horizontal': ':host([variant="drawer-horizontal"])'
} as const

const variantTriggers = withVariant({ ...variantShells })(triggers)

const customVariantShells = {
    'bar-vertical': ':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical)))',
    'bar-horizontal': ':where(:host([variant="bar-horizontal"]), :host(:has(.bar-horizontal)))',
    'rail-vertical': ':where(:host([variant="rail-vertical"]), :host(:has(.rail-vertical)))',
    'drawer': ':where(:host([variant="drawer"]), :host(:has(.drawer)))'
} as const

const customVariantTriggers = withVariant({ ...customVariantShells })(triggers)

interface ContainsOpts {
    readonly selector?: 'custom'
    readonly triggers?: boolean
    readonly variants?: boolean
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
        const sheet = createStyleSheet({ tables: customVariantTriggers })(MultiVariants)(css)
        compiled = sheet.cssText
    } else if (opts?.selector === 'custom') {
        compiled = compileStateSheet(MultiVariants, css, {
            tables: customVariantTriggers
        })
    } else {
        compiled = compileStateSheet(MultiVariants, css, {
            tables: opts?.variants === true ? variantTriggers : opts?.triggers === true ? triggers : undefined
        })
    }
    for (const snippet of mustContain) {
        expect(compiled).toContain(snippet)
    }
    for (const snippet of mustNotContain) {
        expect(compiled).not.toContain(snippet)
    }
}

describe('Multi-Variant @variant Compiler', () => {
    const mapping: ContainsRow[] = [
        ['single and comma-separated @variant with tables-provided shells',
            '@variant(bar-vertical, rail-vertical) { .container { width: 100%; } }',
            [':host([variant="bar-vertical"]), :host([variant="rail-vertical"]) { .container { width: 100%; } }'],
            [],
            { variants: true }],
        ['exact names without variant tables drop to empty',
            '@variant(bar-vertical) { .container { height: 56px; } }',
            [],
            ['.container', 'height']],
        ['wildcard pattern (*-vertical) drops to empty',
            '@variant(*-vertical) { .indicator { display: block; } }',
            [],
            ['.indicator', 'display']],
        ['negation pattern (!drawer) drops to empty',
            '@variant(!drawer) { .indicator { border-radius: 8px; } }',
            [],
            ['.indicator', 'variant="drawer"']],
        ['custom variant shells from tables in compileStateSheet',
            '@variant(bar-vertical) { .container { height: 56px; } }',
            [':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) { .container { height: 56px; } }'],
            [],
            { selector: 'custom' }],
        ['custom variant shells from tables in createStyleSheet HOF',
            '@variant(drawer) { .container { max-width: 336px; } }',
            [':where(:host([variant="drawer"]), :host(:has(.drawer))) { .container { max-width: 336px; } }'],
            [],
            { via: 'hof' }],
        ['plain inner rules inside @variant keep their selectors under the variant shell',
            '@variant(bar-vertical) { .container { background-color: var(--_common-color); } }',
            [':host([variant="bar-vertical"]) { .container { background-color: var(--_common-color); } }'],
            [],
            { variants: true }],
        ['removed @anchor inside @variant drops the variant shell to empty',
            '@variant(bar-vertical) { @anchor .container { background-color: var(--_common-color); } }',
            [],
            ['.container', 'background-color']],
        ['nested @variant blocks with removed patterns drop to empty',
            '@variant(*-vertical) { @variant(!bar-*) { .indicator { width: 56px; } } }',
            [],
            ['.indicator', 'width']],
        ['removed @size inside @when drops inner content, outer host shell stays',
            '@when(:host([checked])) { @size(large) { .indicator { width: 56px; } } }',
            [':host([checked]) {'],
            ['.indicator', 'width']],
        ['removed @slot and @slotted inside @variant drop to empty',
            '@variant(bar-vertical) { @slot(icon) { .slot-container { display: flex; } } @slotted(icon) { color: red; } }',
            [],
            ['.slot-container', '::slotted']],
        [':host and :host(...) selector headers inside @variant blocks',
            '@variant(bar-vertical) { :host { width: 104px; } :host([checked]) { opacity: 1; } }',
            [':host([variant="bar-vertical"]) { width: 104px; &[checked] { opacity: 1; } }'],
            ['{ :host'],
            { variants: true }],
        ['unparenthesized :host:hover and :host[disabled] inside @variant blocks',
            '@variant(bar-vertical) { :host:hover { opacity: 0.8; } :host[disabled] { cursor: not-allowed; } }',
            [':host([variant="bar-vertical"]) { &:hover { opacity: 0.8; } &[disabled] { cursor: not-allowed; } }'],
            [':host:host'],
            { variants: true }],
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

describe('Single-Engine Diagnostic Warnings', () => {
    const collectWarns = (css: string, tables?: typeof variantTriggers): StyleDiagnosticWarning[] => {
        const warnings: StyleDiagnosticWarning[] = []
        compileStateSheet(MultiVariants, css, {
            tables,
            onWarn: (w) => warnings.push(w)
        })
        return warnings
    }

    it('unknown variant name warns unknown-variant', () => {
        const warnings = collectWarns('@variant(nonexistent-variant) { .container { color: red; } }')
        expect(warnings.length).toBeGreaterThanOrEqual(1)
        expect(warnings[0].type).toBe('unknown-variant')
        expect(warnings[0].message).toContain('nonexistent-variant')
    })

    it('first unknown variant in a list warns and drops the block', () => {
        const warnings = collectWarns('@variant(unknown-1, unknown-2) { .container { color: blue; } }')
        expect(warnings.length).toBe(1)
        expect(warnings[0].type).toBe('unknown-variant')
        expect(warnings[0].message).toContain('unknown-1')
    })

    it('removed @anchor block warns invalid-legacy-syntax and drops', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const compiled = compileStateSheet(MultiVariants, '@anchor .container { color: red; }', {
            onWarn: (w) => warnings.push(w)
        })
        expect(compiled).toBe('')
        expect(warnings.length).toBe(1)
        expect(warnings[0].type).toBe('invalid-legacy-syntax')
    })

    it('removed wildcard @variant warns and drops to empty', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const compiled = compileStateSheet(MultiVariants, '@variant(*-vertical) { .container { color: red; } }', {
            onWarn: (w) => warnings.push(w)
        })
        expect(compiled).toBe('')
        expect(warnings.length).toBeGreaterThanOrEqual(1)
    })

    it('exact names with tables-provided shells warn nothing', () => {
        const warnings = collectWarns('@variant(bar-vertical) { .container { color: red; } }', variantTriggers)
        expect(warnings.length).toBe(0)
    })
})

describe('Advanced Edge Cases & At-Rule Compositions', () => {
    const mapping: ContainsRow[] = [
        ['removed negative patterns in @variant drop to empty',
            '@variant(!drawer, !*-horizontal) { .indicator { height: 32px; } }',
            [],
            ['.indicator', 'height']],
        ['removed positive wildcard combined with negative patterns drops to empty',
            '@variant(bar-*, !bar-horizontal) { .container { display: grid; } }',
            [],
            ['.container', 'display']],
        ['extra whitespace and trailing commas in @variant parameter',
            '@variant(  bar-vertical ,  drawer  , ) { .badge { display: flex; } }',
            [':host([variant="bar-vertical"]), :host([variant="drawer"]) { .badge { display: flex; } }'],
            [],
            { variants: true }],
        ['@variant nested inside @layer and @media wrapper at-rules',
            '@layer components { @variant(bar-vertical) { .container { width: 104px; } } } @media (min-width: 600px) { @variant(drawer) { .container { max-width: 400px; } } }',
            ['@layer components { :host([variant="bar-vertical"]) { .container { width: 104px; } } }',
                '@media (min-width: 600px) { :host([variant="drawer"]) { .container { max-width: 400px; } } }'],
            [],
            { variants: true }],
        ['@variant nested inside @starting-style',
            '@starting-style { @variant(drawer) { .indicator { opacity: 0; } } }',
            ['@starting-style { :host([variant="drawer"]) { .indicator { opacity: 0; } } }'],
            [],
            { variants: true }],
    ]

    for (const row of mapping) {
        it(row[0], () => {
            runContainsRow(row)
        })
    }
})
