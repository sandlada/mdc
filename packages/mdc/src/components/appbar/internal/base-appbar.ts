/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import '../../search/search-bar'
import type { IMDCSearchBar, IMDCSearchView } from '../../search/search.interface'
import {
    AppBarAlignment,
    AppBarScrollBehavior,
    AppBarVariant,
    type IAppBarScrollStateChangeDetail,
    type IAppBarSearchClickDetail,
    type IMDCAppBar,
} from '../appbar.interface'

interface IAppBarMotionSnapshot {
    containerHeight: number
    titleRect: DOMRect | null
    collapsedChanged: boolean
    variantOrAlignmentChanged: boolean
}

/**
 * Base app bar class providing structure, slots, collapsible scroll behavior,
 * and search-view coordination.
 *
 * Implements Material Design 3 and M3 Expressive app bar specifications:
 * - Small (64px)
 * - Center-aligned (64px, mathematically centered title)
 * - Medium flexible (112px min-height, collapses to 64px)
 * - Large flexible (120px min-height, collapses to 64px)
 * - Search app bar (64px with 48px pill search box)
 */
export abstract class BaseAppBar extends composeMixin(
    mixinElementInternals,
    mixinElevationOptions,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCAppBar {

    @property({ type: String, reflect: true })
    public variant: AppBarVariant = AppBarVariant.Small

    @property({ type: String, reflect: true })
    public alignment: AppBarAlignment = AppBarAlignment.Start

    @property({ type: String, reflect: true, attribute: 'scroll-behavior' })
    public scrollBehavior: AppBarScrollBehavior = AppBarScrollBehavior.Pinned

    @property({ type: String })
    public headline: string = ''

    @property({ type: String })
    public subtitle: string = ''

    @property({ type: Boolean, reflect: true })
    public scrolled: boolean = false

    @property({ type: Boolean, reflect: true })
    public collapsed: boolean = false

    @property({ attribute: 'scroll-target' })
    public scrollTarget: HTMLElement | Window | string | null = null

    @property({ type: String })
    public for: string = ''

    @state()
    protected hasLeading: boolean = false

    @state()
    protected hasTrailingSlot: boolean = false

    @state()
    protected hasDefaultTrailingSlot: boolean = false

    @state()
    protected hasHeadline: boolean = false

    @state()
    protected hasSubtitle: boolean = false

    @state()
    protected hasSearch: boolean = false

    @query('.container')
    private readonly containerElement!: HTMLElement | null

    @query('.top-row')
    private readonly topRowElement!: HTMLElement | null

    @query('.flexible-content')
    private readonly flexibleContentElement!: HTMLElement | null

    @query('.collapsed-title')
    private readonly collapsedTitleElement!: HTMLElement | null

    @query('.headline')
    private readonly headlineElement!: HTMLElement | null

    @query('.search-container')
    private readonly searchContainerElement!: HTMLElement | null

    @query('.default-search-bar')
    private readonly defaultSearchBarElement!: IMDCSearchBar | null

    @query('slot[name="search"]')
    private readonly searchSlotElement!: HTMLSlotElement | null

    private boundScrollHandler: (() => void) | null = null
    private boundScrollEndHandler: (() => void) | null = null
    private currentScrollElement: HTMLElement | Window | null = null
    private hasRenderedOnce: boolean = false
    private pendingMotionSnapshot: IAppBarMotionSnapshot | null = null
    private activeAnimations: Animation[] = []
    private scrollScrubAnimations: Animation[] = []
    private isScrollScrubbing: boolean = false
    private lastScrollProgress: number = -1
    private cachedCollapseRange: number = 0

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer) {
            this.setupScrollTarget()
            if (this.for && this.normalizedVariant === AppBarVariant.Search) {
                queueMicrotask(() => this.syncSearchViewBinding())
            }
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cleanupScrollTarget()
        this.cancelActiveAnimations()
        this.cancelScrollScrubAnimations()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        const scrubbing = this.isScrollScrubbing
        this.isScrollScrubbing = false
        if (!this.hasRenderedOnce) return

        const collapsedChanged = changedProperties.has('collapsed') && !scrubbing
        const variantOrAlignmentChanged = changedProperties.has('variant') || changedProperties.has('alignment')
        if (collapsedChanged || variantOrAlignmentChanged) {
            this.pendingMotionSnapshot = this.captureMotionSnapshot(collapsedChanged, variantOrAlignmentChanged)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        this.hasRenderedOnce = true

        if (!isServer && (changedProperties.has('scrollTarget') || changedProperties.has('scrollBehavior') || changedProperties.has('variant'))) {
            this.cleanupScrollTarget()
            this.setupScrollTarget()
        } else if (!isServer && (changedProperties.has('headline') || changedProperties.has('subtitle'))) {
            this.cancelScrollScrubAnimations()
        }

        if (!isServer && (changedProperties.has('for') || changedProperties.has('variant'))) {
            this.syncSearchViewBinding()
        }

        if (this.pendingMotionSnapshot) {
            const snapshot = this.pendingMotionSnapshot
            this.pendingMotionSnapshot = null
            this.animateStateTransition(snapshot)
        }
    }

    protected get normalizedVariant(): string {
        switch (this.variant) {
            case AppBarVariant.CenterAligned:
                return AppBarVariant.Small
            case AppBarVariant.Medium:
                return AppBarVariant.MediumFlexible
            case AppBarVariant.Large:
                return AppBarVariant.LargeFlexible
            default:
                return this.variant
        }
    }

    protected get isCentered(): boolean {
        return this.variant === AppBarVariant.CenterAligned || this.alignment === AppBarAlignment.Center
    }

    protected get isFlexible(): boolean {
        const norm = this.normalizedVariant
        return norm === AppBarVariant.MediumFlexible || norm === AppBarVariant.LargeFlexible
    }

    protected get hasTrailing(): boolean {
        return this.hasTrailingSlot || this.hasDefaultTrailingSlot
    }

    protected getRenderClasses(): Record<string, boolean> {
        const normVariant = this.normalizedVariant
        return {
            'container'   : true,
            [normVariant] : true,
            'centered'    : this.isCentered,
            'scrolled'    : this.scrolled,
            'collapsible' : this.isFlexible && this.scrollBehavior === AppBarScrollBehavior.Collapse,
            'collapsed'   : this.isFlexible && this.collapsed,
            'has-leading' : this.hasLeading,
            'has-trailing': this.hasTrailing,
            'has-headline': this.hasHeadline || Boolean(this.headline),
            'has-subtitle': this.hasSubtitle || Boolean(this.subtitle),
            'has-search'  : this.hasSearch,
        }
    }

    protected handleLeadingSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasLeading = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleTrailingSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasTrailingSlot = slot.assignedElements({ flatten: true }).length > 0
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
        this.syncSearchViewBinding()
    }

    protected handleDefaultSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasDefaultTrailingSlot = slot.assignedElements({ flatten: true }).length > 0
    }

    protected getActiveSearchBar(): IMDCSearchBar | null {
        const slotted = this.searchSlotElement?.assignedElements({ flatten: true }) ?? []
        const slottedBar = slotted.find(
            (el): el is IMDCSearchBar => 'syncFromSearchView' in el && typeof (el as IMDCSearchBar).syncFromSearchView === 'function',
        )
        return slottedBar ?? this.defaultSearchBarElement ?? null
    }

    protected syncSearchViewBinding(): void {
        if (!this.for || this.normalizedVariant !== AppBarVariant.Search) {
            return
        }
        const searchBar = this.getActiveSearchBar()
        if (!searchBar || searchBar.searchView) {
            return
        }
        const root = typeof this.getRootNode === 'function'
            ? (this.getRootNode() as Document | ShadowRoot)
            : null
        const target =
            root?.getElementById?.(this.for) ??
            (typeof document !== 'undefined' ? document.getElementById(this.for) : null)
        if (target && 'setupWithSearchBar' in target && typeof (target as IMDCSearchView).setupWithSearchBar === 'function') {
            ;(target as IMDCSearchView).setupWithSearchBar(searchBar)
        }
    }

    protected handleSearchContainerClick(event: Event): void {
        const target = event.target as HTMLElement | null
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        if (path.length > 0) {
            const isAction = path.some(
                (node) =>
                    node instanceof Element &&
                    node !== event.currentTarget &&
                    node.matches?.('mdc-icon-button, button, a, [slot="trailing-icon"], [slot="avatar"], [slot="leading-icon"], [slot="search-trailing"], [slot="search-leading"]'),
            )
            if (isAction) {
                return
            }
        } else {
            const interactiveChild = target?.closest('mdc-icon-button, button, a')
            if (interactiveChild && interactiveChild !== event.currentTarget) {
                return
            }
        }

        this.dispatchEvent(new CustomEvent<IAppBarSearchClickDetail>('search-click', {
            bubbles : true,
            composed: true,
            detail  : { target },
        }))

        const activeBar = this.getActiveSearchBar()
        if (this.for && !activeBar?.searchView) {
            const root = typeof this.getRootNode === 'function'
                ? (this.getRootNode() as Document | ShadowRoot)
                : null
            const searchView =
                root?.getElementById?.(this.for) ??
                (typeof document !== 'undefined' ? document.getElementById(this.for) : null)
            if (searchView && typeof (searchView as unknown as { show?: () => void }).show === 'function') {
                ;(searchView as unknown as { show: () => void }).show()
            }
        }
    }

    private getCollapseThreshold(): number {
        if (this.cachedCollapseRange > 0) {
            return this.cachedCollapseRange
        }
        return this.normalizedVariant === AppBarVariant.LargeFlexible ? 56 : 48
    }

    protected setupScrollTarget(): void {
        let target: HTMLElement | Window | null = null

        if (typeof this.scrollTarget === 'string') {
            if (this.scrollTarget === 'window') {
                target = window
            } else if (this.scrollTarget.length > 0) {
                const root = typeof this.getRootNode === 'function'
                    ? (this.getRootNode() as Document | ShadowRoot)
                    : null
                target = root?.querySelector?.(this.scrollTarget) ??
                    (typeof document !== 'undefined' ? document.querySelector(this.scrollTarget) : null)
            }
        } else if (
            (typeof HTMLElement !== 'undefined' && this.scrollTarget instanceof HTMLElement) ||
            (typeof window !== 'undefined' && this.scrollTarget === window) ||
            (this.scrollTarget !== null && typeof this.scrollTarget === 'object' && 'addEventListener' in this.scrollTarget)
        ) {
            target = this.scrollTarget as HTMLElement | Window
        }

        if (!target) return

        this.currentScrollElement = target
        this.boundScrollHandler = () => {
            let scrollTop = 0
            if (typeof window !== 'undefined' && target === window) {
                scrollTop = window.scrollY || document.documentElement.scrollTop
            } else if ('scrollTop' in target) {
                scrollTop = (target as HTMLElement).scrollTop
            }

            const isCollapsible = this.scrollBehavior === AppBarScrollBehavior.Collapse && this.isFlexible
            if (isCollapsible && !this.isReducedMotion()) {
                this.ensureScrollScrubAnimations()
            }
            const threshold = this.getCollapseThreshold()
            const progress = isCollapsible ? Math.min(1, Math.max(0, scrollTop / threshold)) : 0

            if (isCollapsible && !this.isReducedMotion()) {
                this.applyScrollScrubProgress(progress)
            }
            this.containerElement?.style?.setProperty('--_scroll-progress', String(progress))

            const shouldBeScrolled = scrollTop > 0
            const shouldBeCollapsed = isCollapsible && progress >= 1

            const stateChanged =
                this.scrolled !== shouldBeScrolled ||
                this.collapsed !== shouldBeCollapsed ||
                Math.abs(progress - this.lastScrollProgress) > 0.001

            this.lastScrollProgress = progress

            if (this.scrolled !== shouldBeScrolled) {
                this.scrolled = shouldBeScrolled
            }
            if (this.collapsed !== shouldBeCollapsed) {
                this.isScrollScrubbing = true
                this.collapsed = shouldBeCollapsed
            }
            if (stateChanged) {
                this.dispatchEvent(new CustomEvent<IAppBarScrollStateChangeDetail>('scroll-state-change', {
                    bubbles : true,
                    composed: true,
                    detail  : {
                        scrolled : this.scrolled,
                        collapsed: this.collapsed,
                        progress,
                    },
                }))
            }
        }

        this.boundScrollEndHandler = () => {
            if (this.isReducedMotion()) return
            const isCollapsible = this.scrollBehavior === AppBarScrollBehavior.Collapse && this.isFlexible
            if (!isCollapsible) return

            const scrollTop = (typeof window !== 'undefined' && target === window)
                ? (window.scrollY || document.documentElement.scrollTop)
                : ('scrollTop' in target ? (target as HTMLElement).scrollTop : 0)

            const threshold = this.getCollapseThreshold()
            if (scrollTop > 0 && scrollTop < threshold && typeof target.scrollTo === 'function') {
                const targetTop = scrollTop >= threshold * 0.5 ? threshold : 0
                target.scrollTo({ top: targetTop, behavior: 'smooth' })
            }
        }

        target.addEventListener('scroll', this.boundScrollHandler, { passive: true })
        target.addEventListener('scrollend', this.boundScrollEndHandler, { passive: true })
        this.boundScrollHandler()
    }

    protected cleanupScrollTarget(): void {
        if (this.currentScrollElement && this.boundScrollHandler) {
            this.currentScrollElement.removeEventListener('scroll', this.boundScrollHandler)
        }
        if (this.currentScrollElement && this.boundScrollEndHandler) {
            this.currentScrollElement.removeEventListener('scrollend', this.boundScrollEndHandler)
        }
        this.currentScrollElement = null
        this.boundScrollHandler = null
        this.boundScrollEndHandler = null
        this.lastScrollProgress = -1
        this.containerElement?.style?.removeProperty('--_scroll-progress')
        this.cancelScrollScrubAnimations()
    }

    private cancelScrollScrubAnimations(): void {
        for (const anim of this.scrollScrubAnimations) {
            anim.cancel()
        }
        this.scrollScrubAnimations = []
        this.cachedCollapseRange = 0
        this.style?.removeProperty?.('--_expanded-height')
    }

    private ensureScrollScrubAnimations(): boolean {
        if (this.scrollScrubAnimations.length > 0) return true
        const container = this.containerElement
        if (!container || typeof container.animate !== 'function') return false

        const defaultExpandedHeight = this.normalizedVariant === AppBarVariant.LargeFlexible ? 120 : 112
        const measuredHeight = !this.collapsed ? container.getBoundingClientRect().height : 0
        const expandedHeight = measuredHeight > 64 ? measuredHeight : defaultExpandedHeight
        const collapsedHeight = 64
        this.cachedCollapseRange = Math.max(1, expandedHeight - collapsedHeight)
        this.style?.setProperty?.('--_expanded-height', `${expandedHeight}px`)

        const scrubOptions: KeyframeAnimationOptions = {
            duration: 1000,
            fill    : 'both',
            easing  : 'linear',
        }

        const animations: Animation[] = []
        const containerAnim = container.animate(
            [
                { height: `${expandedHeight}px`, minHeight: `${expandedHeight}px`, overflow: 'hidden' },
                { height: `${collapsedHeight}px`, minHeight: `${collapsedHeight}px`, overflow: 'hidden' },
            ],
            scrubOptions,
        )
        containerAnim.pause()
        animations.push(containerAnim)

        if (this.topRowElement && typeof this.topRowElement.animate === 'function') {
            const topRowAnim = this.topRowElement.animate(
                [
                    { minHeight: '56px', paddingTop: '4px' },
                    { minHeight: '64px', paddingTop: '0px' },
                ],
                scrubOptions,
            )
            topRowAnim.pause()
            animations.push(topRowAnim)
        }

        if (this.flexibleContentElement && typeof this.flexibleContentElement.animate === 'function') {
            const contentAnim = this.flexibleContentElement.animate(
                [
                    { opacity: 1, transform: 'translateY(0px)', offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
                    { opacity: 0, transform: 'translateY(-4px)', offset: 0.55 },
                    { opacity: 0, transform: 'translateY(-4px)', offset: 1 },
                ],
                scrubOptions,
            )
            contentAnim.pause()
            animations.push(contentAnim)
        }

        if (this.collapsedTitleElement && typeof this.collapsedTitleElement.animate === 'function') {
            const titleAnim = this.collapsedTitleElement.animate(
                [
                    { opacity: 0, transform: 'translateY(4px)', offset: 0 },
                    { opacity: 0, transform: 'translateY(4px)', offset: 0.45, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' },
                    { opacity: 1, transform: 'translateY(0px)', offset: 0.95 },
                    { opacity: 1, transform: 'translateY(0px)', offset: 1 },
                ],
                scrubOptions,
            )
            titleAnim.pause()
            animations.push(titleAnim)
        }

        this.scrollScrubAnimations = animations
        return true
    }

    private applyScrollScrubProgress(progress: number): void {
        if (!this.ensureScrollScrubAnimations()) return
        const currentTime = progress * 1000
        for (const anim of this.scrollScrubAnimations) {
            anim.currentTime = currentTime
        }
    }

    private isReducedMotion(): boolean {
        return typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    private cancelActiveAnimations(): void {
        for (const anim of this.activeAnimations) {
            anim.cancel()
        }
        this.activeAnimations = []
    }

    private trackAnimation(anim: Animation | undefined): void {
        if (!anim) return
        this.activeAnimations.push(anim)
        const cleanup = () => {
            this.activeAnimations = this.activeAnimations.filter((item) => item !== anim)
        }
        anim.addEventListener('finish', cleanup, { once: true })
        anim.addEventListener('cancel', cleanup, { once: true })
    }

    private captureMotionSnapshot(
        collapsedChanged: boolean,
        variantOrAlignmentChanged: boolean,
    ): IAppBarMotionSnapshot {
        const containerHeight = this.containerElement?.getBoundingClientRect().height ?? 0
        const titleEl = this.isFlexible && this.collapsed
            ? this.collapsedTitleElement
            : this.headlineElement
        const titleRect = titleEl?.getBoundingClientRect() ?? null
        return {
            containerHeight,
            titleRect,
            collapsedChanged,
            variantOrAlignmentChanged,
        }
    }

    private animateStateTransition(snapshot: IAppBarMotionSnapshot): void {
        this.cancelActiveAnimations()
        if (this.isReducedMotion()) return

        const container = this.containerElement
        if (!container || typeof container.animate !== 'function') return

        const emphasizedEasing = 'cubic-bezier(0.2, 0, 0, 1)'
        const decelerateEasing = 'cubic-bezier(0.05, 0.7, 0.1, 1)'

        const afterHeight = container.getBoundingClientRect().height
        if (snapshot.containerHeight > 0 && afterHeight > 0 && Math.abs(snapshot.containerHeight - afterHeight) > 0.5) {
            this.trackAnimation(container.animate(
                [
                    { height: `${snapshot.containerHeight}px`, minHeight: `${snapshot.containerHeight}px`, overflow: 'hidden' },
                    { height: `${afterHeight}px`, minHeight: `${afterHeight}px`, overflow: 'hidden' },
                ],
                {
                    duration: snapshot.collapsedChanged ? 300 : 350,
                    easing  : emphasizedEasing,
                    fill    : 'none',
                },
            ))
        }

        if (snapshot.collapsedChanged && this.isFlexible) {
            if (this.collapsed && this.collapsedTitleElement && typeof this.collapsedTitleElement.animate === 'function') {
                this.trackAnimation(this.collapsedTitleElement.animate(
                    [
                        { opacity: 0, transform: 'translateY(6px)' },
                        { opacity: 1, transform: 'translateY(0)' },
                    ],
                    { duration: 250, easing: decelerateEasing, fill: 'none' },
                ))
            } else if (!this.collapsed && this.flexibleContentElement && typeof this.flexibleContentElement.animate === 'function') {
                this.trackAnimation(this.flexibleContentElement.animate(
                    [
                        { opacity: 0, transform: 'translateY(-8px)' },
                        { opacity: 1, transform: 'translateY(0)' },
                    ],
                    { duration: 250, easing: decelerateEasing, fill: 'none' },
                ))
            }
            return
        }

        if (snapshot.variantOrAlignmentChanged) {
            if (this.normalizedVariant === AppBarVariant.Search && this.searchContainerElement && typeof this.searchContainerElement.animate === 'function') {
                this.trackAnimation(this.searchContainerElement.animate(
                    [
                        { opacity: 0, transform: 'scaleX(0.94)' },
                        { opacity: 1, transform: 'scaleX(1)' },
                    ],
                    { duration: 300, easing: emphasizedEasing, fill: 'none' },
                ))
            } else if (snapshot.titleRect && this.headlineElement && typeof this.headlineElement.animate === 'function') {
                const afterRect = this.headlineElement.getBoundingClientRect()
                const dx = snapshot.titleRect.left - afterRect.left
                const dy = snapshot.titleRect.top - afterRect.top
                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    this.trackAnimation(this.headlineElement.animate(
                        [
                            { transform: `translate(${dx}px, ${dy}px)` },
                            { transform: 'translate(0, 0)' },
                        ],
                        { duration: 350, easing: emphasizedEasing, fill: 'none' },
                    ))
                }
            }
        }
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
                    ${this.isFlexible
                        ? nothing
                        : html`<slot @slotchange=${this.handleDefaultSlotChange}></slot>`}
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
                <div class="collapsed-title" aria-hidden=${this.collapsed ? 'false' : 'true'}>
                    <span class="collapsed-headline">${this.headline}</span>
                </div>
                ${this.renderTrailing()}
            </div>
            <div class="flexible-content-wrapper">
                <div class="flexible-content">
                    ${this.renderTitleContent()}
                    <slot></slot>
                </div>
            </div>
        `
    }

    protected renderSearchLayout(): TemplateResult {
        return html`
            <div class="appbar-row search-row">
                ${this.renderLeading()}
                <div class="search-container" @click=${this.handleSearchContainerClick}>
                    <slot name="search" @slotchange=${this.handleSearchSlotChange}>
                        <mdc-search-bar
                            class="default-search-bar"
                            supporting-text=${this.headline || 'Search'}
                            alignment=${this.alignment}
                            hide-avatar
                        >
                            <slot name="search-leading" slot="leading-icon"></slot>
                            <slot name="search-trailing" slot="trailing-icon"></slot>
                        </mdc-search-bar>
                    </slot>
                </div>
                ${this.renderTrailing()}
            </div>
        `
    }

    protected override render(): TemplateResult {
        const normVariant = this.normalizedVariant

        return html`
            <header class=${classMap(this.getRenderClasses())}>
                ${this.renderElevation()}
                ${normVariant === AppBarVariant.Search
                    ? this.renderSearchLayout()
                    : this.isFlexible
                    ? this.renderFlexibleLayout()
                    : this.renderSmallLayout()}
            </header>
        `
    }
}
