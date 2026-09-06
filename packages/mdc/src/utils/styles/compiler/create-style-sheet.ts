/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSLike } from '../css-like'
import { MDCStyleSheet } from '../css-like'
import { StateTriggerRegistry } from '../map-state-triggers'
import type { ResolvedStyleDefinition } from '../create-style-definition'
import type { CompileStateSheetOptions } from './compile-state-sheet'
import { compileTemplate } from './internal/template-helpers'

export type StyleSheetCallback = (tokens?: any) => CSSLike | string

export type TaggedTemplateFn = (
    strings: TemplateStringsArray,
    ...values: any[]
) => MDCStyleSheet

export type StyleSheetCurriedWithDef = {
    (template: StyleSheetCallback | CSSLike | string): MDCStyleSheet
    (strings: TemplateStringsArray, ...values: any[]): MDCStyleSheet
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
        cssOrFn: StyleSheetCallback | CSSLike | string
    ): MDCStyleSheet

    <TDef extends Record<string, any>>(
        definition: TDef,
        strings: TemplateStringsArray,
        ...values: any[]
    ): MDCStyleSheet

    (): (optionsOrDef?: any) => any
}

export type CreateStyleSheetOptions = CompileStateSheetOptions

/**
 * Primary tagged template and HOF entrypoint for authoring state-aware, differential component stylesheets.
 *
 * Compiles new-system ATRules (`@state`, `@variant`, `@when`, property expanders,
 * a11y macros) and legacy ATRules (`@anchor <sel>`, `@variant`, `@slot`, `@slotted`,
 * `@size`, `@elevation`) with multi-state tokens into standard CSS,
 * wrapped inside a framework-agnostic `MDCStyleSheet`. Routing between the two engines is automatic
 * (see `compileStateSheet`; semantics Oracle: `at-rules.spec.ts`).
 *
 * Accepts Lit `css` results (or any `{ cssText }` holder) as input via
 * structural typing without importing `lit`. Convert the returned sheet to a
 * Lit `CSSResult` with `toLit()` from `utils/styles/lit` when assigning to
 * `static styles`.
 *
 * Supports:
 * 1. Options or trigger registry: `createStyleSheet(triggers)(ButtonDefinition)\`...\``
 * 2. Point-free functional pipelines: `pipe(triggers, createStyleSheet)(ButtonDefinition)\`...\``
 * 3. Direct tagged template literals: `createStyleSheet(ButtonDefinition)\`@state(button) button { ... }\``
 * 4. Curried definition-first: `createStyleSheet(ButtonDefinition)(\`@state(button) button { ... }\`)`
 *
 * @example
 * ```typescript
 * import { createStyleSheet } from '@sandlada/mdc/utils/styles/compiler'
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
            const curriedWithDef: StyleSheetCurriedWithDef = ((templateOrStrings: any, ...values: any[]): MDCStyleSheet => {
                return compileTemplate(definition, templateOrStrings, compileOptions, values)
            }) as StyleSheetCurriedWithDef
            return curriedWithDef
        }
        return curriedWithOptions
    }

    // 3. Definition passed first: createStyleSheet(definition) -> (template)
    const definition = arg1
    const curriedWithDef: StyleSheetCurriedWithDef = ((templateOrStrings: any, ...values: any[]): MDCStyleSheet => {
        return compileTemplate(definition, templateOrStrings, undefined, values)
    }) as StyleSheetCurriedWithDef
    return curriedWithDef
} as CreateStyleSheetFn
