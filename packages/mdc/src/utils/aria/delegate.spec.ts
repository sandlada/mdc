/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { mixinDelegatesAria } from './delegate'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class Host extends mixinDelegatesAria(LitElement) {}
customElements.define('aria-delegate-host', Host)

const Make = (html = '') => {
    const container = document.createElement('div')
    container.innerHTML = html || '<aria-delegate-host></aria-delegate-host>'
    document.body.appendChild(container)
    return container.firstElementChild as Host
}

describe('mixinDelegatesAria', () => {
    it('shifts an aria attribute from the host to a data attribute', () => {
        const el = Make()
        el.setAttribute('aria-label', 'Plus')
        expect(el.hasAttribute('aria-label')).toBe(false)
        expect(el.dataset.ariaLabel).toBe('Plus')
        expect(el.getAttribute('data-aria-label')).toBe('Plus')
    })

    it('getAttribute reads aria attributes through the data attribute', () => {
        const el = Make()
        el.setAttribute('aria-label', 'x')
        expect(el.getAttribute('aria-label')).toBe('x')
    })

    it('getAttribute returns null for an unset aria attribute', () => {
        expect(Make().getAttribute('aria-label')).toBeNull()
    })

    it('non-aria attributes are untouched', () => {
        const el = Make()
        el.setAttribute('title', 't')
        expect(el.getAttribute('title')).toBe('t')
        expect(el.hasAttribute('title')).toBe(true)
    })

    it('aria properties read from the data attribute', () => {
        const el = Make()
        el.setAttribute('aria-label', 'abc')
        expect(el.ariaLabel).toBe('abc')
    })

    it('aria properties default to null', () => {
        expect(Make().ariaLabel).toBeNull()
    })

    it('setting an aria property writes the data attribute and not the aria attribute', () => {
        const el = Make()
        el.ariaLabel = 'hi'
        expect(el.dataset.ariaLabel).toBe('hi')
        expect(el.hasAttribute('aria-label')).toBe(false)
    })

    it('setting an aria property to null removes the data attribute', () => {
        const el = Make()
        el.ariaLabel = 'hi'
        el.ariaLabel = null
        expect(el.dataset.ariaLabel).toBeUndefined()
        expect(el.ariaLabel).toBeNull()
    })

    it('setting the same value does not request an update', () => {
        const el = Make()
        el.ariaLabel = 'same'
        const spy = vi.spyOn(el, 'requestUpdate')
        el.ariaLabel = 'same'
        expect(spy).not.toHaveBeenCalled()
    })

    it('setting a new value requests an update with the previous value', () => {
        const el = Make()
        const spy = vi.spyOn(el, 'requestUpdate')
        el.ariaLabel = 'a'
        expect(spy).toHaveBeenCalledWith('ariaLabel', null)
    })

    it('removeAttribute clears both attribute forms and requests an update', () => {
        const el = Make()
        el.setAttribute('aria-label', 'x')
        const spy = vi.spyOn(el, 'requestUpdate')
        el.removeAttribute('aria-label')
        expect(el.dataset.ariaLabel).toBeUndefined()
        expect(el.getAttribute('aria-label')).toBeNull()
        expect(spy).toHaveBeenCalled()
    })

    it('shifts attributes present in initial markup (hydration/parse)', () => {
        const el = Make('<aria-delegate-host aria-label="L" aria-hidden="true"></aria-delegate-host>')
        expect(el.hasAttribute('aria-label')).toBe(false)
        expect(el.ariaLabel).toBe('L')
        expect(el.ariaHidden).toBe('true')
    })

    it('handles several aria attributes independently', () => {
        const el = Make()
        el.setAttribute('aria-label', 'a')
        el.setAttribute('aria-expanded', 'true')
        expect(el.ariaLabel).toBe('a')
        expect(el.ariaExpanded).toBe('true')
    })

    it('handles role as a delegated attribute', () => {
        const el = Make()
        el.setAttribute('role', 'button')
        expect(el.hasAttribute('role')).toBe(false)
        expect(el.getAttribute('role')).toBe('button')
    })
})
