/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { VariantTriggerRegistry } from './variant-trigger-registry'

export {
    VariantTriggerRegistry,
    type VariantTrigger
} from './variant-trigger-registry'

/**
 * Constructs a registry mapping variant names to concrete mount selector strings.
 *
 * 对称于 `mapStateTriggers`：每个变体名映射到完整挂载选择器，而非 modifier 片段。
 *
 * @param mapping - Key-value map of variant names to mount selector strings.
 * @returns A `VariantTriggerRegistry` instance used by the stylesheet compiler.
 *
 * @example
 * ```typescript
 * import { mapVariantTriggers } from '@sandlada/mdc/utils/styles/map-variant-triggers'
 *
 * export const ButtonVariantTriggers = mapVariantTriggers({
 *     'fill': '.container.fill',
 *     'tonal': ':host(.tonal)',
 *     'outlined': ':host([variant="outlined"])'
 * })
 * ```
 */
export function mapVariantTriggers(
    mapping: Record<string, string> = {}
): VariantTriggerRegistry {
    return new VariantTriggerRegistry(mapping)
}
