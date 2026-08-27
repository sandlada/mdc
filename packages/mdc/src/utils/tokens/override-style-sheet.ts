/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { STATE_NAMES, type StateName, type StateTuple } from './state'

export interface OverrideStyleSheetOptions {
    /**
     * The CSS variable prefix of the target component, for example `--mdc-focus-ring`.
     */
    prefix: string

    /**
     * Optional selector to wrap the CSS declarations with.
     * When provided, outputs `${selector} { --prefix-key: value; }`.
     * When omitted, outputs direct CSS declarations `--prefix-key: value;`.
     */
    selector?: string
}

export type OverridePrefixOrOptions = string | OverrideStyleSheetOptions

type StripStatePrefix<K extends string> = K extends `${StateName}-${infer Rest}`
    ? Rest
    : K

type ExtractBaseKeys<T> = T extends Record<string, any>
    ? {
        [K in keyof T & string]: StripStatePrefix<K>
    }[keyof T & string]
    : string

export type OverrideTokenKey<T> = (keyof T & string) | ExtractBaseKeys<T>

export type OverrideValue = string | number | CSSResult

export type OverrideTokens<TDef> = Partial<{
    [K in OverrideTokenKey<TDef> | (string & {})]:
        | OverrideValue
        | StateTuple<OverrideValue>
        | readonly (OverrideValue | null | undefined)[]
        | null
        | undefined
}>

function formatValue(v: any): string {
    if (typeof v === 'object' && v !== null && 'cssText' in v) {
        return (v as CSSResult).cssText
    }
    return String(v)
}

/**
 * Type-safe helper to override component CSS custom properties.
 *
 * Automatically resolves both base token names (e.g. `container-color`, `shape-start-start`)
 * and state-specific names (e.g. `hovered-color`, `enabled-container-color`), supporting
 * single values and 5-state tuples `[enabled, hovered, pressed, focused, disabled]`.
 *
 * @example
 * ```typescript
 * // 1. Base name with single value (auto-expands to all defined states in definition)
 * const shape = overrideStyleSheet(FocusRingDefinition, '--mdc-focus-ring', {
 *     'shape-start-start': '8px',
 * })
 *
 * // 2. Base name with 5-state tuple
 * const buttonColors = overrideStyleSheet(ButtonDefinition, '--mdc-button', {
 *     'container-color': [Color.Primary, Color.Hover, null, null, Color.Disabled],
 * })
 *
 * // 3. State-specific override
 * const rippleHover = overrideStyleSheet(RippleDefinition, '--mdc-ripple', {
 *     'hovered-color': 'red',
 * })
 * ```
 */
export function overrideStyleSheet<TDef extends Record<string, any>>(
    definition: TDef,
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: OverrideTokens<TDef>
): CSSResult {
    const prefix = typeof prefixOrOptions === 'string' ? prefixOrOptions : prefixOrOptions.prefix
    const selector = typeof prefixOrOptions === 'object' ? prefixOrOptions.selector : undefined

    const defKeys = definition && typeof definition === 'object' ? Object.keys(definition) : []
    const defKeysSet = new Set(defKeys)

    const declarations: string[] = []

    for (const [rawKey, val] of Object.entries(tokens ?? {})) {
        if (val === null || val === undefined) continue

        const cleanKey = rawKey.startsWith('--') ? rawKey.replace(/^--/, '') : rawKey

        // Case 1: Tuple / Array of values [enabled, hovered, pressed, focused, disabled]
        if (Array.isArray(val)) {
            for (let i = 0; i < STATE_NAMES.length; i++) {
                const stateVal = val[i]
                if (stateVal === null || stateVal === undefined) continue

                const stateName = STATE_NAMES[i]
                const targetKey = `${stateName}-${cleanKey}`
                declarations.push(`${prefix}-${targetKey}: ${formatValue(stateVal)};`)
            }
            continue
        }

        // Case 2: Single value with Direct match in definition (e.g. 'hovered-color', 'enabled-width')
        if (defKeysSet.has(cleanKey)) {
            declarations.push(`${prefix}-${cleanKey}: ${formatValue(val)};`)
            continue
        }

        // Case 3: Single value with Base name matching defined states (e.g. 'container-color' or 'shape-start-start')
        const matchedStateKeys = STATE_NAMES
            .map((state) => `${state}-${cleanKey}`)
            .filter((candidate) => defKeysSet.has(candidate))

        if (matchedStateKeys.length > 0) {
            for (const stateKey of matchedStateKeys) {
                declarations.push(`${prefix}-${stateKey}: ${formatValue(val)};`)
            }
            continue
        }

        // Case 4: Fallback for custom or direct property
        declarations.push(`${prefix}-${cleanKey}: ${formatValue(val)};`)
    }

    const cssOutput = declarations.join(' ')

    if (!cssOutput) {
        return unsafeCSS('')
    }

    if (selector) {
        return unsafeCSS(`${selector} { ${cssOutput} }`)
    }

    return unsafeCSS(cssOutput)
}
