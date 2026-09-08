/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit-bound twin of `stringifyTokens`: identical curried signature, but the
 * terminal value is a real Lit `CSSResult`, so it interpolates directly in
 * `css` templates and sits directly in `static styles` arrays with no
 * `unsafeCSS` / `toLit` wrapping at call sites.
 */

import { type CSSResult } from 'lit'
import type { StateSchema } from '../define-schema'
import type {
    ResolvedStyleDefinition,
    TokenValue,
    PrimitiveTokenValue
} from '../create-style-definition'
import {
    stringifyTokens as coreStringifyTokens,
    type StringifyPrefixOrOptions
} from '../tokens'
import { toLit } from './to-lit'

/**
 * Lit-bound `stringifyTokens`. See core `../stringify-tokens` for semantics.
 *
 * @example
 * ```typescript
 * import { css } from 'lit'
 * import { stringifyTokens } from '@sandlada/styles/lit'
 *
 * const buttonTokens = stringifyTokens('--mdc-button')(ButtonDefinition)
 *
 * export const ButtonHostStyles = css`
 *     :host {
 *         ${buttonTokens}
 *     }
 * `
 * ```
 */
export function stringifyTokens(
    prefixOrOptions: StringifyPrefixOrOptions
) {
    const run = coreStringifyTokens(prefixOrOptions)

    return <
        const TStates extends readonly string[] = readonly string[],
        const TTokens extends Record<string, TokenValue<TStates, PrimitiveTokenValue>> = Record<string, TokenValue<TStates, PrimitiveTokenValue>>
    >(
        definition: ResolvedStyleDefinition<StateSchema<TStates>, TTokens> | Record<string, any>
    ): CSSResult => toLit(run(definition))
}
