/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry } from './state-trigger-registry'

export {
    StateTriggerRegistry,
    type TriggerTarget,
    type TriggerContext,
    type ResolvedTrigger,
    type StateTrigger
} from './state-trigger-registry'

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
