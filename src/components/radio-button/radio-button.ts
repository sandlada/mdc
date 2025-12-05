/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { isActivationClick } from '../../utils/event/form-label-activation'
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
    mixinRippleOptions
)(LitElement) {

    static override styles = radioButtonStyle

    declare disabled: boolean
    declare name: string

    [CHECKED]: boolean = false

    private readonly selectionController = new SelectionController(this)

    @property({ type: Boolean, reflect: true, noAccessor: true })
    public get checked() {
        return this[CHECKED]
    }
    public set checked(value: boolean) {
        if(value === this[CHECKED]) {
            return
        }
        const wasChecked = this.checked
        this[CHECKED] = value
        this.requestUpdate('checked', wasChecked)
        this.selectionController.handleCheckedChange()
    }

    @property({ type: Boolean })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    @query('.container')
    private containerElement!: HTMLElement | null

    public override focusRingControl: HTMLElement | null = this
    public override rippleControl: HTMLElement | null = this

    constructor() {
        super()
        this.addController(this.selectionController)
        if (!isServer) {
            this[internals].role = 'radio'
            this.addEventListener('click', this.handleClick.bind(this))
            this.addEventListener('keydown', this.handleKeydown.bind(this));
        }
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('checked')) {
            this[internals].ariaChecked = String(this.checked)
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

    private async handleClick(event: Event) {
        if (this.disabled) {
            return
        }
        await 0
        if (event.defaultPrevented) {
            return
        }
        if (isActivationClick(event)) {
            this.focus()
        }
        // Per spec, clicking on a radio input always selects it.
        this.checked = true
        this.dispatchEvent(new Event('change', { bubbles: true }))
        this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
    }

    private handleKeydown(event: KeyboardEvent) {
        if (event.key !== ' ' || event.defaultPrevented) {
            return
        }
        event.preventDefault()
        event.stopImmediatePropagation()
        this.click()
    }

    override[getFormValue]() {
        return this.checked ? this.value : null
    }

    override[getFormState]() {
        return String(this.checked)
    }

    override formResetCallback() {
        // The checked property does not reflect, so the original attribute set by
        // the user is used to determine the default value.
        this.checked = this.hasAttribute('default-checked')
    }

    override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }

    override[createValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                // Validation runs on superclass construction, so selection controller
                // might not actually be ready until this class constructs.
                return [this]
            }

            return this.selectionController.controls as [RadioButton, ...RadioButton[]]
        })
    }

    override[getValidityAnchor]() {
        return this.containerElement
    }
}
