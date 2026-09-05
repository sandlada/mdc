/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import {
    analyzeDefinitionSource,
    extractSchemas,
    extractStateTriggersFromSource,
    getSourceRange,
    extractBalancedBlock
} from '../src/core/definition-analyzer'
import {
    analyzeStylesheetSource,
    normalizePrivateToken,
    extractATRules,
    extractStringifyTokenCalls,
    extractStateTriggers,
    extractOverrideTokensCalls
} from '../src/core/stylesheet-analyzer'
import { getStylesheetDiagnostics } from '../src/core/diagnostic-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('M1 Adversarial & Empirical Stress Testing Suite', () => {

    // =========================================================================
    // 1. N-Dimensional Schemas & Cartesian Combinations
    // =========================================================================
    describe('1. N-Dimensional Schemas & Combinations', () => {
        it('handles 3D orthogonal state schemas (2 x 2 x 3 = 12 combinations)', () => {
            const source = `
                import { defineSchema, createStyleDefinition } from '@sandlada/mdc/utils'

                export const Complex3DSchema = defineSchema([
                    ['primary', 'secondary'],
                    ['selected', 'unselected'],
                    ['small', 'medium', 'large']
                ] as const)

                export const Complex3DDefinition = createStyleDefinition(Complex3DSchema)({
                    'container-color': [
                        '#111', '#112', '#113', '#121', '#122', '#123',
                        '#211', '#212', '#213', '#221', '#222', '#223'
                    ],
                    'container-height': '36px'
                })
            `
            const meta = analyzeDefinitionSource(source, 'complex3d.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.schemas.has('Complex3DSchema')).toBe(true)

            const schema = meta!.schemas.get('Complex3DSchema')!
            expect(schema.is2D).toBe(true)
            expect(schema.dimensions.length).toBe(3)
            expect(schema.combinationCount).toBe(12)
            expect(schema.validCombinations.length).toBe(12)
            expect(schema.flatStates).toEqual([
                'primary', 'secondary',
                'selected', 'unselected',
                'small', 'medium', 'large'
            ])

            // Verify tuple parsing against 12 schema states
            const colorToken = meta!.ownTokens.get('container-color')!
            expect(colorToken.isTuple).toBe(true)
            expect(colorToken.rawTuple?.length).toBe(12)
            expect(colorToken.stateMap?.['primary']).toBeDefined()
            expect(colorToken.stateMap?.['secondary']).toBeDefined()
        })

        it('handles 4D high-dimensional state schemas (2 x 2 x 2 x 2 = 16 combinations)', () => {
            const source = `
                export const Schema4D = defineSchema([
                    ['a1', 'a2'],
                    ['b1', 'b2'],
                    ['c1', 'c2'],
                    ['d1', 'd2']
                ] as const)

                export const Def4D = createStyleDefinition(Schema4D)({
                    'token-4d': [
                        'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8',
                        'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16'
                    ]
                })
            `
            const schemas = extractSchemas(source)
            expect(schemas.has('Schema4D')).toBe(true)
            const s = schemas.get('Schema4D')!
            expect(s.dimensions.length).toBe(4)
            expect(s.combinationCount).toBe(16)
            expect(s.validCombinations[0]).toEqual(['a1', 'b1', 'c1', 'd1'])
            expect(s.validCombinations[15]).toEqual(['a2', 'b2', 'c2', 'd2'])

            const meta = analyzeDefinitionSource(source, 'def4d.definition.ts')!
            expect(meta).not.toBeNull()
            expect(meta.ownTokens.get('token-4d')!.isTuple).toBe(true)
        })

        it('handles inline defineSchema within createStyleDefinition', () => {
            const source = `
                export const InlineCompDefinition = createStyleDefinition(defineSchema(['idle', 'active', 'busy']))({
                    'indicator-color': ['#0f0', '#00f', '#f00'],
                    'size': '24px'
                })
            `
            const meta = analyzeDefinitionSource(source, 'inline.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.schemaName).toBe('InlineCompDefinitionSchema')
            expect(meta!.schema?.flatStates).toEqual(['idle', 'active', 'busy'])
            expect(meta!.ownTokens.get('indicator-color')!.states).toEqual(['idle', 'active', 'busy'])
        })

        it('handles schemas with unusual characters, underscores, and dashes in state names', () => {
            const source = `
                export const KebabSchema = defineSchema([
                    ['extra-small', 'super-large'],
                    ['state_alpha', 'state_beta', '$special_1']
                ] as const)
            `
            const schemas = extractSchemas(source)
            const schema = schemas.get('KebabSchema')!
            expect(schema.dimensions[0]).toEqual(['extra-small', 'super-large'])
            expect(schema.dimensions[1]).toEqual(['state_alpha', 'state_beta', '$special_1'])
            expect(schema.combinationCount).toBe(6)
        })
    })

    // =========================================================================
    // 2. Deeply Nested Expressions, Template Literals & Balanced Blocks
    // =========================================================================
    describe('2. Deeply Nested Expressions & Balanced Blocks', () => {
        it('extracts balanced block with escaped quotes and internal strings accurately', () => {
            const sample = `{
                "key1": "value with \\" escaped quote and { fake brace }",
                'key2': 'single quote with } brace',
                \`key3\`: \`template with { nested } brace\`
            }`
            const block = extractBalancedBlock(sample, 0, '{', '}')
            expect(block).not.toBeNull()
            expect(block!.content).toContain('key1')
            expect(block!.content).toContain('key2')
            expect(block!.content).toContain('key3')
        })

        it('handles multiline function calls with whitespace and formatting in definitions', () => {
            const source = `
                export const FormattedDef = createStyleDefinition(
                    ButtonSchema
                )(
                    {
                        'container-height': '40px',
                        'container-color': Color.Primary,
                        'label-color': [
                            Color.OnPrimary,
                            Color.OnPrimary,
                            Color.OnPrimary,
                            Color.OnPrimary,
                            Color.OnDisabled
                        ]
                    }
                )
            `
            const meta = analyzeDefinitionSource(source, 'formatted.definition.ts')!
            expect(meta).not.toBeNull()
            expect(meta.name).toBe('FormattedDef')
            expect(meta.ownTokens.has('container-height')).toBe(true)
            expect(meta.ownTokens.has('container-color')).toBe(true)
            expect(meta.ownTokens.has('label-color')).toBe(true)
            expect(meta.ownTokens.get('label-color')!.rawTuple?.length).toBe(5)
        })

        it('handles multi-line template literals inside stylesheets with nested interpolations', () => {
            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet, stringifyTokens } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                const tokens = stringifyTokens('--mdc-button')(ButtonDefinition)

                export const NestedStyles = [
                    css\`:host { \${tokens}; --local: \${'nested-string'}; }\`,
                    createStyleSheet(ButtonDefinition, () => css\`
                        @anchor .container {
                            height: var(--_container-height);
                            background: var(--_container-color);
                            @when hovered {
                                background: var(--_hovered-container-color);
                            }
                        }
                    \`)
                ]
            `
            const defMeta = analyzeDefinitionSource(`
                export const ButtonDefinition = createStyleDefinition({
                    'container-height': '40px',
                    'container-color': ['#fff', '#eee', '#ddd', '#ccc', '#bbb']
                })
            `, 'button.definition.ts')!

            const metaMap = new Map([[defMeta.name, defMeta]])
            const analyses = analyzeStylesheetSource(styleSource, metaMap, 'nested.style.ts')
            expect(analyses.length).toBe(1)
            expect(analyses[0].usedTokens.has('container-height')).toBe(true)
            expect(analyses[0].usedTokens.has('container-color')).toBe(true)
            expect(analyses[0].unusedTokens.length).toBe(0)
            expect(analyses[0].coveragePercent).toBe(100)
        })
    })

    // =========================================================================
    // 3. Token Expanders with Complex Expressions
    // =========================================================================
    describe('3. Token Expanders with Complex Expressions', () => {
        it('parses expandShape with explicit corner object and full corner tokens', () => {
            const source = `
                export const CustomShapeDef = createStyleDefinition({
                    ...expandShape('card-shape')({
                        'start-start': '16px',
                        'start-end': '16px',
                        'end-start': '0px',
                        'end-end': '0px'
                    }),
                    'elevation': '2'
                })
            `
            const meta = analyzeDefinitionSource(source, 'shape.definition.ts')!
            expect(meta.ownTokens.has('card-shape-start-start')).toBe(true)
            expect(meta.ownTokens.has('card-shape-start-end')).toBe(true)
            expect(meta.ownTokens.has('card-shape-end-start')).toBe(true)
            expect(meta.ownTokens.has('card-shape-end-end')).toBe(true)

            expect(meta.ownTokens.get('card-shape-start-start')!.stateMap?.['enabled']).toContain('16px')
            expect(meta.ownTokens.get('card-shape-end-start')!.stateMap?.['enabled']).toContain('0px')
        })

        it('parses expandPadding with 1-value, 2-value, and 4-value arrays', () => {
            const source = `
                export const PaddingArrayDef = createStyleDefinition({
                    ...expandPadding('single-pad')(['8px']),
                    ...expandPadding('dual-pad')(['8px', '16px']),
                    ...expandPadding('quad-pad')(['4px', '8px', '12px', '16px']),
                })
            `
            const meta = analyzeDefinitionSource(source, 'pad.definition.ts')!

            // 1-value
            expect(meta.ownTokens.get('single-pad-padding-block-start')!.stateMap?.['enabled']).toContain('8px')
            expect(meta.ownTokens.get('single-pad-padding-inline-end')!.stateMap?.['enabled']).toContain('8px')

            // 2-value: [block, inline]
            expect(meta.ownTokens.get('dual-pad-padding-block-start')!.stateMap?.['enabled']).toContain('8px')
            expect(meta.ownTokens.get('dual-pad-padding-block-end')!.stateMap?.['enabled']).toContain('8px')
            expect(meta.ownTokens.get('dual-pad-padding-inline-start')!.stateMap?.['enabled']).toContain('16px')
            expect(meta.ownTokens.get('dual-pad-padding-inline-end')!.stateMap?.['enabled']).toContain('16px')

            // 4-value: [block-start, block-end, inline-start, inline-end]
            expect(meta.ownTokens.get('quad-pad-padding-block-start')!.stateMap?.['enabled']).toContain('4px')
            expect(meta.ownTokens.get('quad-pad-padding-block-end')!.stateMap?.['enabled']).toContain('8px')
            expect(meta.ownTokens.get('quad-pad-padding-inline-start')!.stateMap?.['enabled']).toContain('12px')
            expect(meta.ownTokens.get('quad-pad-padding-inline-end')!.stateMap?.['enabled']).toContain('16px')
        })

        it('parses expandTypescale with custom prefixes and strips suffix properly', () => {
            const source = `
                export const TypeDef = createStyleDefinition({
                    ...expandTypescale('headline-typescale')(Typescale.HeadlineMedium),
                    ...expandTypescale('body-typography')(Typescale.BodyMedium),
                    ...expandTypescale('label')(Typescale.LabelSmall),
                })
            `
            const meta = analyzeDefinitionSource(source, 'type.definition.ts')!

            // headline-typescale -> headline-font, headline-size...
            expect(meta.ownTokens.has('headline-font')).toBe(true)
            expect(meta.ownTokens.has('headline-size')).toBe(true)
            expect(meta.ownTokens.has('headline-leading')).toBe(true)
            expect(meta.ownTokens.has('headline-weight')).toBe(true)
            expect(meta.ownTokens.has('headline-tracking')).toBe(true)

            // body-typography -> body-font...
            expect(meta.ownTokens.has('body-font')).toBe(true)
            expect(meta.ownTokens.has('body-size')).toBe(true)

            // label -> label-font...
            expect(meta.ownTokens.has('label-font')).toBe(true)
            expect(meta.ownTokens.has('label-tracking')).toBe(true)
        })
    })

    // =========================================================================
    // 4. Forwarded Tokens Edge Cases & Multi-Child Bridges
    // =========================================================================
    describe('4. Forwarded Tokens Edge Cases & Bridges', () => {
        it('handles forwardTokens with custom name, missing targetPrefix, and tuple states', () => {
            const source = `
                import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
                import { IconDefinition } from './icon.definition'
                import { BadgeDefinition } from './badge.definition'

                export const MasterDefinition = createStyleDefinition({
                    'host-color': '#fff',
                    ...forwardTokens(IconDefinition, {
                        targetPrefix: '--mdc-icon',
                        name: 'leading-icon',
                        tokens: {
                            'color': ['#111', '#222', '#333', '#444', '#555'],
                            'size': '20px'
                        }
                    }),
                    ...forwardTokens(BadgeDefinition, {
                        targetPrefix: 'mdc-badge',
                        name: 'badge',
                        tokens: {
                            'color': '#ff0000'
                        }
                    })
                })
            `
            const meta = analyzeDefinitionSource(source, 'master.definition.ts')!
            expect(meta.forwarded.has('IconDefinition')).toBe(true)
            expect(meta.forwarded.has('BadgeDefinition')).toBe(true)

            const iconFwd = meta.forwarded.get('IconDefinition')!
            expect(iconFwd.namespace).toBe('leading-icon')
            expect(iconFwd.targetPrefix).toBe('--mdc-icon')

            // Own tokens should contain namespaced keys
            expect(meta.ownTokens.has('leading-icon-color')).toBe(true)
            expect(meta.ownTokens.has('leading-icon-size')).toBe(true)
            expect(meta.ownTokens.has('badge-color')).toBe(true)

            const badgeFwd = meta.forwarded.get('BadgeDefinition')!
            expect(badgeFwd.targetPrefix).toBe('--mdc-badge')
        })

        it('handles forwardTokens with empty tokens object', () => {
            const source = `
                export const EmptyFwdDef = createStyleDefinition({
                    ...forwardTokens(IconDefinition, {
                        targetPrefix: '--mdc-icon',
                        tokens: {}
                    })
                })
            `
            const meta = analyzeDefinitionSource(source, 'emptyfwd.definition.ts')!
            expect(meta).not.toBeNull()
            expect(meta.forwarded.has('IconDefinition')).toBe(true)
            expect(Object.keys(meta.forwarded.get('IconDefinition')!.tokens).length).toBe(0)
        })
    })

    // =========================================================================
    // 5. Complex Stylesheets, ATRules (@layer, @container, @keyframes), and Selectors
    // =========================================================================
    describe('5. Complex Stylesheets & ATRules', () => {
        it('parses @layer, @container, @keyframes, @supports, and @media ATRules', () => {
            const cssText = `
                @layer mdc.base, mdc.components;
                @layer mdc.components {
                    @anchor .container {
                        height: var(--_container-height);
                    }
                }
                @container card (min-width: 400px) {
                    .container {
                        padding: var(--_container-padding-inline-start);
                    }
                }
                @keyframes ripple-pulse {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @supports (backdrop-filter: blur(10px)) {
                    .glass { backdrop-filter: blur(10px); }
                }
                @media (prefers-reduced-motion: reduce) {
                    * { transition: none !important; }
                }
            `
            const atRules = extractATRules(cssText, 0, cssText)
            const types = atRules.map((r) => r.type)

            expect(types).toContain('layer')
            expect(types).toContain('anchor')
            expect(types).toContain('container')
            expect(types).toContain('keyframes')
            expect(types).toContain('supports')
            expect(types).toContain('media')

            const layerRule = atRules.find((r) => r.type === 'layer')!
            expect(layerRule.argument).toContain('mdc.base')

            const containerRule = atRules.find((r) => r.type === 'container')!
            expect(containerRule.argument).toContain('min-width: 400px')

            const kfRule = atRules.find((r) => r.type === 'keyframes')!
            expect(kfRule.argument).toContain('ripple-pulse')
        })

        it('parses mapStateTriggers with standard modifier expressions', () => {
            const source = `
                import { mapStateTriggers } from '@sandlada/mdc/utils'

                export const ComplexTriggers = mapStateTriggers({
                    'enabled': '',
                    'hovered': ':hover',
                    'focused': ':focus-visible',
                    'selected': '[selected]',
                    'disabled': '[disabled]',
                    'small': '.is-small',
                    'compact': '[density="compact"]'
                })
            `
            const triggers = extractStateTriggersFromSource(source)
            expect(triggers.has('hovered')).toBe(true)
            expect(triggers.get('hovered')!.selector).toBe(':hover')
            expect(triggers.get('hovered')!.target).toBe('self')

            expect(triggers.has('selected')).toBe(true)
            expect(triggers.get('selected')!.selector).toBe('[selected]')
            expect(triggers.get('selected')!.target).toBe('host')

            expect(triggers.has('small')).toBe(true)
            expect(triggers.get('small')!.target).toBe('self')

            expect(triggers.has('compact')).toBe(true)
            expect(triggers.get('compact')!.target).toBe('host')
        })

        it('resolves single-dimension state prefixes but treats double prefixes as unknown', () => {
            const defSource = `
                import { defineSchema, createStyleDefinition } from '@sandlada/mdc/utils'

                export const ChipSchema = defineSchema([
                    ['selected', 'unselected'],
                    ['small', 'medium', 'large']
                ] as const)

                export const ChipDefinition = createStyleDefinition(ChipSchema)({
                    'container-color': ['#1', '#2', '#3', '#4', '#5', '#6'],
                    'label-size': ['10px', '12px', '14px', '10px', '12px', '14px']
                })
            `
            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ChipDefinition } from './chip.definition'

                export const ChipStyles = createStyleSheet(ChipDefinition, () => css\`
                    .chip {
                        background: var(--_selected-container-color);
                        font-size: var(--_large-label-size);
                        border-color: var(--_selected-small-container-color);
                    }
                \`)
            `
            const defMeta = analyzeDefinitionSource(defSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const analysis = analyzeStylesheetSource(styleSource, metaMap, 'chip.style.ts')[0]

            // Single state prefixes resolve (the compiler only ever emits one prefix)
            expect(analysis.usedTokens.has('container-color')).toBe(true)
            expect(analysis.usedTokens.has('label-size')).toBe(true)
            // Double prefixes are never emitted: the raw key is preserved verbatim
            // instead of being folded into a real token (ghost, flagged by MDC002)
            expect(analysis.usedTokens.has('selected-small-container-color')).toBe(true)
            const ghost = analysis.usedPrivateTokens.find((t) => t.cleanKey === 'selected-small-container-color')
            expect(ghost).toBeDefined()
            expect(ghost!.isTuple).toBe(false)
        })

        it('normalizes single-dimension state prefixed tokens (e.g. --_hovered-container-color)', () => {
            const ownTokens = new Map([
                ['container-color', { isTuple: true, states: ['enabled', 'hovered', 'pressed'] }]
            ])
            const res = normalizePrivateToken('hovered-container-color', ownTokens, ['enabled', 'hovered', 'pressed'])
            expect(res.cleanKey).toBe('container-color')
            expect(res.matchedState).toBe('hovered')
            expect(res.isTuple).toBe(true)
        })

        it('handles complex overrideTokens calls with nested selectors and property mappings', () => {
            const styleSource = `
                import { overrideTokens } from '@sandlada/mdc/utils'

                const overrideIcon = overrideTokens({
                    prefix: '--mdc-icon',
                    selector: 'mdc-icon.custom'
                })({
                    'color': 'var(--_icon-color)',
                    'size': '24px'
                })
            `
            const overrides = extractOverrideTokensCalls(styleSource)
            expect(overrides.length).toBe(1)
            expect(overrides[0].prefix).toBe('--mdc-icon')
            expect(overrides[0].selector).toBe('mdc-icon.custom')
            expect(overrides[0].props?.['color']).toContain('var(--_icon-color)')
            expect(overrides[0].props?.['size']).toContain('24px')
        })
    })

    // =========================================================================
    // 6. Diagnostics Engine Adversarial Edge Cases
    // =========================================================================
    describe('6. Diagnostics Engine Edge Cases', () => {
        it('flags multiple diagnostic violations in the same complex stylesheet', () => {
            const defSource = `
                export const FormDef = createStyleDefinition({
                    'field-height': '48px',
                    'field-color': ['#fff', '#eee', '#ddd', '#ccc', '#bbb']
                })
            `
            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { FormDef } from './form.definition'

                export const FormStyles = createStyleSheet(FormDef, () => css\`
                    .input {
                        /* Fallback violation 1 */
                        height: var(--_field-height, 48px);
                        /* Fallback violation 2 */
                        background: var(--_field-color, #ffffff);
                        /* Ghost token violation */
                        border: var(--_ghost-border-width);
                    }
                \`)
            `
            const defMeta = analyzeDefinitionSource(defSource, 'form.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const analysis = analyzeStylesheetSource(styleSource, metaMap, 'form.style.ts')[0]
            const diagnostics = getStylesheetDiagnostics(analysis, defMeta)

            const mdc001 = diagnostics.filter((d) => d.code === 'MDC001')
            const mdc002 = diagnostics.filter((d) => d.code === 'MDC002')

            expect(mdc001.length).toBe(2)
            expect(mdc002.length).toBe(1)
            expect(mdc002[0].token).toBe('--_ghost-border-width')
        })
    })

    // =========================================================================
    // 7. Empirical Bug Reproductions (Documented Engine Vulnerabilities)
    // =========================================================================
    describe('7. Empirical Bug Reproductions', () => {
        it('Bug A: extracts dimensions correctly when no comments, but demonstrates flattening under leading comments', () => {
            // Uncommented 2D schema: works correctly
            const cleanSource = `
                export const Clean2DSchema = defineSchema([
                    ['comfortable', 'compact'],
                    ['selected', 'unselected']
                ] as const)
            `
            const cleanSchemas = extractSchemas(cleanSource)
            expect(cleanSchemas.get('Clean2DSchema')!.dimensions.length).toBe(2)

            // Commented 2D schema: demonstrates fix where leading comments do not prevent 2D schema parsing
            const commentedSource = `
                export const Commented2DSchema = defineSchema([
                    // Leading comment before first dimension
                    ['comfortable', 'compact'],
                    ['selected', 'unselected']
                ] as const)
            `
            const commentedSchemas = extractSchemas(commentedSource)
            expect(commentedSchemas.get('Commented2DSchema')!.dimensions.length).toBe(2)
            expect(commentedSchemas.get('Commented2DSchema')!.validCombinations.length).toBe(4)
        })

        it('Bug B: demonstrates comma-safe token value extraction in non-array/non-object expressions', () => {
            const source = `
                export const TruncDef = createStyleDefinition({
                    'clamp-size': 'clamp(10px, 5vw, 30px)',
                    'color-alpha': Color.alpha(Color.Primary, 0.38),
                    'font-family': 'Roboto, sans-serif'
                })
            `
            const meta = analyzeDefinitionSource(source, 'trunc.definition.ts')!
            expect(meta).not.toBeNull()

            expect(meta.ownTokens.get('clamp-size')!.rawValue).toBe("'clamp(10px, 5vw, 30px)'")
            expect(meta.ownTokens.get('color-alpha')!.rawValue).toBe('Color.alpha(Color.Primary, 0.38)')
            expect(meta.ownTokens.get('font-family')!.rawValue).toBe("'Roboto, sans-serif'")
        })

        it('Bug C: demonstrates correct quote matching for nested attribute selectors in mapStateTriggers', () => {
            const source = `
                import { mapStateTriggers } from '@sandlada/mdc/utils'

                export const TriggersWithQuotes = mapStateTriggers({
                    'error': ':host([aria-invalid="true"])',
                    'active': '[data-state="active"]'
                })
            `
            const triggers = extractStateTriggersFromSource(source)
            expect(triggers.get('error')!.selector).toBe(':host([aria-invalid="true"])')
            expect(triggers.get('active')!.selector).toBe('[data-state="active"]')
        })

        it('Bug D: handles commas inside quotes and multi-line values in mapStateTriggers', () => {
            const source = `
                import { mapStateTriggers } from '@sandlada/mdc/utils'

                export const MultiSelectorTriggers = mapStateTriggers({
                    'selected': ':host([selected]), :host([checked])', // trailing comment
                    'hovered':
                        ':hover, :focus-visible',
                    'active': '[data-state="active,running"]'
                })
            `
            const defTriggers = extractStateTriggersFromSource(source)
            expect(defTriggers.get('selected')!.selector).toBe(':host([selected]), :host([checked])')
            expect(defTriggers.get('selected')!.target).toBe('host')
            expect(defTriggers.get('hovered')!.selector).toBe(':hover, :focus-visible')
            expect(defTriggers.get('active')!.selector).toBe('[data-state="active,running"]')

            const sheetTriggers = extractStateTriggers(source)
            const selTrigger = sheetTriggers.find((t) => t.state === 'selected')!
            expect(selTrigger).toBeDefined()
            expect(selTrigger.selector).toBe(':host([selected]), :host([checked])')
            expect(selTrigger.target).toBe('host')
        })
    })
})
