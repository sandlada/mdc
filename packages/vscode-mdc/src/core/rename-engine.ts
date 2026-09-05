/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta, SourceRange } from './types'
import { normalizePrivateToken } from './stylesheet-analyzer'
import { canonicalizeState as canonicalizeStateName } from '@sandlada/mdc/style-engine'

export interface FileEditEntry {
    filePath: string
    range: SourceRange
    newText: string
}

function cleanToken(raw: string): string {
    return raw.replace(/^[var(]+/, '').replace(/[);]+$/, '').replace(/^--_/, '').replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Calculates bidirectional rename edits across definition and stylesheet files.
 *
 * Renaming a definition token renames every emitted form: the bare
 * `--_key` plus each `--_<state>-key` variant, matched with boundary guards
 * so `--_small-key` style neighbors are never touched. Public child bridge
 * variables derived from the key are renamed as well.
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

    const combinedOwnTokens = new Map<string, any>()
    const combinedSchemaStates: string[] = []
    for (const [, defMeta] of definitionMetaMap) {
        for (const [k, v] of defMeta.ownTokens) {
            if (!combinedOwnTokens.has(k)) combinedOwnTokens.set(k, v)
        }
        const schemaStates: string[] | undefined = (defMeta.schema as { states?: string[] } | undefined)?.states
            ?? (defMeta.schema as { flatStates?: string[] } | undefined)?.flatStates
        if (schemaStates) {
            for (const s of schemaStates) {
                if (typeof s === 'string' && !combinedSchemaStates.includes(s)) combinedSchemaStates.push(s)
            }
        }
        for (const [, token] of defMeta.ownTokens) {
            const states: string[] | undefined = (token as { states?: string[] }).states
            if (Array.isArray(states)) {
                for (const s of states) {
                    if (typeof s === 'string' && !combinedSchemaStates.includes(s)) combinedSchemaStates.push(s)
                }
            }
        }
    }

    const rawOldKey = cleanToken(currentTokenWord)
    const normalized = normalizePrivateToken(rawOldKey, combinedOwnTokens, combinedSchemaStates)
    const oldKey = normalized.cleanKey
    const newKey = cleanToken(newTokenName)

    if (!oldKey || !newKey || oldKey === newKey) {
        return []
    }

    // 1. Identify which Definition owns this token
    let matchedDefName = ''
    let matchedTokenMeta: any = null
    for (const [defName, defMeta] of definitionMetaMap) {
        if (defMeta.ownTokens.has(oldKey)) {
            matchedDefName = defName
            matchedTokenMeta = defMeta.ownTokens.get(oldKey)
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

    if (!matchedDefName) {
        return []
    }

    // 2. Collect every emitted private-var form of this token
    const stateForms = new Set<string>([''])
    const tokenStates: string[] = Array.isArray(matchedTokenMeta?.states) ? matchedTokenMeta.states : []
    for (const s of [...tokenStates, 'enabled', 'base']) {
        if (typeof s !== 'string' || s.length === 0) continue
        stateForms.add(s)
        const canonical = canonicalizeStateName(s)
        if (canonical !== s) stateForms.add(canonical)
    }
    const oldVarForms = [...stateForms].map((s) => (s.length > 0 ? `--_${s}-${oldKey}` : `--_${oldKey}`))
    const newVarFor = (oldVar: string): string => {
        if (oldVar === `--_${oldKey}`) return `--_${newKey}`
        const prefix = oldVar.slice(0, oldVar.length - oldKey.length)
        return `${prefix}${newKey}`
    }
    oldVarForms.sort((a, b) => b.length - a.length)
    const varPattern = new RegExp(`(?<![A-Za-z0-9_:-])(${oldVarForms.map(escapeRegExp).join('|')})(?![A-Za-z0-9_-])`, 'g')

    // 3. Collect public bridge forms derived from this key
    const bridgePairs: Array<{ oldVar: string; newVar: string }> = []
    for (const [, defMeta] of definitionMetaMap) {
        for (const [, fwd] of defMeta.forwarded) {
            // Parent-namespaced token renamed: bridge vars built from the child key
            const ownBridge = (defMeta.ownTokens.get(oldKey) as { bridgeMeta?: { targetPrefix?: string; cleanKey?: string } } | undefined)?.bridgeMeta
            if (ownBridge?.targetPrefix && ownBridge?.cleanKey) {
                const childStates: string[] = tokenStates.length > 0 ? tokenStates : ['']
                for (const s of [...childStates, 'enabled', 'base']) {
                    const oldBridge = s.length > 0
                        ? `${ownBridge.targetPrefix}-${s}-${ownBridge.cleanKey}`
                        : `${ownBridge.targetPrefix}-${ownBridge.cleanKey}`
                    const newBridge = s.length > 0
                        ? `${ownBridge.targetPrefix}-${s}-${ownBridge.cleanKey === oldKey ? newKey : ownBridge.cleanKey}`
                        : `${ownBridge.targetPrefix}-${ownBridge.cleanKey === oldKey ? newKey : ownBridge.cleanKey}`
                    bridgePairs.push({ oldVar: oldBridge, newVar: newBridge })
                }
            }
            // Child target key renamed inside its own definition: update bridges pointing at it
            if (fwd.targetDefinitionName === matchedDefName) {
                for (const [childTokenKey] of Object.entries((fwd.tokens ?? {}) as Record<string, any>)) {
                    if (childTokenKey !== oldKey) continue
                    const childStates: string[] = Array.isArray((fwd.tokens[childTokenKey] as any)?.states)
                        ? (fwd.tokens[childTokenKey] as any).states
                        : ['']
                    for (const s of [...childStates, 'enabled', 'base', '']) {
                        if (s.length > 0) {
                            bridgePairs.push({
                                oldVar: `${fwd.targetPrefix}-${s}-${childTokenKey}`,
                                newVar: `${fwd.targetPrefix}-${s}-${newKey}`
                            })
                        }
                    }
                    bridgePairs.push({
                        oldVar: `${fwd.targetPrefix}-${childTokenKey}`,
                        newVar: `${fwd.targetPrefix}-${newKey}`
                    })
                }
            }
        }
    }
    bridgePairs.sort((a, b) => b.oldVar.length - a.oldVar.length)
    const bridgePattern = bridgePairs.length > 0
        ? new RegExp(`(?<![A-Za-z0-9_:-])(${bridgePairs.map((p) => escapeRegExp(p.oldVar)).join('|')})(?![A-Za-z0-9_-])`, 'g')
        : null
    const bridgeNewFor = (oldVar: string): string => bridgePairs.find((p) => p.oldVar === oldVar)?.newVar ?? oldVar

    // 4. Find and update all stylesheet references
    const pushEdit = (filePath: string, text: string, index: number, oldText: string, replacement: string) => {
        const linesBefore = text.substring(0, index).split('\n')
        const startLine = linesBefore.length - 1
        const startCol = linesBefore[linesBefore.length - 1].length
        edits.push({
            filePath,
            range: {
                startLine,
                startCol,
                endLine: startLine,
                endCol: startCol + oldText.length
            },
            newText: replacement
        })
    }

    for (const styleFile of allStylesheetFiles) {
        const text = styleFile.sourceText

        let varMatch: RegExpExecArray | null
        varPattern.lastIndex = 0
        while ((varMatch = varPattern.exec(text)) !== null) {
            pushEdit(styleFile.filePath, text, varMatch.index, varMatch[1], newVarFor(varMatch[1]))
        }

        if (bridgePattern) {
            let bridgeMatch: RegExpExecArray | null
            bridgePattern.lastIndex = 0
            while ((bridgeMatch = bridgePattern.exec(text)) !== null) {
                pushEdit(styleFile.filePath, text, bridgeMatch.index, bridgeMatch[1], bridgeNewFor(bridgeMatch[1]))
            }
        }
    }

    return edits
}
