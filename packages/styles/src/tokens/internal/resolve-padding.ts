/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { PaddingObject } from '../expand-padding'

export const PADDING_OBJECT_KEYS = new Set([
    'all',
    'block',
    'inline',
    'blockStart',
    'blockEnd',
    'inlineStart',
    'inlineEnd',
    'block-start',
    'block-end',
    'inline-start',
    'inline-end'
])

export interface ResolvedEdgeQuad {
    blockStart?: any
    blockEnd?: any
    inlineStart?: any
    inlineEnd?: any
}

export function isPaddingObject(val: unknown): val is PaddingObject<any> {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        return false
    }
    const keys = Object.keys(val)
    return keys.some(k => PADDING_OBJECT_KEYS.has(k))
}

export function isPrimitiveValue(val: unknown): boolean {
    if (typeof val === 'string' || typeof val === 'number') {
        return true
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any)['ToCSSVariable'] === 'function') {
            return true
        }
        if ('_$cssResult$' in (val as object) || 'cssText' in (val as object)) {
            return true
        }
    }
    return false
}

export function resolveSinglePadding(val: unknown): ResolvedEdgeQuad {
    if (val === null || val === undefined) {
        throw new Error('[expandPadding] Padding value cannot be null or undefined.')
    }

    // 1. Primitive scalar
    if (isPrimitiveValue(val)) {
        return {
            blockStart: val,
            blockEnd: val,
            inlineStart: val,
            inlineEnd: val
        }
    }

    // 2. Tuple
    if (Array.isArray(val)) {
        if (val.length === 2) {
            return {
                blockStart: val[0],
                blockEnd: val[0],
                inlineStart: val[1],
                inlineEnd: val[1]
            }
        }
        if (val.length === 4) {
            return {
                blockStart: val[0],
                blockEnd: val[1],
                inlineStart: val[2],
                inlineEnd: val[3]
            }
        }
        throw new Error(
            `[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length ${val.length}.`
        )
    }

    // 3. Padding Object
    if (typeof val === 'object') {
        const keys = Object.keys(val)
        if (keys.length === 0) {
            throw new Error('[expandPadding] Padding object cannot be empty.')
        }

        const obj = val as Record<string, any>
        const defaultBlock = obj['block'] ?? obj['all']
        const defaultInline = obj['inline'] ?? obj['all']

        const blockStart = obj['block-start'] ?? obj['blockStart'] ?? defaultBlock
        const blockEnd = obj['block-end'] ?? obj['blockEnd'] ?? defaultBlock
        const inlineStart = obj['inline-start'] ?? obj['inlineStart'] ?? defaultInline
        const inlineEnd = obj['inline-end'] ?? obj['inlineEnd'] ?? defaultInline

        const result: ResolvedEdgeQuad = {}
        if (blockStart !== undefined) result.blockStart = blockStart
        if (blockEnd !== undefined) result.blockEnd = blockEnd
        if (inlineStart !== undefined) result.inlineStart = inlineStart
        if (inlineEnd !== undefined) result.inlineEnd = inlineEnd

        return result
    }

    throw new Error('[expandPadding] Invalid padding value.')
}
