/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('vscode', () => {
    class MockTreeItem {
        public description?: string
        public iconPath?: any
        public command?: any
        public contextValue?: string
        constructor(public label: string, public collapsibleState?: any) {}
    }
    class MockThemeIcon {
        constructor(public id: string) {}
    }
    class MockEventEmitter {
        public event = vi.fn()
        public fire = vi.fn()
        public dispose = vi.fn()
    }

    return {
        TreeItem: MockTreeItem,
        TreeItemCollapsibleState: {
            None: 0,
            Collapsed: 1,
            Expanded: 2,
        },
        ThemeIcon: MockThemeIcon,
        EventEmitter: MockEventEmitter,
    }
})

import {
    MDCTreeViewProvider,
    MDCSchemaTreeProvider,
    MDCSelectorMappingTreeProvider,
    MDCComponentTokensTreeProvider,
    MDCForwardedTokensTreeProvider,
    MDCUnusedTokensTreeProvider,
} from '../src/providers/treeview-provider'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Sidebar TreeView Provider (Tiers 1-4)', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
        import { IconDefinition } from './icon.definition'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'container-padding': '8px',

            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'size': '18px',
                },
            }),
        })
    `

    // -------------------------------------------------------------------------
    // Tier 1: Feature Coverage (Features 10-15)
    // -------------------------------------------------------------------------
    describe('Tier 1: Feature Coverage', () => {
        it('F10: returns empty placeholder tree item when no active stylesheet is open', async () => {
            const metaMap = new Map<string, DefinitionMeta>()
            const provider = new MDCTreeViewProvider(metaMap)

            const rootItems = await provider.getChildren()
            expect(rootItems.length).toBe(1)
            expect(rootItems[0].label).toBe('No active MDC Stylesheet open')
            expect(rootItems[0].description).toBe('Open a *.style.ts file to inspect tokens')
        })

        it('F11 & F12: builds category hierarchy and component stats when stylesheet is set', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCTreeViewProvider(metaMap)

            const sampleStylesheet = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = [
                    createStyleSheet(ButtonDefinition, () => css\`
                        .container {
                            background-color: var(--_container-color);
                            height: var(--_container-height);
                            mdc-icon {
                                --mdc-icon-size: var(--_icon-size);
                            }
                        }
                    \`),
                ]
            `

            const mockDoc = {
                fileName: 'button.style.ts',
                getText: () => sampleStylesheet,
            } as any

            provider.setActiveDocument(mockDoc)

            const rootCategories = await provider.getChildren()
            expect(rootCategories.length).toBe(4)

            // 1. Stats node with showCompiledCss command
            expect(rootCategories[0].label).toBe('📦 ButtonDefinition')
            expect(rootCategories[0].description).toContain('Coverage:')
            expect(rootCategories[0].command?.command).toBe('mdc.showCompiledCss')

            // 2. Private tokens category
            expect(rootCategories[1].label).toContain('🎨 Private Tokens')
            const privateTokens = await provider.getChildren(rootCategories[1])
            expect(privateTokens.length).toBe(3) // container-color, container-height, icon-size
            expect(privateTokens.map((p) => p.label)).toContain('var(--_container-color)')
            expect(privateTokens.map((p) => p.label)).toContain('var(--_container-height)')

            // Check Jump to Token command
            const colorItem = privateTokens.find((p) => p.label === 'var(--_container-color)')!
            expect(colorItem.command?.command).toBe('mdc.jumpToToken')
            expect(colorItem.command?.arguments?.length).toBe(2)
        })

        it('F13: lists forwarded child bridge tokens and links to target component', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCTreeViewProvider(metaMap)

            const sampleStylesheet = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        --mdc-icon-size: var(--_icon-size);
                    }
                \`)
            `

            provider.setActiveDocument({ fileName: 'button.style.ts', getText: () => sampleStylesheet } as any)

            const rootCategories = await provider.getChildren()
            const childCategory = rootCategories.find((c) => c.label.includes('Forwarded Children'))!
            expect(childCategory).toBeDefined()

            const childTokens = await provider.getChildren(childCategory)
            expect(childTokens.length).toBe(1)
            expect(childTokens[0].label).toBe('--mdc-icon-size')
            expect(childTokens[0].description).toContain('IconDefinition')
            expect(childTokens[0].command?.command).toBe('mdc.jumpToToken')
        })

        it('F14 & F15: audits unused tokens and provides navigation and jump commands', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
            const provider = new MDCTreeViewProvider(metaMap)

            const sampleStylesheet = `
                import { css } from 'lit'
                import { createStyleSheet } from '@sandlada/mdc/utils'
                import { ButtonDefinition } from './button.definition'

                export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        height: var(--_container-height);
                    }
                \`)
            `

            provider.setActiveDocument({ fileName: 'button.style.ts', getText: () => sampleStylesheet } as any)

            const rootCategories = await provider.getChildren()
            const unusedCategory = rootCategories.find((c) => c.label.includes('Unused Tokens'))!
            expect(unusedCategory).toBeDefined()

            const unusedTokens = await provider.getChildren(unusedCategory)
            expect(unusedTokens.length).toBeGreaterThan(0)
            expect(unusedTokens.map((u) => u.label)).toContain('var(--_container-padding)')
            expect(unusedTokens.map((u) => u.label)).toContain('var(--_container-color)')
        })
    })

    // -------------------------------------------------------------------------
    // Tier 2: Boundary & Corner Cases
    // -------------------------------------------------------------------------
    describe('Tier 2: Boundary & Corner Cases', () => {
        it('resets to placeholder when non-MDC file is activated', async () => {
            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCTreeViewProvider(metaMap)

            // First set active MDC stylesheet
            provider.setActiveDocument({
                fileName: 'button.style.ts',
                getText: () => 'export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css`.btn{}`)',
            } as any)

            let roots = await provider.getChildren()
            expect(roots.length).toBe(4)

            // Now activate a plain JS file
            provider.setActiveDocument({
                fileName: 'utils.ts',
                getText: () => 'export const add = (a, b) => a + b',
            } as any)

            roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toBe('No active MDC Stylesheet open')
        })

        it('handles undefined active document cleanly', async () => {
            const provider = new MDCTreeViewProvider(new Map())
            provider.setActiveDocument(undefined)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toBe('No active MDC Stylesheet open')
        })

        it('collapses unused tokens category when 100% token coverage is achieved', async () => {
            const miniDef = analyzeDefinitionSource(`
                export const MiniDefinition = createStyleDefinition({ 'color': 'red' })
            `, 'mini.definition.ts')!
            const metaMap = new Map([[miniDef.name, miniDef]])
            const provider = new MDCTreeViewProvider(metaMap)

            provider.setActiveDocument({
                fileName: 'mini.style.ts',
                getText: () => 'export const MiniStyles = createStyleSheet(MiniDefinition, () => css`.a { color: var(--_color); }`)',
            } as any)

            const roots = await provider.getChildren()
            const unusedCat = roots.find((r) => r.label.includes('Unused Tokens (0)'))!
            expect(unusedCat).toBeDefined()
            // When unused count is 0, collapsibleState is Collapsed (1)
            expect(unusedCat.collapsibleState).toBe(1)
        })
    })

    // -------------------------------------------------------------------------
    // Tier 3: Cross-Feature Interactions & Pairwise Matrix
    // -------------------------------------------------------------------------
    describe('Tier 3: Cross-Feature Interactions', () => {
        it('dynamically switches tree data when active document changes between components', async () => {
            const defA = analyzeDefinitionSource(`
                export const AlphaDefinition = createStyleDefinition({ 'alpha-token': '10px' })
            `, 'alpha.definition.ts')!

            const defB = analyzeDefinitionSource(`
                export const BetaDefinition = createStyleDefinition({ 'beta-token': '20px' })
            `, 'beta.definition.ts')!

            const metaMap = new Map([
                [defA.name, defA],
                [defB.name, defB],
            ])
            const provider = new MDCTreeViewProvider(metaMap)

            // Switch to Alpha
            provider.setActiveDocument({
                fileName: 'alpha.style.ts',
                getText: () => 'export const AlphaStyles = createStyleSheet(AlphaDefinition, () => css`.a { width: var(--_alpha-token); }`)',
            } as any)

            let roots = await provider.getChildren()
            expect(roots[0].label).toBe('📦 AlphaDefinition')

            // Switch to Beta
            provider.setActiveDocument({
                fileName: 'beta.style.ts',
                getText: () => 'export const BetaStyles = createStyleSheet(BetaDefinition, () => css`.b { width: var(--_beta-token); }`)',
            } as any)

            roots = await provider.getChildren()
            expect(roots[0].label).toBe('📦 BetaDefinition')
        })

        it('updates tree data when definition map is updated dynamically', async () => {
            const provider = new MDCTreeViewProvider(new Map())

            provider.setActiveDocument({
                fileName: 'button.style.ts',
                getText: () => 'export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css`.btn { color: var(--_container-color); }`)',
            } as any)

            const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
            provider.updateDefinitions(new Map([[defMeta.name, defMeta]]))

            // Tree should reflect updated definition coverage
            const roots = await provider.getChildren()
            expect(roots[0].label).toBe('📦 ButtonDefinition')
        })

        it('disposes cleanly and releases all event listeners', () => {
            const provider = new MDCTreeViewProvider(new Map())
            expect(() => provider.dispose()).not.toThrow()
        })
    })

    // -------------------------------------------------------------------------
    // Tier 4: Real-World Workloads
    // -------------------------------------------------------------------------
    describe('Tier 4: Real-World Component Workloads', () => {
        it('builds complete 5-section data model for real Badge component', async () => {
            const badgeDef = analyzeDefinitionSource(`
                import { Shape, Color } from '@sandlada/mdk'
                import { createStyleDefinition } from '@sandlada/mdc/utils'

                export const BadgeDefinition = createStyleDefinition({
                    'container-color': Color.Error,
                    'container-size': ['6px', '16px'],
                    'label-color': Color.OnError,
                })
            `, 'badge.definition.ts')!

            const metaMap = new Map([[badgeDef.name, badgeDef]])
            const provider = new MDCTreeViewProvider(metaMap)

            const badgeStyle = `
                import { css } from 'lit'
                import { BadgeDefinition } from '../../definitions'
                import { pipe, stringifyTokens, mapStateTriggers, createStyleSheet } from '../../utils'

                export const BadgeStyles = [
                    createStyleSheet(BadgeDefinition, () => css\`
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

            provider.setActiveDocument({ fileName: 'badge.style.ts', getText: () => badgeStyle } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(4)
            expect(roots[0].label).toBe('📦 BadgeDefinition')
            expect(roots[0].description).toContain('Coverage: 3/3 (100%)')

            const privateTokens = await provider.getChildren(roots[1])
            expect(privateTokens.length).toBe(3)
            expect(privateTokens.map((p) => p.label)).toEqual([
                'var(--_container-color)',
                'var(--_container-size)',
                'var(--_label-color)',
            ])
        })
    })

    // -------------------------------------------------------------------------
    // Tier 5: 5 Dedicated Sidebar TreeView Providers (R2 / PROJECT.md)
    // -------------------------------------------------------------------------
    describe('Tier 5: 5 Dedicated Sidebar TreeView Providers', () => {
        const fullDefSource = `
            import { defineSchema, createStyleDefinition, forwardTokens, mapStateTriggers } from '@sandlada/mdc/utils'
            import { IconDefinition } from './icon.definition'

            export const ChipSchema = defineSchema([
                ['selected', 'unselected'],
                ['small', 'medium', 'large']
            ] as const)

            export const ChipTriggers = mapStateTriggers({
                'selected': '[selected]',
                'hovered': ':hover'
            })

            export const ChipDefinition = createStyleDefinition(ChipSchema)({
                'container-color': ['#f00', '#f55', '#a00', '#0f0', '#0a0', '#050'],
                'container-height': '32px',
                'chip-padding': {
                    selected: '8px 12px',
                    unselected: '4px 8px'
                },

                ...forwardTokens(IconDefinition, {
                    targetPrefix: '--mdc-icon',
                    name: 'icon',
                    tokens: {
                        'size': '18px',
                        'color': '#fff'
                    }
                })
            })
        `

        it('1. MDCSchemaTreeProvider renders 2D dimensions, states, and Cartesian combinations', async () => {
            const defMeta = analyzeDefinitionSource(fullDefSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCSchemaTreeProvider(metaMap)

            provider.setActiveDocument({ fileName: 'chip.definition.ts', getText: () => fullDefSource } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toBe('📐 ChipSchema')
            expect(roots[0].description).toContain('2D Multi-dimensional (6 combinations)')

            const schemaChildren = await provider.getChildren(roots[0])
            expect(schemaChildren.length).toBe(3) // Dim 1, Dim 2, Combinations group
            expect(schemaChildren[0].label).toBe('Dimension 1 (2 states)')
            expect(schemaChildren[1].label).toBe('Dimension 2 (3 states)')
            expect(schemaChildren[2].label).toBe('🔄 Valid Combinations (6)')

            const dim1States = await provider.getChildren(schemaChildren[0])
            expect(dim1States.map((s) => s.label)).toEqual(['selected', 'unselected'])

            const combinations = await provider.getChildren(schemaChildren[2])
            expect(combinations.length).toBe(6)
            expect(combinations.map((c) => c.label)).toContain('[selected, small]')
            expect(combinations.map((c) => c.label)).toContain('[unselected, large]')
        })

        it('2. MDCSelectorMappingTreeProvider renders host and self triggers with selectors', async () => {
            const defMeta = analyzeDefinitionSource(fullDefSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCSelectorMappingTreeProvider(metaMap)

            provider.setActiveDocument({ fileName: 'chip.definition.ts', getText: () => fullDefSource } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(2) // Host Triggers, Self Triggers

            const hostGroup = roots.find((r) => r.label.includes('Host Triggers'))!
            const selfGroup = roots.find((r) => r.label.includes('Self Triggers'))!
            expect(hostGroup).toBeDefined()
            expect(selfGroup).toBeDefined()

            const hostItems = await provider.getChildren(hostGroup)
            expect(hostItems.map((h) => h.label)).toContain('selected ➔ [selected]')

            const selfItems = await provider.getChildren(selfGroup)
            expect(selfItems.map((s) => s.label)).toContain('hovered ➔ :hover')
        })

        it('3. MDCComponentTokensTreeProvider renders declared tokens with tuple states, records, and statics', async () => {
            const defMeta = analyzeDefinitionSource(fullDefSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCComponentTokensTreeProvider(metaMap)

            provider.setActiveDocument({ fileName: 'chip.definition.ts', getText: () => fullDefSource } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toContain('🎨 Declared Tokens (3)')

            const tokenItems = await provider.getChildren(roots[0])
            expect(tokenItems.length).toBe(3)
            expect(tokenItems.map((t) => t.label)).toContain('var(--_container-color)')
            expect(tokenItems.map((t) => t.label)).toContain('var(--_container-height)')
            expect(tokenItems.map((t) => t.label)).toContain('var(--_chip-padding)')

            const tupleToken = tokenItems.find((t) => t.label === 'var(--_container-color)')!
            expect(tupleToken.description).toBe('[5 states]')

            const recordToken = tokenItems.find((t) => t.label === 'var(--_chip-padding)')!
            expect(recordToken.description).toContain('record')

            const staticToken = tokenItems.find((t) => t.label === 'var(--_container-height)')!
            expect(staticToken.description).toBe("['32px']")
        })

        it('4. MDCForwardedTokensTreeProvider renders forwarded child groups and bridged token mappings', async () => {
            const defMeta = analyzeDefinitionSource(fullDefSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCForwardedTokensTreeProvider(metaMap)

            provider.setActiveDocument({ fileName: 'chip.definition.ts', getText: () => fullDefSource } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toContain('IconDefinition')

            const childItems = await provider.getChildren(roots[0])
            expect(childItems.length).toBe(2)
            expect(childItems.map((c) => c.label)).toContain('icon-size ➔ size')
            expect(childItems.map((c) => c.label)).toContain('icon-color ➔ color')
        })

        it('5. MDCUnusedTokensTreeProvider audits unused tokens in active stylesheet', async () => {
            const defMeta = analyzeDefinitionSource(fullDefSource, 'chip.definition.ts')!
            const metaMap = new Map([[defMeta.name, defMeta]])
            const provider = new MDCUnusedTokensTreeProvider(metaMap)

            const partialStylesheet = `
                import { css } from 'lit'
                import { ChipDefinition } from './chip.definition'
                import { createStyleSheet } from '@sandlada/mdc/utils'

                export const ChipStyles = createStyleSheet(ChipDefinition, () => css\`
                    .container {
                        height: var(--_container-height);
                    }
                \`)
            `

            provider.setActiveDocument({ fileName: 'chip.style.ts', getText: () => partialStylesheet } as any)

            const roots = await provider.getChildren()
            expect(roots.length).toBe(1)
            expect(roots[0].label).toContain('⚠️ Unused Tokens')

            const unusedItems = await provider.getChildren(roots[0])
            expect(unusedItems.map((u) => u.label)).toContain('var(--_container-color)')
            expect(unusedItems.map((u) => u.label)).toContain('var(--_chip-padding)')
        })
    })
})
