/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface SkeletonLineSpec {
    readonly index: number
    readonly isLast: boolean
    readonly width: string | null
}

const UnsafeCssCharsPattern = /[;{}<>]/

/**
 * Validates that `lines` is a positive finite integer (`>= 1`).
 * Throws an `Error` on invalid input (fail-fast).
 */
export const assertValidLineCount = (lines: number): number => {
    if (typeof lines !== 'number' || !Number.isInteger(lines) || lines < 1) {
        throw new Error(`Invalid skeleton line count: ${String(lines)}. Expected a positive integer >= 1.`)
    }
    return lines
}

/**
 * Normalizes a CSS dimension or aspect-ratio string.
 * Returns `null` for empty/whitespace-only strings.
 * Throws an `Error` if unsafe CSS injection characters are present.
 */
export const normalizeCssDimension = (value: string): string | null => {
    if (typeof value !== 'string') {
        throw new Error(`Invalid CSS dimension value: expected string, received ${typeof value}.`)
    }
    const trimmed = value.trim()
    if (trimmed.length === 0) {
        return null
    }
    if (UnsafeCssCharsPattern.test(trimmed)) {
        throw new Error(`Invalid CSS dimension value: "${trimmed}" contains disallowed characters.`)
    }
    return trimmed
}

/**
 * Computes line layout specifications for multi-line text skeletons (data-last).
 *
 * - Single line (`lines === 1`): `width` is `null` (inherits full container width).
 * - Multi-line (`lines > 1`): lines `0..lines-2` have `width: null` (full width),
 *   and the final line receives the normalized `lastLineWidth` (or `null` to use
 *   the CSS token `--_text-last-line-width`).
 */
export const computeSkeletonLines =
    (lastLineWidth: string) =>
        (lines: number): readonly SkeletonLineSpec[] => {
            const count = assertValidLineCount(lines)
            const normalizedLastWidth = normalizeCssDimension(lastLineWidth)
            const specs: SkeletonLineSpec[] = []

            for (let index = 0; index < count; index++) {
                const isLast = index === count - 1
                const width = count > 1 && isLast ? normalizedLastWidth : null
                specs.push(Object.freeze({ index, isLast, width }))
            }

            return Object.freeze(specs)
        }
