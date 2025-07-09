/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

type LogicShapeSuffix = '-start-start' | '-start-end' | '-end-end' | '-end-start'
type SelectedKeys<T, K extends Array<keyof T> | 'all'> = K extends 'all' ? keyof T : K[number]
type GeneratedShapeTokens<
    T extends Record<PropertyKey, unknown>,
    K extends Array<keyof T> | 'all',
    Wrapped extends boolean
> = { [P in SelectedKeys<T, K> as `${Wrapped extends true ? `--_${string & P}` : string & P}${LogicShapeSuffix}`]: string }

export function createLogicShapeTokens<
    T extends Record<PropertyKey, string | null>,
    K extends Array<keyof T> | 'all'
>(
    prefix: string,
    allTokens: T,
    shapeTokenKeys: K,
    wrapped?: true
): GeneratedShapeTokens<T, K, true>

export function createLogicShapeTokens<
    T extends Record<PropertyKey, string | null>,
    K extends Array<keyof T> | 'all'
>(
    prefix: string,
    allTokens: T,
    shapeTokenKeys: K,
    wrapped: false
): GeneratedShapeTokens<T, K, false>

/**
 * Converts the passed record object to CSS rounded corners properties:
 * prop-original-name-start-start: var(--prefix-prop-original-name, value)
 * prop-original-name-start-end: ...
 * prop-original-name-end-start: ...
 * prop-original-name-end-end: ...
 *
 * When wrapped is enabled, field names will begin with --_, and the attribute value
 * of the returned value field will also be wrapped with a CSS variables:
 * --_prop-original-name-start-start: var(--prefix-prop-original-name-start-start, var(--prefix-prop-original-name, value))
 * ...
 *
 * @example
 * ```typescript
 * createLogicShapeTokens('--my-button', {
 *     'container-shape-round': `48px`,
 * }, 'all', false)
 * ```
 *
 * @param prefix Return value attribute prefix, return value attribute value CSS variable name prefix.
 * @param allTokens A record object that needs to be converted.
 * @param shapeTokenKeys An array specifying the names of the fields in the allTokens object that need to be converted. Or pass in 'all' to convert all.
 * @param wrapped Enabled by default. Whether to wrap fields whose names start with _ and wrap one layer of CSS variables.
 * @returns A record object containing border-radius-*-*
 */
export function createLogicShapeTokens<T extends Record<PropertyKey, string | null>>(
    prefix: string,
    allTokens: T,
    shapeTokenKeys: Array<keyof T> | 'all',
    wrapped: boolean = true
): Record<string, string> {
    const keysToProcess = shapeTokenKeys === 'all'
        ? Object.keys(allTokens)
        // K[number] is the type-level equivalent of iterating the array
        : shapeTokenKeys

    return Object
        .entries(allTokens)
        .filter(([k, _]) => keysToProcess.includes(k))
        .reduce((p, [k, v]) => {
            const keyStart = (wrapped ? '--_' : '') + k
            return ({
                ...p,
                [`${keyStart}-start-start`]: `${wrapped ? `var(${prefix}-${k}-start-start, ` : ''}var(${prefix}-${k}, ${v})${wrapped ? ')' : ''}`,
                [`${keyStart}-start-end`]: `${wrapped ? `var(${prefix}-${k}-start-end, ` : ''}var(${prefix}-${k}, ${v})${wrapped ? ')' : ''}`,
                [`${keyStart}-end-end`]: `${wrapped ? `var(${prefix}-${k}-end-end, ` : ''}var(${prefix}-${k}, ${v})${wrapped ? ')' : ''}`,
                [`${keyStart}-end-start`]: `${wrapped ? `var(${prefix}-${k}-end-start, ` : ''}var(${prefix}-${k}, ${v})${wrapped ? ')' : ''}`,
            })
        }, {})
}
