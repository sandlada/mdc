/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
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
 * @slot selected-icon - Custom checkmark icon when selected (filter variant).
 *
 * @fires chip-toggle - Dispatched when selection changes (filter/input).
 * @fires chip-navigate - Dispatched on assist/suggestion click.
 * @fires chip-close - Dispatched when close icon is clicked (input).
 * @fires update-focus - Dispatched when `disabled` is toggled (bubbles).
 *
 * @cssproperty --mdc-chip-enabled-container-color
 * @cssproperty --mdc-chip-container-shape-start-start
 * @cssproperty --mdc-chip-container-shape-start-end
 * @cssproperty --mdc-chip-container-shape-end-start
 * @cssproperty --mdc-chip-container-shape-end-end
 * @cssproperty --mdc-chip-enabled-label-color
 * @cssproperty --mdc-chip-enabled-outline-color
 * @cssproperty --mdc-chip-icon-size
 * @cssproperty --mdc-chip-enabled-container-color-elevated
 * @cssproperty --mdc-chip-enabled-container-elevation
 * @cssproperty --mdc-chip-enabled-container-shadow-color
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
    mixinElevationOptions,
    mixinFocusRingOptions
)(LitElement) implements IChip {

    static override styles = ChipStyles

    @property({ type: String, reflect: true })
    public variant: ChipVariant = 'assist'

    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: Boolean, attribute: 'soft-disabled', reflect: true })
    public softDisabled: boolean = false

    @property({ type: Boolean, attribute: 'always-focusable', reflect: true })
    public alwaysFocusable: boolean = false

    @property({ type: Boolean, reflect: true })
    public elevated: boolean = false

    @property({ type: String, reflect: true })
    public href: string = ''

    @property({ type: String, reflect: true })
    public target: string = ''

    @property({ type: String, reflect: true })
    public label: string = ''

    @property({ type: String, attribute: 'aria-label-remove', reflect: true })
    public ariaLabelRemove: string = ''

    @property({ type: Boolean, attribute: 'remove-only', reflect: true })
    public removeOnly: boolean = false

    @property({ type: Number })
    public chipTabIndex: number = 0

    @state()
    public hasIcon: boolean = false

    @state()
    public hasAvatar: boolean = false

    @state()
    public hasTrailingIcon: boolean = false

    @state()
    public hasSelectedIcon: boolean = false

    @state()
    public hasLabel: boolean = false

    @query('.container')
    protected readonly chipElement!: HTMLElement | null

    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly assignedIcons!: HTMLElement[]

    @queryAssignedElements({ slot: 'avatar', flatten: true })
    private readonly assignedAvatars!: HTMLElement[]

    @queryAssignedElements({ slot: 'trailing-icon', flatten: true })
    private readonly assignedTrailingIcons!: HTMLElement[]

    @queryAssignedElements({ slot: 'selected-icon', flatten: true })
    private readonly assignedSelectedIcons!: HTMLElement[]

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

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        // Notify the parent `mdc-chip-set` to recompute roving tabindex.
        if (changedProperties.has('disabled') && changedProperties.get('disabled') !== undefined) {
            this.dispatchEvent(new Event('update-focus', { bubbles: true }))
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            'selected': this.selected,
            'unselected': !this.selected,
            'elevated': this.elevated,
            'soft-disabled': this.softDisabled,
            'remove-only': this.removeOnly,
            'has-icon': this.hasIcon,
            'has-avatar': this.hasAvatar,
            'has-trailing-icon': this.hasTrailingIcon || this.removeOnly,
            'has-selected-icon': this.hasSelectedIcon,
            'has-label': this.hasLabel,
            'selecting': this.animState === 'selecting',
            'deselecting': this.animState === 'deselecting',
            'disabled': this.disabled,
        })
    }

    protected getRole(): 'checkbox' | 'button' | 'link' {
        switch (this.variant) {
            case 'filter':
                return 'checkbox'
            case 'input':
                return 'button'
            default:
                return this.href ? 'link' : 'button'
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const tabIndex = this.disabled && !this.alwaysFocusable ? -1 : this.chipTabIndex
        const role = this.getRole()
        const content = html`
            ${this.elevated ? this.renderElevation() : nothing}
            ${this.renderFocusRing()}
            ${this.renderRipple()}
            ${this.renderLeading()}
            ${this.renderLabel()}
            ${this.renderTrailing()}
            ${this.renderTouchTarget()}
        `
        if (this.href) {
            return html`
                <a
                    class="${classMap(this.getRenderClasses())}"
                    role="${role}"
                    href=${this.href}
                    target=${this.target || nothing}
                    aria-label=${this.label || ariaLabel || nothing}
                    aria-disabled=${this.disabled || this.softDisabled ? 'true' : nothing}
                    tabindex=${tabIndex}
                    @click=${this.handleClick}
                    @keydown=${this.handleKeydown}
                >${content}</a>
            `
        }
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="${role}"
                aria-checked=${this.variant === 'filter' ? String(this.selected) : nothing}
                aria-pressed=${this.variant === 'input' ? String(this.selected) : nothing}
                aria-label=${this.label || ariaLabel || nothing}
                aria-disabled=${this.disabled || this.softDisabled ? 'true' : nothing}
                tabindex=${tabIndex}
                @click=${this.handleClick}
                @keydown=${this.handleKeydown}
            >${content}</div>
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
            <span class="checkmark">
                <slot name="selected-icon" @slotchange=${this.handleSelectedIconSlotChange}>
                    <svg class="checkmark-path" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                            fill="none"
                            d="M1.73,12.91 8.1,19.28 22.79,4.59"
                        ></path>
                    </svg>
                </slot>
            </span>
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
            <button
                type="button"
                class="trailing-icon"
                aria-label=${this.ariaLabelRemove || nothing}
                ?disabled=${this.disabled || this.softDisabled}
                @click=${this.handleTrailingIconClick}
            >
                <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </slot>
            </button>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    public override focus(): void {
        if (this.disabled && !this.alwaysFocusable) {
            return
        }
        this.chipElement?.focus()
    }
    public override blur(): void {
        this.chipElement?.blur()
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disabled || this.softDisabled) {
            event.preventDefault()
            return
        }
        if (this.removeOnly) {
            // removeOnly: the primary surface is inert, only the remove button acts.
            return
        }
        this.activate()
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        // Only respond to keys pressed on the primary surface itself, so the
        // trailing remove button's keys are ignored and arrow keys bubble up
        // to a parent `mdc-chip-set`.
        if (event.target !== this.chipElement) {
            return
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (this.removeOnly) {
                // removeOnly: the primary surface is inert, only the remove
                // button acts (matches the click path).
                return
            }
            this.activate()
        }
    }

    private activate(): void {
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
        if (this.disabled || this.softDisabled) {
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

    private readonly handleSelectedIconSlotChange = (): void => {
        this.hasSelectedIcon = this.assignedSelectedIcons.length > 0
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
