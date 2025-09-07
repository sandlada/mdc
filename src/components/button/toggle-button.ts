/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing, type PropertyValues, type TemplateResult } from "lit"
import { customElement, property, query } from "lit/decorators.js"
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { SelectionController } from '../../utils/controller/selection-controller'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseButton } from './base-button'

const SChecked = Symbol('checked')

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
export class MDCTogglableButton extends mixinConstraintValidation(mixinFormAssociated(BaseButton)) {

    declare disabled: boolean
    declare name: string

    // @property({ type: String, reflect: true, })
    public override variant: 'filled' | 'filled-tonal' | 'elevated' | 'outlined' = 'filled'

    @property({ type: String, reflect: true })
    public value: string = 'on'

    @property({ type: Boolean, reflect: true, noAccessor: true })
    public get checked() {
        return this[SChecked]
    }
    public set checked(value: boolean) {
        if(value === this[SChecked]) {
            return
        }
        const oldValue = this[SChecked]
        this[SChecked] = value
        this.selectionController.handleCheckedChange()
        this.requestUpdate('checked', oldValue)
    }

    /**
     * When true, require the toggle-button to be selected when participating in
     * form submission.
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#validation
     */
    @property({type: Boolean })
    public required: boolean = false

    @property({type: String, reflect: true })
    public type: 'checkbox' | 'radio' = 'checkbox'

    /**
     * We use the <input /> element as a replacement for the button element.
     * The state is managed by the input element.
     */
    @query('#input-as-touch-target')
    protected override readonly buttonElement!: HTMLInputElement | null

    [SChecked]: boolean = false
    private selectionController!: SelectionController

    constructor() {
        super()
        if(isServer) {
            return
        }
    }

    override connectedCallback(): void {
        super.connectedCallback()
        if (!this.selectionController) {
            this.selectionController = new SelectionController(this, { multiple: this.type === 'checkbox' })
            this.addController(this.selectionController)
        }
    }
    
    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('type')) {
            this[internals].role = this.type
            this.selectionController.multiple = this.type === 'checkbox'
        }
        if (changedProperties.has('checked')) {
            this[internals].ariaChecked = String(this.checked)
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

    protected override render(): TemplateResult {
        const { ariaHasPopup, ariaExpanded, ariaLabel } = this as AriaMixinStrict
        return html`
            <button
                class="${classMap(this.getRenderClasses())}"
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled}
                aria-label=${ariaLabel || nothing}
                aria-haspopup=${ariaHasPopup! || nothing}
                aria-expanded=${ariaExpanded! || nothing}
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
                type=${this.type}
                role="button"
                id="input-as-touch-target"
                class="toggle-input touch-target"
                .checked=${this.checked}
                ?disabled=${this.disabled}
                ?required=${this.required}
                aria-checked=${this.checked}
                aria-disabled=${this.disabled}
                aria-required=${this.required}
                tabindex="0"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    protected handleInput(_: InputEvent) {
        this.checked = this.buttonElement!.checked
    }

    protected handleChange(e: Event) {
        redispatchEvent(this, e)
    }

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
        if(this.type === 'checkbox') {
            return new CheckboxValidator(() => ({
                checked: this.checked,
                required: this.required,
            }))
        }
        return new RadioValidator(() => {
            if (!this.selectionController) {
                // Validation runs on superclass construction, so selection controller
                // might not actually be ready until this class constructs.
                return [this]
            }
            return this.selectionController.controls as [MDCTogglableButton, ...MDCTogglableButton[]]
        })
    }

    override[getValidityAnchor]() {
        return this.buttonElement
    }

}
