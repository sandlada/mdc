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
import { SelectionController } from '../../utils/controller/selection-controller'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { generateUUID } from '../../utils/uuid/generate-uuid'
import { radioButtonStyle } from './radio-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-radio-button": RadioButton
    }
}

const CHECKED = Symbol('checked')

/**
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/radio-button/specs
 */
@customElement('mdc-radio-button')
export class RadioButton extends mixinDelegatesAria(mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement)))) {

    static override styles = radioButtonStyle

    declare disabled: boolean
    declare name: string

    [CHECKED]: boolean = false

    private readonly maskId: string = `maskid-${generateUUID()}`
    private readonly selectionController = new SelectionController(this)

    @property({ type: Boolean, reflect: true, noAccessor: true })
    public get checked() {
        return this[CHECKED]
    }
    public set checked(value: boolean) {
        if(value === this[CHECKED]) {
            return
        }
        const oldValue = this[CHECKED]
        this[CHECKED] = value
        this.requestUpdate('checked', oldValue)
        this.selectionController.handleCheckedChange()
    }

    @property({ type: Boolean })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    @query('.container')
    private containerElement!: HTMLElement | null

    constructor() {
        super()
        this.addController(this.selectionController)
        if (!isServer) {
            this[internals].role = 'radio'
            this.addEventListener('click', this.handleClick.bind(this))
            // this.addEventListener('keydown', this.handleKeydown.bind(this));
        }
    }
    
    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('checked')) {
            this[internals].ariaChecked = String(this.checked)
        }
    }

    protected override render(): unknown {
        const classes = classMap({
            'selected': this.checked,
            'unselected': !this.checked,
        })
        return html`
            <div class="container ${classes}" aria-hidden="true">
                <mdc-ripple .control=${this} .disabled=${this.disabled} part="ripple"></mdc-ripple>
                <mdc-focus-ring .control=${this} part="focus-ring"></mdc-focus-ring>

                <svg class="icon" viewBox="0 0 20 20">
                    <mask id="${this.maskId}">
                        <rect width="100%" height="100%" fill="white" />
                        <circle cx="10" cy="10" r="8" fill="black" />
                    </mask>
                    <circle class="outer circle" cx="10" cy="10" r="10" mask="url(#${this.maskId})" />
                    <circle class="inner circle" cx="10" cy="10" r="5" />
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

    // private async handleKeydown(event: KeyboardEvent) {
    //     // allow event to propagate to user code after a microtask.
    //     await 0
    //     if (event.key !== ' ' || event.defaultPrevented) {
    //         return
    //     }
    //     this.click()
    // }

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
