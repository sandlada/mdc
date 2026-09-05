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

    class MockMarkdownString {
        constructor(public value: string) {}
    }

    class MockHover {
        constructor(public contents: MockMarkdownString, public range?: MockRange) {}
    }

    return {
        Range: MockRange,
        Position: MockPosition,
        MarkdownString: MockMarkdownString,
        Hover: MockHover,
    }
})

import * as vscode from 'vscode'
import { getHoverInfoForToken } from '../src/core/hover-engine'
import { MDCHoverProvider } from '../src/providers/hover-provider'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Hover Documentation Engine & Provider (Tiers 1-4)', () => {
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
                    'size': '18px',
                },
            }),
        })
    `

    // -------------------------------------------------------------------------
    // Tier 1: Feature Coverage (Feature 16)
    // -------------------------------------------------------------------------
    describe('Tier 1: Feature Coverage', () => {
        it('F16: generates rich markdown for private tuple token with states and component name', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_container-color')

            expect(hover).not.toBeNull()
            expect(hover).toContain('### 📦 MDC Component Token: `--_container-color`')
            expect(hover).toContain('**Component**: `ButtonDefinition`')
            expect(hover).toContain('5-State Tuple')
            expect(hover).toContain('• `enabled`')
            expect(hover).toContain('• `hovered`')
            expect(hover).toContain('• `pressed`')
            expect(hover).toContain('• `focused`')
            expect(hover).toContain('• `disabled`')
        })

        it('F16: generates markdown for static token value', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_container-height')

            expect(hover).not.toBeNull()
            expect(hover).toContain('### 📦 MDC Component Token: `--_container-height`')
            expect(hover).toContain("Static Value")
            expect(hover).toContain("'40px'")
        })

        it('F16: generates markdown for forwarded child token with target component metadata', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--mdc-icon-enabled-color')

            expect(hover).not.toBeNull()
            expect(hover).toContain('### 🔗 Forwarded Child Token: `--mdc-icon-enabled-color`')
            expect(hover).toContain('**Target Component**: `IconDefinition`')
            expect(hover).toContain('**Parent Definition**: `ButtonDefinition`')
            expect(hover).toContain('**Target Prefix**: `--mdc-icon`')
            expect(hover).toContain('**Child Token Key**: `color`')
            expect(hover).toContain('**State**: `enabled`')
        })

        it('F16: provides hover over full Styles export variable name', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCHoverProvider(metaMap)

            const sampleStyle = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = [
                    createStyleSheet(ButtonDefinition, () => css\`
                        .container {
                            background-color: var(--_container-color);
                        }
                    \`),
                ]
            `

            const mockDoc = {
                getText: (range?: any) => (range ? 'ButtonStyles' : sampleStyle),
                fileName: 'button.style.ts',
                getWordRangeAtPosition: (_pos: any, regex: RegExp) => {
                    if (regex.test('ButtonStyles')) {
                        return new vscode.Range(5, 29, 5, 41)
                    }
                    return undefined
                },
            } as any

            const hover = await provider.provideHover(mockDoc, new vscode.Position(5, 30), {} as any)
            expect(hover).not.toBeNull()
            expect(hover!.contents.value).toContain('ButtonStyles')
            expect(hover!.contents.value).toContain('ButtonDefinition')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 2: Boundary & Corner Cases
    // -------------------------------------------------------------------------
    describe('Tier 2: Boundary & Corner Cases', () => {
        it('returns null when hovering over undeclared / unknown token', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_unknown-token')
            expect(hover).toBeNull()
        })

        it('returns null when definitionMeta is null', () => {
            const hover = getHoverInfoForToken(null, '--_container-color')
            expect(hover).toBeNull()
        })

        it('cleans var(...) wrapper parentheses and trailing characters in tokenText', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, 'var(--_container-color);')
            expect(hover).not.toBeNull()
            expect(hover).toContain('--_container-color')
        })

        it('returns null for document without stylesheets', async () => {
            const provider = new MDCHoverProvider(new Map())
            const mockDoc = {
                getText: () => 'export const a = 1',
                fileName: 'plain.ts',
            } as any

            const hover = await provider.provideHover(mockDoc, new vscode.Position(0, 0), {} as any)
            expect(hover).toBeNull()
        })
    })

    // -------------------------------------------------------------------------
    // Tier 3: Cross-Feature Interactions & Pairwise Matrix
    // -------------------------------------------------------------------------
    describe('Tier 3: Cross-Feature Interactions', () => {
        it('dynamically updates hover information when definition metadata is updated', async () => {
            const provider = new MDCHoverProvider(new Map())
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!

            // Update definitions
            provider.updateDefinitions(new Map([[defMeta.name, defMeta]]))

            const sampleStyle = `
                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    .container { background-color: var(--_container-color); }
                \`)
            `
            const mockDoc = {
                getText: (range?: any) => (range ? '--_container-color' : sampleStyle),
                fileName: 'button.style.ts',
                getWordRangeAtPosition: (_pos: any, regex: RegExp) => {
                    if (regex.test('--_container-color')) {
                        return new vscode.Range(2, 51, 2, 68)
                    }
                    return undefined
                },
            } as any

            const hover = await provider.provideHover(mockDoc, new vscode.Position(2, 55), {} as any)
            expect(hover).not.toBeNull()
            expect(hover!.contents.value).toContain('ButtonDefinition')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 4: Real-World Component Workloads
    // -------------------------------------------------------------------------
    describe('Tier 4: Real-World Component Workloads', () => {
        it('provides accurate hover documentation for real Badge component tokens', () => {
            const badgeDef = analyzeDefinitionSource(`
                import { Color } from '@sandlada/mdk'
                import { createStyleDefinition } from '@sandlada/mdc/utils'

                export const BadgeDefinition = createStyleDefinition({
                    'container-color': Color.Error,
                    'container-size': ['6px', '16px'],
                })
            `, 'badge.definition.ts')!

            const colorHover = getHoverInfoForToken(badgeDef, '--_container-color')
            expect(colorHover).toContain('BadgeDefinition')
            expect(colorHover).toContain('Color.Error')

            const sizeHover = getHoverInfoForToken(badgeDef, '--_container-size')
            expect(sizeHover).toContain('BadgeDefinition')
            expect(sizeHover).toContain("['6px', '16px']")
        })
    })

    // -------------------------------------------------------------------------
    // Tier 5: State-Prefixed & Short-Alias Resolution
    // -------------------------------------------------------------------------
    describe('Tier 5: State-Prefixed & Short-Alias Resolution', () => {
        it('resolves state-prefixed private tokens to their definition token', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_enabled-container-color')

            expect(hover).not.toBeNull()
            expect(hover).toContain('**Component**: `ButtonDefinition`')
            expect(hover).toContain('**State**: `enabled` (of `container-color`)')
        })

        it('resolves short-alias prefixes (hover/active/focus)', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_hover-container-color')

            expect(hover).not.toBeNull()
            expect(hover).toContain('**State**: `hover` (of `container-color`)')
        })

        it('renders the actual state count instead of a fixed 5-State label', () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const hover = getHoverInfoForToken(defMeta, '--_container-color')

            expect(hover).toContain('5-State Tuple')
            expect(hover).not.toContain('Static Value')
        })
    })
})
