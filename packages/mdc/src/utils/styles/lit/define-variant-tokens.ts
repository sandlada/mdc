/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit-bound twin of `defineVariantTokens`: identical curried signature, but
 * the terminal value is a real Lit `CSSResult`.
 */

import { type CSSResult } from 'lit'
import type { ResolvedStyleDefinition } from '../create-style-definition'
import {
    defineVariantTokens as coreDefineVariantTokens,
    type DefineVariantTokensOptionsOrPrefix
} from '../define-variant-tokens'
import { toLit } from './to-lit'

/**
 * Lit-bound `defineVariantTokens`. See core `../define-variant-tokens` for semantics.
 */
export function defineVariantTokens(optionsOrPrefix: DefineVariantTokensOptionsOrPrefix) {
    const run = coreDefineVariantTokens(optionsOrPrefix)

    return <TVariants extends Record<string, ResolvedStyleDefinition<any, any> | Record<string, any>>>(
        variants: TVariants
    ): CSSResult => toLit(run(variants))
}
