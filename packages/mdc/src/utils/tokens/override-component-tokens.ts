/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * A user-side function dedicated to creating component CSS variables.
 *
 * You must manually pass in a component type that
 * represents the CSS variable you want to override, such as `keyof typeof RippleDefinition`.
 *
 * ```typescript
 * overrideComponentTokens<keyof typeof RippleDefinition>(
 *      `--mdc-filled`,
 *      {
 *          [`hovered-color`]: `red`,
 *          [`hovered-opacity`]: `0.32`,
 *      }
 * )
 *
 * // Result
 * {
 *     `--mdc-ripple-hovered-color`: `red`,
 *     `--mdc-ripple-hovered-opacity`: `0.32`
 * }
 * ```
 * @param prefix The CSS variable prefix of the component you want to override, for example `--mdc-ripple`.
 * @param tokens The variable name of the component you want to override.
 * @returns A record object. Need to be converted into a CSS string using stringTokens wrapper.
 */
export function overrideComponentTokens<T extends PropertyKey>(
    prefix: string,
    tokens: Partial<{ [K in T]: string }>
) {
    return Object
        .entries(tokens)
        .reduce((p, [k, v]) => ({ ...p, [`${prefix}-${k}`]: v }), {})
}
