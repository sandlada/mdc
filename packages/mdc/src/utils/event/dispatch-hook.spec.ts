/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { afterDispatch, setupDispatchHooks } from './dispatch-hook'

const El = () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return el
}

describe('dispatch hooks', () => {
    it('afterDispatch throws when hooks were not set up', () => {
        const el = El()
        let error: unknown
        el.addEventListener('click', (e) => {
            try {
                afterDispatch(e, () => {})
            } catch (err) {
                error = err
            }
        })
        el.dispatchEvent(new MouseEvent('click'))
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain("'click' event needs setupDispatchHooks()")
    })

    it('runs the hook after every other listener, synchronously', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        const order: string[] = []
        el.addEventListener('click', (e) => {
            order.push('listener1')
            afterDispatch(e, () => order.push('after'))
        })
        el.addEventListener('click', () => order.push('listener2'))
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        expect(order).toEqual(['listener1', 'listener2', 'after'])
    })

    it('exposes defaultPrevented to the hook', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        let prevented: boolean | undefined
        el.addEventListener('click', (e) => afterDispatch(e, () => (prevented = e.defaultPrevented)))
        el.addEventListener('click', (e) => e.preventDefault())
        el.dispatchEvent(new MouseEvent('click', { cancelable: true }))
        expect(prevented).toBe(true)
    })

    it('propagates preventDefault back to the original event', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        el.addEventListener('click', (e) => e.preventDefault())
        const original = new MouseEvent('click', { cancelable: true })
        el.dispatchEvent(original)
        expect(original.defaultPrevented).toBe(true)
    })

    it('does not prevent default when no listener cancels', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        const original = new MouseEvent('click', { cancelable: true })
        el.dispatchEvent(original)
        expect(original.defaultPrevented).toBe(false)
    })

    it('calls each listener exactly once (no re-dispatch loop)', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        const spy = vi.fn()
        el.addEventListener('click', spy)
        el.dispatchEvent(new MouseEvent('click'))
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is idempotent: repeated setup does not duplicate dispatch', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        setupDispatchHooks(el, 'click')
        setupDispatchHooks(el, 'click')
        const spy = vi.fn()
        el.addEventListener('click', spy)
        el.dispatchEvent(new MouseEvent('click'))
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('supports multiple event types and only hooks registered ones', () => {
        const el = El()
        setupDispatchHooks(el, 'click', 'keydown')
        let ok = 0
        el.addEventListener('click', (e) => afterDispatch(e, () => ok++))
        el.addEventListener('keydown', (e) => afterDispatch(e, () => ok++))
        el.dispatchEvent(new MouseEvent('click'))
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        expect(ok).toBe(2)

        let threw = false
        el.addEventListener('focus', (e) => {
            try {
                afterDispatch(e, () => {})
            } catch {
                threw = true
            }
        })
        el.dispatchEvent(new Event('focus'))
        expect(threw).toBe(true)
    })

    it('hooks are per-element', () => {
        const a = El()
        const b = El()
        setupDispatchHooks(a, 'click')
        let threw = false
        b.addEventListener('click', (e) => {
            try {
                afterDispatch(e, () => {})
            } catch {
                threw = true
            }
        })
        b.dispatchEvent(new MouseEvent('click'))
        expect(threw).toBe(true)
    })

    it('runs multiple hooks in registration order', () => {
        const el = El()
        setupDispatchHooks(el, 'click')
        const order: number[] = []
        el.addEventListener('click', (e) => {
            afterDispatch(e, () => order.push(1))
            afterDispatch(e, () => order.push(2))
        })
        el.dispatchEvent(new MouseEvent('click'))
        expect(order).toEqual([1, 2])
    })

    it('preserves the event constructor and init (copy keeps type)', () => {
        const el = El()
        setupDispatchHooks(el, 'keydown')
        let received: Event | undefined
        el.addEventListener('keydown', (e) => (received = e))
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))
        expect(received).toBeInstanceOf(KeyboardEvent)
        expect((received as KeyboardEvent).key).toBe('z')
    })
})
