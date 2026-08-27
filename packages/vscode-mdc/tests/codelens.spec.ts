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

describe('MDC Multi-Line CodeLens Provider', () => {
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

    it('distributes CodeLens items across multiple distinct lines instead of grouping on a single line', async () => {
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

        // Gather lines where CodeLenses are placed
        const distinctLines = Array.from(new Set(lenses.map((l) => l.range.startLine)))

        // Must be on multiple distinct lines!
        expect(distinctLines.length).toBeGreaterThanOrEqual(2)

        // 1. Export Declaration line (line 7: export const ButtonStyles = [)
        const exportLenses = lenses.filter((l) => l.range.startLine === 7)
        expect(exportLenses.some((l) => l.command?.title.includes('references'))).toBe(true)
        expect(exportLenses.some((l) => l.command?.title.includes('View Compiled CSS'))).toBe(true)

        // 2. createStyleSheet line (line 9: createStyleSheet(ButtonDefinition, ...))
        const sheetLenses = lenses.filter((l) => l.range.startLine === 9)
        expect(sheetLenses.some((l) => l.command?.title.includes('ButtonDefinition'))).toBe(true)
        expect(sheetLenses.some((l) => l.command?.title.includes('Private Tokens'))).toBe(true)

        // 3. Token Record line (line 5: const tokenRecord = defineTokenRefsRecord(...))
        const recordLenses = lenses.filter((l) => l.range.startLine === 5)
        expect(recordLenses.some((l) => l.command?.title.includes('Token Record: ButtonDefinition'))).toBe(true)

        // 4. Override line (line 11: overrideStyleSheet(IconDefinition, ...))
        const overrideLenses = lenses.filter((l) => l.range.startLine === 11)
        expect(overrideLenses.some((l) => l.command?.title.includes('Override: IconDefinition'))).toBe(true)
    })

    it('provides CodeLenses on definition declarations in *.definition.ts files', async () => {
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
