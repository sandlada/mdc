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
        constructor(public label: string, public collapsibleState?: any) {}
    }
    class MockThemeIcon {
        constructor(public id: string) {}
    }
    class MockEventEmitter {
        public event = vi.fn()
        public fire = vi.fn()
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

import { MDCTreeViewProvider } from '../src/providers/treeview-provider'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import type { DefinitionMeta } from '../src/core/types'

describe('MDCTreeViewProvider', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'container-padding': '8px',
        })
    `

    it('returns empty placeholder tree item when no active stylesheet is open', async () => {
        const metaMap = new Map<string, DefinitionMeta>()
        const provider = new MDCTreeViewProvider(metaMap)

        const rootItems = await provider.getChildren()
        expect(rootItems.length).toBe(1)
        expect(rootItems[0].label).toBe('No active MDC Stylesheet open')
        expect(rootItems[0].description).toBe('Open a *.style.ts file to inspect tokens')
    })

    it('builds category hierarchy when an active MDC stylesheet is set', async () => {
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

        // 1. Stats node
        expect(rootCategories[0].label).toBe('📦 ButtonDefinition')
        expect(rootCategories[0].description).toContain('Coverage: 2/3')

        // 2. Private tokens category
        expect(rootCategories[1].label).toContain('🎨 Private Tokens (2)')
        const privateTokens = await provider.getChildren(rootCategories[1])
        expect(privateTokens.length).toBe(2)
        expect(privateTokens.map((p) => p.label)).toContain('var(--_container-color)')
        expect(privateTokens.map((p) => p.label)).toContain('var(--_container-height)')

        // 3. Unused tokens category
        expect(rootCategories[3].label).toContain('⚠️ Unused Tokens (1)')
        const unusedTokens = await provider.getChildren(rootCategories[3])
        expect(unusedTokens.length).toBe(1)
        expect(unusedTokens[0].label).toBe('var(--_container-padding)')
    })
})
