/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import type { DefinitionMeta } from '../core/types'

export class MDCDefinitionProvider implements vscode.DefinitionProvider {
    private _definitionMetaMap: Map<string, DefinitionMeta>

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public async provideDefinition(
        _document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Definition | null> {
        const range = _document.getWordRangeAtPosition(position, /--[a-zA-Z0-9_-]+/)
        if (!range) return null

        const word = _document.getText(range)

        for (const [, meta] of this._definitionMetaMap) {
            if (!meta.filePath) continue

            // 1. If private token: look up in ownTokens with precise line & column
            const cleanKey = word.replace(/^--_/, '')
            if (meta.ownTokens.has(cleanKey)) {
                const tokenMeta = meta.ownTokens.get(cleanKey)!
                const startLine = tokenMeta.range?.startLine ?? 0
                const startCol = tokenMeta.range?.startCol ?? 0

                return new vscode.Location(
                    vscode.Uri.file(meta.filePath),
                    new vscode.Position(startLine, startCol)
                )
            }

            // 2. If forwarded token: look up in forwarded child targets with precise range
            for (const [, fwd] of meta.forwarded) {
                if (word.startsWith(fwd.targetPrefix)) {
                    const targetMeta = this._definitionMetaMap.get(fwd.targetDefinitionName)
                    if (targetMeta?.filePath) {
                        const tokenSuffix = word.replace(fwd.targetPrefix + '-', '')
                        const cleanSuffix = tokenSuffix.replace(/^(enabled|hovered|pressed|focused|disabled)-/, '')
                        const childTokenMeta = targetMeta.ownTokens.get(cleanSuffix)

                        const startLine = childTokenMeta?.range?.startLine ?? fwd.range?.startLine ?? 0
                        const startCol = childTokenMeta?.range?.startCol ?? fwd.range?.startCol ?? 0

                        return new vscode.Location(
                            vscode.Uri.file(targetMeta.filePath),
                            new vscode.Position(startLine, startCol)
                        )
                    }
                }
            }
        }

        return null
    }
}
