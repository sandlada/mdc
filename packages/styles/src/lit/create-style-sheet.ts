/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit-bound twin of `createStyleSheet`: mirrors the core HOF overloads, but
 * every terminal value is a real Lit `CSSResult`, so results interpolate
 * directly in `css` templates and sit directly in `static styles` arrays.
 *
 * Accepts Lit `css` results (or any `{ cssText }` holder) as input via the
 * shared structural typing — e.g. `createStyleSheet(Def)(() => css`...`)`.
 */

import { type CSSResult } from 'lit'
import { isTriggerTables, type TriggerTables } from '../triggers/tables'
import type { ResolvedStyleDefinition } from '../create-style-definition'
import type { CompileStateSheetOptions } from '../compiler/compile-state-sheet'
import {
    createStyleSheet as coreCreateStyleSheet,
    type StyleSheetCallback
} from '../compiler/create-style-sheet'
import type { CSSLike } from '../css-like'
import { toLit } from './to-lit'

export type LitStyleSheetCurriedWithDef = {
    (template: StyleSheetCallback | CSSLike | string): CSSResult
    (strings: TemplateStringsArray, ...values: any[]): CSSResult
}

export type LitStyleSheetCurriedWithOptions = {
    <TDef extends Record<string, any>>(definition: TDef): LitStyleSheetCurriedWithDef
}

export interface LitCreateStyleSheetFn {
    (
        options: TriggerTables | CompileStateSheetOptions
    ): LitStyleSheetCurriedWithOptions

    <TDef extends ResolvedStyleDefinition<any, any>>(
        definition: TDef
    ): LitStyleSheetCurriedWithDef

    <TDef extends Record<string, any>>(
        definition: TDef
    ): LitStyleSheetCurriedWithDef

    <TDef extends Record<string, any>>(
        definition: TDef,
        cssOrFn: StyleSheetCallback | CSSLike | string
    ): CSSResult

    <TDef extends Record<string, any>>(
        definition: TDef,
        strings: TemplateStringsArray,
        ...values: any[]
    ): CSSResult

    (): (optionsOrDef?: any) => any
}

function isOptionsLike(arg: any): boolean {
    return isTriggerTables(arg) ||
        (arg && typeof arg === 'object' && ('tables' in arg || 'variantSelector' in arg || 'onWarn' in arg))
}

/**
 * Lit-bound `createStyleSheet`. See core `../compiler/create-style-sheet` for semantics.
 *
 * @example
 * ```typescript
 * import { css } from 'lit'
 * import { createStyleSheet } from '@sandlada/styles/lit'
 *
 * export const ButtonStyles = createStyleSheet(ButtonDefinition)(() => css`
 *     .container {
 *         background-color: var(--_container-color);
 *     }
 * `)
 * ```
 */
export const createStyleSheet: LitCreateStyleSheetFn = function (arg1?: any, arg2?: any, ...rest: any[]): any {
    // 0. Zero arguments form in pipelines: createStyleSheet() -> lit-bound chain
    if (arg1 === undefined) {
        return (optOrDef?: any) => (optOrDef === undefined ? createStyleSheet : (createStyleSheet as any)(optOrDef))
    }

    // 1. Direct uncurried form: createStyleSheet(definition, cssOrFn, ...values)
    if (arg2 !== undefined) {
        return toLit((coreCreateStyleSheet as any)(arg1, arg2, ...rest))
    }

    // 2. Options or TriggerTables passed first
    if (isOptionsLike(arg1)) {
        return (definition: any) => (templateOrStrings: any, ...values: any[]): CSSResult =>
            toLit((coreCreateStyleSheet as any)(arg1)(definition)(templateOrStrings, ...values))
    }

    // 3. Definition passed first
    return (templateOrStrings: any, ...values: any[]): CSSResult =>
        toLit((coreCreateStyleSheet as any)(arg1)(templateOrStrings, ...values))
} as LitCreateStyleSheetFn
