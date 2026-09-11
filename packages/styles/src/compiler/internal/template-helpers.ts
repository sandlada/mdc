/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { MDCStyleSheet } from '../../foundation'
import type { CSSLike } from '../../foundation'
import { compileStateSheet, type CompileStateSheetOptions } from '../sheet'

export function interpolateTemplate(strings: TemplateStringsArray | string | readonly string[], values: readonly any[]): string {
    if (typeof strings === 'string') return strings
    if (!Array.isArray(strings)) return ''

    let result = ''
    for (let i = 0; i < strings.length; i++) {
        result += strings[i]
        if (i < values.length) {
            const val = values[i]
            if (val === null || val === undefined) {
                continue
            }
            if (typeof val === 'object' && val !== null) {
                if (typeof (val as any).ToCSSVariable === 'function') {
                    result += (val as any).ToCSSVariable()
                } else if ('cssText' in val && typeof (val as any).cssText === 'string') {
                    result += (val as any).cssText
                } else if (Array.isArray(val)) {
                    result += val.map((v) => {
                        if (v && typeof v === 'object' && 'cssText' in v) return (v as any).cssText
                        if (v && typeof v === 'object' && typeof (v as any).ToCSSVariable === 'function') return (v as any).ToCSSVariable()
                        return String(v ?? '')
                    }).join(' ')
                } else {
                    result += String(val)
                }
            } else {
                result += String(val)
            }
        }
    }
    return result
}

export function isTemplateStringsArray(val: unknown): val is TemplateStringsArray {
    return Array.isArray(val) && 'raw' in val && Array.isArray((val as any).raw)
}

const STATE_AWARE_RE = /@state\s*\(|@variant\s*\(|@when\s*\(|@anchor\b|@slot\b|@slotted\b|@size\b|@elevation\b|var\(\s*--_/

export function compileTemplate(
    definition: any,
    templateOrStrings: any,
    options?: CompileStateSheetOptions,
    values: any[] = []
): MDCStyleSheet {
    let rawCss = ''

    if (isTemplateStringsArray(templateOrStrings)) {
        rawCss = interpolateTemplate(templateOrStrings, values)
    } else if (typeof templateOrStrings === 'function') {
        const res = templateOrStrings(definition)
        rawCss = typeof res === 'string' ? res : (res as CSSLike)?.cssText || String(res ?? '')
    } else if (templateOrStrings !== undefined) {
        rawCss = typeof templateOrStrings === 'string'
            ? templateOrStrings
            : (templateOrStrings as CSSLike)?.cssText || String(templateOrStrings ?? '')
    }

    if ((definition === undefined || definition === null) && STATE_AWARE_RE.test(rawCss)) {
        throw new Error('[mdc-styles] createStyleSheet requires a style definition for state-aware templates; received empty definition.')
    }

    const compiled = compileStateSheet(definition, rawCss, options)
    return new MDCStyleSheet(compiled)
}
