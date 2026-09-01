/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateTrigger, TriggerContext, ResolvedTrigger } from './host-trigger'

function cleanTriggerName(modifier: string): string {
    return modifier.replace(/^[.:\[]+/, '').replace(/[\]]+$/, '').trim()
}

/**
 * Constructs a state trigger that mounts directly to the current `@anchor` element.
 *
 * Resolves to `target: 'host'` when the current context anchor is the host element (`context.isHostAnchor === true`),
 * and resolves to `target: 'self'` when targeting internal descendant elements.
 *
 * @param modifier - Selector modifier (e.g. `':hover'`, `'.active'`, `':focus-visible'`).
 * @param name - Optional trigger identifier name (defaults to cleaned modifier name).
 * @returns A `StateTrigger` targeting the anchor/self element.
 *
 * @example
 * ```typescript
 * import { selfTrigger } from '@sandlada/mdc/utils/styles/self-trigger'
 *
 * const hoverTrigger = selfTrigger(':hover')
 * const activeTrigger = selfTrigger(':active', 'pressed')
 * ```
 */
export function selfTrigger(modifier: string, name?: string): StateTrigger {
    const triggerName = name && name.trim().length > 0 ? name.trim() : cleanTriggerName(modifier)

    return Object.freeze({
        name: triggerName,
        target: 'self',
        modifier,
        resolve: (context: TriggerContext): ResolvedTrigger => Object.freeze({
            target: context?.isHostAnchor ? 'host' : 'self',
            modifier
        })
    })
}
