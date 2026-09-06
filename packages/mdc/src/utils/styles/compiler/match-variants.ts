/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { globToRegex } from './internal/metadata-helpers'

export function matchVariants(patterns: readonly string[], allVariantNames: readonly string[]): string[] {
    const cleanPatterns = patterns.map((p) => p.trim()).filter(Boolean)
    const positivePatterns = cleanPatterns.filter((p) => !p.startsWith('!'))
    const negativePatterns = cleanPatterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1).trim()).filter(Boolean)

    let matched: string[] = []

    if (positivePatterns.length > 0) {
        if (allVariantNames.length > 0) {
            matched = allVariantNames.filter((name) =>
                positivePatterns.some((pat) => globToRegex(pat).test(name))
            )
        } else {
            matched = positivePatterns
        }
    } else {
        matched = [...allVariantNames]
    }

    if (negativePatterns.length > 0) {
        matched = matched.filter((name) =>
            !negativePatterns.some((pat) => globToRegex(pat).test(name))
        )
    }

    return matched
}
