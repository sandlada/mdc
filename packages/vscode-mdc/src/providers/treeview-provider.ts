/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import { analyzeDefinitionSource } from '../core/definition-analyzer'
import type {
    DefinitionMeta,
    StylesheetAnalysis,
    SchemaMeta,
    TokenValueMeta,
    ForwardedChildMeta,
    StateTriggerMeta,
} from '../core/types'

export type MDCNodeType =
    | 'root'
    | 'category'
    | 'token'
    | 'child'
    | 'unused'
    | 'stat'
    | 'schema'
    | 'dimension'
    | 'state'
    | 'combination'
    | 'trigger'
    | 'prop'

export class MDCTreeItem extends vscode.TreeItem {
    public children?: MDCTreeItem[]

    constructor(
        public readonly label: string,
        public readonly nodeType: MDCNodeType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly details?: string,
        public readonly locationRange?: { line: number; col: number },
        children?: MDCTreeItem[]
    ) {
        super(label, collapsibleState)
        this.description = details
        this.contextValue = nodeType
        this.children = children

        if (nodeType === 'token') {
            this.iconPath = new vscode.ThemeIcon('symbol-color')
        } else if (nodeType === 'child') {
            this.iconPath = new vscode.ThemeIcon('references')
        } else if (nodeType === 'unused') {
            this.iconPath = new vscode.ThemeIcon('warning')
        } else if (nodeType === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder')
        } else if (nodeType === 'schema') {
            this.iconPath = new vscode.ThemeIcon('symbol-ruler')
        } else if (nodeType === 'dimension') {
            this.iconPath = new vscode.ThemeIcon('list-tree')
        } else if (nodeType === 'state') {
            this.iconPath = new vscode.ThemeIcon('tag')
        } else if (nodeType === 'combination') {
            this.iconPath = new vscode.ThemeIcon('symbol-misc')
        } else if (nodeType === 'trigger') {
            this.iconPath = new vscode.ThemeIcon('zap')
        } else if (nodeType === 'prop') {
            this.iconPath = new vscode.ThemeIcon('symbol-property')
        } else if (nodeType === 'stat') {
            this.iconPath = new vscode.ThemeIcon('dashboard')
            this.command = {
                title: 'Show Compiled CSS',
                command: 'mdc.showCompiledCss',
            }
        }

        if (locationRange) {
            this.command = {
                title: 'Jump to Location',
                command: 'mdc.jumpToToken',
                arguments: [locationRange.line, locationRange.col],
            }
        }
    }
}

// -----------------------------------------------------------------------------
// Base Helper for Shared State & Lifecycle
// -----------------------------------------------------------------------------
abstract class BaseMDCTreeProvider implements vscode.TreeDataProvider<MDCTreeItem>, vscode.Disposable {
    protected _onDidChangeTreeData = new vscode.EventEmitter<MDCTreeItem | undefined | null | void>()
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    protected _definitionMetaMap: Map<string, DefinitionMeta>
    protected _currentAnalysis: StylesheetAnalysis | null = null
    protected _currentDefMeta: DefinitionMeta | null = null

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public clear(): void {
        this._currentAnalysis = null
        this._currentDefMeta = null
        this.refresh()
    }

    public dispose(): void {
        this.clear()
        this._onDidChangeTreeData.dispose()
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>): void {
        this._definitionMetaMap = definitionMetaMap
        if (this._currentAnalysis) {
            this._currentDefMeta = this._definitionMetaMap.get(this._currentAnalysis.definitionName) || null
        }
        this.refresh()
    }

    public setActiveDocument(document: vscode.TextDocument | undefined): void {
        if (!document) {
            this.clear()
            return
        }

        const text = document.getText()
        const fileName = document.fileName

        if (fileName.endsWith('.definition.ts') || text.includes('createStyleDefinition')) {
            const meta = analyzeDefinitionSource(text, fileName)
            if (meta) {
                this._currentDefMeta = meta
                this._currentAnalysis = null
                this.refresh()
                return
            }
        }

        if (text.includes('createStyleSheet')) {
            const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, fileName)
            if (analyses.length > 0) {
                this._currentAnalysis = analyses[0]
                this._currentDefMeta = this._definitionMetaMap.get(this._currentAnalysis.definitionName) || null
                this.refresh()
                return
            }
        }

        this.clear()
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire()
    }

    public getTreeItem(element: MDCTreeItem): vscode.TreeItem {
        return element
    }

    public abstract getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]>
}

// -----------------------------------------------------------------------------
// 1. View 1: Schema Provider (mdcSchema)
// -----------------------------------------------------------------------------
export class MDCSchemaTreeProvider extends BaseMDCTreeProvider {
    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (element && element.children) {
            return Promise.resolve(element.children)
        }

        const defMeta = this._currentDefMeta
        if (!defMeta) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Component / Schema',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.definition.ts or *.style.ts file'
                ),
            ])
        }

        const schemas = Array.from(defMeta.schemas.values())
        if (schemas.length === 0) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No schemas defined',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    `Component: ${defMeta.name}`
                ),
            ])
        }

        const rootItems: MDCTreeItem[] = []

        for (const schema of schemas) {
            const loc = schema.range ? { line: schema.range.startLine, col: schema.range.startCol } : undefined
            const is2DText = schema.is2D ? '2D Multi-dimensional' : '1D Flat'
            const combCount = schema.validCombinations.length

            const dimensionNodes = schema.dimensions.map((dim, idx) => {
                const stateChildren = dim.map(
                    (s) => new MDCTreeItem(s, 'state', vscode.TreeItemCollapsibleState.None)
                )
                return new MDCTreeItem(
                    `Dimension ${idx + 1} (${dim.length} states)`,
                    'dimension',
                    vscode.TreeItemCollapsibleState.Expanded,
                    dim.join(', '),
                    undefined,
                    stateChildren
                )
            })

            const combinationNodes = schema.validCombinations.map(
                (combo) =>
                    new MDCTreeItem(
                        `[${combo.join(', ')}]`,
                        'combination',
                        vscode.TreeItemCollapsibleState.None
                    )
            )

            const combinationsGroup = new MDCTreeItem(
                `🔄 Valid Combinations (${combCount})`,
                'category',
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                undefined,
                combinationNodes
            )

            const schemaChildren = [...dimensionNodes, combinationsGroup]

            rootItems.push(
                new MDCTreeItem(
                    `📐 ${schema.name}`,
                    'schema',
                    vscode.TreeItemCollapsibleState.Expanded,
                    `${is2DText} (${combCount} combinations)`,
                    loc,
                    schemaChildren
                )
            )
        }

        return Promise.resolve(rootItems)
    }
}

// -----------------------------------------------------------------------------
// 2. View 2: Selector Mapping Provider (mdcSelectorMapping)
// -----------------------------------------------------------------------------
export class MDCSelectorMappingTreeProvider extends BaseMDCTreeProvider {
    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (element && element.children) {
            return Promise.resolve(element.children)
        }

        const defMeta = this._currentDefMeta
        if (!defMeta) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Component open',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.definition.ts or *.style.ts file'
                ),
            ])
        }

        const triggers = Array.from(defMeta.stateTriggers.values())
        if (triggers.length === 0) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No state triggers mapped',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    `Component: ${defMeta.name}`
                ),
            ])
        }

        const hostTriggers = triggers.filter((t) => t.target === 'host')
        const selfTriggers = triggers.filter((t) => t.target === 'self')

        const createTriggerItem = (t: StateTriggerMeta) => {
            const loc = t.range ? { line: t.range.startLine, col: t.range.startCol } : undefined
            const sourceText = t.source ? `(${t.source})` : ''
            return new MDCTreeItem(
                `${t.state} ➔ ${t.selector}`,
                'trigger',
                vscode.TreeItemCollapsibleState.None,
                `${t.target.toUpperCase()} ${sourceText}`.trim(),
                loc
            )
        }

        const rootItems: MDCTreeItem[] = [
            new MDCTreeItem(
                `🏢 Host Triggers (${hostTriggers.length})`,
                'category',
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                undefined,
                hostTriggers.map(createTriggerItem)
            ),
            new MDCTreeItem(
                `🎯 Self Triggers (${selfTriggers.length})`,
                'category',
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                undefined,
                selfTriggers.map(createTriggerItem)
            ),
        ]

        return Promise.resolve(rootItems)
    }
}

// -----------------------------------------------------------------------------
// 3. View 3: Component Tokens Provider (mdcComponentTokens)
// -----------------------------------------------------------------------------
export class MDCComponentTokensTreeProvider extends BaseMDCTreeProvider {
    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (element && element.children) {
            return Promise.resolve(element.children)
        }

        const defMeta = this._currentDefMeta
        if (!defMeta) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Component open',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.definition.ts or *.style.ts file'
                ),
            ])
        }

        const tokens = Array.from(defMeta.ownTokens.values()).filter((t) => !t.isForwarded)
        if (tokens.length === 0) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No own tokens declared',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    `Component: ${defMeta.name}`
                ),
            ])
        }

        const tokenItems = tokens.map((t) => {
            const loc = t.range ? { line: t.range.startLine, col: t.range.startCol } : undefined
            let stateDetails = 'static'
            let children: MDCTreeItem[] | undefined

            if (t.isTuple) {
                stateDetails = `${t.states.length} states`
                if (t.stateMap) {
                    children = Object.entries(t.stateMap).map(
                        ([st, val]) =>
                            new MDCTreeItem(
                                `${st}: ${val}`,
                                'prop',
                                vscode.TreeItemCollapsibleState.None
                            )
                    )
                }
            } else if (t.isRecord && t.recordValues) {
                stateDetails = `record (${Object.keys(t.recordValues).length})`
                children = Object.entries(t.recordValues).map(
                    ([st, val]) =>
                        new MDCTreeItem(
                            `${st}: ${val}`,
                            'prop',
                            vscode.TreeItemCollapsibleState.None
                        )
                )
            } else if (t.rawValue) {
                stateDetails = t.rawValue
            }

            return new MDCTreeItem(
                `var(--_${t.name})`,
                'token',
                children && children.length > 0
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None,
                `[${stateDetails}]`,
                loc,
                children
            )
        })

        return Promise.resolve([
            new MDCTreeItem(
                `🎨 Declared Tokens (${tokens.length})`,
                'category',
                vscode.TreeItemCollapsibleState.Expanded,
                `Component: ${defMeta.name}`,
                undefined,
                tokenItems
            ),
        ])
    }
}

// -----------------------------------------------------------------------------
// 4. View 4: Forwarded Tokens Provider (mdcForwardedTokens)
// -----------------------------------------------------------------------------
export class MDCForwardedTokensTreeProvider extends BaseMDCTreeProvider {
    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (element && element.children) {
            return Promise.resolve(element.children)
        }

        const defMeta = this._currentDefMeta
        if (!defMeta) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Component open',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.definition.ts or *.style.ts file'
                ),
            ])
        }

        const forwardedList = Array.from(defMeta.forwarded.values())
        if (forwardedList.length === 0) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No forwarded tokens in active component',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    `Component: ${defMeta.name}`
                ),
            ])
        }

        const groupNodes = forwardedList.map((fwd) => {
            const loc = fwd.range ? { line: fwd.range.startLine, col: fwd.range.startCol } : undefined
            const childTokenKeys = Object.keys(fwd.tokenMap || fwd.tokens || {})

            const childItems = childTokenKeys.map((tokenKey) => {
                const parentKey = fwd.tokenMap?.[tokenKey] || `${fwd.namespace || fwd.childPrefix}-${tokenKey}`
                const tokenObj = fwd.tokens?.[tokenKey]
                const valDetail = tokenObj?.rawValue ? `(${tokenObj.rawValue})` : ''
                return new MDCTreeItem(
                    `${parentKey} ➔ ${tokenKey}`,
                    'child',
                    vscode.TreeItemCollapsibleState.None,
                    `${fwd.targetDefinitionName || fwd.childPrefix} ${valDetail}`.trim(),
                    loc
                )
            })

            return new MDCTreeItem(
                `🔗 ${fwd.targetDefinitionName || 'Child'} (${childItems.length} tokens)`,
                'category',
                vscode.TreeItemCollapsibleState.Expanded,
                `Prefix: ${fwd.targetPrefix || fwd.childPrefix}`,
                loc,
                childItems
            )
        })

        return Promise.resolve(groupNodes)
    }
}

// -----------------------------------------------------------------------------
// 5. View 5: Unused Tokens Provider (mdcUnusedTokens)
// -----------------------------------------------------------------------------
export class MDCUnusedTokensTreeProvider extends BaseMDCTreeProvider {
    public getChildren(element?: MDCTreeItem): Thenable<MDCTreeItem[]> {
        if (element && element.children) {
            return Promise.resolve(element.children)
        }

        const analysis = this._currentAnalysis
        if (!analysis) {
            return Promise.resolve([
                new MDCTreeItem(
                    'No active MDC Stylesheet open',
                    'root',
                    vscode.TreeItemCollapsibleState.None,
                    'Open a *.style.ts file to audit unused tokens'
                ),
            ])
        }

        if (analysis.unusedTokens.length === 0) {
            return Promise.resolve([
                new MDCTreeItem(
                    '🎉 100% Token Coverage',
                    'stat',
                    vscode.TreeItemCollapsibleState.None,
                    `All tokens in ${analysis.definitionName} are referenced in stylesheet`
                ),
            ])
        }

        const unusedNodes = analysis.unusedTokens.map(
            (u) =>
                new MDCTreeItem(
                    u,
                    'unused',
                    vscode.TreeItemCollapsibleState.None,
                    `Declared in ${analysis.definitionName}, 0 references`
                )
        )

        return Promise.resolve([
            new MDCTreeItem(
                `⚠️ Unused Tokens (${analysis.unusedTokens.length})`,
                'category',
                vscode.TreeItemCollapsibleState.Expanded,
                `Coverage: ${analysis.coveragePercent}%`,
                undefined,
                unusedNodes
            ),
        ])
    }
}

// -----------------------------------------------------------------------------
// 6. Unified Multi-Category TreeView Provider (mdcExplorer - Backward Compatibility)
// -----------------------------------------------------------------------------
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

