/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { analyzeDefinitionSource } from './core/definition-analyzer'
import { analyzeStylesheetSource } from './core/stylesheet-analyzer'
import { getContextScopedCompletions } from './core/completion-engine'
import { getHoverInfoForToken } from './core/hover-engine'
import type { DefinitionMeta } from './core/types'

const definitionMetaMap = new Map<string, DefinitionMeta>()

/**
 * TypeScript Language Service Plugin entry point (for project-level tsconfig.json integration).
 *
 * Automatically loaded by VS Code / IDEs when `"plugins": [{ "name": "@sandlada/vscode-mdc" }]`
 * is configured in tsconfig.json.
 */
export function init(modules: { typescript: any }) {
    const ts = modules.typescript

    function create(info: any) {
        const ls = info.languageService
        const proxy: any = Object.create(ls)

        // 1. Context-Scoped Completions
        proxy.getCompletionsAtPosition = (fileName: string, position: number, options: any) => {
            const prior = ls.getCompletionsAtPosition(fileName, position, options) || {
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                entries: [],
            }

            const program = ls.getProgram()
            if (!program) return prior

            const sourceFile = program.getSourceFile(fileName)
            if (!sourceFile) return prior

            const text = sourceFile.getFullText()
            if (!text.includes('createStyleSheet')) return prior

            const analyses = analyzeStylesheetSource(text, definitionMetaMap, fileName)
            if (analyses.length === 0) return prior

            const currentAnalysis = analyses[0]
            const defMeta = definitionMetaMap.get(currentAnalysis.definitionName) || null
            if (!defMeta) return prior

            // Get current line / word prefix
            const lineStarts = sourceFile.getLineStarts()
            const lineAndChar = sourceFile.getLineAndCharacterOfPosition(position)
            const lineStart = lineStarts[lineAndChar.line]
            const linePrefix = text.substring(lineStart, position)

            const mdcCompletions = getContextScopedCompletions(defMeta, linePrefix)

            for (const item of mdcCompletions) {
                prior.entries.push({
                    name: item.label,
                    kind: item.kind === 'variable' ? 'var' : 'property',
                    kindModifiers: 'export',
                    sortText: '00_' + item.label,
                    insertText: item.insertText,
                    labelDetails: {
                        detail: ' ' + item.detail,
                        description: item.documentation,
                    },
                })
            }

            return prior
        }

        // 2. Rich Hover Information
        proxy.getQuickInfoAtPosition = (fileName: string, position: number) => {
            const prior = ls.getQuickInfoAtPosition(fileName, position)

            const program = ls.getProgram()
            if (!program) return prior

            const sourceFile = program.getSourceFile(fileName)
            if (!sourceFile) return prior

            const text = sourceFile.getFullText()
            if (!text.includes('createStyleSheet')) return prior

            // Scan token at position
            const wordMatch = /(--[a-zA-Z0-9_-]+)/.exec(text.substring(Math.max(0, position - 30), position + 30))
            if (!wordMatch) return prior

            const tokenText = wordMatch[1]
            const analyses = analyzeStylesheetSource(text, definitionMetaMap, fileName)
            if (analyses.length === 0) return prior

            const defMeta = definitionMetaMap.get(analyses[0].definitionName) || null
            const hoverInfo = getHoverInfoForToken(defMeta, tokenText)

            if (hoverInfo) {
                return {
                    kind: 'var',
                    kindModifiers: '',
                    textSpan: { start: position, length: tokenText.length },
                    displayParts: [{ text: hoverInfo, kind: 'text' }],
                    documentation: [],
                    tags: [],
                }
            }

            return prior
        }

        return proxy
    }

    return { create }
}

export default init
export * from './core/types'
export * from './core/definition-analyzer'
export * from './core/stylesheet-analyzer'
export * from './core/codelens-formatter'
export * from './core/completion-engine'
export * from './core/hover-engine'
export * from './core/compiler-engine'
