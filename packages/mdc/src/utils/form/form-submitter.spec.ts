/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Internals, mixinElementInternals } from '../behaviors/element-internals'
import { setupFormSubmitter, type FormSubmitterType } from './form-submitter'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

const FakeForm = () => ({
    reset: vi.fn(),
    requestSubmit: vi.fn(),
    addEventListener: vi.fn(),
})

let CurrentForm: ReturnType<typeof FakeForm> | null = null

class Submitter extends mixinElementInternals(LitElement) {
    static {
        setupFormSubmitter(Submitter)
    }
    public type: FormSubmitterType = 'submit'
    public value = 'val'
}
customElements.define('test-form-submitter', Submitter)

describe('setupFormSubmitter', () => {
    let setFormValue: ReturnType<typeof vi.fn>

    beforeEach(() => {
        vi.useFakeTimers()
        CurrentForm = FakeForm()
        setFormValue = vi.fn()
        vi.spyOn(HTMLElement.prototype, 'attachInternals').mockImplementation(
            () => ({ form: CurrentForm, setFormValue }) as unknown as ElementInternals,
        )
    })
    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    const ClickAndFlush = async (el: HTMLElement, init?: EventInit) => {
        const e = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
        el.dispatchEvent(e)
        await vi.runAllTimersAsync()
        return e
    }

    it('submit type: sets form value and calls requestSubmit once', async () => {
        const el = new Submitter()
        await ClickAndFlush(el)
        expect(setFormValue).toHaveBeenCalledWith('val')
        expect(CurrentForm!.requestSubmit).toHaveBeenCalledTimes(1)
        expect(CurrentForm!.reset).not.toHaveBeenCalled()
    })

    it('reset type: resets the form and does not submit', async () => {
        const el = new Submitter()
        el.type = 'reset'
        await ClickAndFlush(el)
        expect(CurrentForm!.reset).toHaveBeenCalledTimes(1)
        expect(CurrentForm!.requestSubmit).not.toHaveBeenCalled()
    })

    it('button type: does nothing', async () => {
        const el = new Submitter()
        el.type = 'button'
        await ClickAndFlush(el)
        expect(CurrentForm!.requestSubmit).not.toHaveBeenCalled()
        expect(CurrentForm!.reset).not.toHaveBeenCalled()
    })

    it('does nothing without an associated form', async () => {
        CurrentForm = null
        const el = new Submitter()
        await expect(ClickAndFlush(el)).resolves.toBeDefined()
        expect(setFormValue).not.toHaveBeenCalled()
    })

    it('respects defaultPrevented set by later listeners (waits a full task)', async () => {
        const el = new Submitter()
        el.addEventListener('click', (e) => e.preventDefault())
        await ClickAndFlush(el)
        expect(CurrentForm!.requestSubmit).not.toHaveBeenCalled()
    })

    it('does not act before the task boundary elapses', () => {
        const el = new Submitter()
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        expect(CurrentForm!.requestSubmit).not.toHaveBeenCalled()
    })

    it('patches submit event with the submitter (one-shot, capture)', async () => {
        const el = new Submitter()
        await ClickAndFlush(el)
        const [type, listener, opts] = CurrentForm!.addEventListener.mock.calls[0]
        expect(type).toBe('submit')
        expect(opts).toEqual({ capture: true, once: true })
        const submitEvent = new Event('submit')
        listener(submitEvent)
        expect((submitEvent as unknown as { submitter: unknown }).submitter).toBe(el)
    })

    it('registers the listener once per instance', async () => {
        const el = new Submitter()
        await ClickAndFlush(el)
        expect(CurrentForm!.requestSubmit).toHaveBeenCalledTimes(1)
        expect(el[Internals]).toBeDefined()
    })
})
