/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { analyzeDefinitionSource } from './core/definition-analyzer'
import { MDCCodeLensProvider } from './providers/codelens-provider'
import { MDCCompletionProvider } from './providers/completion-provider'
import { MDCHoverProvider } from './providers/hover-provider'
import { MDCDefinitionProvider } from './providers/definition-provider'
import { MDCDiagnosticProvider } from './providers/diagnostic-provider'
import { MDCCodeActionProvider } from './providers/code-action-provider'
import { MDCRenameProvider } from './providers/rename-provider'
import { MDCTreeViewProvider } from './providers/treeview-provider'
import { MDCCompiledCssProvider } from './providers/compiled-css-provider'
import type { DefinitionMeta, StylesheetAnalysis } from './core/types'

const definitionMetaMap = new Map<string, DefinitionMeta>()
const debounceTimers = new Map<string, NodeJS.Timeout>()
const DEBOUNCE_DELAY_MS = 500

function isStylesheetDocument(doc: vscode.TextDocument): boolean {
    const path = doc.fileName
    if (path.endsWith('.style.ts') || path.endsWith('.styles.ts')) return true
    if (doc.languageId === 'typescript' || doc.languageId === 'javascript') {
        const text = doc.getText()
        return text.includes('createStyleSheet') || text.includes('Styles')
    }
    return false
}

export function activate(context: vscode.ExtensionContext) {
    // 1. Register Language Selectors
    const selector: vscode.DocumentSelector = [
        { language: 'typescript', scheme: 'file' },
        { language: 'javascript', scheme: 'file' },
        { language: 'typescriptreact', scheme: 'file' },
        { language: 'javascriptreact', scheme: 'file' },
    ]

    // 2. Initialize Providers
    const codeLensProvider = new MDCCodeLensProvider(definitionMetaMap)
    const completionProvider = new MDCCompletionProvider(definitionMetaMap)
    const hoverProvider = new MDCHoverProvider(definitionMetaMap)
    const definitionProvider = new MDCDefinitionProvider(definitionMetaMap)
    const renameProvider = new MDCRenameProvider(definitionMetaMap)
    const compiledCssProvider = new MDCCompiledCssProvider(definitionMetaMap)

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('mdc')
    const diagnosticProvider = new MDCDiagnosticProvider(diagnosticCollection, definitionMetaMap)
    const codeActionProvider = new MDCCodeActionProvider(diagnosticProvider)

    const treeViewProvider = new MDCTreeViewProvider(definitionMetaMap)

    // 3. Register Tree View, Document Content Provider, Diagnostics & Language Features immediately (Synchronous)
    context.subscriptions.push(
        diagnosticCollection,
        compiledCssProvider,
        treeViewProvider,
        vscode.workspace.registerTextDocumentContentProvider(
            MDCCompiledCssProvider.scheme,
            compiledCssProvider
        ),
        vscode.window.registerTreeDataProvider('mdcExplorer', treeViewProvider),
        vscode.languages.registerCodeLensProvider(selector, codeLensProvider),
        vscode.languages.registerCompletionItemProvider(
            selector,
            completionProvider,
            '-',
            '_',
            '('
        ),
        vscode.languages.registerHoverProvider(selector, hoverProvider),
        vscode.languages.registerDefinitionProvider(selector, definitionProvider),
        vscode.languages.registerRenameProvider(selector, renameProvider),
        vscode.languages.registerCodeActionsProvider(selector, codeActionProvider, {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
        })
    )

    // 4. Register Watcher for *.definition.ts
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.definition.ts')
    watcher.onDidChange((uri) => refreshFile(uri))
    watcher.onDidCreate((uri) => refreshFile(uri))
    watcher.onDidDelete((uri) => {
        for (const [key, meta] of definitionMetaMap) {
            if (meta.filePath === uri.fsPath) {
                definitionMetaMap.delete(key)
            }
        }
        notifyProviders()
    })
    context.subscriptions.push(watcher)

    // 5. Hook Document Events for Diagnostics, TreeView & Live Preview
    if (vscode.window.activeTextEditor && isStylesheetDocument(vscode.window.activeTextEditor.document)) {
        diagnosticProvider.validateDocument(vscode.window.activeTextEditor.document)
        treeViewProvider.setActiveDocument(vscode.window.activeTextEditor.document)
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && isStylesheetDocument(editor.document)) {
                diagnosticProvider.validateDocument(editor.document)
                treeViewProvider.setActiveDocument(editor.document)
            } else {
                treeViewProvider.setActiveDocument(undefined)
            }
        }),
        vscode.workspace.onDidChangeTextDocument((e) => {
            const doc = e.document
            if (!isStylesheetDocument(doc)) {
                return
            }

            const key = doc.uri.toString()
            const existingTimer = debounceTimers.get(key)
            if (existingTimer) {
                clearTimeout(existingTimer)
            }

            const timer = setTimeout(() => {
                debounceTimers.delete(key)
                diagnosticProvider.validateDocument(doc)
                if (vscode.window.activeTextEditor?.document === doc) {
                    treeViewProvider.setActiveDocument(doc)
                }
                compiledCssProvider.refresh(MDCCompiledCssProvider.getPreviewUri(doc.uri))
            }, DEBOUNCE_DELAY_MS)

            debounceTimers.set(key, timer)
        }),
        vscode.workspace.onDidCloseTextDocument((doc) => {
            const key = doc.uri.toString()
            const existingTimer = debounceTimers.get(key)
            if (existingTimer) {
                clearTimeout(existingTimer)
                debounceTimers.delete(key)
            }
            diagnosticProvider.clear(doc.uri)
            compiledCssProvider.clear(doc.uri)
            if (vscode.window.activeTextEditor?.document === doc) {
                treeViewProvider.clear()
            }
        })
    )

    // 6. Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'mdc.inspectTokens',
            async (analysis?: StylesheetAnalysis, filter: 'all' | 'private' | 'child' | 'unused' = 'all') => {
                if (!analysis) {
                    vscode.window.showInformationMessage('No MDC stylesheet selected.')
                    return
                }

                const items: vscode.QuickPickItem[] = []

                if (filter === 'all' || filter === 'private') {
                    for (const token of analysis.usedPrivateTokens) {
                        const statesText = token.isTuple
                            ? `5 states: ${token.states.join(', ')}`
                            : `static: ${token.rawValue || ''}`
                        items.push({
                            label: `🎨 var(${token.token})`,
                            description: `[Private Token]`,
                            detail: `States: ${statesText}`,
                        })
                    }
                }

                if (filter === 'all' || filter === 'child') {
                    for (const child of analysis.usedChildBridgeTokens) {
                        items.push({
                            label: `🔗 ${child.token}`,
                            description: `➔ Target: ${child.targetName}`,
                            detail: `Bridged from: ${child.sourceVarName}`,
                        })
                    }
                }

                if (filter === 'all' || filter === 'unused') {
                    for (const token of analysis.unusedTokens) {
                        items.push({
                            label: `⚠️ ${token}`,
                            description: `[Unused in Stylesheet]`,
                            detail: `Defined in ${analysis.definitionName}, but not referenced in CSS.`,
                        })
                    }
                }

                if (items.length === 0) {
                    vscode.window.showInformationMessage(`No tokens found for filter "${filter}".`)
                    return
                }

                const title = `MDC Token Inspector: ${analysis.styleVarName} (${analysis.definitionName})`
                await vscode.window.showQuickPick(items, {
                    placeHolder: `Search or filter tokens in ${analysis.styleVarName}...`,
                    title,
                    matchOnDescription: true,
                    matchOnDetail: true,
                })
            }
        ),
        vscode.commands.registerCommand('mdc.jumpToToken', async (line: number, col: number) => {
            const editor = vscode.window.activeTextEditor
            if (editor) {
                const pos = new vscode.Position(line, col)
                editor.selection = new vscode.Selection(pos, pos)
                editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter)
            }
        }),
        vscode.commands.registerCommand('mdc.showCompiledCss', async (targetUri?: vscode.Uri) => {
            const uriToPreview = targetUri || vscode.window.activeTextEditor?.document.uri
            if (!uriToPreview) {
                vscode.window.showInformationMessage('No active MDC stylesheet found to preview.')
                return
            }

            const previewUri = MDCCompiledCssProvider.getPreviewUri(uriToPreview)
            try {
                const doc = await vscode.workspace.openTextDocument(previewUri)
                await vscode.window.showTextDocument(doc, {
                    viewColumn: vscode.ViewColumn.Beside,
                    preview: true,
                    preserveFocus: true,
                })
            } catch (err: any) {
                vscode.window.showErrorMessage(`Failed to open MDC compiled CSS preview: ${err?.message || err}`)
            }
        })
    )

    function notifyProviders() {
        codeLensProvider.updateDefinitions(definitionMetaMap)
        completionProvider.updateDefinitions(definitionMetaMap)
        hoverProvider.updateDefinitions(definitionMetaMap)
        definitionProvider.updateDefinitions(definitionMetaMap)
        diagnosticProvider.updateDefinitions(definitionMetaMap)
        renameProvider.updateDefinitions(definitionMetaMap)
        treeViewProvider.updateDefinitions(definitionMetaMap)
        compiledCssProvider.updateDefinitions(definitionMetaMap)

        if (vscode.window.activeTextEditor && isStylesheetDocument(vscode.window.activeTextEditor.document)) {
            diagnosticProvider.validateDocument(vscode.window.activeTextEditor.document)
        }
    }

    async function refreshFile(uri: vscode.Uri) {
        try {
            const doc = await vscode.workspace.openTextDocument(uri)
            const text = doc.getText()
            const meta = analyzeDefinitionSource(text, uri.fsPath)
            if (meta) {
                definitionMetaMap.set(meta.name, meta)
                notifyProviders()
            }
        } catch {
            // ignore read errors
        }
    }

    async function refreshDefinitions() {
        try {
            const files = await vscode.workspace.findFiles('**/*.definition.ts', '**/node_modules/**')
            for (const file of files) {
                const doc = await vscode.workspace.openTextDocument(file)
                const text = doc.getText()
                const meta = analyzeDefinitionSource(text, file.fsPath)
                if (meta) {
                    definitionMetaMap.set(meta.name, meta)
                }
            }
            notifyProviders()
        } catch {
            // ignore search errors
        }
    }

    // 7. Initial scan in background (Non-blocking)
    void refreshDefinitions()
}

export function deactivate() {
    for (const timer of debounceTimers.values()) {
        clearTimeout(timer)
    }
    debounceTimers.clear()
    definitionMetaMap.clear()
}
