/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-chip` implementing Material Design 3
 * Assist, Filter, Input, and Suggestion chips.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { OpacityTransitionController } from '../../../utils/controller'
import '../../elevation/elevation'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import '../../focus-ring/focus-ring'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import '../../ripple/ripple'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    ChipCloseEvent,
    ChipNavigateEvent,
    ChipToggleEvent,
    ChipVariant,
    type IMDCChip,
    type IMDCChipCloseEventDetail,
    type IMDCChipNavigateEventDetail,
    type IMDCChipToggleEventDetail,
} from '../chip.interface'
import { ChipStyles } from '../chip.style'

const ValidVariants = new Set<string>(Object.values(ChipVariant))

export abstract class BaseChip extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCChip {

    static override styles = ChipStyles

    @property({ type: String, reflect: true })
    public variant: ChipVariant = ChipVariant.Assist

    @property({ type: Boolean, reflect: true })
    public selected = false

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: Boolean, attribute: 'soft-disabled', reflect: true })
    public softDisabled = false

    @property({ type: Boolean, attribute: 'always-focusable', reflect: true })
    public alwaysFocusable = false

    @property({ type: Boolean, reflect: true })
    public elevated = false

    @property({ type: String, reflect: true })
    public href = ''

    @property({ type: String, reflect: true })
    public target = ''

    @property({ type: String, reflect: true })
    public label = ''

    @property({ type: String, reflect: true })
    public value = ''

    @property({ type: Boolean, reflect: true })
    public avatar = false

    @property({ type: String, attribute: 'aria-label-remove', reflect: true })
    public ariaLabelRemove = ''

    @property({ type: Boolean, attribute: 'remove-only', reflect: true })
    public removeOnly = false

    @property({ type: Boolean, attribute: 'no-remove', reflect: true })
    public noRemove = false

    @property({ type: Boolean, attribute: 'hide-checkmark', reflect: true })
    public hideCheckmark = false

    @property({ type: Number })
    public chipTabIndex = 0

    @state()
    public hasIcon = false

    @state()
    private hasAssignedAvatar = false

    @state()
    public hasTrailingIcon = false

    @state()
    public hasSelectedIcon = false

    @state()
    private hasSlottedLabel = false

    @state()
    private slottedText = ''

    @state()
    private animState: '' | 'selecting' | 'deselecting' = ''

    @query('.container')
    protected readonly containerElement!: HTMLElement | null

    @query('.primary-action')
    protected readonly primaryActionElement!: HTMLElement | null

    @query('.trailing-action')
    protected readonly trailingActionElement!: HTMLButtonElement | null

    @query('.leading')
    protected readonly leadingElement!: HTMLElement | null

    @query('.icon')
    protected readonly iconElement!: HTMLElement | null

    @query('.checkmark')
    protected readonly checkmarkElement!: HTMLElement | null

    @query('.static-trailing-icon')
    protected readonly staticTrailingIconElement!: HTMLElement | null

    @query('.trailing-icon')
    protected readonly removeIconElement!: HTMLElement | null

    private suppressIconOpacity = false

    protected readonly iconOpacityController = new OpacityTransitionController(this, {
        target: () => this.opacityTargetForIcon,
        duration: 200,
    })

    protected readonly checkmarkOpacityController = new OpacityTransitionController(this, {
        target: () => this.opacityTargetForCheckmark,
        duration: 200,
    })

    protected readonly trailingIconOpacityController = new OpacityTransitionController(this, {
        target: () => this.opacityTargetForTrailingIcon,
        duration: 200,
    })

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

    public get hasAvatar(): boolean {
        return this.hasAssignedAvatar || (this.avatar && this.hasIcon)
    }

    public get hasLabel(): boolean {
        return this.hasSlottedLabel || Boolean(this.label)
    }

    public get effectiveLabel(): string {
        return this.slottedText || this.label
    }

    public get resolvedValue(): string {
        return this.value || this.effectiveLabel
    }

    protected get normalizedVariant(): ChipVariant {
        return ValidVariants.has(this.variant) ? this.variant : ChipVariant.Assist
    }

    protected get hasTrailingRemoveAction(): boolean {
        return this.normalizedVariant === ChipVariant.Input && (!this.noRemove || this.removeOnly)
    }

    protected get showFilterCheckmark(): boolean {
        return this.normalizedVariant === ChipVariant.Filter && this.selected && !this.hideCheckmark
    }

    private isReducedMotion(): boolean {
        return typeof window !== 'undefined' &&
            Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    }

    private get opacityTargetForIcon(): HTMLElement | null {
        if (!this.hasUpdated) {
            return this.iconElement
        }
        if (this.suppressIconOpacity || this.isReducedMotion()) {
            return null
        }
        if (!this.hasIcon || this.hasAvatar || this.showFilterCheckmark) {
            return null
        }
        return this.iconElement
    }

    private get opacityTargetForCheckmark(): HTMLElement | null {
        if (!this.hasUpdated) {
            return this.checkmarkElement
        }
        if (this.suppressIconOpacity || this.isReducedMotion()) {
            return null
        }
        if (!this.showFilterCheckmark || this.animState === 'deselecting') {
            return null
        }
        return this.checkmarkElement
    }

    private get opacityTargetForTrailingIcon(): HTMLElement | null {
        if (!this.hasUpdated) {
            return this.hasTrailingRemoveAction ? this.removeIconElement : this.staticTrailingIconElement
        }
        if (this.suppressIconOpacity || this.isReducedMotion()) {
            return null
        }
        if (this.hasTrailingRemoveAction) {
            return this.removeIconElement
        }
        return this.hasTrailingIcon ? this.staticTrailingIconElement : null
    }

    public override get rippleControl(): HTMLElement | null {
        if (this.hasTrailingRemoveAction) {
            return this.removeOnly ? null : this.primaryActionElement
        }
        return this.containerElement
    }

    public override get focusRingControl(): HTMLElement | null {
        if (this.hasTrailingRemoveAction) {
            return this.removeOnly ? null : this.primaryActionElement
        }
        return this.containerElement
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        const changed = changedProperties as Map<PropertyKey, unknown>
        const hasIconTransitionChange =
            changed.has('selected') ||
            changed.has('variant') ||
            changed.has('hasIcon') ||
            changed.has('hasAvatar') ||
            changed.has('hasAssignedAvatar') ||
            changed.has('avatar') ||
            changed.has('hasTrailingIcon') ||
            changed.has('hasSelectedIcon') ||
            changed.has('hideCheckmark') ||
            changed.has('noRemove') ||
            changed.has('removeOnly')

        this.suppressIconOpacity = !hasIconTransitionChange

        if (changedProperties.has('selected')) {
            const prevSelected = changedProperties.get('selected') as boolean | undefined
            const canAnimateFilter =
                !this.isReducedMotion() &&
                this.normalizedVariant === ChipVariant.Filter &&
                !this.hideCheckmark &&
                !this.hasAvatar
            if (canAnimateFilter && prevSelected === false && this.selected) {
                this.animState = 'selecting'
            } else if (canAnimateFilter && prevSelected === true && !this.selected && !this.hasIcon) {
                this.animState = 'deselecting'
            } else {
                this.animState = ''
            }
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (!isServer && this.suppressIconOpacity) {
            queueMicrotask(() => {
                this.suppressIconOpacity = false
            })
        }

        if (
            !isServer &&
            (changedProperties.has('disabled') ||
                changedProperties.has('alwaysFocusable') ||
                changedProperties.has('softDisabled')) &&
            (changedProperties.get('disabled') !== undefined ||
                changedProperties.get('alwaysFocusable') !== undefined ||
                changedProperties.get('softDisabled') !== undefined)
        ) {
            this.dispatchEvent(new Event('update-focus', { bubbles: true }))
        }
    }

    public close(): void {
        if (this.disabled || this.softDisabled) {
            return
        }
        this.dispatchEvent(new CustomEvent<IMDCChipCloseEventDetail>(
            ChipCloseEvent,
            {
                detail: { chip: this },
                bubbles: true,
                composed: true,
            }
        ))
    }

    public override focus(): void {
        if (this.disabled && !this.alwaysFocusable) {
            return
        }
        if (this.hasTrailingRemoveAction) {
            if (this.removeOnly) {
                this.trailingActionElement?.focus()
            } else {
                this.primaryActionElement?.focus()
            }
            return
        }
        this.containerElement?.focus()
    }

    public override blur(): void {
        if (this.hasTrailingRemoveAction) {
            this.primaryActionElement?.blur()
            this.trailingActionElement?.blur()
            return
        }
        this.containerElement?.blur()
    }

    protected getRole(): 'checkbox' | 'button' | 'link' {
        switch (this.normalizedVariant) {
            case ChipVariant.Filter:
                return 'checkbox'
            case ChipVariant.Input:
                return this.href ? 'link' : 'button'
            default:
                return this.href ? 'link' : 'button'
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        const variant = this.normalizedVariant
        const hasTrailingAction = this.hasTrailingRemoveAction
        const showCheckmark = this.showFilterCheckmark
        const hasVisibleLeading = !this.hasAvatar && ((this.hasIcon && !showCheckmark) || showCheckmark)

        return {
            'container': true,
            [variant]: true,
            'selected': this.selected,
            'unselected': !this.selected,
            'elevated': this.elevated,
            'soft-disabled': this.softDisabled,
            'disabled': this.disabled,
            'remove-only': this.removeOnly,
            'hide-checkmark': this.hideCheckmark,
            'has-icon': this.hasIcon,
            'has-avatar': this.hasAvatar,
            'has-leading': hasVisibleLeading,
            'has-trailing': !hasTrailingAction && this.hasTrailingIcon,
            'has-trailing-action': hasTrailingAction,
            'has-selected-icon': this.hasSelectedIcon,
            'has-label': this.hasLabel,
            'selecting': this.animState === 'selecting',
            'deselecting': this.animState === 'deselecting',
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const variant = this.normalizedVariant
        const isDisabledAndInert = this.disabled && !this.alwaysFocusable
        const isSoftOrAlwaysFocusableDisabled = (this.disabled || this.softDisabled) && !isDisabledAndInert
        const primaryTabIndex = isDisabledAndInert ? -1 : this.chipTabIndex
        const role = this.getRole()
        const resolvedAriaLabel = ariaLabel || (!this.hasSlottedLabel && this.label ? this.label : undefined)
        const classes = classMap(this.getRenderClasses())

        if (this.hasTrailingRemoveAction) {
            return this.renderSplitContainer(
                classes,
                role,
                primaryTabIndex,
                isDisabledAndInert,
                isSoftOrAlwaysFocusableDisabled,
                resolvedAriaLabel,
            )
        }

        const inner = html`
            <span class="background" aria-hidden="true"></span>
            <span class="outline" aria-hidden="true"></span>
            ${this.elevated ? this.renderElevation() : nothing}
            ${this.renderRipple()}
            ${this.renderFocusRing()}
            ${this.renderLeading()}
            ${this.renderLabel()}
            ${this.renderStaticTrailing()}
            ${this.renderTouchTarget()}
        `

        if (this.href) {
            return html`
                <a
                    class=${classes}
                    role="link"
                    href=${isDisabledAndInert ? nothing : this.href}
                    target=${this.target || nothing}
                    aria-label=${resolvedAriaLabel || nothing}
                    aria-disabled=${this.disabled || this.softDisabled ? 'true' : nothing}
                    tabindex=${primaryTabIndex}
                    @click=${this.handlePrimaryClick}
                    @keydown=${this.handlePrimaryKeydown}
                >${inner}</a>
            `
        }

        return html`
            <button
                type="button"
                class=${classes}
                role=${role}
                aria-checked=${variant === ChipVariant.Filter ? String(this.selected) : nothing}
                aria-pressed=${variant === ChipVariant.Input ? String(this.selected) : nothing}
                aria-label=${resolvedAriaLabel || nothing}
                aria-disabled=${isSoftOrAlwaysFocusableDisabled ? 'true' : nothing}
                ?disabled=${isDisabledAndInert}
                tabindex=${primaryTabIndex}
                @click=${this.handlePrimaryClick}
                @keydown=${this.handlePrimaryKeydown}
            >${inner}</button>
        `
    }

    private renderSplitContainer(
        classes: ReturnType<typeof classMap>,
        role: 'checkbox' | 'button' | 'link',
        primaryTabIndex: number,
        isDisabledAndInert: boolean,
        isSoftOrAlwaysFocusableDisabled: boolean,
        resolvedAriaLabel: string | undefined,
    ): TemplateResult {
        const removeTabIndex = isDisabledAndInert ? -1 : (this.removeOnly ? this.chipTabIndex : 0)
        const removeAriaLabel =
            this.ariaLabelRemove ||
            (this.effectiveLabel ? `Remove ${this.effectiveLabel}` : 'Remove')

        let primaryTemplate: TemplateResult
        if (this.removeOnly) {
            primaryTemplate = html`
                <span class="primary-content">
                    ${this.renderLeading()}
                    ${this.renderLabel()}
                </span>
            `
        } else if (this.href) {
            primaryTemplate = html`
                <a
                    class="primary-action"
                    role="link"
                    href=${isDisabledAndInert ? nothing : this.href}
                    target=${this.target || nothing}
                    aria-label=${resolvedAriaLabel || nothing}
                    aria-disabled=${this.disabled || this.softDisabled ? 'true' : nothing}
                    tabindex=${primaryTabIndex}
                    @click=${this.handlePrimaryClick}
                    @keydown=${this.handlePrimaryKeydown}
                >
                    ${this.renderLeading()}
                    ${this.renderLabel()}
                    ${this.renderTouchTarget()}
                </a>
            `
        } else {
            primaryTemplate = html`
                <button
                    type="button"
                    class="primary-action"
                    role=${role}
                    aria-pressed=${String(this.selected)}
                    aria-label=${resolvedAriaLabel || nothing}
                    aria-disabled=${isSoftOrAlwaysFocusableDisabled ? 'true' : nothing}
                    ?disabled=${isDisabledAndInert}
                    tabindex=${primaryTabIndex}
                    @click=${this.handlePrimaryClick}
                    @keydown=${this.handlePrimaryKeydown}
                >
                    ${this.renderLeading()}
                    ${this.renderLabel()}
                    ${this.renderTouchTarget()}
                </button>
            `
        }

        return html`
            <div class=${classes}>
                <span class="background" aria-hidden="true"></span>
                <span class="outline" aria-hidden="true"></span>
                ${this.elevated ? this.renderElevation() : nothing}
                ${this.removeOnly ? nothing : this.renderRipple()}
                ${this.removeOnly ? nothing : this.renderFocusRing()}
                ${primaryTemplate}
                <button
                    type="button"
                    class="trailing-action"
                    aria-label=${removeAriaLabel}
                    aria-disabled=${isSoftOrAlwaysFocusableDisabled ? 'true' : nothing}
                    ?disabled=${isDisabledAndInert}
                    tabindex=${removeTabIndex}
                    @click=${this.handleTrailingActionClick}
                    @keydown=${this.handleTrailingKeydown}
                >
                    <mdc-ripple ?disabled=${this.disabled || this.softDisabled || this.disableRipple}></mdc-ripple>
                    <mdc-focus-ring ?disabled=${isDisabledAndInert || this.focusRingDisabled}></mdc-focus-ring>
                    <span class="trailing-icon" aria-hidden="true">
                        <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </slot>
                    </span>
                    <span class="trailing-touch-target" aria-hidden="true"></span>
                </button>
            </div>
        `
    }

    protected renderLeading(): TemplateResult {
        const useIconSlotForAvatar = this.avatar && !this.hasAssignedAvatar
        return html`
            <span class="leading" aria-hidden="true" @animationend=${this.handleCheckmarkAnimationEnd}>
                ${useIconSlotForAvatar ? nothing : this.renderIcon()}
                ${this.renderAvatar(useIconSlotForAvatar)}
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

    protected renderAvatar(useIconSlot = false): TemplateResult {
        return html`
            <span class="avatar">
                ${useIconSlot
                    ? html`<slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>`
                    : html`<slot name="avatar" @slotchange=${this.handleAvatarSlotChange}></slot>`
                }
                <span class="avatar-checkmark">
                    <svg class="avatar-checkmark-svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4.5 12.5L9.5 17.5L19.5 7.5"></path>
                    </svg>
                </span>
            </span>
        `
    }

    protected renderCheckmark(): TemplateResult {
        if (this.normalizedVariant !== ChipVariant.Filter) {
            return html``
        }
        return html`
            <span class="checkmark">
                <slot name="selected-icon" @slotchange=${this.handleSelectedIconSlotChange}>
                    <svg class="checkmark-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                            class="checkmark-path"
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
                <slot @slotchange=${this.handleLabelSlotChange}>${this.label}</slot>
            </span>
        `
    }

    protected renderStaticTrailing(): TemplateResult {
        return html`
            <span class="static-trailing-icon" aria-hidden="true">
                <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}></slot>
            </span>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    private readonly handlePrimaryClick = (event: MouseEvent): void => {
        if (this.disabled || this.softDisabled) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (this.removeOnly) {
            return
        }
        this.activate()
    }

    private readonly handlePrimaryKeydown = (event: KeyboardEvent): void => {
        if (this.disabled || this.softDisabled) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
            }
            return
        }

        if (this.hasTrailingRemoveAction && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault()
            this.close()
        }
    }

    private readonly handleTrailingActionClick = (event: MouseEvent): void => {
        event.stopPropagation()
        if (this.disabled || this.softDisabled) {
            event.preventDefault()
            return
        }
        this.close()
    }

    private readonly handleTrailingKeydown = (event: KeyboardEvent): void => {
        if (this.disabled || this.softDisabled) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
            }
            return
        }

        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault()
            this.close()
        }
    }

    private activate(): void {
        const variant = this.normalizedVariant
        if (variant === ChipVariant.Filter || variant === ChipVariant.Input) {
            this.selected = !this.selected
            this.dispatchEvent(new CustomEvent<IMDCChipToggleEventDetail>(
                ChipToggleEvent,
                {
                    detail: { selected: this.selected, chip: this },
                    bubbles: true,
                    composed: true,
                }
            ))
            return
        }

        this.dispatchEvent(new CustomEvent<IMDCChipNavigateEventDetail>(
            ChipNavigateEvent,
            {
                detail: { chip: this },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private readonly handleCheckmarkAnimationEnd = (event: AnimationEvent): void => {
        if (this.animState === 'deselecting' && event.animationName === 'chip-checkmark-collapse') {
            this.animState = ''
            return
        }
        if (this.animState === 'selecting') {
            if (this.hasSelectedIcon && event.animationName === 'chip-checkmark-expand') {
                this.animState = ''
            } else if (!this.hasSelectedIcon && event.animationName === 'chip-checkmark-draw-in') {
                this.animState = ''
            }
        }
    }

    private readonly handleIconSlotChange = (): void => {
        this.hasIcon = this.assignedIcons.length > 0
    }

    private readonly handleAvatarSlotChange = (): void => {
        this.hasAssignedAvatar = this.assignedAvatars.length > 0
    }

    private readonly handleTrailingIconSlotChange = (): void => {
        this.hasTrailingIcon = this.assignedTrailingIcons.length > 0
    }

    private readonly handleSelectedIconSlotChange = (): void => {
        this.hasSelectedIcon = this.assignedSelectedIcons.length > 0
    }

    private readonly handleLabelSlotChange = (): void => {
        let hasLabel = false
        let text = ''
        for (const node of this.assignedDefaultNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const value = (node as Text).wholeText.trim()
                if (value) {
                    hasLabel = true
                    text += (text ? ' ' : '') + value
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                hasLabel = true
                const value = (node.textContent ?? '').trim()
                if (value) {
                    text += (text ? ' ' : '') + value
                }
            }
        }
        this.hasSlottedLabel = hasLabel
        this.slottedText = text.trim()
    }
}
