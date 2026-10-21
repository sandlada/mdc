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
import {
    BaseNavigationContainer,
    type INavigationTabTarget,
} from '../navigation/internal/base-navigation-container'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
import { mixinConnectedPromiseResolve, type IConnectedPromiseResolve } from '../../utils/behaviors/connected-promise-resolve'
import {
    NavigationRailAlignment,
    NavigationRailVariant,
    type INavigationRail,
} from './navigation-rail.interface'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationRailStyles, NavigationRailTransitionDuration } from './navigation-rail.style'
import { resolveRailTabVariant } from './internal/resolve-rail-tab-variant'
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

const VALID_ALIGNMENTS: readonly NavigationRailAlignment[] = [
    NavigationRailAlignment.Top,
    NavigationRailAlignment.Center,
    NavigationRailAlignment.Bottom,
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
     * When `true`, the floating rail is shown non-modally (`dialog.show()`),
     * so focus can leave the overlay. When `false` (default), the rail is
     * shown with `dialog.showModal()`, which keeps it in the top layer, makes
     * the rest of the page inert and traps focus inside.
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
     * Why the floating rail last started closing. Internal only — the public
     * `closed` event carries no detail yet. Kept separate from `returnValue`
     * so a scrim click / Escape never leaks into the dialog return value.
     */
    private lastCloseReason: string = 'programmatic'

    /**
     * Whether the rail currently renders as the floating overlay variant.
     */
    protected get isFloating(): boolean {
        return this.variant === NavigationRailVariant.ExpandedFloating
    }

    protected override resolveTabVariant(tab: INavigationTabTarget): NavigationTabVariant {
        // A tab that has not upgraded yet (definition still loading, HMR, or
        // early parsing) has no `label` property, so read it defensively.
        const label = tab.label ?? ''
        return resolveRailTabVariant(this.variant, label.trim().length > 0)
    }

    protected override shouldSyncTabVariants(changedProperties: PropertyValues<this>): boolean {
        return changedProperties.has('variant')
    }

    protected override firstUpdated(): void {
        super.firstUpdated()
        this.setUpScrollObserver()
        this.container?.addEventListener('transitionend', this.handleContainerTransitionEnd)
        // An initially open floating rail must enter the modal state after
        // the first render. `updated()` already covers the common path via
        // the initial `variant` change; `show()` guards against a duplicate.
        if (this.isFloating && this.open && !this.isFloatingShown) {
            void this.show()
        }
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!VALID_VARIANTS.includes(this.variant)) {
            throw new Error(`[mdc-navigation-rail] Unsupported variant "${String(this.variant)}". Navigation rails support only "collapsed" | "expanded-docked" | "expanded-floating" | "xr".`)
        }
        if (!VALID_ALIGNMENTS.includes(this.alignment)) {
            throw new Error(`[mdc-navigation-rail] Unsupported alignment "${String(this.alignment)}". Navigation rails support only "top" | "center" | "bottom".`)
        }

        if (changedProperties.has('variant') && !this.isFloating) {
            // Leaving the floating layout: a modal dialog would keep the page
            // inert and trap focus in what is now a docked rail. Close it
            // before the render below re-adds the native `open` attribute for
            // the docked variants, so that attribute stays non-modal.
            this.isFloatingShown = false
            const dialog = this.dialog
            if (dialog?.open && dialog.matches(':modal')) {
                dialog.close(this.returnValue)
            }
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('variant')) {
            this.handleVariantChange()
        }

        if (changedProperties.has('noFocusTrap') && this.isFloating && this.open && this.isFloatingShown) {
            this.syncDialogModality()
        }

        if (changedProperties.has('open') && this.handleStateChange && this.isFloating) {
            if (this.open) {
                void this.show()
            } else {
                void this.hide()
            }
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
     * Converts the already shown floating dialog between modal and non-modal
     * when `no-focus-trap` changes while the rail is open. A modal dialog
     * cannot be demoted in place and `showModal()` throws on an open dialog,
     * so the dialog is closed and re-opened in the requested mode.
     */
    private syncDialogModality(): void {
        const dialog = this.dialog
        if (!dialog?.open) {
            return
        }

        const shouldBeModal = !this.noFocusTrap
        if (dialog.matches(':modal') === shouldBeModal) {
            return
        }

        dialog.close(this.returnValue)
        if (shouldBeModal) {
            dialog.showModal()
        } else {
            // `show()` would run the focusing steps and pull focus back into
            // the rail, defeating the point of disabling the trap.
            dialog.open = true
        }
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
                ?open=${this.isFloating ? nothing : true}
                ?inert=${this.isFloating && !this.open}
                aria-label=${this.getAttribute('aria-label') || nothing}
                aria-modal=${this.isFloating && this.open && !this.noFocusTrap ? 'true' : nothing}
                class=${classMap(this.getRenderClasses())}
                .returnValue=${this.returnValue}
                @cancel=${this.handleDialogCancel}
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

        // A state flip during the await means this show request was
        // superseded; do not put a closed (or docked) rail into the top layer.
        if (!this.open || !this.isFloating) {
            this.isAnimating = false
            return
        }

        // The floating dialog's native `open` attribute is command-managed
        // (see render()), so it is shown here, after the `.open` class landed
        // in the same update — showing it earlier would skip the entrance
        // transition. `showModal()` adds the rail to the top layer, makes the
        // page inert and installs the native focus trap. `show()` keeps it
        // non-modal for `no-focus-trap`; both throw when the dialog is
        // already open, hence the guard.
        const dialog = this.dialog
        const shouldBeModal = !this.noFocusTrap
        if (dialog?.isConnected && dialog.open && dialog.matches(':modal') !== shouldBeModal) {
            // The dialog can be left open in the other mode (e.g. it was
            // docked before); close it so the requested mode applies below.
            dialog.close()
        }
        if (dialog?.isConnected && !dialog.open) {
            if (this.noFocusTrap) {
                dialog.show()
            } else {
                dialog.showModal()
            }
        }

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

        // A re-open (or a switch to a docked variant) during the exit owns the
        // lifecycle now. Leaving the dialog open keeps the fresh state intact;
        // for a docked variant `willUpdate()` already demoted it from modal.
        if (this.open || !this.isFloating) {
            this.isAnimating = false
            return
        }

        // The dialog stayed in the top layer for the whole exit transition;
        // only now is it safe to close it without cutting the motion short.
        const dialog = this.dialog
        if (dialog?.open) {
            dialog.close(returnValue)
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
        if (!this.isFloating || !this.open) return

        if (event.key === 'Tab' && !this.noFocusTrap) {
            this.trapTabKey(event)
            return
        }

        if (event.key !== 'Escape') return

        // This runs before the browser turns Escape into a `<dialog>` close
        // request, so it owns the primary path. Canceling the keydown also
        // suppresses the native `cancel` event, which keeps the exit
        // animation in charge instead of closing the dialog immediately.
        event.preventDefault()
        this.requestCancel('escape')
    }

    /**
     * Cycles Tab / Shift+Tab at the edges of the floating rail.
     *
     * The rail's content is light DOM slotted into the `<dialog>`'s shadow
     * tree. The native modal focus trap only walks the dialog's own DOM
     * containment, so slotted destinations are not recognized as "inside"
     * and the browser would move focus past them (to the body / browser
     * chrome). Wrapping the two edges explicitly keeps the cycle inside the
     * rail without touching the middle of the native tab order.
     */
    private trapTabKey(event: KeyboardEvent): void {
        const focusables = this.getFocusableElements()
        if (focusables.length === 0) {
            event.preventDefault()
            return
        }

        const currentIndex = this.resolveFocusableIndex(
            focusables,
            this.getDeepActiveElement(),
        )
        // The focus is not on a tracked rail focusable (e.g. programmatic
        // focus inside an unrelated shadow root). Leave the native behavior
        // alone rather than guessing a direction.
        if (currentIndex === -1) return

        if (!event.shiftKey && currentIndex === focusables.length - 1) {
            event.preventDefault()
            focusables[0].focus()
            return
        }

        if (event.shiftKey && currentIndex === 0) {
            event.preventDefault()
            focusables[focusables.length - 1].focus()
        }
    }

    /**
     * Tabbable elements of the rail's light DOM, in DOM order.
     *
     * Roving hosts (`mdc-navigation-tab` with `tabindex="-1"`) are excluded;
     * a host without `tabindex` that delegates focus to a tabbable shadow
     * control (`mdc-icon-button`) is included, because that inner control is
     * the actual tab stop.
     */
    private getFocusableElements(): HTMLElement[] {
        return Array.from(this.querySelectorAll<HTMLElement>(
            'mdc-navigation-tab, mdc-icon-button, button, a[href], [tabindex]:not([tabindex="-1"])',
        )).filter((element) => {
            if (element.hasAttribute('disabled')) return false
            if (element.closest('[inert]')) return false
            if (element.getClientRects().length === 0) return false
            if (element.tabIndex >= 0) return true
            return this.hasTabbableShadowControl(element)
        })
    }

    /**
     * Whether the element is a delegate-focus host whose shadow control is a
     * real tab stop. `delegatesFocus` is an init-only option, so the inner
     * control is inspected instead; a `tabindex="-1"` control (navigation
     * tab) must not count.
     */
    private hasTabbableShadowControl(element: HTMLElement): boolean {
        const controls = element.shadowRoot?.querySelectorAll<HTMLElement>(
            'button, a[href], [tabindex]',
        )
        if (!controls) return false

        return Array.from(controls).some(
            (control) => !control.hasAttribute('disabled') && control.tabIndex >= 0,
        )
    }

    /**
     * The actually focused element, crossing open shadow boundaries. In a
     * shadow-DOM host page `document.activeElement` only reports the outer
     * host, which would make every rail element look unfocusable.
     */
    private getDeepActiveElement(): Element | null {
        let active = this.ownerDocument?.activeElement ?? null
        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement
        }
        return active
    }

    /**
     * Maps the deep active element back to the rail-level focusable that owns
     * it (e.g. the inner `<button>` of `mdc-icon-button` -> the host). The
     * light-DOM order is what `getFocusableElements()` returned.
     */
    private resolveFocusableIndex(focusables: HTMLElement[], active: Element | null): number {
        let candidate: Element | null = active
        while (candidate) {
            const index = focusables.indexOf(candidate as HTMLElement)
            if (index !== -1) return index

            const root = candidate.getRootNode()
            candidate = root instanceof ShadowRoot ? root.host : candidate.parentElement
        }
        return -1
    }

    /**
     * Native `cancel` event of the `<dialog>`. `showModal()` makes Escape a
     * browser close request, so this is the fallback for close requests that
     * did not originate from the keydown handler above (e.g. a platform back
     * gesture). The event is always prevented — the dialog must stay open
     * until the CSS exit transition finished.
     */
    protected handleDialogCancel = (event: Event): void => {
        event.preventDefault()
        this.requestCancel('escape')
    }

    /**
     * Dispatches the cancelable `cancel` event and closes the floating rail
     * unless the event was prevented.
     */
    private requestCancel(reason: string): void {
        // Closing already started: the keydown handler and the native
        // `cancel` event can both observe the same Escape press, but only the
        // first one may dispatch `cancel` / start a close.
        if (!this.open || this.isAnimating) return

        const preventCancel = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventCancel) return

        this.lastCloseReason = reason
        // `hide()` takes the dialog return value, never the close reason —
        // scrim/Escape must not leak into `returnValue`/`dialog.returnValue`.
        void this.hide(this.returnValue)
    }
}
