/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { unsafeCSS, type CSSResult } from 'lit'
import { stringifyTokens } from './stringify-tokens'
import type { ResolvedStyleDefinition } from './create-style-definition'

export interface DefineVariantTokensOptions {
    /**
     * Public CSS custom property prefix (e.g. `'--mdc-navigation-tab'`).
     */
    readonly prefix: string

    /**
     * Custom variant selector factory function.
     * Default: `(variantName) => ':host([variant="' + variantName + '"])'`
     */
    readonly variantSelector?: (variantName: string) => string

    /**
     * Whether to generate public override variables mapping to private variables.
     * Default: true.
     */
    readonly includePublicVars?: boolean
}

export type DefineVariantTokensOptionsOrPrefix = string | DefineVariantTokensOptions

/**
 * Pure functional, data-last curried factory for batch generating multi-variant token injection CSS blocks.
 *
 * @param optionsOrPrefix - Configuration options or public CSS prefix string.
 * @returns Curried function accepting a dictionary of variant definitions and returning a Lit CSSResult.
 *
 * @example
 * ```typescript
 * import { defineVariantTokens } from '@sandlada/mdc/utils/styles'
 * import { pipe } from '@sandlada/mdc/utils/styles/pipe'
 * import { NavigationTabVariants } from './navigation-tab.definition'
 *
 * // Direct curried invocation:
 * export const tabVariantTokens = defineVariantTokens({
 *     prefix: '--mdc-navigation-tab',
 *     variantSelector: (v) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
 * })(NavigationTabVariants)
 *
 * // Pipeline composition:
 * export const pipedTokens = pipe(
 *     NavigationTabVariants,
 *     defineVariantTokens({ prefix: '--mdc-navigation-tab' })
 * )
 * ```
 */
export function defineVariantTokens(optionsOrPrefix: DefineVariantTokensOptionsOrPrefix) {
    const options: DefineVariantTokensOptions = typeof optionsOrPrefix === 'string'
        ? { prefix: optionsOrPrefix }
        : optionsOrPrefix

    const selectorFn = options.variantSelector ?? ((variantName: string) => `:host([variant="${variantName}"])`)
    const includePublicVars = options.includePublicVars ?? true

    return <TVariants extends Record<string, ResolvedStyleDefinition<any, any> | Record<string, any>>>(
        variants: TVariants
    ): CSSResult => {
        if (!variants || typeof variants !== 'object') {
            return unsafeCSS('')
        }

        const blocks: string[] = []

        for (const [variantName, definition] of Object.entries(variants)) {
            if (!definition || typeof definition !== 'object') continue

            const tokensCss = stringifyTokens({
                prefix: options.prefix,
                includePublicVars,
            })(definition)

            const cssText = tokensCss.cssText.trim()
            if (cssText.length > 0) {
                const selector = selectorFn(variantName)
                const indented = cssText
                    .split('\n')
                    .map((line) => `    ${line}`)
                    .join('\n')
                blocks.push(`${selector} {\n${indented}\n}`)
            }
        }

        if (blocks.length === 0) {
            return unsafeCSS('')
        }

        return unsafeCSS(blocks.join('\n\n'))
    }
}
