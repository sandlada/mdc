/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { mixinConnectedPromiseResolve } from './connected-promise-resolve'

class Host extends mixinConnectedPromiseResolve(LitElement) {}
customElements.define('connected-promise-host', Host)

const State = async (p: Promise<void>) => {
    let settled = false
    p.then(() => (settled = true))
    await Promise.resolve()
    await Promise.resolve()
    return settled
}

describe('mixinConnectedPromiseResolve', () => {
    it('promise is pending before connection', async () => {
        const el = new Host()
        expect(await State(el.isConnectedPromise)).toBe(false)
    })

    it('resolves once connected', async () => {
        const el = new Host()
        document.body.appendChild(el)
        await expect(el.isConnectedPromise).resolves.toBeUndefined()
    })

    it('creates a fresh pending promise after disconnect', async () => {
        const el = new Host()
        document.body.appendChild(el)
        const first = el.isConnectedPromise
        el.remove()
        expect(el.isConnectedPromise).not.toBe(first)
        expect(await State(el.isConnectedPromise)).toBe(false)
    })

    it('resolves the new promise on reconnect', async () => {
        const el = new Host()
        document.body.appendChild(el)
        el.remove()
        const second = el.isConnectedPromise
        document.body.appendChild(el)
        await expect(second).resolves.toBeUndefined()
    })

    it('instances are independent', async () => {
        const a = new Host()
        const b = new Host()
        document.body.appendChild(a)
        expect(await State(a.isConnectedPromise)).toBe(true)
        expect(await State(b.isConnectedPromise)).toBe(false)
    })

    it('calls the original connectedCallback (lit lifecycle intact)', () => {
        const el = new Host()
        const spy = vi.spyOn(LitElement.prototype, 'connectedCallback')
        document.body.appendChild(el)
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})
