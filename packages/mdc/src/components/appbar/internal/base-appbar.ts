/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import {
    AppBarAlignment,
    AppBarVariant,
    type IAppBar,
} from '../appbar.interface'

/**
 * Base app bar class providing structure, slots, and scroll tracking.
 *
 * Implements Material Design 3 and MD3 Expressive app bar specifications:
 * - Small
 * - Center-aligned
 * - Medium flexible
 * - Large flexible
 * - Search app bar
 */
export abstract class BaseAppBar extends composeMixin(
    mixinElementInternals,
    mixinElevationOptions,
)(LitElement) implements IAppBar {

    @property({ type: String, reflect: true })
    public variant: AppBarVariant = AppBarVariant.Small

    @property({ type: String, reflect: true })
    public alignment: AppBarAlignment = AppBarAlignment.Start

    @property({ type: String })
    public headline: string = ''

    @property({ type: String })
    public subtitle: string = ''

    @property({ type: Boolean, reflect: true })
    public scrolled: boolean = false

    @property({ attribute: 'scroll-target' })
    public scrollTarget: HTMLElement | Window | string | null = null

    @state()
    protected hasLeading: boolean = false

    @state()
    protected hasTrailing: boolean = false

    @state()
    protected hasHeadline: boolean = false

    @state()
    protected hasSubtitle: boolean = false

    @state()
    protected hasSearch: boolean = false

    private boundScrollHandler: (() => void) | null = null
    private currentScrollElement: HTMLElement | Window | null = null

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer) {
            this.setupScrollTarget()
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cleanupScrollTarget()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('scrollTarget')) {
            this.cleanupScrollTarget()
            this.setupScrollTarget()
        }
    }

    protected get normalizedVariant(): string {
        switch (this.variant) {
            case 'center-aligned':
                return 'small'
            case 'medium':
                return 'medium-flexible'
            case 'large':
                return 'large-flexible'
            default:
                return this.variant
        }
    }

    protected get isCentered(): boolean {
        return this.variant === 'center-aligned' || this.alignment === 'center'
    }

    protected getRenderClasses(): Record<string, boolean> {
        const normVariant = this.normalizedVariant
        return {
            'container': true,
            [normVariant]: true,
            'centered': this.isCentered,
            'scrolled': this.scrolled,
            'has-leading': this.hasLeading,
            'has-trailing': this.hasTrailing,
            'has-headline': this.hasHeadline || Boolean(this.headline),
            'has-subtitle': this.hasSubtitle || Boolean(this.subtitle),
            'has-search': this.hasSearch,
        }
    }

    protected handleLeadingSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasLeading = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleTrailingSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasTrailing = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleHeadlineSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasHeadline = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleSubtitleSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasSubtitle = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleSearchSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasSearch = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleDefaultSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        const elements = slot.assignedElements({ flatten: true })
        if (elements.length > 0) {
            this.hasTrailing = true
        }
    }

    private setupScrollTarget(): void {
        if (isServer) return
        let target: HTMLElement | Window | null = null

        if (typeof this.scrollTarget === 'string') {
            if (this.scrollTarget === 'window') {
                target = window
            } else {
                target = document.querySelector(this.scrollTarget)
            }
        } else if (this.scrollTarget instanceof HTMLElement || this.scrollTarget === window) {
            target = this.scrollTarget
        }

        if (!target) return

        this.currentScrollElement = target
        this.boundScrollHandler = () => {
            let scrollTop = 0
            if (target === window) {
                scrollTop = window.scrollY || document.documentElement.scrollTop
            } else if (target instanceof HTMLElement) {
                scrollTop = target.scrollTop
            }
            const shouldBeScrolled = scrollTop > 0
            if (this.scrolled !== shouldBeScrolled) {
                this.scrolled = shouldBeScrolled
            }
        }

        target.addEventListener('scroll', this.boundScrollHandler, { passive: true })
        this.boundScrollHandler()
    }

    private cleanupScrollTarget(): void {
        if (this.currentScrollElement && this.boundScrollHandler) {
            this.currentScrollElement.removeEventListener('scroll', this.boundScrollHandler)
        }
        this.currentScrollElement = null
        this.boundScrollHandler = null
    }

    protected renderLeading(): TemplateResult {
        return html`
            <div class="leading-section">
                <slot name="leading" @slotchange=${this.handleLeadingSlotChange}></slot>
            </div>
        `
    }

    protected renderTrailing(): TemplateResult {
        return html`
            <div class="trailing-section">
                <slot name="trailing" @slotchange=${this.handleTrailingSlotChange}>
                    <slot @slotchange=${this.handleDefaultSlotChange}></slot>
                </slot>
            </div>
        `
    }

    protected renderTitleContent(): TemplateResult {
        return html`
            <div class="title-container">
                <div class="headline">
                    <slot name="headline" @slotchange=${this.handleHeadlineSlotChange}>
                        ${this.headline}
                    </slot>
                </div>
                ${this.hasSubtitle || Boolean(this.subtitle)
                    ? html`
                        <div class="subtitle">
                            <slot name="subtitle" @slotchange=${this.handleSubtitleSlotChange}>
                                ${this.subtitle}
                            </slot>
                        </div>
                    `
                    : nothing}
            </div>
        `
    }

    protected renderSmallLayout(): TemplateResult {
        return html`
            <div class="appbar-row">
                ${this.renderLeading()}
                ${this.renderTitleContent()}
                ${this.renderTrailing()}
            </div>
        `
    }

    protected renderFlexibleLayout(): TemplateResult {
        return html`
            <div class="appbar-row top-row">
                ${this.renderLeading()}
                <div class="spacer"></div>
                ${this.renderTrailing()}
            </div>
            <div class="flexible-content">
                ${this.renderTitleContent()}
                <slot></slot>
            </div>
        `
    }

    protected renderSearchLayout(): TemplateResult {
        return html`
            <div class="appbar-row search-row">
                ${this.renderLeading()}
                <div class="search-container">
                    <slot name="search" @slotchange=${this.handleSearchSlotChange}>
                        <div class="search-box">
                            <slot name="search-leading">
                                <span class="search-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                    </svg>
                                </span>
                            </slot>
                            <div class="search-input-wrapper">
                                <slot name="search-input">
                                    <span class="search-placeholder">${this.headline || 'Search'}</span>
                                </slot>
                            </div>
                            <slot name="search-trailing"></slot>
                        </div>
                    </slot>
                </div>
                ${this.renderTrailing()}
            </div>
        `
    }

    protected override render(): TemplateResult {
        const normVariant = this.normalizedVariant

        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${this.renderElevation()}
                ${normVariant === 'search'
                    ? this.renderSearchLayout()
                    : normVariant === 'medium-flexible' || normVariant === 'large-flexible'
                    ? this.renderFlexibleLayout()
                    : this.renderSmallLayout()}
            </div>
        `
    }
}
