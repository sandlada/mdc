/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Mapping-format suite: each row is `[label, styles, mustContain]` where the
 * `MDCStyleSheet` is produced up front by one invocation form of `createStyleSheet`
 * (tagged / curried / tables-first / options-first / callback / zero-arg). The runner
 * only asserts the instance type and the content expectations, so the table
 * stays declarative while the form variety remains visible per row.
 */

import { describe, it, expect } from 'vitest'
import { css } from 'lit'
import { MDCStyleSheet } from '../foundation'
import { defineSchema } from '../schema'
import { createStyleDefinition } from '../schema'
import { emptyTables, withState, withVariant, type TriggerTables } from '../schema'
import { flow } from '../foundation'
import { createStyleSheet } from './create-style-sheet'

describe('createStyleSheet', () => {
    const ButtonSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
    const ButtonDefinition = createStyleDefinition(ButtonSchema)({
        'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
        'label-color': ['#ffffff', '#ffffff', '#9e9e9e'],
        'container-shape': '8px'
    })

    const tables = withState({
        'enabled': '',
        'hovered': ':hover',
        'disabled': '[disabled]'
    })(emptyTables)

    const stateBackground = `
        @state(.container) .container {
            background-color: var(--_container-color);
        }
    `

    const height = '48px'
    const zIndex = 10
    const colorObj = { ToCSSVariable: () => 'var(--mdc-color-primary)' }
    const embeddedRule = css`margin: 0;`
    const multiValues = [css`padding: 4px;`, 'display: inline-flex;']

    const compileWithTables = createStyleSheet(tables)
    const compileZeroThenDef = createStyleSheet()
    const compileZeroThenTables = createStyleSheet()

    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16]
    })
    const sizeStates = {
        'small': '.small',
        'medium': '.medium',
        'large': '.large'
    }
    const SizeTriggers = withState(sizeStates)(emptyTables)

    const VariantSchema = defineSchema(['enabled'] as const)
    const VariantDefs = {
        'filled': createStyleDefinition(VariantSchema)({ 'color': '#6750a4' }),
        'tonal': createStyleDefinition(VariantSchema)({ 'color': '#e8def8' })
    } as const
    const buttonVariants = {
        'filled': ':host([variant="filled"])',
        'tonal': ':host([variant="tonal"])'
    }
    const VariantTables = withVariant(buttonVariants)(emptyTables)
    const SizeVariantTables: TriggerTables = flow(
        withState(sizeStates),
        withVariant(buttonVariants)
    )(emptyTables)

    const ComboSchema = defineSchema([['small', 'large'], ['enabled', 'disabled']] as const)
    const ComboDef = createStyleDefinition(ComboSchema)({
        'size': { 'small': '12px', 'large': '16px' },
        'opacity': { 'enabled': '1', 'disabled': '0.38' },
        'color': '#6750a4'
    })
    const ComboTriggers = withState({
        'small': '.small',
        'large': '.large',
        'enabled': '',
        'disabled': '[disabled]'
    })(emptyTables)

    const BadgeLikeSchema = defineSchema(['small', 'large'] as const)
    const BadgeLikeDef = createStyleDefinition(BadgeLikeSchema)({
        'container-size': ['6px', '16px'],
        'container-padding-block-start': ['2px', '4px'],
        'container-padding-block-end': ['2px', '4px'],
        'container-padding-inline-start': ['4px', '8px'],
        'container-padding-inline-end': ['4px', '8px'],
        'container-color': '#b3261e'
    })
    const BadgeLikeTriggers = withState({
        'small': '.small',
        'large': '.large'
    })(emptyTables)

    const mapping: Array<[string, MDCStyleSheet, readonly string[], (readonly string[])?]> = [
        // Invocation forms over the @state branch
        ['tagged template literal: createStyleSheet(def)`...`',
            createStyleSheet(ButtonDefinition)`
                @state(.container) .container {
                    border-radius: var(--_container-shape);
                    background-color: var(--_container-color);
                    .label {
                        color: var(--_label-color);
                    }
                }
            `,
            ['.container {', 'border-radius: var(--_container-shape);', 'background-color: var(--_enabled-container-color);', '.container:hover {', 'background-color: var(--_hovered-container-color);']],
        ['interpolated strings, numbers, ToCSSVariable objects, and nested CSSResults',
            createStyleSheet(ButtonDefinition)`
                @state(.container) .container {
                    height: ${height};
                    z-index: ${zIndex};
                    border-color: ${colorObj};
                    ${embeddedRule}
                    ${multiValues}
                }
            `,
            ['height: 48px;', 'z-index: 10;', 'border-color: var(--mdc-color-primary);', 'margin: 0;', 'padding: 4px;', 'display: inline-flex;']],
        ['curried definition-first invocation: createStyleSheet(def)(template)',
            createStyleSheet(ButtonDefinition)(stateBackground),
            ['.container {', 'background-color: var(--_enabled-container-color);']],
        ['tables-first invocation: createStyleSheet(tables)(def)`...`',
            createStyleSheet(tables)(ButtonDefinition)(stateBackground),
            ['.container:hover {', 'background-color: var(--_hovered-container-color);']],
        ['options object: createStyleSheet({ tables })',
            createStyleSheet({ tables })(ButtonDefinition)(stateBackground),
            ['.container:hover {']],
        ['uncurried callback: createStyleSheet(def, () => css`...`)',
            createStyleSheet(ButtonDefinition, () => css`
                @state(.container) .container {
                    background-color: var(--_container-color);
                }
            `),
            ['.container {', 'background-color: var(--_enabled-container-color);']],
        ['tables-first bound: createStyleSheet(tables)(def)',
            compileWithTables(ButtonDefinition)(stateBackground),
            ['.container:hover {']],
        ['zero-arg then definition: createStyleSheet()(def)',
            compileZeroThenDef(ButtonDefinition)(stateBackground),
            ['.container {']],
        ['zero-arg then tables: createStyleSheet()(tables)(def)',
            compileZeroThenTables(tables)(ButtonDefinition)(stateBackground),
            ['.container:hover {']],
        ['empty template string returns empty MDCStyleSheet',
            createStyleSheet(ButtonDefinition)``,
            []],
        // New @state system (oracled in at-rules/transform-state.spec.ts) via the HOF entrypoint
        ['new @state rules via tagged template literal',
            createStyleSheet({ tables: SizeTriggers })(SizeDef)`
                @state(button) button {
                    color: red;
                }
            `,
            ['button.small {', 'button.medium {', 'button.large {']],
        ['new exact @variant names wrap in :host variant shells',
            createStyleSheet({ tables: VariantTables })(VariantDefs)`
                @variant(filled, tonal) { button {} }
            `,
            [':host([variant="filled"]), :host([variant="tonal"]) {']],
        ['new @variant shells compose with inner @state expansion',
            createStyleSheet({ tables: SizeVariantTables })(SizeDef)`
                @variant(filled) { @state(button) button {} }
            `,
            [':host([variant="filled"]) {', 'button.small {', 'button.medium {', 'button.large {']],
        ['new top-level @when host conditions lower',
            createStyleSheet(SizeDef)`
                @when(:host([checked])) { button {} }
            `,
            [':host([checked]) {']],
        ['new shape property macros expand',
            createStyleSheet(SizeDef)`
                button { shape: 8px 16px; }
            `,
            ['border-start-start-radius: 8px;', 'border-start-end-radius: 16px;']],

        // Real-world production scenarios: multi-state variable rewriting under @state
        ['@state rewrites multi-state variables into state-specific variables',
            createStyleSheet({ tables: SizeTriggers })(SizeDef)`
                @state(button) button {
                    height: var(--_size);
                }
            `,
            [
                'button.small { height: var(--_small-size); }',
                'button.medium { height: var(--_medium-size); }',
                'button.large { height: var(--_large-size); }'
            ],
            [
                'button.small { height: var(--_size);',
                'button.medium { height: var(--_size);',
                'button.large { height: var(--_size);'
            ]],
        ['@state preserves invariant tokens while rewriting state tokens',
            createStyleSheet({ tables: BadgeLikeTriggers })(BadgeLikeDef)`
                @state(.container) .container {
                    height: var(--_container-size);
                    background-color: var(--_container-color);
                    padding-block-start: var(--_container-padding-block-start);
                }
            `,
            [
                '.container.small {',
                'height: var(--_small-container-size);',
                'padding-block-start: var(--_small-container-padding-block-start);',
                'background-color: var(--_container-color);',
                '.container.large {',
                'height: var(--_large-container-size);',
                'padding-block-start: var(--_large-container-padding-block-start);'
            ],
            [
                'height: var(--_container-size);',
                'padding-block-start: var(--_container-padding-block-start);',
                '--_small-container-color',
                '--_large-container-color'
            ]],
        ['@state curried pipeline with Cartesian combo dimensions rewrites all orthogonal tokens',
            createStyleSheet(ComboTriggers)(ComboDef)(() => css`
                @state(button) button {
                    height: var(--_size);
                    opacity: var(--_opacity);
                    color: var(--_color);
                }
            `),
            [
                'button.small {',
                'height: var(--_small-size);',
                'opacity: var(--_enabled-opacity);',
                'color: var(--_color);',
                'button.small[disabled] {',
                'height: var(--_small-size);',
                'opacity: var(--_disabled-opacity);',
                'button.large {',
                'height: var(--_large-size);',
                'opacity: var(--_enabled-opacity);',
                'button.large[disabled] {',
                'height: var(--_large-size);',
                'opacity: var(--_disabled-opacity);'
            ],
            [
                'height: var(--_size);',
                'opacity: var(--_opacity);',
                '--_small-color',
                '--_large-color',
                '--_disabled-color'
            ]],
        ['@variant enclosing @state rewrites multi-state variables inside variant wrapper',
            createStyleSheet({ tables: SizeVariantTables })(SizeDef)`
                @variant(filled) {
                    @state(button) button {
                        height: var(--_size);
                    }
                }
            `,
            [
                ':host([variant="filled"]) {',
                'button.small { height: var(--_small-size); }',
                'button.medium { height: var(--_medium-size); }',
                'button.large { height: var(--_large-size); }'
            ],
            [
                'height: var(--_size);'
            ]],
        ['nested @when inside @state hoists selector and rewrites multi-state variables',
            createStyleSheet({ tables: SizeTriggers })(SizeDef)`
                @state(button) button {
                    @when(:host([checked])) {
                        height: var(--_size);
                    }
                }
            `,
            [
                ':host([checked]) {',
                'button.small { height: var(--_small-size); }',
                'button.medium { height: var(--_medium-size); }',
                'button.large { height: var(--_large-size); }'
            ],
            [
                'height: var(--_size);'
            ]],
    ]

    for (const [label, styles, mustContain, mustNotContain = []] of mapping) {
        it(label, () => {
            expect(styles).toBeInstanceOf(MDCStyleSheet)
            if (mustContain.length === 0 && mustNotContain.length === 0) {
                expect(styles.cssText).toBe('')
                return
            }
            for (const snippet of mustContain) {
                expect(styles.cssText).toContain(snippet)
            }
            for (const forbidden of mustNotContain) {
                expect(styles.cssText).not.toContain(forbidden)
            }
        })
    }
})

