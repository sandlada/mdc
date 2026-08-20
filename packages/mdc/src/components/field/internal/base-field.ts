/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { property, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { baseFieldStyles } from './base-field.style'
import {
    type FieldVariant,
    type FloatingLabelBehavior,
    type IField,
    FIELD_LABEL_POINTER_EVENT,
} from '../field.interface'

/**
 * Abstract base for `mdc-field`. Owns the chrome rendering, label/state,
 * slot detection, and click-to-label wiring. Subclasses define the public tag
 * and the default variant.
 *
 * Mixin composition (per CLAUDE.md rules, abstract → concrete):
 * - `mixinDelegatesAria`      — passes ARIA attributes from host to inner label / input
 * - `mixinElementInternals`   — exposes `[internals]` for future textfield integration
 * - `mixinFocusRingOptions`   — provides the outer focus ring via `renderFocusRing()`
 *
 * State is **manual** — the consumer (e.g. `mdc-textfield`) sets `focused`,
 * `populated`, `invalid`, and `disabled` in response to events from the input
 * child. `mdc-field` deliberately does not listen to focus / input / invalid
 * events itself, so it remains agnostic to the input child type.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 */
export abstract class BaseField extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinFocusRingOptions
)(LitElement) implements IField {

    public static override styles = [baseFieldStyles]

    @property({ type: String, reflect: true })
    public variant: FieldVariant = 'filled'

    @property({ type: String })
    public label: string = ''

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = ''

    @property({ type: String, attribute: 'error-text' })
    public errorText: string = ''

    @property({ type: String, attribute: 'prefix-text' })
    public prefixText: string = ''

    @property({ type: String, attribute: 'suffix-text' })
    public suffixText: string = ''

    @property({ type: String, attribute: 'counter-text' })
    public counterText: string = ''

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: Boolean, attribute: 'no-asterisk', reflect: true })
    public noAsterisk: boolean = false

    @property({ type: Boolean, reflect: true })
    public populated: boolean = false

    @property({ type: Boolean, reflect: true })
    public focused: boolean = false

    @property({ type: Boolean, reflect: true })
    public invalid: boolean = false

    @property({ type: String, attribute: 'floating-label-behavior' })
    public floatingLabelBehavior: FloatingLabelBehavior = 'auto'

    @property({ type: Boolean, attribute: 'align-end', reflect: true })
    public alignEnd: boolean = false

    @property({ type: Boolean, reflect: true })
    public multiline: boolean = false

    @property({ type: Boolean, reflect: true })
    public resizable: boolean = false

    // ── Slot detection ──────────────────────────────────────────────────────
    // Slot presence is driven by `slotchange` handlers; these @state
    // flags flip on first render and on every subsequent slot mutation.

    @state()
    protected hasLeadingIcon: boolean = false

    @state()
    protected hasTrailingIcon: boolean = false

    @state()
    protected hasPrefix: boolean = false

    @state()
    protected hasSuffix: boolean = false

    @state()
    protected hasSupportingText: boolean = false

    @state()
    protected hasErrorText: boolean = false

    @state()
    protected hasCounter: boolean = false

    @queryAssignedElements({ slot: 'leading-icon', flatten: true })
    private readonly assignedLeadingIcons!: HTMLElement[]

    @queryAssignedElements({ slot: 'trailing-icon', flatten: true })
    private readonly assignedTrailingIcons!: HTMLElement[]

    @queryAssignedElements({ slot: 'prefix', flatten: true })
    private readonly assignedPrefixElements!: HTMLElement[]

    @queryAssignedElements({ slot: 'suffix', flatten: true })
    private readonly assignedSuffixElements!: HTMLElement[]

    @queryAssignedElements({ slot: 'supporting-text', flatten: true })
    private readonly assignedSupportingTextElements!: HTMLElement[]

    @queryAssignedElements({ slot: 'error-text', flatten: true })
    private readonly assignedErrorTextElements!: HTMLElement[]

    @queryAssignedElements({ slot: 'counter', flatten: true })
    private readonly assignedCounterElements!: HTMLElement[]

    /**
     * Whether the label should float to the top resting position.
     */
    public get shouldLabelFloat(): boolean {
        if (!this.label) return false
        if (this.floatingLabelBehavior === 'always') return true
        if (this.floatingLabelBehavior === 'never') return false
        return this.focused || this.populated
    }

    // ── Render classes ─────────────────────────────────────────────────────

    protected getRenderClasses(): Record<string, boolean | string> {
        const isFloating = this.shouldLabelFloat
        const hasError = this.invalid && (this.errorText.length > 0 || this.hasErrorText)
        const hasSupporting = this.supportingText.length > 0 || this.hasSupportingText
        const hasCounterText = this.counterText.length > 0 || this.hasCounter

        return {
            'container': true,
            'filled': this.variant === 'filled',
            'outlined': this.variant === 'outlined',
            'has-label': this.label.length > 0,
            'floating-label': isFloating,
            'resting-label': !isFloating && this.label.length > 0,
            'has-leading-icon': this.hasLeadingIcon,
            'has-trailing-icon': this.hasTrailingIcon,
            'has-prefix': this.hasPrefix || this.prefixText.length > 0,
            'has-suffix': this.hasSuffix || this.suffixText.length > 0,
            'has-supporting-text': hasSupporting,
            'has-error-text': hasError,
            'has-counter': hasCounterText,
            'disabled': this.disabled,
            'required': this.required,
            'invalid': this.invalid,
            'focused': this.focused,
            'populated': this.populated,
            'multiline': this.multiline,
            'resizable': this.resizable,
            'align-end': this.alignEnd,
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        const isFloating = this.shouldLabelFloat
        const hasError = this.invalid && (this.errorText.length > 0 || this.hasErrorText)
        const hasSupporting = this.supportingText.length > 0 || this.hasSupportingText
        const hasCounterText = this.counterText.length > 0 || this.hasCounter
        const showSupportingRow = hasError || hasSupporting || hasCounterText

        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                part="container"
                @click=${this.handleContainerClick}
            >
                <span class="leading" part="leading-icon">
                    <slot name="leading-icon"
                        @slotchange=${this.handleLeadingIconSlotChange}></slot>
                </span>

                <div class="content" part="content">
                    <span class="prefix" part="prefix">
                        <slot name="prefix"
                            @slotchange=${this.handlePrefixSlotChange}></slot>
                        ${this.prefixText ? html`<span class="prefix-text">${this.prefixText}</span>` : nothing}
                    </span>

                    <span class="input" part="input">
                        <slot @slotchange=${this.handleDefaultSlotChange}></slot>
                    </span>

                    <span class="suffix" part="suffix">
                        ${this.suffixText ? html`<span class="suffix-text">${this.suffixText}</span>` : nothing}
                        <slot name="suffix"
                            @slotchange=${this.handleSuffixSlotChange}></slot>
                    </span>
                </div>

                <span class="trailing" part="trailing-icon">
                    <slot name="trailing-icon"
                        @slotchange=${this.handleTrailingIconSlotChange}></slot>
                </span>

                ${this.label ? html`
                    <label
                        class="label ${classMap({ 'floating': isFloating, 'resting': !isFloating })}"
                        part="label"
                        @click=${this.handleLabelClick}
                    >
                        <span class="label-text">${this.label}</span>
                        ${this.required && !this.noAsterisk ? html`<span class="required-asterisk" aria-hidden="true"> *</span>` : nothing}
                    </label>
                ` : nothing}

                ${this.renderFocusRing()}
            </div>

            ${showSupportingRow ? html`
                <div class="supporting-wrapper" part="supporting-wrapper">
                    <div class="supporting-text" part="supporting-text">
                        ${this.invalid && (this.errorText || this.hasErrorText)
                            ? html`<slot name="error-text" @slotchange=${this.handleErrorTextSlotChange}>${this.errorText}</slot>`
                            : html`<slot name="supporting-text" @slotchange=${this.handleSupportingTextSlotChange}>${this.supportingText}</slot>`}
                    </div>
                    <div class="counter" part="counter">
                        <slot name="counter" @slotchange=${this.handleCounterSlotChange}>${this.counterText}</slot>
                    </div>
                </div>
            ` : nothing}
        `
    }

    // ── Slot change handlers ───────────────────────────────────────────────

    private readonly handleLeadingIconSlotChange = (): void => {
        this.hasLeadingIcon = this.assignedLeadingIcons.length > 0
    }

    private readonly handleTrailingIconSlotChange = (): void => {
        this.hasTrailingIcon = this.assignedTrailingIcons.length > 0
    }

    private readonly handlePrefixSlotChange = (): void => {
        this.hasPrefix = this.assignedPrefixElements.length > 0
    }

    private readonly handleSuffixSlotChange = (): void => {
        this.hasSuffix = this.assignedSuffixElements.length > 0
    }

    private readonly handleDefaultSlotChange = (_event: Event): void => {
        // Consumer controls the slotted child and synchronizes states.
    }

    private readonly handleSupportingTextSlotChange = (): void => {
        this.hasSupportingText = this.assignedSupportingTextElements.length > 0
    }

    private readonly handleErrorTextSlotChange = (): void => {
        this.hasErrorText = this.assignedErrorTextElements.length > 0
    }

    private readonly handleCounterSlotChange = (): void => {
        this.hasCounter = this.assignedCounterElements.length > 0
    }

    // ── Interaction handlers ────────────────────────────────────────────────

    private readonly handleContainerClick = (event: MouseEvent): void => {
        // Forward click to the slotted focusable input if click was on chrome
        const target = event.target as HTMLElement
        if (target.closest('slot[name="trailing-icon"]') || target.closest('slot[name="leading-icon"]')) {
            return
        }
        const inputChild = this.getDefaultSlotFocusable()
        if (inputChild && document.activeElement !== inputChild) {
            inputChild.focus()
        }
    }

    private readonly handleLabelClick = (event: MouseEvent): void => {
        this.dispatchEvent(new Event(FIELD_LABEL_POINTER_EVENT, {
            bubbles: true,
            composed: true,
        }))
        const inputChild = this.getDefaultSlotFocusable()
        if (inputChild) {
            inputChild.focus()
        }
        event.preventDefault()
    }

    public getDefaultSlotFocusable(): HTMLElement | null {
        const inputContainer = this.renderRoot.querySelector('.input')
        if (!inputContainer) return null
        const slot = inputContainer.querySelector('slot:not([name])')
        if (!slot) return null
        const assigned = (slot as HTMLSlotElement).assignedElements({ flatten: true })
        for (const el of assigned) {
            if (el instanceof HTMLElement) {
                if (el.tabIndex >= 0 && !el.hasAttribute('disabled')) {
                    return el
                }
            }
        }
        return null
    }
}

