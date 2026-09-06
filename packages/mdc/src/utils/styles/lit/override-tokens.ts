/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit-bound twin of `overrideTokens` / `overrideComponentTokens`: identical
 * curried signatures, but terminal values are real Lit `CSSResult`s.
 */

import { type CSSResult } from 'lit'
import {
    overrideTokens as coreOverrideTokens,
    overrideComponentTokens as coreOverrideComponentTokens,
    type OverrideTokensOptions
} from '../override-tokens'
import { toLit } from './to-lit'

/**
 * Lit-bound `overrideTokens`. See core `../override-tokens` for semantics.
 */
export function overrideTokens<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: string | OverrideTokensOptions
) {
    const run = coreOverrideTokens<TDef>(prefixOrOptions)

    return (
        tokens: Partial<Record<keyof TDef | string, any>>
    ) => (
        _definition?: TDef
    ): CSSResult => toLit(run(tokens)(_definition))
}

/**
 * Lit-bound `overrideComponentTokens` for legacy component token overrides.
 */
export function overrideComponentTokens<T = any>(
    prefix: string,
    tokens: Partial<Record<string, any>>
): CSSResult {
    return toLit(coreOverrideComponentTokens<T>(prefix, tokens))
}

export { stringTokens } from '../override-tokens'
