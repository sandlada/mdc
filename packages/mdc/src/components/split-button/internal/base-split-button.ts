/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-split-button` — a two-segment control.
 *
 * The split button renders two independent native `<button>` elements side by
 * side inside a shared container: the leading button (primary action) and the
 * trailing button (menu / related-action trigger). They share the container
 * height and a pill-shaped corner-radius system and are joined across the small
 * `between-space` seam, so they read as a single control, but each button paints
 * its own background / outline and owns its own ripple, focus ring, elevation
 * and disabled state.
 *
 * Both segments accept a label, an icon, or both:
 * - leading button  — default slot (label) + `icon` slot
 * - trailing button — `trailing-icon` slot + `trailing-label` slot
 *
 * Activation is reported through the `leading-button-interaction` and
 * `trailing-button-interaction` composed events.
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import {
    SPLIT_BUTTON_LEADING_INTERACTION_EVENT,
    SPLIT_BUTTON_TRAILING_INTERACTION_EVENT,
    type ISplitButton,
    type SplitButtonSize,
    type SplitButtonVariant,
} from '../split-button.interface'
import { SplitButtonStyles } from './split-button.style'

export abstract class BaseSplitButton extends LitElement implements ISplitButton {

    static override styles = SplitButtonStyles

    /** Visual variant of the whole split button. */
    @property({ type: String, reflect: true })
    public variant: SplitButtonVariant = 'filled'

    /** Size of the whole split button. */
    @property({ type: String, reflect: true })
    public size: SplitButtonSize = 'small'

    /** When `true` both buttons are non-interactive and dimmed. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** When `true` only the leading button is non-interactive and dimmed. */
    @property({ type: Boolean, reflect: true, attribute: 'leading-disabled' })
    public leadingDisabled = false

    /** When `true` only the trailing button is non-interactive and dimmed. */
    @property({ type: Boolean, reflect: true, attribute: 'trailing-disabled' })
    public trailingDisabled = false

    /** When `true` the trailing button morphs to its expanded shape. */
    @property({ type: Boolean, reflect: true })
    public expanded = false

    /** When `true` the corner-radius morph on press is disabled. */
    @property({ type: Boolean, reflect: true, attribute: 'disable-morph' })
    public disableMorph = false

    /** When `true` the ripple of both buttons is disabled. */
    @property({ type: Boolean, reflect: true, attribute: 'disable-ripple' })
    public disableRipple = false

    /** When `true` the elevation of both buttons is disabled. */
    @property({ type: Boolean, reflect: true, attribute: 'disable-elevation' })
    public disableElevation = false

    /** When `true` the focus ring of both buttons is disabled. */
    @property({ type: Boolean, reflect: true, attribute: 'disable-focus-ring' })
    public disableFocusRing = false

    /** Accessible name for the trailing button when it has no visible label. */
    @property({ type: String, attribute: 'trailing-aria-label' })
    public trailingAriaLabel: string | null = null

    @state()
    public hasLeadingIcon = false
    @state()
    public hasLeadingLabel = false
    @state()
    public hasTrailingIcon = false
    @state()
    public hasTrailingLabel = false

    @query('.leading-button')
    public readonly leadingButtonElement!: HTMLButtonElement | null
    @query('.trailing-button')
    public readonly trailingButtonElement!: HTMLButtonElement | null

    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly assignedLeadingIcons!: HTMLElement[]
    @queryAssignedNodes({ flatten: true })
    private readonly assignedLeadingLabelNodes!: Node[]
    @queryAssignedElements({ slot: 'trailing-icon', flatten: true })
    private readonly assignedTrailingIcons!: HTMLElement[]
    @queryAssignedNodes({ slot: 'trailing-label', flatten: true })
    private readonly assignedTrailingLabelNodes!: Node[]

    protected get isLeadingDisabled(): boolean {
        return this.disabled || this.leadingDisabled
    }

    protected get isTrailingDisabled(): boolean {
        return this.disabled || this.trailingDisabled
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            [this.size]: true,
            'disable-morph': this.disableMorph,
            'disabled': this.disabled,
        })
    }

    protected getLeadingButtonClasses() {
        return ({
            'leading-button': true,
            'has-icon': this.hasLeadingIcon,
            'has-label': this.hasLeadingLabel,
            'disabled': this.isLeadingDisabled,
        })
    }

    protected getTrailingButtonClasses() {
        return ({
            'trailing-button': true,
            'has-icon': this.hasTrailingIcon,
            'has-label': this.hasTrailingLabel,
            'expanded': this.expanded,
            'disabled': this.isTrailingDisabled,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}" part="container">
                ${this.renderLeadingButton()}
                ${this.renderTrailingButton()}
            </div>
        `
    }

    /* ------------------------------------------------------------------ *
     * Leading button
     * ------------------------------------------------------------------ */

    protected renderLeadingButton(): TemplateResult {
        return html`
            <button
                class="${classMap(this.getLeadingButtonClasses())}"
                part="leading-button"
                type="button"
                ?disabled=${this.isLeadingDisabled}
                aria-disabled=${this.isLeadingDisabled || nothing}
                aria-label=${this.getAttribute('aria-label') || nothing}
                @click=${this.handleLeadingButtonClick}
            >
                ${this.renderLeadingOutline()}
                ${this.renderLeadingElevation()}
                ${this.renderLeadingBackground()}
                ${this.renderLeadingContent()}
                ${this.renderLeadingRipple()}
                ${this.renderLeadingFocusRing()}
                ${this.renderTouchTarget()}
            </button>
        `
    }

    protected renderLeadingOutline(): TemplateResult {
        if (this.variant !== 'outlined') {
            return html``
        }
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }

    protected renderLeadingBackground(): TemplateResult {
        return html`
            <span class="background" aria-hidden="true"></span>
        `
    }

    protected renderLeadingElevation(): TemplateResult {
        if (this.disableElevation) {
            return html`
                <mdc-elevation id="leading-elevation-part" ignore-global-config disabled></mdc-elevation>
            `
        }
        return html`<mdc-elevation id="leading-elevation-part"></mdc-elevation>`
    }

    protected renderLeadingContent(): TemplateResult {
        return html`
            ${this.renderLeadingIcon()}
            ${this.renderLeadingLabel()}
        `
    }

    protected renderLeadingIcon(): TemplateResult {
        return html`
            <span class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleLeadingIconSlotChange}></slot>
            </span>
        `
    }

    protected renderLeadingLabel(): TemplateResult {
        return html`
            <span class="label">
                <slot @slotchange=${this.handleLeadingLabelSlotChange}></slot>
            </span>
        `
    }

    protected renderLeadingRipple(): TemplateResult {
        if (this.disableRipple) {
            return html`
                <mdc-ripple id="leading-ripple-part" ignore-global-config disabled></mdc-ripple>
            `
        }
        return html`<mdc-ripple id="leading-ripple-part"></mdc-ripple>`
    }

    protected renderLeadingFocusRing(): TemplateResult {
        if (this.disableFocusRing) {
            return html`
                <mdc-focus-ring id="leading-focus-ring-part" ignore-global-config disabled></mdc-focus-ring>
            `
        }
        return html`<mdc-focus-ring id="leading-focus-ring-part"></mdc-focus-ring>`
    }

    /* ------------------------------------------------------------------ *
     * Trailing button
     * ------------------------------------------------------------------ */

    protected renderTrailingButton(): TemplateResult {
        return html`
            <button
                class="${classMap(this.getTrailingButtonClasses())}"
                part="trailing-button"
                type="button"
                ?disabled=${this.isTrailingDisabled}
                aria-disabled=${this.isTrailingDisabled || nothing}
                aria-haspopup="menu"
                aria-expanded=${this.expanded}
                aria-label=${this.trailingAriaLabel || nothing}
                @click=${this.handleTrailingButtonClick}
            >
                ${this.renderTrailingOutline()}
                ${this.renderTrailingElevation()}
                ${this.renderTrailingBackground()}
                ${this.renderTrailingContent()}
                ${this.renderTrailingRipple()}
                ${this.renderTrailingFocusRing()}
                ${this.renderTouchTarget()}
            </button>
        `
    }

    protected renderTrailingOutline(): TemplateResult {
        if (this.variant !== 'outlined') {
            return html``
        }
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }

    protected renderTrailingBackground(): TemplateResult {
        return html`
            <span class="background" aria-hidden="true"></span>
        `
    }

    protected renderTrailingElevation(): TemplateResult {
        if (this.disableElevation) {
            return html`
                <mdc-elevation id="trailing-elevation-part" ignore-global-config disabled></mdc-elevation>
            `
        }
        return html`<mdc-elevation id="trailing-elevation-part"></mdc-elevation>`
    }

    protected renderTrailingContent(): TemplateResult {
        return html`
            ${this.renderTrailingIcon()}
            ${this.renderTrailingLabel()}
        `
    }

    protected renderTrailingIcon(): TemplateResult {
        return html`
            <span class="icon" aria-hidden="true">
                <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}></slot>
            </span>
        `
    }

    protected renderTrailingLabel(): TemplateResult {
        return html`
            <span class="label">
                <slot name="trailing-label" @slotchange=${this.handleTrailingLabelSlotChange}></slot>
            </span>
        `
    }

    protected renderTrailingRipple(): TemplateResult {
        if (this.disableRipple) {
            return html`
                <mdc-ripple id="trailing-ripple-part" ignore-global-config disabled></mdc-ripple>
            `
        }
        return html`<mdc-ripple id="trailing-ripple-part"></mdc-ripple>`
    }

    protected renderTrailingFocusRing(): TemplateResult {
        if (this.disableFocusRing) {
            return html`
                <mdc-focus-ring id="trailing-focus-ring-part" ignore-global-config disabled></mdc-focus-ring>
            `
        }
        return html`<mdc-focus-ring id="trailing-focus-ring-part"></mdc-focus-ring>`
    }

    /* ------------------------------------------------------------------ *
     * Shared
     * ------------------------------------------------------------------ */

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    public override focus(): void {
        const target = this.isLeadingDisabled
            ? this.trailingButtonElement
            : this.leadingButtonElement
        target?.focus()
    }

    public override blur(): void {
        this.leadingButtonElement?.blur()
        this.trailingButtonElement?.blur()
    }

    /* ------------------------------------------------------------------ *
     * Events
     * ------------------------------------------------------------------ */

    private readonly handleLeadingButtonClick = (e: Event): void => {
        if (this.isLeadingDisabled) {
            e.stopImmediatePropagation()
            e.preventDefault()
            return
        }
        this.dispatchEvent(new Event(SPLIT_BUTTON_LEADING_INTERACTION_EVENT, {
            bubbles: true,
            composed: true,
        }))
    }

    private readonly handleTrailingButtonClick = (e: Event): void => {
        if (this.isTrailingDisabled) {
            e.stopImmediatePropagation()
            e.preventDefault()
            return
        }
        this.dispatchEvent(new Event(SPLIT_BUTTON_TRAILING_INTERACTION_EVENT, {
            bubbles: true,
            composed: true,
        }))
    }

    /* ------------------------------------------------------------------ *
     * Slot detection
     * ------------------------------------------------------------------ */

    private readonly handleLeadingIconSlotChange = (): void => {
        this.hasLeadingIcon = this.assignedLeadingIcons.length > 0
    }

    private readonly handleLeadingLabelSlotChange = (): void => {
        this.hasLeadingLabel = hasTextContent(this.assignedLeadingLabelNodes)
    }

    private readonly handleTrailingIconSlotChange = (): void => {
        this.hasTrailingIcon = this.assignedTrailingIcons.length > 0
    }

    private readonly handleTrailingLabelSlotChange = (): void => {
        this.hasTrailingLabel = hasTextContent(this.assignedTrailingLabelNodes)
    }
}

/**
 * Whether an assigned slot's nodes carry any visible label content — an
 * element, or a text node with non-whitespace text.
 */
function hasTextContent(nodes: Node[]): boolean {
    for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            return true
        }
        if (
            node.nodeType === Node.TEXT_NODE &&
            !!(node as Text).wholeText.match(/\S/)
        ) {
            return true
        }
    }
    return false
}
