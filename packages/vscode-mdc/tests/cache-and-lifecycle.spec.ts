/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockOpenTextDocument } = vi.hoisted(() => {
    return {
        mockOpenTextDocument: vi.fn(),
    }
})

vi.mock('vscode', () => {
    class MockEventEmitter {
        public event = vi.fn()
        public fire = vi.fn()
        public dispose = vi.fn()
    }

    class MockUri {
        constructor(
            public readonly scheme: string,
            public readonly path: string,
            public readonly query: string = ''
        ) {}

        public toString(): string {
            return `${this.scheme}://${this.path}${this.query ? '?' + this.query : ''}`
        }

        public static from(components: { scheme: string; path: string; query?: string }) {
            return new MockUri(components.scheme, components.path, components.query || '')
        }

        public static parse(val: string) {
            const match = /([^:]+):\/\/([^?]+)(?:\?(.*))?/.exec(val)
            if (match) {
                return new MockUri(match[1], match[2], match[3] || '')
            }
            return new MockUri('file', val)
        }
    }

    class MockTreeItem {
        public description?: string
        public iconPath?: any
        public command?: any
        constructor(public label: string, public collapsibleState?: any) {}
    }
    class MockThemeIcon {
        constructor(public id: string) {}
    }

    return {
        EventEmitter: MockEventEmitter,
        Uri: MockUri,
        TreeItem: MockTreeItem,
        TreeItemCollapsibleState: {
            None: 0,
            Collapsed: 1,
            Expanded: 2,
        },
        ThemeIcon: MockThemeIcon,
        workspace: {
            openTextDocument: mockOpenTextDocument,
        },
        window: {
            activeTextEditor: undefined,
        },
    }
})

import * as vscode from 'vscode'
import { MDCCompiledCssProvider } from '../src/providers/compiled-css-provider'
import { MDCTreeViewProvider } from '../src/providers/treeview-provider'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Compiled CSS Cache & Lifecycle', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
        })
    `

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

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('caches compilation output on identical document version and skips re-compilation', async () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
        const provider = new MDCCompiledCssProvider(metaMap)

        const sourceUri = vscode.Uri.parse('file:///projects/button.style.ts')
        const previewUri = MDCCompiledCssProvider.getPreviewUri(sourceUri)

        const mockDoc = {
            version: 1,
            getText: vi.fn().mockReturnValue(sampleStyleSource),
            fileName: '/projects/button.style.ts',
        }
        mockOpenTextDocument.mockResolvedValue(mockDoc)

        // 1. First call - compiles and populates cache
        const res1 = await provider.provideTextDocumentContent(previewUri)
        expect(res1).toContain('MDC Compiled Stylesheet Preview (Live)')
        expect(provider.getCacheSize()).toBe(1)
        expect(mockDoc.getText).toHaveBeenCalledTimes(1)

        // 2. Second call with same version - should return from cache without re-reading
        const res2 = await provider.provideTextDocumentContent(previewUri)
        expect(res2).toBe(res1)
        expect(provider.getCacheSize()).toBe(1)
        expect(mockDoc.getText).toHaveBeenCalledTimes(2) // openTextDocument returns cached doc
    })

    it('invalidates cache when document version changes', async () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
        const provider = new MDCCompiledCssProvider(metaMap)

        const sourceUri = vscode.Uri.parse('file:///projects/button.style.ts')
        const previewUri = MDCCompiledCssProvider.getPreviewUri(sourceUri)

        const mockDoc = {
            version: 1,
            getText: vi.fn().mockReturnValue(sampleStyleSource),
            fileName: '/projects/button.style.ts',
        }
        mockOpenTextDocument.mockResolvedValue(mockDoc)

        await provider.provideTextDocumentContent(previewUri)

        // Change document version
        mockDoc.version = 2
        mockDoc.getText.mockReturnValue(sampleStyleSource + '\n/* edited */')

        const res2 = await provider.provideTextDocumentContent(previewUri)
        expect(res2).toContain('MDC Compiled Stylesheet Preview (Live)')
    })

    it('clears specific document cache on document close', async () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
        const provider = new MDCCompiledCssProvider(metaMap)

        const sourceUri = vscode.Uri.parse('file:///projects/button.style.ts')
        const previewUri = MDCCompiledCssProvider.getPreviewUri(sourceUri)

        mockOpenTextDocument.mockResolvedValue({
            version: 1,
            getText: () => sampleStyleSource,
            fileName: '/projects/button.style.ts',
        })

        await provider.provideTextDocumentContent(previewUri)
        expect(provider.getCacheSize()).toBe(1)

        // Clear sourceUri cache
        provider.clear(sourceUri)
        expect(provider.getCacheSize()).toBe(0)
    })

    it('disposes resources and event emitters properly', () => {
        const metaMap = new Map<string, DefinitionMeta>()
        const cssProvider = new MDCCompiledCssProvider(metaMap)
        const treeProvider = new MDCTreeViewProvider(metaMap)

        cssProvider.dispose()
        treeProvider.dispose()

        expect(cssProvider.getCacheSize()).toBe(0)
    })
})
