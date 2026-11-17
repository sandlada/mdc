/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { LitElement } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Vitest resolves lit's `node` export where `isServer` is true, which turns
// validity syncing into a no-op. Force browser behavior for this spec.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))
import { GetFormValue, mixinFormAssociated } from '../form/form-associated'
import {
    CreateValidator,
    GetValidityAnchor,
    mixinConstraintValidation,
} from './constraint-validation'
import { Internals, mixinElementInternals } from './element-internals'
import { Validator, type IValidityAndMessage } from './validators/validator'

class FlagValidator extends Validator<{ bad: boolean }> {
    protected override computeValidity(state: { bad: boolean }): IValidityAndMessage {
        return {
            validity: { valueMissing: state.bad } as ValidityStateFlags,
            validationMessage: state.bad ? 'native-msg' : '',
        }
    }
    protected override equals(a: { bad: boolean }, b: { bad: boolean }) {
        return a.bad === b.bad
    }
    protected override copy(s: { bad: boolean }) {
        return { bad: s.bad }
    }
}

const Base = mixinConstraintValidation(
    mixinFormAssociated(mixinElementInternals(LitElement)),
)

class Control extends Base {
    public bad = false
    public anchor: HTMLElement | null = null
    public override [CreateValidator]() {
        return new FlagValidator(() => ({ bad: this.bad }))
    }
    public override [GetValidityAnchor]() {
        return this.anchor
    }
    public override formResetCallback() {}
    public override formStateRestoreCallback() {}
}

class Concrete extends Control {
    public override [GetFormValue]() {
        return ''
    }
}
customElements.define('test-constraint-control', Concrete)

class Unimplemented extends Base {
    public override [GetFormValue]() {
        return ''
    }
    public override formResetCallback() {}
    public override formStateRestoreCallback() {}
}
customElements.define('test-constraint-unimpl', Unimplemented)

describe('mixinConstraintValidation', () => {
    afterEach(() => vi.restoreAllMocks())

    it('throws when [CreateValidator] is not implemented', () => {
        expect(() => new Unimplemented()).toThrow('Implement [createValidator]')
    })

    it('syncs validity flags and message to internals', () => {
        const el = new Concrete()
        el.bad = true
        const spy = vi.spyOn(el[Internals], 'setValidity')
        el.checkValidity()
        const [flags, message] = spy.mock.calls[0]
        expect(flags.valueMissing).toBe(true)
        expect(flags.customError).toBe(false)
        expect(message).toBe('native-msg')
    })

    it('setCustomValidity sets customError and overrides the message', () => {
        const el = new Concrete()
        el.bad = true
        const spy = vi.spyOn(el[Internals], 'setValidity')
        el.setCustomValidity('mine')
        const [flags, message] = spy.mock.calls.at(-1)!
        expect(flags.customError).toBe(true)
        expect(message).toBe('mine')
    })

    it('clearing the custom message restores the native message', () => {
        const el = new Concrete()
        el.bad = true
        el.setCustomValidity('mine')
        const spy = vi.spyOn(el[Internals], 'setValidity')
        el.setCustomValidity('')
        const [flags, message] = spy.mock.calls.at(-1)!
        expect(flags.customError).toBe(false)
        expect(message).toBe('native-msg')
    })

    it('passes the validity anchor (or undefined) to setValidity', () => {
        const el = new Concrete()
        const spy = vi.spyOn(el[Internals], 'setValidity')
        el.checkValidity()
        expect(spy.mock.calls.at(-1)![2]).toBeUndefined()
        const anchor = document.createElement('div')
        el.anchor = anchor
        el.checkValidity()
        expect(spy.mock.calls.at(-1)![2]).toBe(anchor)
    })

    it('delegates checkValidity / reportValidity to internals', () => {
        const el = new Concrete()
        const check = vi.spyOn(el[Internals], 'checkValidity').mockReturnValue(false)
        const report = vi.spyOn(el[Internals], 'reportValidity').mockReturnValue(true)
        expect(el.checkValidity()).toBe(false)
        expect(el.reportValidity()).toBe(true)
        expect(check).toHaveBeenCalled()
        expect(report).toHaveBeenCalled()
    })

    it('getters sync before reading', () => {
        const el = new Concrete()
        const spy = vi.spyOn(el[Internals], 'setValidity')
        void el.validity
        void el.validationMessage
        void el.willValidate
        expect(spy).toHaveBeenCalledTimes(3)
    })

    it('re-syncs on requestUpdate', () => {
        const el = new Concrete()
        const spy = vi.spyOn(el[Internals], 'setValidity')
        el.requestUpdate()
        expect(spy).toHaveBeenCalled()
    })
})
