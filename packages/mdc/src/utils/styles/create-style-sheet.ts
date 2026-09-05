/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { unsafeCSS, type CSSResult } from 'lit'
import { StateTriggerRegistry } from './map-state-triggers'
import { compileStateSheet, type CompileStateSheetOptions } from './state-sheet-compiler'
import type { ResolvedStyleDefinition } from './create-style-definition'

export type StyleSheetCallback = (tokens?: any) => CSSResult | string

export type TaggedTemplateFn = (
    strings: TemplateStringsArray,
    ...values: any[]
) => CSSResult

export type StyleSheetCurriedWithDef = {
    (template: StyleSheetCallback | CSSResult | string): CSSResult
    (strings: TemplateStringsArray, ...values: any[]): CSSResult
}

export type StyleSheetCurriedWithOptions = {
    <TDef extends Record<string, any>>(definition: TDef): StyleSheetCurriedWithDef
}

export interface CreateStyleSheetFn {
    (
        options: StateTriggerRegistry | CompileStateSheetOptions
    ): StyleSheetCurriedWithOptions

    <TDef extends ResolvedStyleDefinition<any, any>>(
        definition: TDef
    ): StyleSheetCurriedWithDef

    <TDef extends Record<string, any>>(
        definition: TDef
    ): StyleSheetCurriedWithDef

    <TDef extends Record<string, any>>(
        definition: TDef,
        cssOrFn: StyleSheetCallback | CSSResult | string
    ): CSSResult

    <TDef extends Record<string, any>>(
        definition: TDef,
        strings: TemplateStringsArray,
        ...values: any[]
    ): CSSResult

    (): (optionsOrDef?: any) => any
}

function interpolateTemplate(strings: TemplateStringsArray | string | readonly string[], values: readonly any[]): string {
    if (typeof strings === 'string') return strings
    if (!Array.isArray(strings)) return ''

    let result = ''
    for (let i = 0; i < strings.length; i++) {
        result += strings[i]
        if (i < values.length) {
            const val = values[i]
            if (val === null || val === undefined) {
                continue
            }
            if (typeof val === 'object' && val !== null) {
                if (typeof (val as any).ToCSSVariable === 'function') {
                    result += (val as any).ToCSSVariable()
                } else if ('cssText' in val && typeof (val as any).cssText === 'string') {
                    result += (val as any).cssText
                } else if (Array.isArray(val)) {
                    result += val.map((v) => {
                        if (v && typeof v === 'object' && 'cssText' in v) return (v as any).cssText
                        if (v && typeof v === 'object' && typeof (v as any).ToCSSVariable === 'function') return (v as any).ToCSSVariable()
                        return String(v ?? '')
                    }).join(' ')
                } else {
                    result += String(val)
                }
            } else {
                result += String(val)
            }
        }
    }
    return result
}

function isTemplateStringsArray(val: unknown): val is TemplateStringsArray {
    return Array.isArray(val) && 'raw' in val && Array.isArray((val as any).raw)
}

function compileTemplate(
    definition: any,
    templateOrStrings: any,
    options?: CompileStateSheetOptions,
    values: any[] = []
): CSSResult {
    let rawCss = ''

    if (isTemplateStringsArray(templateOrStrings)) {
        rawCss = interpolateTemplate(templateOrStrings, values)
    } else if (typeof templateOrStrings === 'function') {
        const res = templateOrStrings(definition)
        rawCss = typeof res === 'string' ? res : (res as CSSResult)?.cssText || String(res ?? '')
    } else if (templateOrStrings !== undefined) {
        rawCss = typeof templateOrStrings === 'string'
            ? templateOrStrings
            : (templateOrStrings as CSSResult)?.cssText || String(templateOrStrings ?? '')
    }

    const compiled = compileStateSheet(definition, rawCss, options)
    return unsafeCSS(compiled)
}

/**
 * Primary tagged template and HOF entrypoint for authoring state-aware, differential component stylesheets.
 *
 * Compiles new-system ATRules (`@state`, `@variant`, `@when`, property expanders,
 * a11y macros) and legacy ATRules (`@anchor <sel>`, `@variant`, `@slot`, `@slotted`,
 * `@size`, `@elevation`) with multi-state tokens into standard CSS,
 * wrapped inside a Lit `CSSResult`. Routing between the two engines is automatic
 * (see `compileStateSheet`; semantics Oracle: `at-rules.spec.ts`).
 *
 * Supports:
 * 1. Options or trigger registry: `createStyleSheet(triggers)(ButtonDefinition)\`...\``
 * 2. Point-free functional pipelines: `pipe(triggers, createStyleSheet)(ButtonDefinition)\`...\``
 * 3. Direct tagged template literals: `createStyleSheet(ButtonDefinition)\`@state(button) button { ... }\``
 * 4. Curried definition-first: `createStyleSheet(ButtonDefinition)(\`@state(button) button { ... }\`)`
 *
 * @example
 * ```typescript
 * import { createStyleSheet } from '@sandlada/mdc/utils/styles/create-style-sheet'
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
 * import { ButtonDefinition } from './button.definition'
 *
 * // 1. Direct tagged template literal (new @state system):
 * export const ButtonStyles = createStyleSheet({ registry: triggers })(ButtonDefinition)`
 *     @state(button) button {
 *         border-radius: var(--_container-shape);
 *         background-color: var(--_container-color);
 *         .label { color: var(--_label-color); }
 *     }
 * `
 * ```
 */
export const createStyleSheet: CreateStyleSheetFn = function (arg1?: any, arg2?: any, ...rest: any[]): any {
    // 0. Zero arguments form in pipelines: createStyleSheet() -> (optionsOrDef) => createStyleSheet(optionsOrDef)
    if (arg1 === undefined) {
        return (optOrDef?: any) => (optOrDef === undefined ? createStyleSheet : createStyleSheet(optOrDef))
    }

    // 1. Direct uncurried form: createStyleSheet(definition, cssOrFn, ...values)
    if (arg2 !== undefined) {
        return compileTemplate(arg1, arg2, undefined, rest)
    }

    // 2. Options or StateTriggerRegistry passed first: createStyleSheet(options) -> (definition) -> (template)
    if (
        arg1 instanceof StateTriggerRegistry ||
        (arg1 && typeof arg1 === 'object' && ('registry' in arg1 || 'triggers' in arg1 || 'variantSelector' in arg1 || 'onWarn' in arg1))
    ) {
        const compileOptions: CompileStateSheetOptions = arg1 instanceof StateTriggerRegistry
            ? { registry: arg1 }
            : arg1

        const curriedWithOptions: StyleSheetCurriedWithOptions = (definition: any): StyleSheetCurriedWithDef => {
            const curriedWithDef: StyleSheetCurriedWithDef = ((templateOrStrings: any, ...values: any[]): CSSResult => {
                return compileTemplate(definition, templateOrStrings, compileOptions, values)
            }) as StyleSheetCurriedWithDef
            return curriedWithDef
        }
        return curriedWithOptions
    }

    // 3. Definition passed first: createStyleSheet(definition) -> (template)
    const definition = arg1
    const curriedWithDef: StyleSheetCurriedWithDef = ((templateOrStrings: any, ...values: any[]): CSSResult => {
        return compileTemplate(definition, templateOrStrings, undefined, values)
    }) as StyleSheetCurriedWithDef
    return curriedWithDef
} as CreateStyleSheetFn
