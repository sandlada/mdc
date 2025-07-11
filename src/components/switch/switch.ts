/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { SwitchStyles } from './switch.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-switch": Switch
    }
}

@customElement('mdc-switch')
export class Switch extends mixinDelegatesAria(mixinConstraintValidation(mixinFormAssociated(mixinElementInternals(LitElement)))) {

    static override styles = SwitchStyles

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

    @property({ type: Boolean, attribute: 'hide-selected-icon' })
    public hideSelectedIcon: boolean = false

    @property({ type: Boolean, attribute: 'show-unselected-icon' })
    public showUnselectedIcon: boolean = false

    @query('#input')
    private readonly inputElement!: HTMLInputElement

    override focus() {
        this.inputElement?.focus()
    }
    override blur() {
        this.inputElement?.blur()
    }

    constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render(): unknown {
        const classes = classMap({
            'selected': this.selected,
            'unselected': !this.selected,
            'disabled': this.disabled,
            'show-unselected-icon': this.showUnselectedIcon,
        })

        return html`
            <div class="${classes} switch">
                ${this.renderInput()}

                <span class="outline" aria-hidden="true"></span>

                <span class="handle-container">
                    <mdc-ripple for="input" ?disabled="${this.disabled}"></mdc-ripple>
                    <span class="handle">
                        ${this.hideSelectedIcon ? nothing : this.renderSelectedIcon()}
                        ${this.showUnselectedIcon ? this.renderUnselectedIcon() : nothing}
                    </span>
                </span>

                <span class="track" aria-hidden="true"></span>

                <mdc-focus-ring for="input" part="focus-ring"></mdc-focus-ring>
            </div>
        `
    }

    protected renderInput() {
        return html`
            <input
                id="input"
                class="touch input"
                .checked=${this.selected}
                type="checkbox"
                role="switch"
                .disabled=${this.disabled}
                aria-disabled=${this.disabled}
                .required=${this.required}
                aria-required=${this.required}
                tabindex="0"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    private renderSelectedIcon() {
        return html`
            <slot class="icon icon-selected" name="icon-selected">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9.55 18.2 3.65 12.3 5.275 10.675 9.55 14.95 18.725 5.775 20.35 7.4Z" />
                </svg>
            </slot>
        `
    }

    private renderUnselectedIcon() {
        return html`
            <slot class="icon icon-unselected" name="icon-unselected">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.4 19.2 4.8 17.6 10.4 12 4.8 6.4 6.4 4.8 12 10.4 17.6 4.8 19.2 6.4 13.6 12 19.2 17.6 17.6 19.2 12 13.6Z" />
                </svg>
            </slot>
        `
    }

    private handleInput(e: InputEvent) {
        const input = e.target as HTMLInputElement
        this.selected = input.checked
    }

    private handleChange(e: Event) {
        redispatchEvent(this, e)
    }

    private handleClick(e: MouseEvent) {
        if (!isActivationClick(e) || !this.inputElement) {
            return
        }
        this.focus()
        dispatchActivationClick(this.inputElement)
    }

    override[getFormValue]() {
        return this.selected ? this.value : null
    }

    override[getFormState]() {
        return String(this.selected)
    }

    override formResetCallback() {
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
        return this.inputElement
    }
}
