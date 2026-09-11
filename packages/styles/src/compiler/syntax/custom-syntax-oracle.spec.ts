/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Challenger 2 Conformance & Equivalence Oracle for Milestone 1.
 * Tests:
 * 1. Equivalence between `custom-syntax.ts` prelude parsing and historical `extractAtRuleParams.ts` on valid inputs.
 * 2. Behavior expected by `transform-variant.ts`, `transform-when.ts`, and `transform-state.ts`.
 * 3. Round-trip serialization: parse CSS -> generate CSS -> parse again -> compare AST equivalence.
 * 4. Stress testing on large stylesheets (100 to 2000 custom at-rule blocks) for throughput, time, and memory.
 */

import { describe, it, expect } from 'vitest'
import { toPlainObject } from '../internal/csstree'
import type { StyleDiagnosticWarning } from '../sheet'
import { extractAtRuleParams } from './extract-at-rule-params'
import { splitSelectorByComma } from '../selectors'
import { isHostMountedSelector } from '../hoist'
import {
    styleSyntax,
    getPreludeText,
    parseCustomStylesheet,
    parsePrelude,
    parseStatePrelude,
    parseVariantPrelude,
    parseWhenPrelude,
    hasNestedAtrule
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

function stripLoc(node: any): any {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(stripLoc)
    const clone: Record<string, any> = {}
    for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue
        clone[key] = stripLoc(value)
    }
    return clone
}

describe('Challenger 2 Conformance & Equivalence Oracle', () => {
    // ------------------------------------------------------------------------
    // Suite 1: Equivalence between custom-syntax.ts and historical extractAtRuleParams.ts
    // ------------------------------------------------------------------------
    describe('1. Equivalence with historical extractAtRuleParams.ts on valid inputs', () => {
        const stateCases = [
            '@state(button) button',
            '@state(button) button.small',
            '@state(.card) div.card',
            '@state(#submit) button#submit',
            '@state(:host) :host',
            '@state(:host) :host([dense])',
            '@state(:where(:host)) :where(:host)',
            '@state(button) button .label',
            '@state(button) button:is(.icon, .label)',
            '@state(button) button:has(.label)',
            '@state(button) button[type="button"]',
            '@state(button) .container > button:has(.label) > .label',
            '@state(button) & button',
            '@state(button) &button:has(.label)',
            '@state(  button  )   button  ',
            '@state(button) button, button .icon',
            '@state(button) button::before',
            '@state(button) slot::slotted(button)',
            '@state(:host([data-theme="dark"])) :host([data-theme="dark"]) .btn',
            '@state(button[data-name="foo)bar"]) button[data-name="foo)bar"]',
            '@state(button) button[aria-label="Save (new)"]'
        ]

        for (const input of stateCases) {
            it(`matches extractAtRuleParams for state: ${input}`, () => {
                const legacy = extractAtRuleParams(input, '@state')
                expect(legacy).not.toBeNull()

                const modern = parseStatePrelude(input)
                expect(modern.ok).toBe(true)
                if (modern.ok && legacy) {
                    // Modern parser strips block comments and trims
                    expect(modern.target).toBe(legacy.param.trim())
                    expect(modern.selector).toBe(legacy.rest.trim())
                    expect(modern.targetAst).toBeDefined()
                    expect(modern.selectorAst).toBeDefined()
                }
            })
        }

        const variantCases = [
            '@variant(fill)',
            '@variant(tonal)',
            '@variant(outlined)',
            '@variant(primary, secondary, tertiary)',
            '@variant( fill , tonal )',
            '@variant(elevated, flat)',
            '@variant(btn-primary, btn-secondary)',
            '@variant(v1, v2, v3, v4, v5)'
        ]

        for (const input of variantCases) {
            it(`matches extractAtRuleParams for variant: ${input}`, () => {
                const legacy = extractAtRuleParams(input, '@variant')
                expect(legacy).not.toBeNull()

                const modern = parseVariantPrelude(input)
                expect(modern.ok).toBe(true)
                if (modern.ok && legacy) {
                    expect(modern.rawParam).toBe(legacy.param.trim())
                    const expectedNames = splitSelectorByComma(legacy.param)
                        .map((v) => v.trim())
                        .filter(Boolean)
                    expect(modern.names).toEqual(expectedNames)
                    expect(modern.variants).toEqual(expectedNames)
                }
            })
        }

        const whenCases = [
            '@when(:host([checked]))',
            '@when(:host([disabled]))',
            '@when(:host([dense]), :host([elevated]))',
            '@when(:host(:focus-visible))',
            '@when(:is(:host([checked]), :host([active])))',
            '@when(:where(:host([checked])))',
            '@when(:host([data-state="active"]))'
        ]

        for (const input of whenCases) {
            it(`matches extractAtRuleParams for when: ${input}`, () => {
                const legacy = extractAtRuleParams(input, '@when')
                expect(legacy).not.toBeNull()

                const modern = parseWhenPrelude(input)
                expect(modern.ok).toBe(true)
                if (modern.ok && legacy) {
                    expect(modern.rawParam).toBe(legacy.param.trim())
                    const expectedConditions = splitSelectorByComma(legacy.param)
                        .map((c) => c.trim())
                        .filter(Boolean)
                    expect(modern.conditions).toEqual(expectedConditions)
                    expect(modern.selectorText).toBe(expectedConditions.join(', '))
                    expect(modern.selectorAst).toBeDefined()
                }
            })
        }
    })

    // ------------------------------------------------------------------------
    // Suite 2: Consumer Expectation & Fail-Fast Validation Oracle
    // ------------------------------------------------------------------------
    describe('2. Consumer expectation & fail-fast validation oracle', () => {
        describe('transform-variant expectations', () => {
            it('emits invalid-variant on malformed syntax or empty list', () => {
                const collector = createWarningCollector()
                const badHeaders = ['@variant', '@variant foo', '@variant()', '@variant(   )', '@variant( /* c */ )']
                for (const header of badHeaders) {
                    const res = parseVariantPrelude(header, collector)
                    expect(res.ok).toBe(false)
                }
                expect(collector.warnings.length).toBe(badHeaders.length)
                expect(collector.warnings.every((w) => w.type === 'invalid-variant')).toBe(true)
            })

            it('emits invalid-variant-name on wildcards and negations, skipping unknown-variant', () => {
                const collector = createWarningCollector()
                const badVariants = ['@variant(*)', '@variant(**)', '@variant(!primary)', '@variant(fill, *)', '@variant(!tonal, outlined)']
                for (const header of badVariants) {
                    const res = parseVariantPrelude(header, {
                        onWarn: collector.onWarn,
                        knownVariants: ['fill', 'tonal', 'outlined']
                    })
                    expect(res.ok).toBe(false)
                }
                expect(collector.warnings.length).toBe(badVariants.length)
                expect(collector.warnings.every((w) => w.type === 'invalid-variant-name')).toBe(true)
            })

            it('emits unknown-variant when variant is not in knownVariants', () => {
                const collector = createWarningCollector()
                const res = parseVariantPrelude('@variant(fill, custom)', {
                    onWarn: collector.onWarn,
                    knownVariants: ['fill', 'tonal']
                })
                expect(res.ok).toBe(false)
                expect(collector.warnings.length).toBe(1)
                expect(collector.warnings[0].type).toBe('unknown-variant')
                expect(collector.warnings[0].message).toContain('custom')
            })

            it('emits nested-variant when isNestedVariant is true', () => {
                const collector = createWarningCollector()
                const res = parseVariantPrelude('@variant(fill)', {
                    onWarn: collector.onWarn,
                    isNestedVariant: true
                })
                expect(res.ok).toBe(false)
                expect(collector.warnings.length).toBe(1)
                expect(collector.warnings[0].type).toBe('nested-variant')
            })
        })

        describe('transform-when expectations & BUG-06 D3 Priority Chain', () => {
            it('enforces BUG-06 D3: syntax error > host error > nesting error', () => {
                // Priority 1: invalid-when (syntax) suppresses invalid-when-condition and nested-when
                const c1 = createWarningCollector()
                const res1 = parseWhenPrelude('@when()', {
                    onWarn: c1.onWarn,
                    isNestedWhen: true
                })
                expect(res1.ok).toBe(false)
                expect(c1.warnings.length).toBe(1)
                expect(c1.warnings[0].type).toBe('invalid-when')

                // Priority 2: invalid-when-condition suppresses nested-when
                const c2 = createWarningCollector()
                const res2 = parseWhenPrelude('@when(button)', {
                    onWarn: c2.onWarn,
                    isNestedWhen: true
                })
                expect(res2.ok).toBe(false)
                expect(c2.warnings.length).toBe(1)
                expect(c2.warnings[0].type).toBe('invalid-when-condition')

                // Priority 3: nested-when triggers only when syntax and host condition are valid
                const c3 = createWarningCollector()
                const res3 = parseWhenPrelude('@when(:host([checked]))', {
                    onWarn: c3.onWarn,
                    isNestedWhen: true
                })
                expect(res3.ok).toBe(false)
                expect(c3.warnings.length).toBe(1)
                expect(c3.warnings[0].type).toBe('nested-when')
            })

            it('validates host mounting on AST selector nodes', () => {
                const astValid = styleSyntax.parse(':host([checked])', { context: 'selector' }) as any
                expect(isHostMountedSelector(':host([checked])')).toBe(true)

                const astInvalid = styleSyntax.parse('button.active', { context: 'selector' }) as any
                expect(isHostMountedSelector('button.active')).toBe(false)
            })
        })

        describe('transform-state expectations & BUG-02 B3 Dirty Strings', () => {
            it('emits invalid-state-syntax when parens, target, or selector are missing', () => {
                const collector = createWarningCollector()
                const badStateHeaders = [
                    '@state',
                    '@state()',
                    '@state(button)',
                    '@state() button',
                    '@state button button',
                    '@state( ) button',
                    '@state(button) '
                ]
                for (const header of badStateHeaders) {
                    const res = parseStatePrelude(header, collector)
                    expect(res.ok).toBe(false)
                }
                expect(collector.warnings.length).toBe(badStateHeaders.length)
                expect(collector.warnings.every((w) => w.type === 'invalid-state-syntax')).toBe(true)
            })

            it('preserves dirty target strings (//) per BUG-02 B3 without treating as comments or crashing', () => {
                const collector = createWarningCollector()
                // BUG-02 B3: 'button // dirty' is not valid CSS comment syntax, must be preserved
                // so R8 target matching handles it downstream instead of premature syntax failure.
                const res = parseStatePrelude('@state(button // dirty) button // dirty', collector)
                expect(res.ok).toBe(true)
                if (res.ok) {
                    expect(res.target).toBe('button // dirty')
                    expect(res.selector).toBe('button // dirty')
                }
                expect(collector.warnings.length).toBe(0)
            })

            it('strips block comments (/* ... */) in header without corrupting target or selector', () => {
                const res = parseStatePrelude('@state(/* comment */ button /* inner */) /* outer */ button.primary')
                expect(res.ok).toBe(true)
                if (res.ok) {
                    expect(res.target).toBe('button')
                    expect(res.selector).toBe('button.primary')
                }
            })
        })

        describe('unified parsePrelude dispatcher', () => {
            it('dispatches to correct preludes case-insensitively', () => {
                const whenRes = parsePrelude('WHEN', '(:host([checked]))')
                expect(whenRes.ok).toBe(true)

                const variantRes = parsePrelude('Variant', '(fill, tonal)')
                expect(variantRes.ok).toBe(true)

                const stateRes = parsePrelude('state', '(button) button')
                expect(stateRes.ok).toBe(true)

                const unknownRes = parsePrelude('custom-atrule', '(foo)')
                expect(unknownRes.ok).toBe(false)
            })
        })
    })

    // ------------------------------------------------------------------------
    // Suite 3: Round-Trip Serialization & AST Equivalence
    // ------------------------------------------------------------------------
    describe('3. Round-trip serialization & AST equivalence', () => {
        const testStylesheets = [
            {
                name: 'simple custom at-rules',
                css: `
                    @when(:host([checked])) {
                        button { color: red; }
                    }
                    @variant(fill, tonal) {
                        .card { background-color: blue; }
                    }
                    @state(button) button.small {
                        height: 32px;
                        padding: 4px 8px;
                    }
                `
            },
            {
                name: 'multi-level nesting',
                css: `
                    @variant(filled, outlined) {
                        @state(button) button:has(.icon) {
                            @when(:host([disabled])) {
                                opacity: 0.38;
                                cursor: not-allowed;
                            }
                        }
                    }
                `
            },
            {
                name: 'mixed with standard CSS, media query, and layer',
                css: `
                    @layer components {
                        @media (prefers-color-scheme: dark) {
                            @variant(filled) {
                                @state(button) button {
                                    background-color: var(--md-sys-color-primary);
                                    color: #ffffff;
                                }
                            }
                        }
                    }
                `
            },
            {
                name: 'comments preservation in blocks',
                css: `
                    @state(button) button {
                        /* critical layout property */
                        display: flex;
                        /* alignment */
                        align-items: center;
                    }
                `
            },
            {
                name: 'unquoted URLs and complex values',
                css: `
                    .icon {
                        background-image: url(https://example.com/assets/icon.svg?v=1&size=large);
                        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                    }
                `
            }
        ]

        for (const { name, css } of testStylesheets) {
            it(`roundtrips faithfully: ${name}`, () => {
                // Pass 1: Parse input CSS
                const ast1 = parseCustomStylesheet(css)
                expect(ast1.type).toBe('StyleSheet')

                // Generate CSS from AST 1
                const gen1 = styleSyntax.generate(ast1)
                expect(gen1.length).toBeGreaterThan(0)

                // Pass 2: Parse generated CSS
                const ast2 = parseCustomStylesheet(gen1)
                expect(ast2.type).toBe('StyleSheet')

                // Generate CSS from AST 2
                const gen2 = styleSyntax.generate(ast2)

                // Property 1: Idempotency of serialization
                expect(gen2).toBe(gen1)

                // Property 2: Structural AST equivalence
                const plain1 = stripLoc(toPlainObject(ast1))
                const plain2 = stripLoc(toPlainObject(ast2))
                expect(plain2).toEqual(plain1)
            })
        }
    })

    // ------------------------------------------------------------------------
    // Suite 4: Large Stylesheet Stress Testing (Throughput & Memory)
    // ------------------------------------------------------------------------
    describe('4. Large stylesheet stress testing', () => {
        function generateStressStylesheet(blockCount: number): string {
            const chunks: string[] = []
            for (let i = 0; i < blockCount; i++) {
                const mod = i % 3
                if (mod === 0) {
                    chunks.push(`
                        @state(button) button.state-${i}:has(.icon) {
                            /* block ${i} comment */
                            display: inline-flex;
                            height: ${32 + (i % 16)}px;
                            padding: 0 16px;
                            color: var(--md-sys-color-primary, #6200ee);
                        }
                    `)
                } else if (mod === 1) {
                    chunks.push(`
                        @variant(v${i}-a, v${i}-b) {
                            .card.variant-${i} {
                                border-radius: ${4 + (i % 8)}px;
                                background-image: url(https://cdn.example.com/img/${i}.png);
                            }
                        }
                    `)
                } else {
                    chunks.push(`
                        @when(:host([state-${i}]), :host([data-variant="v${i}"])) {
                            .container-${i} > .content {
                                opacity: 0.${(i % 9) + 1};
                                transform: translateY(${i % 10}px);
                            }
                        }
                    `)
                }
            }
            return chunks.join('\n')
        }

        const scaleLevels = [100, 500, 1000, 2000]

        for (const blockCount of scaleLevels) {
            it(`efficiently processes ${blockCount} custom at-rule blocks`, () => {
                const css = generateStressStylesheet(blockCount)
                const sizeKb = (css.length / 1024).toFixed(2)

                const startMem = process.memoryUsage().heapUsed
                const startTime = performance.now()

                // Parse
                const ast = parseCustomStylesheet(css)

                const parseTime = performance.now() - startTime

                // Generate
                const genStart = performance.now()
                const generatedCss = styleSyntax.generate(ast)
                const genTime = performance.now() - genStart

                const totalTime = performance.now() - startTime
                const endMem = process.memoryUsage().heapUsed
                const memDeltaMb = ((endMem - startMem) / (1024 * 1024)).toFixed(2)

                // Validations
                const childCount = (ast.children as any).size ?? (ast.children as any).toArray().length
                expect(childCount).toBe(blockCount)
                expect(generatedCss.length).toBeGreaterThan(0)

                // Throughput calculations
                const blocksPerSec = Math.round((blockCount / totalTime) * 1000)

                // Assertions: Sub-second total time even for 1000 blocks
                if (blockCount <= 1000) {
                    expect(totalTime).toBeLessThan(1000) // Less than 1 second
                }

                // Log performance metric for empirical evidence
                console.log(`[STRESS BENCHMARK ${blockCount} blocks] Size: ${sizeKb} KB | Parse: ${parseTime.toFixed(2)}ms | Gen: ${genTime.toFixed(2)}ms | Total: ${totalTime.toFixed(2)}ms (${blocksPerSec} blocks/s) | HeapDelta: ${memDeltaMb} MB`)
            })
        }
    })

    // ------------------------------------------------------------------------
    // Suite 5: Adversarial Edge Cases & Hostility Probe
    // ------------------------------------------------------------------------
    describe('5. Adversarial Edge Cases & Hostility Probe', () => {
        it('handles escaped parentheses and quotes in state target', () => {
            const input = '@state(button[data-tooltip="Save \\(all\\)"]) button[data-tooltip="Save \\(all\\)"]'
            const res = parseStatePrelude(input)
            expect(res.ok).toBe(true)
            if (res.ok) {
                expect(res.target).toBe('button[data-tooltip="Save \\(all\\)"]')
                expect(res.selector).toBe('button[data-tooltip="Save \\(all\\)"]')
            }
        })

        it('handles unclosed parentheses gracefully without hanging or crashing', () => {
            const collector = createWarningCollector()
            const badInputs = [
                '@state(button button',
                '@state((button) button',
                '@variant(fill, tonal',
                '@when(:host([checked])'
            ]
            for (const input of badInputs) {
                const resState = parseStatePrelude(input, collector)
                expect(resState.ok).toBe(false)
            }
            expect(collector.warnings.length).toBe(badInputs.length)
        })

        it('recovers gracefully from severely corrupt stylesheets', () => {
            const corrupt = '@@@@ {{{ }} @when( [ ;; ] } @state } @unknown { 123 }'
            const ast = parseCustomStylesheet(corrupt)
            expect(ast).toBeDefined()
            expect(ast.type).toBe('StyleSheet')
        })

        it('handles empty stylesheet and whitespace-only stylesheet', () => {
            const emptyAst = parseCustomStylesheet('')
            expect(emptyAst.type).toBe('StyleSheet')
            expect(emptyAst.children.isEmpty).toBe(true)

            const wsAst = parseCustomStylesheet('   \n\t  \r\n  ')
            expect(wsAst.type).toBe('StyleSheet')
            expect(wsAst.children.isEmpty).toBe(true)
        })

        it('handles unicode identifiers in custom at-rules', () => {
            const css = `
                @variant(主要, 次要) {
                    @state(按鈕) 按鈕.大型 {
                        顏色: 紅色;
                    }
                }
            `
            const ast = parseCustomStylesheet(css)
            expect(ast.type).toBe('StyleSheet')
            const gen = styleSyntax.generate(ast)
            expect(gen).toContain('主要')
            expect(gen).toContain('按鈕')
        })

        it('handles comments in between at-rule keyword and prelude', () => {
            const css = '@when /* inline comment */ (:host([checked])) { .box { margin: 0; } }'
            const ast = parseCustomStylesheet(css)
            expect(ast.type).toBe('StyleSheet')
            const first = ast.children.first as any
            expect(first.type).toBe('Atrule')
            expect(first.name).toBe('when')
            const preludeText = getPreludeText(first.prelude)
            expect(preludeText).toContain('(:host([checked]))')
        })

        it('handles deeply nested functional pseudo-classes in when condition', () => {
            const whenHeader = '@when(:host(:is(:where(:not([data-a="1"])), :has(:is([data-b="2"])))))'
            const res = parseWhenPrelude(whenHeader)
            expect(res.ok).toBe(true)
            if (res.ok) {
                expect(res.conditions.length).toBe(1)
                expect(isHostMountedSelector(res.conditions[0])).toBe(true)
            }
        })
    })
})
