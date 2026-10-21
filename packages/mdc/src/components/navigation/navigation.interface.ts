/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * `[newValue, oldValue]` of a navigation activation. `oldValue` is `undefined`
 * when the container had no active value before.
 */
export type IMDCNavigationValueChangeDetail = readonly [newValue: string, oldValue: string | undefined]

/**
 * Events dispatched by navigation containers (bar, rail, drawer).
 *
 * - `input`: every activation in the container scope, including re-activation of the current value.
 * - `change`: an activation that changed the active value.
 */
export interface IMDCNavigationContainerEvents {
    'input' : CustomEvent<IMDCNavigationValueChangeDetail>
    'change': CustomEvent<IMDCNavigationValueChangeDetail>
}
