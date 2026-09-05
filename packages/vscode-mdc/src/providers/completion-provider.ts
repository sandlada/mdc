/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { getContextScopedCompletions } from '../core/completion-engine'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import type { DefinitionMeta } from '../core/types'

export class MDCCompletionProvider implements vscode.CompletionItemProvider {
    private _definitionMetaMap: Map<string, DefinitionMeta>

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.CompletionItem[] {
        const text = document.getText()
        if (!text.includes('createStyleSheet')) return []

        const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, document.fileName)
        if (analyses.length === 0) return []

        const currentAnalysis = analyses[0]
        const defMeta = this._definitionMetaMap.get(currentAnalysis.definitionName) || null

        const linePrefix = document.lineAt(position).text.substring(0, position.character)
        const wordRange = document.getWordRangeAtPosition(position, /[\w-]+/)
        const currentWord = wordRange ? document.getText(wordRange) : ''

        const rawCompletions = getContextScopedCompletions(defMeta, currentWord || linePrefix)

        return rawCompletions.map((item) => {
            const vscodeItem = new vscode.CompletionItem(
                item.label,
                item.kind === 'variable'
                    ? vscode.CompletionItemKind.Variable
                    : vscode.CompletionItemKind.Property
            )
            vscodeItem.insertText = item.insertText
            vscodeItem.detail = item.detail
            vscodeItem.documentation = new vscode.MarkdownString(item.documentation || '')
            return vscodeItem
        })
    }
}
