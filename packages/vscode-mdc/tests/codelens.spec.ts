/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('vscode', () => {
    class MockRange {
        constructor(
            public startLine: number,
            public startCharacter: number,
            public endLine: number,
            public endCharacter: number
        ) {}
    }

    class MockPosition {
        constructor(public line: number, public character: number) {}
    }

    class MockCodeLens {
        public command?: { title: string; command: string; arguments?: any[] }
        constructor(public range: MockRange) {}
    }

    class MockUri {
        constructor(public readonly path: string) {}
        public static parse(val: string) {
            return new MockUri(val)
        }
    }

    return {
        Range: MockRange,
        Position: MockPosition,
        CodeLens: MockCodeLens,
        Uri: MockUri,
        commands: {
            executeCommand: vi.fn().mockResolvedValue([{}]),
        },
    }
})

import * as vscode from 'vscode'
import { MDCCodeLensProvider } from '../src/providers/codelens-provider'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Multi-Line CodeLens Provider (Tiers 1-4)', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
        import { IconDefinition } from './icon.definition'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'label-color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],

            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
                },
            }),
        })
    `

    const sampleStylesheetSource = `import { css, unsafeCSS } from 'lit'
import { ButtonDefinition } from './button.definition'
import { createStyleSheet, defineTokenRefsRecord, overrideStyleSheet } from '@sandlada/mdc/utils'
import { IconDefinition } from './icon.definition'

const tokenRecord = defineTokenRefsRecord(ButtonDefinition, { prefix: '--mdc-button' })

export const ButtonStyles = [
    css\`:host { color: red; }\`,
    createStyleSheet(ButtonDefinition, () => css\`
        :host {
            \${overrideStyleSheet(IconDefinition, '--mdc-icon', { color: 'var(--_icon-color)' })};
        }
        @anchor .container {
            height: var(--_container-height);
            background-color: var(--_container-color);
            .label {
                color: var(--_label-color);
            }
        }
    \`),
]
`

    // -------------------------------------------------------------------------
    // Tier 1: Feature Coverage (Feature 17)
    // -------------------------------------------------------------------------
    describe('Tier 1: Feature Coverage', () => {
        it('F17: distributes CodeLens items across multiple distinct lines instead of grouping on a single line', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCCodeLensProvider(metaMap)

            const mockDoc = {
                getText: () => sampleStylesheetSource,
                fileName: 'button.style.ts',
                uri: vscode.Uri.parse('file:///button.style.ts'),
                lineCount: 20,
            } as unknown as vscode.TextDocument

            const lenses = await provider.provideCodeLenses(mockDoc, {} as any)
            expect(lenses.length).toBeGreaterThanOrEqual(4)

            const distinctLines = Array.from(new Set(lenses.map((l) => l.range.startLine)))
            expect(distinctLines.length).toBeGreaterThanOrEqual(2)

            // Export line lenses
            const exportLenses = lenses.filter((l) => l.range.startLine === 7)
            expect(exportLenses.some((l) => l.command?.title.includes('references'))).toBe(true)
            expect(exportLenses.some((l) => l.command?.title.includes('View Compiled CSS'))).toBe(true)

            // createStyleSheet line lenses
            const sheetLenses = lenses.filter((l) => l.range.startLine === 9)
            expect(sheetLenses.some((l) => l.command?.title.includes('ButtonDefinition'))).toBe(true)
            expect(sheetLenses.some((l) => l.command?.title.includes('Private Tokens'))).toBe(true)

            // Token Record line
            const recordLenses = lenses.filter((l) => l.range.startLine === 5)
            expect(recordLenses.some((l) => l.command?.title.includes('Token Record: ButtonDefinition'))).toBe(true)

            // Override line
            const overrideLenses = lenses.filter((l) => l.range.startLine === 11)
            expect(overrideLenses.some((l) => l.command?.title.includes('Override: IconDefinition'))).toBe(true)
        })

        it('F17: provides CodeLenses on definition declarations in *.definition.ts files', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCCodeLensProvider(metaMap)

            const mockDoc = {
                getText: () => sampleDefinitionSource,
                fileName: 'button.definition.ts',
                uri: vscode.Uri.parse('file:///button.definition.ts'),
                lineCount: 25,
            } as unknown as vscode.TextDocument

            const lenses = await provider.provideCodeLenses(mockDoc, {} as any)
            expect(lenses.length).toBeGreaterThanOrEqual(2)

            const defLens = lenses.find((l) => l.command?.title.includes('ButtonDefinition'))
            expect(defLens).toBeDefined()
            expect(defLens?.command?.title).toContain('Tokens')

            const refLens = lenses.find((l) => l.command?.title.includes('references'))
            expect(refLens).toBeDefined()
        })
    })

    // -------------------------------------------------------------------------
    // Tier 2: Boundary & Corner Cases
    // -------------------------------------------------------------------------
    describe('Tier 2: Boundary & Corner Cases', () => {
        it('returns empty array when document is not a stylesheet or definition', async () => {
            const provider = new MDCCodeLensProvider(new Map())
            const mockDoc = {
                getText: () => 'export const helper = 42',
                fileName: 'helper.ts',
                uri: vscode.Uri.parse('file:///helper.ts'),
                lineCount: 1,
            } as unknown as vscode.TextDocument

            const lenses = await provider.provideCodeLenses(mockDoc, {} as any)
            expect(lenses.length).toBe(0)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 3: Cross-Feature Interactions & Pairwise Matrix
    // -------------------------------------------------------------------------
    describe('Tier 3: Cross-Feature Interactions', () => {
        it('dynamically updates CodeLens titles when definition map is updated', async () => {
            const provider = new MDCCodeLensProvider(new Map())
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!

            provider.updateDefinitions(new Map([[defMeta.name, defMeta]]))

            const mockDoc = {
                getText: () => sampleStylesheetSource,
                fileName: 'button.style.ts',
                uri: vscode.Uri.parse('file:///button.style.ts'),
                lineCount: 20,
            } as unknown as vscode.TextDocument

            const lenses = await provider.provideCodeLenses(mockDoc, {} as any)
            expect(lenses.some((l) => l.command?.title.includes('ButtonDefinition'))).toBe(true)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 4: Real-World Workloads
    // -------------------------------------------------------------------------
    describe('Tier 4: Real-World Workloads', () => {
        it('generates accurate CodeLenses for real Badge definition and style', async () => {
            const badgeDef = analyzeDefinitionSource(`
                export const BadgeDefinition = createStyleDefinition({
                    'container-color': '#ba1a1a',
                    'container-size': ['6px', '16px'],
                })
            `, 'badge.definition.ts')!

            const metaMap = new Map([[badgeDef.name, badgeDef]])
            const provider = new MDCCodeLensProvider(metaMap)

            const badgeDoc = {
                getText: () => `
export const BadgeStyles = createStyleSheet(BadgeDefinition, () => css\`
    .container { height: var(--_container-size); }
\`)
                `,
                fileName: 'badge.style.ts',
                uri: vscode.Uri.parse('file:///badge.style.ts'),
                lineCount: 5,
            } as unknown as vscode.TextDocument

            const lenses = await provider.provideCodeLenses(badgeDoc, {} as any)
            expect(lenses.length).toBeGreaterThan(0)
            expect(lenses.some((l) => l.command?.title.includes('BadgeDefinition'))).toBe(true)
        })
    })
})
