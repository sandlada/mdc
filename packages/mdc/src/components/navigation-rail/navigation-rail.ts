/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Navigation Rail container.
 *
 * The rail exposes a single `variant` property that describes its four
 * possible visual states:
 * - **`collapsed`** (default): docked, narrow rail with icon-above-label destinations.
 * - **`expanded-docked`**: docked, wide rail with icon-next-to-label destinations.
 * - **`expanded-floating`**: floating overlay above the content with a scrim backdrop.
 * - **`xr`**: docked XR rail with XR destinations.
 *
 * Destinations can be aligned to top, center, or bottom via the `alignment` property.
 *
 * The destinations are grouped in `<mdc-navigation-rail-section>`. A section
 * labels its group with an `<mdc-navigation-rail-section-header>` assigned to
 * the `header` slot of the section:
 *
 * ```plaintext
 * |-------------------------
 * | <mdc-navigation-rail>
 * |  |--------------------|
 * |  | Section Header     |
 * |  |--------------------|
 * |  | Destination 1      |
 * |  | Destination 2      |
 * |  |--------------------|
 * |  | Section Header     |
 * |  |--------------------|
 * |  | Destination 3      |
 * |  |--------------------|
 * |-------------------------
 * ```
 *
 * The section header is an expanded-rail affordance — a collapsed or XR rail
 * groups its destinations in sections without a header.
 *
 * @example
 * ```html
 * <!-- Collapsed rail -->
 * <mdc-navigation-rail navigation-scope="main-nav">
 *   <mdc-icon-button slot="menu"><mdc-icon>menu</mdc-icon></mdc-icon-button>
 *   <mdc-fab slot="fab" icon="edit" variant="primary"></mdc-fab>
 *   <mdc-navigation-rail-section>
 *     <mdc-navigation-tab name="rail-tabs" value="/home" label="Home" checked>
 *       <mdc-icon slot="inactive-icon">home</mdc-icon>
 *       <mdc-icon slot="active-icon" filled>home</mdc-icon>
 *     </mdc-navigation-tab>
 *     <mdc-navigation-tab name="rail-tabs" value="/search" label="Search">
 *       <mdc-icon slot="inactive-icon">search</mdc-icon>
 *       <mdc-icon slot="active-icon" filled>search</mdc-icon>
 *     </mdc-navigation-tab>
 *   </mdc-navigation-rail-section>
 * </mdc-navigation-rail>
 *
 * <!-- Expanded, docked rail -->
 * <mdc-navigation-rail variant="expanded-docked" navigation-scope="main-nav-2">
 *   <mdc-icon-button slot="menu"><mdc-icon>menu_open</mdc-icon></mdc-icon-button>
 *   <mdc-navigation-rail-section>
 *     <mdc-navigation-rail-section-header slot="header">Main</mdc-navigation-rail-section-header>
 *     <mdc-navigation-tab name="rail-tabs" value="/home" label="Home" checked>
 *       <mdc-icon slot="inactive-icon">home</mdc-icon>
 *       <mdc-icon slot="active-icon" filled>home</mdc-icon>
 *     </mdc-navigation-tab>
 *   </mdc-navigation-rail-section>
 * </mdc-navigation-rail>
 *
 * <!-- Floating rail -->
 * <mdc-navigation-rail variant="expanded-floating" open navigation-scope="modal-nav">
 *   <mdc-navigation-rail-section>
 *     <mdc-navigation-tab name="modal-tabs" value="/settings" label="Settings">
 *       <mdc-icon slot="inactive-icon">settings</mdc-icon>
 *     </mdc-navigation-tab>
 *   </mdc-navigation-rail-section>
 * </mdc-navigation-rail>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/navigation-rail/overview
 * https://m3.material.io/components/navigation-rail/specs
 * https://m3.material.io/components/navigation-rail/guidelines
 */
import { customElement, property, query, state } from 'lit/decorators.js'
import { BaseNavigationContainer } from '../navigation/internal/base-navigation-container'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
import { mixinConnectedPromiseResolve, type IConnectedPromiseResolve } from '../../utils/behaviors/connected-promise-resolve'
import {
    NavigationRailAlignment,
    NavigationRailCollapsedLayout,
    NavigationRailVariant,
    type INavigationRail,
} from './navigation-rail.interface'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'
import { html, type PropertyValues, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationRailStyles, NavigationRailTransitionDuration } from './navigation-rail.style'
import '../divider/divider'
import '../elevation/elevation'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail': NavigationRail
    }
}

const VALID_VARIANTS: readonly NavigationRailVariant[] = [
    NavigationRailVariant.Collapsed,
    NavigationRailVariant.ExpandedDocked,
    NavigationRailVariant.ExpandedFloating,
    NavigationRailVariant.XR,
]

const VALID_COLLAPSED_LAYOUTS: readonly NavigationRailCollapsedLayout[] = [
    NavigationRailCollapsedLayout.Vertical,
    NavigationRailCollapsedLayout.Round,
]

/**
 * Material Design 3 Navigation Rail.
 *
 * @emits expand — Cancelable. Fires before the rail expands.
 * @emits expanded — Expansion complete.
 * @emits collapse — Cancelable. Fires before the rail collapses.
 * @emits collapsed — Collapse complete.
 * @emits open — Cancelable. Fires before the floating rail opens.
 * @emits opened — Floating rail opened.
 * @emits close — Cancelable. Fires before the floating rail closes.
 * @emits closed — Floating rail closed.
 * @emits cancel — Cancelable. Fires on backdrop click or Escape key (floating variant).
 */
@customElement('mdc-navigation-rail')
export class NavigationRail extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
    mixinConnectedPromiseResolve,
)(BaseNavigationContainer) implements INavigationRail, IConnectedPromiseResolve {

    public static override styles = NavigationRailStyles

    /**
     * When `true`, skips all animations:
     * - Docked variants: CSS width `transition` is suppressed.
     * - Floating variant: the CSS entry/exit transitions are suppressed.
     */
    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    /**
     * The visual state of the rail.
     *
     * - `'collapsed'`: docked, narrow rail with icon-above-label destinations.
     * - `'expanded-docked'`: docked, wide rail with icon-next-to-label destinations.
     * - `'expanded-floating'`: floating overlay with scrim, always wide.
     * - `'xr'`: docked XR rail with XR destinations.
     */
    @property({ type: String, reflect: true })
    public variant: NavigationRailVariant = NavigationRailVariant.Collapsed

    /**
     * In the `expanded-floating` variant, controls whether the floating rail is
     * shown or hidden. Ignored by every other variant.
     */
    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    /**
     * Determines the tab layout when the rail is collapsed.
     * - `'vertical'`: tabs use `rail-vertical` (icon on top, label underneath).
     * - `'round'`: tabs use `rail-round` (icon only in round container).
     *
     * The expanded variants always use `rail-horizontal` regardless of this value.
     */
    @property({ type: String, reflect: true, attribute: 'collapsed-layout' })
    public collapsedLayout: NavigationRailCollapsedLayout = NavigationRailCollapsedLayout.Vertical

    /**
     * Vertical alignment of destination items within the rail.
     * - `'top'`: items aligned to the top (default).
     * - `'center'`: items centered vertically.
     * - `'bottom'`: items aligned to the bottom.
     */
    @property({ type: String, reflect: true })
    public alignment: NavigationRailAlignment = NavigationRailAlignment.Top

    /**
     * Dialog return value of the floating rail.
     */
    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    /**
     * When `true`, disables the automatic focus trap of the floating rail.
     */
    @property({ type: Boolean, attribute: 'no-focus-trap' })
    public noFocusTrap: boolean = false

    @state()
    protected isAtScrollTop: boolean = false

    @state()
    protected isAtScrollBottom: boolean = false

    @state()
    protected hasMenuSlot: boolean = false

    @state()
    protected hasFabSlot: boolean = false

    @state()
    protected hasHeaderSlot: boolean = false

    @state()
    protected hasEndSlot: boolean = false

    @state()
    protected hasFooterSlot: boolean = false

    @query('.top.anchor')
    protected readonly topAnchor!: HTMLElement | null

    @query('.bottom.anchor')
    protected readonly bottomAnchor!: HTMLElement | null

    @query('.scroller')
    protected readonly scroller!: HTMLElement | null

    @query('.destination')
    protected readonly destination!: HTMLElement | null

    @query('dialog')
    protected readonly dialog!: HTMLDialogElement | null

    @query('.container')
    protected readonly container!: HTMLElement | null

    private handleStateChange: boolean = true
    protected isAnimating: boolean = false
    private previouslyFocused: Element | null = null
    protected intersectionObserver?: IntersectionObserver
    private hasCompletedInitialUpdate: boolean = false
    private labelRevealTimer: ReturnType<typeof setTimeout> | null = null
    private isFloatingShown: boolean = false

    /**
     * Whether the rail currently renders as the floating overlay variant.
     */
    protected get isFloating(): boolean {
        return this.variant === NavigationRailVariant.ExpandedFloating
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncTabVariants()
    }

    protected override firstUpdated(): void {
        super.firstUpdated()
        this.syncTabVariants()
        this.setUpScrollObserver()
        this.container?.addEventListener('transitionend', this.handleContainerTransitionEnd)
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!VALID_VARIANTS.includes(this.variant)) {
            throw new Error(`[mdc-navigation-rail] Unsupported variant "${String(this.variant)}". Navigation rails support only "collapsed" | "expanded-docked" | "expanded-floating" | "xr".`)
        }
        if (!VALID_COLLAPSED_LAYOUTS.includes(this.collapsedLayout)) {
            throw new Error(`[mdc-navigation-rail] Unsupported collapsed layout "${String(this.collapsedLayout)}". Navigation rails support only "vertical" | "round".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('variant')) {
            this.handleVariantChange()
        }

        if (changedProperties.has('open') && this.handleStateChange && this.isFloating) {
            if (this.open) {
                void this.show()
            } else {
                void this.hide()
            }
        }

        if (
            changedProperties.has('variant') ||
            changedProperties.has('collapsedLayout') ||
            changedProperties.has('alignment')
        ) {
            this.syncTabVariants()
        }

        this.hasCompletedInitialUpdate = true
    }

    public override disconnectedCallback(): void {
        this.intersectionObserver?.disconnect()
        this.intersectionObserver = undefined
        this.clearLabelRevealTimer()
        this.setTabLabelsHidden(false)
        super.disconnectedCallback()
    }

    private setUpScrollObserver(): void {
        this.shadowRoot?.querySelector('slot:not([name])')?.addEventListener('slotchange', () => {
            this.syncTabVariants()
        })

        if (this.scroller && this.topAnchor && this.bottomAnchor) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        this.handleAnchorIntersection(entry)
                    }
                },
                { root: this.scroller },
            )
            this.intersectionObserver.observe(this.topAnchor)
            this.intersectionObserver.observe(this.bottomAnchor)
        }
    }

    private handleAnchorIntersection(entry: IntersectionObserverEntry): void {
        const { target, isIntersecting } = entry
        if (target === this.topAnchor) {
            this.isAtScrollTop = isIntersecting
        }
        if (target === this.bottomAnchor) {
            this.isAtScrollBottom = isIntersecting
        }
    }

    private syncTabVariants(): void {
        const targetVariant = this.computeTargetVariant()
        const tabs = this.querySelectorAll<HTMLElement>('mdc-navigation-tab')
        for (const tab of tabs) {
            (tab as any).variant = targetVariant
        }
    }

    private computeTargetVariant(): NavigationTabVariant {
        if (this.variant === NavigationRailVariant.ExpandedDocked || this.variant === NavigationRailVariant.ExpandedFloating) {
            return 'rail-horizontal'
        }
        if (this.variant === NavigationRailVariant.XR) {
            return this.collapsedLayout === NavigationRailCollapsedLayout.Round ? 'rail-xr-round' : 'rail-xr-vertical'
        }
        return this.collapsedLayout === NavigationRailCollapsedLayout.Round ? 'rail-round' : 'rail-vertical'
    }

    /**
     * Reconciles the floating overlay with the current variant: the floating
     * rail is opened when the variant turns floating while `open` is set.
     */
    private handleVariantChange(): void {
        if (this.isFloating && this.open && !this.isFloatingShown) {
            void this.show()
        }

        this.handleLayoutChange()
    }

    /**
     * The destination label sits below the icon in the collapsed layout and
     * next to the icon in the expanded one. Both layouts are swapped in a
     * single frame while the container width animates, so the label is hidden
     * for the duration of the morph and revealed once the new layout settled.
     */
    private handleLayoutChange(): void {
        if (!this.hasCompletedInitialUpdate) {
            return
        }
        if (this.quick) {
            return
        }

        this.setTabLabelsHidden(true)
        this.scheduleLabelReveal()
    }

    private setTabLabelsHidden(hidden: boolean): void {
        if (hidden) {
            this.style.setProperty('--mdc-navigation-tab-enabled-label-opacity', '0')
            this.style.setProperty('--mdc-navigation-tab-enabled-label-visibility', 'hidden')
            return
        }
        this.style.removeProperty('--mdc-navigation-tab-enabled-label-opacity')
        this.style.removeProperty('--mdc-navigation-tab-enabled-label-visibility')
    }

    /**
     * Reveals the labels once the width transition finished. The timeout is a
     * fallback for the cases where no transition runs at all (e.g. a hidden
     * rail) and therefore no `transitionend` event is dispatched.
     */
    private scheduleLabelReveal(): void {
        this.clearLabelRevealTimer()
        this.labelRevealTimer = setTimeout(() => {
            this.labelRevealTimer = null
            this.setTabLabelsHidden(false)
        }, NavigationRailTransitionDuration + 50)
    }

    private clearLabelRevealTimer(): void {
        if (this.labelRevealTimer === null) {
            return
        }
        clearTimeout(this.labelRevealTimer)
        this.labelRevealTimer = null
    }

    private readonly handleContainerTransitionEnd = (event: TransitionEvent): void => {
        if (event.target !== this.container) {
            return
        }
        if (event.propertyName !== 'width') {
            return
        }
        this.clearLabelRevealTimer()
        this.setTabLabelsHidden(false)
    }

    public getRenderClasses(): Record<string, boolean> {
        const isScrollable = !(this.isAtScrollTop && this.isAtScrollBottom)
        const isEffectiveOpen = this.isFloating ? this.open : true
        return ({
            'dialog': true,
            'open': isEffectiveOpen,
            'closed': !isEffectiveOpen,
            'collapsed': this.variant === NavigationRailVariant.Collapsed,
            'expanded-docked': this.variant === NavigationRailVariant.ExpandedDocked,
            'expanded-floating': this.variant === NavigationRailVariant.ExpandedFloating,
            'xr': this.variant === NavigationRailVariant.XR,
            'align-top': this.alignment === NavigationRailAlignment.Top,
            'align-center': this.alignment === NavigationRailAlignment.Center,
            'align-bottom': this.alignment === NavigationRailAlignment.Bottom,
            'scrollable': isScrollable,
            'show-top-divider': isScrollable && !this.isAtScrollTop,
            'show-bottom-divider': isScrollable && !this.isAtScrollBottom,
            'has-menu': this.hasMenuSlot,
            'has-fab': this.hasFabSlot,
            'has-header': this.hasHeaderSlot,
            'has-end': this.hasEndSlot,
            'has-footer': this.hasFooterSlot,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <span
                aria-hidden="true"
                class="scrim"
                @click=${this.handleScrimClick}
            ></span>
            <dialog
                ?open=${this.isFloating ? this.open : true}
                class=${classMap(this.getRenderClasses())}
                .returnValue=${this.returnValue}
                @click=${this.handleDialogClick}
                @keydown=${this.handleKeydown}
            >
                <div class="container" @click=${this.handleContentClick}>
                    <div class="header-section">
                        <div class="menu">${this.renderMenuSlot()}</div>
                        <div class="fab">${this.renderFabSlot()}</div>
                        <div class="header">${this.renderHeaderSlot()}</div>
                    </div>
                    <div class="scroller-section">
                        <mdc-divider class="top"></mdc-divider>
                        <div class="scroller">
                            <div class="destination">
                                <div class="top anchor"></div>
                                ${this.renderSlot()}
                                <div class="bottom anchor"></div>
                            </div>
                        </div>
                        <mdc-divider class="bottom"></mdc-divider>
                    </div>
                    <div class="end-section">
                        <div class="end">${this.renderEndSlot()}</div>
                        <div class="footer">${this.renderFooterSlot()}</div>
                    </div>
                    ${this.renderBackground()}
                </div>
            </dialog>
        `
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background">
                ${this.renderElevation()}
            </div>
        `
    }

    protected renderMenuSlot(): TemplateResult {
        return html`
            <slot name="menu" @slotchange=${this.handleMenuSlotChange}></slot>
        `
    }

    protected renderFabSlot(): TemplateResult {
        return html`
            <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
        `
    }

    protected renderHeaderSlot(): TemplateResult {
        return html`
            <slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>
        `
    }

    protected renderEndSlot(): TemplateResult {
        return html`
            <slot name="end" @slotchange=${this.handleEndSlotChange}></slot>
        `
    }

    protected renderFooterSlot(): TemplateResult {
        return html`
            <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
        `
    }

    private handleMenuSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasMenuSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleFabSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasFabSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleHeaderSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasHeaderSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleEndSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasEndSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleFooterSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasFooterSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    /**
     * Expands the navigation rail.
     *
     * A floating rail stays floating, every other variant switches to
     * `expanded-docked`. Fires the cancelable `expand` event before and the
     * `expanded` event after the transition.
     */
    public async expand(): Promise<void> {
        await this.isConnectedPromise

        const preventExpand = !this.dispatchEvent(
            new Event('expand', { cancelable: true }),
        )
        if (preventExpand) {
            return
        }

        if (this.isFloating) {
            if (!this.open) {
                await this.show()
            }
        } else {
            this.variant = NavigationRailVariant.ExpandedDocked
            await this.updateComplete
            this.syncTabVariants()
        }

        this.dispatchEvent(new Event('expanded'))
    }

    /**
     * Collapses the navigation rail back to the `collapsed` variant.
     *
     * A floating rail is closed and turns into a docked, narrow rail. Fires
     * the cancelable `collapse` event before and the `collapsed` event after
     * the transition.
     */
    public async collapse(returnValue = this.returnValue): Promise<void> {
        await this.isConnectedPromise

        const preventCollapse = !this.dispatchEvent(
            new Event('collapse', { cancelable: true }),
        )
        if (preventCollapse) {
            return
        }

        this.returnValue = returnValue

        if (this.isFloating) {
            await this.hide(returnValue)
        }

        this.variant = NavigationRailVariant.Collapsed
        await this.updateComplete
        this.syncTabVariants()
        this.dispatchEvent(new Event('collapsed'))
    }

    /**
     * Opens the floating navigation rail.
     *
     * Only meaningful for the `expanded-floating` variant — on every other
     * variant the call is forwarded to {@link expand}.
     */
    public async show(): Promise<void> {
        if (!this.isFloating) {
            await this.expand()
            return
        }

        if (this.isAnimating || (this.open && this.isFloatingShown)) {
            return
        }

        const preventOpen = !this.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this.handleStateChange = false
            this.open = false
            this.handleStateChange = true
            return
        }

        this.isAnimating = true
        this.previouslyFocused = this.ownerDocument?.activeElement ?? document.activeElement

        this.handleStateChange = false
        this.open = true
        this.handleStateChange = true

        await this.isConnectedPromise
        await this.updateComplete

        if (this.scroller) {
            this.scroller.scrollTop = 0
        }

        // The container slide-in and the scrim fade are CSS transitions
        // started by the open state that was applied above. They carry no
        // awaitable handle of their own, so the live ones are gathered from
        // the rendered dialog and awaited.
        if (!this.quick) {
            await this.waitForTransitions()
        }

        if (!this.noFocusTrap) {
            const autofocusTarget = this.querySelector<HTMLElement>('[autofocus]')
            if (autofocusTarget) {
                autofocusTarget.focus()
            } else {
                const firstTab = this.querySelector<HTMLElement>('mdc-navigation-tab, mdc-icon-button, button, [tabindex]:not([tabindex="-1"])')
                firstTab?.focus()
            }
        }

        this.isAnimating = false
        this.isFloatingShown = true
        this.dispatchEvent(new Event('opened'))
    }

    /**
     * Closes the floating navigation rail.
     *
     * Only meaningful for the `expanded-floating` variant — on every other
     * variant the call is forwarded to {@link collapse}.
     */
    public async hide(returnValue = this.returnValue): Promise<void> {
        if (!this.isFloating) {
            await this.collapse(returnValue)
            return
        }

        if (this.isAnimating || (!this.open && !this.isFloatingShown)) {
            return
        }

        const preventClose = !this.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            return
        }

        this.isAnimating = true
        this.returnValue = returnValue

        // Flip the state first: the CSS transition runs towards the closed
        // values (the container slides out, the dialog is hidden once the
        // transition ended). The dialog must stay displayed until the motion
        // finished — the `display` transition uses `allow-discrete` for it.
        this.handleStateChange = false
        this.open = false
        this.handleStateChange = true

        await this.updateComplete

        if (!this.quick) {
            await this.waitForTransitions()
        }

        if (this.previouslyFocused instanceof HTMLElement && document.contains(this.previouslyFocused)) {
            this.previouslyFocused.focus()
            this.previouslyFocused = null
        }

        this.isAnimating = false
        this.isFloatingShown = false
        this.dispatchEvent(new Event('closed'))
    }

    /**
     * Convenience method to close the floating rail.
     */
    public async close(returnValue = this.returnValue): Promise<void> {
        await this.hide(returnValue)
    }

    /**
     * Toggles the rail.
     *
     * The floating variant toggles between shown and hidden, every other
     * variant toggles between `collapsed` and `expanded-docked`.
     */
    public async toggle(): Promise<void> {
        if (this.isFloating) {
            if (this.open) {
                await this.hide()
            } else {
                await this.show()
            }
            return
        }

        if (this.variant === NavigationRailVariant.ExpandedDocked) {
            await this.collapse()
        } else {
            await this.expand()
        }
    }

    /**
     * Waits until every CSS transition started by the last open-state change
     * is done. CSS transitions carry no awaitable handle of their own, so
     * the live ones are gathered from the rendered dialog and awaited
     * through the Web Animations `finished` promises.
     *
     * A replaced or canceled transition (e.g. the state flipped again
     * mid-way) rejects `finished`, which counts as "no longer animating".
     * When nothing animates (`quick`, reduced motion, zero durations), this
     * resolves immediately.
     */
    private async waitForTransitions(): Promise<void> {
        const animations = [
            ...(this.dialog?.getAnimations() ?? []),
            ...(this.container?.getAnimations() ?? []),
        ]
        if (animations.length === 0) return
        await Promise.all(
            animations.map((anim) => anim.finished.catch(() => {})),
        )
    }

    protected handleScrimClick = (): void => {
        if (!this.isFloating || !this.open) return

        this.requestCancel('scrim')
    }

    protected handleDialogClick = (event: MouseEvent): void => {
        if (!this.isFloating) return
        if (event.target === this.dialog) {
            this.handleScrimClick()
        }
    }

    protected handleContentClick = (event: MouseEvent): void => {
        event.stopPropagation()
    }

    protected handleKeydown = (event: KeyboardEvent): void => {
        if (!this.isFloating) return
        if (event.key !== 'Escape') return

        event.preventDefault()
        this.requestCancel('escape')
    }

    /**
     * Dispatches the cancelable `cancel` event and closes the floating rail
     * unless the event was prevented.
     */
    private requestCancel(reason: string): void {
        if (!this.open) return

        const preventCancel = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventCancel) return

        void this.hide(reason)
    }
}
