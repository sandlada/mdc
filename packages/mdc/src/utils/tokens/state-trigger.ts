/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export type TriggerTarget = 'host' | 'self'

export interface TriggerContext {
    anchor: string
    isHostAnchor: boolean
    whenCondition?: string
}

export interface ResolvedTrigger {
    target: TriggerTarget
    modifier: string
}

export interface StateTrigger {
    name: string
    target?: TriggerTarget
    modifier?: string
    resolve?: (context: TriggerContext) => ResolvedTrigger
}

function cleanTriggerName(nameOrModifier: string): string {
    return nameOrModifier.replace(/^[.:\[]+/, '').replace(/[\]]+$/, '').trim()
}

/**
 * Creates a host-level state trigger (e.g. `hostTrigger('[checked]')` -> `:host([checked])`).
 */
export function hostTrigger(modifier: string, name?: string): StateTrigger {
    const triggerName = name || cleanTriggerName(modifier)
    return {
        name: triggerName,
        target: 'host',
        modifier,
        resolve: () => ({
            target: 'host',
            modifier,
        }),
    }
}

/**
 * Creates a self/anchor-level state trigger (e.g. `selfTrigger(':hover')` -> `.container:hover`).
 */
export function selfTrigger(modifier: string, name?: string): StateTrigger {
    const triggerName = name || cleanTriggerName(modifier)
    return {
        name: triggerName,
        target: 'self',
        modifier,
        resolve: (context: TriggerContext) => {
            if (context.isHostAnchor) {
                return {
                    target: 'host',
                    modifier,
                }
            }
            return {
                target: 'self',
                modifier,
            }
        },
    }
}

export class StateTriggerRegistry {
    private readonly triggers = new Map<string, StateTrigger>()

    constructor(initial?: (StateTrigger | Record<string, StateTrigger | string>)[] | Record<string, StateTrigger | string>) {
        this.registerDefaults()
        if (initial) {
            this.registerAll(initial)
        }
    }

    private registerDefaults() {
        // Standard interaction states
        this.register(selfTrigger(':hover', 'hover'))
        this.register(selfTrigger(':hover', 'hovered'))

        this.register(selfTrigger(':focus-within', 'focus'))
        this.register(selfTrigger(':focus-within', 'focused'))
        this.register(selfTrigger(':focus-within', 'focus-within'))
        this.register(selfTrigger(':focus-visible', 'focus-visible'))

        this.register(selfTrigger(':active', 'active'))
        this.register(selfTrigger(':active', 'pressed'))

        // Disabled state: host -> [disabled], self/container -> .disabled
        this.register({
            name: 'disabled',
            resolve: (context: TriggerContext) => {
                if (context.isHostAnchor) {
                    return { target: 'host', modifier: '[disabled]' }
                }
                return { target: 'self', modifier: '.disabled' }
            },
        })

        // Host boolean attribute triggers
        this.register(hostTrigger('[checked]', 'checked'))
        this.register(hostTrigger('[selected]', 'selected'))
        this.register(hostTrigger('[error]', 'error'))
        this.register(hostTrigger('[open]', 'open'))
        this.register(hostTrigger('[expanded]', 'expanded'))
        this.register(hostTrigger('[data-aria-invalid="true"]', 'invalid'))

        // Self class triggers
        this.register(selfTrigger('.dragged', 'dragged'))
        this.register(selfTrigger('.loading', 'loading'))

        // Enabled / base (no modifier)
        this.register({
            name: 'enabled',
            resolve: () => ({ target: 'self', modifier: '' }),
        })
    }

    public register(trigger: StateTrigger): this {
        this.triggers.set(trigger.name, trigger)
        return this
    }

    public registerAll(triggers: (StateTrigger | Record<string, StateTrigger | string>)[] | Record<string, StateTrigger | string>): this {
        const list = Array.isArray(triggers) ? triggers : [triggers]
        for (const item of list) {
            if (!item || typeof item !== 'object') continue
            if ('name' in item && typeof item.name === 'string') {
                this.register(item as StateTrigger)
            } else {
                for (const [k, v] of Object.entries(item)) {
                    if (typeof v === 'string') {
                        if (v.startsWith('[')) {
                            this.register(hostTrigger(v, k))
                        } else {
                            this.register(selfTrigger(v, k))
                        }
                    } else if (v && typeof v === 'object') {
                        this.register({ name: k, ...v })
                    }
                }
            }
        }
        return this
    }

    public get(name: string): StateTrigger | undefined {
        return this.triggers.get(name)
    }

    public resolve(name: string, context: TriggerContext): ResolvedTrigger {
        const found = this.triggers.get(name)
        if (found) {
            if (found.resolve) {
                return found.resolve(context)
            }
            return {
                target: found.target ?? 'self',
                modifier: found.modifier ?? (context.isHostAnchor ? `[${name}]` : `.${name}`),
            }
        }

        // Automatic heuristic for unregistered custom state names
        if (name.startsWith('[')) {
            return { target: 'host', modifier: name }
        }
        if (name.startsWith(':')) {
            return { target: context.isHostAnchor ? 'host' : 'self', modifier: name }
        }
        if (name.startsWith('.')) {
            return { target: 'self', modifier: name }
        }

        // By default, if host anchor: attribute [name], if container anchor: class .name
        if (context.isHostAnchor) {
            return { target: 'host', modifier: `[${name}]` }
        }
        return { target: 'self', modifier: `.${name}` }
    }

    public clone(): StateTriggerRegistry {
        const copy = new StateTriggerRegistry()
        for (const [k, v] of this.triggers.entries()) {
            copy.triggers.set(k, v)
        }
        return copy
    }
}

export function splitSelectorByComma(selector: string): string[] {
    const parts: string[] = []
    let current = ''
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i]

        if (isEscaped) {
            isEscaped = false
            current += ch
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            current += ch
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            current += ch
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            current += ch
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            current += ch
            continue
        }

        if (ch === '(') {
            parenDepth++
            current += ch
            continue
        }

        if (ch === ')') {
            if (parenDepth > 0) parenDepth--
            current += ch
            continue
        }

        if (ch === '[') {
            bracketDepth++
            current += ch
            continue
        }

        if (ch === ']') {
            if (bracketDepth > 0) bracketDepth--
            current += ch
            continue
        }

        if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
            const trimmed = current.trim()
            if (trimmed) parts.push(trimmed)
            current = ''
            continue
        }

        current += ch
    }

    const trailing = current.trim()
    if (trailing) parts.push(trailing)

    return parts.length > 0 ? parts : [selector.trim()]
}

export function createStateTriggerRegistry(
    initial?: (StateTrigger | Record<string, StateTrigger | string>)[] | Record<string, StateTrigger | string>
): StateTriggerRegistry {
    return new StateTriggerRegistry(initial)
}

/**
 * Appends a modifier (such as [checked] or :hover or [disabled]) to a host selector,
 * properly respecting nested parentheses like :host(:not([variant*="drawer"])) and comma selectors.
 */
export function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector

    const parts = splitSelectorByComma(hostSelector)
    if (parts.length > 1) {
        return parts.map((part) => appendToHostSelector(part, modifier)).join(', ')
    }

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

export interface StateSelectorContext {
    anchor: string
    targetSelector: string
    whenCondition?: string
    states: string[]
    registry?: StateTriggerRegistry
}

/**
 * Composes a full CSS selector across host triggers, anchor/self triggers, @when conditions,
 * and target element selectors.
 */
export function composeStateSelector(options: StateSelectorContext): string {
    const { anchor, targetSelector, whenCondition, states, registry = new StateTriggerRegistry() } = options

    if (targetSelector) {
        const targetParts = splitSelectorByComma(targetSelector)
        if (targetParts.length > 1) {
            return targetParts.map((part) => composeStateSelector({ ...options, targetSelector: part })).join(', ')
        }
    }

    const isHostAnchor = anchor === ':host' || anchor.startsWith(':host(')
    const triggerContext: TriggerContext = {
        anchor,
        isHostAnchor,
        whenCondition,
    }

    const hostModifiers: string[] = []
    const selfClassModifiers: string[] = []
    const selfPseudoModifiers: string[] = []

    for (const stateName of states) {
        if (!stateName || stateName === 'enabled' || stateName === 'base') continue
        const resolved = registry.resolve(stateName, triggerContext)
        if (resolved.target === 'host' || isHostAnchor) {
            if (resolved.modifier && !hostModifiers.includes(resolved.modifier)) {
                hostModifiers.push(resolved.modifier)
            }
        } else {
            if (resolved.modifier) {
                if (resolved.modifier.startsWith('.')) {
                    if (!selfClassModifiers.includes(resolved.modifier)) {
                        selfClassModifiers.push(resolved.modifier)
                    }
                } else {
                    if (!selfPseudoModifiers.includes(resolved.modifier)) {
                        selfPseudoModifiers.push(resolved.modifier)
                    }
                }
            }
        }
    }

    // Determine if targetSelector has a compound modifier directly attached to anchor (e.g. .container.selected or .container[open])
    let anchorCompoundMod = ''
    let descendantSelector = ''

    if (targetSelector && targetSelector !== anchor && targetSelector.startsWith(anchor)) {
        const after = targetSelector.slice(anchor.length)
        if (after.startsWith(' ') || after.startsWith('>') || after.startsWith('+') || after.startsWith('~')) {
            descendantSelector = after
        } else if (after.startsWith('::')) {
            descendantSelector = after
        } else if (after.startsWith('.') || after.startsWith('[') || after.startsWith(':')) {
            const combinatorMatch = after.match(/[\s>+~]|::/)
            if (combinatorMatch && combinatorMatch.index !== undefined) {
                anchorCompoundMod = after.slice(0, combinatorMatch.index)
                descendantSelector = after.slice(combinatorMatch.index)
            } else {
                anchorCompoundMod = after
            }
        }
    }

    // 1. Compose Host Selector
    let composedHost = isHostAnchor ? anchor : ''
    if (anchorCompoundMod && isHostAnchor) {
        composedHost = appendToHostSelector(composedHost, anchorCompoundMod)
    }
    if (whenCondition && isHostAnchor) {
        composedHost = appendToHostSelector(composedHost, whenCondition)
    }
    for (const mod of hostModifiers) {
        if (isHostAnchor) {
            composedHost = appendToHostSelector(composedHost, mod)
        } else {
            composedHost = composedHost ? appendToHostSelector(composedHost, mod) : appendToHostSelector(':host', mod)
        }
    }

    // 2. Compose Anchor Selector (when not host anchor)
    let composedAnchor = isHostAnchor ? '' : anchor
    if (!isHostAnchor) {
        if (anchorCompoundMod) {
            composedAnchor = `${composedAnchor}${anchorCompoundMod}`
        }

        // Apply class modifiers first (e.g. .disabled, .dragged)
        for (const mod of selfClassModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }

        // Apply @when condition
        if (whenCondition) {
            if (whenCondition.startsWith('.') || whenCondition.startsWith('[') || whenCondition.startsWith(':')) {
                composedAnchor = `${composedAnchor}${whenCondition}`
            } else {
                composedAnchor = `${composedAnchor}.${whenCondition}`
            }
        }

        // Apply pseudo-classes last (e.g. :hover, :active, :focus-within)
        for (const mod of selfPseudoModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }
    }

    // 3. Assemble full base selector
    let fullBase = ''
    if (isHostAnchor) {
        fullBase = composedHost || ':host'
    } else if (composedHost) {
        fullBase = `${composedHost} ${composedAnchor}`
    } else {
        fullBase = composedAnchor
    }

    // 4. Combine with descendant or other target selector
    if (descendantSelector) {
        return `${fullBase}${descendantSelector}`
    }

    if (!targetSelector || targetSelector === anchor || anchorCompoundMod) {
        return fullBase
    }

    if (targetSelector.startsWith(':host')) {
        return targetSelector
    }

    return `${fullBase} ${targetSelector}`
}
