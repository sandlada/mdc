/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * transform-statements.challenger.spec.ts
 *
 * Adversarial Challenger 1 stress-test suite for Requirement R1:
 * - Compiler internal pruning & essential utilities export verification
 * - transformStatements dispatch correctness for all at-rule blocks & declarations
 * - Fail-fast & drop behavior on malformed headers, with appropriate warnings
 * - Tail-canonical selector rewriting and pseudo-class/pseudo-element positioning
 * - Primitive parser resilience with strings, comments, escaped delims
 */

import { describe, expect, it } from 'vitest'
import { transformStatements } from './transform-statements'
import {
    parseStatements,
    isLegacyHeader,
    formatRule,
    type ParsedStatement
} from '../internal/primitives'
import {
    formatValueString,
    isPlainObject,
    isVariantDictionary,
    RESERVED_DEF_KEYS
} from '../internal/metadata-helpers'
import {
    interpolateTemplate,
    compileTemplate
} from '../internal/template-helpers'
import {
    fakeBaseCtx,
    fakeMeta,
    fakeTables
} from '../internal/spec-fakes'
import { replaceTargetInSelector } from './replace-target'
import type { StateDimensionItem } from './rewrite-state-variables'
import type { StyleDiagnosticWarning } from '../sheet'

function canonical(css: string): string {
    return css.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim()
}

const testStates: readonly StateDimensionItem[] = [
    { name: 'small', modifier: '.small', target: 'self' },
    { name: 'large', modifier: '.large', target: 'self' }
]

function createChallengerCtx(onWarn?: (w: StyleDiagnosticWarning) => void) {
    return fakeBaseCtx({
        states: testStates,
        isCombo: false,
        tables: fakeTables({}, {
            'filled': ':host([variant="filled"])',
            'outlined': ':host([variant="outlined"])'
        }),
        meta: fakeMeta(['filled', 'outlined']),
        ancestorPath: [],
        options: {
            onWarn
        }
    })
}

function runTransform(input: string, onWarn?: (w: StyleDiagnosticWarning) => void): {
    css: string
    base: string[]
    hoisted: string[]
} {
    const stmts = parseStatements(input)
    const ctx = createChallengerCtx(onWarn)
    const res = transformStatements(stmts, ctx)
    const combined = [...res.baseRules, ...res.hoistedRules].join(' ')
    return {
        css: canonical(combined),
        base: res.baseRules,
        hoisted: res.hoistedRules
    }
}

describe('Challenger 1 — Compiler Internal Pruning & Essential Utilities Surface', () => {
    describe('1. primitives.ts', () => {
        it('handles comments, escaped characters, and strings containing delims', () => {
            const css = `
                /* Block comment with ; and { inside */
                color: red;
                content: "semi; colon and { braces } inside";
                background: url('http://example.com/test;foo');
                .box {
                    padding: 8px;
                    /* Nested comment */
                    margin: 0;
                }
            `
            const stmts = parseStatements(css)
            expect(stmts.length).toBe(4)
            expect(stmts[0]).toEqual({ type: 'decl', property: 'color', value: 'red' })
            expect(stmts[1]).toEqual({ type: 'decl', property: 'content', value: '"semi; colon and { braces } inside"' })
            expect(stmts[2]).toEqual({ type: 'decl', property: 'background', value: "url('http://example.com/test;foo')" })
            expect(stmts[3].type).toBe('block')
            expect(stmts[3].header).toBe('.box')
            expect(stmts[3].body).toContain('padding: 8px;')
        })

        it('identifies legacy at-rule headers with word-boundary accuracy', () => {
            expect(isLegacyHeader('@anchor')).toBe(true)
            expect(isLegacyHeader('@slot(icon)')).toBe(true)
            expect(isLegacyHeader('@slotted(.btn)')).toBe(true)
            expect(isLegacyHeader('@size(lg)')).toBe(true)
            expect(isLegacyHeader('@elevation(2)')).toBe(true)

            // Must NOT match words starting with legacy prefix
            expect(isLegacyHeader('@anchors')).toBe(false)
            expect(isLegacyHeader('@slotting')).toBe(false)
            expect(isLegacyHeader('@size-custom')).toBe(false)
            expect(isLegacyHeader('@variant(filled)')).toBe(false)
            expect(isLegacyHeader('@when(:host([open]))')).toBe(false)
            expect(isLegacyHeader('@state(btn) btn')).toBe(false)
        })

        it('formats rules with and without content', () => {
            expect(formatRule('.btn', '')).toBe('.btn {}')
            expect(formatRule('.btn', '   ')).toBe('.btn {}')
            expect(formatRule('.btn', 'color: red;')).toBe('.btn { color: red; }')
        })
    })

    describe('2. metadata-helpers.ts', () => {
        it('formatValueString handles all object and primitive variations', () => {
            expect(formatValueString(null)).toBe('')
            expect(formatValueString(undefined)).toBe('')
            expect(formatValueString(123)).toBe('123')
            expect(formatValueString('plain')).toBe('plain')
            expect(formatValueString({ ToCSSVariable: () => 'var(--foo)' })).toBe('var(--foo)')
            expect(formatValueString({ cssText: 'display: flex;' })).toBe('display: flex;')
            expect(formatValueString({ rawVal: { ToCSSVariable: () => 'var(--nested)' } })).toBe('var(--nested)')
        })

        it('isPlainObject validates plain prototypes correctly', () => {
            expect(isPlainObject({})).toBe(true)
            expect(isPlainObject(Object.create(null))).toBe(true)
            expect(isPlainObject(null)).toBe(false)
            expect(isPlainObject([])).toBe(false)
            expect(isPlainObject('str')).toBe(false)
            expect(isPlainObject(new Date())).toBe(false)
        })

        it('isVariantDictionary correctly detects variant dictionaries and ignores brands', () => {
            expect(isVariantDictionary(null)).toBe(false)
            expect(isVariantDictionary([])).toBe(false)
            expect(isVariantDictionary({})).toBe(false)
            expect(isVariantDictionary({ __brand: 'ResolvedStyleDefinition' })).toBe(false)
            expect(isVariantDictionary({ schema: { __brand: 'StateSchema' } })).toBe(false)
            expect(isVariantDictionary({ tokens: {} })).toBe(false)
            expect(isVariantDictionary({
                filled: { color: 'red' },
                outlined: { color: 'blue' }
            })).toBe(true)
        })

        it('verifies RESERVED_DEF_KEYS set consistency', () => {
            expect(RESERVED_DEF_KEYS.has('__brand')).toBe(true)
            expect(RESERVED_DEF_KEYS.has('schema')).toBe(true)
            expect(RESERVED_DEF_KEYS.has('tokens')).toBe(true)
            expect(RESERVED_DEF_KEYS.has('flatTokenKeys')).toBe(true)
            expect(RESERVED_DEF_KEYS.has('forwardedBridges')).toBe(true)
        })
    })

    describe('3. template-helpers.ts', () => {
        it('interpolateTemplate joins template literals and dynamic values', () => {
            const strings = ['color: ', '; background: ', ';']
            const values = ['red', { ToCSSVariable: () => 'var(--bg)' }]
            expect(interpolateTemplate(strings, values)).toBe('color: red; background: var(--bg);')
        })

        it('throws when state-aware syntax is compiled without a style definition', () => {
            expect(() => {
                compileTemplate(null, '@state(btn) btn { color: red; }')
            }).toThrow(/\[mdc-styles\] createStyleSheet requires a style definition/)
        })
    })
})

describe('Challenger 1 — transformStatements Dispatch & Edge Cases', () => {
    describe('1. Legacy At-Rules Dropping & Warning', () => {
        it('drops @anchor, @slot, @size, @elevation blocks and issues invalid-legacy-syntax warning', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const css = `
                @anchor(top) { top: 0; }
                @slot(header) { display: block; }
                @size(sm) { font-size: 12px; }
                @elevation(1) { box-shadow: none; }
                .keep { color: green; }
            `
            const res = runTransform(css, (w) => warnings.push(w))
            expect(res.css).toBe('.keep { color: green; }')
            expect(warnings.length).toBe(4)
            expect(warnings.every(w => w.type === 'invalid-legacy-syntax')).toBe(true)
        })
    })

    describe('2. Malformed At-Rule Headers', () => {
        it('drops empty or truncated @variant headers and warns invalid-variant', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @variant() { button {} }
                @variant(   ) { button {} }
                @variant { button {} }
                .ok { color: blue; }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('.ok { color: blue; }')
            expect(warnings.length).toBe(3)
            expect(warnings.every(w => w.type === 'invalid-variant')).toBe(true)
        })

        it('drops unmapped variant names and warns unknown-variant', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @variant(unknownVariant) { button {} }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('')
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('unknown-variant')
        })

        it('drops nested @variant at-rules and warns nested-variant', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @variant(filled) {
                    @variant(outlined) {
                        button {}
                    }
                }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('')
            expect(warnings.some(w => w.type === 'nested-variant')).toBe(true)
        })

        it('drops empty or truncated @when headers and warns invalid-when', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @when() { button {} }
                @when(   ) { button {} }
                @when { button {} }
                .alive { opacity: 1; }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('.alive { opacity: 1; }')
            expect(warnings.length).toBe(3)
            expect(warnings.every(w => w.type === 'invalid-when')).toBe(true)
        })

        it('drops non-host mounted @when condition and warns invalid-when-condition', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @when(.invalid-scope) {
                    button { display: none; }
                }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('')
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when-condition')
        })

        it('drops nested @when at-rules and warns nested-when', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @when(:host([checked])) {
                    @when(:host([dense])) {
                        button {}
                    }
                }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('')
            expect(warnings.some(w => w.type === 'nested-when')).toBe(true)
        })

        it('drops malformed @state headers and warns invalid-state-syntax', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @state() { button {} }
                @state(button) { button {} }
                @state { button {} }
                .survivor { z-index: 1; }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('.survivor { z-index: 1; }')
            expect(warnings.length).toBe(3)
            expect(warnings.every(w => w.type === 'invalid-state-syntax')).toBe(true)
        })

        it('drops @state when selector does not contain target and warns invalid-state-target', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const res = runTransform(`
                @state(button) .unrelated-card { color: red; }
            `, (w) => warnings.push(w))

            expect(res.css).toBe('')
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-state-target')
        })
    })

    describe('3. Selector Rewriting & Tail-Canonical Insertion', () => {
        it('inserts state modifier before pseudo-elements (::before, ::after)', () => {
            const res = runTransform(`
                @state(button) button::before { content: ""; }
                @state(button) button::after { content: ""; }
            `)
            expect(res.css).toBe(
                'button.small::before { content: ""; } button.large::before { content: ""; } ' +
                'button.small::after { content: ""; } button.large::after { content: ""; }'
            )
        })

        it('places modifier after functional pseudo-classes and before pseudo-elements', () => {
            const res = runTransform(`
                @state(button) button:hover::before { opacity: 0.5; }
                @state(button) button:is(:focus-visible, [data-active])::after { opacity: 1; }
            `)
            expect(res.css).toBe(
                'button:hover.small::before { opacity: 0.5; } button:hover.large::before { opacity: 0.5; } ' +
                'button:is(:focus-visible, [data-active]).small::after { opacity: 1; } button:is(:focus-visible, [data-active]).large::after { opacity: 1; }'
            )
        })

        it('correctly rewrites target within nested pseudo-classes (:has, :is, :where, :not)', () => {
            const r1 = replaceTargetInSelector('div:has(button)', 'button', '.small')
            expect(r1.result).toBe('div:has(button.small)')
            expect(r1.matched).toBe(true)

            const r2 = replaceTargetInSelector(':is(button, a:has(button))', 'button', '.small')
            expect(r2.result).toBe(':is(button.small, a:has(button.small))')
            expect(r2.matched).toBe(true)

            const r3 = replaceTargetInSelector('div:not(button)', 'button', '.small')
            expect(r3.result).toBe('div:not(button.small)')
            expect(r3.matched).toBe(true)
        })

        it('handles multi-branch selector lists with target', () => {
            const res = runTransform(`
                @state(button) button, .btn-group > button, div:has(button) { margin: 0; }
            `)
            expect(res.css).toBe(
                'button.small, .btn-group > button.small, div:has(button.small) { margin: 0; } ' +
                'button.large, .btn-group > button.large, div:has(button.large) { margin: 0; }'
            )
        })
    })

    describe('4. Isolation Block Scoping (@layer, @media)', () => {
        it('hoists when-rules within isolation containers without escaping layer', () => {
            const res = runTransform(`
                @layer theme {
                    @variant(filled) {
                        button {}
                    }
                }
            `)
            expect(res.css).toBe('@layer theme { :host([variant="filled"]) { button {} } }')
        })

        it('preserves media query wrapper and transforms inner statements', () => {
            const res = runTransform(`
                @media (prefers-reduced-motion: reduce) {
                    @state(button) button { transition: none; }
                }
            `)
            expect(res.css).toBe(
                '@media (prefers-reduced-motion: reduce) { button.small { transition: none; } button.large { transition: none; } }'
            )
        })
    })

    describe('5. High-Throughput Statement Stress Test', () => {
        it('processes 500 interleaved statements rapidly without memory leak or state pollution', () => {
            const chunks: string[] = []
            for (let i = 0; i < 250; i++) {
                chunks.push(`
                    .item-${i} { color: #fff; }
                    @state(button) .item-${i} button { font-size: ${i}px; }
                `)
            }
            const fullCss = chunks.join('\n')
            const start = performance.now()
            const res = runTransform(fullCss)
            const duration = performance.now() - start

            expect(res.base.length).toBe(500) // 250 decl/rules + 250 state expanded blocks
            expect(duration).toBeLessThan(1000) // 500 statements processed in < 1s
        })
    })
})
