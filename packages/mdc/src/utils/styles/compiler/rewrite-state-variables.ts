/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateTokenMetadata } from './extract-state-token-metadata'

export interface StateDimensionItem {
    readonly name: string
    readonly modifier: string
    readonly target: 'self' | 'host'
}

export const rewriteStateVariables = (
    cssText: string,
    currentStates: readonly string[],
    meta: StateTokenMetadata
): string => {
    return cssText.replace(
        /var\(\s*(--_[a-zA-Z0-9_-]+)(\s*,[\s\S]*?)?\)/g,
        (fullMatch, varName: string, fallback: string = '') => {
            const tokenName = varName.replace(/^--_/, '')
            if (!meta.isStateToken(tokenName)) {
                return fullMatch
            }

            for (const state of currentStates) {
                if (meta.hasStateToken(tokenName, state)) {
                    const stateVar = meta.resolveStateVarName(tokenName, state)
                    return `var(--_${stateVar}${fallback})`
                }
            }

            return fullMatch
        }
    )
}
