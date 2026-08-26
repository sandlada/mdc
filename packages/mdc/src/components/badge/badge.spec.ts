/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCBadge } from './badge'

describe('MDCBadge', () => {
    it('has correct default properties', () => {
        const badge = new MDCBadge()
        expect(badge.size).toBe('small')
        expect(badge.value).toBe(null)
        expect(badge.label).toBe(null)
        expect(badge.max).toBe(99)
        expect(badge.autoSizeOnZero).toBe(false)
        expect(badge.effectiveSize).toBe('small')
        expect(badge.hasLabel).toBe(false)
        expect((badge as any).displayText).toBe('')
    })

    it('allows updating size property', () => {
        const badge = new MDCBadge()
        badge.size = 'large'
        expect(badge.size).toBe('large')
        expect(badge.effectiveSize).toBe('large')
    })

    describe('value display formatting (fallback when label is not provided)', () => {
        it('formats numeric values <= max as plain string', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 5
            expect((badge as any).displayText).toBe('5')
            expect(badge.hasLabel).toBe(true)

            badge.value = 99
            expect((badge as any).displayText).toBe('99')
        })

        it('formats numeric values > max as max+', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 100
            expect((badge as any).displayText).toBe('99+')

            badge.value = 996
            expect((badge as any).displayText).toBe('99+')
        })

        it('formats numeric strings with max threshold', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = '42'
            expect((badge as any).displayText).toBe('42')

            badge.value = '150'
            expect((badge as any).displayText).toBe('99+')
        })

        it('displays non-numeric strings as is', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 'alpha'
            expect((badge as any).displayText).toBe('alpha')
            expect(badge.hasLabel).toBe(true)
        })

        it('returns empty string when value is null or empty', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = null
            expect((badge as any).displayText).toBe('')
            expect(badge.hasLabel).toBe(false)

            badge.value = ''
            expect((badge as any).displayText).toBe('')
            expect(badge.hasLabel).toBe(false)
        })
    })

    describe('explicit label property (highest precedence)', () => {
        it('displays explicit label overriding value', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 996
            badge.label = '99+'
            expect((badge as any).displayText).toBe('99+')
            expect(badge.value).toBe(996)
            expect(badge.label).toBe('99+')
        })

        it('displays custom text label with high values', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 1000
            badge.label = '1k+'
            expect((badge as any).displayText).toBe('1k+')
        })

        it('displays standalone label when value is null', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.label = 'NEW'
            expect((badge as any).displayText).toBe('NEW')
            expect(badge.hasLabel).toBe(true)
        })

        it('falls back to value when label is empty string', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 42
            badge.label = ''
            expect((badge as any).displayText).toBe('42')
        })
    })

    describe('max property customization', () => {
        it('supports max=999 threshold', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.max = 999

            badge.value = 500
            expect((badge as any).displayText).toBe('500')

            badge.value = 999
            expect((badge as any).displayText).toBe('999')

            badge.value = 1000
            expect((badge as any).displayText).toBe('999+')
        })

        it('disables overflow formatting when max is null or <= 0', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.max = null
            badge.value = 10000
            expect((badge as any).displayText).toBe('10000')

            badge.max = 0
            badge.value = 10000
            expect((badge as any).displayText).toBe('10000')
        })
    })

    describe('autoSizeOnZero option', () => {
        it('defaults to false and shows 0 in large size', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 0
            expect(badge.autoSizeOnZero).toBe(false)
            expect(badge.effectiveSize).toBe('large')
            expect((badge as any).displayText).toBe('0')
            expect(badge.hasLabel).toBe(true)
        })

        it('switches to small dot with no label when value is 0 and autoSizeOnZero is true', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.autoSizeOnZero = true

            badge.value = 0
            expect((badge as any).isZero).toBe(true)
            expect(badge.effectiveSize).toBe('small')
            expect((badge as any).displayText).toBe('')
            expect(badge.hasLabel).toBe(false)

            badge.value = '0'
            expect((badge as any).isZero).toBe(true)
            expect(badge.effectiveSize).toBe('small')
            expect((badge as any).displayText).toBe('')
            expect(badge.hasLabel).toBe(false)
        })

        it('switches to large size with label when value > 0 and autoSizeOnZero is true', () => {
            const badge = new MDCBadge()
            badge.size = 'small'
            badge.autoSizeOnZero = true

            badge.value = 5
            expect((badge as any).isZero).toBe(false)
            expect(badge.effectiveSize).toBe('large')
            expect((badge as any).displayText).toBe('5')
            expect(badge.hasLabel).toBe(true)
        })

        it('does not treat value as zero when explicit label is present', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.autoSizeOnZero = true
            badge.value = 0
            badge.label = 'Zero'
            expect((badge as any).isZero).toBe(false)
            expect(badge.effectiveSize).toBe('large')
            expect((badge as any).displayText).toBe('Zero')
            expect(badge.hasLabel).toBe(true)
        })
    })

    describe('getRenderClasses', () => {
        it('returns appropriate classes for small dot badge', () => {
            const badge = new MDCBadge()
            badge.size = 'small'
            const classes = (badge as any).getRenderClasses()
            expect(classes.container).toBe(true)
            expect(classes.small).toBe(true)
            expect(classes['has-label']).toBe(false)
        })

        it('returns appropriate classes for large badge with label', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.value = 10
            const classes = (badge as any).getRenderClasses()
            expect(classes.container).toBe(true)
            expect(classes.large).toBe(true)
            expect(classes['has-label']).toBe(true)
        })
    })
})
