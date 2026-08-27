/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta, TokenValueMeta } from './types'
import { rolldown } from 'rolldown'
import * as lit from 'lit'
import * as vm from 'vm'
import * as path from 'path'
import { createRequire } from 'module'

export type StateName = 'enabled' | 'hovered' | 'focused' | 'pressed' | 'disabled'
export const STATE_NAMES: readonly StateName[] = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export type StateDeltaName = 'hovered' | 'focused' | 'pressed' | 'disabled'
export const STATE_DELTA_NAMES: readonly StateDeltaName[] = ['hovered', 'focused', 'pressed', 'disabled'] as const

export interface StateTokenMetadata {
    isStateToken(name: string): boolean
    hasStateToken(name: string, state: StateName): boolean
    allStateTokens: ReadonlySet<string>
}

export interface Declaration {
    property: string
    value: string
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
    whenCondition?: string
    declarations: Declaration[]
}

export type AstNode = WrapperAtRuleNode | KeyframesNode | StyleRuleNode

export interface CompiledChunks extends Record<StateDeltaName, string[]> {
    base: string[]
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
 */
export function extractStateTokenMetadataFromMeta(definitions: (DefinitionMeta | undefined)[]): StateTokenMetadata {
    const stateTokens = new Set<string>()
    const definedStatesPerToken = new Map<string, Set<StateName>>()

    for (const def of definitions) {
        if (!def) continue
        for (const [key, token] of def.ownTokens) {
            const cleanKey = key.replace(/^--_/, '').replace(/^--/, '')
            if (token.isTuple) {
                stateTokens.add(cleanKey)
                const states = new Set<StateName>()
                const activeStates = token.states || ['enabled', 'hovered', 'focused', 'pressed', 'disabled']
                for (const st of activeStates) {
                    if (STATE_NAMES.includes(st as StateName)) {
                        states.add(st as StateName)
                    }
                }
                definedStatesPerToken.set(cleanKey, states)
            }
        }
    }

    return {
        isStateToken(name: string) {
            return stateTokens.has(name)
        },
        hasStateToken(name: string, state: StateName) {
            return definedStatesPerToken.get(name)?.has(state) ?? false
        },
        allStateTokens: stateTokens,
    }
}

function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseDeclarationString(raw: string, meta: StateTokenMetadata): Declaration | null {
    const colonIdx = raw.indexOf(':')
    if (colonIdx === -1) return null

    const property = raw.slice(0, colonIdx).trim()
    const value = raw.slice(colonIdx + 1).trim()
    if (!property || !value) return null

    const stateTokens: string[] = []
    const varMatches = value.matchAll(/var\(--_([a-zA-Z0-9_-]+)\)/g)
    for (const match of varMatches) {
        const tokenName = match[1]
        if (meta.isStateToken(tokenName)) {
            stateTokens.push(tokenName)
        }
    }

    return {
        property,
        value,
        isStateful: stateTokens.length > 0,
        stateTokens,
    }
}

function parseKeyframeSteps(body: string, meta: StateTokenMetadata): KeyframeStep[] {
    const steps: KeyframeStep[] = []
    let i = 0
    const len = body.length

    while (i < len) {
        while (i < len && /\s/.test(body[i])) i++
        if (i >= len) break

        const openBrace = body.indexOf('{', i)
        if (openBrace === -1) break

        const selector = body.slice(i, openBrace).trim()
        let depth = 1
        let j = openBrace + 1

        while (j < len && depth > 0) {
            if (body[j] === '{') depth++
            else if (body[j] === '}') depth--
            j++
        }

        const stepContent = body.slice(openBrace + 1, j - 1).trim()
        i = j

        const declStrings = stepContent.split(';')
        const declarations: Declaration[] = []
        for (const raw of declStrings) {
            const trimmed = raw.trim()
            if (!trimmed) continue
            const decl = parseDeclarationString(trimmed, meta)
            if (decl) declarations.push(decl)
        }

        if (selector) {
            steps.push({ selector, declarations })
        }
    }

    return steps
}

function isWrapperAtRule(header: string): boolean {
    return /^@(layer|media|supports|container|starting-style)(\s|$)/i.test(header)
}

function isKeyframesAtRule(header: string): boolean {
    return /^@(-webkit-)?keyframes(\s|$)/i.test(header)
}

/**
 * Recursive CSS parser supporting @anchor, @when, @keyframes, nested selectors, and wrapper at-rules.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentWhen?: string,
    isExplicitAnchor: boolean = false
): AstNode[] {
    const nodes: AstNode[] = []
    const currentDeclarations: Declaration[] = []

    let i = 0
    const len = css.length

    while (i < len) {
        while (i < len && /\s/.test(css[i])) i++
        if (i >= len) break

        const nextSemicolon = css.indexOf(';', i)
        const nextOpenBrace = css.indexOf('{', i)

        if (nextSemicolon === -1 && nextOpenBrace === -1) {
            break
        }

        // Case 1: Declaration before any nested block '{'
        if (nextSemicolon !== -1 && (nextOpenBrace === -1 || nextSemicolon < nextOpenBrace)) {
            const declChunk = css.slice(i, nextSemicolon).trim()
            if (declChunk) {
                const decl = parseDeclarationString(declChunk, meta)
                if (decl) {
                    currentDeclarations.push(decl)
                }
            }
            i = nextSemicolon + 1
            continue
        }

        // Case 2: Nested block encountered
        const header = css.slice(i, nextOpenBrace).trim()
        let depth = 1
        let j = nextOpenBrace + 1

        while (j < len && depth > 0) {
            if (css[j] === '{') depth++
            else if (css[j] === '}') depth--
            j++
        }

        const body = css.slice(nextOpenBrace + 1, j - 1).trim()
        i = j

        if (!header) continue

        // Handle @anchor
        if (header.startsWith('@anchor')) {
            const anchorSelector = header.replace(/^@anchor\s+/, '').trim()
            const childRules = parseCssRecursive(body, meta, anchorSelector, anchorSelector, currentWhen, true)
            nodes.push(...childRules)
            continue
        }

        // Handle @when(...)
        if (header.startsWith('@when')) {
            const whenMatch = header.match(/^@when\((.*?)\)/)
            const whenCondition = whenMatch ? whenMatch[1].trim() : ''
            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, whenCondition, isExplicitAnchor)
            nodes.push(...childRules)
            continue
        }

        // Handle @keyframes
        if (isKeyframesAtRule(header)) {
            const steps = parseKeyframeSteps(body, meta)
            nodes.push({
                type: 'keyframes',
                header,
                steps,
            })
            continue
        }

        // Handle wrapper at-rules
        if (isWrapperAtRule(header)) {
            const children = parseCssRecursive(body, meta, currentAnchor, currentTarget, currentWhen, isExplicitAnchor)
            nodes.push({
                type: 'wrapper-at-rule',
                atRuleHeader: header,
                children,
            })
            continue
        }

        // Host selector refinement
        let childAnchor = currentAnchor
        if (!isExplicitAnchor && header.startsWith(':host')) {
            childAnchor = header
        }

        // Nested selector composition
        let composedTarget = header
        if (currentTarget) {
            if (header.startsWith('&')) {
                composedTarget = header.replace(/^&/, currentTarget)
            } else if (currentTarget !== childAnchor) {
                composedTarget = `${currentTarget} ${header}`
            } else {
                composedTarget = `${childAnchor} ${header}`
            }
        }

        const childRules = parseCssRecursive(body, meta, childAnchor, composedTarget, currentWhen, isExplicitAnchor)
        nodes.push(...childRules)
    }

    if (currentDeclarations.length > 0) {
        nodes.unshift({
            type: 'style-rule',
            selector: currentTarget || currentAnchor,
            anchor: currentAnchor,
            whenCondition: currentWhen,
            declarations: currentDeclarations,
        })
    }

    return nodes
}

function resolveStateValue(decl: Declaration, state: StateName, meta: StateTokenMetadata): string {
    let result = decl.value
    for (const token of decl.stateTokens) {
        if (meta.hasStateToken(token, state)) {
            const stateTokenVar = `--_${state}-${token}`
            result = result.replaceAll(`var(--_${token})`, `var(${stateTokenVar})`)
        } else {
            const fallbackTokenVar = `--_enabled-${token}`
            result = result.replaceAll(`var(--_${token})`, `var(${fallbackTokenVar})`)
        }
    }
    return result
}

function declHasStateDelta(decl: Declaration, state: StateDeltaName, meta: StateTokenMetadata): boolean {
    if (!decl.isStateful) return false
    return decl.stateTokens.some((token) => meta.hasStateToken(token, state))
}

function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector
    if (hostSelector === ':host') return `:host(${modifier})`

    if (hostSelector.startsWith(':host(')) {
        let depth = 0
        let closeIdx = -1
        for (let i = 5; i < hostSelector.length; i++) {
            if (hostSelector[i] === '(') depth++
            else if (hostSelector[i] === ')') {
                depth--
                if (depth === 0) {
                    closeIdx = i
                    break
                }
            }
        }
        if (closeIdx !== -1) {
            const inner = hostSelector.slice(6, closeIdx)
            const after = hostSelector.slice(closeIdx + 1)
            return `:host(${inner}${modifier})${after}`
        }
    }
    return `${hostSelector}${modifier}`
}

function buildStateSelector(
    anchor: string,
    targetSelector: string,
    whenCondition: string | undefined,
    stateIndex: number
): string {
    const isHostAnchor = anchor === ':host' || anchor.startsWith(':host(')
    const stateName = STATE_NAMES[stateIndex]

    let stateMod = ''
    if (stateName === 'hovered') stateMod = ':hover'
    else if (stateName === 'focused') stateMod = ':focus-within'
    else if (stateName === 'pressed') stateMod = ':active'
    else if (stateName === 'disabled') stateMod = isHostAnchor ? '[disabled]' : '.disabled'

    let composedAnchor = anchor
    if (whenCondition) {
        if (isHostAnchor) {
            composedAnchor = appendToHostSelector(composedAnchor, whenCondition)
        } else {
            if (whenCondition.startsWith('.') || whenCondition.startsWith('[') || whenCondition.startsWith(':')) {
                composedAnchor = `${anchor}${whenCondition}`
            } else {
                composedAnchor = `${anchor}.${whenCondition}`
            }
        }
    }

    if (stateMod) {
        if (isHostAnchor) {
            composedAnchor = appendToHostSelector(composedAnchor, stateMod)
        } else {
            if (stateName === 'disabled') {
                composedAnchor = whenCondition ? `${anchor}.disabled${whenCondition}` : `${anchor}.disabled`
            } else {
                composedAnchor = `${composedAnchor}${stateMod}`
            }
        }
    }

    if (!targetSelector || targetSelector === anchor) {
        return composedAnchor
    }

    if (targetSelector.startsWith(anchor)) {
        const remaining = targetSelector.slice(anchor.length).trim()
        return remaining ? `${composedAnchor} ${remaining}` : composedAnchor
    }

    return `${composedAnchor} ${targetSelector}`
}

function compileAstNodes(nodes: AstNode[], meta: StateTokenMetadata): CompiledChunks {
    const chunks: CompiledChunks = {
        base: [],
        hovered: [],
        focused: [],
        pressed: [],
        disabled: [],
        atRules: [],
    }

    for (const node of nodes) {
        if (node.type === 'style-rule') {
            const { anchor, selector, whenCondition, declarations } = node

            // 1. Base rule
            const baseDecls: string[] = []
            for (const decl of declarations) {
                if (decl.isStateful) {
                    const resolvedVal = resolveStateValue(decl, 'enabled', meta)
                    baseDecls.push(`${decl.property}: ${resolvedVal};`)
                } else {
                    baseDecls.push(`${decl.property}: ${decl.value};`)
                }
            }

            if (baseDecls.length > 0) {
                const baseSel = buildStateSelector(anchor, selector, whenCondition, 0)
                chunks.base.push(`${baseSel} {\n    ${baseDecls.join('\n    ')}\n}`)
            }

            // 2. State delta rules
            for (let i = 0; i < STATE_DELTA_NAMES.length; i++) {
                const state = STATE_DELTA_NAMES[i]
                const stateDecls: string[] = []

                for (const decl of declarations) {
                    if (declHasStateDelta(decl, state, meta)) {
                        const resolvedVal = resolveStateValue(decl, state, meta)
                        stateDecls.push(`${decl.property}: ${resolvedVal};`)
                    }
                }

                if (stateDecls.length > 0) {
                    const stateSel = buildStateSelector(anchor, selector, whenCondition, i + 1)
                    chunks[state].push(`${stateSel} {\n    ${stateDecls.join('\n    ')}\n}`)
                }
            }
        } else if (node.type === 'keyframes') {
            const stepStrings: string[] = []
            for (const step of node.steps) {
                const declStrings: string[] = []
                for (const decl of step.declarations) {
                    if (decl.isStateful) {
                        const resolvedVal = resolveStateValue(decl, 'enabled', meta)
                        declStrings.push(`${decl.property}: ${resolvedVal};`)
                    } else {
                        declStrings.push(`${decl.property}: ${decl.value};`)
                    }
                }
                stepStrings.push(`    ${step.selector} {\n        ${declStrings.join('\n        ')}\n    }`)
            }
            chunks.atRules.push(`${node.header} {\n${stepStrings.join('\n\n')}\n}`)
        } else if (node.type === 'wrapper-at-rule') {
            const inner = compileAstNodes(node.children, meta)
            const allInner: string[] = []
            if (inner.base.length > 0) allInner.push(inner.base.join('\n\n'))
            if (inner.hovered.length > 0) allInner.push(inner.hovered.join('\n\n'))
            if (inner.focused.length > 0) allInner.push(inner.focused.join('\n\n'))
            if (inner.pressed.length > 0) allInner.push(inner.pressed.join('\n\n'))
            if (inner.disabled.length > 0) allInner.push(inner.disabled.join('\n\n'))
            if (inner.atRules.length > 0) allInner.push(inner.atRules.join('\n\n'))

            if (allInner.length > 0) {
                const indented = allInner.join('\n\n').split('\n').map((l) => (l ? `    ${l}` : '')).join('\n')
                chunks.atRules.push(`${node.atRuleHeader} {\n${indented}\n}`)
            }
        }
    }

    return chunks
}

/**
 * Cleans template interpolation wrappers (e.g. `${overrideStyleSheet(...)}` -> CSS properties).
 */
function cleanTemplateInterpolations(raw: string): string {
    return raw.replace(/\$\{\s*overrideStyleSheet\([^,]+,\s*['"`]([^'"`]+)['"`],\s*\{([\s\S]*?)\}\s*\)\s*\};?/g, (_, prefix, propBody) => {
        const cleanPrefix = prefix.replace(/-$/, '')
        const propLines = propBody.split(',')
        const res: string[] = []
        for (const p of propLines) {
            const m = /['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:\s*['"`]?([^'"`]+)['"`]?/.exec(p)
            if (m) {
                const propKey = m[1]
                const propVal = m[2]
                res.push(`${cleanPrefix}-${propKey}: ${propVal};`)
            }
        }
        return res.join('\n')
    })
}

/**
 * Cleanly formats CSS declarations and blocks for readable presentation.
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
 * Extracts and compiles the entire exported CSSResult / CSSResult[] from a *.style.ts file
 * via static AST differential analysis.
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
    const uniqueDefNames = Array.from(new Set(defNames))

    // 3. Build state token metadata
    const defMetas = definitionMetaMap
        ? uniqueDefNames.map((n) => definitionMetaMap.get(n)).filter(Boolean)
        : []
    const stateMeta = extractStateTokenMetadataFromMeta(defMetas)

    // 4. Extract Token declarations (:host variable block if present)
    let tokenLayer = ''
    const tokenRecordMatch = /defineTokenRefsRecord\s*\(\s*([a-zA-Z0-9_$]+)/.exec(sourceText)
    if (tokenRecordMatch && defMetas.length > 0) {
        const lines: string[] = [':host {']
        for (const meta of defMetas) {
            if (!meta) continue
            for (const [key, token] of meta.ownTokens) {
                if (token.isTuple && token.rawStates) {
                    lines.push(`    --_${key}: var(--_enabled-${key});`)
                }
            }
        }
        lines.push('}')
        if (lines.length > 2) {
            tokenLayer = lines.join('\n')
        }
    }

    // 5. Extract all createStyleSheet template bodies
    const stateRulesList: CompiledChunks[] = []

    const cssTemplateRegex = /(?:createStyleSheet\s*\([\s\S]*?\)\s*=>\s*)?css`([\s\S]*?)`/g
    let cMatch: RegExpExecArray | null
    while ((cMatch = cssTemplateRegex.exec(sourceText)) !== null) {
        const rawTemplate = cMatch[1]
        const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
        const stripped = stripComments(cleanTemplate)
        const nodes = parseCssRecursive(stripped, stateMeta)
        const chunks = compileAstNodes(nodes, stateMeta)
        stateRulesList.push(chunks)
    }

    if (stateRulesList.length === 0) {
        const rawSheetRegex = /createStyleSheet\s*\([\s\S]*?,?\s*`([\s\S]*?)`\)/g
        while ((cMatch = rawSheetRegex.exec(sourceText)) !== null) {
            const rawTemplate = cMatch[1]
            const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
            const stripped = stripComments(cleanTemplate)
            const nodes = parseCssRecursive(stripped, stateMeta)
            const chunks = compileAstNodes(nodes, stateMeta)
            stateRulesList.push(chunks)
        }
    }

    // 6. Aggregate Chunks & Statistics
    const baseChunks: string[] = []
    const hoverChunks: string[] = []
    const focusChunks: string[] = []
    const pressChunks: string[] = []
    const disabledChunks: string[] = []
    const atRuleChunks: string[] = []

    for (const chunk of stateRulesList) {
        if (chunk.base.length > 0) baseChunks.push(...chunk.base)
        if (chunk.hovered.length > 0) hoverChunks.push(...chunk.hovered)
        if (chunk.focused.length > 0) focusChunks.push(...chunk.focused)
        if (chunk.pressed.length > 0) pressChunks.push(...chunk.pressed)
        if (chunk.disabled.length > 0) disabledChunks.push(...chunk.disabled)
        if (chunk.atRules.length > 0) atRuleChunks.push(...chunk.atRules)
    }

    const stats = {
        baseRules: baseChunks.length,
        hoverRules: hoverChunks.length,
        focusRules: focusChunks.length,
        pressRules: pressChunks.length,
        disabledRules: disabledChunks.length,
        atRules: atRuleChunks.length,
    }
    const totalRules = stats.baseRules + stats.hoverRules + stats.focusRules + stats.pressRules + stats.disabledRules + stats.atRules

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

    if (hoverChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2.1] Hovered State Deltas (:hover)
 * -------------------------------------------------------------------- */
${hoverChunks.join('\n\n')}`)
    }

    if (focusChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2.2] Focused State Deltas (:focus-within)
 * -------------------------------------------------------------------- */
${focusChunks.join('\n\n')}`)
    }

    if (pressChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2.3] Pressed / Active State Deltas (:active)
 * -------------------------------------------------------------------- */
${pressChunks.join('\n\n')}`)
    }

    if (disabledChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2.4] Disabled State Deltas ([disabled] / .disabled)
 * -------------------------------------------------------------------- */
${disabledChunks.join('\n\n')}`)
    }

    if (atRuleChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 3] Media Queries, Keyframes & Accessibility Adaptations
 * -------------------------------------------------------------------- */
${atRuleChunks.join('\n\n')}`)
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
            stateSheetLayer: baseChunks.concat(hoverChunks, focusChunks, pressChunks, disabledChunks).join('\n\n'),
            staticLayer: atRuleChunks.join('\n\n'),
        },
    }
}

/**
 * Dynamically bundles and evaluates the exported CSSResult / CSSResult[] from a *.style.ts file
 * in a real VM environment, yielding the 100% genuine compiled CSS.
 * Gracefully falls back to static AST compilation if dynamic evaluation fails.
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
                    },
                },
            ],
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
            console,
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
                atRules: 0,
            },
            compiledCss,
            layers: {
                tokenLayer: rawCssParts[0] || '',
                stateSheetLayer: rawCssParts.slice(1).join('\n\n'),
                staticLayer: '',
            },
        }
    } catch (err: any) {
        // Fallback to static AST compiler
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
            compiledCss: `${warnHeader}\n\n${fallbackResult.compiledCss}`,
        }
    }
}

