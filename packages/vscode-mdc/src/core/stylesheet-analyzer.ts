/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type {
    DefinitionMeta,
    StylesheetAnalysis,
    UsedPrivateToken,
    UsedChildBridgeToken,
    TokenUsageLocation,
    SourceRange,
    TokenRecordDeclaration,
    OverrideDeclaration,
} from './types'

const VAR_PRIVATE_REGEX = /var\(\s*(--_([a-zA-Z0-9_-]+))(?:\s*,\s*([^)]+))?\s*\)/g
const CUSTOM_PROP_REGEX = /((?:--mdc|--md)-[a-zA-Z0-9_-]+)\s*:/g

function getSourceRange(sourceText: string, startIndex: number, length: number): SourceRange {
    const textBefore = sourceText.substring(0, startIndex)
    const lines = textBefore.split('\n')
    const startLine = lines.length - 1
    const startCol = lines[lines.length - 1].length

    const matchText = sourceText.substring(startIndex, startIndex + length)
    const matchLines = matchText.split('\n')
    const endLine = startLine + matchLines.length - 1
    const endCol = matchLines.length === 1 ? startCol + length : matchLines[matchLines.length - 1].length

    return { startLine, startCol, endLine, endCol }
}

/**
 * Extracts array variable definitions in the file (e.g. `const allTabs = [Def1, Def2]`).
 */
function extractArrayDefinitions(sourceText: string): Map<string, string[]> {
    const arrayMap = new Map<string, string[]>()
    const arrayRegex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*\[([\s\S]*?)\]/g
    let match: RegExpExecArray | null

    while ((match = arrayRegex.exec(sourceText)) !== null) {
        const varName = match[1]
        const items = match[2]
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && /^[a-zA-Z0-9_$]+$/.test(s))
        if (items.length > 0) {
            arrayMap.set(varName, items)
        }
    }

    return arrayMap
}

/**
 * Discovers all `defineTokenRefsRecord` and `defineComponentTokenRefs` declarations across the file.
 */
function extractTokenRecords(sourceText: string): TokenRecordDeclaration[] {
    const records: TokenRecordDeclaration[] = []
    const recRegex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:defineTokenRefsRecord|defineComponentTokenRefs)\s*\(\s*([a-zA-Z0-9_$]+)(?:,\s*\{[\s\S]*?prefix:\s*['"`]([^'"`]+)['"`])?/g
    let match: RegExpExecArray | null

    while ((match = recRegex.exec(sourceText)) !== null) {
        const varName = match[1]
        const definitionName = match[2]
        const prefix = match[3]
        const textBefore = sourceText.substring(0, match.index)
        const line = textBefore.split('\n').length - 1

        records.push({
            line,
            varName,
            definitionName,
            prefix,
        })
    }

    return records
}

/**
 * Discovers all `overrideStyleSheet` and `overrideComponentTokens` declarations across the file.
 */
function extractOverrideDeclarations(sourceText: string): OverrideDeclaration[] {
    const overrides: OverrideDeclaration[] = []
    const ovRegex = /(?:overrideStyleSheet|overrideComponentTokens)\s*(?:<[^>]+>)?\s*\(\s*(?:([a-zA-Z0-9_$]+)\s*,\s*)?['"`](--[a-zA-Z0-9_-]+)['"`]/g
    let match: RegExpExecArray | null

    while ((match = ovRegex.exec(sourceText)) !== null) {
        const targetName = match[1] || 'ChildDefinition'
        const prefix = match[2]
        const textBefore = sourceText.substring(0, match.index)
        const line = textBefore.split('\n').length - 1

        overrides.push({
            line,
            targetName,
            prefix,
        })
    }

    return overrides
}

/**
 * Analyzes a *.style.ts file and extracts used private & child tokens with precise SourceRanges.
 * Robust, zero-dependency parser compatible across all JS/TS environments.
 */
export function analyzeStylesheetSource(
    sourceText: string,
    definitionMetaMap: Map<string, DefinitionMeta>,
    _filePath?: string
): StylesheetAnalysis[] {
    const results: StylesheetAnalysis[] = []
    const arrayDefs = extractArrayDefinitions(sourceText)
    const tokenRecords = extractTokenRecords(sourceText)
    const overrideDeclarations = extractOverrideDeclarations(sourceText)

    // Match `export const [StyleVarName] = ...`
    const exportRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*([\s\S]*?)(?=export\s+const|$)/g
    let expMatch: RegExpExecArray | null

    while ((expMatch = exportRegex.exec(sourceText)) !== null) {
        const styleVarName = expMatch[1]
        const bodyText = expMatch[2]
        const bodyGlobalOffset = expMatch.index + expMatch[0].indexOf(bodyText)

        if (!styleVarName.toLowerCase().includes('style') && !bodyText.includes('createStyleSheet')) {
            continue
        }

        // Calculate declaration line (0-indexed)
        const textBefore = sourceText.substring(0, expMatch.index)
        const declarationLine = textBefore.split('\n').length - 1

        // Locate createStyleSheet line and referenced definitions
        let createStyleSheetLine: number | undefined
        let defName = ''
        const defNames: string[] = []

        // Check if createStyleSheet is inside export body or defined earlier in file
        const createRegex = /createStyleSheet\s*\(\s*(?:\[([^\]]+)\]|([a-zA-Z0-9_$]+))/g
        let cSearchMatch: RegExpExecArray | null

        if (bodyText.includes('createStyleSheet')) {
            cSearchMatch = createRegex.exec(bodyText)
            if (cSearchMatch) {
                const matchOffset = bodyGlobalOffset + cSearchMatch.index
                createStyleSheetLine = sourceText.substring(0, matchOffset).split('\n').length - 1
            }
        } else {
            cSearchMatch = createRegex.exec(sourceText)
            if (cSearchMatch) {
                createStyleSheetLine = sourceText.substring(0, cSearchMatch.index).split('\n').length - 1
            }
        }

        if (cSearchMatch) {
            if (cSearchMatch[1]) {
                const list = cSearchMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
                defNames.push(...list)
                defName = list.join(', ')
            } else if (cSearchMatch[2]) {
                const rawName = cSearchMatch[2].trim()
                defName = rawName
                if (arrayDefs.has(rawName)) {
                    defNames.push(...arrayDefs.get(rawName)!)
                } else {
                    defNames.push(rawName)
                }
            }
        }

        // Aggregate definitions
        const resolvedMetas: DefinitionMeta[] = []
        for (const name of defNames) {
            const meta = definitionMetaMap.get(name)
            if (meta) resolvedMetas.push(meta)
        }
        const primaryMeta = resolvedMetas[0] || definitionMetaMap.get(defName)

        const combinedOwnTokens = new Map<string, any>()
        const combinedForwarded = new Map<string, any>()
        for (const meta of resolvedMetas) {
            for (const [k, v] of meta.ownTokens) {
                combinedOwnTokens.set(k, v)
            }
            for (const [k, v] of meta.forwarded) {
                combinedForwarded.set(k, v)
            }
        }
        if (primaryMeta && resolvedMetas.length === 0) {
            for (const [k, v] of primaryMeta.ownTokens) combinedOwnTokens.set(k, v)
            for (const [k, v] of primaryMeta.forwarded) combinedForwarded.set(k, v)
        }

        const allUsages: TokenUsageLocation[] = []
        const privateMap = new Map<string, TokenUsageLocation[]>()

        const scanText = bodyText.includes('createStyleSheet') ? bodyText : sourceText
        const scanOffset = bodyText.includes('createStyleSheet') ? bodyGlobalOffset : 0

        let pMatch: RegExpExecArray | null
        const pRegex = new RegExp(VAR_PRIVATE_REGEX)
        while ((pMatch = pRegex.exec(scanText)) !== null) {
            const fullToken = pMatch[1] // '--_container-color'
            const cleanKey = pMatch[2] // 'container-color'
            const fallback = pMatch[3]?.trim() // e.g. '#ffffff'

            const matchGlobalIndex = scanOffset + pMatch.index
            const range = getSourceRange(sourceText, matchGlobalIndex, pMatch[0].length)

            const usageLoc: TokenUsageLocation = {
                token: fullToken,
                cleanKey,
                range,
                fullMatch: pMatch[0],
                fallback,
            }

            allUsages.push(usageLoc)

            if (!privateMap.has(fullToken)) {
                privateMap.set(fullToken, [])
            }
            privateMap.get(fullToken)!.push(usageLoc)
        }

        const childMap = new Map<string, TokenUsageLocation[]>()
        let cMatch: RegExpExecArray | null
        const cRegex = new RegExp(CUSTOM_PROP_REGEX)
        while ((cMatch = cRegex.exec(scanText)) !== null) {
            const fullProp = cMatch[1] // '--mdc-icon-enabled-color'
            const cleanKey = fullProp.replace(/^--(mdc|md)-/, '')

            const matchGlobalIndex = scanOffset + cMatch.index
            const range = getSourceRange(sourceText, matchGlobalIndex, fullProp.length)

            const usageLoc: TokenUsageLocation = {
                token: fullProp,
                cleanKey,
                range,
                fullMatch: cMatch[0],
            }

            allUsages.push(usageLoc)

            if (!childMap.has(fullProp)) {
                childMap.set(fullProp, [])
            }
            childMap.get(fullProp)!.push(usageLoc)
        }

        const usedPrivateTokens: UsedPrivateToken[] = []
        const usedChildBridgeTokens: UsedChildBridgeToken[] = []

        for (const [fullVar, locations] of Array.from(privateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
            const cleanKey = fullVar.replace(/^--_/, '')
            const metaToken = combinedOwnTokens.get(cleanKey)

            usedPrivateTokens.push({
                token: fullVar,
                cleanKey,
                isTuple: metaToken?.isTuple ?? (cleanKey.includes('-') && !cleanKey.includes('height') && !cleanKey.includes('width')),
                states: metaToken?.states ?? ['enabled', 'hovered', 'pressed', 'focused', 'disabled'],
                rawValue: metaToken?.rawValue,
                locations,
            })
        }

        for (const [fullProp, locations] of Array.from(childMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
            let matchedTarget = 'ChildDefinition'
            let targetPrefix = ''
            let sourceVar = ''

            for (const [targetName, fwd] of combinedForwarded) {
                if (fullProp.startsWith(fwd.targetPrefix)) {
                    matchedTarget = targetName
                    targetPrefix = fwd.targetPrefix
                    const tokenSuffix = fullProp.replace(fwd.targetPrefix + '-', '')
                    sourceVar = `--mdc-${fwd.namespace}-${tokenSuffix}`
                    break
                }
            }

            usedChildBridgeTokens.push({
                token: fullProp,
                targetName: matchedTarget,
                targetPrefix,
                sourceVarName: sourceVar || fullProp,
                locations,
            })
        }

        const usedKeys = new Set(usedPrivateTokens.map((t) => t.cleanKey))
        const unusedTokens: string[] = []

        for (const [key] of combinedOwnTokens) {
            if (!usedKeys.has(key) && !usedKeys.has(`enabled-${key}`)) {
                unusedTokens.push(`var(--_${key})`)
            }
        }

        const totalDefinitionTokens = combinedOwnTokens.size
        const usedCount = usedPrivateTokens.length
        const coveragePercent = totalDefinitionTokens > 0
            ? Math.round((usedCount / totalDefinitionTokens) * 100)
            : 100

        results.push({
            styleVarName,
            definitionName: defName,
            definitionNames: defNames.length > 0 ? defNames : (defName ? [defName] : []),
            declarationLine,
            createStyleSheetLine,
            tokenRecords,
            overrides: overrideDeclarations,
            usedPrivateTokens,
            usedChildBridgeTokens,
            unusedTokens,
            totalDefinitionTokens,
            coveragePercent,
            rawCssText: bodyText,
            allUsages,
        })
    }

    return results
}
