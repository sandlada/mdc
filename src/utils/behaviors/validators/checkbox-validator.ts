/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Validator } from './validator.js'

/**
 * Constraint validation properties for a checkbox.
 */
export interface ICheckboxState {
    /**
     * Whether the checkbox is checked.
     */
    readonly checked: boolean

    /**
     * Whether the checkbox is required.
     */
    readonly required: boolean
}

/**
 * A validator that provides constraint validation that emulates
 * `<input type="checkbox">` validation.
 */
export class CheckboxValidator extends Validator<ICheckboxState> {
    private checkboxControl?: HTMLInputElement

    protected override computeValidity(state: ICheckboxState) {
        if (!this.checkboxControl) {
            // Lazily create the platform input
            this.checkboxControl = document.createElement('input')
            this.checkboxControl.type = 'checkbox'
        }

        this.checkboxControl.checked = state.checked
        this.checkboxControl.required = state.required
        return {
            validity: this.checkboxControl.validity,
            validationMessage: this.checkboxControl.validationMessage,
        }
    }

    protected override equals(prev: ICheckboxState, next: ICheckboxState) {
        return prev.checked === next.checked && prev.required === next.required
    }

    protected override copy({ checked, required }: ICheckboxState) {
        return { checked, required }
    }
}
