/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { analyzeStylesheetSource } from '../src/core/stylesheet-analyzer'
import { formatStylesheetCodeLens } from '../src/core/codelens-formatter'
import { getContextScopedCompletions } from '../src/core/completion-engine'
import { getHoverInfoForToken } from '../src/core/hover-engine'
import { getStylesheetDiagnostics } from '../src/core/diagnostic-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC AST Analyzer (utils/styles)', () => {
    // -------------------------------------------------------------
    // Test Fixtures
    // -------------------------------------------------------------
    const sample1DDefinitionSource = `
        import { Color, Space, Shape, Typescale } from '@sandlada/mdk'
        import {
            defineSchema,
            createStyleDefinition,
            forwardTokens,
            expandShape,
            expandPadding,
            expandTypescale,
            mapStateTriggers
        } from '@sandlada/mdc/utils'
        import { IconDefinition } from './icon.definition'
        import { RippleDefinition } from './ripple.definition'

        export const ButtonSchema = defineSchema([
            'enabled', 'hovered', 'pressed', 'focused', 'disabled'
        ] as const)

        export const ButtonTriggers = mapStateTriggers({
            'enabled': '',
            'selected': '[selected]',
            'hovered': ':hover',
            'disabled': '[disabled]'
        })

        export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'container-elevation': [0, 1, 1, 0, 0],
            'label-color': [Color.OnPrimary, Color.OnPrimary, Color.OnPrimary, Color.OnPrimary, Color.OnDisabled],

            ...expandShape('container-shape')(Shape.Full),
            ...expandPadding('container-padding')({
                enabled: [Space.Space25, Space.Space50],
                hovered: [Space.Space25, Space.Space50]
            }),
            ...expandTypescale('label')(Typescale.LabelLarge),

            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
                    'size': '18px',
                },
            }),

            ...forwardTokens(RippleDefinition, {
                targetPrefix: '--mdc-ripple',
                name: 'ripple',
                tokens: {
                    'hovered-color': Color.OnPrimary,
                    'hovered-opacity': '0.08',
                },
            }),
        })
    `

    const sample2DDefinitionSource = `
        import { Color, Space, Shape, Typescale } from '@sandlada/mdk'
        import {
            defineSchema,
            createStyleDefinition,
            expandShape,
            expandPadding,
            expandTypescale
        } from '@sandlada/mdc/utils'

        export const BadgeSchema = defineSchema([
            ['small', 'large']
        ] as const)

        export const BadgeDefinition = createStyleDefinition(BadgeSchema)({
            ...expandShape('container-shape')(Shape.Full),
            'container-color': Color.Error,
            'container-size': ['6px', '16px'],
            ...expandPadding('container-padding')({
                small: [Space.Space25, Space.Space25],
                large: [Space.Space0, Space.Space50],
            }),
            'label-color': Color.OnError,
            ...expandTypescale('label')(Typescale.LabelSmall),
        })
    `

    const sampleOrthogonal2DDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { defineSchema, createStyleDefinition } from '@sandlada/mdc/utils'

        export const ChipSchema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'medium', 'large']
        ] as const)

        export const ChipDefinition = createStyleDefinition(ChipSchema)({
            'container-color': ['#6750a4', '#e8def8', '#f5f5f5', '#6750a4', '#e8def8', '#f5f5f5'],
            'container-height': '32px'
        })
    `

    const samplePipedStylesheetSource = `
        import { css } from 'lit'
        import {
            pipe,
            stringifyTokens,
            mapStateTriggers,
            createStyleSheet
        } from '@sandlada/mdc/utils'
        import { ButtonDefinition } from './button.definition'

        const tokens = stringifyTokens('--mdc-button')(ButtonDefinition)

        const compileButtonStyles = pipe(
            mapStateTriggers({
                'hovered': ':hover',
                'pressed': ':active',
                'disabled': '[disabled]'
            }),
            createStyleSheet
        )

        const stylePart = compileButtonStyles(ButtonDefinition)(() => css\`
            :host {
                display: inline-flex;
            }

            @anchor .container {
                height: var(--_container-height);
                background-color: var(--_container-color);
                border-start-start-radius: var(--_container-shape-start-start);
                padding-block-start: var(--_container-padding-block-start);

                @when selected {
                    background-color: var(--_selected-container-color);
                }

                .label {
                    color: var(--_label-color);
                    font-family: var(--_label-font);
                    font-size: var(--_label-size);
                }

                mdc-icon {
                    --mdc-icon-enabled-color: var(--_icon-color);
                    --mdc-icon-enabled-size: var(--_icon-size);
                }

                mdc-ripple {
                    --mdc-ripple-hovered-color: var(--_hovered-state-layer-color);
                    --mdc-ripple-hovered-opacity: var(--_hovered-state-layer-opacity);
                }
            }
        \`)

        export const ButtonStyles = [
            css\`:host { \${tokens} }\`,
            stylePart,
        ]
    `

    // -------------------------------------------------------------
    // Suite 1: defineSchema AST Parsing
    // -------------------------------------------------------------
    describe('defineSchema AST Parsing', () => {
        it('parses 1D single-dimension schemas with state names and combinations', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.schemas.has('ButtonSchema')).toBe(true)

            const schema = meta!.schemas.get('ButtonSchema')!
            expect(schema.name).toBe('ButtonSchema')
            expect(schema.is2D).toBe(false)
            expect(schema.dimensions).toEqual([['enabled', 'hovered', 'pressed', 'focused', 'disabled']])
            expect(schema.flatStates).toEqual(['enabled', 'hovered', 'pressed', 'focused', 'disabled'])
            expect(schema.combinationCount).toBe(5)
            expect(schema.validCombinations.length).toBe(5)
        })

        it('parses 2D single-group dimension schemas (e.g. Badge)', () => {
            const meta = analyzeDefinitionSource(sample2DDefinitionSource, 'badge.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.schemas.has('BadgeSchema')).toBe(true)

            const schema = meta!.schemas.get('BadgeSchema')!
            expect(schema.name).toBe('BadgeSchema')
            expect(schema.is2D).toBe(true)
            expect(schema.dimensions).toEqual([['small', 'large']])
            expect(schema.flatStates).toEqual(['small', 'large'])
            expect(schema.combinationCount).toBe(2)
        })

        it('parses 2D multi-orthogonal dimension schemas and computes Cartesian product', () => {
            const meta = analyzeDefinitionSource(sampleOrthogonal2DDefinitionSource, 'chip.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.schemas.has('ChipSchema')).toBe(true)

            const schema = meta!.schemas.get('ChipSchema')!
            expect(schema.name).toBe('ChipSchema')
            expect(schema.is2D).toBe(true)
            expect(schema.dimensions.length).toBe(2)
            expect(schema.dimensions[0]).toEqual(['selected', 'unselected'])
            expect(schema.dimensions[1]).toEqual(['small', 'medium', 'large'])
            expect(schema.flatStates).toEqual(['selected', 'unselected', 'small', 'medium', 'large'])
            expect(schema.combinationCount).toBe(6)
            expect(schema.validCombinations).toContainEqual(['selected', 'small'])
            expect(schema.validCombinations).toContainEqual(['unselected', 'large'])
        })
    })

    // -------------------------------------------------------------
    // Suite 2: Curried createStyleDefinition & Token Parsing
    // -------------------------------------------------------------
    describe('Curried createStyleDefinition AST Parsing', () => {
        it('binds definition to schema and accurately parses ownTokens tuples and statics', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta).not.toBeNull()
            expect(meta!.name).toBe('ButtonDefinition')
            expect(meta!.schemaName).toBe('ButtonSchema')

            expect(meta!.ownTokens.has('container-color')).toBe(true)
            const containerColor = meta!.ownTokens.get('container-color')!
            expect(containerColor.isTuple).toBe(true)
            expect(containerColor.stateNames).toEqual(['enabled', 'hovered', 'pressed', 'focused', 'disabled'])
            expect(containerColor.states).toContain('enabled')
            expect(containerColor.stateMap?.['enabled']).toBeDefined()
            expect(containerColor.states).toContain('disabled')
            expect(containerColor.stateMap?.['disabled']).toBeDefined()

            expect(meta!.ownTokens.has('container-height')).toBe(true)
            const containerHeight = meta!.ownTokens.get('container-height')!
            expect(containerHeight.isTuple).toBe(false)
            expect(containerHeight.rawValue).toContain('40px')
        })

        it('parses expandShape into 4 corner token keys', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta!.ownTokens.has('container-shape-start-start')).toBe(true)
            expect(meta!.ownTokens.has('container-shape-start-end')).toBe(true)
            expect(meta!.ownTokens.has('container-shape-end-start')).toBe(true)
            expect(meta!.ownTokens.has('container-shape-end-end')).toBe(true)

            const cornerMeta = meta!.ownTokens.get('container-shape-start-start')!
            expect(cornerMeta.isExpanded).toBe(true)
            expect(cornerMeta.expanderType).toBe('shape')
        })

        it('parses expandPadding into 4 directional token keys with state record mapping', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta!.ownTokens.has('container-padding-block-start')).toBe(true)
            expect(meta!.ownTokens.has('container-padding-block-end')).toBe(true)
            expect(meta!.ownTokens.has('container-padding-inline-start')).toBe(true)
            expect(meta!.ownTokens.has('container-padding-inline-end')).toBe(true)

            const padMeta = meta!.ownTokens.get('container-padding-block-start')!
            expect(padMeta.isExpanded).toBe(true)
            expect(padMeta.expanderType).toBe('padding')
        })

        it('parses expandTypescale into 5 typography token keys', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta!.ownTokens.has('label-font')).toBe(true)
            expect(meta!.ownTokens.has('label-size')).toBe(true)
            expect(meta!.ownTokens.has('label-leading')).toBe(true)
            expect(meta!.ownTokens.has('label-weight')).toBe(true)
            expect(meta!.ownTokens.has('label-tracking')).toBe(true)

            const fontMeta = meta!.ownTokens.get('label-font')!
            expect(fontMeta.isExpanded).toBe(true)
            expect(fontMeta.expanderType).toBe('typescale')
        })
    })

    // -------------------------------------------------------------
    // Suite 3: forwardTokens AST Parsing
    // -------------------------------------------------------------
    describe('forwardTokens AST Parsing', () => {
        it('extracts forwarded child definitions, namespaces, and token bridges', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta!.forwarded.has('IconDefinition')).toBe(true)

            const iconFwd = meta!.forwarded.get('IconDefinition')!
            expect(iconFwd.targetDefinitionName).toBe('IconDefinition')
            expect(iconFwd.targetPrefix).toBe('--mdc-icon')
            expect(iconFwd.namespace).toBe('icon')
            expect(iconFwd.tokens['color']).toBeDefined()
            expect(iconFwd.tokens['size']).toBeDefined()

            expect(meta!.forwarded.has('RippleDefinition')).toBe(true)
            const rippleFwd = meta!.forwarded.get('RippleDefinition')!
            expect(rippleFwd.targetPrefix).toBe('--mdc-ripple')
            expect(rippleFwd.namespace).toBe('ripple')
        })
    })

    // -------------------------------------------------------------
    // Suite 4: mapStateTriggers AST Parsing
    // -------------------------------------------------------------
    describe('mapStateTriggers AST Parsing', () => {
        it('extracts custom triggers and resolves default heuristics', () => {
            const meta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')
            expect(meta!.stateTriggers.size).toBeGreaterThan(0)

            const selectedTrigger = meta!.stateTriggers.get('selected')
            expect(selectedTrigger).toBeDefined()
            expect(selectedTrigger!.target).toBe('host')
            expect(selectedTrigger!.selector).toBe('[selected]')

            const hoverTrigger = meta!.stateTriggers.get('hovered')
            expect(hoverTrigger).toBeDefined()
            expect(hoverTrigger!.target).toBe('self')
            expect(hoverTrigger!.selector).toBe(':hover')

            const disabledTrigger = meta!.stateTriggers.get('disabled')
            expect(disabledTrigger).toBeDefined()
            expect(disabledTrigger!.target).toBe('host')
            expect(disabledTrigger!.selector).toBe('[disabled]')
        })
    })

    // -------------------------------------------------------------
    // Suite 5: Modern Stylesheet Analysis & Pipeline Compositions
    // -------------------------------------------------------------
    describe('Modern Stylesheet Analysis (pipe & utils/styles)', () => {
        it('analyzes piped stylesheets and extracts used private tokens, child bridge tokens, and unused tokens', () => {
            const defMeta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const analyses = analyzeStylesheetSource(samplePipedStylesheetSource, metaMap, 'button.style.ts')
            expect(analyses.length).toBe(1)

            const analysis = analyses[0]
            expect(analysis.styleVarName).toBe('ButtonStyles')
            expect(analysis.definitionName).toBe('ButtonDefinition')

            const privateTokens = analysis.usedPrivateTokens.map((t) => t.token)
            expect(privateTokens).toContain('--_container-height')
            expect(privateTokens).toContain('--_container-color')
            expect(privateTokens).toContain('--_container-shape-start-start')
            expect(privateTokens).toContain('--_container-padding-block-start')
            expect(privateTokens).toContain('--_label-color')
            expect(privateTokens).toContain('--_label-font')
            expect(privateTokens).toContain('--_label-size')

            expect(analysis.usedTokens.has('container-height')).toBe(true)
            expect(analysis.usedTokens.has('container-color')).toBe(true)
            expect(analysis.usedTokens.has('container-shape-start-start')).toBe(true)

            const childTokens = analysis.usedChildBridgeTokens.map((t) => t.token)
            expect(childTokens).toContain('--mdc-icon-enabled-color')
            expect(childTokens).toContain('--mdc-icon-enabled-size')
            expect(childTokens).toContain('--mdc-ripple-hovered-color')
            expect(childTokens).toContain('--mdc-ripple-hovered-opacity')

            expect(analysis.unusedTokens).toContain('var(--_container-elevation)')

            expect(analysis.atRules).toBeDefined()
            const anchorRule = analysis.atRules!.find((r) => r.name === '@anchor')
            expect(anchorRule).toBeDefined()
            expect(anchorRule!.argument).toBe('.container')

            const whenRule = analysis.atRules!.find((r) => r.name === '@when')
            expect(whenRule).toBeDefined()
            expect(whenRule!.argument).toBe('selected')
        })

        it('correctly extracts @slotted ATRules with argument without confusing with @slot', () => {
            const slottedCss = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const SlottedStyles = createStyleSheet(ButtonDefinition)\`
                    @slotted(svg) {
                        fill: var(--_label-color);
                    }
                    @slot icon {
                        display: inline-flex;
                    }
                \`
            `
            const defMeta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const analyses = analyzeStylesheetSource(slottedCss, metaMap, 'button.style.ts')
            const atRules = analyses[0].atRules!

            const slottedRule = atRules.find((r) => r.type === 'slotted')
            expect(slottedRule).toBeDefined()
            expect(slottedRule!.name).toBe('@slotted')
            expect(slottedRule!.argument).toBe('svg')

            const slotRule = atRules.find((r) => r.type === 'slot')
            expect(slotRule).toBeDefined()
            expect(slotRule!.name).toBe('@slot')
            expect(slotRule!.argument).toBe('icon')
        })
    })

    // -------------------------------------------------------------
    // Suite 6: Token Usage Diagnostics (MDC001, MDC002, MDC003, MDC004)
    // -------------------------------------------------------------
    describe('Token Usage Diagnostics Engine', () => {
        it('flags MDC001 for handcrafted fallbacks', () => {
            const defMeta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const invalidFallbackCss = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = createStyleSheet(ButtonDefinition)\`
                    @anchor .container {
                        background-color: var(--_container-color, #ffffff);
                    }
                \`
            `

            const analyses = analyzeStylesheetSource(invalidFallbackCss, metaMap, 'button.style.ts')
            const diagnostics = getStylesheetDiagnostics(analyses[0], defMeta)
            const mdc001 = diagnostics.filter((d) => d.code === 'MDC001')

            expect(mdc001.length).toBe(1)
            expect(mdc001[0].severity).toBe('warning')
            expect(mdc001[0].message).toContain('Handcrafted fallback "#ffffff"')
            expect(mdc001[0].quickFix?.replacement).toBe('var(--_container-color)')
        })

        it('flags MDC002 for ghost / undeclared private tokens', () => {
            const defMeta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const ghostCss = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = createStyleSheet(ButtonDefinition)\`
                    @anchor .container {
                        border-width: var(--_ghost-border-width);
                    }
                \`
            `

            const analyses = analyzeStylesheetSource(ghostCss, metaMap, 'button.style.ts')
            const diagnostics = getStylesheetDiagnostics(analyses[0], defMeta)
            const mdc002 = diagnostics.filter((d) => d.code === 'MDC002')

            expect(mdc002.length).toBe(1)
            expect(mdc002[0].severity).toBe('error')
            expect(mdc002[0].message).toContain('Unknown token "--_ghost-border-width" is not declared in ButtonDefinition')
        })

        it('flags MDC003 for invalid child state assignment', () => {
            const defMeta = analyzeDefinitionSource(sample1DDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const invalidChildCss = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = createStyleSheet(ButtonDefinition)\`
                    @anchor .container {
                        mdc-icon {
                            --mdc-icon-hovered-size: var(--_icon-size);
                        }
                    }
                \`
            `

            const analyses = analyzeStylesheetSource(invalidChildCss, metaMap, 'button.style.ts')
            const diagnostics = getStylesheetDiagnostics(analyses[0], defMeta)
            const mdc003 = diagnostics.filter((d) => d.code === 'MDC003')

            expect(mdc003.length).toBe(1)
            expect(mdc003[0].severity).toBe('warning')
            expect(mdc003[0].quickFix?.replacement).toBe('--mdc-icon-size')
        })
    })

    // -------------------------------------------------------------
    // Suite 7: Boundary & Corner Cases
    // -------------------------------------------------------------
    describe('Boundary & Corner Cases', () => {
        it('handles null, undefined, and void 0 slots in state tuples', () => {
            const source = `
                export const SparseDefinition = createStyleDefinition({
                    'sparse-color': ['#ff0000', null, '#0000ff', undefined, void 0],
                    'single-state': ['#123456'],
                })
            `
            const meta = analyzeDefinitionSource(source, 'sparse.definition.ts')!
            expect(meta).not.toBeNull()

            const sparse = meta.ownTokens.get('sparse-color')!
            expect(sparse.isTuple).toBe(true)
            expect(sparse.states).toEqual(['enabled', 'pressed'])

            const single = meta.ownTokens.get('single-state')!
            expect(single.isTuple).toBe(true)
            expect(single.states).toEqual(['enabled'])
        })

        it('handles multi-line formatting, trailing commas, and escaped quotes in definition values', () => {
            const source = `
                export const ComplexFormatDefinition = createStyleDefinition({
                    "quoted-key": [
                        "line 1",
                        "line 2",
                        "line 3",
                        "line 4",
                        "line 5",
                    ],
                    'escaped-string': 'calc(100% - 24px)',
                })
            `
            const meta = analyzeDefinitionSource(source, 'complex.definition.ts')!
            expect(meta.ownTokens.has('quoted-key')).toBe(true)
            expect(meta.ownTokens.has('escaped-string')).toBe(true)
            expect(meta.ownTokens.get('quoted-key')!.states?.length).toBe(5)
        })

        it('handles empty definition or definition without tokens gracefully', () => {
            const source = `
                export const EmptyDefinition = createStyleDefinition({})
            `
            const meta = analyzeDefinitionSource(source, 'empty.definition.ts')!
            expect(meta).not.toBeNull()
            expect(meta.name).toBe('EmptyDefinition')
            expect(meta.ownTokens.size).toBe(0)
            expect(meta.forwarded.size).toBe(0)
        })

        it('handles non-definition files and returns null', () => {
            const source = `
                export const SomeHelper = () => 'not a definition'
            `
            const meta = analyzeDefinitionSource(source, 'helper.ts')
            expect(meta).toBeNull()
        })

        it('handles 100% token coverage (0 unused tokens) in stylesheet analysis', () => {
            const defSource = `
                export const MiniDefinition = createStyleDefinition({
                    'color': '#fff',
                    'bg': '#000',
                })
            `
            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { MiniDefinition } from './mini.definition'

                export const MiniStyles = createStyleSheet(MiniDefinition, () => css\`
                    .item {
                        color: var(--_color);
                        background: var(--_bg);
                    }
                \`)
            `
            const defMeta = analyzeDefinitionSource(defSource, 'mini.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const analysis = analyzeStylesheetSource(styleSource, metaMap, 'mini.style.ts')[0]

            expect(analysis.unusedTokens.length).toBe(0)
            expect(analysis.coveragePercent).toBe(100)
        })
    })

    // -------------------------------------------------------------
    // Suite 8: Cross-Feature Interactions & Real-World Workloads
    // -------------------------------------------------------------
    describe('Cross-Feature Interactions & Real-World Workloads', () => {
        it('integrates AST analysis with CodeLens, Hover, and Auto-Completion engines', () => {
            const defSource = `
                import { Color } from '@sandlada/mdk'
                import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
                import { IconDefinition } from './icon.definition'

                export const NavTabDefinition = createStyleDefinition({
                    'item-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
                    'item-size': '32px',
                    ...forwardTokens(IconDefinition, {
                        targetPrefix: '--mdc-icon',
                        tokens: { 'icon-size': '20px' }
                    })
                })
            `
            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { NavTabDefinition } from './nav-tab.definition'

                export const NavTabStyles = createStyleSheet(NavTabDefinition, () => css\`
                    .tab {
                        color: var(--_item-color);
                        height: var(--_item-size);
                        --mdc-icon-size: var(--_icon-size);
                    }
                \`)
            `

            const defMeta = analyzeDefinitionSource(defSource, 'nav-tab.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const analysis = analyzeStylesheetSource(styleSource, metaMap, 'nav-tab.style.ts')[0]

            const lenses = formatStylesheetCodeLens(analysis, 5)
            expect(lenses.length).toBeGreaterThanOrEqual(3)
            expect(lenses.some((l) => l.title.includes('NavTabDefinition'))).toBe(true)

            const hover = getHoverInfoForToken(defMeta, '--_item-color')
            expect(hover).toContain('NavTabDefinition')
            expect(hover).toContain('5-State Tuple')

            const completions = getContextScopedCompletions(defMeta, 'var(--_')
            expect(completions.some((c) => c.label === '--_item-color')).toBe(true)
            expect(completions.some((c) => c.label === '--_item-size')).toBe(true)
        })

        it('tracks multiple createStyleSheet definitions and combined token usages', () => {
            const defA = analyzeDefinitionSource(`
                export const DefA = createStyleDefinition({ 'color-a': 'red' })
            `, 'a.definition.ts')!

            const defB = analyzeDefinitionSource(`
                export const DefB = createStyleDefinition({ 'color-b': 'blue' })
            `, 'b.definition.ts')!

            const metaMap = new Map([
                [defA.name, defA],
                [defB.name, defB],
            ])

            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { DefA, DefB } from './definitions'

                export const CompoundStyles = [
                    createStyleSheet([DefA, DefB], () => css\`
                        .el {
                            color: var(--_color-a);
                            background: var(--_color-b);
                        }
                    \`),
                ]
            `

            const analyses = analyzeStylesheetSource(styleSource, metaMap, 'compound.style.ts')
            expect(analyses.length).toBe(1)
            expect(analyses[0].definitionNames).toEqual(['DefA', 'DefB'])
            expect(analyses[0].usedPrivateTokens.map((t) => t.token)).toEqual(['--_color-a', '--_color-b'])
            expect(analyses[0].unusedTokens.length).toBe(0)
        })

        it('analyzes real-world Badge component definition and stylesheet', () => {
            const badgeDef = `
                import { Shape, Typescale, Space } from '@sandlada/mdk'
                import { defineSchema, createStyleDefinition, Color } from '@sandlada/mdc/utils'

                export const BadgeDefinition = createStyleDefinition({
                    'container-color': Color.Error,
                    'container-size': ['6px', '16px'],
                    'label-color': Color.OnError,
                })
            `

            const badgeStyle = `
                import { css } from 'lit'
                import { BadgeDefinition } from '../../definitions'
                import { pipe, stringifyTokens, mapStateTriggers, createStyleSheet } from '../../utils'

                const tokens = stringifyTokens('--mdc-badge')(BadgeDefinition)

                const compileBadgeStyles = pipe(
                    mapStateTriggers({
                        'small': '.small',
                        'large': '.large',
                    }),
                    createStyleSheet
                )

                export const BadgeStyles = [
                    css\`:host { \${tokens} }\`,
                    compileBadgeStyles(BadgeDefinition)(() => css\`
                        .container {
                            height: var(--_container-size);
                            background: var(--_container-color);
                            .label {
                                color: var(--_label-color);
                            }
                        }
                    \`),
                ]
            `

            const meta = analyzeDefinitionSource(badgeDef, 'badge.definition.ts')!
            expect(meta.name).toBe('BadgeDefinition')
            expect(meta.ownTokens.has('container-color')).toBe(true)
            expect(meta.ownTokens.has('container-size')).toBe(true)
            expect(meta.ownTokens.has('label-color')).toBe(true)

            const metaMap = new Map([[meta.name, meta]])
            const analyses = analyzeStylesheetSource(badgeStyle, metaMap, 'badge.style.ts')
            expect(analyses.length).toBe(1)
            expect(analyses[0].styleVarName).toBe('BadgeStyles')
            expect(analyses[0].usedPrivateTokens.length).toBe(3)
            expect(analyses[0].unusedTokens.length).toBe(0)
            expect(analyses[0].coveragePercent).toBe(100)
        })
    })
})
