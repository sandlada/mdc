/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta, SourceRange } from './types'

export interface FileEditEntry {
    filePath: string
    range: SourceRange
    newText: string
}

function cleanToken(raw: string): string {
    return raw.replace(/^[var(]+/, '').replace(/[);]+$/, '').replace(/^--_/, '').replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
}

/**
 * Calculates bidirectional rename edits across definition and stylesheet files.
 */
export function computeTokenRenameEdits(
    currentTokenWord: string,
    newTokenName: string,
    currentFilePath: string,
    currentSourceText: string,
    definitionMetaMap: Map<string, DefinitionMeta>,
    allStylesheetFiles: { filePath: string; sourceText: string }[]
): FileEditEntry[] {
    const edits: FileEditEntry[] = []
    const oldKey = cleanToken(currentTokenWord)
    const newKey = cleanToken(newTokenName)

    if (!oldKey || !newKey || oldKey === newKey) {
        return []
    }

    // 1. Identify which Definition owns this token
    let matchedDefName = ''
    for (const [defName, defMeta] of definitionMetaMap) {
        if (defMeta.ownTokens.has(oldKey)) {
            matchedDefName = defName
            // Edit in definition file
            if (defMeta.filePath) {
                const tokenMeta = defMeta.ownTokens.get(oldKey)
                if (tokenMeta?.range) {
                    edits.push({
                        filePath: defMeta.filePath,
                        range: {
                            startLine: tokenMeta.range.startLine,
                            startCol: tokenMeta.range.startCol,
                            endLine: tokenMeta.range.startLine,
                            endCol: tokenMeta.range.startCol + oldKey.length + 2, // including quotes
                        },
                        newText: `'${newKey}'`,
                    })
                }
            }
            break
        }
    }

    // 2. Find and update all stylesheet references
    for (const styleFile of allStylesheetFiles) {
        const text = styleFile.sourceText
        if (!text.includes(`--_${oldKey}`)) continue

        const targetVar = `--_${oldKey}`
        const newVar = `--_${newKey}`

        let searchPos = 0
        while ((searchPos = text.indexOf(targetVar, searchPos)) !== -1) {
            const linesBefore = text.substring(0, searchPos).split('\n')
            const startLine = linesBefore.length - 1
            const startCol = linesBefore[linesBefore.length - 1].length

            edits.push({
                filePath: styleFile.filePath,
                range: {
                    startLine,
                    startCol,
                    endLine: startLine,
                    endCol: startCol + targetVar.length,
                },
                newText: newVar,
            })

            searchPos += targetVar.length
        }
    }

    return edits
}
