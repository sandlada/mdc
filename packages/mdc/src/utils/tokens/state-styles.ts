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
    /** Base selector template used when an explicit per-state selector is not specified */
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

export type StatePropertyFunction = (
    state: StateName,
    stateIndex: number
) => string | number | null | undefined | void

export type StatePropertyValue =
    | string
    | number
    | StatePropertyFunction
    | StateTuple<string | number | StatePropertyFunction | null | undefined | void>

export interface StateStylesOptions {
    /**
     * Selector template, tuple, object map, or generator function.
     *
     * - **Placeholder string**: e.g. `':host(:not([checked])$state) .label'` or `'.container$state .icon'`
     * - **Auto-inject string**: e.g. `':host(:not([checked])) .label'` or `'.container .label'`
     * - **5-state tuple**: `[enabledSel, hoveredSel, pressedSel, focusedSel, disabledSel]`
     * - **Object map with base/overrides**: `{ base: '...', disabled: '...' }`
     * - **Function**: `(state, index) => string`
     */
    selector: StateSelectorInput

    /**
     * Complete selector overrides for individual states.
     * When specified for a state, this selector completely replaces any template calculation.
     * Set to `null` to disable generating CSS for that specific state.
     *
     * @example
     * ```typescript
     * selectors: {
     *     disabled: ':host(:not([checked])):has(.container.disabled) .label',
     * }
     * ```
     */
    selectors?: Partial<Record<StateName, string | null | undefined>>

    /**
     * Replacement for `$state` in the disabled state.
     * Defaults to `[disabled]` when selector contains `:host`, otherwise `.disabled`.
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
     * - Value template with `$state` / `{state}` (e.g. `'var(--_$state-indicator-height) min(var(--_$state-label-line-height), var(--_$state-label-size))'`)
     * - Dynamic function: `(state, index) => string`
     * - Raw CSS string / CSS variable (e.g. `'var(--sys-primary)'`, `'1px'`, `'0.38'`)
     * - State tuple: `[enabled, hovered, pressed, focused, disabled]`, where each entry can be
     *   a token suffix, template, raw CSS value, or `null`/`undefined`/`void 0` to omit that state.
     */
    properties: Record<string, StatePropertyValue>
}

/**
 * Checks if a value is raw CSS / already wrapped rather than an MDC token suffix name.
 */
function isRawCssValue(val: string): boolean {
    return (
        val.startsWith('var(') ||
        val.startsWith('calc(') ||
        val.startsWith('min(') ||
        val.startsWith('max(') ||
        val.startsWith('clamp(') ||
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
function formatPropertyValue(
    state: StateName,
    val: string | number | StatePropertyFunction,
    index: number
): string | null {
    if (typeof val === 'function') {
        const res = val(state, index)
        return res !== null && res !== undefined ? String(res) : null
    }

    if (typeof val === 'number') {
        return String(val)
    }

    // Support $state or {state} placeholders in complex CSS expressions
    if (val.includes('$state')) {
        return val.replaceAll('$state', state)
    }

    if (val.includes('{state}')) {
        return val.replaceAll('{state}', state)
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
 * Resolves a template string with state modifier injection.
 */
function resolveTemplateSelector(
    template: string,
    options: StateStylesOptions,
    index: number
): string {
    const enabledMod = options.enabled ?? ''
    const hoveredMod = options.hovered ?? ':hover'
    const pressedMod = options.pressed ?? ':active'
    const focusedMod = options.focused ?? ':focus-within'
    const disabledMod = options.disabled ?? (template.includes(':host') ? '[disabled]' : '.disabled')

    const modifiers = [enabledMod, hoveredMod, pressedMod, focusedMod, disabledMod]
    const mod = modifiers[index]

    let result = template

    if (result.includes('$state')) {
        result = result.replaceAll('$state', mod)
    } else if (result.includes('{state}')) {
        result = result.replaceAll('{state}', mod)
    } else if (result.startsWith(':host(')) {
        result = result.replace(/:host\((.*?)\)/, (_, inner) => `:host(${inner}${mod})`)
    } else if (result.startsWith(':host')) {
        result = result.replace(/:host/, `:host${mod}`)
    } else {
        result = result.replace(/^(\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)/, `$1${mod}`)
    }

    // Clean up invalid :host() empty argument (e.g. when $state was empty inside :host($state))
    result = result.replaceAll(':host()', ':host')

    return result.trim()
}

/**
 * Resolves the selector string for a specific state index.
 */
function resolveSelectorForState(
    options: StateStylesOptions,
    state: StateName,
    index: number
): string | null {
    const { selector, selectors } = options

    // 1. Check explicit override in options.selectors
    if (selectors && selectors[state] !== undefined) {
        const custom = selectors[state]
        return custom ? custom.trim() : null
    }

    // 2. Function generator
    if (typeof selector === 'function') {
        const res = selector(state, index)
        return res ? res.trim() : null
    }

    // 3. 5-element array / tuple
    if (Array.isArray(selector)) {
        const res = selector[index]
        return res ? res.trim() : null
    }

    // 4. Object map (with per-state overrides and optional .base template)
    if (typeof selector === 'object' && selector !== null) {
        const map = selector as StateSelectorMap
        if (map[state] !== undefined) {
            const res = map[state]
            return res ? res.trim() : null
        }
        if (map.base) {
            return resolveTemplateSelector(map.base, options, index)
        }
        return null
    }

    // 5. String template
    if (typeof selector === 'string') {
        return resolveTemplateSelector(selector, options, index)
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
 *     selectors: {
 *         disabled: ':host(:not([checked]):has(.container.disabled)) .label',
 *     },
 *     properties: {
 *         color: 'unselected-label-color',
 *         'grid-template-rows': 'var(--_$state-indicator-height) min(var(--_$state-label-line-height), var(--_$state-label-size))',
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

            let entryVal: string | number | StatePropertyFunction | null | undefined

            if (Array.isArray(val)) {
                entryVal = val[i]
            } else {
                entryVal = val as string | number | StatePropertyFunction
            }

            if (entryVal !== null && entryVal !== undefined) {
                const formatted = formatPropertyValue(state, entryVal, i)
                if (formatted !== null && formatted !== undefined) {
                    declarations.push(`${prop}: ${formatted};`)
                }
            }
        }

        if (declarations.length > 0) {
            rules.push(`${selector} {\n    ${declarations.join('\n    ')}\n}`)
        }
    }

    return unsafeCSS(rules.join('\n'))
}
