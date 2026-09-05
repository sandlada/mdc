/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { getHoverInfoForToken } from '../core/hover-engine'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import { formatFullInspectionReport } from '../core/codelens-formatter'
import type { DefinitionMeta } from '../core/types'

export class MDCHoverProvider implements vscode.HoverProvider {
    private _definitionMetaMap: Map<string, DefinitionMeta>

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | null> {
        const text = document.getText()
        if (!text.includes('createStyleSheet') && !text.includes('Styles')) return null

        const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, document.fileName)
        if (analyses.length === 0) return null

        // 1. Check if hovering over `XxxStyles` variable name
        const styleNameRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_$]+Styles/)
        if (styleNameRange) {
            const word = document.getText(styleNameRange)
            const matchedAnalysis = analyses.find((a) => a.styleVarName === word)
            if (matchedAnalysis) {
                const report = formatFullInspectionReport(matchedAnalysis, 0)
                return new vscode.Hover(new vscode.MarkdownString(report), styleNameRange)
            }
        }

        // 2. Check if hovering over CSS custom property or private token
        const tokenRange = document.getWordRangeAtPosition(position, /--[a-zA-Z0-9_-]+/)
        if (tokenRange) {
            const word = document.getText(tokenRange)
            const currentAnalysis = analyses[0]
            const defMeta = this._definitionMetaMap.get(currentAnalysis.definitionName) || null
            const hoverMarkdown = getHoverInfoForToken(defMeta, word)

            if (hoverMarkdown) {
                return new vscode.Hover(new vscode.MarkdownString(hoverMarkdown), tokenRange)
            }
        }

        return null
    }
}
