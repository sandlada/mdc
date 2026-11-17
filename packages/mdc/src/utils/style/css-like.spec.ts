/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCStyleSheet, cssTextOf, isCSSLike } from './css-like'

describe('MDCStyleSheet', () => {
    it('exposes cssText and stringifies to it', () => {
        const sheet = new MDCStyleSheet('a{b:c}')
        expect(sheet.cssText).toBe('a{b:c}')
        expect(String(sheet)).toBe('a{b:c}')
    })
})

describe('isCSSLike', () => {
    it('accepts objects with string cssText', () => {
        expect(isCSSLike({ cssText: '' })).toBe(true)
        expect(isCSSLike(new MDCStyleSheet('x'))).toBe(true)
    })

    it.each([null, undefined, 'str', 1, true, {}, { cssText: 1 }, { cssText: null }, []])(
        'rejects %j',
        (value) => {
            expect(isCSSLike(value)).toBe(false)
        },
    )
})

describe('cssTextOf', () => {
    it('returns empty string for null/undefined', () => {
        expect(cssTextOf(null)).toBe('')
        expect(cssTextOf(undefined)).toBe('')
    })

    it('returns strings unchanged (including empty)', () => {
        expect(cssTextOf('a{}')).toBe('a{}')
        expect(cssTextOf('')).toBe('')
    })

    it('extracts cssText from CSSLike', () => {
        expect(cssTextOf({ cssText: 'p{}' })).toBe('p{}')
    })

    it('falls back to String(value) for non-CSSLike objects', () => {
        expect(cssTextOf({ toString: () => 'custom' } as never)).toBe('custom')
    })
})
