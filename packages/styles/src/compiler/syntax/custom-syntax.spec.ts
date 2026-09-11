/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Unit test suite for `custom-syntax.ts` (Milestone 1).
 * Covers:
 *   - csstree.fork() custom at-rules grammar (@when, @variant, @state)
 *   - AST node construction and serialization
 *   - Prelude parsing and parameter decomposition
 *   - Fail-fast validation rules (R1, V1-V4, W1-W5) with StyleDiagnosticWarning
 *   - Comment preservation and unquoted URL handling
 *   - Tolerant parsing on malformed inputs
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

describe('custom-syntax (Milestone 1)', () => {
    describe('1. CSSTree AST Grammar & Node Construction', () => {
        it('parses @when into Atrule with AtrulePrelude and Block', () => {
            const css = '@when(:host([checked])) { button { color: red; } }'
            const ast = styleSyntax.parse(css) as any
            expect(ast.type).toBe('StyleSheet')
            const first = ast.children.first
            expect(first.type).toBe('Atrule')
            expect(first.name).toBe('when')
            expect(first.prelude).not.toBeNull()
            expect(first.prelude.type).toBe('AtrulePrelude')
            expect(first.block).not.toBeNull()
            expect(first.block.type).toBe('Block')
            expect(getPreludeText(first.prelude)).toBe('(:host([checked]))')
        })

        it('parses @variant into Atrule with AtrulePrelude and Block', () => {
            const css = '@variant(fill, tonal) { button { color: red; } }'
            const ast = styleSyntax.parse(css) as any
            const first = ast.children.first
            expect(first.type).toBe('Atrule')
            expect(first.name).toBe('variant')
            expect(first.prelude.type).toBe('AtrulePrelude')
            expect(first.block.type).toBe('Block')
            expect(getPreludeText(first.prelude)).toBe('(fill, tonal)')
        })

        it('parses @state into Atrule with AtrulePrelude and Block', () => {
            const css = '@state(button) button.small { height: 32px; }'
            const ast = styleSyntax.parse(css) as any
            const first = ast.children.first
            expect(first.type).toBe('Atrule')
            expect(first.name).toBe('state')
            expect(first.prelude.type).toBe('AtrulePrelude')
            expect(first.block.type).toBe('Block')
            expect(getPreludeText(first.prelude)).toBe('(button) button.small')
        })

        it('parses multi-level nested custom at-rules faithfully', () => {
            const css = `
                @variant(fill) {
                    @state(button) button {
                        @when(:host([checked])) {
                            color: red;
                        }
                    }
                }
            `
            const ast = styleSyntax.parse(css) as any
            const variantNode = ast.children.first
            expect(variantNode.name).toBe('variant')
            const stateNode = variantNode.block.children.first
            expect(stateNode.name).toBe('state')
            const whenNode = stateNode.block.children.first
            expect(whenNode.name).toBe('when')
        })

        it('serializes custom at-rules back via styleSyntax.generate', () => {
            const css = '@when(:host([dense])) { .card { padding: 4px; } }'
            const ast = styleSyntax.parse(css)
            const generated = styleSyntax.generate(ast)
            expect(generated).toContain('@when')
            expect(generated).toContain(':host([dense])')
            expect(generated).toContain('.card')
            expect(generated).toContain('padding:4px')
        })
    })

    describe('2. Positive Prelude Decomposition', () => {
        describe('@state preludes', () => {
            const stateRows: Array<readonly [input: string, target: string, selector: string]> = [
                ['(button) button', 'button', 'button'],
                ['(.card) div.card', '.card', 'div.card'],
                ['(#submit) button#submit', '#submit', 'button#submit'],
                ['(:host) :host', ':host', ':host'],
                ['(:host) :host([dense])', ':host', ':host([dense])'],
                ['(:where(:host)) :where(:host)', ':where(:host)', ':where(:host)'],
                ['(button) button .label', 'button', 'button .label'],
                ['(button) button:is(.icon, .label)', 'button', 'button:is(.icon, .label)'],
                ['(button) button:has(.label)', 'button', 'button:has(.label)'],
                ['(button) button[type="button"]', 'button', 'button[type="button"]'],
                ['(button) .container > button:has(.label) > .label', 'button', '.container > button:has(.label) > .label'],
                ['(button) & button', 'button', '& button'],
                ['(button) &button:has(.label)', 'button', '&button:has(.label)'],
                ['(  button  )   button  ', 'button', 'button'],
                ['(button) button, button .icon', 'button', 'button, button .icon'],
                ['(button) button::before', 'button', 'button::before'],
                ['(button) slot::slotted(button)', 'button', 'slot::slotted(button)']
            ]

            for (const [input, target, selector] of stateRows) {
                it(`decomposes @state ${input}`, () => {
                    const res = parseStatePrelude(input)
                    expect(res.valid).toBe(true)
                    expect(res.target).toBe(target)
                    expect(res.selector).toBe(selector)
                    expect(res.targetAst).toBeDefined()
                    expect(res.selectorAst).toBeDefined()
                })
            }
        })

        describe('@variant preludes', () => {
            const variantRows: Array<readonly [input: string, names: readonly string[]]> = [
                ['(fill)', ['fill']],
                ['(tonal)', ['tonal']],
                ['(outlined)', ['outlined']],
                ['(fill, tonal)', ['fill', 'tonal']],
                ['(fill, tonal, outlined)', ['fill', 'tonal', 'outlined']],
                ['(  fill ,  tonal  )', ['fill', 'tonal']],
                ['(fill, tonal,)', ['fill', 'tonal']],
                ['(extra-large, primary-container)', ['extra-large', 'primary-container']]
            ]

            for (const [input, names] of variantRows) {
                it(`decomposes @variant ${input}`, () => {
                    const res = parseVariantPrelude(input)
                    expect(res.valid).toBe(true)
                    expect(res.names).toEqual(names)
                    expect(res.variants).toEqual(names)
                })
            }
        })

        describe('@when preludes', () => {
            const whenRows: Array<readonly [input: string, conditions: readonly string[]]> = [
                ['(:host)', [':host']],
                ['(:host([checked]))', [':host([checked])']],
                ['(:host([dense]))', [':host([dense])']],
                ['(:host(:hover))', [':host(:hover)']],
                ['(:host(:focus-visible))', [':host(:focus-visible)']],
                ['(:host(:not([disabled])))', [':host(:not([disabled]))']],
                ['(:host(.active))', [':host(.active)']],
                ['(:where(:host))', [':where(:host)']],
                ['(:is(:host([a]), :host([b])))', [':is(:host([a]), :host([b]))']],
                ['(:where(:host([disabled]), :host(:has(.disabled))))', [':where(:host([disabled]), :host(:has(.disabled)))']],
                ['(:host(:has(.label)))', [':host(:has(.label))']],
                ['(:host([type="submit"]))', [':host([type="submit"])']],
                ['(:host([v="x" i]))', [':host([v="x" i])']],
                ['(:host(:state(checked)))', [':host(:state(checked))']],
                ['(:host([checked]), :host([active]))', [':host([checked])', ':host([active])']],
                ['(  :host([checked]) ,  :host([active])  )', [':host([checked])', ':host([active])']],
                ['(:host([checked]), :host([active]),)', [':host([checked])', ':host([active])']]
            ]

            for (const [input, conditions] of whenRows) {
                it(`decomposes @when ${input}`, () => {
                    const res = parseWhenPrelude(input)
                    expect(res.valid).toBe(true)
                    expect(res.conditions).toEqual(conditions)
                    expect(res.selectorAst).toBeDefined()
                })
            }
        })
    })

    describe('3. Negative / Malformed Cases & Fail-Fast Validation', () => {
        describe('Rule R1: @state validation (invalid-state-syntax)', () => {
            const invalidStateHeaders = [
                '@state button',
                '@state() button',
                '@state(   ) button',
                '@state(button)',
                '@state(button)   ',
                '@state(button',
                '@state'
            ]

            for (const header of invalidStateHeaders) {
                it(`rejects and warns on ${header}`, () => {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseStatePrelude(header, { onWarn })
                    expect(res.valid).toBe(false)
                    expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
                })
            }
        })

        describe('Rule V1–V4: @variant validation', () => {
            it('V1: rejects missing parens and empty name lists (invalid-variant)', () => {
                const emptyVariantHeaders = ['@variant', '@variant fill', '@variant [fill]', '@variant()', '@variant(   )']
                for (const header of emptyVariantHeaders) {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseVariantPrelude(header, { onWarn })
                    expect(res.valid).toBe(false)
                    expect(warnings.some((w) => w.type === 'invalid-variant')).toBe(true)
                }
            })

            it('V2: rejects wildcards and negations with single warning (invalid-variant-name)', () => {
                const wildcardHeaders = ['@variant(*)', '@variant(**)', '@variant(!tonal)', '@variant(!)', '@variant(*, fill)', '@variant(fill, !tonal)']
                for (const header of wildcardHeaders) {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseVariantPrelude(header, { onWarn })
                    expect(res.valid).toBe(false)
                    expect(warnings.filter((w) => w.type === 'invalid-variant-name').length).toBe(1)
                }
            })

            it('V3: rejects unknown variants against dictionary (unknown-variant)', () => {
                const knownVariants = ['fill', 'tonal', 'outlined']
                const unknownHeaders = ['@variant(unknown)', '@variant(invalid-variant)', '@variant(:host)', '@variant(Fill)']
                for (const header of unknownHeaders) {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseVariantPrelude(header, { onWarn, knownVariants })
                    expect(res.valid).toBe(false)
                    expect(warnings.some((w) => w.type === 'unknown-variant')).toBe(true)
                }
            })

            it('V4: rejects nested @variant (nested-variant)', () => {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseVariantPrelude('@variant(fill)', { onWarn, isNestedVariant: true })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'nested-variant')).toBe(true)
            })
        })

        describe('Rule W1–W5: @when validation', () => {
            it('W2: rejects empty condition lists (invalid-when)', () => {
                const emptyWhenHeaders = ['@when', '@when .dense', '@when()', '@when(   )']
                for (const header of emptyWhenHeaders) {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseWhenPrelude(header, { onWarn })
                    expect(res.valid).toBe(false)
                    expect(warnings.some((w) => w.type === 'invalid-when')).toBe(true)
                }
            })

            it('W1: rejects non-host conditions (invalid-when-condition)', () => {
                const nonHostHeaders = [
                    '@when(.dense)',
                    '@when(&.dense)',
                    '@when(:hover)',
                    '@when(button:hover)',
                    '@when(::before)',
                    '@when(host)',
                    '@when(:HOST)',
                    '@when(:hostx)',
                    '@when(:host-foo)',
                    '@when(:host .container)',
                    '@when(:host button)',
                    '@when(:host > .container)',
                    '@when(:where(:host .container))',
                    '@when(:host([checked]), .dense)',
                    '@when(:host([checked]), :host button)'
                ]
                for (const header of nonHostHeaders) {
                    const { warnings, onWarn } = createWarningCollector()
                    const res = parseWhenPrelude(header, { onWarn })
                    expect(res.valid).toBe(false)
                    expect(warnings.some((w) => w.type === 'invalid-when-condition')).toBe(true)
                }
            })

            it('W5: rejects nested @when (nested-when)', () => {
                const { warnings, onWarn } = createWarningCollector()
                const res = parseWhenPrelude('@when(:host([checked]))', { onWarn, isNestedWhen: true })
                expect(res.valid).toBe(false)
                expect(warnings.some((w) => w.type === 'nested-when')).toBe(true)
            })

            it('BUG-06 D3: enforces strict priority chain (syntax > host > nesting)', () => {
                // Syntax error suppresses nested-when
                const c1 = createWarningCollector()
                parseWhenPrelude('@when()', { onWarn: c1.onWarn, isNestedWhen: true })
                expect(c1.warnings.length).toBe(1)
                expect(c1.warnings[0].type).toBe('invalid-when')

                // Non-host condition error suppresses nested-when
                const c2 = createWarningCollector()
                parseWhenPrelude('@when(.dense)', { onWarn: c2.onWarn, isNestedWhen: true })
                expect(c2.warnings.length).toBe(1)
                expect(c2.warnings[0].type).toBe('invalid-when-condition')
            })
        })
    })

    describe('4. Comments Preservation & URL Handling', () => {
        it('preserves comments within preludes without breaking extraction', () => {
            const resWhen = parseWhenPrelude('(:host/* mid-comment */([dense]))')
            expect(resWhen.valid).toBe(true)
            expect(resWhen.conditions).toEqual([':host([dense])'])

            const resVar = parseVariantPrelude('(/* v1 */ fill, /* v2 */ tonal)')
            expect(resVar.valid).toBe(true)
            expect(resVar.names).toEqual(['fill', 'tonal'])

            const resState = parseStatePrelude('(button /* target */) button /* selector */')
            expect(resState.valid).toBe(true)
            expect(resState.target).toBe('button')
            expect(resState.selector).toBe('button')
        })

        it('pure comment in prelude evaluates to empty -> warns invalid-when', () => {
            const { warnings, onWarn } = createWarningCollector()
            const res = parseWhenPrelude('(/* only comment */)', { onWarn })
            expect(res.valid).toBe(false)
            expect(warnings.some((w) => w.type === 'invalid-when')).toBe(true)
        })

        it('parses declaration comments into AST Comment nodes', () => {
            const css = 'button { /* comment before */ color: red; }'
            const ast = styleSyntax.parse(css) as any
            const block = ast.children.first.block
            const hasComment = block.children.toArray().some((node: any) => node.type === 'Comment')
            expect(hasComment).toBe(true)
        })

        it('preserves unquoted URLs containing // without truncation', () => {
            const css = 'button { background: url(https://example.com/styles.css?v=1#hash); }'
            const ast = styleSyntax.parse(css)
            const generated = styleSyntax.generate(ast)
            expect(generated).toContain('url(https://example.com/styles.css?v=1#hash)')
        })

        it('treats // in at-rule header as non-comment string per BUG-02 B3', () => {
            const res = parseStatePrelude('(button // x) button')
            expect(res.valid).toBe(true)
            // Raw parameter retains '// x', ensuring target is not stripped to 'button'
            expect(res.target).toContain('//')
        })
    })

    describe('5. Tolerant Recovery on Malformed CSS', () => {
        const malformedCss = [
            '@variant(filled { button {} }',
            '@when(:host([checked] { button {}',
            'button { shape: var(--_shape',
            'div { color: "unclosed string',
            '{{{{}}}}',
            '@state(button',
            '@state(button) button {'
        ]

        for (const input of malformedCss) {
            it(`does not crash or throw on malformed input: ${input}`, () => {
                expect(() => parseCustomStylesheet(input)).not.toThrow()
            })
        }
    })

    describe('6. Unified Dispatcher & Utilities', () => {
        it('dispatches to corresponding parser via parsePrelude', () => {
            const resWhen = parsePrelude('when', '(:host([checked]))')
            expect(resWhen.valid).toBe(true)
            expect((resWhen as any).conditions).toEqual([':host([checked])'])

            const resVar = parsePrelude('variant', '(fill, tonal)')
            expect(resVar.valid).toBe(true)
            expect((resVar as any).names).toEqual(['fill', 'tonal'])

            const resState = parsePrelude('state', '(button) button')
            expect(resState.valid).toBe(true)
            expect((resState as any).target).toBe('button')

            const resUnknown = parsePrelude('unknown', '(foo)')
            expect(resUnknown.valid).toBe(false)
        })

        it('detects nested at-rules via hasNestedAtrule', () => {
            const astNested = styleSyntax.parse('@when(:host([checked])) { @when(:host) button {} }') as any
            const firstBlock = (astNested.children.first as any).block
            expect(hasNestedAtrule(firstBlock, 'when')).toBe(true)
            expect(hasNestedAtrule(firstBlock, 'variant')).toBe(false)

            const astClean = styleSyntax.parse('@when(:host([checked])) { button { color: red; } }') as any
            const cleanBlock = (astClean.children.first as any).block
            expect(hasNestedAtrule(cleanBlock, 'when')).toBe(false)
        })

        it('validates selector nodes via isHostMountedSelectorAst', () => {
            const hostSelector = styleSyntax.parse(':host([checked])', { context: 'selector' }) as any
            expect(isHostMountedSelectorAst(hostSelector)).toBe(true)

            const descendantSelector = styleSyntax.parse(':host .child', { context: 'selector' }) as any
            expect(isHostMountedSelectorAst(descendantSelector)).toBe(false)
        })
    })
})
