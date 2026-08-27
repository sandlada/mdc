/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import type { DefinitionMeta, StylesheetAnalysis } from '../core/types'

export type MDCNodeType = 'root' | 'category' | 'token' | 'child' | 'unused' | 'stat'

export class MDCTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly nodeType: MDCNodeType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly details?: string,
        public readonly locationRange?: { line: number; col: number }
    ) {
        super(label, collapsibleState)
        this.description = details

        this.contextValue = nodeType

        if (nodeType === 'token') {
            this.iconPath = new vscode.ThemeIcon('symbol-color')
        } else if (nodeType === 'child') {
            this.iconPath = new vscode.ThemeIcon('references')
        } else if (nodeType === 'unused') {
            this.iconPath = new vscode.ThemeIcon('warning')
        } else if (nodeType === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder')
        } else if (nodeType === 'stat') {
            this.iconPath = new vscode.ThemeIcon('dashboard')
            this.command = {
                title: 'Show Compiled CSS',
                command: 'mdc.showCompiledCss',
            }
        }

        if (locationRange) {
            this.command = {
                title: 'Jump to Token',
                command: 'mdc.jumpToToken',
                arguments: [locationRange.line, locationRange.col],
            }
        }
    }
}

export class MDCTreeViewProvider implements vscode.TreeDataProvider<MDCTreeItem>, vscode.Disposable {
    private _onDidChangeTreeData = new vscode.EventEmitter<MDCTreeItem | undefined | null | void>()
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    private _definitionMetaMap: Map<string, DefinitionMeta>
    private _currentAnalysis: StylesheetAnalysis | null = null

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public clear(): void {
        this._currentAnalysis = null
        this.refresh()
    }

    public dispose(): void {
        this.clear()
        this._onDidChangeTreeData.dispose()
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
        this.refresh()
    }

    public setActiveDocument(document: vscode.TextDocument | undefined) {
        if (!document) {
            this._currentAnalysis = null
            this.refresh()
            return
        }

        const text = document.getText()
        if (!text.includes('createStyleSheet')) {
            this._currentAnalysis = null
            this.refresh()
            return
        }

        const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, document.fileName)
        this._currentAnalysis = analyses.length > 0 ? analyses[0] : null
        this.refresh()
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire()
    }

    public getTreeItem(element: MDCTreeItem): vscode.TreeItem {
        return element
    }

    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (!this._currentAnalysis) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Stylesheet open',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.style.ts file to inspect tokens'
                ),
            ])
        }

        const analysis = this._currentAnalysis

        if (!element) {
            // Root categories
            const usedCount = analysis.usedPrivateTokens.length
            const totalCount = analysis.totalDefinitionTokens || usedCount
            const percent = analysis.coveragePercent

            return Promise.resolve([
                new MDCTreeItem(
                    `📦 ${analysis.definitionName}`,
                    'stat',
                    vscode.TreeItemCollapsibleState.None,
                    `Coverage: ${usedCount}/${totalCount} (${percent}%)`
                ),
                new MDCTreeItem(
                    `🎨 Private Tokens (${analysis.usedPrivateTokens.length})`,
                    'category',
                    vscode.TreeItemCollapsibleState.Expanded
                ),
                new MDCTreeItem(
                    `🔗 Forwarded Children (${analysis.usedChildBridgeTokens.length})`,
                    'category',
                    vscode.TreeItemCollapsibleState.Expanded
                ),
                new MDCTreeItem(
                    `⚠️ Unused Tokens (${analysis.unusedTokens.length})`,
                    'category',
                    analysis.unusedTokens.length > 0
                        ? vscode.TreeItemCollapsibleState.Expanded
                        : vscode.TreeItemCollapsibleState.Collapsed
                ),
            ])
        }

        if (element.label.startsWith('🎨 Private Tokens')) {
            return Promise.resolve(
                analysis.usedPrivateTokens.map((t) => {
                    const statesText = t.isTuple ? `${t.states.length} states` : 'static'
                    const loc = t.locations?.[0]
                    return new MDCTreeItem(
                        `var(${t.token})`,
                        'token',
                        vscode.TreeItemCollapsibleState.None,
                        `[${statesText}]`,
                        loc ? { line: loc.range.startLine, col: loc.range.startCol } : undefined
                    )
                })
            )
        }

        if (element.label.startsWith('🔗 Forwarded Children')) {
            return Promise.resolve(
                analysis.usedChildBridgeTokens.map((c) => {
                    const loc = c.locations?.[0]
                    return new MDCTreeItem(
                        c.token,
                        'child',
                        vscode.TreeItemCollapsibleState.None,
                        `➔ ${c.targetName}`,
                        loc ? { line: loc.range.startLine, col: loc.range.startCol } : undefined
                    )
                })
            )
        }

        if (element.label.startsWith('⚠️ Unused Tokens')) {
            return Promise.resolve(
                analysis.unusedTokens.map(
                    (u) =>
                        new MDCTreeItem(
                            u,
                            'unused',
                            vscode.TreeItemCollapsibleState.None,
                            `Defined in ${analysis.definitionName}`
                        )
                )
            )
        }

        return Promise.resolve([])
    }
}
