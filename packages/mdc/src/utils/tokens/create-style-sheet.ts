/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { compileStateSheet } from './state-sheet-compiler'

export type StyleSheetCallback = (tokens: any) => CSSResult | string

/**
 * Creates an MDC component style sheet with automatic multi-state expansion and differential CSS generation.
 *
 * @example
 * ```typescript
 * export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css`
 *     @anchor .container {
 *         .label {
 *             color: var(--_label-color);
 *             @when(.togglable.selected) {
 *                 color: var(--_label-color-toggle-selected);
 *             }
 *         }
 *     }
 * `)
 * ```
 */
export function createStyleSheet(
    definition: any,
    cssOrFn?: StyleSheetCallback | CSSResult | string
): any {
    if (typeof cssOrFn === 'function') {
        const res = cssOrFn(definition)
        const rawCss = typeof res === 'string' ? res : (res as CSSResult)?.cssText || String(res)
        const compiled = compileStateSheet(definition, rawCss)
        return unsafeCSS(compiled)
    }

    if (cssOrFn !== undefined) {
        const rawCss = typeof cssOrFn === 'string' ? cssOrFn : (cssOrFn as CSSResult)?.cssText || String(cssOrFn)
        const compiled = compileStateSheet(definition, rawCss)
        return unsafeCSS(compiled)
    }

    // Direct tagged template literal form: createStyleSheet(Definition)`...`
    return (strings: TemplateStringsArray, ...values: any[]): CSSResult => {
        let rawCss = ''
        for (let i = 0; i < strings.length; i++) {
            rawCss += strings[i]
            if (i < values.length) {
                const val = values[i]
                rawCss += typeof val === 'object' && val?.cssText ? val.cssText : String(val ?? '')
            }
        }
        const compiled = compileStateSheet(definition, rawCss)
        return unsafeCSS(compiled)
    }
}
