/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
type LogicShapeSuffix = '-start-start' | '-start-end' | '-end-end' | '-end-start'
type TransformedRadius<T> = {
    [K in keyof T as `${string & K}${LogicShapeSuffix}`]: T[K]
}
type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type LogicBorderRadius<T extends Record<string, any>> = Prettify<TransformedRadius<T>>

/**
 * @example
 * ```typescript
 * transformRadiusToLogicRadius({
 *     'container-shape-round': `48px`,
 * })
 * ```
 *
 * @output
 * ```
 * {
 *     'container-shape-round-start-start': `48px`,
 *     'container-shape-round-start-end': `48px`,
 *     'container-shape-round-end-start': `48px`,
 *     'container-shape-round-end-end': `48px`,
 * }
 * ```
 */
export function transformRadiusToLogicRadius<const T extends Record<string, any>>(record: T): LogicBorderRadius<T> {
    const result = { } as any

    for(const [k, v] of Object.entries(record)) {
        result[`${k}-start-start`] = v
        result[`${k}-start-end`] = v
        result[`${k}-end-start`] = v
        result[`${k}-end-end`] = v
    }

    return result
}
