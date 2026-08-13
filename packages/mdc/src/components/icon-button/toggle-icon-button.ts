/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { BaseMDCIconButton } from './base-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-icon-button": MDCToggleIconButton
    }
}

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
    mixinFormAssociated,
)(BaseMDCIconButton) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property({ type: String, reflect: true, })
    public type: 'radio' | 'checkbox' = 'checkbox'

    @property({ type: Boolean, reflect: true })
    public checked = false

    @property({ type: String })
    public value: 'on' | (string & {}) = 'on'

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    // public override get focusRingControl() { return this.buttonElement }
    // public override get rippleControl() { return this.buttonElement }

    declare disabled: boolean
    declare name: string

    protected readonly selectionController: SelectionController

    constructor() {
        super()
        this.selectionController = new SelectionController(this, {
            multiple: this.type === 'checkbox',
            canCancel: this.type === 'checkbox',
            preventSelectionDuringInitialFocus: this.type === 'checkbox',
            preventSelectionDuringSwitching: this.type === 'checkbox',
            dispatchNavigationClick: this.type === 'radio',
            getFocusableElement: (host) => {
                return host
            }
        })
        if(isServer) {
            return
        }
        this.tabIndex = 0
        this[internals].role = this.type
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties);

        if (changedProperties.has('type')) {
            const isCheckbox = this.type === 'checkbox'
            this.selectionController.configure({
                multiple: isCheckbox,
                canCancel: isCheckbox,
                preventSelectionDuringInitialFocus: isCheckbox,
                preventSelectionDuringSwitching: isCheckbox,
                dispatchNavigationClick: !isCheckbox,
            })
            this[internals].role = this.type
        }
        if (changedProperties.has('checked')) {
            this[internals].ariaChecked = String(this.checked)
        }
    }

    // protected override updated() {
    //     this[internals].ariaChecked = String(this.checked);
    // }

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
                @focusin=${this.handleVisualFocusIn}
                @focusout=${this.handleVisualFocusOut}
                @keydown=${this.handleVisualKeyDown}
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
                role="button"
                .checked=${this.checked}
                ?required=${this.required}
                ?disabled=${this.disabled}
                aria-checked=${this.checked}
                aria-required=${this.required}
                aria-disabled=${this.disabled}
                tabindex="-1"
            />
        `
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
