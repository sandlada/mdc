/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseMDCIconButton } from './base-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-icon-button": MDCToggleIconButton
    }
}

const SChecked = Symbol('checked')

/**
 * The toggle-icon-button component is a split of the icon-button component,
 * which can toggle whether an item is selected or not. It can be used as a form element.
 *
 * @alias
 * mdc-toggle-icon-button
 *
 * @slot default
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
@customElement('mdc-toggle-icon-button')
export class MDCToggleIconButton extends composeMixin(
    mixinConstraintValidation,
    mixinFormAssociated
)(BaseMDCIconButton) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

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

    @property({ type: Boolean })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    @property({ type: String, reflect: true })
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
            'has-default-icon': this.hasDefaultIcon && !this.hasActiveIcon,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
        })
    }

    public override focusRingHtmlFor: string | null = 'input-as-touch-target'
    public override rippleHtmlFor: string | null = 'input-as-touch-target'

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
                ${this.renderRipple()}
                ${this.renderFocusRing()}
            </button>
        `
    }

    protected override renderIcon() {
        return html`
            <span class="icon default-icon">
                <slot @slotchange=${this.handleDefaultIconSlotChange}></slot>
            </span>
            <span class="icon active-icon">
                <slot @slotchange=${this.handleActiveIconSlotChange} name="active-icon"></slot>
            </span>
            <span class="icon inactive-icon">
                <slot @slotchange=${this.handleInactiveIconSlotChange} name="inactive-icon"></slot>
            </span>
        `
    }

    protected override renderTouchTarget() {
        return html`
            <input
                id="input-as-touch-target"
                class="touch-target"
                type=${this.type}
                .checked=${this.checked}
                ?required=${this.required}
                ?disabled=${this.disabled}
                aria-checked=${this.checked}
                aria-required=${this.required}
                aria-disabled=${this.disabled}
                tabindex="0"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    private handleInput(_: Event) {
        this.checked = this.buttonElement!.checked
    }

    private handleChange(e: Event) {
        redispatchEvent(this, e)
    }

    @state()
    protected hasDefaultIcon: boolean = false
    @state()
    protected hasActiveIcon: boolean = false
    @state()
    protected hasInactiveIcon: boolean = false

    protected handleDefaultIconSlotChange(e: Event) {
        this.hasDefaultIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    protected handleActiveIconSlotChange(e: Event) {
        this.hasActiveIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    protected handleInactiveIconSlotChange(e: Event) {
        this.hasInactiveIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
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
            return this.selectionController.controls as [MDCToggleIconButton, ...MDCToggleIconButton[]]
        })
    }

    override[getValidityAnchor]() {
        return this.buttonElement
    }
}
