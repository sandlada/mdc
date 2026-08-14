/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-segmented-button` — a single selectable segment.
 *
 * A segment is a pure view: it renders a native `<button>` (the focusable,
 * accessible element) holding the optional icon, label and — when selected —
 * an animated checkmark. Selection state is owned by the parent
 * `mdc-segmented-button-set`; on pointer / keyboard activation the segment
 * only reports the `segmented-button-interaction` event and the set decides
 * whether the selection commits.
 *
 * Ripple and focus-ring are wired to the inner button via
 * `mixinRippleOptions` / `mixinFocusRingOptions`.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import { SEGMENTED_BUTTON_INTERACTION_EVENT, type ISegmentedButton } from '../segmented-button.interface'
import { SegmentedButtonStyles } from './segmented-button.style'

export abstract class BaseSegmentedButton extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements ISegmentedButton {

    static override styles = SegmentedButtonStyles

    /** Whether this segment is currently selected. */
    @property({ type: Boolean, reflect: true })
    public selected = false

    /** When `true` the segment is non-interactive and dimmed. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** When `true` the checkmark is hidden on the selected state. */
    @property({ type: Boolean, reflect: true, attribute: 'no-checkmark' })
    public noCheckmark = false

    /** Set when the `icon` slot is populated. */
    @state()
    public hasIcon = false

    /** Set when the default (label) slot is populated. */
    @state()
    public hasLabel = false

    @query('.container')
    protected readonly buttonElement!: HTMLButtonElement | null
    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly assignedIcons!: HTMLElement[]
    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]

    /** Tracks the checkmark draw-in / icon fade-out animation phase. */
    @state()
    private animState: '' | 'selecting' | 'deselecting' = ''

    public override get rippleControl(): HTMLElement | null {
        return this.buttonElement
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.buttonElement
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick)
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            'selected': this.selected,
            'unselected': !this.selected,
            'with-label': this.hasLabel,
            'without-label': !this.hasLabel,
            'with-icon': this.hasIcon,
            'without-icon': !this.hasIcon,
            'with-checkmark': !this.noCheckmark,
            'without-checkmark': this.noCheckmark,
            'selecting': this.animState === 'selecting',
            'deselecting': this.animState === 'deselecting',
            'disabled': this.disabled,
        })
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('selected')) {
            const prevSelected = changedProperties.get('selected') as boolean | undefined
            const nextHasCheckmark = !this.noCheckmark
            if (prevSelected === false && this.selected && nextHasCheckmark) {
                this.animState = 'selecting'
            } else if (prevSelected === true && !this.selected && nextHasCheckmark) {
                this.animState = 'deselecting'
            } else {
                this.animState = ''
            }
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <button
                class="${classMap(this.getRenderClasses())}"
                tabindex=${this.disabled ? -1 : 0}
                ?disabled=${this.disabled}
                aria-pressed=${this.selected}
                aria-label=${ariaLabel || nothing}
            >
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                ${this.renderOutline()}
                ${this.renderLeading()}
                ${this.renderLabel()}
                ${this.renderTouchTarget()}
            </button>
        `
    }

    protected renderOutline(): TemplateResult {
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }

    protected renderLeading(): TemplateResult {
        return html`
            <span class="leading" aria-hidden="true">
                ${this.hasLabel
                    ? html`
                        <span class="graphic">
                            ${this.renderCheckmark()}
                            ${this.renderIcon()}
                        </span>`
                    : html`
                        <span class="graphic">${this.renderCheckmark()}</span>
                        ${this.renderIcon()}`}
            </span>
        `
    }

    protected renderIcon(): TemplateResult {
        return html`
            <span class="icon">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    protected renderCheckmark(): TemplateResult {
        return html`
            <svg class="checkmark" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    class="checkmark-path"
                    fill="none"
                    d="M1.73,12.91 8.1,19.28 22.79,4.59"
                ></path>
            </svg>
        `
    }

    protected renderLabel(): TemplateResult {
        return html`
            <span class="label">
                <slot @slotchange=${this.handleLabelSlotChange}></slot>
            </span>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    public override focus(): void {
        this.buttonElement?.focus()
    }
    public override blur(): void {
        this.buttonElement?.blur()
    }

    private readonly handleClick = (): void => {
        if (this.disabled) {
            return
        }
        this.dispatchEvent(new Event(SEGMENTED_BUTTON_INTERACTION_EVENT, {
            bubbles: true,
            composed: true,
        }))
    }

    private readonly handleIconSlotChange = (): void => {
        this.hasIcon = this.assignedIcons.length > 0
    }

    private readonly handleLabelSlotChange = (): void => {
        let hasLabel = false
        for (const node of this.assignedDefaultNodes) {
            const hasTextContent =
                node.nodeType === Node.TEXT_NODE &&
                !!(node as Text).wholeText.match(/\S/)
            if (node.nodeType === Node.ELEMENT_NODE || hasTextContent) {
                hasLabel = true
                break
            }
        }
        this.hasLabel = hasLabel
    }

}
