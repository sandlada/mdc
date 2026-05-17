/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type PropertyValues } from "lit"
import { customElement, property } from "lit/decorators.js"
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseButton } from './internal/base-button'

/**
 * `mdc-toggle-button variant="text"` is not supported by M3 Expressive.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=57994-2328&t=kLfic7eA8vKtkiiO-0
 */
@customElement('mdc-toggle-button')
export class MDCTogglableButton extends composeMixin(
    mixinConstraintValidation,
    mixinFormAssociated,
)(BaseButton) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

    @property({ type: String, reflect: true })
    public type: 'radio' | 'checkbox' = 'checkbox'

    @property({ type: String })
    public value: 'on' | (string & {}) = 'on'

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: String, reflect: false })
    public variant: 'filled' | 'filled-tonal' | 'elevated' | 'outlined' = 'filled'

    @property({ type: Boolean, reflect: true })
    public checked = false

    protected readonly selectionController: SelectionController

    constructor() {
        super()
        // SelectionController calls host.addController() internally.
        this.selectionController = new SelectionController(this, {
            multiple: this.type === 'checkbox',
            canCancel: this.type === 'checkbox',
            preventSelectionDuringInitialFocus: this.type === 'checkbox',
            preventSelectionDuringSwitching: this.type === 'checkbox',
            getFocusableElement: (host) => host as HTMLElement,
        })
        if (isServer) {
            return
        }
        this.tabIndex = 0
        this[internals].role = this.type
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        if (changedProperties.has('type')) {
            const isCheckbox = this.type === 'checkbox'
            this.selectionController.configure({
                multiple: isCheckbox,
                canCancel: isCheckbox,
                preventSelectionDuringInitialFocus: isCheckbox,
                preventSelectionDuringSwitching: isCheckbox,
            })
            this[internals].role = this.type
        }
        if (changedProperties.has('checked')) {
            this[internals].ariaChecked = String(this.checked)
        }
        if (changedProperties.has('required')) {
            this[internals].ariaRequired = String(this.required)
        }
    }

    protected override getRenderClasses() {
        return ({
            ...super.getRenderClasses(),
            'togglable': true,
            'selected': this.checked,
            'unselected': !this.checked,
        })
    }

    // renderTouchTarget() uses base-button's default <span aria-hidden="true">
    // implementation. An <input> inside a <button> is invalid HTML and is not
    // needed because ElementInternals handles form association.

    override[getFormValue]() {
        return this.checked ? this.value : null
    }

    override[getFormState]() {
        return String(this.checked)
    }

    override formResetCallback() {
        this.checked = this.hasAttribute('default-checked')
    }

    override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }

    override[createValidator]() {
        // Guard: during the super-class constructor chain, `this.type` is
        // undefined (class fields have not yet initialised). Using `!== 'radio'`
        // ensures undefined falls through to CheckboxValidator, which matches
        // the declared default type of 'checkbox'.
        if (this.type !== 'radio') {
            return new CheckboxValidator(() => ({
                checked: this.checked ?? false,
                required: this.required ?? false,
            }))
        }
        return new RadioValidator(() => {
            // `selectionController` may also be undefined during early init
            // if the validator is re-evaluated before the constructor completes.
            return (this.selectionController?.controls ?? [this]) as [MDCTogglableButton, ...MDCTogglableButton[]]
        })
    }

    override[getValidityAnchor]() {
        return this.buttonElement
    }

}
