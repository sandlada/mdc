/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { Validator, type IValidityAndMessage } from './validator'

interface IState {
    value: string
}

class StubValidator extends Validator<IState> {
    public computeCount = 0

    protected override computeValidity(state: IState): IValidityAndMessage {
        this.computeCount++
        const missing = state.value === ''
        return {
            validity: { valueMissing: missing } as ValidityStateFlags,
            validationMessage: missing ? 'required' : '',
        }
    }

    protected override equals(prev: IState, next: IState) {
        return prev.value === next.value
    }

    protected override copy(state: IState): IState {
        return { value: state.value }
    }
}

describe('Validator', () => {
    it('computes on first call and reports flags', () => {
        const v = new StubValidator(() => ({ value: '' }))
        const result = v.getValidity()
        expect(result.validity.valueMissing).toBe(true)
        expect(result.validationMessage).toBe('required')
        expect(v.computeCount).toBe(1)
    })

    it('returns the cached object when state is unchanged', () => {
        const v = new StubValidator(() => ({ value: 'a' }))
        const first = v.getValidity()
        const second = v.getValidity()
        expect(second).toBe(first)
        expect(v.computeCount).toBe(1)
    })

    it('recomputes when state changes', () => {
        const state = { value: '' }
        const v = new StubValidator(() => state)
        expect(v.getValidity().validity.valueMissing).toBe(true)
        state.value = 'x'
        const next = v.getValidity()
        expect(next.validity.valueMissing).toBe(false)
        expect(next.validationMessage).toBe('')
        expect(v.computeCount).toBe(2)
    })

    it('snapshots state via copy (mutating the live object is detected)', () => {
        const state = { value: 'a' }
        const v = new StubValidator(() => state)
        v.getValidity()
        state.value = 'b'
        v.getValidity()
        state.value = 'b'
        v.getValidity()
        expect(v.computeCount).toBe(2)
    })

    it('normalizes all ten validity flags into a plain object', () => {
        const v = new StubValidator(() => ({ value: 'a' }))
        const keys = Object.keys(v.getValidity().validity).sort()
        expect(keys).toEqual([
            'badInput',
            'customError',
            'patternMismatch',
            'rangeOverflow',
            'rangeUnderflow',
            'stepMismatch',
            'tooLong',
            'tooShort',
            'typeMismatch',
            'valueMissing',
        ])
    })

    it('calls getCurrentState on every getValidity call', () => {
        const getState = vi.fn(() => ({ value: 'a' }))
        const v = new StubValidator(getState)
        v.getValidity()
        v.getValidity()
        expect(getState).toHaveBeenCalledTimes(2)
    })
})
