/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import { CheckboxStyles } from './checkbox.style'
import type { ICheckbox } from './checkbox.interface'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-checkbox": MDCCheckbox
    }
}

/**
 *
 *
 *
 * @version "Material Design 3"
 *
 * @link
 * https://m3.material.io/components/checkbox/overview
 */
@customElement('mdc-checkbox')
export class MDCCheckbox extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements ICheckbox {

    static override styles = CheckboxStyles

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

    @property({ type: Boolean, reflect: true })
    public checked: boolean = false

    @property({ type: Boolean, reflect: true })
    public indeterminate: boolean = false

    @property({ type: Boolean, reflect: true })
    public tristate: boolean = false

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    private prevChecked = false
    private prevDisabled = false
    private prevIndeterminate = false

    @query('#input')
    private readonly inputElement!: HTMLInputElement | null

    public override get focusRingControl(): HTMLElement | null {
        return this.inputElement ?? null
    }
    public override get rippleControl(): HTMLElement | null {
        return this.inputElement ?? null
    }

    override focus() {
        this.inputElement?.focus()
    }
    override blur() {
        this.inputElement?.blur()
    }

    constructor() {
        super()
        if (isServer) return
        this.addEventListener('click', this.handleHostClick)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        // Apply the `default-checked` attribute as the initial `checked`
        // state, mirroring native HTML `defaultChecked` semantics. Runs
        // before `formStateRestoreCallback` so a restored form value can
        // still override the default.
        if (this.hasAttribute('default-checked')) {
            this.checked = true
        }
    }

    protected override update(changedProperties: PropertyValues<this>): void {
        if (
            changedProperties.has('checked') ||
            changedProperties.has('disabled') ||
            changedProperties.has('indeterminate')
        ) {
            this.prevChecked = changedProperties.get('checked') ?? this.checked
            this.prevDisabled = changedProperties.get('disabled') ?? this.disabled
            this.prevIndeterminate = changedProperties.get('indeterminate') ?? this.indeterminate
        }
        super.update(changedProperties)
    }

    protected getRenderClasses() {
        const prevNone = !this.prevChecked && !this.prevIndeterminate
        const prevChecked = this.prevChecked && !this.prevIndeterminate
        const prevIndeterminate = this.prevIndeterminate
        const isChecked = this.checked && !this.indeterminate
        const isIndeterminate = this.indeterminate
        return ({
            'container': true,
            'disabled': this.disabled,
            'selected': isChecked || isIndeterminate,
            'unselected': !isChecked && !isIndeterminate,
            'checked': isChecked,
            'indeterminate': isIndeterminate,
            'prev-unselected': prevNone,
            'prev-checked': prevChecked,
            'prev-indeterminate': prevIndeterminate,
            'prev-disabled': this.prevDisabled,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                ${this.renderInput()}
                <div class="outline" aria-hidden="true"></div>
                <div class="background" aria-hidden="true"></div>
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                <svg class="icon" viewBox="0 0 18 18" aria-hidden="true">
                    <rect class="mark short" />
                    <rect class="mark long" />
                </svg>
            </div>
        `
    }

    private renderInput() {
        // The inner <input> is the accessibility node, so ARIA set on the host
        // is shifted here by `mixinDelegatesAria`.
        const { ariaInvalid, ariaLabel } = this as AriaMixinStrict
        const isIndeterminate = this.indeterminate
        return html`
            <input
                id="input"
                class="touch"
                type="checkbox"
                .checked=${this.checked}
                .indeterminate=${isIndeterminate}
                ?disabled=${this.disabled}
                ?required=${this.required}
                aria-checked=${isIndeterminate ? 'mixed' : nothing}
                aria-label=${ariaLabel || nothing}
                aria-invalid=${ariaInvalid || nothing}
                @click=${this.handleInputClick}
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    // ── events ───────────────────────────────────────────────────────────────

    private readonly handleHostClick = (event: MouseEvent) => {
        // Only react to clicks that originate on the host (label activation,
        // `element.click()`, or the exposed margin when `touch-target='none'`).
        // A click directly on the inner <input> toggles natively and reaches
        // the host with `target !== currentTarget`, so it is skipped here.
        if (!isActivationClick(event) || !this.inputElement) return
        this.focus()
        dispatchActivationClick(this.inputElement)
    }

    private readonly handleInputClick = (event: MouseEvent) => {
        if (!this.tristate) return
        // Replace the native two-state toggle with the three-state cycle.
        event.preventDefault()
        this.cycleTristate()
        // Mirror native activation: `input` (composed) then `change`.
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        this.dispatchEvent(new Event('change', { bubbles: true }))
    }

    private readonly handleInput = (event: InputEvent) => {
        const target = event.target as HTMLInputElement
        // The native `input` event fires after the checkbox has toggled its
        // checkedness and collapsed any indeterminate dash (per the checkbox
        // activation steps), so syncing from the target is authoritative.
        // It bubbles and is composed, so it is not re-dispatched.
        this.checked = target.checked
        this.indeterminate = target.indeterminate
    }

    private readonly handleChange = (event: Event) => {
        // The native `change` event is not composed, so it does not escape the
        // shadow root — re-dispatch it from the host.
        redispatchEvent(this, event)
    }

    /**
     * Flutter's `tristate` cycle: unchecked → checked → indeterminate →
     * unchecked. See `ToggleableStateMixin._handleValueChanged` in
     * packages/flutter/lib/src/material/checkbox.dart.
     */
    private cycleTristate() {
        if (this.indeterminate) {
            // indeterminate → unchecked
            this.checked = false
            this.indeterminate = false
        } else if (this.checked) {
            // checked → indeterminate
            this.checked = false
            this.indeterminate = true
        } else {
            // unchecked → checked
            this.checked = true
            this.indeterminate = false
        }
    }

    // ── form association ─────────────────────────────────────────────────────

    override [getFormValue]() {
        if (!this.checked || this.indeterminate) {
            return null
        }
        return this.value
    }

    override [getFormState]() {
        return String(this.checked)
    }

    override formResetCallback() {
        this.checked = this.hasAttribute('default-checked')
        this.indeterminate = false
    }

    override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }

    override [createValidator]() {
        return new CheckboxValidator(() => ({
            checked: this.checked,
            required: this.required,
        }))
    }

    override [getValidityAnchor]() {
        return this.inputElement
    }
}
