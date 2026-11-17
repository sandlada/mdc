/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MDCListItem } from './list-item'

const createListItem = (type: 'text' | 'button' | 'link' = 'button') => {
    const item = new MDCListItem()
    item.type = type
    return item
}

interface HapticInternals {
    swipePrimaryReady: boolean
    updated(changedProperties: Map<string, unknown>): void
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('MDCListItem expanded primary-ready haptics', () => {
    it('vibrates once when expanded and primary-ready are both true', () => {
        const item = createListItem('button')
        const internals = item as unknown as HapticInternals
        const vibrate = vi.fn(() => true)
        Object.defineProperty(globalThis.navigator, 'vibrate', {
            value: vibrate,
            configurable: true,
        })
        vi.stubGlobal('matchMedia', () => ({ matches: false }))

        item.expanded = false
        internals.swipePrimaryReady = false
        internals.updated(new Map([['expanded', false]]))
        expect(vibrate).not.toHaveBeenCalled()

        item.expanded = true
        internals.updated(new Map([['expanded', false]]))
        expect(vibrate).not.toHaveBeenCalled()

        internals.swipePrimaryReady = true
        internals.updated(new Map([['swipePrimaryReady', false]]))
        expect(vibrate).toHaveBeenCalledTimes(1)
        expect(vibrate).toHaveBeenCalledWith(15)

        internals.updated(new Map([['swipePrimaryReady', true]]))
        expect(vibrate).toHaveBeenCalledTimes(1)

        internals.swipePrimaryReady = false
        internals.updated(new Map([['swipePrimaryReady', true]]))
        expect(vibrate).toHaveBeenCalledTimes(1)

        internals.swipePrimaryReady = true
        internals.updated(new Map([['swipePrimaryReady', false]]))
        expect(vibrate).toHaveBeenCalledTimes(2)

        item.expanded = false
        internals.updated(new Map([['expanded', true]]))
        expect(vibrate).toHaveBeenCalledTimes(2)

        item.expanded = true
        internals.updated(new Map([['expanded', false]]))
        expect(vibrate).toHaveBeenCalledTimes(3)

        Reflect.deleteProperty(globalThis.navigator as unknown as Record<string, unknown>, 'vibrate')
    })

    it('skips vibration without vibrate API or under reduced motion', () => {
        const item = createListItem('button')
        const internals = item as unknown as HapticInternals
        item.expanded = true
        internals.swipePrimaryReady = true

        Reflect.deleteProperty(globalThis.navigator as unknown as Record<string, unknown>, 'vibrate')
        vi.stubGlobal('matchMedia', () => ({ matches: false }))
        internals.updated(new Map([['expanded', false]]))

        const vibrate = vi.fn(() => true)
        Object.defineProperty(globalThis.navigator, 'vibrate', {
            value: vibrate,
            configurable: true,
        })
        vi.unstubAllGlobals()
        vi.stubGlobal('matchMedia', () => ({ matches: true }))
        internals.updated(new Map([['expanded', false]]))
        expect(vibrate).not.toHaveBeenCalled()

        Reflect.deleteProperty(globalThis.navigator as unknown as Record<string, unknown>, 'vibrate')
    })
})
