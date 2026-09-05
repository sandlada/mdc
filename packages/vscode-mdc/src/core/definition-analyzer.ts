/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type {
    DefinitionMeta,
    DefinitionFileAnalysis,
    SchemaMeta,
    TokenValueMeta,
    ForwardedChildMeta,
    StateTriggerMeta,
    SourceRange
} from './types'
import {
    cleanKey,
    cleanPrefix,
    cleanNamespace,
    getSourceRange,
    extractBalancedBlock,
    extractObjectProperties
} from './source-text'
export { getSourceRange, extractBalancedBlock, cleanKey, cleanPrefix, cleanNamespace, extractObjectProperties } from './source-text'

const DEFAULT_STATE_NAMES = ['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const

function computeCartesianProduct(dimensions: string[][]): string[][] {
    if (dimensions.length === 0) return []
    let combinations: string[][] = [[]]
    for (const dim of dimensions) {
        const next: string[][] = []
        for (const prev of combinations) {
            for (const state of dim) {
                next.push([...prev, state])
            }
        }
        combinations = next
    }
    return combinations
}

export function extractSchemas(sourceText: string): Map<string, SchemaMeta> {
    const schemas = new Map<string, SchemaMeta>()
    const schemaRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*defineSchema/g
    let match: RegExpExecArray | null

    while ((match = schemaRegex.exec(sourceText)) !== null) {
        const schemaName = match[1]
        const openParenIndex = sourceText.indexOf('(', match.index)
        if (openParenIndex === -1) continue

        const block = extractBalancedBlock(sourceText, openParenIndex, '(', ')')
        if (!block) continue

        const rawContent = block.content.trim().replace(/\s*as\s+const\s*$/, '').trim()
        const dimensions: string[][] = []
        let isNestedArray = false

        const arrayStart = rawContent.indexOf('[')
        if (arrayStart !== -1) {
            const inner = rawContent.substring(arrayStart + 1, rawContent.lastIndexOf(']')).trim()
            const strippedInner = inner.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '').trim()
            if (strippedInner.startsWith('[')) {
                isNestedArray = true
                let searchIdx = 0
                while (searchIdx < inner.length) {
                    const subOpen = inner.indexOf('[', searchIdx)
                    if (subOpen === -1) break
                    const subBlock = extractBalancedBlock(inner, subOpen, '[', ']')
                    if (!subBlock) break

                    const stateMatches = subBlock.content.match(/['"`]([^'"`]+)['"`]/g) || []
                    const subDim = stateMatches.map(s => cleanKey(s)).filter(Boolean)
                    if (subDim.length > 0) dimensions.push(subDim)
                    searchIdx = subBlock.endIndex + 1
                }
            } else {
                const stateMatches = inner.match(/['"`]([^'"`]+)['"`]/g) || []
                const dim = stateMatches.map(s => cleanKey(s)).filter(Boolean)
                if (dim.length > 0) dimensions.push(dim)
            }
        }

        const flatStates = dimensions.flat()
        const is2D = isNestedArray || dimensions.length > 1
        const validCombinations = computeCartesianProduct(dimensions)
        const count = validCombinations.length
        const range = getSourceRange(sourceText, match.index, (block.endIndex + 1) - match.index)

        schemas.set(schemaName, {
            name: schemaName,
            is2D,
            dimensions,
            states: flatStates,
            flatStates,
            validCombinations,
            combinationCount: count,
            count,
            range
        })
    }

    return schemas
}

export function extractStateTriggersFromSource(sourceText: string): Map<string, StateTriggerMeta> {
    const stateTriggers = new Map<string, StateTriggerMeta>()

    const defaults: Array<{ state: string; target: 'host' | 'self'; selector: string }> = [
        { state: 'enabled', target: 'self', selector: '' },
        { state: 'hover', target: 'self', selector: ':hover' },
        { state: 'hovered', target: 'self', selector: ':hover' },
        { state: 'focus', target: 'self', selector: ':focus-visible' },
        { state: 'focused', target: 'self', selector: ':focus-visible' },
        { state: 'focus-visible', target: 'self', selector: ':focus-visible' },
        { state: 'active', target: 'self', selector: ':active' },
        { state: 'pressed', target: 'self', selector: ':active' },
        { state: 'selected', target: 'host', selector: '[selected]' },
        { state: 'disabled', target: 'host', selector: '[disabled]' },
        { state: 'checked', target: 'host', selector: '[checked]' },
        { state: 'indeterminate', target: 'host', selector: '[indeterminate]' },
    ]
    for (const d of defaults) {
        stateTriggers.set(d.state, {
            state: d.state,
            target: d.target,
            selector: d.selector,
            modifier: d.selector,
            source: 'heuristic',
            isCustom: false,
        })
    }

    const mapRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*mapStateTriggers/g
    let match: RegExpExecArray | null

    while ((match = mapRegex.exec(sourceText)) !== null) {
        const openParen = sourceText.indexOf('(', match.index)
        if (openParen === -1) continue

        const openBrace = sourceText.indexOf('{', openParen)
        if (openBrace === -1) continue

        const block = extractBalancedBlock(sourceText, openBrace - 1, '{', '}')
        if (!block) continue

        const entries = extractObjectProperties(block.content)
        for (const entry of entries) {
            const state = cleanKey(entry.key)
            const rawVal = entry.valRaw
            const entryRange = getSourceRange(sourceText, block.startIndex + entry.index, entry.length)

            const cleanVal = rawVal.replace(/^['"`]/, '').replace(/['"`]$/, '').trim()
            const target = (cleanVal.startsWith('[') || cleanVal.startsWith(':host')) ? 'host' : 'self'
            stateTriggers.set(state, {
                state,
                target,
                selector: cleanVal,
                modifier: cleanVal,
                source: 'mapStateTriggers',
                rawExpression: rawVal,
                isCustom: true,
                range: entryRange,
            })
        }
    }

    return stateTriggers
}

function parseShapeExpander(
    expanderSource: string,
    prefixArg: string,
    valueArg: string,
    sourceRange: SourceRange,
    schemaStates: string[]
): TokenValueMeta[] {
    const clean = cleanKey(prefixArg)
    const baseKey = clean === 'shape' || clean.endsWith('-shape') ? clean : `${clean}-shape`
    const corners = [
        `${baseKey}-start-start`,
        `${baseKey}-start-end`,
        `${baseKey}-end-start`,
        `${baseKey}-end-end`
    ]

    const tokens: TokenValueMeta[] = []
    const valTrim = valueArg.trim()

    if (valTrim.startsWith('[')) {
        const inner = valTrim.slice(1, -1).trim()
        const elements = inner.split(',').map(s => s.trim()).filter(Boolean)
        const activeStates: string[] = []
        const stateMap: Record<string, string> = {}
        elements.forEach((elem, idx) => {
            if (idx < schemaStates.length && elem && elem !== 'null' && elem !== 'undefined' && elem !== 'void 0') {
                const st = schemaStates[idx]
                activeStates.push(st)
                stateMap[st] = elem
            }
        })

        for (const cKey of corners) {
            tokens.push({
                key: cKey,
                name: cKey,
                isTuple: true,
                isExpanded: true,
                expanderType: 'shape',
                expanderSource,
                states: activeStates,
                stateNames: activeStates,
                stateMap,
                rawValue: valTrim,
                rawTuple: elements,
                rawStates: elements,
                range: sourceRange
            })
        }
    } else if (valTrim.startsWith('{')) {
        const propRegex = /['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:\s*([^,\n}]+)/g
        const objProps: Record<string, string> = {}
        let m: RegExpExecArray | null
        while ((m = propRegex.exec(valTrim)) !== null) {
            objProps[cleanKey(m[1])] = m[2].trim()
        }

        const isCornerObject = 'start-start' in objProps || 'startStart' in objProps ||
            'start-end' in objProps || 'startEnd' in objProps ||
            'end-start' in objProps || 'endStart' in objProps ||
            'end-end' in objProps || 'endEnd' in objProps

        if (isCornerObject) {
            const ss = objProps['start-start'] || objProps['startStart'] || objProps['all'] || '0px'
            const se = objProps['start-end'] || objProps['startEnd'] || objProps['all'] || '0px'
            const es = objProps['end-start'] || objProps['endStart'] || objProps['all'] || '0px'
            const ee = objProps['end-end'] || objProps['endEnd'] || objProps['all'] || '0px'
            const cornerValues = [ss, se, es, ee]

            corners.forEach((cKey, i) => {
                tokens.push({
                    key: cKey,
                    name: cKey,
                    isTuple: false,
                    isExpanded: true,
                    expanderType: 'shape',
                    expanderSource,
                    states: ['enabled'],
                    stateNames: ['enabled'],
                    stateMap: { enabled: cornerValues[i] },
                    rawValue: cornerValues[i],
                    range: sourceRange
                })
            })
        } else {
            const stateKeys = Object.keys(objProps)
            for (const cKey of corners) {
                tokens.push({
                    key: cKey,
                    name: cKey,
                    isTuple: false,
                    isRecord: true,
                    isExpanded: true,
                    expanderType: 'shape',
                    expanderSource,
                    states: stateKeys,
                    stateNames: stateKeys,
                    stateMap: objProps,
                    recordValues: objProps,
                    rawValue: valTrim,
                    range: sourceRange
                })
            }
        }
    } else {
        for (const cKey of corners) {
            tokens.push({
                key: cKey,
                name: cKey,
                isTuple: false,
                isExpanded: true,
                expanderType: 'shape',
                expanderSource,
                states: ['enabled'],
                stateNames: ['enabled'],
                stateMap: { enabled: valTrim },
                rawValue: valTrim,
                range: sourceRange
            })
        }
    }

    return tokens
}

function parsePaddingExpander(
    expanderSource: string,
    prefixArg: string,
    valueArg: string,
    sourceRange: SourceRange,
    _schemaStates: string[]
): TokenValueMeta[] {
    const clean = cleanKey(prefixArg)
    const baseKey = clean === 'padding' || clean.endsWith('-padding') ? clean : `${clean}-padding`
    const edges = [
        `${baseKey}-block-start`,
        `${baseKey}-block-end`,
        `${baseKey}-inline-start`,
        `${baseKey}-inline-end`
    ]

    const tokens: TokenValueMeta[] = []
    const valTrim = valueArg.trim()

    if (valTrim.startsWith('{')) {
        const propRegex = /['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:\s*(\[[^\]]*\]|[^,\n}]+)/g
        const stateObj: Record<string, string> = {}
        let m: RegExpExecArray | null
        while ((m = propRegex.exec(valTrim)) !== null) {
            stateObj[cleanKey(m[1])] = m[2].trim()
        }

        const stateKeys = Object.keys(stateObj)
        const edgeStateMaps: [Record<string, string>, Record<string, string>, Record<string, string>, Record<string, string>] = [
            {}, {}, {}, {}
        ]

        for (const [st, val] of Object.entries(stateObj)) {
            if (val.startsWith('[')) {
                const subElements = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
                if (subElements.length === 2) {
                    edgeStateMaps[0][st] = subElements[0]
                    edgeStateMaps[1][st] = subElements[0]
                    edgeStateMaps[2][st] = subElements[1]
                    edgeStateMaps[3][st] = subElements[1]
                } else if (subElements.length === 4) {
                    edgeStateMaps[0][st] = subElements[0]
                    edgeStateMaps[1][st] = subElements[1]
                    edgeStateMaps[2][st] = subElements[2]
                    edgeStateMaps[3][st] = subElements[3]
                } else {
                    for (let e = 0; e < 4; e++) edgeStateMaps[e][st] = subElements[0] || '0px'
                }
            } else {
                for (let e = 0; e < 4; e++) edgeStateMaps[e][st] = val
            }
        }

        edges.forEach((edgeKey, i) => {
            const sm = edgeStateMaps[i]
            tokens.push({
                key: edgeKey,
                name: edgeKey,
                isTuple: false,
                isRecord: true,
                isExpanded: true,
                expanderType: 'padding',
                expanderSource,
                states: stateKeys,
                stateNames: stateKeys,
                stateMap: sm,
                recordValues: sm,
                rawValue: valTrim,
                range: sourceRange
            })
        })
    } else if (valTrim.startsWith('[')) {
        const elements = valTrim.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
        let edgeVals: [string, string, string, string]
        if (elements.length === 2) {
            edgeVals = [elements[0], elements[0], elements[1], elements[1]]
        } else if (elements.length === 4) {
            edgeVals = [elements[0], elements[1], elements[2], elements[3]]
        } else {
            edgeVals = [elements[0] || '0px', elements[0] || '0px', elements[0] || '0px', elements[0] || '0px']
        }

        edges.forEach((edgeKey, i) => {
            tokens.push({
                key: edgeKey,
                name: edgeKey,
                isTuple: false,
                isExpanded: true,
                expanderType: 'padding',
                expanderSource,
                states: ['enabled'],
                stateNames: ['enabled'],
                stateMap: { enabled: edgeVals[i] },
                rawValue: edgeVals[i],
                range: sourceRange
            })
        })
    } else {
        edges.forEach(edgeKey => {
            tokens.push({
                key: edgeKey,
                name: edgeKey,
                isTuple: false,
                isExpanded: true,
                expanderType: 'padding',
                expanderSource,
                states: ['enabled'],
                stateNames: ['enabled'],
                stateMap: { enabled: valTrim },
                rawValue: valTrim,
                range: sourceRange
            })
        })
    }

    return tokens
}

function parseTypescaleExpander(
    expanderSource: string,
    prefixArg: string,
    valueArg: string,
    sourceRange: SourceRange,
    _schemaStates: string[]
): TokenValueMeta[] {
    const clean = cleanKey(prefixArg).replace(/-(typescale|typography)$/, '')
    const baseKey = clean
    const props = [
        { key: `${baseKey}-font`, subProp: 'Font' },
        { key: `${baseKey}-size`, subProp: 'FontSize' },
        { key: `${baseKey}-leading`, subProp: 'LineHeight' },
        { key: `${baseKey}-weight`, subProp: 'FontWeight' },
        { key: `${baseKey}-tracking`, subProp: 'Tracking' }
    ]

    const tokens: TokenValueMeta[] = []
    const valTrim = valueArg.trim()

    for (const p of props) {
        tokens.push({
            key: p.key,
            name: p.key,
            isTuple: false,
            isExpanded: true,
            expanderType: 'typescale',
            expanderSource,
            states: ['enabled'],
            stateNames: ['enabled'],
            stateMap: { enabled: `${valTrim}.${p.subProp}` },
            rawValue: `${valTrim}.${p.subProp}`,
            range: sourceRange
        })
    }

    return tokens
}

export function analyzeDefinitionSource(sourceText: string, filePath?: string): DefinitionMeta | null {
    const file = analyzeDefinitionFile(sourceText, filePath)
    const first = file.definitions.values().next()
    return first.done ? null : first.value
}

/**
 * Analyzes a whole *.definition.ts file: every `createStyleDefinition` definition
 * plus every `XxxVariants` dictionary. Backwards-compatible single-definition
 * consumers should keep using `analyzeDefinitionSource` (first definition).
 */
export function analyzeDefinitionFile(sourceText: string, filePath?: string): DefinitionFileAnalysis {
    const schemas = extractSchemas(sourceText)
    const stateTriggers = extractStateTriggersFromSource(sourceText)
    const constObjects = collectLocalObjectConsts(sourceText)
    const factories = collectFactoryConsts(sourceText)
    const variants = extractVariantDicts(sourceText)

    const definitions = new Map<string, DefinitionMeta>()
    const defRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*createStyleDefinition/g
    let m: RegExpExecArray | null
    const seen = new Set<string>()
    while ((m = defRegex.exec(sourceText)) !== null) {
        const definitionName = m[1]
        if (seen.has(definitionName)) continue
        seen.add(definitionName)
        const createIndex = m.index + m[0].indexOf('createStyleDefinition')
        const meta = parseSingleDefinition(sourceText, filePath, schemas, stateTriggers, constObjects, factories, definitionName, createIndex)
        if (meta) definitions.set(meta.name, meta)
    }

    return { definitions, variants }
}

/**
 * Collects top-level `const Name = { ... }` object literals for spread inlining.
 */
function collectLocalObjectConsts(sourceText: string): Map<string, { body: string; index: number }> {
    const constObjects = new Map<string, { body: string; index: number }>()
    const constRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*\{/g
    let m: RegExpExecArray | null
    while ((m = constRegex.exec(sourceText)) !== null) {
        const name = m[1]
        if (constObjects.has(name)) continue
        const braceIdx = m.index + m[0].length - 1
        const block = extractBalancedBlock(sourceText, braceIdx, '{', '}')
        if (block) {
            constObjects.set(name, { body: block.content, index: block.startIndex })
        }
    }
    return constObjects
}

interface InlinedEntry {
    key: string
    valRaw: string
    index: number
    length: number
}

/**
 * Blanks out bare-identifier spreads (`...sharedTokens`, not calls) and returns
 * the entries parsed from the referenced const bodies. Ranges point at the
 * spread site. Unresolvable names and call-spreads are recorded, not inlined.
 */
function inlineIdentifierSpreads(
    bodyText: string,
    constObjects: Map<string, { body: string; index: number }>,
    factories: Map<string, { params: string[]; body: string }>,
    unresolved: string[],
    depth = 0
): { cleaned: string; inlined: InlinedEntry[] } {
    const inlined: InlinedEntry[] = []
    if (depth > 5) return { cleaned: bodyText, inlined }

    const spreadRegex = /\.\.\.([a-zA-Z0-9_$]+)\b(?!\s*\()/g
    const matches = [...bodyText.matchAll(spreadRegex)]
    let cleaned = bodyText

    for (let k = matches.length - 1; k >= 0; k--) {
        const mm = matches[k]
        const name = mm[1]
        const start = mm.index ?? 0
        const found = constObjects.get(name)
        if (found) {
            const nested = inlineIdentifierSpreads(found.body, constObjects, factories, unresolved, depth + 1)
            for (const entry of extractObjectProperties(nested.cleaned)) {
                inlined.push({ key: entry.key, valRaw: entry.valRaw, index: start, length: mm[0].length })
            }
            for (const extra of nested.inlined) {
                inlined.push({ ...extra, index: start, length: mm[0].length })
            }
        } else {
            unresolved.push(name)
        }
        cleaned = cleaned.substring(0, start) + ' '.repeat(mm[0].length) + cleaned.substring(start + mm[0].length)
    }

    // Resolve concise-body factory call-spreads: ...name(args)
    const callSpreadHeadRegex = /\.\.\.([a-zA-Z0-9_$]+)\s*\(/g
    let cm: RegExpExecArray | null
    const resolvedRanges: Array<{ start: number; end: number }> = []
    while ((cm = callSpreadHeadRegex.exec(cleaned)) !== null) {
        const callStart = cm.index
        const fnName = cm[1]

        if (fnName === 'expandShape' || fnName === 'expandPadding' || fnName === 'expandTypescale' || fnName === 'forwardTokens') {
            const openParen = callStart + cm[0].length - 1
            const parenBlock = extractBalancedBlock(cleaned, openParen, '(', ')')
            if (parenBlock) {
                let callEnd = parenBlock.endIndex + 1
                const nextOpenParen = cleaned.indexOf('(', callEnd)
                if (nextOpenParen !== -1 && cleaned.slice(callEnd, nextOpenParen).trim() === '') {
                    const secondBlock = extractBalancedBlock(cleaned, nextOpenParen, '(', ')')
                    if (secondBlock) {
                        callEnd = secondBlock.endIndex + 1
                    }
                }
                resolvedRanges.push({ start: callStart, end: callEnd })
            }
            continue
        }

        const openParen = callStart + cm[0].length - 1
        const parenBlock = extractBalancedBlock(cleaned, openParen, '(', ')')
        if (!parenBlock) {
            unresolved.push(cleaned.slice(callStart, openParen + 1).trim())
            continue
        }
        const callEnd = parenBlock.endIndex + 1
        const substituted = resolveFactoryCall(cleaned.slice(callStart + 3, callEnd), factories)
        if (substituted !== null) {
            const nested = inlineIdentifierSpreads(substituted, constObjects, factories, unresolved, depth + 1)
            for (const entry of extractObjectProperties(nested.cleaned)) {
                inlined.push({ key: entry.key, valRaw: entry.valRaw, index: callStart, length: callEnd - callStart })
            }
            for (const extra of nested.inlined) {
                inlined.push({ ...extra, index: callStart, length: callEnd - callStart })
            }
        } else {
            unresolved.push(cleaned.slice(callStart, callEnd).trim())
        }
        resolvedRanges.push({ start: callStart, end: callEnd })
    }
    for (let k = resolvedRanges.length - 1; k >= 0; k--) {
        const r = resolvedRanges[k]
        cleaned = cleaned.substring(0, r.start) + ' '.repeat(r.end - r.start) + cleaned.substring(r.end)
    }

    return { cleaned, inlined }
}

/**
 * Collects concise-body arrow factories (`const f = (a, b) => ({...})`) so
 * call-spreads like `...fabVariantTokens(Color.Primary, ...)` can be resolved
 * by textual parameter substitution.
 */
function collectFactoryConsts(sourceText: string): Map<string, { params: string[]; body: string }> {
    const factories = new Map<string, { params: string[]; body: string }>()
    const factoryRegex = /const\s+([a-zA-Z0-9_$]+)\s*=\s*\(([^()]*)\)\s*=>/g
    let m: RegExpExecArray | null
    while ((m = factoryRegex.exec(sourceText)) !== null) {
        const name = m[1]
        if (factories.has(name)) continue
        const params = m[2].split(',').map((p) => p.trim()).filter(Boolean)
            .map((p) => p.replace(/\s*=.*$/, '').trim())
            .filter(Boolean)
        const arrowEnd = m.index + m[0].length
        let cursor = arrowEnd
        while (cursor < sourceText.length && /\s/.test(sourceText[cursor])) cursor++
        if (sourceText[cursor] !== '(') continue
        const parenBlock = extractBalancedBlock(sourceText, cursor, '(', ')')
        if (!parenBlock) continue
        const inner = parenBlock.content.trim()
        if (!inner.startsWith('{')) continue
        const braceIdx = parenBlock.content.indexOf('{')
        const braceBlock = extractBalancedBlock(parenBlock.content, braceIdx, '{', '}')
        if (!braceBlock) continue
        factories.set(name, { params, body: braceBlock.content })
    }
    return factories
}

/**
 * Splits call arguments on top-level commas (depth-aware).
 */
function splitCallArgs(argsText: string): string[] {
    const args: string[] = []
    let depth = 0
    let current = ''
    let inString: string | null = null
    for (let i = 0; i < argsText.length; i++) {
        const ch = argsText[i]
        if (inString) {
            current += ch
            if (ch === inString) inString = null
            continue
        }
        if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch
            current += ch
            continue
        }
        if (ch === '(' || ch === '[' || ch === '{') depth++
        if (ch === ')' || ch === ']' || ch === '}') depth--
        if (ch === ',' && depth === 0) {
            args.push(current.trim())
            current = ''
            continue
        }
        current += ch
    }
    if (current.trim().length > 0) args.push(current.trim())
    return args
}

/**
 * Resolves a factory call expression (`name(args)`) to its substituted body,
 * or null when the callee is unknown or the arity mismatches.
 */
function resolveFactoryCall(
    expression: string,
    factories: Map<string, { params: string[]; body: string }>
): string | null {
    const headMatch = /^([a-zA-Z0-9_$]+)\s*\(/.exec(expression.trim())
    if (!headMatch) return null
    const factory = factories.get(headMatch[1])
    if (!factory) return null
    const trimmed = expression.trim()
    const firstOpen = trimmed.indexOf('(')
    if (firstOpen === -1) return null
    const argsBlock = extractBalancedBlock(trimmed, firstOpen, '(', ')')
    if (!argsBlock || argsBlock.endIndex !== trimmed.length - 1) return null
    const args = splitCallArgs(argsBlock.content)
    if (args.length !== factory.params.length) return null
    let substituted = factory.body
    for (let i = 0; i < factory.params.length; i++) {
        const param = factory.params[i]
        if (!param) continue
        substituted = substituted.replace(new RegExp(`\\b${param}\\b`, 'g'), args[i] ?? param)
    }
    return substituted
}

/**
 * Extracts `XxxVariants = { 'variant': DefinitionName, ... }` dictionaries.
 */
function extractVariantDicts(sourceText: string): Map<string, string[]> {
    const variants = new Map<string, string[]>()
    const dictRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]*Variants)\s*=\s*\{/g
    let m: RegExpExecArray | null
    while ((m = dictRegex.exec(sourceText)) !== null) {
        const dictName = m[1]
        const braceIdx = m.index + m[0].length - 1
        const block = extractBalancedBlock(sourceText, braceIdx, '{', '}')
        if (!block) continue
        const members: string[] = []
        const pairRegex = /['"`]([^'"`]+)['"`]\s*:\s*([a-zA-Z0-9_$]+)/g
        let pm: RegExpExecArray | null
        while ((pm = pairRegex.exec(block.content)) !== null) {
            members.push(pm[2])
        }
        variants.set(dictName, members)
    }
    return variants
}

function parseSingleDefinition(
    sourceText: string,
    filePath: string | undefined,
    schemas: Map<string, SchemaMeta>,
    stateTriggers: Map<string, StateTriggerMeta>,
    constObjects: Map<string, { body: string; index: number }>,
    factories: Map<string, { params: string[]; body: string }>,
    definitionName: string,
    createIndex: number
): DefinitionMeta | null {

    const firstOpenParen = sourceText.indexOf('(', createIndex)
    if (firstOpenParen === -1) return null

    const firstParenBlock = extractBalancedBlock(sourceText, firstOpenParen, '(', ')')
    if (!firstParenBlock) return null

    const firstArgContent = firstParenBlock.content.trim()

    let schemaName: string | undefined
    let boundSchema: SchemaMeta | undefined
    let tokenObjectBlock: { content: string; startIndex: number; endIndex: number } | null = null
    const unresolvedSpreads: string[] = []

    if (firstArgContent.startsWith('{')) {
        const braceIdx = firstArgContent.indexOf('{')
        tokenObjectBlock = extractBalancedBlock(sourceText, firstParenBlock.startIndex + braceIdx - 1, '{', '}')
    } else {
        const rawSchemaArg = firstArgContent.replace(/\s*as\s+const\s*$/, '').trim()
        if (rawSchemaArg.startsWith('defineSchema')) {
            const inlineSchemas = extractSchemas(`const InlineSchema = ${rawSchemaArg}`)
            boundSchema = inlineSchemas.get('InlineSchema')
            if (boundSchema) {
                boundSchema.name = `${definitionName}Schema`
                schemas.set(boundSchema.name, boundSchema)
                schemaName = boundSchema.name
            }
        } else {
            schemaName = rawSchemaArg
            boundSchema = schemas.get(schemaName)
        }

        const secondOpenParen = sourceText.indexOf('(', firstParenBlock.endIndex)
        if (secondOpenParen !== -1) {
            const secondParenBlock = extractBalancedBlock(sourceText, secondOpenParen, '(', ')')
            if (secondParenBlock) {
                const secondInner = secondParenBlock.content.trim()
                if (secondInner.startsWith('{')) {
                    const braceIdx = secondParenBlock.content.indexOf('{')
                    tokenObjectBlock = extractBalancedBlock(sourceText, secondParenBlock.startIndex + braceIdx - 1, '{', '}')
                } else {
                    // Second argument is a shared const identifier, a factory
                    // call, or an unevaluable expression
                    const identMatch = /^([a-zA-Z0-9_$]+)$/.exec(secondInner)
                    const shared = identMatch ? constObjects.get(identMatch[1]) : undefined
                    if (shared) {
                        tokenObjectBlock = {
                            content: shared.body,
                            startIndex: shared.index,
                            endIndex: shared.index + shared.body.length
                        }
                    } else {
                        const resolvedCall = resolveFactoryCall(secondInner, factories)
                        if (resolvedCall !== null) {
                            tokenObjectBlock = {
                                content: resolvedCall,
                                startIndex: secondParenBlock.startIndex,
                                endIndex: secondParenBlock.endIndex
                            }
                        } else {
                            tokenObjectBlock = null
                            if (secondInner.length > 0) {
                                unresolvedSpreads.push(secondInner.length > 80 ? secondInner.slice(0, 80) + '...' : secondInner)
                            }
                        }
                    }
                }
            }
        }
    }

    if (!tokenObjectBlock) {
        // Unevaluable token source (e.g. factory call): return a visible,
        // token-less meta carrying the limitation instead of vanishing.
        const defRange = getSourceRange(sourceText, createIndex, firstParenBlock.endIndex - createIndex)
        return {
            name: definitionName,
            filePath,
            schemaName,
            schema: boundSchema,
            schemas,
            ownTokens: new Map(),
            forwarded: new Map(),
            stateTriggers,
            unresolvedSpreads,
            range: defRange
        }
    }

    const bodyText = tokenObjectBlock.content
    const bodyGlobalOffset = tokenObjectBlock.startIndex

    const ownTokens = new Map<string, TokenValueMeta>()
    const forwarded = new Map<string, ForwardedChildMeta>()

    const schemaStates = boundSchema?.flatStates || [...DEFAULT_STATE_NAMES]

    // 1. Parse ...forwardTokens(TargetDef, { ... })
    let searchPos = 0
    const fwdKeyword = '...forwardTokens'

    while ((searchPos = bodyText.indexOf(fwdKeyword, searchPos)) !== -1) {
        const afterKeyword = bodyText.substring(searchPos + fwdKeyword.length)
        const targetArgMatch = /^\s*\(\s*([a-zA-Z0-9_$]+)\s*,\s*\{/.exec(afterKeyword)

        if (targetArgMatch) {
            const targetDefName = targetArgMatch[1]
            const optionsStart = searchPos + fwdKeyword.length + targetArgMatch[0].length - 1
            const optionsBlock = extractBalancedBlock(bodyText, optionsStart, '{', '}')

            if (optionsBlock) {
                const optionsBody = optionsBlock.content
                const optionsGlobalOffset = bodyGlobalOffset + optionsBlock.startIndex

                const prefixMatch = /targetPrefix\s*:\s*['"`]([^'"`]+)['"`]/.exec(optionsBody)
                const nameMatch = /name\s*:\s*['"`]([^'"`]+)['"`]/.exec(optionsBody)
                const tokensIndex = optionsBody.indexOf('tokens')

                const targetPrefix = prefixMatch ? cleanPrefix(prefixMatch[1]) : ''
                const name = nameMatch ? cleanPrefix(nameMatch[1]) : ''
                const namespace = cleanNamespace(targetPrefix, name)

                const forwardedTokensMap: Record<string, any> = {}
                const tokenMap: Record<string, string> = {}

                if (tokensIndex !== -1) {
                    const tokenBrace = optionsBody.indexOf('{', tokensIndex)
                    if (tokenBrace !== -1) {
                        const tokenBlock = extractBalancedBlock(optionsBody, tokenBrace, '{', '}')
                        if (tokenBlock) {
                            const tokenBody = tokenBlock.content
                            const tokenGlobalOffset = optionsGlobalOffset + tokenBlock.startIndex
                            const tokenLineRegex = /['"`]([a-zA-Z0-9_-]+)['"`]\s*:\s*(\[[^\]]*\]|[^,\n]+)/g
                            let tMatch: RegExpExecArray | null

                            while ((tMatch = tokenLineRegex.exec(tokenBody)) !== null) {
                                const tokenKey = cleanKey(tMatch[1])
                                const valRaw = tMatch[2].trim()
                                const matchAbsoluteIndex = tokenGlobalOffset + tMatch.index
                                const range = getSourceRange(sourceText, matchAbsoluteIndex, tMatch[0].length)
                                const parentKey = `${namespace}-${tokenKey}`
                                tokenMap[tokenKey] = parentKey

                                if (valRaw.startsWith('[')) {
                                    const elements = valRaw
                                        .slice(1, -1)
                                        .split(',')
                                        .map((s) => s.trim())

                                    const activeStates: string[] = []
                                    const stateMap: Record<string, string> = {}
                                    elements.forEach((elem, index) => {
                                        if (elem && elem !== 'null' && elem !== 'undefined' && elem !== 'void 0') {
                                            if (index < schemaStates.length) {
                                                const sName = schemaStates[index]
                                                activeStates.push(sName)
                                                stateMap[sName] = elem
                                            }
                                        }
                                    })

                                    const childMeta: TokenValueMeta = {
                                        key: tokenKey,
                                        name: tokenKey,
                                        isTuple: true,
                                        states: activeStates,
                                        stateNames: activeStates,
                                        stateMap,
                                        rawValue: valRaw,
                                        rawTuple: elements,
                                        rawStates: elements,
                                        range,
                                    }
                                    forwardedTokensMap[tokenKey] = childMeta

                                    ownTokens.set(parentKey, {
                                        key: parentKey,
                                        name: parentKey,
                                        isTuple: true,
                                        states: activeStates,
                                        stateNames: activeStates,
                                        stateMap,
                                        rawValue: valRaw,
                                        rawTuple: elements,
                                        rawStates: elements,
                                        isForwarded: true,
                                        bridgeMeta: {
                                            targetPrefix: targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`,
                                            cleanKey: tokenKey,
                                            parentKey,
                                        },
                                        range,
                                    })
                                } else {
                                    const childMeta: TokenValueMeta = {
                                        key: tokenKey,
                                        name: tokenKey,
                                        isTuple: false,
                                        states: ['enabled'],
                                        stateNames: ['enabled'],
                                        stateMap: { enabled: valRaw },
                                        rawValue: valRaw,
                                        range,
                                    }
                                    forwardedTokensMap[tokenKey] = childMeta

                                    ownTokens.set(parentKey, {
                                        key: parentKey,
                                        name: parentKey,
                                        isTuple: false,
                                        states: ['enabled'],
                                        stateNames: ['enabled'],
                                        stateMap: { enabled: valRaw },
                                        rawValue: valRaw,
                                        isForwarded: true,
                                        bridgeMeta: {
                                            targetPrefix: targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`,
                                            cleanKey: tokenKey,
                                            parentKey,
                                        },
                                        range,
                                    })
                                }
                            }
                        }
                    }
                }

                const fwdGlobalIndex = bodyGlobalOffset + searchPos
                forwarded.set(targetDefName, {
                    targetDefinitionName: targetDefName,
                    targetPrefix: targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`,
                    childPrefix: targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`,
                    namespace,
                    tokenMap,
                    tokens: forwardedTokensMap,
                    range: getSourceRange(sourceText, fwdGlobalIndex, optionsBlock.endIndex - searchPos),
                })

                searchPos = optionsBlock.endIndex
            } else {
                searchPos += fwdKeyword.length
            }
        } else {
            searchPos += fwdKeyword.length
        }
    }

    // 2. Parse token expanders: ...expandShape, ...expandPadding, ...expandTypescale
    const expKeywordRegex = /\.\.\.(expandShape|expandPadding|expandTypescale)/g
    let expKwMatch: RegExpExecArray | null
    while ((expKwMatch = expKeywordRegex.exec(bodyText)) !== null) {
        const type = expKwMatch[1] as 'expandShape' | 'expandPadding' | 'expandTypescale'
        const firstOpen = bodyText.indexOf('(', expKwMatch.index)
        if (firstOpen === -1) continue
        const firstBlock = extractBalancedBlock(bodyText, firstOpen, '(', ')')
        if (!firstBlock) continue
        const secondOpen = bodyText.indexOf('(', firstBlock.endIndex)
        if (secondOpen === -1) continue
        const secondBlock = extractBalancedBlock(bodyText, secondOpen, '(', ')')
        if (!secondBlock) continue

        const prefixArg = firstBlock.content.trim()
        const valueArg = secondBlock.content.trim()
        const fullLength = (secondBlock.endIndex + 1) - expKwMatch.index
        const expGlobalIndex = bodyGlobalOffset + expKwMatch.index
        const expRange = getSourceRange(sourceText, expGlobalIndex, fullLength)

        let expandedTokens: TokenValueMeta[] = []
        if (type === 'expandShape') {
            expandedTokens = parseShapeExpander(bodyText.substring(expKwMatch.index, secondBlock.endIndex + 1), prefixArg, valueArg, expRange, schemaStates)
        } else if (type === 'expandPadding') {
            expandedTokens = parsePaddingExpander(bodyText.substring(expKwMatch.index, secondBlock.endIndex + 1), prefixArg, valueArg, expRange, schemaStates)
        } else if (type === 'expandTypescale') {
            expandedTokens = parseTypescaleExpander(bodyText.substring(expKwMatch.index, secondBlock.endIndex + 1), prefixArg, valueArg, expRange, schemaStates)
        }

        for (const t of expandedTokens) {
            ownTokens.set(t.key, t)
        }
    }

    // 3. Strip expanders and forwardTokens to parse direct token properties
    let strippedBody = bodyText
    let fwdCleanPos = 0
    while ((fwdCleanPos = strippedBody.indexOf(fwdKeyword)) !== -1) {
        const after = strippedBody.substring(fwdCleanPos)
        const openP = after.indexOf('(')
        if (openP !== -1) {
            const parenBlock = extractBalancedBlock(after, openP, '(', ')')
            if (parenBlock) {
                const gapLength = parenBlock.endIndex + 1
                strippedBody = strippedBody.substring(0, fwdCleanPos) + ' '.repeat(gapLength) + after.substring(gapLength)
            } else break
        } else break
    }

    let expCleanPos = 0
    while ((expCleanPos = strippedBody.search(/\.\.\.(expandShape|expandPadding|expandTypescale)/)) !== -1) {
        const after = strippedBody.substring(expCleanPos)
        const firstP = after.indexOf('(')
        if (firstP !== -1) {
            const b1 = extractBalancedBlock(after, firstP, '(', ')')
            if (b1) {
                const secondP = after.indexOf('(', b1.endIndex)
                if (secondP !== -1) {
                    const b2 = extractBalancedBlock(after, secondP, '(', ')')
                    if (b2) {
                        const gapLength = b2.endIndex + 1
                        strippedBody = strippedBody.substring(0, expCleanPos) + ' '.repeat(gapLength) + after.substring(gapLength)
                        continue
                    }
                }
            }
        }
        break
    }

    // 4. Inline bare-identifier spreads (...sharedTokens) and factory
    // call-spreads (...factory(...)) from local consts
    const spreadInline = inlineIdentifierSpreads(strippedBody, constObjects, factories, unresolvedSpreads)
    strippedBody = spreadInline.cleaned

    // 5. Parse direct property key-values (plus inlined const entries)
    const propEntries = extractObjectProperties(strippedBody)
    for (const extra of spreadInline.inlined) {
        propEntries.push(extra)
    }

    for (const entry of propEntries) {
        const key = cleanKey(entry.key)
        const valRaw = entry.valRaw
        const matchAbsoluteIndex = bodyGlobalOffset + entry.index
        const range = getSourceRange(sourceText, matchAbsoluteIndex, entry.length)

        if (valRaw.startsWith('[')) {
            const tupleText = valRaw.replace(/\s+as\s+[a-zA-Z0-9_$]+(\s*<[^>]*>)?\s*$/, '')
            const elements = tupleText
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim())

            const activeStates: string[] = []
            const rawStates: (string | null | undefined)[] = []
            const stateMap: Record<string, string> = {}

            elements.forEach((elem, index) => {
                if (elem && elem !== 'null' && elem !== 'undefined' && elem !== 'void 0') {
                    if (index < schemaStates.length) {
                        const sName = schemaStates[index]
                        activeStates.push(sName)
                        stateMap[sName] = elem
                    }
                    rawStates.push(elem)
                } else {
                    rawStates.push(null)
                }
            })

            ownTokens.set(key, {
                key,
                name: key,
                isTuple: true,
                states: activeStates,
                stateNames: activeStates,
                stateMap,
                rawStates,
                rawTuple: elements,
                rawValue: valRaw,
                range,
            })
        } else if (valRaw.startsWith('{')) {
            const objEntries = extractObjectProperties(valRaw.slice(1, -1))
            const recordObj: Record<string, string> = {}
            for (const objE of objEntries) {
                const recordVal = objE.valRaw.trim()
                if (!recordVal || recordVal === 'null' || recordVal === 'undefined' || recordVal === 'void 0') {
                    continue
                }
                recordObj[cleanKey(objE.key)] = objE.valRaw
            }
            const recordKeys = Object.keys(recordObj)

            ownTokens.set(key, {
                key,
                name: key,
                isTuple: false,
                isRecord: true,
                states: recordKeys,
                stateNames: recordKeys,
                stateMap: recordObj,
                recordValues: recordObj,
                rawValue: valRaw,
                range,
            })
        } else {
            ownTokens.set(key, {
                key,
                name: key,
                isTuple: false,
                states: ['enabled'],
                stateNames: ['enabled'],
                stateMap: { enabled: valRaw },
                rawValue: valRaw,
                range,
            })
        }
    }

    const defRange = getSourceRange(sourceText, createIndex, tokenObjectBlock.endIndex - createIndex)

    return {
        name: definitionName,
        filePath,
        schemaName,
        schema: boundSchema,
        schemas,
        ownTokens,
        forwarded,
        stateTriggers,
        unresolvedSpreads: unresolvedSpreads.length > 0 ? unresolvedSpreads : undefined,
        range: defRange
    }
}
