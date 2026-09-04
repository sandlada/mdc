/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export type TriggerTarget = 'host' | 'self'

export interface TriggerContext {
    readonly anchor?: string
    readonly isHostAnchor?: boolean
    readonly whenCondition?: string
}

export interface ResolvedTrigger {
    readonly target: TriggerTarget
    readonly modifier: string
}

export interface StateTrigger {
    readonly name?: string
    readonly modifier: string
    readonly target?: TriggerTarget
    readonly resolve?: (context?: TriggerContext) => ResolvedTrigger
}

function createDefaultTriggers(): Map<string, string> {
    const defaults = new Map<string, string>()

    defaults.set('enabled', '')
    defaults.set('hover', ':hover')
    defaults.set('hovered', ':hover')
    defaults.set('focus', ':focus-visible')
    defaults.set('focused', ':focus-visible')
    defaults.set('focus-visible', ':focus-visible')
    defaults.set('active', ':active')
    defaults.set('pressed', ':active')
    defaults.set('checked', '[checked]')
    defaults.set('indeterminate', '[indeterminate]')
    defaults.set('selected', '[selected]')
    defaults.set('disabled', '[disabled]')

    return defaults
}

/**
 * Registry holding mappings from state names to CSS modifier strings with automatic heuristics.
 */
export class StateTriggerRegistry {
    private readonly triggers: Map<string, string>

    public constructor(
        initial?: Record<string, string | StateTrigger> | (Record<string, string | StateTrigger> | StateTrigger)[]
    ) {
        this.triggers = createDefaultTriggers()
        if (initial) {
            this.registerAll(initial)
        }
    }

    /**
     * Registers a single state trigger modifier string or trigger object.
     */
    public register(nameOrMapping: string | StateTrigger | Record<string, string | StateTrigger>, modifier?: string): this {
        if (typeof nameOrMapping === 'string') {
            this.triggers.set(nameOrMapping, modifier ?? '')
        } else if (nameOrMapping && typeof nameOrMapping === 'object') {
            if ('name' in nameOrMapping && typeof (nameOrMapping as StateTrigger).name === 'string') {
                const trigger = nameOrMapping as StateTrigger
                this.triggers.set(trigger.name!, trigger.modifier ?? '')
            } else {
                this.registerAll(nameOrMapping as Record<string, string | StateTrigger>)
            }
        }
        return this
    }

    /**
     * Registers a batch of state triggers or modifier strings.
     */
    public registerAll(
        triggers: Record<string, string | StateTrigger> | (Record<string, string | StateTrigger> | StateTrigger)[]
    ): this {
        if (!triggers) {
            return this
        }

        if (Array.isArray(triggers)) {
            for (const item of triggers) {
                if (!item) {
                    continue
                }
                if ('name' in item && typeof (item as StateTrigger).name === 'string') {
                    this.register(item as StateTrigger)
                } else if (typeof item === 'object') {
                    this.registerAll(item as Record<string, string | StateTrigger>)
                }
            }
            return this
        }

        for (const [stateName, triggerOrModifier] of Object.entries(triggers)) {
            if (triggerOrModifier === null || triggerOrModifier === undefined) {
                continue
            }

            if (typeof triggerOrModifier === 'string') {
                this.triggers.set(stateName, triggerOrModifier.trim())
            } else if (typeof triggerOrModifier === 'object') {
                const mod = 'modifier' in triggerOrModifier ? triggerOrModifier.modifier : ''
                this.triggers.set(stateName, mod)
                if ('name' in triggerOrModifier && triggerOrModifier.name && triggerOrModifier.name !== stateName) {
                    this.triggers.set(triggerOrModifier.name, mod)
                }
            }
        }

        return this
    }

    /**
     * Retrieves a registered modifier string by state name.
     */
    public get(name: string): string | undefined {
        return this.triggers.get(name)
    }

    /**
     * Alias for `get(name)`.
     */
    public getTrigger(name: string): string | undefined {
        return this.get(name)
    }

    /**
     * Checks if a trigger modifier exists for the given state name.
     */
    public has(name: string): boolean {
        return this.triggers.has(name)
    }

    /**
     * Resolves a state name to a target and selector modifier in the current context.
     */
    public resolve(name: string, context?: TriggerContext): ResolvedTrigger {
        const isHostAnchor = context?.isHostAnchor ?? false
        const registered = this.triggers.get(name)

        if (registered !== undefined) {
            const modifier = registered
            if (!modifier || name === 'enabled') {
                return Object.freeze({ target: 'self', modifier: '' })
            }
            if (modifier.startsWith('[')) {
                return Object.freeze({ target: 'host', modifier })
            }
            if (modifier.startsWith(':') || modifier.startsWith('.')) {
                return Object.freeze({
                    target: isHostAnchor ? 'host' : 'self',
                    modifier
                })
            }
            return Object.freeze({
                target: isHostAnchor ? 'host' : 'self',
                modifier
            })
        }

        // Heuristic fallback for unmapped custom states
        if (!name || name === 'enabled') {
            return Object.freeze({ target: 'self', modifier: '' })
        }

        if (name.startsWith('[')) {
            return Object.freeze({ target: 'host', modifier: name })
        }

        if (name.startsWith(':')) {
            return Object.freeze({
                target: isHostAnchor ? 'host' : 'self',
                modifier: name
            })
        }

        if (name.startsWith('.')) {
            return Object.freeze({ target: 'self', modifier: name })
        }

        if (isHostAnchor) {
            return Object.freeze({
                target: 'host',
                modifier: `[${name}]`
            })
        }

        return Object.freeze({
            target: 'self',
            modifier: `.${name}`
        })
    }

    /**
     * Alias for `resolve(name, context)`.
     */
    public resolveTrigger(name: string, context?: TriggerContext): ResolvedTrigger {
        return this.resolve(name, context)
    }

    /**
     * Clones the current registry into a new independent instance.
     */
    public clone(): StateTriggerRegistry {
        const cloned = new StateTriggerRegistry()
        for (const [key, val] of this.triggers.entries()) {
            cloned.triggers.set(key, val)
        }
        return cloned
    }
}

/**
 * Constructs an immutable registry mapping schema state names to concrete CSS selector modifier strings.
 *
 * @param mapping - Key-value map of state names to selector modifier strings.
 * @returns An immutable `StateTriggerRegistry` instance used by the stylesheet compiler.
 *
 * @example
 * ```typescript
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
 *
 * export const ButtonTriggers = mapStateTriggers({
 *     'enabled': '',
 *     'selected': '[selected]',
 *     'hovered': ':hover',
 *     'disabled': '[disabled]'
 * })
 * ```
 */
export function mapStateTriggers(
    mapping: Record<string, string> = {}
): StateTriggerRegistry {
    return new StateTriggerRegistry(mapping)
}
