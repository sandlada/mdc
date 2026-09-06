/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { MDCStyleSheet, isCSSLike, cssTextOf, sheetOf, emptySheet } from './css-like'

describe('css-like', () => {
    it('wraps text and exposes cssText + toString', () => {
        const sheet = sheetOf(':host { color: red; }')
        expect(sheet).toBeInstanceOf(MDCStyleSheet)
        expect(sheet.cssText).toBe(':host { color: red; }')
        expect(String(sheet)).toBe(':host { color: red; }')
        expect(`${sheet}`).toBe(':host { color: red; }')
    })

    it('emptySheet returns an empty MDCStyleSheet', () => {
        expect(emptySheet().cssText).toBe('')
    })

    it('isCSSLike accepts framework holders and rejects others', () => {
        expect(isCSSLike(sheetOf('a'))).toBe(true)
        expect(isCSSLike({ cssText: 'b' })).toBe(true)
        expect(isCSSLike('b')).toBe(false)
        expect(isCSSLike(null)).toBe(false)
        expect(isCSSLike({})).toBe(false)
        expect(isCSSLike({ cssText: 1 })).toBe(false)
    })

    it('cssTextOf extracts text from sheets, strings, and nullish', () => {
        expect(cssTextOf(sheetOf('x'))).toBe('x')
        expect(cssTextOf({ cssText: 'y' })).toBe('y')
        expect(cssTextOf('z')).toBe('z')
        expect(cssTextOf(null)).toBe('')
        expect(cssTextOf(undefined)).toBe('')
    })
})
