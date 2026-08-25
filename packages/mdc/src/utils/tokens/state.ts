/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * The 5 standard interaction state names in MD3 / MDC in canonical order:
 * 0: enabled, 1: hovered, 2: pressed, 3: focused, 4: disabled
 */
export const STATE_NAMES = [
    'enabled',
    'hovered',
    'pressed',
    'focused',
    'disabled',
] as const

/**
 * Alias for STATE_NAMES.
 */
export const STATES = STATE_NAMES

/**
 * Union type of the 5 standard interaction state names.
 */
export type StateName = (typeof STATE_NAMES)[number]

/**
 * 5-element state tuple `[enabled, hovered, pressed, focused, disabled]`.
 */
export type StateTuple<T = any> = readonly [
    enabled?: T,
    hovered?: T,
    pressed?: T,
    focused?: T,
    disabled?: T
]

/**
 * Falsy/Nil types representing omitted states in tuples.
 */
export type Nil = null | undefined | void

/**
 * Interface representing objects that can be converted to a CSS variable reference.
 */
export interface HasToCSSVariable {
    ToCSSVariable: () => any
}
