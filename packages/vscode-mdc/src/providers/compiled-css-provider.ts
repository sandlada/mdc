/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import * as vscode from 'vscode'
import { compileExportedStylesToCss } from '../core/compiler-engine'
import type { DefinitionMeta } from '../core/types'

interface CompilationCacheEntry {
    version: number
    defVersion: number
    compiledCss: string
}

export class MDCCompiledCssProvider implements vscode.TextDocumentContentProvider, vscode.Disposable {
    public static readonly scheme = 'mdc-compiled-css'

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>()
    public readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event

    private _definitionMetaMap: Map<string, DefinitionMeta>
    private _defVersion = 0
    private _cache = new Map<string, CompilationCacheEntry>()
    private _activePreviewUris = new Set<string>()

    constructor(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
    }

    public updateDefinitions(definitionMetaMap: Map<string, DefinitionMeta>) {
        this._definitionMetaMap = definitionMetaMap
        this._defVersion++
        this.refreshAll()
    }

    public refresh(uri?: vscode.Uri) {
        if (uri) {
            this._activePreviewUris.add(uri.toString())
            this._onDidChange.fire(uri)
        }
    }

    public refreshAll() {
        for (const uriStr of this._activePreviewUris) {
            try {
                const uri = vscode.Uri.parse(uriStr)
                this._onDidChange.fire(uri)
            } catch {
                // ignore parsing error
            }
        }
    }

    public clear(sourceUri: vscode.Uri) {
        const previewUri = MDCCompiledCssProvider.getPreviewUri(sourceUri)
        this._cache.delete(previewUri.toString())
        this._activePreviewUris.delete(previewUri.toString())
    }

    public clearAll() {
        this._cache.clear()
        this._activePreviewUris.clear()
    }

    public getCacheSize(): number {
        return this._cache.size
    }

    public static getPreviewUri(sourceUri: vscode.Uri): vscode.Uri {
        return vscode.Uri.from({
            scheme: MDCCompiledCssProvider.scheme,
            path: `${sourceUri.path}.compiled.css`,
            query: encodeURIComponent(sourceUri.toString()),
        })
    }

    public static getSourceUri(previewUri: vscode.Uri): vscode.Uri | null {
        if (previewUri.query) {
            try {
                return vscode.Uri.parse(decodeURIComponent(previewUri.query))
            } catch {
                return null
            }
        }
        return null
    }

    public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        try {
            this._activePreviewUris.add(uri.toString())
            const sourceUri = MDCCompiledCssProvider.getSourceUri(uri)
            let sourceText = ''
            let fileName = uri.path
            let docVersion = 0

            if (sourceUri) {
                const doc = await vscode.workspace.openTextDocument(sourceUri)
                sourceText = doc.getText()
                fileName = sourceUri.fsPath
                docVersion = doc.version
            } else if (vscode.window.activeTextEditor) {
                const doc = vscode.window.activeTextEditor.document
                sourceText = doc.getText()
                fileName = doc.fileName
                docVersion = doc.version
            }

            if (!sourceText) {
                return `/* No MDC Stylesheet content found for ${uri.path} */`
            }

            // Check cache
            const cacheKey = uri.toString()
            const cached = this._cache.get(cacheKey)
            if (cached && cached.version === docVersion && cached.defVersion === this._defVersion) {
                return cached.compiledCss
            }

            const result = await compileExportedStylesToCss(sourceText, this._definitionMetaMap, fileName)
            this._cache.set(cacheKey, {
                version: docVersion,
                defVersion: this._defVersion,
                compiledCss: result.compiledCss,
            })

            return result.compiledCss
        } catch (err: any) {
            return `/* Error compiling MDC Stylesheet: ${err?.message || String(err)} */`
        }
    }

    public dispose() {
        this.clearAll()
        this._onDidChange.dispose()
    }
}
