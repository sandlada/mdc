/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import {
    formatStyleExportCodeLens,
    formatCreateStyleSheetCodeLens,
    formatTokenRecordCodeLens,
    formatOverrideCodeLens,
    formatDefinitionCodeLens,
} from '../core/codelens-formatter'
import type { DefinitionMeta } from '../core/types'

export class MDCCodeLensProvider implements vscode.CodeLensProvider {
    private _definitionMetaMap: Map<string, DefinitionMeta>

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public async provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): Promise<vscode.CodeLens[]> {
        const text = document.getText()
        const codeLenses: vscode.CodeLens[] = []

        // 1. Definition File CodeLens (*.definition.ts)
        if (text.includes('createStyleDefinition')) {
            const defRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*createStyleDefinition/g
            let dMatch: RegExpExecArray | null
            while ((dMatch = defRegex.exec(text)) !== null) {
                const defName = dMatch[1]
                const textBefore = text.substring(0, dMatch.index)
                const line = textBefore.split('\n').length - 1
                const meta = this._definitionMetaMap.get(defName)
                const refCount = await this.countReferences(document, line)
                const ownCount = meta?.ownTokens.size ?? 0
                const fwdCount = meta?.forwarded.size ?? 0

                const lenses = formatDefinitionCodeLens(defName, ownCount, fwdCount, refCount)
                const range = new vscode.Range(line, 0, line, 0)
                for (const item of lenses) {
                    const codeLens = new vscode.CodeLens(range)
                    codeLens.command = {
                        title: item.title,
                        command: item.command?.command || '',
                        arguments: item.command?.arguments || [document.uri, new vscode.Position(line, 0)],
                    }
                    codeLenses.push(codeLens)
                }
            }
        }

        // 2. Stylesheet File CodeLens (*.style.ts / *.styles.ts)
        if (text.includes('createStyleSheet') || text.includes('Styles') || text.includes('styles')) {
            const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, document.fileName)

            for (const analysis of analyses) {
                // Line 1: Style Export Declaration Line (e.g. `export const NavigationTabStyles = [`)
                const refCount = await this.countReferences(document, analysis.declarationLine)
                const exportLenses = formatStyleExportCodeLens(analysis, refCount)
                const exportRange = new vscode.Range(analysis.declarationLine, 0, analysis.declarationLine, 0)

                for (const item of exportLenses) {
                    const codeLens = new vscode.CodeLens(exportRange)
                    codeLens.command = {
                        title: item.title,
                        command: item.command?.command || '',
                        arguments: item.command?.arguments || [document.uri, new vscode.Position(analysis.declarationLine, 0)],
                    }
                    codeLenses.push(codeLens)
                }

                // Line 2: createStyleSheet Line (e.g. `createStyleSheet(allNavigationTabDefinitions, () => css`...`)`)
                const sheetLine = analysis.createStyleSheetLine ?? analysis.declarationLine
                const sheetLenses = formatCreateStyleSheetCodeLens(analysis)

                if (sheetLine !== analysis.declarationLine) {
                    const sheetRange = new vscode.Range(sheetLine, 0, sheetLine, 0)
                    for (const item of sheetLenses) {
                        const codeLens = new vscode.CodeLens(sheetRange)
                        codeLens.command = {
                            title: item.title,
                            command: item.command?.command || '',
                            arguments: item.command?.arguments || [analysis, 'all'],
                        }
                        codeLenses.push(codeLens)
                    }
                } else {
                    // When createStyleSheet is on the exact same line as export declaration
                    for (const item of sheetLenses) {
                        const codeLens = new vscode.CodeLens(exportRange)
                        codeLens.command = {
                            title: item.title,
                            command: item.command?.command || '',
                            arguments: item.command?.arguments || [analysis, 'all'],
                        }
                        codeLenses.push(codeLens)
                    }
                }

                // Line 3+: Token Record Declarations (`defineTokenRefsRecord` / `defineComponentTokenRefs`)
                if (analysis.tokenRecords) {
                    for (const rec of analysis.tokenRecords) {
                        if (rec.line !== analysis.declarationLine && rec.line !== sheetLine) {
                            const recRange = new vscode.Range(rec.line, 0, rec.line, 0)
                            const item = formatTokenRecordCodeLens(rec.definitionName, rec.prefix)
                            const codeLens = new vscode.CodeLens(recRange)
                            codeLens.command = {
                                title: item.title,
                                command: item.command?.command || 'mdc.inspectTokens',
                                arguments: [analysis, 'all'],
                            }
                            codeLenses.push(codeLens)
                        }
                    }
                }

                // Line 4+: Override Declarations (`overrideStyleSheet` / `overrideComponentTokens`)
                if (analysis.overrides) {
                    for (const ov of analysis.overrides) {
                        if (ov.line !== analysis.declarationLine && ov.line !== sheetLine) {
                            const ovRange = new vscode.Range(ov.line, 0, ov.line, 0)
                            const item = formatOverrideCodeLens(ov.targetName, ov.prefix)
                            const codeLens = new vscode.CodeLens(ovRange)
                            codeLens.command = {
                                title: item.title,
                                command: item.command?.command || 'mdc.inspectTokens',
                                arguments: [analysis, 'child'],
                            }
                            codeLenses.push(codeLens)
                        }
                    }
                }
            }
        }

        return codeLenses
    }

    private async countReferences(document: vscode.TextDocument, line: number): Promise<number> {
        try {
            const pos = new vscode.Position(line, 13) // approximate position after `export const `
            const locations = await vscode.commands.executeCommand<vscode.Location[]>(
                'vscode.executeReferenceProvider',
                document.uri,
                pos
            )
            return locations ? locations.length : 1
        } catch {
            return 1
        }
    }
}
