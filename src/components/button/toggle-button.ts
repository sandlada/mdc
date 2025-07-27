/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing, type TemplateResult } from "lit"
import { customElement, property, query } from "lit/decorators.js"
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseButton } from './base-button'
import { buttonStyles } from './button.style'

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
export class TogglableButton extends mixinConstraintValidation(mixinFormAssociated(BaseButton)) {

    static override styles = buttonStyles

    declare disabled: boolean
    declare name: string

    @property({ type: String, reflect: true, })
    public override variant: 'filled' | 'filled-tonal' | 'elevated' | 'outlined' = 'filled'

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
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled}
                aria-label=${ariaLabel || nothing}
                aria-haspopup=${ariaHasPopup || nothing}
                aria-expanded=${ariaExpanded || nothing}
                tabindex="-1"
            >
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${['elevated', 'filled', 'filled-tonal'].includes(this.variant) ? this.renderElevation() : nothing}
                ${this.renderContent()}
                ${this.renderTouchTarget()}
                ${this.renderBackground()}
                <mdc-ripple for="input-as-touch-target" part="ripple" ?disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring for="input-as-touch-target" part="focus-ring"></mdc-focus-ring>
            </button>
        `
    }

    protected override renderTouchTarget() {
        return html`
            <input
                type="checkbox"
                role="button"
                id="input-as-touch-target"
                class="toggle-input touch-target"
                .checked=${this.selected}
                .disabled=${this.disabled}
                .required=${this.required}
                aria-disabled=${this.disabled}
                aria-required=${this.required}
                tabindex="0"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
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
