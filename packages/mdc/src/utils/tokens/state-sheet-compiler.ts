/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { STATE_NAMES, type StateName } from './state'

export interface StateTokenMetadata {
    isStateToken(name: string): boolean
    allStateTokens: ReadonlySet<string>
}

/**
 * Extracts all 5-state token base names from one or more ComponentDefinition objects.
 */
export function extractStateTokenMetadata(definition: any): StateTokenMetadata {
    const definitions = Array.isArray(definition) ? definition : [definition]
    const stateTokens = new Set<string>()

    const prefixes = ['enabled-', 'hovered-', 'focused-', 'pressed-', 'disabled-']

    for (const def of definitions) {
        if (!def || typeof def !== 'object') continue

        for (const key of Object.keys(def)) {
            for (const prefix of prefixes) {
                if (key.startsWith(prefix)) {
                    const baseName = key.slice(prefix.length)
                    if (baseName.length > 0) {
                        stateTokens.add(baseName)
                    }
                    break
                }
            }
        }
    }

    return {
        isStateToken(name: string) {
            return stateTokens.has(name)
        },
        allStateTokens: stateTokens,
    }
}

interface Declaration {
    property: string
    value: string
    isStateful: boolean
    stateTokens: string[]
}

interface RuleNode {
    selector: string
    anchor: string
    whenCondition?: string
    declarations: Declaration[]
}

/**
 * Strips CSS comments.
 */
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

/**
 * Recursive descent parser for nested CSS blocks supporting @anchor, @when, and nested selectors.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentWhen?: string,
    isExplicitAnchor: boolean = false
): RuleNode[] {
    const rules: RuleNode[] = []
    const currentDeclarations: Declaration[] = []

    let i = 0
    const len = css.length

    while (i < len) {
        // Skip whitespace
        while (i < len && /\s/.test(css[i])) i++
        if (i >= len) break

        // Look ahead for declaration or block start '{'
        const nextSemicolon = css.indexOf(';', i)
        const nextOpenBrace = css.indexOf('{', i)

        if (nextSemicolon === -1 && nextOpenBrace === -1) {
            break
        }

        // Case 1: Declaration comes before any nested block '{'
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

        // Case 2: Nested block encountered at nextOpenBrace
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
            rules.push(...childRules)
            continue
        }

        // Handle @when(...)
        if (header.startsWith('@when')) {
            const whenMatch = header.match(/^@when\((.*?)\)/)
            const whenCondition = whenMatch ? whenMatch[1].trim() : ''
            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, whenCondition, isExplicitAnchor)
            rules.push(...childRules)
            continue
        }

        // Host selector refinement (if not inside explicit @anchor, e.g. :host([variant="rail"]))
        let childAnchor = currentAnchor
        if (!isExplicitAnchor && header.startsWith(':host')) {
            childAnchor = header
        }

        // Normal selector / nested selector
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
        rules.push(...childRules)
    }

    if (currentDeclarations.length > 0) {
        rules.unshift({
            selector: currentTarget || currentAnchor,
            anchor: currentAnchor,
            whenCondition: currentWhen,
            declarations: currentDeclarations,
        })
    }

    return rules
}

/**
 * Formats a declaration value for a specific state.
 */
function resolveStateValue(decl: Declaration, state: StateName): string {
    let result = decl.value
    for (const token of decl.stateTokens) {
        const stateTokenVar = `--_${state}-${token}`
        result = result.replaceAll(`var(--_${token})`, `var(${stateTokenVar})`)
    }
    return result
}

/**
 * Appends a modifier (such as [checked] or :hover or [disabled]) to a host selector,
 * properly respecting nested parentheses like :host(:not([variant*="drawer"])).
 */
function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector

    if (hostSelector === ':host') {
        return `:host(${modifier})`
    }

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

/**
 * Builds composed state selector for a given state index.
 */
function buildStateSelector(
    anchor: string,
    targetSelector: string,
    whenCondition: string | undefined,
    stateIndex: number
): string {
    const isHostAnchor = anchor === ':host' || anchor.startsWith(':host(')
    const stateName = STATE_NAMES[stateIndex]

    // Modifier string per state
    let stateMod = ''
    if (stateName === 'hovered') stateMod = ':hover'
    else if (stateName === 'focused') stateMod = ':focus-within'
    else if (stateName === 'pressed') stateMod = ':active'
    else if (stateName === 'disabled') stateMod = isHostAnchor ? '[disabled]' : '.disabled'

    // 1. Compose Anchor with When Condition
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

    // 2. Compose Anchor with State Modifier
    if (stateMod) {
        if (isHostAnchor) {
            composedAnchor = appendToHostSelector(composedAnchor, stateMod)
        } else {
            if (stateName === 'disabled') {
                if (whenCondition) {
                    composedAnchor = `${anchor}.disabled${whenCondition}`
                } else {
                    composedAnchor = `${anchor}.disabled`
                }
            } else {
                composedAnchor = `${composedAnchor}${stateMod}`
            }
        }
    }

    // 3. Compose with Target Selector
    if (!targetSelector || targetSelector === anchor) {
        return composedAnchor
    }

    if (targetSelector.startsWith(anchor)) {
        const remaining = targetSelector.slice(anchor.length).trim()
        return remaining ? `${composedAnchor} ${remaining}` : composedAnchor
    }

    return `${composedAnchor} ${targetSelector}`
}

/**
 * Compiles an MDC CSS template string with token state awareness into standard CSS.
 */
export function compileStateSheet(definition: any, cssText: string): string {
    const meta = extractStateTokenMetadata(definition)
    const cleanCss = stripComments(cssText)
    const nodes = parseCssRecursive(cleanCss, meta)

    const baseRules: string[] = []
    const deltaRules: Record<StateName, string[]> = {
        enabled: [],
        hovered: [],
        focused: [],
        pressed: [],
        disabled: [],
    }

    for (const node of nodes) {
        const { anchor, selector, whenCondition, declarations } = node

        // 1. Generate Base Rule (Enabled State)
        const baseDecls: string[] = []
        for (const decl of declarations) {
            if (decl.isStateful) {
                const resolvedVal = resolveStateValue(decl, 'enabled')
                baseDecls.push(`${decl.property}: ${resolvedVal};`)
            } else {
                baseDecls.push(`${decl.property}: ${decl.value};`)
            }
        }

        if (baseDecls.length > 0) {
            const baseSel = buildStateSelector(anchor, selector, whenCondition, 0)
            baseRules.push(`${baseSel} {\n    ${baseDecls.join('\n    ')}\n}`)
        }

        // 2. Generate Delta Rules for interactive / disabled states
        for (let i = 1; i < STATE_NAMES.length; i++) {
            const state = STATE_NAMES[i]
            const stateDecls: string[] = []

            for (const decl of declarations) {
                if (decl.isStateful) {
                    const resolvedVal = resolveStateValue(decl, state)
                    stateDecls.push(`${decl.property}: ${resolvedVal};`)
                }
            }

            if (stateDecls.length > 0) {
                const stateSel = buildStateSelector(anchor, selector, whenCondition, i)
                deltaRules[state].push(`${stateSel} {\n    ${stateDecls.join('\n    ')}\n}`)
            }
        }
    }

    const output: string[] = []
    if (baseRules.length > 0) output.push(baseRules.join('\n\n'))
    if (deltaRules.hovered.length > 0) output.push(deltaRules.hovered.join('\n\n'))
    if (deltaRules.focused.length > 0) output.push(deltaRules.focused.join('\n\n'))
    if (deltaRules.pressed.length > 0) output.push(deltaRules.pressed.join('\n\n'))
    if (deltaRules.disabled.length > 0) output.push(deltaRules.disabled.join('\n\n'))

    return output.join('\n\n')
}
