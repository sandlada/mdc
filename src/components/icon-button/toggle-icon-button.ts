/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing, type TemplateResult } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseIconButton } from './base-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-icon-button": MDCToggleIconButton
    }
}

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
@customElement('mdc-toggle-icon-button')
export class MDCToggleIconButton extends mixinConstraintValidation(mixinFormAssociated(BaseIconButton)) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

    @property({ type: Boolean })
    public selected: boolean = false

    @property({ type: Boolean })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    /**
     * We use the <input /> element as a replacement for the button element.
     * The state is managed by the input element.
     */
    @query('#input-as-touch-target')
    protected override readonly buttonElement!: HTMLInputElement | null

    protected override getRenderClasses() {
        return ({
            ...super.getRenderClasses(),
            'togglable': true,
            'selected': this.selected,
            'unselected': !this.selected,
        })
    }

    protected override render(): TemplateResult {
        const { ariaHasPopup, ariaExpanded, ariaLabel } = this as AriaMixinStrict
        return html`
            <button 
                class="${classMap(this.getRenderClasses())}"
                id="button" 
                ?disabled=${this.disabled} 
                aria-disabled=${this.disabled}
                aria-label=${ariaLabel || nothing}
                aria-haspopup=${ariaHasPopup! || nothing}
                aria-expanded=${ariaExpanded! || nothing}
                tabindex="-1"
            >
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${this.renderIcon()}
                ${this.renderBackground()}
                ${this.renderTouchTarget()}
                <mdc-ripple for="input-as-touch-target" part="ripple" .disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring for="input-as-touch-target" part="focus-ring" .disabled=${this.disabled}></mdc-focus-ring>
            </button>
        `
    }

    protected override renderTouchTarget() {
        return html`
            <input 
                id="input-as-touch-target"
                class="touch-target"
                type="checkbox"
                tabindex="0"
                ?checked=${this.selected}
                ?required=${this.required} 
                ?disabled=${this.disabled} 
                aria-checked=${this.selected}
                aria-required=${this.required} 
                aria-disabled=${this.disabled}
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    private handleInput(e: Event) {
        this.selected = (e.target as HTMLInputElement)!.checked
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
        if (this.buttonElement) {
            this.buttonElement.checked = this.selected
        }
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
