/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Empirical stress test suite for Milestone 1 custom syntax parsing.
 * Challenges:
 *   1. Extreme / malformed CSS inputs & tolerant recovery
 *   2. Rule R1: Edge case @state targets and selectors
 *   3. Rule V1-V4: Boundary @variant inputs
 *   4. Rule W1-W5: Boundary @when conditions
 *   5. Robustness, ReDoS resistance, and crash prevention
 */

import { describe, it, expect } from 'vitest'
import type { StyleDiagnosticWarning } from '../sheet'
import {
    styleSyntax,
    getPreludeText,
    hasNestedAtrule,
    isHostMountedSelectorAst,
    parseCustomStylesheet,
    parsePrelude,
    parseStatePrelude,
    parseVariantPrelude,
    parseWhenPrelude
} from './custom-syntax'

interface WarningCollector {
    readonly warnings: StyleDiagnosticWarning[]
    readonly onWarn: (warning: StyleDiagnosticWarning) => void
}

function createWarningCollector(): WarningCollector {
    const warnings: StyleDiagnosticWarning[] = []
    const onWarn = (w: StyleDiagnosticWarning): void => {
        warnings.push(w)
    }
    return { warnings, onWarn }
}

describe('Milestone 1 Stress & Adversarial Test Suite', () => {
    describe('1. Extreme & Maliciously Malformed CSS Inputs', () => {
        it('handles deeply nested braces without crashing or stack overflow', () => {
            const depth = 200
            const open = '{'.repeat(depth)
            const close = '}'.repeat(depth)
            const css = `.deep ${open} color: red; ${close}`
            expect(() => parseCustomStylesheet(css)).not.toThrow()
        })

        it('handles unclosed deeply nested braces gracefully', () => {
            const depth = 200
            const css = `.deep ${'{'.repeat(depth)} color: red;`
            expect(() => parseCustomStylesheet(css)).not.toThrow()
        })

        it('handles deeply nested custom at-rules (variant in state in when ...)', () => {
            let css = 'color: red;'
            for (let i = 0; i < 30; i++) {
                css = `@variant(v${i}) { @state(btn) btn { @when(:host([q${i}])) { ${css} } } }`
            }
            const ast = parseCustomStylesheet(css)
            expect(ast.type).toBe('StyleSheet')
            expect(ast.children).toBeDefined()
        })

        it('handles malformed blocks missing semicolons between declarations without hanging', () => {
            const css = `
                button {
                    color: red
                    background: blue
                    border: none
                    padding: 10px
                    margin: 5px
                }
            `
            expect(() => parseCustomStylesheet(css)).not.toThrow()
        })

        it('handles garbage tokens in declaration blocks without infinite loop', () => {
            const garbageInputs = [
                'button { :::;;;@@@###$$$%%%^^^&&&*** }',
                'button { 12345 67890 }',
                'button { @@@@ }',
                'button { !@#$%^&*()_+ }',
                'button { ;;;;;;;;; }',
                'button { "unclosed string without end }',
                'button { /* unclosed comment at EOF'
            ]
            for (const input of garbageInputs) {
                expect(() => parseCustomStylesheet(input)).not.toThrow()
            }
        })

        it('handles unquoted URLs with symbols, hashes, query parameters, and colons', () => {
            const complexUrls = [
                'button { background: url(https://example.com/a/b/c?x=1&y=2#frag); }',
                'button { background: url(//cdn.example.com/font.woff2); }',
                'button { background: url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>); }',
                'button { background: url(https://example.com:8080/path/to/resource?a=foo;bar=baz); }',
                'button { background: url(https://example.com/[brackets]/); }'
            ]
            for (const css of complexUrls) {
                const ast = parseCustomStylesheet(css)
                expect(ast.children).toBeDefined()
                const generated = styleSyntax.generate(ast)
                expect(generated).toContain('url(')
            }
        })

        it('handles strings containing braces and semicolons without breaking AST structure', () => {
            const css = 'button::before { content: "}; color: blue; } @state(x) {"; color: red; }'
            const ast = parseCustomStylesheet(css)
            expect(ast.type).toBe('StyleSheet')
            const rule = ast.children.first as any
            expect(rule.type).toBe('Rule')
            expect(rule.block.children.isEmpty).toBe(false)
        })

        it('handles huge CSS payload (5000 declarations) rapidly', () => {
            const decls = Array.from({ length: 5000 }, (_, i) => `--token-${i}: ${i}px;`).join('\n')
            const css = `:host { ${decls} }`
            const start = performance.now()
            const ast = parseCustomStylesheet(css)
            const duration = performance.now() - start
            expect(ast.type).toBe('StyleSheet')
            expect(duration).toBeLessThan(1500) // Must parse 5000 declarations in < 1.5s
        })
    })

    describe('2. Rule R1: Edge Case @state Targets & Selectors', () => {
        it('correctly handles attribute selector with commas in target: [a="x,y"]', () => {
            const input = '(:where(:host([a="x,y"]))) button'
            const res = parseStatePrelude(input)
            expect(res.valid).toBe(true)
            expect(res.target).toBe(':where(:host([a="x,y"]))')
            expect(res.selector).toBe('button')
        })

        it('correctly handles nested pseudo-classes with multiple arguments in target: :is(btn, a)', () => {
            const input = '(:is(button, a)) button'
            const res = parseStatePrelude(input)
            expect(res.valid).toBe(true)
            expect(res.target).toBe(':is(button, a)')
            expect(res.selector).toBe('button')
        })

        it('correctly handles escaped quotes and parens in target', () => {
            const input = '([data-val="foo\\"bar"]) button'
            const res = parseStatePrelude(input)
            expect(res.valid).toBe(true)
            expect(res.target).toBe('[data-val="foo\\"bar"]')
            expect(res.selector).toBe('button')
        })

        it('correctly handles multiple paren groups in selector portion', () => {
            const input = '(button) button:is(.primary, .secondary):not([disabled])'
            const res = parseStatePrelude(input)
            expect(res.valid).toBe(true)
            expect(res.target).toBe('button')
            expect(res.selector).toBe('button:is(.primary, .secondary):not([disabled])')
        })

        it('rejects targets with unclosed parens or quotes', () => {
            const malformed = [
                '([data-val="unclosed) button',
                '(:where(:host button',
                '((button) button',
                '@state(button'
            ]
            for (const header of malformed) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseStatePrelude(header, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
            }
        })

        it('rejects empty target or whitespace-only target inside parens', () => {
            const emptyTargets = [
                '() button',
                '(   ) button',
                '(\t\n) button',
                '(/* comment only */) button'
            ]
            for (const header of emptyTargets) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseStatePrelude(header, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
            }
        })

        it('rejects missing selector after target parens', () => {
            const missingSelectors = [
                '(button)',
                '(button)   ',
                '(button)\n\t  ',
                '(button) /* comment only */'
            ]
            for (const header of missingSelectors) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseStatePrelude(header, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
            }
        })

        it('preserves non-standard dirty strings in target per BUG-02 B3 without premature rejection', () => {
            const dirtyTargets = [
                '(button // dirty comment) button',
                '(.foo // bar) .foo',
                '(div#id // 123) div#id'
            ]
            for (const header of dirtyTargets) {
                const res = parseStatePrelude(header)
                expect(res.valid).toBe(true)
                expect(res.target).toContain('//')
            }
        })
    })

    describe('3. Rule V1-V4: Boundary @variant Inputs', () => {
        it('handles multiline variant declarations with trailing commas', () => {
            const input = '(\n  fill,\n  tonal,\n  outlined,\n)'
            const res = parseVariantPrelude(input)
            expect(res.valid).toBe(true)
            expect(res.names).toEqual(['fill', 'tonal', 'outlined'])
        })

        it('filters empty segments created by duplicate commas', () => {
            const input = '(fill,, tonal,,, outlined)'
            const res = parseVariantPrelude(input)
            expect(res.valid).toBe(true)
            expect(res.names).toEqual(['fill', 'tonal', 'outlined'])
        })

        it('rejects variant headers with empty parens or comma-only', () => {
            const emptyVariants = [
                '()',
                '(   )',
                '(,)',
                '(,,)',
                '( , , )',
                '(/* only comment */)'
            ]
            for (const header of emptyVariants) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseVariantPrelude(header, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-variant')).toBe(true)
            }
        })

        it('rejects wildcards and negations with invalid-variant-name', () => {
            const invalidNames = [
                '(*)',
                '(**)',
                '(!)',
                '(!filled)',
                '(fill, *)',
                '(fill, !outlined)'
            ]
            for (const header of invalidNames) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseVariantPrelude(header, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-variant-name')).toBe(true)
            }
        })

        it('rejects unknown variants when knownVariants schema is provided', () => {
            const known = ['fill', 'tonal', 'outlined']
            const { warnings, onWarn } = createWarningCollector()
            const res = parseVariantPrelude('(fill, custom-variant)', { onWarn, knownVariants: known })
            expect(res.valid).toBe(false)
            expect(warnings.some((w) => w.type === 'unknown-variant')).toBe(true)
        })

        it('accepts all known variants when all match schema', () => {
            const known = ['fill', 'tonal', 'outlined']
            const res = parseVariantPrelude('(fill, outlined)', { knownVariants: known })
            expect(res.valid).toBe(true)
            expect(res.names).toEqual(['fill', 'outlined'])
        })

        it('rejects nested @variant with nested-variant warning', () => {
            const { warnings, onWarn } = createWarningCollector()
            const res = parseVariantPrelude('(fill)', { onWarn, isNestedVariant: true })
            expect(res.valid).toBe(false)
            expect(warnings.some((w) => w.type === 'nested-variant')).toBe(true)
        })
    })

    describe('4. Rule W1-W5: Boundary @when Conditions', () => {
        it('accepts valid deeply nested :where/:is host-mounted conditions', () => {
            const validHostConditions = [
                '(:where(:host))',
                '(:is(:host))',
                '(:is(:host([checked]), :host([active])))',
                '(:where(:host([disabled]), :is(:host([readonly]))))',
                '(:host(:hover):focus-visible)',
                '(:host([data-attr="a,b"]))',
                '(:where(:host([data-x="1"]), :host([data-y="2"])))'
            ]
            for (const cond of validHostConditions) {
                const res = parseWhenPrelude(cond)
                expect(res.valid).toBe(true)
                expect(res.selectorAst).toBeDefined()
            }
        })

        it('rejects non-host selectors including subtle combinators or descendant selectors', () => {
            const invalidConditions = [
                '(:host .descendant)',
                '(:host > .child)',
                '(:host + .sibling)',
                '(:host ~ .sibling)',
                '(:where(:host .descendant))',
                '(:is(:host, .external))',
                '(:where(:host, button))',
                '(button:host)',
                '(.card:host)',
                '(::before)',
                '(:host::after .nested)',
                '(:host([checked]) button)'
            ]
            for (const cond of invalidConditions) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseWhenPrelude(cond, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-when-condition')).toBe(true)
            }
        })

        it('rejects empty or whitespace-only condition lists with invalid-when', () => {
            const emptyConditions = [
                '()',
                '(   )',
                '(,)',
                '( , , )',
                '(/* comment only */)'
            ]
            for (const cond of emptyConditions) {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseWhenPrelude(cond, { onWarn })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'invalid-when')).toBe(true)
            }
        })

        it('enforces BUG-06 D3 priority chain: invalid syntax suppresses nested-when', () => {
            const { warnings, onWarn } = createWarningCollector()
            const res = parseWhenPrelude('()', { onWarn, isNestedWhen: true })
            expect(res.valid).toBe(false)
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when')
        })

        it('enforces BUG-06 D3 priority chain: non-host condition suppresses nested-when', () => {
            const { warnings, onWarn } = createWarningCollector()
            const res = parseWhenPrelude('(.non-host)', { onWarn, isNestedWhen: true })
            expect(res.valid).toBe(false)
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when-condition')
        })

        it('emits nested-when only when condition syntax and host mounting are both valid', () => {
            const { warnings, onWarn } = createWarningCollector()
            const res = parseWhenPrelude('(:host([checked]))', { onWarn, isNestedWhen: true })
            expect(res.valid).toBe(false)
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('nested-when')
        })
    })

    describe('5. Fuzzing & Randomized Inputs (Robustness Oracle)', () => {
        it('survives 1,000 randomized pseudo-CSS strings without crashing', () => {
            const tokens = [
                '@when', '@variant', '@state', '(', ')', '{', '}', ';', ':', ',',
                ':host', '[attr="x"]', 'button', '/* comment */', 'url(http://x)',
                '\n', '\t', ' ', '"str"', "'single'", '\\', '.', '#', '&', '>', '+', '~'
            ]

            let seed = 42
            function random() {
                seed = (seed * 16807) % 2147483647
                return (seed - 1) / 2147483646
            }

            for (let i = 0; i < 1000; i++) {
                const length = Math.floor(random() * 20) + 1
                let fuzz = ''
                for (let j = 0; j < length; j++) {
                    const idx = Math.floor(random() * tokens.length)
                    fuzz += tokens[idx] + ' '
                }

                expect(() => parseCustomStylesheet(fuzz)).not.toThrow()
                expect(() => parseStatePrelude(fuzz)).not.toThrow()
                expect(() => parseVariantPrelude(fuzz)).not.toThrow()
                expect(() => parseWhenPrelude(fuzz)).not.toThrow()
            }
        }, 20000)
    })
})
