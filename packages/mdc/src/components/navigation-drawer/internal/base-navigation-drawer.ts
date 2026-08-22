/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinConnectedPromiseResolve, type IConnectedPromiseResolve } from '../../../utils/behaviors/connected-promise-resolve'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { BaseNavigationContainer } from '../../navigation/internal/base-navigation-container'
import '../../typography/typography'
import {
    NavigationDrawerDefaultCloseAnimation,
    NavigationDrawerDefaultOpenAnimation,
    NavigationDrawerDragCommitCloseAnimation,
    NavigationDrawerDragSnapBackAnimation,
    type NavigationDrawerAnimation,
    type NavigationDrawerAnimationArgs,
} from '../navigation-drawer.animation'
import {
    NavigationDrawerDragController,
    type INavigationDrawerDragHost,
} from './navigation-drawer-drag-controller'
import {
    NAVIGATION_DRAWER_CANCEL_EVENT,
    NAVIGATION_DRAWER_CLOSED_EVENT,
    NAVIGATION_DRAWER_CLOSING_EVENT,
    NAVIGATION_DRAWER_DRAG_END_EVENT,
    NAVIGATION_DRAWER_OPENED_EVENT,
    NAVIGATION_DRAWER_OPENING_EVENT,
    NavigationDrawerEdge,
    NavigationDrawerVariant,
    type INavigationDrawer,
    type INavigationDrawerCancelEventDetail,
    type INavigationDrawerClosedEventDetail,
    type INavigationDrawerDragEndEventDetail,
    type NavigationDrawerCloseReason,
} from '../navigation-drawer.interface'

const SCRIM_OPACITY_PEAK = 0.38

/**
 * Abstract base for `mdc-navigation-drawer`.
 *
 * Provides scope propagation, tab variant auto-syncing, WAAPI animations,
 * swipe-to-dismiss gesture handling, focus traps, and modal/standard/permanent modes.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/navigation-drawer/overview
 * https://m3.material.io/components/navigation-drawer/specs
 */
export abstract class BaseNavigationDrawer extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
    mixinConnectedPromiseResolve,
)(BaseNavigationContainer) implements INavigationDrawer, INavigationDrawerDragHost, IConnectedPromiseResolve {

    @property({ type: String, reflect: true })
    public variant: NavigationDrawerVariant = NavigationDrawerVariant.Modal

    public get isModal(): boolean {
        return this.variant === NavigationDrawerVariant.Modal
    }

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, reflect: true, attribute: 'drawer-edge' })
    public drawerEdge: NavigationDrawerEdge = NavigationDrawerEdge.Start

    @property({ type: String, reflect: true })
    public headline: string = ''

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @property({
        attribute: 'cancelable',
        converter: {
            fromAttribute: (value: string | null) =>
                value !== null && value !== 'false',
            toAttribute: (value: boolean) => (value ? '' : 'false'),
        },
    })
    public cancelable: boolean = true

    @property({
        attribute: 'draggable',
        converter: {
            fromAttribute: (value: string | null) =>
                value !== null && value !== 'false',
            toAttribute: (value: boolean) => (value ? '' : 'false'),
        },
    })
    public override draggable: boolean = true

    @property({ type: Boolean, attribute: 'no-focus-trap' })
    public noFocusTrap: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    @state()
    protected isAtScrollTop: boolean = false

    @state()
    protected isAtScrollBottom: boolean = false

    @state()
    protected hasHeaderSlot: boolean = false

    @state()
    protected hasHeadlineSlot: boolean = false

    @state()
    protected hasFooterSlot: boolean = false

    @query('dialog')
    protected readonly dialogEl!: HTMLDialogElement | null

    @query('div.container')
    protected readonly containerEl!: HTMLElement | null

    @query('.scrim')
    protected readonly scrimEl!: HTMLElement | null

    @query('.top.anchor')
    protected readonly topAnchor!: HTMLElement | null

    @query('.bottom.anchor')
    protected readonly bottomAnchor!: HTMLElement | null

    @query('.scroller')
    protected readonly scroller!: HTMLElement | null

    private lastCloseReason: NavigationDrawerCloseReason = 'programmatic'
    private previouslyFocused: Element | null = null
    private handleOpenChange: boolean = true
    private isAnimating: boolean = false
    private escapePressedWithoutCancel: boolean = false
    private intersectionObserver?: IntersectionObserver
    protected cancelAnimations?: AbortController

    private readonly dragController: NavigationDrawerDragController =
        new NavigationDrawerDragController(this)

    public containerRef = (): HTMLElement | null => this.containerEl
    public scrimRef = (): HTMLElement | null => this.scrimEl
    public enabled = (): boolean => this.draggable && !this.quick
    public getVariant = (): NavigationDrawerVariant => this.variant
    public getDrawerEdge = (): NavigationDrawerEdge => this.drawerEdge

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncTabVariants()
        this.addEventListener(
            NAVIGATION_DRAWER_DRAG_END_EVENT,
            this.handleDragEnd,
        )
    }

    protected override firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties)
        this.setUpScrollObserver()
        this.syncTabVariants()
    }

    public override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('variant')) {
            if (this.variant === 'permanent') {
                this.open = true
            }
            this.syncTabVariants()
        }

        if (changedProperties.has('open') && this.handleOpenChange) {
            if (this.variant === 'permanent') {
                this.open = true
                return
            }
            if (this.open) {
                void this.show()
            } else {
                void this.hide()
            }
        }
    }

    public override disconnectedCallback(): void {
        this.intersectionObserver?.disconnect()
        this.intersectionObserver = undefined
        this.removeEventListener(
            NAVIGATION_DRAWER_DRAG_END_EVENT,
            this.handleDragEnd,
        )
        super.disconnectedCallback()
    }

    /**
     * Imperatively opens the drawer.
     */
    public async show(): Promise<void> {
        if (this.variant === 'permanent') {
            this.open = true
            return
        }

        this.cleanUpDragStyles()
        this.isAnimating = true
        await this.isConnectedPromise
        await this.updateComplete

        const dialog = this.dialogEl
        const isModal = this.isModal

        if (dialog && !dialog.open) {
            this.previouslyFocused = document.activeElement
            if (isModal) {
                dialog.showModal()
            } else {
                dialog.show()
            }
        }

        this.handleOpenChange = false
        this.open = true
        this.handleOpenChange = true

        if (this.scroller) {
            this.scroller.scrollTop = 0
        }

        this.dispatchEvent(
            new CustomEvent(NAVIGATION_DRAWER_OPENING_EVENT, {
                bubbles: true,
                composed: true,
            }),
        )

        if (isModal && !this.quick) {
            await this.animateDrawer(
                NavigationDrawerDefaultOpenAnimation(this.drawerEdge),
            )
        }

        this.cleanUpDragStyles()

        if (isModal && !this.noFocusTrap) {
            const autofocusTarget = this.querySelector<HTMLElement>('[autofocus]')
            if (autofocusTarget) {
                autofocusTarget.focus()
            } else {
                const firstTab = this.querySelector<HTMLElement>('mdc-navigation-tab, button, [tabindex]:not([tabindex="-1"])')
                firstTab?.focus()
            }
        }

        this.dispatchEvent(
            new CustomEvent(NAVIGATION_DRAWER_OPENED_EVENT, {
                bubbles: true,
                composed: true,
            }),
        )
        this.isAnimating = false
    }

    /**
     * Imperatively closes the drawer.
     */
    public async hide(
        reason: NavigationDrawerCloseReason = 'programmatic',
        returnValue: string = this.returnValue,
    ): Promise<void> {
        if (this.variant === 'permanent') {
            return
        }

        this.isAnimating = true
        this.lastCloseReason = reason
        this.returnValue = returnValue
        this.dragController.cancel()

        await this.isConnectedPromise
        await this.updateComplete

        const dialog = this.dialogEl
        const isModal = this.isModal

        this.dispatchEvent(
            new CustomEvent(NAVIGATION_DRAWER_CLOSING_EVENT, {
                bubbles: true,
                composed: true,
            }),
        )

        if (isModal && !this.quick && dialog && dialog.open && reason !== 'drag') {
            await this.animateDrawer(
                NavigationDrawerDefaultCloseAnimation(this.drawerEdge),
            )
        }

        if (dialog && dialog.open) {
            dialog.close(returnValue)
        }

        this.cleanUpDragStyles()

        this.handleOpenChange = false
        this.open = false
        this.handleOpenChange = true

        if (this.previouslyFocused instanceof HTMLElement && document.contains(this.previouslyFocused)) {
            this.previouslyFocused.focus()
            this.previouslyFocused = null
        }

        this.dispatchEvent(
            new CustomEvent<INavigationDrawerClosedEventDetail>(
                NAVIGATION_DRAWER_CLOSED_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason: this.lastCloseReason,
                        returnValue: this.returnValue,
                    },
                },
            ),
        )
        this.isAnimating = false
    }

    /**
     * Convenience close method.
     */
    public async close(returnValue: string = this.returnValue): Promise<void> {
        await this.hide('programmatic', returnValue)
    }

    /**
     * Toggles the drawer open state.
     */
    public async toggle(): Promise<void> {
        if (this.open) {
            await this.hide('programmatic')
        } else {
            await this.show()
        }
    }

    protected getRenderClasses() {
        const isScrollable = !(this.isAtScrollTop && this.isAtScrollBottom)
        const isEffectiveOpen = this.variant === 'permanent' || this.open
        const isModal = this.isModal
        return {
            'dialog': true,
            'modal': isModal,
            'standard': !isModal && this.variant !== 'permanent',
            'permanent': this.variant === 'permanent',
            'open': isEffectiveOpen,
            'closed': !isEffectiveOpen,
            'edge-start': this.drawerEdge === 'start',
            'edge-end': this.drawerEdge === 'end',
            'scrollable': isScrollable,
            'show-top-divider': isScrollable && !this.isAtScrollTop,
            'show-bottom-divider': isScrollable && !this.isAtScrollBottom,
            'has-headline': this.hasHeadlineSlot || Boolean(this.headline),
            'has-header': this.hasHeaderSlot,
            'has-footer': this.hasFooterSlot,
        }
    }

    protected override render(): TemplateResult {
        const isEffectiveOpen = this.variant === 'permanent' || this.open
        return html`
            <dialog
                class=${classMap(this.getRenderClasses())}
                .open=${isEffectiveOpen}
                .returnValue=${this.returnValue}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
                @close=${this.handleClose}
                @keydown=${this.handleKeydown}
            >
                <span
                    aria-hidden="true"
                    class="scrim"
                    @click=${this.handleScrimClick}
                ></span>
                <div
                    class="container"
                    @pointerdown=${this.handlePointerDown}
                    @click=${this.handleContentClick}
                >
                    <div class="header">${this.renderHeaderSlot()}</div>
                    <div class="headline-section">${this.renderHeadlineSection()}</div>
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
                    <div class="footer">${this.renderFooterSlot()}</div>
                    ${this.renderBackground()}
                </div>
            </dialog>
        `
    }

    protected renderHeaderSlot(): TemplateResult {
        return html`
            <slot
                name="header"
                @slotchange=${this.handleHeaderSlotChange}
            ></slot>
        `
    }

    protected renderHeadlineSection(): TemplateResult {
        return html`
            <slot
                name="headline"
                @slotchange=${this.handleHeadlineSlotChange}
            >
                ${this.headline ? html`<mdc-typography variant="title-small" class="headline-text">${this.headline}</mdc-typography>` : nothing}
            </slot>
        `
    }

    protected renderFooterSlot(): TemplateResult {
        return html`
            <slot
                name="footer"
                @slotchange=${this.handleFooterSlotChange}
            ></slot>
        `
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background">
                ${this.renderElevation()}
            </div>
        `
    }

    private handleHeaderSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasHeaderSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleHeadlineSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasHeadlineSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleFooterSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasFooterSlot = slot.assignedNodes({ flatten: true }).length > 0
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

    private syncTabVariants(): void {
        const tabs = this.querySelectorAll<HTMLElement>('mdc-navigation-tab')
        for (const tab of tabs) {
            const explicitVariant = tab.getAttribute('variant')
            if (!explicitVariant || explicitVariant.startsWith('bar') || explicitVariant.startsWith('rail')) {
                (tab as any).variant = 'drawer'
            }
        }
    }

    private readonly handlePointerDown = (event: PointerEvent): void => {
        this.dragController.handlePointerDown(event)
    }

    private readonly handleScrimClick = (): void => {
        if (!this.isModal || !this.cancelable) return

        const preventDefault = !this.dispatchEvent(
            new CustomEvent<INavigationDrawerCancelEventDetail>(
                NAVIGATION_DRAWER_CANCEL_EVENT,
                {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: { reason: 'scrim' },
                },
            ),
        )

        if (preventDefault) return
        void this.hide('scrim')
    }

    private readonly handleDialogClick = (event: MouseEvent): void => {
        if (!this.isModal) return
        if (event.target === this.dialogEl) {
            this.handleScrimClick()
        }
    }

    private readonly handleContentClick = (event: MouseEvent): void => {
        event.stopPropagation()
    }

    private readonly handleCancel = (event: Event): void => {
        if (!this.isModal) return

        event.preventDefault()
        if (!this.cancelable) return

        const preventDefault = !this.dispatchEvent(
            new CustomEvent<INavigationDrawerCancelEventDetail>(
                NAVIGATION_DRAWER_CANCEL_EVENT,
                {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: { reason: 'escape' },
                },
            ),
        )

        if (preventDefault) return
        void this.hide('escape')
    }

    private readonly handleClose = (): void => {
        if (this.escapePressedWithoutCancel) {
            this.escapePressedWithoutCancel = false
            if (this.cancelable) {
                void this.hide('escape')
            }
        }
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (!this.isModal) return

        if (event.key === 'Escape') {
            this.escapePressedWithoutCancel = true
            setTimeout(() => {
                this.escapePressedWithoutCancel = false
            })
        }
    }

    private cleanUpDragStyles(): void {
        if (this.containerEl) {
            this.containerEl.style.removeProperty('transform')
            this.containerEl.style.removeProperty('cursor')
        }
        if (this.scrimEl) {
            this.scrimEl.style.removeProperty('opacity')
        }
        this.removeAttribute('dragged')
        this.removeAttribute('touch-action')
    }

    private readonly handleDragEnd = async (
        event: Event,
    ): Promise<void> => {
        const customEvent = event as CustomEvent<INavigationDrawerDragEndEventDetail>
        const { committed, dx } = customEvent.detail
        const scrimCurrent = this.scrimEl
            ? parseFloat(getComputedStyle(this.scrimEl).opacity) || 0
            : 0

        if (committed) {
            await this.animateDrawer(
                NavigationDrawerDragCommitCloseAnimation(
                    this.drawerEdge,
                    dx,
                    scrimCurrent,
                ),
            )
            this.cleanUpDragStyles()
            void this.hide('drag')
        } else {
            await this.animateDrawer(
                NavigationDrawerDragSnapBackAnimation(
                    this.drawerEdge,
                    dx,
                    scrimCurrent,
                ),
            )
            this.cleanUpDragStyles()
        }
    }

    private async animateDrawer(animation: NavigationDrawerAnimation): Promise<void> {
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const { scrimEl, containerEl } = this
        const elementAndAnimations: Array<[Element | null, NavigationDrawerAnimationArgs[] | undefined]> = [
            [scrimEl, animation.scrim],
            [containerEl, animation.container],
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
}
