/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export type TriggerTarget = 'host' | 'self'

export interface TriggerContext {
    readonly anchor: string
    readonly isHostAnchor: boolean
    readonly whenCondition?: string
}

export interface ResolvedTrigger {
    readonly target: TriggerTarget
    readonly modifier: string
}

export interface StateTrigger {
    readonly name: string
    readonly target?: TriggerTarget
    readonly modifier?: string
    readonly resolve?: (context: TriggerContext) => ResolvedTrigger
}

function cleanTriggerName(modifier: string): string {
    return modifier.replace(/^[.:\[]+/, '').replace(/[\]]+$/, '').trim()
}

/**
 * Constructs a state trigger that mounts to the `:host(...)` selector context.
 *
 * Always resolves to `target: 'host'` regardless of the anchor context.
 *
 * @param modifier - Attribute, class, or pseudo-class modifier (e.g. `'[selected]'`, `'[checked]'`, `':disabled'`).
 * @param name - Optional trigger identifier name (defaults to cleaned modifier name).
 * @returns A `StateTrigger` targeting the host element.
 *
 * @example
 * ```typescript
 * import { hostTrigger } from '@sandlada/mdc/utils/styles/host-trigger'
 *
 * const selectedTrigger = hostTrigger('[selected]')
 * const errorTrigger = hostTrigger('[error]', 'hasError')
 * ```
 */
export function hostTrigger(modifier: string, name?: string): StateTrigger {
    const triggerName = name && name.trim().length > 0 ? name.trim() : cleanTriggerName(modifier)

    return Object.freeze({
        name: triggerName,
        target: 'host',
        modifier,
        resolve: (_context?: TriggerContext): ResolvedTrigger => Object.freeze({
            target: 'host',
            modifier
        })
    })
}
