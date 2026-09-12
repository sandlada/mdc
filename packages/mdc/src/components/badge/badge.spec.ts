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

    describe('event dispatches', () => {
        it('dispatches change event when value changes', () => {
            const badge = new MDCBadge()

            let eventDetail: any = null
            badge.addEventListener('change', (e: any) => {
                eventDetail = e.detail
            })

            badge.value = 5
            badge.requestUpdate('value', null)

            expect(eventDetail).toEqual({ value: 5, oldValue: null })

            badge.value = 10
            badge.requestUpdate('value', 5)
            expect(eventDetail).toEqual({ value: 10, oldValue: 5 })
        })

        it('dispatches size-change event when switching between small and large', () => {
            const badge = new MDCBadge()

            let eventDetail: any = null
            badge.addEventListener('size-change', (e: any) => {
                eventDetail = e.detail
            })

            badge.size = 'large'
            badge.requestUpdate('size', 'small')
            expect(eventDetail).toEqual({ size: 'large', oldSize: 'small' })

            badge.size = 'small'
            badge.requestUpdate('size', 'large')
            expect(eventDetail).toEqual({ size: 'small', oldSize: 'large' })
        })

        it('dispatches overflow-change event when crossing max threshold (e.g. 99 to 99+)', () => {
            const badge = new MDCBadge()
            badge.size = 'large'
            badge.max = 99

            let eventDetail: any = null
            badge.addEventListener('overflow-change', (e: any) => {
                eventDetail = e.detail
            })

            badge.value = 99
            badge.requestUpdate('value', null)
            expect(eventDetail).toBe(null)

            badge.value = 100
            badge.requestUpdate('value', 99)
            expect(eventDetail).toEqual({
                isOverflow: true,
                oldIsOverflow: false,
                displayText: '99+'
            })

            badge.value = 50
            badge.requestUpdate('value', 100)
            expect(eventDetail).toEqual({
                isOverflow: false,
                oldIsOverflow: true,
                displayText: '50'
            })
        })

        it('dispatches auto-size event when autoSizeOnZero triggers size recalculation', () => {
            const badge = new MDCBadge()
            badge.autoSizeOnZero = true

            let autoSizeDetail: any = null
            badge.addEventListener('auto-size', (e: any) => {
                autoSizeDetail = e.detail
            })

            badge.value = 5
            badge.requestUpdate('value', null)
            expect(autoSizeDetail).toEqual({
                effectiveSize: 'large',
                isZero: false
            })

            badge.value = 0
            badge.requestUpdate('value', 5)
            expect(autoSizeDetail).toEqual({
                effectiveSize: 'small',
                isZero: true
            })
        })
    })
})

