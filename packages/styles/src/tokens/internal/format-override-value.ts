/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { OverrideTokensOptions } from '../override-tokens'

export function normalizeOptions(prefixOrOptions: string | OverrideTokensOptions): {
    prefix: string
    selector?: string
} {
    if (typeof prefixOrOptions === 'string') {
        const raw = prefixOrOptions.trim()
        const normalized = raw.startsWith('--') ? raw : `--${raw}`
        return {
            prefix: normalized.replace(/-+$/, '')
        }
    }

    const { prefix = '', selector } = prefixOrOptions ?? {}
    const raw = prefix.trim()
    const normalized = raw.startsWith('--') ? raw : `--${raw}`
    return {
        prefix: normalized.replace(/-+$/, ''),
        selector
    }
}

export function formatOverrideValue(val: unknown): string {
    if (val === null || val === undefined) {
        return ''
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatOverrideValue((val as any).rawVal)
        }
    }
    return String(val)
}
