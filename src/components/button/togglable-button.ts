/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer } from "lit"
import { property, query } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseButton } from './base-button'

/**
 *  The toggle buttons are available in 4 variations:
 * - mdc-elevated-button
 * - mdc-filled-button
 * - mdc-filled-tonal-button
 * - mdc-outlined-button
 *
 * mdc-text-button is not supported by M3 Expressive.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 */
export class TogglableButton extends mixinDelegatesAria(mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(BaseButton)))) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    };

    declare disabled: boolean
    declare name: string

    @property({ type: String })
    public value: string = 'on'

    @property({ type: Boolean, reflect: false })
    public selected: boolean = false

    /**
     * When true, require the toggle-button to be selected when participating in
     * form submission.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#validation
     */
    @property({type: Boolean})
    public required: boolean = false

    /**
     * We use the <input /> element as a replacement for the button element.
     * The state is managed by the input element.
     */
    @query('.togglable-input')
    protected readonly buttonElement!: HTMLInputElement | null

    public override focus() {
        this.buttonElement?.focus()
    }

    public override blur() {
        this.buttonElement?.blur()
    }

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render() {
        const classes = classMap({
            'has-icon': this.hasIcon,
            'has-label': this.hasLabel,
            'trailing-icon': this.trailingIcon,
            'disabled': this.disabled,
            [this.size]: true,
            [this.shape]: true,
            'togglable': true,
            'selected': this.selected,
            'unselected': !this.selected,
        })
        return html`
            <div class="surface ${classes}">
                ${this.renderButton()}
                ${this.renderOutline?.()}
                ${this.renderElevation?.()}
                <span class="background"></span>
                <mdc-ripple for="button" part="ripple" ?disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring for="button" part="focus-ring"></mdc-focus-ring>
            </div>
        `
    }

    protected override renderButton() {
        return html`
            <input
                type="checkbox"
                role="button"
                id="button"
                class="togglable-input"
                .checked=${this.selected}
                .disabled=${this.disabled}
                .required=${this.required}
                aria-disabled=${this.disabled}
                aria-required=${this.required}
                tabindex="0"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
            <span class="button">
                ${this.renderContent()}
            </span>

        `
    }

    protected handleClick(e: MouseEvent) {
        if (this.disabled) {
            e.stopImmediatePropagation()
            e.preventDefault()
            return
        }
        if (!isActivationClick(e) || !this.buttonElement) {
            return
        }
        this.focus()
        dispatchActivationClick(this.buttonElement)
    }

    protected handleInput(_: InputEvent) {
        this.selected = this.buttonElement!.checked
    }

    protected handleChange(event: Event) {
        redispatchEvent(this, event)
    }

    override[getFormValue]() {
        return this.selected ? this.value : null
    }

    override[getFormState]() {
        return String(this.selected)
    }

    override formResetCallback() {
        // The selected property does not reflect, so the original attribute set by
        // the user is used to determine the default value.
        this.selected = this.hasAttribute('selected')
    }

    override formStateRestoreCallback(state: string) {
        this.selected = state === 'true'
    }

    override[createValidator]() {
        return new CheckboxValidator(() => ({
            checked: this.selected,
            required: this.required,
        }))
    }

    override[getValidityAnchor]() {
        return this.buttonElement
    }

}
