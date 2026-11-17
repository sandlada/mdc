/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Internals, mixinElementInternals } from './element-internals'

class Host extends mixinElementInternals(LitElement) {}
customElements.define('test-internals-host', Host)

describe('mixinElementInternals', () => {
    afterEach(() => vi.restoreAllMocks())

    it('lazily attaches internals once and returns the same instance', () => {
        const spy = vi.spyOn(HTMLElement.prototype, 'attachInternals')
        const el = new Host()
        expect(spy).not.toHaveBeenCalled()
        const a = el[Internals]
        const b = el[Internals]
        expect(a).toBe(b)
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('gives each instance its own internals', () => {
        expect(new Host()[Internals]).not.toBe(new Host()[Internals])
    })

    it('propagates attachInternals failure (no swallowing)', () => {
        vi.spyOn(HTMLElement.prototype, 'attachInternals').mockImplementation(() => {
            throw new Error('boom')
        })
        expect(() => new Host()[Internals]).toThrow('boom')
    })
})
