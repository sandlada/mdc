/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Internals, mixinElementInternals } from '../behaviors/element-internals'
import {
    GetFormState,
    GetFormValue,
    mixinFormAssociated,
    type FormRestoreState,
} from './form-associated'

const Base = mixinFormAssociated(mixinElementInternals(LitElement))

class Control extends Base {
    public value = 'v'
    public state: string | null = null
    public override [GetFormValue]() {
        return this.value
    }
    public override [GetFormState]() {
        return this.state ?? this.value
    }
    public formResetCallback() {
        this.value = 'reset'
    }
    public formStateRestoreCallback(state: FormRestoreState | null) {
        this.value = String(state)
    }
}
customElements.define('test-form-control', Control)

class NoValue extends Base {
    public formResetCallback() {}
    public formStateRestoreCallback() {}
}
customElements.define('test-form-novalue', NoValue)

describe('mixinFormAssociated', () => {
    afterEach(() => vi.restoreAllMocks())

    it('declares formAssociated = true', () => {
        expect(Control.formAssociated).toBe(true)
    })

    it('name reflects to attribute and defaults to empty string', () => {
        const el = new Control()
        expect(el.name).toBe('')
        el.name = 'x'
        expect(el.getAttribute('name')).toBe('x')
        expect(el.name).toBe('x')
    })

    it('disabled is attribute-backed and synchronous', () => {
        const el = new Control()
        expect(el.disabled).toBe(false)
        el.disabled = true
        expect(el.hasAttribute('disabled')).toBe(true)
        el.disabled = false
        expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('formDisabledCallback toggles disabled', () => {
        const el = new Control()
        el.formDisabledCallback(true)
        expect(el.disabled).toBe(true)
        el.formDisabledCallback(false)
        expect(el.disabled).toBe(false)
    })

    it('pushes form value and state to internals on requestUpdate', () => {
        const el = new Control()
        const spy = vi.spyOn(el[Internals], 'setFormValue')
        el.value = 'abc'
        el.requestUpdate()
        expect(spy).toHaveBeenLastCalledWith('abc', 'abc')
    })

    it('uses the form value as state by default', () => {
        const el = new Control()
        el.state = null
        expect(el[GetFormState]()).toBe(el[GetFormValue]())
    })

    it('setting name/disabled triggers a form value sync', () => {
        const el = new Control()
        const spy = vi.spyOn(el[Internals], 'setFormValue')
        el.name = 'n'
        expect(spy).toHaveBeenCalled()
    })

    it('exposes form and labels from internals', () => {
        const el = new Control()
        expect(el.form).toBe(el[Internals].form)
        expect(el.labels).toBe(el[Internals].labels)
    })

    it('throws on construction when [GetFormValue] is not implemented', () => {
        expect(() => new NoValue()).toThrow('Implement [getFormValue]')
    })

    it('reset and restore callbacks are invoked by subclass', () => {
        const el = new Control()
        el.formResetCallback()
        expect(el.value).toBe('reset')
        el.formStateRestoreCallback('restored', 'restore')
        expect(el.value).toBe('restored')
    })
})
