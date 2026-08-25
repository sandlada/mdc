/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import {
    STATE_NAMES,
    type StateName,
    type StateTuple,
} from './state'

export { STATE_NAMES, type StateName, type StateTuple }

export type StateSelectorFunction = (state: StateName, stateIndex: number) => string | null | undefined

export type StateSelectorMap = {
    base?: string
    enabled?: string | null
    hovered?: string | null
    pressed?: string | null
    focused?: string | null
    disabled?: string | null
}

export type StateSelectorInput =
    | string
    | StateTuple<string | null | undefined>
    | StateSelectorMap
    | StateSelectorFunction

export interface StateStylesOptions {
    /**
     * Selector template, tuple, object map, or generator function.
     *
     * - **Placeholder string**: e.g. `':host(:not([checked])$state) .label'` or `'.container$state .icon'`
     * - **Auto-inject string**: e.g. `':host(:not([checked])) .label'` or `'.container .label'`
     * - **5-state tuple**: `[enabledSel, hoveredSel, pressedSel, focusedSel, disabledSel]`
     * - **Object map**: `{ enabled: '...', disabled: '...' }`
     * - **Function**: `(state, index) => string`
     */
    selector: StateSelectorInput

    /**
     * Replacement for `$state` in the disabled state.
     * Defaults to `[disabled]` when selector contains `:host`, otherwise `.disabled`.
     * Can be set to `:has(.container.disabled)`, `.disabled`, `[disabled]`, or any custom selector fragment.
     */
    disabled?: string

    /**
     * Replacement for `$state` in the hovered state (default: `':hover'`).
     */
    hovered?: string

    /**
     * Replacement for `$state` in the pressed state (default: `':active'`).
     */
    pressed?: string

    /**
     * Replacement for `$state` in the focused state (default: `':focus-within'`).
     */
    focused?: string

    /**
     * Replacement for `$state` in the enabled state (default: `''`).
     */
    enabled?: string

    /**
     * CSS property mappings.
     *
     * Values can be:
     * - Token name suffix (e.g. `'unselected-label-color'`) -> auto-expands to `var(--_{state}-${suffix})`
     * - Raw CSS string / CSS variable (e.g. `'var(--sys-primary)'`, `'1px'`, `'0.38'`)
     * - State tuple: `[enabled, hovered, pressed, focused, disabled]`, where each entry can be
     *   a token suffix, raw CSS value, or `null`/`undefined`/`void 0` to omit that state.
     */
    properties: Record<
        string,
        string | number | StateTuple<string | number | null | undefined | void>
    >
}

/**
 * Checks if a value is raw CSS / already wrapped rather than an MDC token suffix name.
 */
function isRawCssValue(val: string): boolean {
    return (
        val.startsWith('var(') ||
        val.startsWith('calc(') ||
        val.startsWith('url(') ||
        val.startsWith('linear-gradient(') ||
        val.startsWith('radial-gradient(') ||
        val.startsWith('#') ||
        val.startsWith('rgb(') ||
        val.startsWith('rgba(') ||
        val.startsWith('hsl(') ||
        val.startsWith('hsla(') ||
        val.includes(' ') ||
        /^\d+(\.\d+)?(px|em|rem|%|ms|s|deg|vh|vw|fr|pt)?$/.test(val) ||
        val === 'transparent' ||
        val === 'inherit' ||
        val === 'initial' ||
        val === 'unset' ||
        val === 'none' ||
        val === 'auto' ||
        val === 'currentColor' ||
        val === 'solid' ||
        val === 'dashed' ||
        val === 'dotted' ||
        val === 'double'
    )
}

/**
 * Resolves a property value for a given state name.
 */
function formatPropertyValue(state: StateName, val: string | number): string {
    if (typeof val === 'number') {
        return String(val)
    }

    if (val.startsWith('--')) {
        return `var(${val})`
    }

    if (isRawCssValue(val)) {
        return val
    }

    return `var(--_${state}-${val})`
}

/**
 * Resolves the selector string for a specific state index.
 */
function resolveSelectorForState(
    options: StateStylesOptions,
    state: StateName,
    index: number
): string | null {
    const { selector } = options

    if (typeof selector === 'function') {
        const res = selector(state, index)
        return res ? res.trim() : null
    }

    if (Array.isArray(selector)) {
        const res = selector[index]
        return res ? res.trim() : null
    }

    if (typeof selector === 'object' && selector !== null) {
        const map = selector as StateSelectorMap
        const res = map[state] ?? (state === 'enabled' ? map.base : undefined)
        return res ? res.trim() : null
    }

    if (typeof selector === 'string') {
        const enabledMod = options.enabled ?? ''
        const hoveredMod = options.hovered ?? ':hover'
        const pressedMod = options.pressed ?? ':active'
        const focusedMod = options.focused ?? ':focus-within'
        const disabledMod = options.disabled ?? (selector.includes(':host') ? '[disabled]' : '.disabled')

        const modifiers = [enabledMod, hoveredMod, pressedMod, focusedMod, disabledMod]
        const mod = modifiers[index]

        if (selector.includes('$state')) {
            return selector.replaceAll('$state', mod).trim()
        }

        if (selector.includes('{state}')) {
            return selector.replaceAll('{state}', mod).trim()
        }

        // Auto-inject into :host(...) or :host
        if (selector.startsWith(':host(')) {
            return selector.replace(/:host\((.*?)\)/, (_, inner) => `:host(${inner}${mod})`).trim()
        }

        if (selector.startsWith(':host')) {
            return selector.replace(/:host/, `:host${mod}`).trim()
        }

        // Auto-inject after the first class or element identifier
        return selector.replace(/^(\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)/, `$1${mod}`).trim()
    }

    return null
}

/**
 * Generates CSS rules expanding property definitions across 5 interaction states
 * (`enabled`, `hovered`, `pressed`, `focused`, `disabled`).
 *
 * @example
 * ```typescript
 * stateStyles({
 *     selector: ':host(:not([checked])$state) .label',
 *     disabled: ':has(.container.disabled)',
 *     properties: {
 *         color: 'unselected-label-color',
 *         opacity: [null, null, null, null, 'disabled-label-opacity'],
 *     },
 * })
 * ```
 */
export function stateStyles(options: StateStylesOptions): CSSResult {
    const rules: string[] = []

    for (let i = 0; i < STATE_NAMES.length; i++) {
        const state = STATE_NAMES[i]
        const selector = resolveSelectorForState(options, state, i)
        if (!selector) continue

        const declarations: string[] = []

        for (const [prop, val] of Object.entries(options.properties)) {
            if (val === null || val === undefined) continue

            let entryVal: string | number | null | undefined

            if (Array.isArray(val)) {
                entryVal = val[i]
            } else {
                entryVal = val as string | number
            }

            if (entryVal !== null && entryVal !== undefined) {
                const formatted = formatPropertyValue(state, entryVal)
                declarations.push(`${prop}: ${formatted};`)
            }
        }

        if (declarations.length > 0) {
            rules.push(`${selector} {\n    ${declarations.join('\n    ')}\n}`)
        }
    }

    return unsafeCSS(rules.join('\n'))
}
