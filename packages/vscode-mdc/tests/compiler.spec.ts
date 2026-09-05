/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import {
    compileExportedStylesToCss,
    compileExportedStylesToCssSync,
    formatCss,
    countCssRules,
} from '../src/core/compiler-engine'
import type { DefinitionMeta } from '../src/core/types'
import path from 'path'

describe('MDC Stylesheet Compiler Engine (Tiers 1-4)', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'label-color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
        })
    `

    // -------------------------------------------------------------------------
    // Tier 1: Feature Coverage (Features 7, 8, 9)
    // -------------------------------------------------------------------------
    describe('Tier 1: Feature Coverage', () => {
        it('F7: compiles full exported stylesheet array with host tokens and state expansion via static AST', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const sampleStyleSource = `
                import { css, unsafeCSS } from 'lit'
                import { ButtonDefinition } from './button.definition'
                import { createStyleSheet, defineTokenRefsRecord } from '@sandlada/mdc/utils'

                const tokenRecord = defineTokenRefsRecord(ButtonDefinition, { prefix: '--md-button' })

                const stylePart = createStyleSheet([ButtonDefinition], () => css\`
                    :host {
                        box-sizing: border-box;
                        display: inline-flex;
                    }

                    @anchor .container {
                        height: var(--_container-height);
                        background-color: var(--_container-color);

                        .label {
                            color: var(--_label-color);
                        }
                    }
                \`)

                export const ButtonStyles = [
                    css\`:host { \${unsafeCSS(tokens)}; }\`,
                    stylePart,
                ]
            `

            const result = compileExportedStylesToCssSync(sampleStyleSource, metaMap, 'button.style.ts')

            expect(result.exportName).toBe('ButtonStyles')
            expect(result.definitionNames).toContain('ButtonDefinition')
            expect(result.totalRules).toBeGreaterThan(0)

            // Header & Metadata
            expect(result.compiledCss).toContain('MDC Compiled Stylesheet Preview (Live)')
            expect(result.compiledCss).toContain('Export: ButtonStyles')

            // Layer 2 Base Rules
            expect(result.compiledCss).toContain('[Layer 2] Base / Enabled State Rules')
            expect(result.compiledCss).toContain(':host {')
            expect(result.compiledCss).toContain('.container {')
            expect(result.compiledCss).toContain('height: var(--_container-height);')
            expect(result.compiledCss).toContain('background-color: var(--_enabled-container-color);')
            expect(result.compiledCss).toContain('.container .label {')
            expect(result.compiledCss).toContain('color: var(--_enabled-label-color);')

            // Layer 2.1-2.4 Deltas
            expect(result.compiledCss).toContain('[Layer 2.1] Hovered State Deltas (:hover)')
            expect(result.compiledCss).toContain('.container:hover {')
            expect(result.compiledCss).toContain('background-color: var(--_hovered-container-color);')
            expect(result.compiledCss).toContain('.container:hover .label {')
            expect(result.compiledCss).toContain('color: var(--_hovered-label-color);')

            expect(result.compiledCss).toContain('.container:focus-visible {')
            expect(result.compiledCss).toContain('background-color: var(--_focused-container-color);')

            expect(result.compiledCss).toContain('.container:active {')
            expect(result.compiledCss).toContain('background-color: var(--_pressed-container-color);')

            expect(result.compiledCss).toContain(':host([disabled]) .container {')
            expect(result.compiledCss).toContain('background-color: var(--_disabled-container-color);')
        })

        it('F7: compiles standalone createStyleSheet with @when and @media rules', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const sampleStyleSource = `
                import { css } from 'lit'
                import { ButtonDefinition } from './button.definition'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    @anchor .container {
                        background-color: var(--_container-color);

                        @when(.selected) {
                            background-color: var(--_container-color);
                        }
                    }

                    @media (forced-colors: active) {
                        .container {
                            forced-color-adjust: none;
                            background-color: Highlight;
                        }
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(sampleStyleSource, metaMap, 'button.style.ts')

            expect(result.compiledCss).toContain('.container.selected {')
            expect(result.compiledCss).toContain('background-color: var(--_enabled-container-color);')
            expect(result.compiledCss).toContain('.container.selected:hover {')
            expect(result.compiledCss).toContain('background-color: var(--_hovered-container-color);')
            expect(result.compiledCss).toContain('@media (forced-colors: active) {')
            expect(result.compiledCss).toContain('forced-color-adjust: none;')
            expect(result.compiledCss).toContain('background-color: Highlight;')
        })

        it('F8: dynamically compiles styles via Node VM with 100% genuine CSSResult output', async () => {
            const dynamicSource = `
                import { css } from 'lit'
                export const BadgeStyles = [
                    css\`:host { --mdc-badge-container-color: #ba1a1a; }\`,
                    css\`.container.large { font-size: 16px; min-width: 16px; }\`,
                    css\`.container.small { font-size: 6px; min-width: 6px; }\`,
                ]
            `
            const entryFile = path.resolve(__dirname, '../src/index.ts')
            const result = await compileExportedStylesToCss(dynamicSource, undefined, entryFile)

            expect(result.exportName).toBe('BadgeStyles')
            expect(result.totalRules).toBeGreaterThan(0)
            expect(result.compiledCss).toContain('Genuine CSSResult Compilation')
            expect(result.compiledCss).toContain('--mdc-badge-container-color: #ba1a1a')
            expect(result.compiledCss).toContain('.container.large')
            expect(result.compiledCss).toContain('.container.small')
        })

        it('compiles badge.style.ts with size-differentiated token references', async () => {
            const badgeStylePath = path.resolve(__dirname, '../../mdc/src/components/badge/badge.style.ts')
            const result = await compileExportedStylesToCss('', undefined, badgeStylePath)
            expect(result.compiledCss).toContain('.container.small')
            expect(result.compiledCss).toContain('.container.large')
            expect(result.compiledCss).toContain('--_small-container-size')
            expect(result.compiledCss).toContain('--_large-container-size')
            expect(result.compiledCss).toContain('--_small-container-padding-block-start')
            expect(result.compiledCss).toContain('--_large-container-padding-block-start')
        })

        it('F9: accurately formats CSS output and computes rule count and size statistics', () => {
            const rawCss = `
                .btn { display: inline-flex; align-items: center; }
                .btn:hover { background: red; }
                @media (min-width: 600px) { .btn { padding: 12px; } }
            `
            const formatted = formatCss(rawCss)
            expect(formatted).toContain('.btn {')
            expect(formatted).toContain('    display: inline-flex;')
            expect(formatted).toContain('    align-items: center;')
            expect(formatted).toContain('.btn:hover {')
            expect(formatted).toContain('@media (min-width: 600px) {')

            const rules = countCssRules(rawCss)
            expect(rules).toBe(4)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 2: Boundary & Corner Cases
    // -------------------------------------------------------------------------
    describe('Tier 2: Boundary & Corner Cases', () => {
        it('handles static properties correctly (static property not duplicated in hover deltas)', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const sampleStyleSource = `
                import { css } from 'lit'
                import { ButtonDefinition } from './button.definition'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    @anchor .container {
                        height: var(--_container-height);
                        background-color: var(--_container-color);
                    }
                \`)
            `
            const result = compileExportedStylesToCssSync(sampleStyleSource, metaMap, 'button.style.ts')

            // height is static, should only be in base rule
            expect(result.compiledCss).toContain('.container {\n    height: var(--_container-height);')
            expect(result.compiledCss).not.toContain('.container:hover {\n    height:')
        })

        it('handles empty or comment-only CSS blocks gracefully', () => {
            const emptyStyle = `
                import { css } from 'lit'
                export const EmptyStyles = css\`/* empty comment */\`
            `
            const result = compileExportedStylesToCssSync(emptyStyle, undefined, 'empty.style.ts')
            expect(result.exportName).toBe('EmptyStyles')
            expect(result.totalRules).toBe(0)
        })

        it('gracefully falls back to static AST compilation when dynamic VM bundling fails', async () => {
            const invalidDynamicSource = `
                import { NonExistentModule } from './does-not-exist'
                export const BrokenStyles = [NonExistentModule]
            `
            const result = await compileExportedStylesToCss(invalidDynamicSource, undefined, 'broken.style.ts')
            expect(result.compiledCss).toContain('MDC Compiled Stylesheet Preview (Live - Fallback Mode)')
            expect(result.exportName).toBe('BrokenStyles')
        })

        it('handles keyframes and animation steps in CSS formatting', () => {
            const keyframeCss = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `
            const formatted = formatCss(keyframeCss)
            expect(formatted).toContain('@keyframes spin {')
            expect(formatted).toContain('0% {')
            expect(formatted).toContain('transform: rotate(0deg);')
            expect(formatted).toContain('100% {')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 3: Cross-Feature Interactions & Pairwise Matrix
    // -------------------------------------------------------------------------
    describe('Tier 3: Cross-Feature Interactions', () => {
        it('compiles multi-definition stylesheets combining token metadata from both definitions', () => {
            const defA = analyzeDefinitionSource(`
                export const DefA = createStyleDefinition({
                    'color-a': ['#f00', '#f55', '#a00', '#f00', '#999'],
                })
            `, 'a.definition.ts')!

            const defB = analyzeDefinitionSource(`
                export const DefB = createStyleDefinition({
                    'color-b': ['#00f', '#55f', '#00a', '#00f', '#999'],
                })
            `, 'b.definition.ts')!

            const metaMap = new Map([
                [defA.name, defA],
                [defB.name, defB],
            ])

            const styleSource = `
                import { css } from 'lit'
                import { DefA, DefB } from './definitions'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const DualStyles = createStyleSheet([DefA, DefB], () => css\`
                    @anchor .item {
                        color: var(--_color-a);
                        background: var(--_color-b);
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(styleSource, metaMap, 'dual.style.ts')
            expect(result.definitionNames).toContain('DefA')
            expect(result.definitionNames).toContain('DefB')
            expect(result.compiledCss).toContain('.item:hover {')
            expect(result.compiledCss).toContain('color: var(--_hovered-color-a);')
            expect(result.compiledCss).toContain('background-color: var(--_hovered-color-b);')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 4: Real-World Component Workloads
    // -------------------------------------------------------------------------
    describe('Tier 4: Real-World Component Workloads', () => {
        it('compiles real-world NavigationTab component stylesheet with multi-state deltas', () => {
            const tabDef = analyzeDefinitionSource(`
                import { Color } from '@sandlada/mdk'
                import { createStyleDefinition } from '@sandlada/mdc/utils'

                export const NavigationTabDefinition = createStyleDefinition({
                    'item-color': [Color.OnSurface, Color.Primary, Color.Primary, Color.Primary, Color.Disabled],
                    'item-height': '56px',
                })
            `, 'navigation-tab.definition.ts')!

            const metaMap = new Map([[tabDef.name, tabDef]])

            const tabStyle = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { NavigationTabDefinition } from './navigation-tab.definition'

                export const NavigationTabStyles = [
                    createStyleSheet(NavigationTabDefinition, () => css\`
                        :host {
                            display: flex;
                            align-items: center;
                        }

                        @anchor .container {
                            height: var(--_item-height);
                            color: var(--_item-color);

                            .label {
                                font-size: 14px;
                            }
                        }
                    \`),
                ]
            `

            const result = compileExportedStylesToCssSync(tabStyle, metaMap, 'navigation-tab.style.ts')
            expect(result.exportName).toBe('NavigationTabStyles')
            expect(result.totalRules).toBeGreaterThan(0)
            expect(result.compiledCss).toContain('.container:hover {')
            expect(result.compiledCss).toContain('color: var(--_hovered-item-color);')
            expect(result.compiledCss).toContain('.container:focus-visible {')
            expect(result.compiledCss).toContain('color: var(--_focused-item-color);')
        })
    })
    // -------------------------------------------------------------------------
    // Tier 5: New-System Semantics Parity (schema-driven states, scalar/record,
    // value-difference deltas, comma :host lists, custom triggers)
    // -------------------------------------------------------------------------
    describe('Tier 5: New-System Semantics Parity', () => {
        it('emits no state prefix for scalar tokens and no delta for equal values', () => {
            const defMeta = analyzeDefinitionSource(`
                export const FocusDefinition = createStyleDefinition({
                    'width': '3px',
                    'color': ['#fff', '#fff', '#fff', '#fff', '#999'],
                })
            `, 'focus.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])

            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const FocusStyles = createStyleSheet(FocusDefinition, () => css\`
                    @anchor .ring {
                        outline-width: var(--_width);
                        color: var(--_color);
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(styleSource, metaMap, 'focus.style.ts')
            expect(result.compiledCss).toContain('outline-width: var(--_width);')
            expect(result.compiledCss).toContain('color: var(--_enabled-color);')
            expect(result.compiledCss).not.toContain('--_enabled-width')
            // color differs only on disabled -> single disabled delta, no hover/focus/press
            expect(result.compiledCss).toContain(':host([disabled]) .ring {')
            expect(result.compiledCss).toContain('color: var(--_disabled-color);')
            expect(result.compiledCss).not.toContain('.ring:hover {')
            expect(result.compiledCss).not.toContain('.ring:focus-visible {')
            expect(result.compiledCss).not.toContain('.ring:active {')
        })

        it('treats record tokens as state tokens with sparse states', () => {
            const defMeta = analyzeDefinitionSource(`
                export const FabDefinition = createStyleDefinition({
                    'state-layer-opacity': { hovered: '0.08', focused: '0.12', pressed: '0.12' },
                })
            `, 'fab.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])

            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const FabStyles = createStyleSheet(FabDefinition, () => css\`
                    @anchor .layer {
                        opacity: var(--_state-layer-opacity);
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(styleSource, metaMap, 'fab.style.ts')
            // record has no enabled entry: base falls back to the first value's var,
            // hovered equals that value -> no hover delta (mirrors main package exactly)
            expect(result.compiledCss).toContain('opacity: var(--_enabled-state-layer-opacity);')
            expect(result.compiledCss).not.toContain('.layer:hover {')
            expect(result.compiledCss).toContain('.layer:focus-visible {')
            expect(result.compiledCss).toContain('opacity: var(--_focused-state-layer-opacity);')
            expect(result.compiledCss).toContain('.layer:active {')
            expect(result.compiledCss).toContain('opacity: var(--_pressed-state-layer-opacity);')
        })

        it('splits comma-separated :host lists into valid rules', () => {
            const defMeta = analyzeDefinitionSource(`
                export const RingDefinition = createStyleDefinition({
                    'duration': '500ms',
                })
            `, 'ring.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])

            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const RingStyles = createStyleSheet(RingDefinition, () => css\`
                    :host([focused]),
                    :host([persistent]) {
                        display: flex;
                    }

                    @starting-style {
                        :host([focused]),
                        :host([persistent]) {
                            opacity: 0;
                        }
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(styleSource, metaMap, 'ring.style.ts')
            expect(result.compiledCss).toContain(':host([focused]) {')
            expect(result.compiledCss).toContain(':host([persistent]) {')
            expect(result.compiledCss).toContain('@starting-style')
            expect(result.compiledCss).not.toContain('[focused][')
            expect(result.compiledCss).not.toContain('])([')
        })

        it('derives states from the bound schema instead of the fixed 5-state table', () => {
            const defMeta = analyzeDefinitionSource(`
                import { defineSchema } from '@sandlada/mdc/utils'

                export const FabSchema = defineSchema(['enabled', 'hovered', 'focused', 'pressed'])

                export const FabDefinition = createStyleDefinition(FabSchema)({
                    'container-elevation': ['3', '4', '3', '3'],
                })
            `, 'fab.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])

            const styleSource = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const FabStyles = createStyleSheet(FabDefinition, () => css\`
                    @anchor .box {
                        elevation: var(--_container-elevation);
                    }
                \`)
            `

            const result = compileExportedStylesToCssSync(styleSource, metaMap, 'fab.style.ts')
            // index 1 differs -> hovered delta; index 2/3 equal base -> no focus/press delta, no disabled at all
            expect(result.compiledCss).toContain('.box:hover {')
            expect(result.compiledCss).toContain('elevation: var(--_hovered-container-elevation);')
            expect(result.compiledCss).not.toContain('focus-visible')
            expect(result.compiledCss).not.toContain(':host([disabled])')
        })

        it('compiles real component badge.style.ts with @state and size-differentiated variables via genuine VM', async () => {
            const badgeStylePath = path.resolve(__dirname, '../../mdc/src/components/badge/badge.style.ts')
            const result = await compileExportedStylesToCss('', undefined, badgeStylePath)

            expect(result.exportName).toBe('BadgeStyles')
            expect(result.totalRules).toBeGreaterThan(0)
            expect(result.compiledCss).toContain('.container.small')
            expect(result.compiledCss).toContain('var(--_small-container-size)')
            expect(result.compiledCss).toContain('var(--_large-container-size)')
            expect(result.compiledCss).not.toContain('.container.small {\n    height: var(--_container-size);')
        })
    })
})

