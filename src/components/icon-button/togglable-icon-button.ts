/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseIconButton } from './base-icon-button'

/**
 * The toggle-icon-button component is a split of the icon-button component,
 * which can toggle whether an item is selected or not. It can be used as a form element.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
export abstract class TogglableIconButton extends mixinConstraintValidation(mixinFormAssociated(BaseIconButton)) {

    declare disabled: boolean
    declare name: string

    @property({ type: Boolean, reflect: false })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: String, reflect: false })
    public value: string = 'on'

    @query('.input')
    protected override readonly buttonElement!: HTMLElement | null

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

    protected override render(): unknown {
        return html`
            ${this.renderButton()}
        `
    }

    protected override renderButton(): unknown {
        const classes = classMap({
            [this.size]: true,
            [this.width]: true,
            'round': this.shape === 'round',
            'square': this.shape === 'square',
            'disabled': this.disabled,
            'selected': this.selected,
            'unselected': !this.selected,
        })
        return html`
            <span class="button togglable ${classes}">
                <input
                    type="checkbox"
                    role="switch"
                    id="button"
                    class="input"
                    .checked=${this.selected}
                    .disabled=${this.disabled}
                    .required=${this.required}
                    aria-disabled=${this.disabled}
                    aria-required=${this.required}
                    tabindex="0"
                    @input=${this.handleInput}
                    @change=${this.handleChange}
                />
                ${this.renderIcon()}
                ${this.renderOutline?.()}
                ${this.renderBackground()}
                <mdc-ripple for="button" part="ripple"></mdc-ripple>
                <mdc-focus-ring for="button" part="focus-ring"></mdc-focus-ring>
            </span>
        `
    }

    protected override renderIcon(): unknown {
        return html`
            <slot></slot>
        `
    }

    private handleInput(e: Event) {
        this.selected = (e.target as HTMLInputElement).checked
    }

    private handleChange(e: Event) {
        redispatchEvent(this, e)
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
