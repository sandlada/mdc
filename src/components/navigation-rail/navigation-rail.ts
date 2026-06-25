/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation rail container.
 *
 * Supports two modes:
 * - **Standard** (`modal=false`): In-flow rail that toggles between narrow (collapsed)
 *   and wide (expanded) via CSS transition on `width`.
 * - **Modal** (`modal=true`): Floating overlay that enters/exits via WAAPI animation.
 *   Width toggle also applies between collapsed↔expanded modal widths.
 *
 * @example
 * ```html
 * <!-- Standard rail -->
 * <mdc-navigation-rail navigation-scope="main-nav">
 *   <mdc-navigation-tab name="rail-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="rail-tabs" value="/settings">Settings</mdc-navigation-tab>
 * </mdc-navigation-rail>
 *
 * <!-- Expanded standard rail -->
 * <mdc-navigation-rail expanded navigation-scope="main-nav-2">
 *   <mdc-navigation-tab name="rail-tabs" value="/home" variant="rail-vertical">
 *     <mdc-icon slot="inactive-icon">send</mdc-icon>
 *   </mdc-navigation-tab>
 * </mdc-navigation-rail>
 *
 * <!-- Modal rail -->
 * <mdc-navigation-rail expanded modal navigation-scope="modal-nav">
 *   <mdc-navigation-tab name="modal-tabs" value="/settings">Settings</mdc-navigation-tab>
 * </mdc-navigation-rail>
 * ```
 *
 * @prop {boolean} expanded — Toggles between collapsed/expanded. In standard mode
 *   this changes width via CSS transition; in modal mode it controls dialog show/hide.
 * @prop {boolean} modal — When true, renders as a floating modal overlay instead of in-flow.
 * @prop {boolean} quick — Skip all animations (both CSS transition and WAAPI).
 *
 * @emits expand — Cancelable. Fires before expansion starts (modal mode only).
 * @emits expanded — Expansion complete.
 * @emits collapse — Cancelable. Fires before collapse starts (modal mode only).
 * @emits collapsed — Collapse complete.
 * @emits cancel — Cancelable. Fires on backdrop click (modal mode only).
 *
 * @version
 * Material Design 3 - Expressive
 */
import { customElement, property, query, state } from 'lit/decorators.js'
import { BaseNavigationContainer } from '../navigation/internal/base-navigation-container'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinConnectedPromiseResolve, type IConnectedPromiseResolve } from '../../utils/behaviors/connected-promise-resolve'
import { mixinXROptions } from '../../utils/xr/mixin-xr-options'
import { NavigationRailCollapsedVariant, type INavigationRail } from './navigation-rail.interface'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'
import { html, type PropertyValues, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { NavigationRailStyles } from './navigation-rail.style'

type AnimationArgs = Parameters<Element['animate']>
interface NavigationRailAnimation {
    dialog: AnimationArgs[]
    container?: AnimationArgs[]
    destination?: AnimationArgs[]
}

/**
 * @example
 * ```html
 * <mdc-navigation-rail expanded navigation-scope="main-nav-2">
 *     <mdc-navigation-tab name="dsjdvfq" value="/" checked label="Label Home" variant="rail-vertical">
 *         <mdc-icon slot="inactive-icon">send</mdc-icon>
 *         <mdc-icon slot="active-icon" filled>send</mdc-icon>
 *     </mdc-navigation-tab>
 *     <mdc-navigation-tab name="dsjdvfq" value="/page2" label="Label Home" variant="rail-vertical">
 *         <mdc-icon slot="inactive-icon">send</mdc-icon>
 *         <mdc-icon slot="active-icon" filled>send</mdc-icon>
 *     </mdc-navigation-tab>
 * </mdc-navigation-rail>
 * ```
 *
 * @emits expand
 * @emits expanded
 * @emits collapse
 * @emits collapsed
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @implements
 * Expanded: YES
 * Collapsed: YES
 * CollapsedXR
 * Modal
 */
@customElement('mdc-navigation-rail')
export class NavigationRail extends composeMixin(
    mixinConnectedPromiseResolve,
    mixinXROptions
)(BaseNavigationContainer) implements INavigationRail, IConnectedPromiseResolve {

    static override styles = NavigationRailStyles

    /**
     * When `true`, skip all animations:
     * - Standard mode: CSS `transition` is suppressed.
     * - Modal mode: WAAPI entry/exit animations are skipped.
     */
    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    /**
     * Toggles between collapsed (narrow) and expanded (wide) visual states.
     *
     * - **Standard mode** (`modal=false`): in-flow rail; width changes via CSS transition.
     * - **Modal mode** (`modal=true`): floating overlay; `true` shows the dialog,
     *   `false` closes it. Width within each state follows the same CSS transition.
     *
     * Setting this property calls {@link expand} or {@link collapse} via the
     * `updated()` lifecycle, decoupled from the property accessor itself.
     */
    @property({ type: Boolean, reflect: true })
    public expanded: boolean = false

    /**
     * When `true`, renders as a floating modal overlay.
     * When `false`, renders as an in-flow rail (standard).
     *
     * This property does NOT change at runtime after initial render — it
     * determines the fundamental layout strategy. Changing it dynamically
     * is not a supported flow.
     */
    @property({ type: Boolean, reflect: true })
    public modal: boolean = false

    /**
     * Determines the tab variant when the rail is collapsed.
     * - `'vertical'`: tabs use `rail-vertical`
     * - `'round'`: tabs use `rail-round`
     *
     * When expanded, tabs always use `rail-horizontal` regardless of this value.
     */
    @property({ type: String, reflect: true, attribute: 'collapsed-variant' })
    public collapsedVariant: NavigationRailCollapsedVariant = NavigationRailCollapsedVariant.Vertical

    @state()
    protected isAtScrollTop = false
    @state()
    protected isAtScrollBottom = false

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
    protected readonly container!: HTMLDialogElement | null

    /**
     * Guard to prevent `updated()` from re-entering expand/collapse when
     * those methods internally revert the `expanded` property.
     */
    private handleExpandedChange = true

    protected isExpanding = false
    public returnValue: string = ''
    protected nextClickIsFromContent = false
    protected intersectionObserver?: IntersectionObserver
    protected escapePressedWithoutCancel = false

    protected override firstUpdated() {
        super.firstUpdated()
        this.syncTabVariants()

        // Re-sync variants when tabs are added/removed from the slot
        this.shadowRoot?.querySelector('slot')?.addEventListener('slotchange', () => {
            this.syncTabVariants()
        })

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    this.handleAnchorIntersection(entry)
                }
            },
            {root: this.scroller!},
        )

        this.intersectionObserver.observe(this.topAnchor!)
        this.intersectionObserver.observe(this.bottomAnchor!)
    }

    /**
     * Drives {@link expand}/{@link collapse} when the `expanded` property changes.
     * The `handleExpandedChange` guard prevents re-entry when expand/collapse
     * internally revert the property (e.g. on cancel).
     */
    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('expanded') && this.handleExpandedChange) {
            if (this.expanded) {
                void this.expand()
            } else {
                void this.collapse()
            }
        }
        if (changedProperties.has('expanded') || changedProperties.has('collapsedVariant') || changedProperties.has('xr')) {
            this.syncTabVariants()
        }
    }

    private handleAnchorIntersection(entry: IntersectionObserverEntry) {
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
        const scrollable = !(this.isAtScrollTop && this.isAtScrollBottom)
        return ({
            ...super.getRenderClasses(),
            'modal': this.modal,
            'standard': !this.modal,
            'expanded': this.expanded,
            'collapsed-xr': this.xr && !this.expanded,
            'collapsed': !this.expanded,
            'scrollable': scrollable,
            'show-top-divider': scrollable && !this.isAtScrollTop,
            'show-bottom-divider': scrollable && !this.isAtScrollBottom,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <span aria-hidden="true" class="scrim"></span>
            <dialog
                open
                class=${classMap(this.getRenderClasses())}
                .returnValue=${this.returnValue}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
                @close=${this.handleClose}
                @keydown=${this.handleKeydown}
            >
                <div class="container" @click=${this.handleContentClick}>
                    <div class="menu-and-fab">
                        <div class="menu">${this.renderMenuSlot()}</div>
                        <div class="fab">${this.renderFabSlot()}</div>
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
                    <div class="end">${this.renderEndSlot()}</div>
                    ${this.renderBackground()}
                </div>
            </dialog>
        `
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background"></div>
        `
    }
    protected renderMenuSlot() {
        return html`<slot name="menu"></slot>`
    }
    protected renderFabSlot() {
        return html`<slot name="fab"></slot>`
    }
    protected renderEndSlot() {
        return html`<slot name="end"></slot>`
    }

    protected getExpandingAnimation(): NavigationRailAnimation {
        return {
            dialog: [
                [
                    [
                        { 'transform': 'translateX(-50px)', 'opacity': '0' },
                        { 'transform': 'translateX(0px)', 'opacity': '1' },
                    ],
                    { duration: 500, }
                ]
            ]
        }
    }
    protected getCollapsingAnimation(): NavigationRailAnimation {
        return {
            dialog: [
                [
                    [
                        { 'transform': 'translateX(0px)', 'opacity': '1' },
                        { 'transform': 'translateX(-50px)', 'opacity': '0' },
                    ],
                    { duration: 500, }
                ]
            ]
        }
    }

    private cancelAnimations: AbortController | null = null
    public async expand(): Promise<void> {
        this.isExpanding = true
        await this.isConnectedPromise
        await this.updateComplete

        // ── Standard mode: no dialog lifecycle ──────────────────────
        // The `expanded` property change triggers CSS class switching.
        // Width change is handled by CSS `transition` on `.container`.
        if (!this.modal) {
            this.handleExpandedChange = false
            this.expanded = true
            this.handleExpandedChange = true
            this.dispatchEvent(new Event('expanded'))
            this.isExpanding = false
            return
        }

        // ── Modal mode: dialog show/hide + entry animation ──────────
        const dialog = this.dialog!
        // Check if already opened or if `collapse()` was called while awaiting.
        if (dialog.open || !this.isExpanding) {
            this.isExpanding = false
            return
        }

        const preventOpen = !this.dispatchEvent(
            new Event('expand', { cancelable: true }),
        )
        if (preventOpen) {
            // Revert property without re-triggering updated()
            this.handleExpandedChange = false
            this.expanded = false
            this.handleExpandedChange = true
            this.isExpanding = false
            return
        }

        // All Material dialogs are modal.
        dialog.showModal()
        // Sync property so CSS classes reflect expanded state during animation.
        this.handleExpandedChange = false
        this.expanded = true
        this.handleExpandedChange = true
        // Reset scroll position if re-opening a dialog with the same content.
        if (this.scroller) {
            this.scroller.scrollTop = 0
        }
        // Native modal dialogs ignore autofocus and instead force focus to the
        // first focusable child. Override this behavior if there is a child with
        // an autofocus attribute.
        this.querySelector<HTMLElement>('[autofocus]')?.focus()

        await this.animateHost(this.getExpandingAnimation())
        this.dispatchEvent(new Event('expanded'))
        this.isExpanding = false
    }
    public async collapse(returnValue = this.returnValue): Promise<void> {
        this.isExpanding = false
        if (!this.isConnected) {
            this.handleExpandedChange = false
            this.expanded = false
            this.handleExpandedChange = true
            return
        }

        await this.updateComplete

        // ── Standard mode: no dialog lifecycle ──────────────────────
        if (!this.modal) {
            this.handleExpandedChange = false
            this.expanded = false
            this.handleExpandedChange = true
            this.dispatchEvent(new Event('collapsed'))
            return
        }

        // ── Modal mode: exit animation + dialog close ───────────────
        const dialog = this.dialog!
        // Check if already closed or if `expand()` was called while awaiting.
        if (!dialog.open || this.isExpanding) {
            this.handleExpandedChange = false
            this.expanded = false
            this.handleExpandedChange = true
            return
        }

        const prevReturnValue = this.returnValue
        this.returnValue = returnValue
        const preventClose = !this.dispatchEvent(
            new Event('collapse', { cancelable: true }),
        )
        if (preventClose) {
            this.returnValue = prevReturnValue
            return
        }

        await this.animateHost(this.getCollapsingAnimation())
        dialog.close(returnValue)

        this.handleExpandedChange = false
        this.expanded = false
        this.handleExpandedChange = true
        this.dispatchEvent(new Event('collapsed'))
    }
    private async animateHost(animation: NavigationRailAnimation) {
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const { dialog, container, destination } = this
        if(!dialog || !container || !destination) return

        const {
            dialog: dialogAnimate,
            container: containerAnimate,
            destination: destinationAnimate,
        } = animation

        const elementAndAnimation: Array<[Element, AnimationArgs[]]> = [
            [dialog, dialogAnimate ?? []],
            [container, containerAnimate ?? []],
            [destination, destinationAnimate ?? []],
        ]

        const animations: Array<Animation> = []
        for(const [element, animation] of elementAndAnimation) {
            for(const animateArgs of animation) {
                const _animation = element.animate(...animateArgs)
                this.cancelAnimations.signal.addEventListener('abort', () => {
                    _animation.cancel()
                })
                animations.push(_animation)
            }
        }

        await Promise.all(animations.map((animation) => {
            animation.finished.catch(() => {})
        }))
    }

    protected handleDialogClick() {
        // Dialog backdrop clicks only apply in modal mode.
        if (!this.modal) return

        if (this.nextClickIsFromContent) {
            // Avoid doing a layout calculation below if we know the click came from
            // content.
            this.nextClickIsFromContent = false
            return
        }

        // Click originated on the backdrop. Native `<dialog>`s will not cancel,
        // but Material dialogs do.
        const preventDefault = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventDefault) {
            return
        }

        this.collapse()
    }
    protected handleContentClick() {
        this.nextClickIsFromContent = true
    }
    protected handleSubmit(event: SubmitEvent) {
        // Dialog method handling only applies in modal mode.
        if (!this.modal) return

        const form = event.target as HTMLFormElement
        const { submitter } = event
        if (form.getAttribute('method') !== 'dialog' || !submitter) {
            return
        }

        // Close reason is the submitter's value attribute, or the dialog's
        // `returnValue` if there is no attribute.
        this.collapse(submitter.getAttribute('value') ?? this.returnValue)
    }
    protected handleCancel(event: Event) {
        // Native dialog cancel only applies in modal mode.
        if (!this.modal) return

        if (event.target !== this.container) {
            // Ignore any cancel events dispatched by content.
            return
        }
        this.escapePressedWithoutCancel = false
        const preventDefault = redispatchEvent(this, event)
        // We always prevent default on the original dialog event since we'll
        // animate closing it before it actually closes.
        event.preventDefault()
        if (preventDefault) {
            return
        }

        this.collapse()
    }
    protected handleClose() {
        if (!this.escapePressedWithoutCancel) {
            return
        }
        this.escapePressedWithoutCancel = false
        this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
    }
    protected handleKeydown(event: KeyboardEvent) {
        // Chrome v120 escape bug workaround — only relevant for modal dialogs.
        if (!this.modal) return

        if (event.key !== 'Escape') {
            return
        }
        // An escape key was pressed. If a "close" event fires next without a
        // "cancel" event first, then we know we're in the Chrome v120 bug.
        this.escapePressedWithoutCancel = true
        // Wait a full task for the cancel/close event listeners to fire, then
        // reset the flag.
        setTimeout(() => {
            this.escapePressedWithoutCancel = false
        })
    }

}
