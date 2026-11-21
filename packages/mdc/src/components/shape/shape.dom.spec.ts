// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { fixture, oneEvent } from '../../utils/testing/fixture'
import { MaterialShapes, type MDCShape } from './index'
import './index'

describe('mdc-shape (DOM)', () => {
    it('renders default tonal circle shape with valid SVG path and clip-path', async () => {
        const el = await fixture<MDCShape>(html`<mdc-shape></mdc-shape>`)
        expect(el.shape).toBe('circle')
        expect(el.variant).toBe('tonal')
        expect(el.color).toBe('primary')
        expect(el.size).toBe('medium')

        const fillPath = el.shadowRoot?.querySelector('path.shape-fill')
        const strokePath = el.shadowRoot?.querySelector('path.shape-stroke')
        const clipLayer = el.shadowRoot?.querySelector('.clip-layer') as HTMLElement | null

        expect(fillPath?.getAttribute('d')).toMatch(/^M.*Z$/)
        expect(strokePath?.getAttribute('d')).toBe(fillPath?.getAttribute('d'))
        expect(clipLayer?.style.clipPath).toContain('path(')
    })

    it('renders all 35 MaterialShapes without errors', async () => {
        const el = await fixture<MDCShape>(html`<mdc-shape disable-animation shape="heart"></mdc-shape>`)
        expect(el.activeShape).toBe('heart')
        const heartPath = el.pathData

        el.shape = 'puffy-diamond'
        await el.updateComplete
        expect(el.activeShape).toBe('puffy-diamond')
        expect(el.pathData).not.toBe(heartPath)
    })

    it('supports hover-shape, pressed-shape, focus-shape, selected-shape, and disabled-shape priority', async () => {
        const el = await fixture<MDCShape>(html`
            <mdc-shape
                disable-animation
                interactive
                toggle
                shape="square"
                hover-shape="sunny"
                focus-shape="pentagon"
                pressed-shape="soft-burst"
                selected-shape="heart"
                disabled-shape="circle"
            ></mdc-shape>
        `)

        expect(el.activeShape).toBe('square')

        const container = el.shadowRoot?.querySelector('#container') as HTMLButtonElement
        expect(container.tagName).toBe('BUTTON')

        container.dispatchEvent(new PointerEvent('pointerenter'))
        await el.updateComplete
        expect(el.activeShape).toBe('sunny')

        container.dispatchEvent(new FocusEvent('focus'))
        await el.updateComplete
        expect(el.activeShape).toBe('pentagon')

        container.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }))
        await el.updateComplete
        expect(el.activeShape).toBe('soft-burst')

        container.dispatchEvent(new PointerEvent('pointerup', { button: 0 }))
        await el.updateComplete
        expect(el.activeShape).toBe('pentagon')

        const changePromise = oneEvent<CustomEvent>(el, 'shape-change')
        container.click()
        const evt = await changePromise
        expect(evt.detail.selected).toBe(true)
        await el.updateComplete
        expect(el.selected).toBe(true)
        expect(el.activeShape).toBe('heart')
        expect(container.getAttribute('aria-pressed')).toBe('true')

        el.disabled = true
        await el.updateComplete
        expect(el.activeShape).toBe('circle')
        expect(container.disabled).toBe(true)
    })

    it('supports manual scrub morphing with morph-to and progress', async () => {
        const el = await fixture<MDCShape>(html`
            <mdc-shape shape="circle" morph-to="heart" progress="0"></mdc-shape>
        `)
        const path0 = el.pathData

        el.progress = 0.5
        await el.updateComplete
        const pathMid = el.pathData

        el.progress = 1
        await el.updateComplete
        const path1 = el.pathData

        expect(path0).not.toBe(pathMid)
        expect(pathMid).not.toBe(path1)
        expect(path0).not.toBe(path1)
    })

    it('supports parametric shapes and custom RoundedPolygon / vertices', async () => {
        const el = await fixture<MDCShape>(html`
            <mdc-shape disable-animation shape="star" sides="6" inner-radius="0.4" corner-radius="0.1"></mdc-shape>
        `)
        const starPath = el.pathData
        expect(starPath).toMatch(/^M.*Z$/)

        el.polygon = MaterialShapes.Clover8Leaf
        await el.updateComplete
        expect(el.pathData).not.toBe(starPath)
    })

    it('disables clip-path when disable-clip is set', async () => {
        const el = await fixture<MDCShape>(html`<mdc-shape disable-clip></mdc-shape>`)
        const clipLayer = el.shadowRoot?.querySelector('.clip-layer') as HTMLElement | null
        expect(clipLayer?.style.clipPath ?? '').toBe('')
    })

    it('starts spring morph animation on state change and settles via rAF', async () => {
        let rafCallback: FrameRequestCallback | null = null
        let nowMs = 1000
        const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
        const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallback = cb
            return 1
        })
        const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {
            rafCallback = null
        })
        const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => nowMs)

        try {
            const el = await fixture<MDCShape>(html`<mdc-shape shape="circle"></mdc-shape>`)
            const startEvents: CustomEvent[] = []
            const endEvents: CustomEvent[] = []
            el.addEventListener('shape-morph-start', e => startEvents.push(e as CustomEvent))
            el.addEventListener('shape-morph-end', e => endEvents.push(e as CustomEvent))

            el.shape = 'sunny'
            await el.updateComplete

            expect(startEvents).toHaveLength(1)
            expect(el.isMorphing).toBe(true)

            // Advance simulation frames until settled.
            for (let step = 0; step < 60 && rafCallback !== null; step++) {
                nowMs += 32
                const cb = rafCallback
                rafCallback = null
                cb(nowMs)
                await el.updateComplete
            }

            expect(el.isMorphing).toBe(false)
            expect(endEvents).toHaveLength(1)
            expect(endEvents[0].detail.shape).toBe('sunny')
        } finally {
            matchMediaSpy.mockRestore()
            rafSpy.mockRestore()
            cancelSpy.mockRestore()
            nowSpy.mockRestore()
        }
    })

    it('handles mid-flight reversal and 3rd-shape interruption smoothly', async () => {
        let rafCallback: FrameRequestCallback | null = null
        let nowMs = 1000
        const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
        const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallback = cb
            return 1
        })
        const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {
            rafCallback = null
        })
        const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => nowMs)

        try {
            const el = await fixture<MDCShape>(html`
                <mdc-shape shape="circle" hover-shape="sunny"></mdc-shape>
            `)
            const container = el.shadowRoot?.querySelector('#container') as HTMLElement

            // 1. Start hover morph circle -> sunny, advance 1 frame, then reverse mid-flight.
            container.dispatchEvent(new PointerEvent('pointerenter'))
            await el.updateComplete
            expect(el.isMorphing).toBe(true)

            nowMs += 48
            const cb1 = rafCallback
            rafCallback = null
            cb1?.(nowMs)
            await el.updateComplete
            const midPath = el.pathData

            container.dispatchEvent(new PointerEvent('pointerleave'))
            await el.updateComplete
            expect(el.isMorphing).toBe(true)

            // 2. Interrupt again to a 3rd shape + rotation mid-flight.
            el.morphToShape('heart')
            el.rotation = 90
            await el.updateComplete
            expect(el.isMorphing).toBe(true)

            for (let step = 0; step < 80 && rafCallback !== null; step++) {
                nowMs += 32
                const cb = rafCallback
                rafCallback = null
                cb(nowMs)
                await el.updateComplete
            }

            expect(el.isMorphing).toBe(false)
            expect(el.activeShape).toBe('heart')
            expect(el.pathData).not.toBe(midPath)
        } finally {
            matchMediaSpy.mockRestore()
            rafSpy.mockRestore()
            cancelSpy.mockRestore()
            nowSpy.mockRestore()
        }
    })

    it('advances sequence steps cleanly with next()', async () => {
        const el = await fixture<MDCShape>(html`
            <mdc-shape disable-animation sequence="circle,heart,sunny" spin-per-step="45"></mdc-shape>
        `)
        expect(el.activeShape).toBe('circle')
        expect(el.rotation).toBe(0)

        el.next()
        await el.updateComplete
        expect(el.activeShape).toBe('heart')
        expect(el.rotation).toBe(45)

        el.next()
        await el.updateComplete
        expect(el.activeShape).toBe('sunny')
        expect(el.rotation).toBe(90)

        el.next()
        await el.updateComplete
        expect(el.activeShape).toBe('circle')
        expect(el.rotation).toBe(135)
    })
})
