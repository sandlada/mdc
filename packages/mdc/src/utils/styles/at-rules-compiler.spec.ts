/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
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
    hasDefiniteAtRules
} from './at-rules-compiler'
import { compileStateSheet, type StyleDiagnosticWarning } from './state-sheet-compiler'

function normalizeCss(css: string | string[]): string {
    const text = Array.isArray(css) ? css.join(' ') : css
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

describe('at-rules-compiler — Adversarial Reviewer Verification Suite', () => {
    describe('Issue 1: Outer :host attributes/modifiers preservation when hoisting @when', () => {
        it('preserves :host([dense]) when hoisting nested @when(:host([checked]))', () => {
            const input = ':host([dense]) { .wrapper { @when(:host([checked])) { button { color: red; } } } }'
            const expected = ':host([dense]) { .wrapper {} } :host([dense][checked]) { .wrapper { button { color: red; } } }'
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })

        it('preserves :where(:host) and :is(:host) when hoisting nested @when', () => {
            const input = ':where(:host) { .card { @when(:host([checked])) { padding: 8px; } } }'
            const expected = ':where(:host) { .card {} } :where(:host([checked])) { .card { padding: 8px; } }'
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })

        it('merges multiple conditions in @when with outer :host attributes (W4)', () => {
            const input = ':host([dense]) { .card { @when(:host([a]), :host([b])) { padding: 4px; } } }'
            const expected = ':host([dense]) { .card {} } :host([dense][a]), :host([dense][b]) { .card { padding: 4px; } }'
            const output = compileStateSheet({}, input)
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    })

    describe('Issue 2: Combo state matrix in nested @when inside @state', () => {
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

        it('correctly expands multidimensional combo states inside hoisted @when', () => {
            const input = '@state(button) button { @when(:host([dense])) { height: 32px; } }'
            const expected = 'button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} :host([dense]) { button.medium { height: 32px; } button.medium[disabled] { height: 32px; } button.large { height: 32px; } button.large[disabled] { height: 32px; } }'
            const output = compileStateSheet(ComboDef, input, { registry: ComboTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })

        it('preserves outer host shell attributes with combo states inside nested @when', () => {
            const input = ':host([variant="filled"]) { @state(button) button { @when(:host([checked])) { color: red; } } }'
            const expected = ':host([variant="filled"]) { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} } :host([variant="filled"][checked]) { button.medium { color: red; } button.medium[disabled] { color: red; } button.large { color: red; } button.large[disabled] { color: red; } }'
            const output = compileStateSheet(ComboDef, input, { registry: ComboTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    })

    describe('Issue 3: Rule R8 failure when target does not match non-& selector', () => {
        const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
        const SizeDef = createStyleDefinition(SizeSchema)({ 'size': [12, 14, 16] })
        const SizeTriggers = mapStateTriggers({
            'small': '.small',
            'medium': '.medium',
            'large': '.large'
        })

        it('passes through non-matching selector once without duplicating per state and emits warning', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@state(button) .card { color: red; }'
            const output = compileAtRulesSheet(SizeDef, input, { registry: SizeTriggers, onWarn })

            // Must NOT duplicate .card 3 times
            expect(normalizeCss(output)).toBe('.card { color: red; }')
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-state-target')
        })

        it('normalizes & only when followed by whitespace and an element (Rule R7)', () => {
            const input = '.wrapper { @state(button) & button {} }'
            const expected = '.wrapper { button.small {} button.medium {} button.large {} }'
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    })

    describe('Issue 4: CSS custom properties without --_ and whitespace in expandDeclaration', () => {
        it('expands shape with standard --mdc- prefix and whitespace', () => {
            const decl = expandDeclaration('shape', 'var( --mdc-shape )')
            expect(decl).toBe('border-start-start-radius: var(--mdc-shape-start-start); border-start-end-radius: var(--mdc-shape-start-end); border-end-end-radius: var(--mdc-shape-end-end); border-end-start-radius: var(--mdc-shape-end-start);')
        })

        it('expands padding with standard --mdc- prefix', () => {
            const decl = expandDeclaration('padding', 'var(--mdc-padding)')
            expect(decl).toBe('padding-inline-start: var(--mdc-padding-inline-start); padding-inline-end: var(--mdc-padding-inline-end); padding-block-start: var(--mdc-padding-block-start); padding-block-end: var(--mdc-padding-block-end);')
        })

        it('expands typescale with standard --mdc- prefix', () => {
            const decl = expandDeclaration('typescale', 'var(--mdc-typescale)')
            expect(decl).toBe('font-family: var(--mdc-typescale-font); font-size: var(--mdc-typescale-size); line-height: var(--mdc-typescale-leading); font-weight: var(--mdc-typescale-weight); letter-spacing: var(--mdc-typescale-tracking);')
        })
    })

    describe('Issue 5: Non-host conditions in @when (Rule W1)', () => {
        it('emits warning and does not hoist non-host condition to top-level shell', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '.card { @when(.dense) { padding: 4px; } }'
            const output = compileAtRulesSheet({}, input, { onWarn })

            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when-condition')
            // Must NOT hoist .dense outside .card
            expect(output).not.toContain('.dense { .card')
            expect(normalizeCss(output)).toBe('.card { .dense { padding: 4px; } }')
        })
    })

    describe('Issue 6: Malformed syntax resilience and warning emissions', () => {
        it('handles empty or malformed @variant gracefully with warning', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@variant() { button { color: blue; } }'
            const output = compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.length).toBeGreaterThan(0)
            expect(output).not.toContain(' {}')
        })

        it('warns on wildcards and negations in @variant', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@variant(*, !tonal) { button { color: red; } }'
            compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.some((w) => w.type === 'invalid-variant-name')).toBe(true)
        })

        it('handles unclosed parentheses and braces without throwing or infinite loop', () => {
            const malformedInputs = [
                '@variant(filled { button {} }',
                '@when(:host([checked] { button {}',
                'button { shape: var(--_shape',
                'div { color: "unclosed string',
                '{{{{}}}}'
            ]

            for (const input of malformedInputs) {
                expect(() => compileAtRulesSheet({}, input)).not.toThrow()
            }
        })
    })

    describe('Issue 7: Zero-& enforcement in hoisted :host subtrees (Rule H2 & W3)', () => {
        it('strips & descendant selectors when hoisted into a :host shell', () => {
            const input = '.wrapper { & .inner { @when(:host([checked])) { color: red; } } }'
            const output = compileStateSheet({}, input)
            // Under :host([checked]), & .inner must become .inner
            expect(output).not.toContain(':host([checked]) { .wrapper { & .inner')
            expect(normalizeCss(output)).toContain(':host([checked]) { .wrapper { .inner { color: red; } } }')
        })

        it('removeAmpersandForHostSubtree correctly normalizes & patterns', () => {
            expect(removeAmpersandForHostSubtree('& .inner')).toBe('.inner')
            expect(removeAmpersandForHostSubtree('& > .inner')).toBe('> .inner')
            expect(removeAmpersandForHostSubtree('&')).toBe('')
            expect(removeAmpersandForHostSubtree('.card')).toBe('.card')
        })
    })

    describe('Issue 8: Tag-attached class / ID targets in replaceTargetInBranch', () => {
        it('matches .card in div.card when target is .card', () => {
            const res = replaceTargetInBranch('div.card', '.card', '.small')
            expect(res.matched).toBe(true)
            expect(res.result).toBe('div.card.small')
        })

        it('matches #submit in button#submit when target is #submit', () => {
            const res = replaceTargetInBranch('button#submit', '#submit', '.small')
            expect(res.matched).toBe(true)
            expect(res.result).toBe('button#submit.small')
        })
    })

    describe('Issue 9: Property expanders with multi-line, calc(), and comment values', () => {
        it('expands shape with calc() expressions without breaking inner terms', () => {
            const decl = expandDeclaration('shape', 'calc(10px + 2px)')
            expect(decl).toBe('border-start-start-radius: calc(10px + 2px); border-start-end-radius: calc(10px + 2px); border-end-end-radius: calc(10px + 2px); border-end-start-radius: calc(10px + 2px);')
        })

        it('expands shape with multi-value calc() expressions', () => {
            const decl = expandDeclaration('shape', 'calc(10px + 2px) 4px')
            expect(decl).toBe('border-start-start-radius: calc(10px + 2px); border-start-end-radius: 4px; border-end-end-radius: calc(10px + 2px); border-end-start-radius: 4px;')
        })

        it('expands padding and margin with calc() expressions and 2 values', () => {
            const paddingDecl = expandDeclaration('padding', 'calc(10px + 2px) 16px')
            expect(paddingDecl).toBe('padding-inline-start: 16px; padding-inline-end: 16px; padding-block-start: calc(10px + 2px); padding-block-end: calc(10px + 2px);')

            const marginDecl = expandDeclaration('margin', '8px calc(12px - 4px)')
            expect(marginDecl).toBe('margin-inline-start: calc(12px - 4px); margin-inline-end: calc(12px - 4px); margin-block-start: 8px; margin-block-end: 8px;')
        })

        it('does not produce double semicolons for single-value padding or margin', () => {
            const decl = expandDeclaration('padding', '8px;')
            expect(decl).toBe('padding: 8px;')
        })

        it('expands declarations with embedded CSS comments', () => {
            const decl = expandDeclaration('shape', '8px /* top */ 16px;')
            expect(decl).toBe('border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px;')
        })

        it('expands typescale with comments inside var()', () => {
            const decl = expandDeclaration('typescale', 'var(--mdc-body /* comment */)')
            expect(decl).toBe('font-family: var(--mdc-body-font); font-size: var(--mdc-body-size); line-height: var(--mdc-body-leading); font-weight: var(--mdc-body-weight); letter-spacing: var(--mdc-body-tracking);')
        })

        it('splits CSS values at depth 0 respecting parentheses', () => {
            const tokens = splitCssValues('calc(10px + 2px) var(--pad, 4px 8px) 16px')
            expect(tokens).toEqual(['calc(10px + 2px)', 'var(--pad, 4px 8px)', '16px'])
        })
    })

    describe('Issue 10: Nested isolation containers preserving outer ancestor context during hoisting', () => {
        it('preserves outer selector context when @when is inside @media / @reduced-motion', () => {
            const input = '.card { @reduced-motion { @when(:host([dense])) { padding: 4px; } } }'
            const output = compileStateSheet({}, input)
            // Hoisted rule inside @media must retain .card
            expect(normalizeCss(output)).toBe('.card { @media (prefers-reduced-motion: reduce) { :host([dense]) { .card { padding: 4px; } } } }')
        })
    })

    describe('Issue 11: Warnings for excessive state nesting and explosive Cartesian combinations', () => {
        it('warns when @contrast has invalid or unsupported arguments', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '.card { @contrast(invalid) { color: black; } }'
            compileAtRulesSheet({}, input, { onWarn })

            expect(warnings.some((w) => w.type === 'invalid-a11y-macro')).toBe(true)
        })

        it('warns on excessive state nesting depth >= 3', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const SizeSchema = defineSchema(['small', 'medium'] as const)
            const SizeDef = createStyleDefinition(SizeSchema)({ 'size': [12, 14] })
            const SizeTriggers = mapStateTriggers({ 'small': '.small', 'medium': '.medium' })

            const input = '@state(button) button { @state(button) button { @state(button) button { @state(button) button { color: red; } } } }'
            compileAtRulesSheet(SizeDef, input, { registry: SizeTriggers, onWarn })

            expect(warnings.some((w) => w.type === 'excessive-state-nesting')).toBe(true)
        })

        it('warns on explosive Cartesian combinations exceeding threshold', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

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

            const input = '@state(button) button { color: red; }'
            compileAtRulesSheet(LargeComboDef, input, { onWarn })

            expect(warnings.some((w) => w.type === 'explosive-cartesian-matrix')).toBe(true)
        })
    })

    describe('Issue 12: Precision of isAtRulesStylesheet avoiding false positives', () => {
        it('does not classify standard single-value padding or margin as an at-rules stylesheet', () => {
            expect(isAtRulesStylesheet('button { padding: 16px; }')).toBe(false)
            expect(isAtRulesStylesheet('button { margin: 0; }')).toBe(false)
        })

        it('correctly classifies property macro shorthands as at-rules stylesheets', () => {
            expect(isAtRulesStylesheet('button { padding: 8px 16px; }')).toBe(true)
            expect(isAtRulesStylesheet('button { padding: var(--_padding); }')).toBe(true)
            expect(isAtRulesStylesheet('button { shape: 8px; }')).toBe(true)
            expect(isAtRulesStylesheet('button { typescale: var(--_label); }')).toBe(true)
        })

        it('identifies definite at-rules with hasDefiniteAtRules', () => {
            expect(hasDefiniteAtRules('.card { @when(:host([dense])) {} }')).toBe(true)
            expect(hasDefiniteAtRules('button { shape: 8px; }')).toBe(true)
            expect(hasDefiniteAtRules('button { @reduced-motion {} }')).toBe(true)
            expect(hasDefiniteAtRules('div { color: red; }')).toBe(false)
        })
    })

    describe('Issue 13: compileStateSheet with options.onWarn on At-Rules stylesheets', () => {
        it('routes to compileAtRulesSheet even when options.onWarn is provided for @when', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '.card { @when(:host([dense])) { padding: 4px; } }'
            const output = compileStateSheet({}, input, { onWarn })
            expect(normalizeCss(output)).toBe('.card {} :host([dense]) { .card { padding: 4px; } }')
        })

        it('routes to compileAtRulesSheet even when options.onWarn is provided for shape: expander', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = 'button { shape: 8px 16px; }'
            const output = compileStateSheet({}, input, { onWarn })
            expect(normalizeCss(output)).toBe('button { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; }')
        })

        it('routes to compileAtRulesSheet and expands @reduced-motion when onWarn is provided', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = 'button { @reduced-motion { transition: none; } }'
            const output = compileStateSheet({}, input, { onWarn })
            expect(normalizeCss(output)).toBe('button { @media (prefers-reduced-motion: reduce) { transition: none; } }')
        })

        it('delivers invalid-when-condition warning through compileStateSheet entrypoint', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '.card { @when(.dense) { padding: 4px; } }'
            const output = compileStateSheet({}, input, { onWarn })
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when-condition')
            expect(normalizeCss(output)).toBe('.card { .dense { padding: 4px; } }')
        })
    })

    describe('Issue 14: Combinator pattern matching variable whitespace in descendant targets', () => {
        it('matches descendant combinator across multiple spaces and tabs', () => {
            const res = replaceTargetInBranch('.container   .card', '.container .card', '.active')
            expect(res.matched).toBe(true)
            expect(res.result).toBe('.container   .card.active')
        })

        it('matches descendant combinator with terminal pseudo-elements and variable spaces', () => {
            const res = replaceTargetInBranch('.container \t .card::before', '.container .card::before', '.active')
            expect(res.matched).toBe(true)
            expect(res.result).toBe('.container \t .card.active::before')
        })
    })

    describe('Issue 15: Empty @when() condition list validation', () => {
        it('emits invalid-when warning and preserves block without corrupting selector', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@when() { button { color: blue; } }'
            const output = compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when')
            expect(output).not.toContain('{} {')
            expect(output).not.toContain(' {}')
        })

        it('emits invalid-when warning for whitespace-only condition in @when(   )', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@when(   ) { button { color: blue; } }'
            const output = compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.length).toBe(1)
            expect(warnings[0].type).toBe('invalid-when')
        })
    })

    describe('Issue 16: Malformed @state syntax validation (Rule R1)', () => {
        it('emits invalid-state-syntax warning when selector is missing from @state', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@state(button) { color: red; }'
            compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
        })

        it('emits invalid-state-syntax warning when @state has empty parens', () => {
            const warnings: StyleDiagnosticWarning[] = []
            const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

            const input = '@state() button { color: red; }'
            compileAtRulesSheet({}, input, { onWarn })
            expect(warnings.some((w) => w.type === 'invalid-state-syntax')).toBe(true)
        })
    })

    describe('Issue 17: Deep multi-rule integration composing @variant, @state, @when, and property expanders', () => {
        const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
        const SizeDef = createStyleDefinition(SizeSchema)({
            'size': [12, 14, 16],
        })
        const SizeTriggers = mapStateTriggers({
            'small': '.small',
            'medium': '.medium',
            'large': '.large',
        })

        it('seamlessly composes @variant, @state, @when, and property expanders in a single rule', () => {
            const input = '@variant(filled) { @state(button) button { shape: 8px 16px; @when(:host([checked])) { color: red; } } }'
            const expected = ':host([variant="filled"]) { button.small { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.medium { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.large { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } } :host([variant="filled"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(normalizeCss(output)).toBe(normalizeCss(expected))
        })
    })
})
