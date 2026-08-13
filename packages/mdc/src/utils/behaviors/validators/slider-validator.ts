/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Validator } from './validator'

interface ISliderState {
    min        : number
    max        : number
    step       : number
    range      : boolean
    value     ?: number
    valueStart?: number
    valueEnd  ?: number
}

/**
 * Slider validator.
 * Uses a native `<input type="range">` to compute validity.
 */
export class SliderValidator extends Validator<ISliderState> {
    private inputControl?: HTMLInputElement

    protected override computeValidity(state: ISliderState) {
        if (!this.inputControl) {
            // Lazily create the native input element.
            this.inputControl = document.createElement('input')
            this.inputControl.type = 'range'
        }

        // Sync shared range attributes before checking any value.
        this.inputControl.min = String(state.min)
        this.inputControl.max = String(state.max)
        this.inputControl.step = String(state.step)

        // Validate a single numeric value and keep a frozen snapshot of the
        // platform-computed validity state.
        const checkValue = (val: number | undefined) => {
            this.inputControl!.valueAsNumber = val ?? state.min
            return {
                validity: {
                    badInput: this.inputControl!.validity.badInput,
                    customError: this.inputControl!.validity.customError,
                    patternMismatch: this.inputControl!.validity.patternMismatch,
                    rangeOverflow: this.inputControl!.validity.rangeOverflow,
                    rangeUnderflow: this.inputControl!.validity.rangeUnderflow,
                    stepMismatch: this.inputControl!.validity.stepMismatch,
                    tooLong: this.inputControl!.validity.tooLong,
                    tooShort: this.inputControl!.validity.tooShort,
                    typeMismatch: this.inputControl!.validity.typeMismatch,
                    valueMissing: this.inputControl!.validity.valueMissing,
                },
                validationMessage: this.inputControl!.validationMessage,
            }
        }

        if (state.range) {
            const startResult = checkValue(state.valueStart)
            if (!this.inputControl!.validity.valid) {
                return startResult
            }

            return checkValue(state.valueEnd)
        }

        return checkValue(state.value)
    }

    protected override equals(prev: ISliderState, next: ISliderState) {
        return (
            prev.min === next.min &&
            prev.max === next.max &&
            prev.step === next.step &&
            prev.range === next.range &&
            prev.value === next.value &&
            prev.valueStart === next.valueStart &&
            prev.valueEnd === next.valueEnd
        )
    }

    protected override copy(state: ISliderState): ISliderState {
        return {
            min: state.min,
            max: state.max,
            step: state.step,
            range: state.range,
            value: state.value,
            valueStart: state.valueStart,
            valueEnd: state.valueEnd,
        }
    }
}
