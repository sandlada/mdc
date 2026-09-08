/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * SSOT note: pure selector/string/state helpers (`splitSelectorByComma`,
 * `appendToHostSelector`, `matchVariants`, `canonicalizeState`,
 * `composeStateSelector`, `StateTriggerRegistry` + triggers) come from
 * fine-grained `@sandlada/styles/*` folder barrels (Node-safe, DOM-free).
 * This module is a thin IDE-layer adapter: it re-exports those helpers
 * (same reference, no fork), adapts static `DefinitionMeta` objects to the
 * runtime definition shape consumed by `@sandlada/styles/compiler`, and
 * adds layered preview formatting plus the rolldown+VM genuine-CSS path.
 * Do NOT fork compiler semantics here. Do NOT import `@sandlada/styles/lit`
 * (pulls `lit` runtime) or the `style-engine` aggregate.
 */
import type { DefinitionMeta, TokenValueMeta } from './types'
import { rolldown } from 'rolldown'
import * as lit from 'lit'
import * as vm from 'vm'
import * as path from 'path'
import { createRequire } from 'module'
import { defineSchema } from '@sandlada/styles/define-schema'
import { createStyleDefinition } from '@sandlada/styles/create-style-definition'
import { forwardTokens, overrideTokens, stringifyTokens } from '@sandlada/styles/tokens'
import { StateTriggerRegistry, mapStateTriggers, mapVariantTriggers, VariantTriggerRegistry } from '@sandlada/styles/triggers'
import { pipe } from '@sandlada/styles/pipe'
import {
    splitSelectorByComma,
    appendToHostSelector,
    matchVariants,
    compileStateSheet,
    compileAtRulesSheet,
    isAtRulesStylesheet,
    hasDefiniteAtRules,
    extractStateTokenMetadata,
    composeStateSelector,
    canonicalizeState,
    stripComments,
    replaceTargetInSelector,
    replaceTargetInBranch,
    removeAmpersandForHostSubtree,
    isHostMountedSelector,
    isHostRootSelector,
    hoistCondition,
    computeHoistedShell,
    wrapWithAncestorPath,
    hasNestedVariant,
    hasNestedWhen,
    handleVariantBlock,
    handleWhenBlock,
    handleStateBlock,
    extractAtRuleParams
} from '@sandlada/styles/compiler'
import { expandShape, expandMargin, expandPadding, expandTypescale } from '@sandlada/styles/expand'
export {
    splitSelectorByComma,
    appendToHostSelector,
    matchVariants,
    compileStateSheet,
    compileAtRulesSheet,
    isAtRulesStylesheet,
    hasDefiniteAtRules,
    extractStateTokenMetadata,
    composeStateSelector,
    defineSchema,
    createStyleDefinition,
    forwardTokens,
    overrideTokens,
    stringifyTokens,
    expandShape,
    expandMargin,
    expandPadding,
    expandTypescale,
    StateTriggerRegistry,
    VariantTriggerRegistry,
    mapStateTriggers,
    mapVariantTriggers,
    pipe,
    canonicalizeState,
    stripComments,
    replaceTargetInSelector,
    replaceTargetInBranch,
    removeAmpersandForHostSubtree,
    isHostMountedSelector,
    isHostRootSelector,
    hoistCondition,
    computeHoistedShell,
    wrapWithAncestorPath,
    hasNestedVariant,
    hasNestedWhen,
    handleVariantBlock,
    handleWhenBlock,
    handleStateBlock,
    extractAtRuleParams
}

export type StateName = string
export const DEFAULT_STATE_NAMES: readonly string[] = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export const STATE_NAMES: readonly string[] = DEFAULT_STATE_NAMES
export type StateDeltaName = string
export const STATE_DELTA_NAMES: readonly string[] = ['hovered', 'focused', 'pressed', 'disabled'] as const

export interface TriggerTarget {
    readonly target: 'host' | 'self'
    readonly modifier: string
}

export type CustomTriggerMap = Map<string, { target: 'host' | 'self'; modifier: string }>

/**
 * Resolves a state name to a target + selector modifier by delegating to
 * `StateTriggerRegistry` (SSOT). Custom entries override registry defaults;
 * unregistered names fall back to the registry heuristics. `anchor` is unused
 * (kept empty) because only `isHostAnchor` affects resolution.
 */
export function resolveTrigger(
    stateName: string,
    isHostAnchor: boolean,
    customTriggers?: CustomTriggerMap
): TriggerTarget {
    const registry = new StateTriggerRegistry()
    if (customTriggers) {
        for (const [name, custom] of customTriggers) {
            registry.register(name, custom.modifier)
        }
    }
    const resolved = registry.resolve(stateName, { anchor: '', isHostAnchor })
    return { target: resolved.target, modifier: resolved.modifier }
}

export interface CompilerOptions {
    readonly triggers?: CustomTriggerMap
    readonly variantSelector?: (variantName: string) => string
}

export interface StateTokenMetadata {
    isStateToken(name: string): boolean
    hasStateToken(name: string, state: string): boolean
    hasToken(name: string): boolean
    hasStateDelta(tokenName: string, state: string): boolean
    resolveStateVarName(name: string, state: string): string
    allStateTokens: ReadonlySet<string>
    allTokens: ReadonlySet<string>
    statesList: readonly string[]
    baseState: string
}

export interface Declaration {
    property: string
    value: string
    referencedTokens: string[]
    isStateful: boolean
    stateTokens: string[]
}

export interface KeyframeStep {
    selector: string
    declarations: Declaration[]
}

export interface KeyframesNode {
    type: 'keyframes'
    header: string
    steps: KeyframeStep[]
}

export interface WrapperAtRuleNode {
    type: 'wrapper-at-rule'
    atRuleHeader: string
    children: AstNode[]
}

export interface StyleRuleNode {
    type: 'style-rule'
    selector: string
    anchor: string
    hostCondition?: string
    whenCondition?: string
    declarations: Declaration[]
    elevationLevel?: number
}

export type AstNode = WrapperAtRuleNode | KeyframesNode | StyleRuleNode

export interface CompiledChunks {
    base: string[]
    deltas: Map<string, string[]>
    atRules: string[]
}

export interface CompilationResult {
    exportName: string
    definitionNames: string[]
    totalRules: number
    stats: {
        baseRules: number
        hoverRules: number
        focusRules: number
        pressRules: number
        disabledRules: number
        otherRules: number
        atRules: number
    }
    compiledCss: string
    layers: {
        tokenLayer?: string
        stateSheetLayer?: string
        staticLayer?: string
    }
}

/**
 * Builds state token metadata from a set of DefinitionMeta objects.
 * Static adapter over the same semantics as the main package
 * `extractStateTokenMetadata`: states come from each definition's schema
 * (`states[0]` is the base state), records count as state tokens, and
 * deltas are computed by comparing values against the base value.
 */
export function extractStateTokenMetadataFromMeta(definitions: (DefinitionMeta | undefined)[]): StateTokenMetadata {
    const statesList: string[] = []
    const pushState = (s: string) => {
        if (s && !statesList.includes(s)) statesList.push(s)
    }

    for (const def of definitions) {
        if (!def) continue
        const schemaStates: string[] | undefined = (def.schema as { states?: string[] } | undefined)?.states
        if (schemaStates && schemaStates.length > 0) {
            for (const s of schemaStates) pushState(s)
        }
    }
    if (statesList.length === 0) {
        for (const s of DEFAULT_STATE_NAMES) pushState(s)
    }
    const baseState = statesList[0] ?? 'enabled'

    const allTokens = new Set<string>()
    const allStateTokens = new Set<string>()
    const definedStatesPerToken = new Map<string, Set<string>>()
    const deltaStatesPerToken = new Map<string, Set<string>>()
    const stateVarMap = new Map<string, string>()

    const ensureTokenStates = (key: string): Set<string> => {
        let set = definedStatesPerToken.get(key)
        if (!set) {
            set = new Set<string>()
            definedStatesPerToken.set(key, set)
        }
        return set
    }
    const ensureDeltaStates = (key: string): Set<string> => {
        let set = deltaStatesPerToken.get(key)
        if (!set) {
            set = new Set<string>()
            deltaStatesPerToken.set(key, set)
        }
        return set
    }
    const registerStateName = (tokenStates: Set<string>, key: string, sName: string) => {
        tokenStates.add(sName)
        stateVarMap.set(`${key}:${sName}`, `${sName}-${key}`)
        const canonical = canonicalizeState(sName)
        if (canonical !== sName) {
            tokenStates.add(canonical)
            stateVarMap.set(`${key}:${canonical}`, `${sName}-${key}`)
        }
    }

    for (const def of definitions) {
        if (!def) continue
        for (const [rawKey, token] of def.ownTokens) {
            const key = rawKey.replace(/^--_/, '').replace(/^--/, '')
            if (!key) continue
            allTokens.add(key)

            if (token.isTuple || token.isRecord) {
                allStateTokens.add(key)
                const tokenStates = ensureTokenStates(key)
                const deltaStates = ensureDeltaStates(key)
                const stateMap: Record<string, string> = token.stateMap ?? {}

                const baseValRaw = stateMap[baseState] ?? stateMap['enabled'] ?? Object.values(stateMap)[0]
                const baseValStr = baseValRaw === null || baseValRaw === undefined ? '' : String(baseValRaw)

                stateVarMap.set(`${key}:${baseState}`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:enabled`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:base`, `${baseState}-${key}`)

                for (const sName of Object.keys(stateMap)) {
                    const sVal = stateMap[sName]
                    if (sVal === null || sVal === undefined) continue
                    const sValStr = String(sVal)
                    registerStateName(tokenStates, key, sName)
                    if (sName !== baseState && sName !== 'enabled' && sValStr !== baseValStr) {
                        deltaStates.add(sName)
                        const canonical = canonicalizeState(sName)
                        if (canonical !== sName) deltaStates.add(canonical)
                    }
                }
                continue
            }

            stateVarMap.set(`${key}:${baseState}`, key)
            stateVarMap.set(`${key}:enabled`, key)
            stateVarMap.set(`${key}:base`, key)
        }
    }

    const resolveStateVarName = (name: string, state: string): string => {
        const clean = name.replace(/^--_?/, '')
        const canonical = canonicalizeState(state)
        const exact = stateVarMap.get(`${clean}:${state}`) ?? stateVarMap.get(`${clean}:${canonical}`)
        if (exact) return exact
        if (state === 'base' || state === 'enabled' || state === baseState) {
            const baseVar = stateVarMap.get(`${clean}:${baseState}`)
                ?? stateVarMap.get(`${clean}:enabled`)
                ?? stateVarMap.get(`${clean}:base`)
            if (baseVar) return baseVar
            return clean
        }
        return `${state}-${clean}`
    }

    return {
        isStateToken(name: string) {
            const clean = name.replace(/^--_?/, '')
            return allStateTokens.has(clean)
        },
        hasStateToken(name: string, state: string) {
            const clean = name.replace(/^--_?/, '')
            const states = definedStatesPerToken.get(clean)
            if (!states) return false
            const canonical = canonicalizeState(state)
            return states.has(state) || states.has(canonical)
        },
        hasToken(name: string) {
            const clean = name.replace(/^--_?/, '')
            return allTokens.has(clean) || stateVarMap.has(`${clean}:${baseState}`)
        },
        hasStateDelta(tokenName: string, state: string) {
            const clean = tokenName.replace(/^--_?/, '')
            const deltas = deltaStatesPerToken.get(clean)
            if (!deltas) return false
            const canonical = canonicalizeState(state)
            return deltas.has(state) || deltas.has(canonical)
        },
        resolveStateVarName,
        allStateTokens,
        allTokens,
        statesList,
        baseState
    }
}

/**
 * Strips template interpolation placeholders (e.g. `${tokens}`,
 * `${overrideTokens(...)}`) from extracted `css` template bodies so the
 * static preview compiles the literal CSS. Runtime interpolation values
 * are covered by the genuine-CSS VM path (`compileExportedStylesToCss`).
 */
function cleanTemplateInterpolations(raw: string): string {
    return raw.replace(/\$\{[\s\S]*?\}/g, '')
}

/**
 * Cleanly formats CSS declarations and blocks for readable presentation.
 * IDE-layer only; compiler semantics live in `@sandlada/styles/compiler`.
 */
export function formatCss(rawCss: string): string {
    let result = ''
    let indent = 0
    const indentUnit = '    '
    let inComment = false
    let inString: string | null = null
    let parenDepth = 0

    const clean = rawCss.replace(/\r\n/g, '\n')
    let buffer = ''

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i]
        const next = clean[i + 1]

        // Comments
        if (!inString && char === '/' && next === '*') {
            inComment = true
            buffer += '/*'
            i++
            continue
        }
        if (inComment) {
            buffer += char
            if (char === '*' && next === '/') {
                inComment = false
                buffer += '/'
                i++
            }
            continue
        }

        // Strings
        if (char === '"' || char === "'") {
            if (inString === char) {
                inString = null
            } else if (!inString) {
                inString = char
            }
            buffer += char
            continue
        }
        if (inString) {
            buffer += char
            continue
        }

        // Parens
        if (char === '(') {
            parenDepth++
            buffer += char
            continue
        }
        if (char === ')') {
            parenDepth = Math.max(0, parenDepth - 1)
            buffer += char
            continue
        }

        if (parenDepth === 0) {
            if (char === '{') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += (result.endsWith('\n') || result === '' ? '' : '\n') +
                        indentUnit.repeat(indent) + trimmed + ' {\n'
                } else {
                    result += ' {\n'
                }
                buffer = ''
                indent++
                continue
            }
            if (char === '}') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += indentUnit.repeat(indent) + trimmed + (trimmed.endsWith(';') ? '' : ';') + '\n'
                }
                buffer = ''
                indent = Math.max(0, indent - 1)
                result += indentUnit.repeat(indent) + '}\n\n'
                continue
            }
            if (char === ';') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += indentUnit.repeat(indent) + trimmed + ';\n'
                }
                buffer = ''
                continue
            }
        }

        buffer += char
    }

    const remaining = buffer.trim()
    if (remaining) {
        result += indentUnit.repeat(indent) + remaining + '\n'
    }

    return result.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Counts total CSS rules in a stylesheet string.
 */
export function countCssRules(cssText: string): number {
    const matches = cssText.match(/\{/g)
    return matches ? matches.length : 0
}

/**
 * Adapts static `DefinitionMeta` objects (regex-extracted, range-annotated) to
 * the runtime definition shape consumed by `@sandlada/styles/compiler`
 * (`{ schema: { states }, tokens }`). Enables parity checks and one-off
 * delegation (e.g. `compileStateSheet(synthetic, css)`) without forking
 * semantics. Returns a single merged definition; callers with multiple
 * definitions should pass them all at once.
 */
export function definitionMetasToStyleDefinition(
    definitions: (DefinitionMeta | undefined)[]
): Record<string, any> {
    const statesList: string[] = []
    const pushState = (s: string) => {
        if (s && !statesList.includes(s)) statesList.push(s)
    }
    for (const def of definitions) {
        if (!def) continue
        const schemaStates: string[] | undefined = (def.schema as { states?: string[] } | undefined)?.states
            ?? (def.schema as { flatStates?: string[] } | undefined)?.flatStates
        if (schemaStates && schemaStates.length > 0) {
            for (const s of schemaStates) pushState(s)
        }
    }
    if (statesList.length === 0) {
        for (const s of DEFAULT_STATE_NAMES) pushState(s)
    }

    const tokens: Record<string, any> = {}
    for (const def of definitions) {
        if (!def) continue
        for (const [rawKey, token] of def.ownTokens) {
            const key = rawKey.replace(/^--_/, '').replace(/^--/, '')
            if (!key || key in tokens) continue
            const stateMap: Record<string, string> = (token as TokenValueMeta).stateMap ?? {}
            if ((token as TokenValueMeta).isTuple) {
                tokens[key] = statesList.map((s) => stateMap[s] ?? stateMap['enabled'] ?? null)
            } else if ((token as TokenValueMeta).isRecord) {
                tokens[key] = { ...stateMap }
            } else {
                tokens[key] = (token as TokenValueMeta).rawValue ?? ''
            }
        }
    }

    return { schema: { states: statesList }, tokens }
}

/**
 * Builds a `StateTriggerRegistry` (SSOT) from analyzed definition triggers.
 */
function buildRegistryFromMetas(defMetas: (DefinitionMeta | undefined)[]): StateTriggerRegistry {
    const registry = new StateTriggerRegistry()
    for (const meta of defMetas) {
        if (!meta || !meta.stateTriggers) continue
        for (const [stateName, trigger] of meta.stateTriggers) {
            if (!stateName) continue
            const modifier = trigger.modifier ?? trigger.selector ?? ''
            if (!modifier) continue
            try {
                registry.register(stateName, modifier)
            } catch {
                continue
            }
        }
    }
    return registry
}

/**
 * Extracts and compiles the entire exported CSSResult / CSSResult[] from a *.style.ts file
 * via single-path delegation to `compileStateSheet` (which auto-routes
 * new-system At-Rules vs legacy `@anchor`/`@size` sheets).
 */
export function compileExportedStylesToCssSync(
    sourceText: string,
    definitionMetaMap?: Map<string, DefinitionMeta>,
    filePath: string = 'style.ts'
): CompilationResult {
    // 1. Find `export const [XxxStyles] = ...`
    const exportRegex = /export\s+const\s+([a-zA-Z0-9_$]+Styles?)\s*=\s*([\s\S]+)$/m
    const expMatch = exportRegex.exec(sourceText)
    const exportName = expMatch ? expMatch[1] : 'Styles'

    // 2. Discover all Definition names referenced in file
    const defNames: string[] = []
    const defRefRegex = /createStyleSheet\s*\(\s*(?:\[([^\]]+)\]|([a-zA-Z0-9_$]+))/g
    let dMatch: RegExpExecArray | null
    while ((dMatch = defRefRegex.exec(sourceText)) !== null) {
        if (dMatch[1]) {
            const names = dMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
            defNames.push(...names)
        } else if (dMatch[2]) {
            defNames.push(dMatch[2].trim())
        }
    }
    // Curried definition-second application: createStyleSheet(..)(Def) / pipe(..)(Def)
    const curriedDefRegex = /\)\s*\(\s*([a-zA-Z0-9_$]+)\s*\)\s*(?:=>|`)/g
    while ((dMatch = curriedDefRegex.exec(sourceText)) !== null) {
        defNames.push(dMatch[1].trim())
    }
    const uniqueDefNames = Array.from(new Set(defNames))

    // 3. Build registry from analyzed definitions (SSOT: StateTriggerRegistry)
    const defMetas = definitionMetaMap
        ? uniqueDefNames.map((n) => definitionMetaMap.get(n)).filter(Boolean)
        : []
    const registry = buildRegistryFromMetas(defMetas as (DefinitionMeta | undefined)[])
    const stateMeta = extractStateTokenMetadataFromMeta(defMetas as (DefinitionMeta | undefined)[])

    // 4. Extract Token declarations mirroring stringifyTokens shape (names only, no runtime values)
    const tokenPrefixes = new Map<string, string>()
    const stringifyCallRegex = /stringifyTokens\s*\(\s*(?:\{\s*prefix\s*:\s*['"`]([^'"`]+)['"`][\s\S]*?\}|['"`]([^'"`]+)['"`])\s*\)\s*\(\s*([a-zA-Z0-9_$]+)\s*\)/g
    let sMatch: RegExpExecArray | null
    while ((sMatch = stringifyCallRegex.exec(sourceText)) !== null) {
        const prefix = (sMatch[1] ?? sMatch[2] ?? '').trim()
        const defName = (sMatch[3] ?? '').trim()
        if (prefix && defName && !tokenPrefixes.has(defName)) {
            tokenPrefixes.set(defName, prefix.startsWith('--') ? prefix : `--${prefix}`)
        }
    }

    let tokenLayer = ''
    if (defMetas.length > 0) {
        const lines: string[] = [':host {']
        for (const meta of defMetas) {
            if (!meta) continue
            const prefix = tokenPrefixes.get(meta.name) ?? '--mdc-component'
            for (const [key, token] of meta.ownTokens) {
                if (token.isTuple || token.isRecord) {
                    const states = token.states && token.states.length > 0 ? token.states : [stateMeta.baseState]
                    for (const sName of states) {
                        lines.push(`    --_${sName}-${key}: var(${prefix}-${sName}-${key});`)
                    }
                } else {
                    lines.push(`    --_${key}: var(${prefix}-${key});`)
                }
            }
        }
        lines.push('}')
        if (lines.length > 2) {
            tokenLayer = lines.join('\n')
        }
    }

    // 5. Extract all createStyleSheet template bodies, single-path via compileStateSheet
    const synthetic = definitionMetasToStyleDefinition(defMetas as (DefinitionMeta | undefined)[])
    const baseChunks: string[] = []
    const cssTemplateRegex = /(?:createStyleSheet\s*\([\s\S]*?\)\s*=>\s*)?css`([\s\S]*?)`/g
    let cMatch: RegExpExecArray | null
    while ((cMatch = cssTemplateRegex.exec(sourceText)) !== null) {
        const rawTemplate = cMatch[1]
        const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
        const stripped = stripComments(cleanTemplate)
        if (!stripped.trim()) continue
        const compiled = compileStateSheet(synthetic, stripped, { registry })
        if (compiled) {
            for (const r of compiled.split(/\n\n+/).map((r) => r.trim()).filter(Boolean)) {
                baseChunks.push(r)
            }
        }
    }

    if (baseChunks.length === 0) {
        const rawSheetRegex = /createStyleSheet\s*\([\s\S]*?,?\s*`([\s\S]*?)`\)/g
        while ((cMatch = rawSheetRegex.exec(sourceText)) !== null) {
            const rawTemplate = cMatch[1]
            const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
            const stripped = stripComments(cleanTemplate)
            if (!stripped.trim()) continue
            const compiled = compileStateSheet(synthetic, stripped, { registry })
            if (compiled) {
                for (const r of compiled.split(/\n\n+/).map((r) => r.trim()).filter(Boolean)) {
                    baseChunks.push(r)
                }
            }
        }
    }

    // 6. Aggregate statistics (single-path output lands in base)
    const stats = {
        baseRules: baseChunks.length,
        hoverRules: 0,
        focusRules: 0,
        pressRules: 0,
        disabledRules: 0,
        otherRules: 0,
        atRules: 0
    }
    const totalRules = stats.baseRules

    // 7. Format Output Document
    const sections: string[] = []
    const cleanFileName = filePath.split(/[/\\]/).pop() || filePath
    sections.push(`/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live)
 * Source: ${cleanFileName}
 * Export: ${exportName} (CSSResult / CSSResult[])
 * Definitions: ${uniqueDefNames.length > 0 ? uniqueDefNames.join(', ') : 'None'}
 * Rules Generated: ${totalRules} (Base: ${stats.baseRules}, Hover: ${stats.hoverRules}, Focus: ${stats.focusRules}, Press: ${stats.pressRules}, Disabled: ${stats.disabledRules}, AtRules: ${stats.atRules})
 * ====================================================================
 */`)

    if (tokenLayer) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 1] Token Variable Declarations (:host)
 * -------------------------------------------------------------------- */
${tokenLayer}`)
    }

    if (baseChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2] Base / Enabled State Rules
 * -------------------------------------------------------------------- */
${baseChunks.join('\n\n')}`)
    }

    const compiledCss = sections.join('\n\n')

    return {
        exportName,
        definitionNames: uniqueDefNames,
        totalRules,
        stats,
        compiledCss,
        layers: {
            tokenLayer,
            stateSheetLayer: baseChunks.join('\n\n'),
            staticLayer: ''
        }
    }
}

/**
 * Dynamically bundles and evaluates the exported CSSResult / CSSResult[] from a *.style.ts file
 * in a real VM environment, yielding the 100% genuine compiled CSS.
 * Gracefully falls back to static single-path compilation if dynamic evaluation fails.
 */
export async function compileExportedStylesToCss(
    sourceText: string,
    definitionMetaMap?: Map<string, DefinitionMeta>,
    filePath: string = 'style.ts'
): Promise<CompilationResult> {
    const cleanFileName = filePath.split(/[/\\]/).pop() || filePath
    const absPath = path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(process.cwd(), filePath)

    try {
        // 1. Bundle with Rolldown in Node environment
        const bundle = await rolldown({
            input: absPath,
            platform: 'node',
            external: ['lit'],
            plugins: [
                {
                    name: 'in-memory-source',
                    load(id: string) {
                        const normId = path.resolve(id).replace(/\\/g, '/').toLowerCase()
                        const normEntry = absPath.replace(/\\/g, '/').toLowerCase()
                        if (normId === normEntry && sourceText) {
                            return { code: sourceText }
                        }
                        return null
                    }
                }
            ]
        })

        const { output } = await bundle.generate({ format: 'cjs' })
        const code = output[0]?.code || ''

        // 2. Run inside VM Sandbox with real lit / unsafeCSS / CSSResult
        const modExports: Record<string, any> = {}
        const sandbox = {
            module: { exports: modExports },
            exports: modExports,
            require: (id: string) => {
                if (id === 'lit') return lit
                try {
                    return createRequire(absPath)(id)
                } catch {
                    throw new Error(`Cannot resolve module: ${id}`)
                }
            },
            console
        }

        vm.createContext(sandbox)
        vm.runInContext(code, sandbox)

        const exported = sandbox.module.exports || {}
        const exportKeys = Object.keys(exported)
        const styleKey = exportKeys.find((k) => k.toLowerCase().includes('style')) || exportKeys[0] || 'Styles'
        const styleValue = exported[styleKey]

        // 3. Extract and concatenate all CSSResult items
        const rawCssParts: string[] = []
        const flattenItems = (items: any) => {
            if (!items) return
            if (Array.isArray(items)) {
                for (const item of items) flattenItems(item)
            } else if (typeof items === 'object' && items.cssText !== undefined) {
                rawCssParts.push(items.cssText)
            } else if (typeof items === 'string') {
                rawCssParts.push(items)
            } else {
                rawCssParts.push(String(items))
            }
        }
        flattenItems(styleValue)

        if (rawCssParts.length === 0) {
            throw new Error(`No CSSResult items found in export '${styleKey}'.`)
        }

        // 4. Format each CSS part
        const formattedParts = rawCssParts.map((part, idx) => {
            const formatted = formatCss(part)
            return `/* --------------------------------------------------------------------
 * [Part ${idx + 1}] CSSResult Chunk
 * -------------------------------------------------------------------- */
${formatted}`
        })

        const combinedRaw = rawCssParts.join('\n\n')
        const ruleCount = countCssRules(combinedRaw)
        const totalSize = (combinedRaw.length / 1024).toFixed(1)

        const header = `/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live)
 * Source: ${cleanFileName}
 * Export: ${styleKey} (${rawCssParts.length} CSSResult ${rawCssParts.length === 1 ? 'part' : 'parts'})
 * Size: ${totalSize} KB | Total Rules: ${ruleCount}
 * Status: Genuine CSSResult Compilation (100% Real Runtime Output)
 * ====================================================================
 */`

        const compiledCss = [header, ...formattedParts].join('\n\n')

        return {
            exportName: styleKey,
            definitionNames: Array.from(definitionMetaMap?.keys() || []),
            totalRules: ruleCount,
            stats: {
                baseRules: ruleCount,
                hoverRules: 0,
                focusRules: 0,
                pressRules: 0,
                disabledRules: 0,
                otherRules: 0,
                atRules: 0
            },
            compiledCss,
            layers: {
                tokenLayer: rawCssParts[0] || '',
                stateSheetLayer: rawCssParts.slice(1).join('\n\n'),
                staticLayer: ''
            }
        }
    } catch (err: any) {
        // Fallback to static single-path compiler
        const fallbackResult = compileExportedStylesToCssSync(sourceText, definitionMetaMap, filePath)
        const warnHeader = `/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live - Fallback Mode)
 * Source: ${cleanFileName}
 * Note: Dynamic CSSResult evaluation encountered a syntax/load error:
 *       ${err?.message || String(err)}
 * Displaying Static AST Differential Compilation below.
 * ====================================================================
 */`
        return {
            ...fallbackResult,
            compiledCss: `${warnHeader}\n\n${fallbackResult.compiledCss}`
        }
    }
}
