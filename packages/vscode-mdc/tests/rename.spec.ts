/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { computeTokenRenameEdits } from '../src/core/rename-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Bidirectional Token Rename Engine (Tiers 1-4)', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
        })
    `

    const sampleStylesheetSource = `
        import { css } from 'lit'
        import { createStyleSheet } from '@sandlada/mdc/utils'
        import { ButtonDefinition } from './button.definition'

        export const ButtonStyles = [
            createStyleSheet(ButtonDefinition, () => css\`
                .container {
                    background-color: var(--_container-color);
                    height: var(--_container-height);

                    &:hover {
                        background-color: var(--_container-color);
                    }
                }
            \`),
        ]
    `

    // -------------------------------------------------------------------------
    // Tier 1: Feature Coverage (Feature 20)
    // -------------------------------------------------------------------------
    describe('Tier 1: Feature Coverage', () => {
        it('F20: computes synchronized rename edits across definition and referencing stylesheet', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const allStyleFiles = [
                { filePath: 'button.style.ts', sourceText: sampleStylesheetSource },
            ]

            const edits = computeTokenRenameEdits(
                '--_container-color',
                'container-background',
                'button.style.ts',
                sampleStylesheetSource,
                metaMap,
                allStyleFiles
            )

            expect(edits.length).toBe(3) // 1 in definition + 2 in stylesheet

            // 1. Definition edit
            const defEdit = edits.find((e) => e.filePath === 'button.definition.ts')
            expect(defEdit).toBeDefined()
            expect(defEdit!.newText).toBe("'container-background'")

            // 2. Stylesheet edits
            const styleEdits = edits.filter((e) => e.filePath === 'button.style.ts')
            expect(styleEdits.length).toBe(2)
            expect(styleEdits[0].newText).toBe('--_container-background')
            expect(styleEdits[1].newText).toBe('--_container-background')
        })

        it('F20: computes edits across multiple stylesheet files', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const allStyleFiles = [
                { filePath: 'style-a.ts', sourceText: 'background: var(--_container-height);' },
                { filePath: 'style-b.ts', sourceText: 'height: var(--_container-height);' },
            ]

            const edits = computeTokenRenameEdits(
                '--_container-height',
                'container-size',
                'style-a.ts',
                'background: var(--_container-height);',
                metaMap,
                allStyleFiles
            )

            expect(edits.length).toBe(3) // 1 def + 1 in style-a + 1 in style-b
            expect(edits.filter((e) => e.filePath === 'style-a.ts').length).toBe(1)
            expect(edits.filter((e) => e.filePath === 'style-b.ts').length).toBe(1)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 2: Boundary & Corner Cases
    // -------------------------------------------------------------------------
    describe('Tier 2: Boundary & Corner Cases', () => {
        it('returns empty edits when new token name is identical to old name', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const edits = computeTokenRenameEdits(
                '--_container-color',
                'container-color',
                'button.style.ts',
                sampleStylesheetSource,
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: sampleStylesheetSource }]
            )

            expect(edits.length).toBe(0)
        })

        it('returns empty edits when old token is not found in definition', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const edits = computeTokenRenameEdits(
                '--_non-existent-token',
                'new-token',
                'button.style.ts',
                sampleStylesheetSource,
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: sampleStylesheetSource }]
            )

            expect(edits.length).toBe(0)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 3: Cross-Feature Interactions & Pairwise Matrix
    // -------------------------------------------------------------------------
    describe('Tier 3: Cross-Feature Interactions', () => {
        it('handles definition without filePath by returning stylesheet edits only', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource)! // no filePath passed
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const edits = computeTokenRenameEdits(
                '--_container-color',
                'container-bg',
                'button.style.ts',
                sampleStylesheetSource,
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: sampleStylesheetSource }]
            )

            expect(edits.length).toBe(2) // 2 in stylesheet only
            expect(edits.every((e) => e.filePath === 'button.style.ts')).toBe(true)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 4: Real-World Workloads
    // -------------------------------------------------------------------------
    describe('Tier 4: Real-World Workloads', () => {
        it('renames real-world Badge token cleanly', () => {
            const badgeDef = analyzeDefinitionSource(`
                export const BadgeDefinition = createStyleDefinition({
                    'container-size': ['6px', '16px'],
                })
            `, 'badge.definition.ts')!

            const metaMap = new Map([[badgeDef.name, badgeDef]])
            const style = `
                export const BadgeStyles = createStyleSheet(BadgeDefinition, () => css\`
                    .container { min-width: var(--_container-size); }
                \`)
            `

            const edits = computeTokenRenameEdits(
                '--_container-size',
                'badge-size',
                'badge.style.ts',
                style,
                metaMap,
                [{ filePath: 'badge.style.ts', sourceText: style }]
            )

            expect(edits.length).toBe(2)
            expect(edits[0].newText).toBe("'badge-size'")
            expect(edits[1].newText).toBe('--_badge-size')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 5: State-Aware Renames & Boundary Safety
    // -------------------------------------------------------------------------
    describe('Tier 5: State-Aware Renames & Boundary Safety', () => {
        it('renames every emitted state form of a tuple token', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const style = `
                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        background-color: var(--_container-color);
                        border-color: var(--_enabled-container-color);
                    }
                    .container:hover {
                        background-color: var(--_hovered-container-color);
                    }
                \`)
            `

            const edits = computeTokenRenameEdits(
                '--_container-color',
                'container-background',
                'button.style.ts',
                style,
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: style }]
            )

            const styleEdits = edits.filter((e) => e.filePath === 'button.style.ts')
            expect(styleEdits.length).toBe(3)
            expect(styleEdits.map((e) => e.newText).sort()).toEqual([
                '--_container-background',
                '--_enabled-container-background',
                '--_hovered-container-background'
            ])
        })

        it('never touches neighboring tokens that merely contain the old key', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

            const style = `
                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        background-color: var(--_container-color);
                        min-width: var(--_small-container-color);
                    }
                \`)
            `

            const edits = computeTokenRenameEdits(
                '--_container-color',
                'container-background',
                'button.style.ts',
                style,
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: style }]
            )

            const styleEdits = edits.filter((e) => e.filePath === 'button.style.ts')
            expect(styleEdits.length).toBe(1)
            expect(styleEdits[0].newText).toBe('--_container-background')
        })

        it('renames public child bridge variables when the child key is renamed', () => {
            const iconMeta = analyzeDefinitionSource(`
                import { createStyleDefinition } from '@sandlada/mdc/utils'

                export const IconDefinition = createStyleDefinition({
                    'color': ['#fff', '#eee', '#ddd', '#ccc', '#bbb'],
                    'size': '18px'
                })
            `, 'icon.definition.ts')!
            const buttonMeta = analyzeDefinitionSource(`
                import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
                import { IconDefinition } from './icon.definition'

                export const ButtonDefinition = createStyleDefinition({
                    'container-color': ['#111', '#222', '#333', '#444', '#555'],
                    ...forwardTokens(IconDefinition, {
                        targetPrefix: '--mdc-icon',
                        name: 'icon',
                        tokens: {
                            'color': ['#fff', '#eee', '#ddd', '#ccc', '#bbb'],
                            'size': '18px'
                        }
                    })
                })
            `, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([
                [iconMeta.name, iconMeta],
                [buttonMeta.name, buttonMeta]
            ])

            const style = `
                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    mdc-icon {
                        --mdc-icon-enabled-color: var(--_enabled-icon-color);
                        --mdc-icon-size: var(--_icon-size);
                    }
                \`)
            `

            const edits = computeTokenRenameEdits(
                '--_color',
                'tint',
                'icon.definition.ts',
                'icon.definition.ts source',
                metaMap,
                [{ filePath: 'button.style.ts', sourceText: style }]
            )

            const newTexts = edits.map((e) => e.newText)
            expect(newTexts).toContain('--mdc-icon-enabled-tint')
            expect(edits.some((e) => e.filePath === 'icon.definition.ts' && e.newText === `'tint'`)).toBe(true)
            // Unrelated bridge with a different child key stays untouched
            expect(edits.filter((e) => e.newText === '--mdc-icon-size').length).toBe(0)
        })
    })
})
