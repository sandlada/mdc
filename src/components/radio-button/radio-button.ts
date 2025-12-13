/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinCheckable } from '../../utils/behaviors/checkables/mixin-checkable'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { radioButtonStyle } from './radio-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-radio-button": RadioButton
    }
}

const CHECKED = Symbol('checked')

/**
 *
 * @form
 * - default-checked
 * - checked
 * - disabled
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/radio-button/specs
 *
 */
@customElement('mdc-radio-button')
export class RadioButton extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinFocusRingOptions,
    mixinRippleOptions,
    mixinCheckable
)(LitElement) {
    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: false
    }
    static override styles = radioButtonStyle

    public override type: 'checkbox' | 'radio' = 'radio'

    declare disabled: boolean
    declare name: string

    public override focusRingControl: HTMLElement | null = this
    public override rippleControl: HTMLElement | null = this

    constructor() {
        super()
        this.addController(this.selectionController)
        if (!isServer) {
            this[internals].role = 'radio'
            this.tabIndex = -1
        }
    }

    protected override updated() {
        this[internals].ariaChecked = String(this.checked);
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            'selected': this.checked,
            'unselected': !this.checked,
        })
    }

    protected override render(): unknown {
        return html`
            <div class="${classMap(this.getRenderClasses())}" aria-hidden="true">
                ${this.renderRipple()}
                ${this.renderFocusRing()}

                <svg class="icon" viewBox="0 0 20 20">
                    <circle class="outer" cx="10" cy="10" r="9" />
                    <circle class="inner" cx="10" cy="10" r="9" />
                </svg>

                <div class="touch-target"></div>
            </div>
        `
    }

    public override [createValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                return [this] as [RadioButton]
            }
            return this.selectionController.controls as [RadioButton, ...RadioButton[]]
        })
    }

    public override [getValidityAnchor]() {
        return this
    }

    public override [getFormValue]() {
        return this.checked ? this.value : null
    }

    public override [getFormState]() {
        return String(this.checked)
    }

    public override formResetCallback() {
        this.checked = this.hasAttribute('default-checked')
    }

    public override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }


}
