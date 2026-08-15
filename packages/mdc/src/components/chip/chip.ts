/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import {
    CHIP_CLOSE_EVENT,
    CHIP_NAVIGATE_EVENT,
    CHIP_TOGGLE_EVENT,
    type ChipVariant,
    type IChip,
    type IChipCloseEventDetail,
    type IChipNavigateEventDetail,
    type IChipToggleEventDetail,
} from './chip.interface'
import { ChipStyles } from './chip.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-chip': MDCChip
    }
}

/**
 * @element mdc-chip
 *
 * A compact UI element representing complex entities.
 * Supports 4 variants: assist, filter, input, suggestion.
 *
 * @slot - The chip label text.
 * @slot icon - Leading icon (assist/filter variants).
 * @slot avatar - Avatar element (input variant).
 * @slot trailing-icon - Trailing icon/close button (input variant).
 *
 * @fires chip-toggle - Dispatched when selection changes (filter/input).
 * @fires chip-navigate - Dispatched on assist/suggestion click.
 * @fires chip-close - Dispatched when close icon is clicked (input).
 *
 * @cssproperty --mdc-chip-enabled-container-color
 * @cssproperty --mdc-chip-container-shape-start-start
 * @cssproperty --mdc-chip-container-shape-start-end
 * @cssproperty --mdc-chip-container-shape-end-start
 * @cssproperty --mdc-chip-container-shape-end-end
 * @cssproperty --mdc-chip-enabled-label-color
 * @cssproperty --mdc-chip-enabled-outline-color
 * @cssproperty --mdc-chip-icon-size
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/chips/overview
 */
@customElement('mdc-chip')
export class MDCChip extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IChip {

    static override styles = ChipStyles

    @property({ type: String, reflect: true })
    public variant: ChipVariant = 'assist'

    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @state()
    public hasIcon: boolean = false

    @state()
    public hasAvatar: boolean = false

    @state()
    public hasTrailingIcon: boolean = false

    @state()
    public hasLabel: boolean = false

    @query('.container')
    protected readonly chipElement!: HTMLDivElement | null

    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly assignedIcons!: HTMLElement[]

    @queryAssignedElements({ slot: 'avatar', flatten: true })
    private readonly assignedAvatars!: HTMLElement[]

    @queryAssignedElements({ slot: 'trailing-icon', flatten: true })
    private readonly assignedTrailingIcons!: HTMLElement[]

    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]

    @state()
    private animState: '' | 'selecting' | 'deselecting' = ''

    public override get rippleControl(): HTMLElement | null {
        return this.chipElement
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.chipElement
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick)
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('selected')) {
            const prevSelected = changedProperties.get('selected') as boolean | undefined
            if (prevSelected === false && this.selected) {
                this.animState = 'selecting'
            } else if (prevSelected === true && !this.selected) {
                this.animState = 'deselecting'
            } else {
                this.animState = ''
            }
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            'selected': this.selected,
            'unselected': !this.selected,
            'has-icon': this.hasIcon,
            'has-avatar': this.hasAvatar,
            'has-trailing-icon': this.hasTrailingIcon,
            'has-label': this.hasLabel,
            'selecting': this.animState === 'selecting',
            'deselecting': this.animState === 'deselecting',
            'disabled': this.disabled,
        })
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="${this.variant === 'filter' ? 'checkbox' : nothing}"
                aria-checked="${this.variant === 'filter' ? String(this.selected) : nothing}"
                aria-disabled="${this.disabled ? 'true' : nothing}"
                aria-label=${ariaLabel || nothing}
                tabindex=${this.disabled ? -1 : 0}
            >
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                ${this.renderLeading()}
                ${this.renderLabel()}
                ${this.renderTrailing()}
                ${this.renderTouchTarget()}
            </div>
        `
    }

    protected renderLeading(): TemplateResult {
        return html`
            <span class="leading" aria-hidden="true">
                ${this.renderIcon()}
                ${this.renderAvatar()}
                ${this.renderCheckmark()}
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

    protected renderAvatar(): TemplateResult {
        return html`
            <span class="avatar">
                <slot name="avatar" @slotchange=${this.handleAvatarSlotChange}></slot>
            </span>
        `
    }

    protected renderCheckmark(): TemplateResult {
        if (this.variant !== 'filter') {
            return html``
        }
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

    protected renderTrailing(): TemplateResult {
        if (this.variant !== 'input') {
            return html``
        }
        return html`
            <span class="trailing-icon">
                <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </slot>
            </span>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    public override focus(): void {
        this.chipElement?.focus()
    }
    public override blur(): void {
        this.chipElement?.blur()
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disabled) {
            return
        }

        // Toggle selection for filter/input variants
        if (this.variant === 'filter' || this.variant === 'input') {
            this.selected = !this.selected
            this.dispatchEvent(new CustomEvent<IChipToggleEventDetail>(
                CHIP_TOGGLE_EVENT,
                {
                    detail: { selected: this.selected, chip: this },
                    bubbles: true,
                    composed: true,
                }
            ))
        } else {
            // Assist/suggestion variants
            this.dispatchEvent(new CustomEvent<IChipNavigateEventDetail>(
                CHIP_NAVIGATE_EVENT,
                {
                    detail: { chip: this },
                    bubbles: true,
                    composed: true,
                }
            ))
        }
    }

    private readonly handleTrailingIconClick = (event: MouseEvent): void => {
        event.stopPropagation()
        if (this.disabled) {
            return
        }
        this.dispatchEvent(new CustomEvent<IChipCloseEventDetail>(
            CHIP_CLOSE_EVENT,
            {
                detail: { chip: this },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private readonly handleIconSlotChange = (): void => {
        this.hasIcon = this.assignedIcons.length > 0
    }

    private readonly handleAvatarSlotChange = (): void => {
        this.hasAvatar = this.assignedAvatars.length > 0
    }

    private readonly handleTrailingIconSlotChange = (): void => {
        this.hasTrailingIcon = this.assignedTrailingIcons.length > 0
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
