/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { dispatchActivationClick, isActivationClick } from './form-label-activation'

const Probe = (el: HTMLElement) => {
    const results: boolean[] = []
    el.addEventListener('click', (e) => results.push(isActivationClick(e)))
    return results
}

describe('dispatchActivationClick', () => {
    it('dispatches a bubbling, non-composed MouseEvent and returns it', () => {
        const el = document.createElement('button')
        let got: MouseEvent | undefined
        el.addEventListener('click', (e) => (got = e))
        const returned = dispatchActivationClick(el)
        expect(got).toBe(returned)
        expect(returned).toBeInstanceOf(MouseEvent)
        expect(returned.bubbles).toBe(true)
        expect(returned.composed).toBe(false)
    })
})

describe('isActivationClick', () => {
    it('true for a direct click on the element', async () => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        const results = Probe(el)
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(results).toEqual([true])
        await Promise.resolve()
    })

    it('false when the click originates from a descendant', async () => {
        const el = document.createElement('div')
        const child = document.createElement('span')
        el.appendChild(child)
        document.body.appendChild(el)
        const results = Probe(el)
        child.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(results).toEqual([false])
        await Promise.resolve()
    })

    it('false when the target is disabled', async () => {
        const el = document.createElement('div') as HTMLElement & { disabled: boolean }
        el.disabled = true
        document.body.appendChild(el)
        const results = Probe(el)
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(results).toEqual([false])
        await Promise.resolve()
    })

    it('squelches a second click within the same microtask, then recovers', async () => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        const results = Probe(el)
        const second = vi.fn()
        el.addEventListener('click', second)
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        const e2 = new MouseEvent('click', { bubbles: true, cancelable: true })
        el.dispatchEvent(e2)
        expect(results).toEqual([true, false])
        expect(e2.defaultPrevented).toBe(true)
        // stopImmediatePropagation: later listeners do not see squelched click
        expect(second).toHaveBeenCalledTimes(1)

        await Promise.resolve()
        await Promise.resolve()
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(results.at(-1)).toBe(true)
    })

    it('false when composedPath()[0] differs from target (retargeted)', async () => {
        const host = document.createElement('div')
        const root = host.attachShadow({ mode: 'open' })
        const inner = document.createElement('button')
        root.appendChild(inner)
        document.body.appendChild(host)
        const results = Probe(host)
        inner.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
        expect(results).toEqual([false])
        await Promise.resolve()
    })
})
