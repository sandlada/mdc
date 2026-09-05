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
    StringifyTokensCallMeta,
    StateTriggerMeta,
    ATRuleUsageMeta,
} from './types'

import { getSourceRange, extractBalancedBlock, extractObjectProperties } from './source-text'
import { canonicalizeState as canonicalizeStateName } from '@sandlada/mdc/style-engine'

const VAR_PRIVATE_REGEX = /var\(\s*(--_([a-zA-Z0-9_:-]+))(?:\s*,\s*([^)]+))?\s*\)/g
const CUSTOM_PROP_REGEX = /((?:--mdc|--md)-[a-zA-Z0-9_-]+)\s*:/g
const CUSTOM_VAR_REGEX = /var\(\s*((?:--mdc|--md)-[a-zA-Z0-9_-]+)(?:\s*,\s*([^)]+))?\s*\)/g

/**
 * Splits a child bridge suffix (`enabled-color`, `size`) into its token key
 * and optional state, using the child's own token states plus well-known
 * aliases. Returns the whole suffix as key when nothing matches.
 */
export function splitChildBridgeSuffix(
    suffix: string,
    childTokens: Record<string, any>
): { key: string; state?: string } {
    if (Object.prototype.hasOwnProperty.call(childTokens, suffix)) {
        return { key: suffix }
    }

    const candidates = new Map<string, string>()
    for (const [tokenKey, tokenMeta] of Object.entries(childTokens)) {
        const states: string[] = Array.isArray((tokenMeta as any)?.states)
            ? (tokenMeta as any).states
            : []
        for (const s of states) {
            if (typeof s === 'string' && !candidates.has(s)) candidates.set(s, s)
            const canonical = canonicalizeStateName(s)
            if (typeof canonical === 'string' && !candidates.has(canonical)) candidates.set(canonical, s)
        }
    }
    for (const alias of ['enabled', 'base', 'hover', 'active', 'focus', 'hovered', 'pressed', 'focused', 'disabled', 'selected', 'checked', 'indeterminate', 'unselected']) {
        if (!candidates.has(alias)) candidates.set(alias, alias)
    }

    const sortedPrefixes = [...candidates.keys()].sort((a, b) => b.length - a.length)
    for (const prefix of sortedPrefixes) {
        if (suffix.startsWith(`${prefix}-`)) {
            const remainder = suffix.substring(prefix.length + 1)
            if (remainder.length > 0 && Object.prototype.hasOwnProperty.call(childTokens, remainder)) {
                return { key: remainder, state: candidates.get(prefix) }
            }
        }
    }

    return { key: suffix }
}

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

export function extractStringifyTokenCalls(sourceText: string): StringifyTokensCallMeta[] {
    const calls: StringifyTokensCallMeta[] = []
    const strRegex = /(?:const\s+([a-zA-Z0-9_$]+)\s*=\s*)?stringifyTokens\s*(?:<[^>]+>)?\s*\(([\s\S]*?)\)\s*\(\s*([a-zA-Z0-9_$]+)\s*\)/g
    let match: RegExpExecArray | null

    while ((match = strRegex.exec(sourceText)) !== null) {
        const varName = match[1]
        const rawOptions = match[2].trim()
        const defName = match[3].trim()
        const range = getSourceRange(sourceText, match.index, match[0].length)

        let prefix = ''
        let includePublicVars = true
        let selector: string | undefined

        if (rawOptions.startsWith('{')) {
            const prefixMatch = /prefix\s*:\s*['"`]([^'"`]+)['"`]/.exec(rawOptions)
            const includeMatch = /includePublicVars\s*:\s*(true|false)/.exec(rawOptions)
            const selectorMatch = /selector\s*:\s*['"`]([^'"`]+)['"`]/.exec(rawOptions)

            if (prefixMatch) prefix = prefixMatch[1]
            if (includeMatch) includePublicVars = includeMatch[1] === 'true'
            if (selectorMatch) selector = selectorMatch[1]
        } else {
            prefix = rawOptions.replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
        }

        if (prefix && !prefix.startsWith('--')) prefix = `--${prefix}`

        calls.push({
            line: range.startLine,
            varName,
            definitionName: defName,
            prefix,
            includePublicVars,
            selector,
            range,
        })
    }

    const legacyRecRegex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:defineTokenRefsRecord|defineComponentTokenRefs)\s*\(\s*([a-zA-Z0-9_$]+)(?:,\s*\{[\s\S]*?prefix:\s*['"`]([^'"`]+)['"`])?/g
    let lMatch: RegExpExecArray | null
    while ((lMatch = legacyRecRegex.exec(sourceText)) !== null) {
        const varName = lMatch[1]
        const defName = lMatch[2]
        const prefix = lMatch[3] ? (lMatch[3].startsWith('--') ? lMatch[3] : `--${lMatch[3]}`) : ''
        const range = getSourceRange(sourceText, lMatch.index, lMatch[0].length)

        if (!calls.some((c) => c.line === range.startLine)) {
            calls.push({
                line: range.startLine,
                varName,
                definitionName: defName,
                prefix,
                includePublicVars: true,
                range,
            })
        }
    }

    return calls
}

export function extractStateTriggers(sourceText: string): StateTriggerMeta[] {
    const triggers: StateTriggerMeta[] = []
    const mapRegex = /mapStateTriggers\s*(?:<[^>]+>)?\s*\(([\s\S]*?)\)/g
    let match: RegExpExecArray | null

    while ((match = mapRegex.exec(sourceText)) !== null) {
        const openBrace = sourceText.indexOf('{', match.index)
        if (openBrace !== -1) {
            const block = extractBalancedBlock(sourceText, openBrace - 1, '{', '}')
            if (block) {
                const entries = extractObjectProperties(block.content)
                for (const entry of entries) {
                    const state = entry.key.trim()
                    const rawVal = entry.valRaw
                    const entryRange = getSourceRange(sourceText, block.startIndex + entry.index, entry.length)

                    const cleanVal = rawVal.replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
                    const target = (cleanVal.startsWith('[') || cleanVal.startsWith(':host')) ? 'host' : 'self'
                    triggers.push({
                        state,
                        target,
                        selector: cleanVal,
                        modifier: cleanVal,
                        source: 'mapStateTriggers',
                        range: entryRange,
                    })
                }
            }
        }
    }

    return triggers
}

export function extractOverrideTokensCalls(sourceText: string): OverrideDeclaration[] {
    const overrides: OverrideDeclaration[] = []
    const ovRegex = /overrideTokens\s*(?:<[^>]+>)?\s*\(\s*([^)]+)\s*\)\s*\(\s*(\{[\s\S]*?\})\s*\)/g
    let match: RegExpExecArray | null

    while ((match = ovRegex.exec(sourceText)) !== null) {
        const rawPrefix = match[1].trim()
        const rawProps = match[2].trim()
        const range = getSourceRange(sourceText, match.index, match[0].length)

        let prefix = rawPrefix.replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
        let selector: string | undefined

        if (rawPrefix.startsWith('{')) {
            const pMatch = /prefix\s*:\s*['"`]([^'"`]+)['"`]/.exec(rawPrefix)
            const sMatch = /selector\s*:\s*['"`]([^'"`]+)['"`]/.exec(rawPrefix)
            if (pMatch) prefix = pMatch[1]
            if (sMatch) selector = sMatch[1]
        }

        const props: Record<string, string> = {}
        const propRegex = /['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:\s*([^,\n}]+)/g
        let pMatch: RegExpExecArray | null
        while ((pMatch = propRegex.exec(rawProps)) !== null) {
            props[pMatch[1].trim()] = pMatch[2].trim()
        }

        overrides.push({
            line: range.startLine,
            targetName: prefix,
            prefix: prefix.startsWith('--') ? prefix : `--${prefix}`,
            selector,
            props,
            range,
        })
    }

    const legacyOvRegex = /(?:overrideStyleSheet|overrideComponentTokens)\s*(?:<[^>]+>)?\s*\(\s*(?:([a-zA-Z0-9_$]+)\s*,\s*)?['"`](--[a-zA-Z0-9_-]+)['"`]/g
    let loMatch: RegExpExecArray | null
    while ((loMatch = legacyOvRegex.exec(sourceText)) !== null) {
        const targetName = loMatch[1] || 'ChildDefinition'
        const prefix = loMatch[2]
        const range = getSourceRange(sourceText, loMatch.index, loMatch[0].length)

        overrides.push({
            line: range.startLine,
            targetName,
            prefix,
            range,
        })
    }

    return overrides
}

export function extractATRules(cssText: string, globalOffset: number, sourceText: string): ATRuleUsageMeta[] {
    const atRules: ATRuleUsageMeta[] = []
    const atRuleRegex = /@(anchor|when|variant|size|slotted|slot|elevation|layer|media|supports|container|keyframes)(?:\s*\(([^)]*)\)|\s+([^{\n;]+))?/g
    let match: RegExpExecArray | null

    while ((match = atRuleRegex.exec(cssText)) !== null) {
        const type = match[1]
        const name = `@${type}` as ATRuleUsageMeta['name']
        const argument = (match[2] || match[3] || '').trim()
        const range = getSourceRange(sourceText, globalOffset + match.index, match[0].length)

        atRules.push({
            type,
            name,
            argument,
            header: match[0].trim(),
            param: argument,
            range,
        })
    }

    return atRules
}

export function normalizePrivateToken(
    rawKey: string,
    ownTokens: Map<string, any>,
    schemaStates: string[] = []
): { cleanKey: string; matchedState?: string; isTuple: boolean } {
    if (ownTokens.has(rawKey)) {
        const meta = ownTokens.get(rawKey)
        return { cleanKey: rawKey, isTuple: meta?.isTuple === true || meta?.isRecord === true }
    }

    // Single state-prefix strip only (the main package never emits `${s1}-${s2}-key`).
    // A strip succeeds only when the remainder is a real definition token, so
    // size namespaces (e.g. `small-container-height`) can never be mis-stripped.
    const baseState = schemaStates.length > 0 ? schemaStates[0] : 'enabled'
    const candidates = new Map<string, string>()
    for (const s of schemaStates) {
        if (!candidates.has(s)) candidates.set(s, s)
        const canonical = canonicalizeStateName(s)
        if (!candidates.has(canonical)) candidates.set(canonical, s)
    }
    if (!candidates.has('enabled')) candidates.set('enabled', baseState)
    if (!candidates.has('base')) candidates.set('base', baseState)
    for (const alias of ['hover', 'active', 'focus']) {
        if (!candidates.has(alias)) candidates.set(alias, alias)
    }

    const sortedPrefixes = [...candidates.keys()].sort((a, b) => b.length - a.length)
    for (const prefix of sortedPrefixes) {
        if (rawKey.startsWith(`${prefix}-`)) {
            const candidate = rawKey.substring(prefix.length + 1)
            if (candidate.length > 0 && ownTokens.has(candidate)) {
                const meta = ownTokens.get(candidate)
                return { cleanKey: candidate, matchedState: candidates.get(prefix), isTuple: meta?.isTuple === true || meta?.isRecord === true }
            }
        }
    }

    return { cleanKey: rawKey, isTuple: false }
}

export function analyzeStylesheetSource(
    sourceText: string,
    definitionMetaMap: Map<string, DefinitionMeta>,
    _filePath?: string
): StylesheetAnalysis[] {
    const results: StylesheetAnalysis[] = []
    const arrayDefs = extractArrayDefinitions(sourceText)
    const stringifyCalls = extractStringifyTokenCalls(sourceText)
    const stateTriggers = extractStateTriggers(sourceText)
    const overrideCalls = extractOverrideTokensCalls(sourceText)

    const tokenRecords: TokenRecordDeclaration[] = stringifyCalls.map((c) => ({
        line: c.line,
        varName: c.varName || 'tokens',
        definitionName: c.definitionName,
        prefix: c.prefix,
        range: c.range,
    }))

    const exportRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*([\s\S]*?)(?=export\s+const|$)/g
    let expMatch: RegExpExecArray | null

    while ((expMatch = exportRegex.exec(sourceText)) !== null) {
        const styleVarName = expMatch[1]
        const bodyText = expMatch[2]
        const bodyGlobalOffset = expMatch.index + expMatch[0].indexOf(bodyText)
        const declarationLine = sourceText.substring(0, expMatch.index).split('\n').length - 1

        if (!styleVarName.toLowerCase().includes('style') && !bodyText.includes('createStyleSheet') && !bodyText.includes('stringifyTokens')) {
            continue
        }

        const defNames: string[] = []
        for (const strCall of stringifyCalls) {
            if (!defNames.includes(strCall.definitionName)) {
                defNames.push(strCall.definitionName)
            }
        }

        const createDefRegex = /createStyleSheet\s*(?:\([^)]*\)\s*)?\(\s*(?:\[([^\]]+)\]|([a-zA-Z0-9_$]+))/g
        let cdMatch: RegExpExecArray | null
        while ((cdMatch = createDefRegex.exec(sourceText)) !== null) {
            if (cdMatch[1]) {
                const list = cdMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
                for (const item of list) {
                    if (arrayDefs.has(item)) defNames.push(...arrayDefs.get(item)!)
                    else defNames.push(item)
                }
            } else if (cdMatch[2]) {
                const rawName = cdMatch[2].trim()
                if (arrayDefs.has(rawName)) defNames.push(...arrayDefs.get(rawName)!)
                else defNames.push(rawName)
            }
        }

        const pipeInvokeRegex = /([a-zA-Z0-9_$]+Styles?|[a-zA-Z0-9_$]+)\s*\(\s*([a-zA-Z0-9_$]+Definition)\s*\)/g
        let piMatch: RegExpExecArray | null
        while ((piMatch = pipeInvokeRegex.exec(sourceText)) !== null) {
            defNames.push(piMatch[2].trim())
        }

        const uniqueDefNames = Array.from(new Set(defNames.filter((d) => d && d !== 'createStyleSheet')))
        const primaryDefName = uniqueDefNames[0] || 'ComponentDefinition'

        let createStyleSheetLine: number | undefined
        const csMatch = /createStyleSheet\s*(?:\([^)]*\)\s*)?\(/.exec(bodyText)
        if (csMatch) {
            createStyleSheetLine = sourceText.substring(0, bodyGlobalOffset + csMatch.index).split('\n').length - 1
        } else {
            const afterExports = sourceText.substring(expMatch.index)
            const csMatch2 = /createStyleSheet\s*(?:\([^)]*\)\s*)?\(/.exec(afterExports)
            if (csMatch2) {
                createStyleSheetLine = sourceText.substring(0, expMatch.index + csMatch2.index).split('\n').length - 1
            }
        }

        const resolvedMetas: DefinitionMeta[] = []
        for (const name of uniqueDefNames) {
            const meta = definitionMetaMap.get(name)
            if (meta) resolvedMetas.push(meta)
        }
        if (resolvedMetas.length === 0) {
            for (const [, meta] of definitionMetaMap) {
                resolvedMetas.push(meta)
                break
            }
        }

        const combinedOwnTokens = new Map<string, any>()
        const combinedForwarded = new Map<string, any>()
        const allSchemaStates: string[] = []

        for (const meta of resolvedMetas) {
            for (const [k, v] of meta.ownTokens) {
                combinedOwnTokens.set(k, v)
                if (v.states) {
                    const stList = Array.isArray(v.states) ? v.states : Object.keys(v.states)
                    for (const s of stList) {
                        if (typeof s === 'string' && !allSchemaStates.includes(s)) allSchemaStates.push(s)
                    }
                }
            }
            for (const [k, v] of meta.forwarded) {
                combinedForwarded.set(k, v)
            }
            if (meta.schema?.flatStates) {
                for (const s of meta.schema.flatStates) {
                    if (!allSchemaStates.includes(s)) allSchemaStates.push(s)
                }
            }
        }

        const allUsages: TokenUsageLocation[] = []
        const privateMap = new Map<string, TokenUsageLocation[]>()
        const childMap = new Map<string, TokenUsageLocation[]>()

        let pMatch: RegExpExecArray | null
        const pRegex = new RegExp(VAR_PRIVATE_REGEX)
        while ((pMatch = pRegex.exec(sourceText)) !== null) {
            const fullToken = pMatch[1]
            const rawKey = pMatch[2]
            const fallback = pMatch[3]?.trim()

            const range = getSourceRange(sourceText, pMatch.index, pMatch[0].length)
            const normalized = normalizePrivateToken(rawKey, combinedOwnTokens, allSchemaStates)

            const usageLoc: TokenUsageLocation = {
                token: fullToken,
                cleanKey: normalized.cleanKey,
                range,
                fullMatch: pMatch[0],
                fallback,
            }

            allUsages.push(usageLoc)
            if (!privateMap.has(normalized.cleanKey)) {
                privateMap.set(normalized.cleanKey, [])
            }
            privateMap.get(normalized.cleanKey)!.push(usageLoc)
        }

        let cMatch: RegExpExecArray | null
        const cRegex = new RegExp(CUSTOM_PROP_REGEX)
        while ((cMatch = cRegex.exec(sourceText)) !== null) {
            const fullProp = cMatch[1]
            const cleanKey = fullProp.replace(/^--(mdc|md)-/, '')
            const range = getSourceRange(sourceText, cMatch.index, fullProp.length)

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

        for (const [cleanKey, locations] of Array.from(privateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
            const metaToken = combinedOwnTokens.get(cleanKey)
            const rawStates = metaToken?.states
                ? (Array.isArray(metaToken.states) ? metaToken.states : Object.keys(metaToken.states))
                : (allSchemaStates.length > 0 ? allSchemaStates : ['enabled', 'hovered', 'pressed', 'focused', 'disabled'])

            usedPrivateTokens.push({
                token: `--_${cleanKey}`,
                cleanKey,
                isTuple: metaToken?.isTuple === true || metaToken?.isRecord === true,
                states: rawStates,
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

        for (const [key, meta] of combinedOwnTokens) {
            if (!usedKeys.has(key)) {
                let childUsed = false
                if (meta?.isForwarded && meta?.bridgeMeta) {
                    const bm = meta.bridgeMeta
                    const prefix = `${bm.targetPrefix}-`
                    const suffix = `-${bm.cleanKey}`
                    if (usedChildBridgeTokens.some((c) => c.token.startsWith(prefix) && (c.token === `${prefix}${bm.cleanKey}` || c.token.endsWith(suffix)))) {
                        childUsed = true
                    }
                }
                if (!childUsed) {
                    unusedTokens.push(`var(--_${key})`)
                }
            }
        }

        const totalDefinitionTokens = combinedOwnTokens.size
        const usedCount = usedKeys.size
        const coveragePercent = totalDefinitionTokens > 0
            ? Math.round((usedCount / totalDefinitionTokens) * 100)
            : 100

        const atRules = extractATRules(sourceText, 0, sourceText)

        results.push({
            styleVarName,
            definitionName: primaryDefName,
            definitionNames: uniqueDefNames,
            declarationLine,
            createStyleSheetLine,
            tokenRecords,
            stringifyTokenCalls: stringifyCalls,
            stateTriggers,
            overrides: overrideCalls,
            atRules,
            usedPrivateTokens,
            usedChildBridgeTokens,
            usedTokens: usedKeys,
            unusedTokens,
            totalDefinitionTokens,
            coveragePercent,
            rawCssText: bodyText,
            allUsages,
        })
    }

    return results
}
