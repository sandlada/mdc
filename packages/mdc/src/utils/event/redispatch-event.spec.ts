// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { redispatchEvent } from './redispatch-event'

describe('redispatchEvent', () => {
    it('re-dispatches an event from the target element', () => {
        const host = document.createElement('div')
        const listener = vi.fn()
        host.addEventListener('change', listener)

        const original = new Event('change', { bubbles: true, cancelable: true })
        const wasPrevented = redispatchEvent(host, original)

        expect(listener).toHaveBeenCalledTimes(1)
        expect(wasPrevented).toBe(false)
    })

    it('propagates preventDefault from re-dispatched event back to original event', () => {
        const host = document.createElement('div')
        host.addEventListener('change', (e) => e.preventDefault())

        const original = new Event('change', { bubbles: true, cancelable: true })
        const wasPrevented = redispatchEvent(host, original)

        expect(wasPrevented).toBe(true)
        expect(original.defaultPrevented).toBe(true)
    })
})
