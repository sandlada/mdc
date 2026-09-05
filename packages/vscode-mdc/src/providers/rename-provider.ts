/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { computeTokenRenameEdits } from '../core/rename-engine'
import type { DefinitionMeta } from '../core/types'

export class MDCRenameProvider implements vscode.RenameProvider {
    private _definitionMetaMap: Map<string, DefinitionMeta>

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public prepareRename(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.Range | { range: vscode.Range; placeholder: string } | null {
        const range = document.getWordRangeAtPosition(position, /--_[a-zA-Z0-9_-]+|'[\w-]+'|"[\w-]+"/ )
        if (!range) return null

        const text = document.getText(range).replace(/^--_/, '').replace(/['"]/g, '')
        return { range, placeholder: text }
    }

    public async provideRenameEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        newName: string,
        _token: vscode.CancellationToken
    ): Promise<vscode.WorkspaceEdit | null> {
        const range = document.getWordRangeAtPosition(position, /--_[a-zA-Z0-9_-]+|'[\w-]+'|"[\w-]+"/ )
        if (!range) return null

        const word = document.getText(range)

        // Find all *.style.ts and *.definition.ts files in workspace
        const styleUris = await vscode.workspace.findFiles('**/*.style.ts', '**/node_modules/**')
        const allStyleFiles: { filePath: string; sourceText: string }[] = []

        for (const uri of styleUris) {
            try {
                const doc = await vscode.workspace.openTextDocument(uri)
                allStyleFiles.push({ filePath: uri.fsPath, sourceText: doc.getText() })
            } catch {
                // ignore
            }
        }

        const editEntries = computeTokenRenameEdits(
            word,
            newName,
            document.fileName,
            document.getText(),
            this._definitionMetaMap,
            allStyleFiles
        )

        if (editEntries.length === 0) return null

        const workspaceEdit = new vscode.WorkspaceEdit()
        for (const entry of editEntries) {
            const fileUri = vscode.Uri.file(entry.filePath)
            const editRange = new vscode.Range(
                entry.range.startLine,
                entry.range.startCol,
                entry.range.endLine,
                entry.range.endCol
            )
            workspaceEdit.replace(fileUri, editRange, entry.newText)
        }

        return workspaceEdit
    }
}
