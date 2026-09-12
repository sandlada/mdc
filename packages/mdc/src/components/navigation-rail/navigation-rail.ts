/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Navigation Rail container.
 *
 * Supports two modes:
 * - **Standard** (`modal=false`): In-flow side rail that toggles between narrow (collapsed)
 *   and wide (expanded) via CSS transition on `width`.
 * - **Modal** (`modal=true`): Floating overlay above content with a scrim backdrop that enters/exits
 *   via WAAPI animation.
 *
 * Destinations can be aligned to top, center, or bottom via the `alignment` property.
 *
 * @example
 * ```html
 * <!-- Collapsed standard rail -->
 * <mdc-navigation-rail navigation-scope="main-nav">
 *   <mdc-icon-button slot="menu"><mdc-icon>menu</mdc-icon></mdc-icon-button>
 *   <mdc-fab slot="fab" icon="edit" variant="primary"></mdc-fab>
 *   <mdc-navigation-tab name="rail-tabs" value="/home" label="Home" checked>
 *     <mdc-icon slot="inactive-icon">home</mdc-icon>
 *     <mdc-icon slot="active-icon" filled>home</mdc-icon>
 *   </mdc-navigation-tab>
 *   <mdc-navigation-tab name="rail-tabs" value="/search" label="Search">
 *     <mdc-icon slot="inactive-icon">search</mdc-icon>
 *     <mdc-icon slot="active-icon" filled>search</mdc-icon>
 *   </mdc-navigation-tab>
 * </mdc-navigation-rail>
 *
 * <!-- Expanded standard rail -->
 * <mdc-navigation-rail expanded navigation-scope="main-nav-2">
 *   <mdc-icon-button slot="menu"><mdc-icon>menu_open</mdc-icon></mdc-icon-button>
 *   <mdc-navigation-tab name="rail-tabs" value="/home" label="Home" checked>
 *     <mdc-icon slot="inactive-icon">home</mdc-icon>
 *     <mdc-icon slot="active-icon" filled>home</mdc-icon>
 *   </mdc-navigation-tab>
 * </mdc-navigation-rail>
 *
 * <!-- Modal rail -->
 * <mdc-navigation-rail modal open navigation-scope="modal-nav">
 *   <mdc-navigation-tab name="modal-tabs" value="/settings" label="Settings">
 *     <mdc-icon slot="inactive-icon">settings</mdc-icon>
 *   </mdc-navigation-tab>
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
import { mixinXROptions } from '../../utils/xr/xr-options.mixin'
import {
    NavigationRailAlignment,
    NavigationRailCollapsedVariant,
    type INavigationRail,
} from './navigation-rail.interface'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationRailStyles } from './navigation-rail.style'
import '../divider/divider'
import '../elevation/elevation'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail': NavigationRail
    }
}

type AnimationArgs = Parameters<Element['animate']>
interface NavigationRailAnimation {
    dialog?: AnimationArgs[]
    container?: AnimationArgs[]
    scrim?: AnimationArgs[]
}

/**
 * Material Design 3 Navigation Rail.
 *
 * @emits expand — Cancelable. Fires before expansion starts (modal mode).
 * @emits expanded — Expansion complete.
 * @emits collapse — Cancelable. Fires before collapse starts (modal mode).
 * @emits collapsed — Collapse complete.
 * @emits open — Cancelable. Fires before opening modal rail.
 * @emits opened — Modal rail opened.
 * @emits close — Cancelable. Fires before closing modal rail.
 * @emits closed — Modal rail closed.
 * @emits cancel — Cancelable. Fires on backdrop click or Escape key (modal mode).
 */
@customElement('mdc-navigation-rail')
export class NavigationRail extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
    mixinConnectedPromiseResolve,
    mixinXROptions,
)(BaseNavigationContainer) implements INavigationRail, IConnectedPromiseResolve {

    public static override styles = NavigationRailStyles

    /**
     * When `true`, skips all animations:
     * - Standard mode: CSS width `transition` is suppressed.
     * - Modal mode: WAAPI entry/exit animations are skipped.
     */
    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    /**
     * Toggles between collapsed (narrow) and expanded (wide) visual states.
     *
     * - In **Standard mode** (`modal=false`), changes width via CSS transition.
     * - In **Modal mode** (`modal=true`), expands or collapses the floating rail width.
     */
    @property({ type: Boolean, reflect: true })
    public expanded: boolean = false

    /**
     * When `true`, renders as a floating modal overlay with a scrim backdrop.
     * When `false`, renders as an in-flow rail alongside content.
     */
    @property({ type: Boolean, reflect: true })
    public modal: boolean = false

    /**
     * In modal mode, controls whether the modal dialog is open or closed.
     */
    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    /**
     * Determines the tab variant when the rail is collapsed.
     * - `'vertical'`: tabs use `rail-vertical` (icon on top, label underneath).
     * - `'round'`: tabs use `rail-round` (icon only in round container).
     *
     * When expanded, tabs always use `rail-horizontal` regardless of this value.
     */
    @property({ type: String, reflect: true, attribute: 'collapsed-variant' })
    public collapsedVariant: NavigationRailCollapsedVariant = NavigationRailCollapsedVariant.Vertical

    /**
     * Vertical alignment of destination items within the rail.
     * - `'top'`: items aligned to the top (default).
     * - `'center'`: items centered vertically.
     * - `'bottom'`: items aligned to the bottom.
     */
    @property({ type: String, reflect: true })
    public alignment: NavigationRailAlignment = NavigationRailAlignment.Top

    /**
     * Dialog return value in modal mode.
     */
    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    /**
     * When `true` in modal mode, disables automatic focus trapping.
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

    @query('.scrim')
    protected readonly scrimEl!: HTMLElement | null

    private handleStateChange: boolean = true
    protected isAnimating: boolean = false
    private previouslyFocused: Element | null = null
    protected cancelAnimations: AbortController | null = null
    protected intersectionObserver?: IntersectionObserver
    protected escapePressedWithoutCancel: boolean = false

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncTabVariants()
    }

    protected override firstUpdated(): void {
        super.firstUpdated()
        this.syncTabVariants()
        this.setUpScrollObserver()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('modal') && this.modal && this.open && !this.dialog?.open) {
            void this.show()
        }

        if (changedProperties.has('open') && this.handleStateChange && this.modal) {
            if (this.open) {
                void this.show()
            } else {
                void this.hide()
            }
        }

        if (
            changedProperties.has('expanded') ||
            changedProperties.has('collapsedVariant') ||
            changedProperties.has('xr') ||
            changedProperties.has('alignment')
        ) {
            this.syncTabVariants()
        }
    }

    public override disconnectedCallback(): void {
        this.cancelAnimations?.abort()
        this.intersectionObserver?.disconnect()
        this.intersectionObserver = undefined
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
        if (this.expanded) {
            return 'rail-horizontal'
        }
        if (this.collapsedVariant === 'round') {
            return this.xr ? 'rail-xr-round' : 'rail-round'
        }
        return this.xr ? 'rail-xr-vertical' : 'rail-vertical'
    }

    public override getRenderClasses() {
        const isScrollable = !(this.isAtScrollTop && this.isAtScrollBottom)
        const isEffectiveOpen = this.modal ? this.open : true
        return ({
            ...super.getRenderClasses(),
            'dialog': true,
            'modal': this.modal,
            'standard': !this.modal,
            'open': isEffectiveOpen,
            'closed': !isEffectiveOpen,
            'expanded': this.expanded,
            'collapsed': !this.expanded,
            'collapsed-xr': this.xr && !this.expanded,
            'align-top': this.alignment === 'top',
            'align-center': this.alignment === 'center',
            'align-bottom': this.alignment === 'bottom',
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
                ?open=${this.modal ? this.open : true}
                class=${classMap(this.getRenderClasses())}
                .returnValue=${this.returnValue}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
                @close=${this.handleClose}
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
     */
    public async expand(): Promise<void> {
        await this.isConnectedPromise

        if (!this.modal) {
            this.expanded = true
            await this.updateComplete
            this.syncTabVariants()
            this.dispatchEvent(new Event('expanded'))
            return
        }

        // Modal mode
        if (!this.open) {
            await this.show()
        }

        this.expanded = true
        await this.updateComplete
        this.syncTabVariants()
        this.dispatchEvent(new Event('expanded'))
    }

    /**
     * Collapses the navigation rail.
     */
    public async collapse(returnValue = this.returnValue): Promise<void> {
        await this.isConnectedPromise

        this.expanded = false
        this.returnValue = returnValue
        await this.updateComplete
        this.syncTabVariants()
        this.dispatchEvent(new Event('collapsed'))
    }

    /**
     * Opens the navigation rail (modal mode).
     */
    public async show(): Promise<void> {
        if (!this.modal) {
            await this.expand()
            return
        }

        if (this.isAnimating || (this.open && this.dialog?.open)) {
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

        const dialog = this.dialog
        if (dialog && !dialog.open) {
            dialog.showModal()
        }

        if (this.scroller) {
            this.scroller.scrollTop = 0
        }

        if (!this.quick) {
            await this.animateRail(this.getOpeningAnimation())
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
        this.dispatchEvent(new Event('opened'))
        this.dispatchEvent(new Event('expanded'))
    }

    /**
     * Closes the navigation rail (modal mode).
     */
    public async hide(returnValue = this.returnValue): Promise<void> {
        if (!this.modal) {
            await this.collapse(returnValue)
            return
        }

        if (this.isAnimating || (!this.open && !this.dialog?.open)) {
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

        if (!this.quick && this.dialog?.open) {
            await this.animateRail(this.getClosingAnimation())
        }

        if (this.dialog && this.dialog.open) {
            this.dialog.close(returnValue)
        }

        this.handleStateChange = false
        this.open = false
        this.handleStateChange = true

        if (this.previouslyFocused instanceof HTMLElement && document.contains(this.previouslyFocused)) {
            this.previouslyFocused.focus()
            this.previouslyFocused = null
        }

        this.isAnimating = false
        this.dispatchEvent(new Event('closed'))
        this.dispatchEvent(new Event('collapsed'))
    }

    /**
     * Convenience method to close modal rail.
     */
    public async close(returnValue = this.returnValue): Promise<void> {
        await this.hide(returnValue)
    }

    /**
     * Toggles the rail between expanded and collapsed (or show/hide).
     */
    public async toggle(): Promise<void> {
        if (this.modal) {
            if (this.open) {
                await this.hide()
            } else {
                await this.show()
            }
        } else {
            if (this.expanded) {
                await this.collapse()
            } else {
                await this.expand()
            }
        }
    }

    protected getOpeningAnimation(): NavigationRailAnimation {
        return {
            container: [
                [
                    [
                        { transform: 'translateX(-100%)', opacity: '0.6' },
                        { transform: 'translateX(0)', opacity: '1' },
                    ],
                    { duration: 300, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)' },
                ],
            ],
            scrim: [
                [
                    [
                        { opacity: '0' },
                        { opacity: '0.38' },
                    ],
                    { duration: 250, easing: 'linear' },
                ],
            ],
        }
    }

    protected getClosingAnimation(): NavigationRailAnimation {
        return {
            container: [
                [
                    [
                        { transform: 'translateX(0)', opacity: '1' },
                        { transform: 'translateX(-100%)', opacity: '0.6' },
                    ],
                    { duration: 200, easing: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)' },
                ],
            ],
            scrim: [
                [
                    [
                        { opacity: '0.38' },
                        { opacity: '0' },
                    ],
                    { duration: 200, easing: 'linear' },
                ],
            ],
        }
    }

    private async animateRail(animation: NavigationRailAnimation): Promise<void> {
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const { container, scrimEl } = this
        const elementAndAnimations: Array<[Element | null, AnimationArgs[] | undefined]> = [
            [container, animation.container],
            [scrimEl, animation.scrim],
        ]

        const animations: Animation[] = []
        for (const [element, animList] of elementAndAnimations) {
            if (!element || !animList) continue
            for (const args of animList) {
                const anim = element.animate(...args)
                this.cancelAnimations.signal.addEventListener('abort', () => {
                    anim.cancel()
                })
                animations.push(anim)
            }
        }

        await Promise.all(
            animations.map((anim) => anim.finished.catch(() => {})),
        )
    }

    protected handleScrimClick = (): void => {
        if (!this.modal || !this.open) return

        const preventCancel = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventCancel) return

        void this.hide('scrim')
    }

    protected handleDialogClick = (event: MouseEvent): void => {
        if (!this.modal) return
        if (event.target === this.dialog) {
            this.handleScrimClick()
        }
    }

    protected handleContentClick = (event: MouseEvent): void => {
        event.stopPropagation()
    }

    protected handleCancel = (event: Event): void => {
        if (!this.modal) return

        event.preventDefault()
        if (!this.open) return

        const preventDefault = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventDefault) return

        void this.hide('escape')
    }

    protected handleClose = (): void => {
        if (!this.escapePressedWithoutCancel) {
            return
        }
        this.escapePressedWithoutCancel = false
        this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
    }

    protected handleKeydown = (event: KeyboardEvent): void => {
        if (!this.modal) return

        if (event.key !== 'Escape') return

        this.escapePressedWithoutCancel = true
        setTimeout(() => {
            this.escapePressedWithoutCancel = false
        })
    }
}

