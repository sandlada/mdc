/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import type { MDCDiagnosticProvider } from './diagnostic-provider'

export class MDCCodeActionProvider implements vscode.CodeActionProvider {
    private _diagnosticProvider: MDCDiagnosticProvider

    constructor(diagnosticProvider: MDCDiagnosticProvider) {
        this._diagnosticProvider = diagnosticProvider
    }

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        _context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        const issues = this._diagnosticProvider.getIssuesForDocument(document.uri)
        const actions: vscode.CodeAction[] = []

        for (const issue of issues) {
            if (!issue.quickFix) continue

            const issueRange = new vscode.Range(
                issue.range.startLine,
                issue.range.startCol,
                issue.range.endLine,
                issue.range.endCol
            )

            // Check if cursor intersects the issue range
            if (issueRange.intersection(range) || issueRange.contains(range.start)) {
                const action = new vscode.CodeAction(
                    issue.quickFix.title,
                    vscode.CodeActionKind.QuickFix
                )
                action.isPreferred = true

                const edit = new vscode.WorkspaceEdit()
                const fixRange = new vscode.Range(
                    issue.quickFix.range.startLine,
                    issue.quickFix.range.startCol,
                    issue.quickFix.range.endLine,
                    issue.quickFix.range.endCol
                )
                edit.replace(document.uri, fixRange, issue.quickFix.replacement)
                action.edit = edit

                actions.push(action)
            }
        }

        return actions
    }
}
