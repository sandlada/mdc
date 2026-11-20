/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import '../../icon/icon'
import '../../ripple/ripple'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import { AvatarAutoColorPaletteCount } from '../avatar.definition'
import {
    AvatarClickEvent,
    AvatarErrorEvent,
    AvatarLoadEvent,
    type AvatarBadgePlacement,
    type AvatarImageLoading,
    type AvatarShape,
    type AvatarSize,
    type AvatarVariant,
    type IMDCAvatar,
    type IMDCAvatarClickEventDetail,
    type IMDCAvatarImageEventDetail,
} from '../avatar.interface'
import { AvatarStyles } from '../avatar.style'
import { extractAvatarInitials, resolveAvatarPaletteIndex } from './avatar-initials'

type AvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

export abstract class BaseAvatar extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCAvatar {

    public static override styles = AvatarStyles

    @property({ type: String, reflect: true })
    public size: AvatarSize = 'medium'

    @property({ type: String, reflect: true })
    public shape: AvatarShape = 'round'

    @property({ type: String, reflect: true })
    public variant: AvatarVariant = 'tonal'

    @property({ type: String, reflect: true })
    public src: string = ''

    @property({ type: String, reflect: true })
    public alt: string = ''

    @property({ type: String, reflect: true })
    public name: string = ''

    @property({ type: String, reflect: true })
    public initials: string = ''

    @property({ type: Number, attribute: 'max-initials', reflect: true })
    public maxInitials: number = 2

    @property({ type: String, reflect: true })
    public icon: string = ''

    @property({ type: Boolean, attribute: 'auto-color', reflect: true })
    public autoColor: boolean = false

    @property({ type: String, attribute: 'color-seed', reflect: true })
    public colorSeed: string = ''

    @property({ type: Boolean, reflect: true })
    public clickable: boolean = false

    @property({ type: String, reflect: true })
    public href: string = ''

    @property({ type: String, reflect: true })
    public target: string = ''

    @property({ type: String, reflect: true })
    public rel: string = ''

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: String, reflect: true })
    public loading: AvatarImageLoading = 'eager'

    @property({ type: String, attribute: 'badge-placement', reflect: true })
    public badgePlacement: AvatarBadgePlacement = 'bottom-end'

    @state()
    protected imageStatus: AvatarImageStatus = 'idle'

    @state()
    private hasBadgeSlot: boolean = false

    @state()
    private hasIconSlot: boolean = false

    @state()
    private hasDefaultSlot: boolean = false

    @query('#container')
    protected readonly containerElement!: HTMLElement | null

    @queryAssignedElements({ slot: 'badge', flatten: true })
    private readonly badgeElements!: HTMLElement[]

    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly iconSlotElements!: HTMLElement[]

    @queryAssignedElements({ flatten: true })
    private readonly defaultSlotElements!: HTMLElement[]

    public override get rippleControl(): HTMLElement | null {
        return this.isInteractive ? this.containerElement : null
    }

    public override get focusRingControl(): HTMLElement | null {
        return this.isInteractive ? this.containerElement : null
    }

    public get resolvedInitials(): string {
        const explicit = this.initials.trim()
        if (explicit) return explicit
        if (!this.name.trim()) return ''
        const safeMax = Number.isInteger(this.maxInitials) && this.maxInitials >= 1 ? this.maxInitials : 2
        return extractAvatarInitials(safeMax)(this.name)
    }

    public get paletteIndex(): number | null {
        if (!this.autoColor) return null
        const seed = this.colorSeed.trim() || this.name.trim() || this.initials.trim() || this.alt.trim()
        return resolveAvatarPaletteIndex(AvatarAutoColorPaletteCount)(seed)
    }

    protected get isInteractive(): boolean {
        return Boolean(this.href.trim()) || this.clickable
    }

    protected get shouldRenderImage(): boolean {
        return Boolean(this.src.trim()) && this.imageStatus !== 'error'
    }

    protected get effectiveAriaLabel(): string {
        return this.ariaLabel || this.alt.trim() || this.name.trim() || this.initials.trim()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('src')) {
            this.imageStatus = this.src.trim() ? 'loading' : 'idle'
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        const idx = this.paletteIndex
        return {
            container: true,
            interactive: this.isInteractive && !this.disabled,
            [`palette-${idx ?? 0}`]: idx !== null && !this.shouldRenderImage,
        }
    }

    private handleImageLoad(): void {
        this.imageStatus = 'loaded'
        this.dispatchEvent(new CustomEvent<IMDCAvatarImageEventDetail>(AvatarLoadEvent, {
            detail: { src: this.src },
            bubbles: true,
            composed: true,
        }))
    }

    private handleImageError(): void {
        this.imageStatus = 'error'
        this.dispatchEvent(new CustomEvent<IMDCAvatarImageEventDetail>(AvatarErrorEvent, {
            detail: { src: this.src },
            bubbles: true,
            composed: true,
        }))
    }

    private handleContainerClick(event: MouseEvent): void {
        if (this.disabled) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (!this.isInteractive) return

        this.dispatchEvent(new CustomEvent<IMDCAvatarClickEventDetail>(AvatarClickEvent, {
            detail: { avatar: this },
            bubbles: true,
            composed: true,
        }))
    }

    private handleBadgeSlotChange(): void {
        this.hasBadgeSlot = this.badgeElements.length > 0
    }

    private handleIconSlotChange(): void {
        this.hasIconSlot = this.iconSlotElements.length > 0
    }

    private handleDefaultSlotChange(): void {
        this.hasDefaultSlot = this.defaultSlotElements.length > 0
    }

    protected renderFallbackContent(): TemplateResult {
        const initials = this.resolvedInitials
        if (initials) {
            return html`<span class="initials" part="initials" aria-hidden="true">${initials}</span>`
        }

        if (this.hasDefaultSlot) {
            return html`<slot @slotchange=${this.handleDefaultSlotChange}></slot>`
        }

        if (this.hasIconSlot) {
            return html`<slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>`
        }

        const iconName = this.icon.trim() || 'person'
        return html`
            <slot name="icon" @slotchange=${this.handleIconSlotChange}>
                <mdc-icon class="fallback-icon" part="icon" name=${iconName} aria-hidden="true"></mdc-icon>
            </slot>
            <slot @slotchange=${this.handleDefaultSlotChange}></slot>
        `
    }

    protected renderContent(): TemplateResult {
        const showFallback = !this.shouldRenderImage || this.imageStatus !== 'loaded'

        return html`
            ${this.isInteractive && !this.disabled ? this.renderRipple() : nothing}
            ${this.isInteractive && !this.disabled ? this.renderFocusRing() : nothing}
            ${this.shouldRenderImage ? html`
                <img
                    class=${classMap({
                        image: true,
                        loading: this.imageStatus !== 'loaded',
                    })}
                    part="image"
                    src=${this.src}
                    alt=${this.alt || this.name || ''}
                    loading=${this.loading}
                    @load=${this.handleImageLoad}
                    @error=${this.handleImageError}
                />
            ` : nothing}
            ${showFallback ? this.renderFallbackContent() : nothing}
        `
    }

    protected override render(): TemplateResult {
        const classes = classMap(this.getRenderClasses())
        const label = this.effectiveAriaLabel || nothing
        const content = this.renderContent()
        const badgeLayer = html`
            <span class="badge" part="badge" ?hidden=${!this.hasBadgeSlot}>
                <slot name="badge" @slotchange=${this.handleBadgeSlotChange}></slot>
            </span>
        `

        if (this.href.trim()) {
            const safeRel = this.rel.trim() || (this.target === '_blank' ? 'noopener noreferrer' : nothing)
            return html`
                <a
                    id="container"
                    part="container"
                    class=${classes}
                    href=${this.disabled ? nothing : this.href}
                    target=${this.target || nothing}
                    rel=${safeRel}
                    aria-label=${label}
                    aria-disabled=${this.disabled ? 'true' : nothing}
                    tabindex=${this.disabled ? '-1' : '0'}
                    @click=${this.handleContainerClick}
                >${content}</a>
                ${badgeLayer}
            `
        }

        if (this.clickable) {
            return html`
                <button
                    id="container"
                    part="container"
                    type="button"
                    class=${classes}
                    ?disabled=${this.disabled}
                    aria-label=${label}
                    @click=${this.handleContainerClick}
                >${content}</button>
                ${badgeLayer}
            `
        }

        return html`
            <div
                id="container"
                part="container"
                class=${classes}
                role="img"
                aria-label=${label}
            >${content}</div>
            ${badgeLayer}
        `
    }

    public override focus(options?: FocusOptions): void {
        if (!isServer && this.isInteractive && !this.disabled) {
            this.containerElement?.focus(options)
            return
        }
        super.focus(options)
    }
}
