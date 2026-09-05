/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { analyzeStylesheetSource } from '../core/stylesheet-analyzer'
import { getStylesheetDiagnostics } from '../core/diagnostic-engine'
import type { DefinitionMeta, DiagnosticIssue } from '../core/types'

export class MDCDiagnosticProvider {
    private _collection: vscode.DiagnosticCollection
    private _definitionMetaMap: Map<string, DefinitionMeta>
    private _issuesByDocUri = new Map<string, DiagnosticIssue[]>()

    constructor(
        collection: vscode.DiagnosticCollection,
        definitionMetaMap: Map<string, DefinitionMeta>
    ) {
        this._collection = collection
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public getIssuesForDocument(uri: vscode.Uri): DiagnosticIssue[] {
        return this._issuesByDocUri.get(uri.toString()) || []
    }

    public validateDocument(document: vscode.TextDocument) {
        if (document.languageId !== 'typescript' && document.languageId !== 'javascript') {
            return
        }

        const text = document.getText()
        if (!text.includes('createStyleSheet')) {
            this._collection.delete(document.uri)
            this._issuesByDocUri.delete(document.uri.toString())
            return
        }

        const analyses = analyzeStylesheetSource(text, this._definitionMetaMap, document.fileName)
        if (analyses.length === 0) {
            this._collection.delete(document.uri)
            this._issuesByDocUri.delete(document.uri.toString())
            return
        }

        const analysis = analyses[0]
        const defMeta = this._definitionMetaMap.get(analysis.definitionName) || null
        const issues = getStylesheetDiagnostics(analysis, defMeta)

        this._issuesByDocUri.set(document.uri.toString(), issues)

        const vscodeDiagnostics: vscode.Diagnostic[] = issues.map((issue) => {
            const range = new vscode.Range(
                issue.range.startLine,
                issue.range.startCol,
                issue.range.endLine,
                issue.range.endCol
            )
            const severity =
                issue.severity === 'error'
                    ? vscode.DiagnosticSeverity.Error
                    : issue.severity === 'warning'
                    ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Information

            const diag = new vscode.Diagnostic(range, issue.message, severity)
            diag.code = issue.code
            diag.source = 'MDC Linter'
            return diag
        })

        this._collection.set(document.uri, vscodeDiagnostics)
    }

    public clear(uri: vscode.Uri) {
        this._collection.delete(uri)
        this._issuesByDocUri.delete(uri.toString())
    }
}
