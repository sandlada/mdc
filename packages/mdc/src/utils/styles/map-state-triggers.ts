/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateTrigger, TriggerContext, ResolvedTrigger } from './host-trigger'
import { hostTrigger } from './host-trigger'
import { selfTrigger } from './self-trigger'

function createDefaultTriggers(): Map<string, StateTrigger> {
    const defaults = new Map<string, StateTrigger>()

    defaults.set('enabled', Object.freeze({
        name: 'enabled',
        target: 'self',
        modifier: '',
        resolve: () => Object.freeze({ target: 'self', modifier: '' })
    }))

    defaults.set('hover', selfTrigger(':hover', 'hover'))
    defaults.set('hovered', selfTrigger(':hover', 'hovered'))

    defaults.set('focus', selfTrigger(':focus-visible', 'focus'))
    defaults.set('focused', selfTrigger(':focus-visible', 'focused'))
    defaults.set('focus-visible', selfTrigger(':focus-visible', 'focus-visible'))

    defaults.set('active', selfTrigger(':active', 'active'))
    defaults.set('pressed', selfTrigger(':active', 'pressed'))

    defaults.set('checked', hostTrigger('[checked]', 'checked'))
    defaults.set('indeterminate', hostTrigger('[indeterminate]', 'indeterminate'))
    defaults.set('selected', hostTrigger('[selected]', 'selected'))
    defaults.set('disabled', hostTrigger('[disabled]', 'disabled'))

    return defaults
}

/**
 * Registry holding mappings from state names to state triggers with automatic heuristics.
 */
export class StateTriggerRegistry {
    private readonly triggers: Map<string, StateTrigger>

    public constructor(
        initial?: Record<string, StateTrigger | string> | (StateTrigger | Record<string, StateTrigger | string>)[]
    ) {
        this.triggers = createDefaultTriggers()
        if (initial) {
            this.registerAll(initial)
        }
    }

    /**
     * Registers a single state trigger.
     */
    public register(trigger: StateTrigger): this {
        if (trigger && typeof trigger === 'object' && typeof trigger.name === 'string') {
            this.triggers.set(trigger.name, trigger)
        }
        return this
    }

    /**
     * Registers a batch of state triggers or string shorthand mappings.
     */
    public registerAll(
        triggers: Record<string, StateTrigger | string> | (StateTrigger | Record<string, StateTrigger | string>)[]
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
                    this.registerAll(item as Record<string, StateTrigger | string>)
                }
            }
            return this
        }

        for (const [stateName, triggerOrModifier] of Object.entries(triggers)) {
            if (triggerOrModifier === null || triggerOrModifier === undefined) {
                continue
            }

            if (typeof triggerOrModifier === 'object' && 'name' in triggerOrModifier) {
                this.triggers.set(stateName, triggerOrModifier)
                if (triggerOrModifier.name && triggerOrModifier.name !== stateName) {
                    this.triggers.set(triggerOrModifier.name, triggerOrModifier)
                }
                continue
            }

            if (typeof triggerOrModifier === 'string') {
                const trimmed = triggerOrModifier.trim()
                if (trimmed.length === 0 || stateName === 'enabled') {
                    this.triggers.set(stateName, Object.freeze({
                        name: stateName,
                        target: 'self',
                        modifier: trimmed,
                        resolve: () => Object.freeze({ target: 'self', modifier: trimmed })
                    }))
                } else if (trimmed.startsWith('[')) {
                    this.triggers.set(stateName, hostTrigger(trimmed, stateName))
                } else {
                    this.triggers.set(stateName, selfTrigger(trimmed, stateName))
                }
            }
        }

        return this
    }

    /**
     * Retrieves a registered trigger by state name.
     */
    public get(name: string): StateTrigger | undefined {
        return this.triggers.get(name)
    }

    /**
     * Alias for `get(name)`.
     */
    public getTrigger(name: string): StateTrigger | undefined {
        return this.get(name)
    }

    /**
     * Checks if a trigger exists for the given state name.
     */
    public has(name: string): boolean {
        return this.triggers.has(name)
    }

    /**
     * Resolves a state name to a target and selector modifier in the current context.
     *
     * If the state name is not explicitly registered, applies heuristic fallback resolution:
     * - `name === 'enabled' | ''` -> `{ target: 'self', modifier: '' }`
     * - `name.startsWith('[')` -> `{ target: 'host', modifier: name }`
     * - `name.startsWith(':')` -> `{ target: context.isHostAnchor ? 'host' : 'self', modifier: name }`
     * - `name.startsWith('.')` -> `{ target: 'self', modifier: name }`
     * - Identifier without prefix:
     *   - Host anchor -> `{ target: 'host', modifier: `[${name}]` }`
     *   - Container anchor -> `{ target: 'self', modifier: `.${name}` }`
     */
    public resolve(name: string, context: TriggerContext): ResolvedTrigger {
        const registered = this.triggers.get(name)
        if (registered) {
            if (typeof registered.resolve === 'function') {
                return registered.resolve(context)
            }
            return Object.freeze({
                target: registered.target ?? (context?.isHostAnchor ? 'host' : 'self'),
                modifier: registered.modifier ?? ''
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
                target: context?.isHostAnchor ? 'host' : 'self',
                modifier: name
            })
        }

        if (name.startsWith('.')) {
            return Object.freeze({ target: 'self', modifier: name })
        }

        if (context?.isHostAnchor) {
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
    public resolveTrigger(name: string, context: TriggerContext): ResolvedTrigger {
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
 * Constructs an immutable registry mapping schema state names to concrete CSS selector triggers.
 *
 * @param mapping - Key-value map of state names to `StateTrigger` objects or selector modifier strings.
 * @returns An immutable `StateTriggerRegistry` instance used by the stylesheet compiler.
 *
 * @example
 * ```typescript
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
 * import { hostTrigger } from '@sandlada/mdc/utils/styles/host-trigger'
 * import { selfTrigger } from '@sandlada/mdc/utils/styles/self-trigger'
 *
 * export const ButtonTriggers = mapStateTriggers({
 *     'enabled': '',
 *     'selected': hostTrigger('[selected]'),
 *     'hovered': selfTrigger(':hover'),
 *     'disabled': hostTrigger('[disabled]')
 * })
 * ```
 */
export function mapStateTriggers(
    mapping: Record<string, StateTrigger | string> = {}
): StateTriggerRegistry {
    return new StateTriggerRegistry(mapping)
}
