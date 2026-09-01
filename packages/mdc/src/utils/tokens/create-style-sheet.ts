/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { compileStateSheet, type CompileStateSheetOptions } from './state-sheet-compiler'
import { IS_STYLE_SHEET_OPTIONS, type CreateStyleSheetOptions } from './with-state-triggers'

export type StyleSheetCallback = (tokens: any) => CSSResult | string

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

function resolveOptions(obj: any): CreateStyleSheetOptions | undefined {
    if (!obj) return undefined
    if (typeof obj === 'function' && obj[IS_STYLE_SHEET_OPTIONS]) {
        return obj()
    }
    if (typeof obj === 'object') {
        if (obj[IS_STYLE_SHEET_OPTIONS] || 'triggers' in obj || 'registry' in obj) {
            return obj
        }
    }
    return undefined
}

function compileTemplate(
    definition: any,
    templateOrStrings: any,
    options?: CompileStateSheetOptions,
    values: any[] = []
): CSSResult {
    let rawCss = ''

    if (Array.isArray(templateOrStrings) && 'raw' in templateOrStrings) {
        const strings = templateOrStrings as TemplateStringsArray
        for (let i = 0; i < strings.length; i++) {
            rawCss += strings[i]
            if (i < values.length) {
                const val = values[i]
                if (Array.isArray(val)) {
                    rawCss += val.map((item) => typeof item === 'object' && item?.cssText ? item.cssText : String(item ?? '')).join(' ')
                } else if (typeof val === 'object' && val?.cssText) {
                    rawCss += val.cssText
                } else {
                    rawCss += String(val ?? '')
                }
            }
        }
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

export interface CreateStyleSheetFn {
    <TOptions extends CreateStyleSheetOptions | ((...args: any[]) => CreateStyleSheetOptions)>(
        options: TOptions
    ): StyleSheetCurriedWithOptions

    <TDef extends Record<string, any>>(
        definition: TDef
    ): StyleSheetCurriedWithDef

    <TDef extends Record<string, any>>(
        definition: TDef,
        cssOrFn: StyleSheetCallback | CSSResult | string
    ): CSSResult

    (): (optionsOrDef?: any) => any
}

/**
 * Creates an MDC component style sheet with automatic multi-state expansion and differential CSS generation.
 *
 * Supports curried HOF: `createStyleSheet(options)(definition)(template)` or `createStyleSheet(definition)(template)`
 * Tagged template literals: `createStyleSheet(definition)\`...\``
 * Uncurried callback: `createStyleSheet(definition, () => css\`...\`)`
 * Functional pipe composition: `pipe(withStateTriggers(...), createStyleSheet)` or `pipe(withStateTriggers(...), createStyleSheet())`
 */
export const createStyleSheet: CreateStyleSheetFn = function (arg1?: any, arg2?: any): any {
    // 0. Zero arguments form in pipelines: createStyleSheet() -> (optionsOrDef) => createStyleSheet(optionsOrDef)
    if (arg1 === undefined) {
        return (optOrDef?: any) => optOrDef === undefined ? createStyleSheet : createStyleSheet(optOrDef)
    }

    // 1. Direct uncurried form: createStyleSheet(definition, cssOrFn)
    if (arg2 !== undefined) {
        return compileTemplate(arg1, arg2, undefined, [])
    }

    // 2. Options or options factory passed first: createStyleSheet(options) -> (definition) -> (template)
    const resolvedOpts = resolveOptions(arg1)
    if (resolvedOpts !== undefined) {
        return (definition: any): StyleSheetCurriedWithDef => {
            const curriedWithDef = (templateOrStrings: any, ...values: any[]): CSSResult => {
                return compileTemplate(definition, templateOrStrings, resolvedOpts, values)
            }
            return curriedWithDef
        }
    }

    // 3. Definition passed first: createStyleSheet(definition) -> (template)
    const definition = arg1
    const curriedWithDef = (templateOrStrings: any, ...values: any[]): CSSResult => {
        return compileTemplate(definition, templateOrStrings, undefined, values)
    }
    return curriedWithDef
} as CreateStyleSheetFn
