/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Smoke test for the packaged extension entry (dist/extension.cjs).
 *
 * Loads the bundle with a stubbed vscode module, runs activate(), and
 * asserts every contributed command gets registered. This guards the exact
 * failure mode "command mdc.showCompiledCss not found", which happens
 * whenever the bundle throws at load time (for example an unbundled
 * runtime data-file require such as css-tree data patch JSON) or when
 * activate() throws before reaching registerCommand.
 *
 * Run: npm test -w vscode-mdc (builds first, dist/ is gitignored output).
 */

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(__dirname, '..')
const requireFromDist = createRequire(path.join(pkgDir, 'package.json'))

class Dummy {
    constructor(...args) {
        this.args = args
    }
}

class EventEmitter {
    constructor() {
        this.event = () => ({ dispose() {} })
    }
    fire() {}
    dispose() {}
}

// Plain object with OWN enumerable props: the bundle wraps vscode with an
// ESM-interop helper that only copies own props, so a Proxy stub would read
// back undefined (for example class X extends vscode.TreeItem explodes).
const registeredCommands = []
const vscodeStub = {
    EventEmitter,
    TreeItem: class extends Dummy {},
    ThemeIcon: class extends Dummy {},
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    ThemeColor: class extends Dummy {},
    CodeActionKind: { QuickFix: 'quickfix' },
    CodeAction: class extends Dummy {},
    WorkspaceEdit: class extends Dummy {},
    Diagnostic: class extends Dummy {},
    DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    Range: class extends Dummy {},
    Position: class extends Dummy {},
    Selection: class extends Dummy {},
    Location: class extends Dummy {},
    SnippetString: class extends Dummy {},
    MarkdownString: class extends Dummy {},
    CompletionItem: class extends Dummy {},
    CompletionItemKind: { Property: 1, Variable: 2 },
    Hover: class extends Dummy {},
    Uri: {
        from: (o) => ({ ...o, toString: () => 'stub' }),
        parse: (s) => ({ toString: () => s, fsPath: String(s) }),
        file: (p) => ({ fsPath: p, toString: () => p }),
    },
    ViewColumn: { Beside: 2 },
    TextEditorRevealType: { InCenter: 1 },
    languages: {
        createDiagnosticCollection: () => ({ set: () => {}, delete: () => {}, clear: () => {}, dispose: () => {} }),
        registerCodeLensProvider: () => ({ dispose() {} }),
        registerCompletionItemProvider: () => ({ dispose() {} }),
        registerHoverProvider: () => ({ dispose() {} }),
        registerDefinitionProvider: () => ({ dispose() {} }),
        registerRenameProvider: () => ({ dispose() {} }),
        registerCodeActionsProvider: () => ({ dispose() {} }),
    },
    window: {
        registerTreeDataProvider: () => ({ dispose() {} }),
        onDidChangeActiveTextEditor: () => ({ dispose() {} }),
        activeTextEditor: undefined,
        showInformationMessage: () => {},
        showErrorMessage: () => {},
        showQuickPick: async () => undefined,
    },
    workspace: {
        registerTextDocumentContentProvider: () => ({ dispose() {} }),
        createFileSystemWatcher: () => ({ onDidChange: () => {}, onDidCreate: () => {}, onDidDelete: () => {}, dispose() {} }),
        onDidChangeTextDocument: () => ({ dispose() {} }),
        onDidCloseTextDocument: () => ({ dispose() {} }),
        findFiles: async () => [],
        openTextDocument: async () => {
            throw new Error('no document in smoke test')
        },
    },
    commands: {
        registerCommand: (id) => {
            registeredCommands.push(id)
            return { dispose() {} }
        },
    },
}

const Module = await import('node:module').then((m) => m.default ?? m)
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
    if (request === 'vscode') return 'vscode-smoke-stub'
    return origResolve.call(this, request, ...rest)
}
requireFromDist.cache['vscode-smoke-stub'] = {
    id: 'vscode-smoke-stub',
    filename: 'vscode-smoke-stub',
    loaded: true,
    exports: vscodeStub,
}

const manifest = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
const contributed = (manifest.contributes?.commands ?? []).map((c) => c.command)

const mod = requireFromDist('./dist/extension.cjs')
if (typeof mod.activate !== 'function') throw new Error('dist/extension.cjs does not export activate()')

await mod.activate({ subscriptions: [] })

const missing = contributed.filter((c) => !registeredCommands.includes(c))
if (missing.length > 0) {
    throw new Error('commands contributed but never registered: ' + missing.join(', '))
}
console.log('[smoke-extension] activate() OK, registered: ' + registeredCommands.join(', '))
await mod.deactivate?.()
