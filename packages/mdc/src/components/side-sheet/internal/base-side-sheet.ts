/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { sideSheetStyles } from '../side-sheet.style'
import {
    SideSheetDragController,
    type ISideSheetDragHost,
} from './side-sheet-drag-controller'
import {
    SideSheetDragCommitCloseAnimation,
    SideSheetDragRelocateAnimation,
    SideSheetDragRevealOpenAnimation,
    SideSheetDragSnapBackAnimation,
    SideSheetDragSnapToPeekAnimation,
    SideSheetCloseAnimation,
    SideSheetOpenAnimation,
    type SideSheetAnimation,
    type SideSheetAnimationArgs,
} from '../side-sheet.animation'
import {
    SIDE_SHEET_ACTION_EVENT,
    SIDE_SHEET_CANCEL_EVENT,
    SIDE_SHEET_CLOSED_EVENT,
    SIDE_SHEET_CLOSING_EVENT,
    SIDE_SHEET_DRAG_END_EVENT,
    SIDE_SHEET_OPENED_EVENT,
    SIDE_SHEET_OPENING_EVENT,
    SIDE_SHEET_RELOCATE_EVENT,
    type ISideSheet,
    type ISideSheetActionEventDetail,
    type ISideSheetCancelEventDetail,
    type ISideSheetClosedEventDetail,
    type ISideSheetDragEndEventDetail,
    type ISideSheetRelocateEventDetail,
    type SideSheetCloseReason,
    type SideSheetHandleMode,
    type SideSheetPosition,
    type SideSheetVariant,
} from '../side-sheet.interface'

const SCRIM_OPACITY_PEAK = 0.32

/**
 * Abstract base for `mdc-side-sheet`. Owns the lifecycle, focus traps,
 * drag controller, and event dispatch. Subclasses define the public tag and the default
 * variant.
 *
 * Open / close motion is WAAPI-driven for the container (its slide does not
 * paint with CSS transitions in the top layer) and CSS-driven for the scrim
 * (`@starting-style` + `allow-discrete`, mirroring the dialog component).
 * The container's transform only paints when the `.open` class is in place
 * BEFORE the native dialog is first shown — see `show()`; this is why the
 * class flip and the dialog promotion are strictly ordered.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/side-sheets/guidelines
 */
export abstract class BaseSideSheet extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
)(LitElement) implements ISideSheet, ISideSheetDragHost {

    public static override styles = sideSheetStyles

    @property({ type: String })
    public variant: SideSheetVariant = 'standard'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    /**
     * Physical edge the sheet docks to. Breaking change vs the former
     * RTL-aware `sheet-edge`: `position` is always physical — `left`
     * anchors to the viewport's left edge in every `dir` context.
     */
    @property({ type: String })
    public position: SideSheetPosition = 'right'

    /**
     * Drag-handle presentation. `open-only` (default) renders the handle on
     * the open sheet and exposes nothing when closed. `peek` keeps a
     * grabbable sliver docked at the edge when closed. `peek` requires
     * `variant='standard'` and `draggable` — throws otherwise.
     */
    @property({ attribute: 'handle-mode' })
    public handleMode: SideSheetHandleMode = 'open-only'

    @property({ type: Number, attribute: 'max-width' })
    public maxWidth: number = 0

    @property({ type: Boolean })
    public quick: boolean = false

    /**
     * Whether Esc and scrim taps dismiss the modal sheet. Custom string-aware
     * converter so `cancelable="false"` is honoured (Lit default treats any
     * present attribute as `true`).
     */
    @property({
        attribute: 'cancelable',
        converter: {
            fromAttribute: (value: string | null) =>
                value !== null && value !== 'false',
            toAttribute: (value: boolean) => (value ? '' : 'false'),
        },
    })
    public cancelable: boolean = true

    @property({ type: Boolean, attribute: 'no-focus-trap' })
    public noFocusTrap: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    @property({ type: Boolean, attribute: 'show-back-button' })
    public showBackButton: boolean = false

    /**
     * Handle-drag gestures (dismiss / relocate / peek reveal).
     */
    @property({
        attribute: 'draggable',
        converter: {
            fromAttribute: (value: string | null) =>
                value !== null && value !== 'false',
            toAttribute: (value: boolean) => (value ? '' : 'false'),
        },
    })
    public override draggable: boolean = true

    @state()
    protected hasHeadline: boolean = false

    @state()
    protected hasContent: boolean = false

    @state()
    protected hasActions: boolean = false

    @state()
    protected hasCloseIcon: boolean = false

    @state()
    protected hasBackIcon: boolean = false

    private lastCloseReason: SideSheetCloseReason = 'programmatic'

    private previouslyFocused: Element | null = null

    /**
     * True while a `hide()` close transition is in flight; `updated()` must
     * not close the native dialog early (that would snap `display: none`
     * over the running exit transition).
     */
    private closeTransitioning = false

    /**
     * Set while a driver that owns its own entrance motion (`show()`,
     * `dragRevealOpen()`) is flipping `open`, so `updated()` must not start
     * a second one for the same state change.
     */
    private suppressOpenAnimation = false

    /**
     * Generation counter guarding show()/hide() sequences: a stale async
     * loop (superseded by a newer open-state change) must not dispatch
     * lifecycle events for a state it no longer owns.
     */
    private session = 0

    /**
     * Cancels any in-flight WAAPI settle animations (drag commit / snap
     * back / relocate / reveal) when a fresh one starts or the sheet
     * disconnects.
     */
    protected cancelAnimations?: AbortController

    @query('dialog')
    protected readonly dialogEl!: HTMLDialogElement | null

    @query('.container')
    protected readonly containerEl!: HTMLElement | null

    @query('.scrim')
    protected readonly scrimEl!: HTMLElement | null

    @query('.handle')
    protected readonly handleEl!: HTMLElement | null

    @query('.close-icon')
    protected readonly closeIconEl!: HTMLElement | null

    public declare ariaLabel: string | null

    private readonly dragController: SideSheetDragController

    public constructor() {
        super()
        this.dragController = new SideSheetDragController(this)
        this.addEventListener(SIDE_SHEET_DRAG_END_EVENT, this.handleDragEnd as EventListener)
    }

    // ── ISideSheetDragHost implementation ───────────────────────────────────
    public containerRef(): HTMLElement | null { return this.containerEl }
    public scrimRef(): HTMLElement | null { return this.scrimEl }
    public handleRef(): HTMLElement | null { return this.handleEl }
    public dragEnabled(): boolean {
        return this.draggable && !this.quick
    }
    public isOpen(): boolean { return this.open }
    public getVariant(): SideSheetVariant { return this.variant }
    public getPosition(): SideSheetPosition { return this.position }
    public getHandleMode(): SideSheetHandleMode { return this.handleMode }
    public peekWidthPx(): number {
        const raw = getComputedStyle(this)
            .getPropertyValue('--_peeked-container-width')
        const parsed = parseFloat(raw)
        return Number.isFinite(parsed) ? parsed : 40
    }
    public onDragCleanup(): void {
        if (this.containerEl) {
            this.containerEl.style.removeProperty('transform')
            this.containerEl.style.removeProperty('cursor')
        }
        if (this.handleEl) this.handleEl.style.removeProperty('cursor')
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        this.removeAttribute('dragged')
    }

    protected getRenderClasses(): Record<string, boolean | string> {
        return {
            'standard'    : this.variant === 'standard',
            'modal'       : this.variant === 'modal',
            'left'        : this.position === 'left',
            'right'       : this.position === 'right',
            'peek'        : this.handleMode === 'peek',
            'draggable'   : this.draggable,
            'open'        : this.open,
            'has-headline': this.hasHeadline,
            'has-content' : this.hasContent,
            'has-actions' : this.hasActions,
            'has-close-icon': this.hasCloseIcon,
            'has-back-icon' : this.hasBackIcon,
            'no-focus-trap': this.noFocusTrap,
            'show-back-button': this.showBackButton,
            'quick'       : this.quick,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <dialog
                class="host ${classMap(this.getRenderClasses())}"
                part="host"
                style=${styleMap(this.maxWidth > 0
                    ? { '--_container-max-width': `${this.maxWidth}px` }
                    : {})}
                .returnValue=${this.returnValue}
                aria-label=${this.ariaLabel || nothing}
                role="dialog"
                @cancel=${this.handleNativeCancel}
                @click=${this.handleHostClick}
                @keydown=${this.handleKeydown}
            >
                ${!this.noFocusTrap ? this.renderFocusTrap('first') : nothing}

                <span class="scrim" aria-hidden="true"></span>

                <div class="container"
                    part="container">
                    ${this.renderElevation()}
                    <span class="peek-grip"
                        aria-hidden="true"
                        @pointerdown=${this.handleHandlePointerDown}></span>
                    <div class="handle"
                        part="handle"
                        @pointerdown=${this.handleHandlePointerDown}>
                        <span class="handle-grip"></span>
                    </div>
                    <header class="headline"
                        part="headline">
                        ${this.renderHeadlineBackIcon()}
                        <h2 class="headline-label">
                            <slot name="headline"
                                @slotchange=${this.handleHeadlineSlotChange}></slot>
                        </h2>
                        <button class="close-icon"
                            type="button"
                            aria-label="Close"
                            @click=${this.handleCloseIconClick}>
                            <slot name="close-icon"
                                @slotchange=${this.handleCloseIconSlotChange}>
                                <svg viewBox="0 0 24 24" width="24" height="24"
                                    fill="currentColor" aria-hidden="true">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41
                                        10.59 12 5 17.59 6.41 19 12 13.41 17.59 19
                                        19 17.59 13.41 12z"/>
                                </svg>
                            </slot>
                        </button>
                    </header>

                    <mdc-divider></mdc-divider>

                    <div class="content">
                        <slot @slotchange=${this.handleContentSlotChange}></slot>
                    </div>

                    <footer class="actions"
                        ?hidden=${!this.hasActions}>
                        <mdc-divider></mdc-divider>
                        <div class="actions-row">
                            <slot name="actions"
                                @slotchange=${this.handleActionsSlotChange}></slot>
                        </div>
                    </footer>
                </div>

                ${!this.noFocusTrap ? this.renderFocusTrap('last') : nothing}
            </dialog>
        `
    }

    protected renderHeadlineBackIcon(): TemplateResult | typeof nothing {
        if (this.variant !== 'modal' || !this.showBackButton) return nothing
        return html`
            <button class="headline-icon"
                type="button"
                aria-label="Back"
                @click=${this.handleBackIconClick}>
                <slot name="headline-icon"
                    @slotchange=${this.handleBackIconSlotChange}></slot>
            </button>
        `
    }

    protected renderFocusTrap(position: 'first' | 'last'): TemplateResult {
        return html`
            <div class="focus-trap focus-trap-${position}"
                tabindex="0"
                @focus=${position === 'first'
                    ? this.handleFirstFocusTrapFocus
                    : this.handleLastFocusTrapFocus}>
            </div>
        `
    }

    public async show(): Promise<void> {
        if (this.open) return
        const session = ++this.session
        await this.updateComplete
        const dialog = this.dialogEl
        if (!dialog || session !== this.session) return
        const container = this.containerEl
        // Read the enter start offset BEFORE the open state flips:
        //  - dialog still displayed (an exit is mid-flight) -> the live
        //    offset of the running animation;
        //  - dialog closed -> its subtree renders no transform
        //    (display: none), so the closed resting offset comes from the
        //    width token.
        const fromTx = container
            ? (dialog.open
                ? this.readTranslateX(container)
                : this.readClosedTranslateX())
            : 0
        // Flip the open state BEFORE the dialog is first shown: updated()
        // promotes the native dialog in the same update, so its first
        // rendered frame already carries the `.open` class. Showing the
        // dialog first and flipping the class afterwards makes Chrome stop
        // painting the container's transform for the whole enter (the
        // slide is skipped on right-docked sheets).
        this.suppressOpenAnimation = true
        this.open = true
        await this.updateComplete
        this.suppressOpenAnimation = false
        if (session !== this.session) return
        // `updated()` normally promotes the dialog; guard for flows that
        // bypass it.
        if (!dialog.open) {
            if (this.variant === 'modal') {
                dialog.showModal()
            } else {
                dialog.show()
            }
        }
        await this.playOpenAnimation(container, fromTx)
        if (session !== this.session) return
        this.dispatchEvent(new Event(
            SIDE_SHEET_OPENED_EVENT,
            { bubbles: true, composed: true },
        ))
        // Focus the first focusable element after the entrance animation.
        requestAnimationFrame(() => {
            if (!this.noFocusTrap) this.focusFirstInside()
        })
    }

    public async hide(): Promise<void> {
        if (!this.open) return
        const session = ++this.session
        // Cancel any in-flight drag before tearing down; the cleanup
        // releases the inline transform so the live offset is readable.
        this.dragController.cancel()
        this.closeTransitioning = true
        const container = this.containerEl
        // Live offset before the class flip: 0 at rest, or the mid-flight
        // value of an interrupted entrance. The exit slides out from there
        // via WAAPI (see SideSheetOpenAnimation on why not CSS).
        const fromTx = container ? this.readTranslateX(container) : 0
        this.open = false
        await this.updateComplete
        if (session !== this.session) return
        if (!this.quick && container) {
            await Promise.all([
                this.animateSideSheet(SideSheetCloseAnimation(this.position, fromTx)),
                this.waitForTransitions(),
            ])
        } else {
            await this.waitForTransitions()
        }
        this.closeTransitioning = false
        if (session !== this.session) return
        if (this.handleMode !== 'peek') this.closeDialog()
        this.dispatchEvent(new CustomEvent<ISideSheetClosedEventDetail>(
            SIDE_SHEET_CLOSED_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    returnValue: this.returnValue,
                    reason: this.lastCloseReason,
                },
            },
        ))
        if (!this.noFocusTrap) this.restoreFocus()
    }

    public async close(returnValue?: string): Promise<void> {
        this.returnValue = returnValue ?? ''
        await this.hide()
    }

    /**
     * Relocate the sheet to the given physical edge with a transition.
     * Called by the drag controller on a midline flip (with a hand-over
     * offset for visual continuity) and exposed publicly for programmatic
     * relocation while the sheet is open. Closed sheets swap instantly.
     */
    public async relocate(position: SideSheetPosition): Promise<void> {
        if (position === this.position) return
        const container = this.containerEl
        if (!container || !this.isConnected || this.quick) {
            this.position = position
            this.dispatchRelocate(position)
            return
        }
        if (!this.open && this.handleMode !== 'peek') {
            // Closed, nothing exposed — the swap is invisible; skip motion.
            this.position = position
            this.dispatchRelocate(position)
            return
        }

        // Measure the visual rect under the OLD dock before anything moves.
        const viewportWidth = container.ownerDocument.defaultView?.innerWidth
            ?? container.getBoundingClientRect().width
        const rect = container.getBoundingClientRect()
        // Hand-over translation expressed against the NEW dock anchor so
        // the container paints the identical visual rect across the swap.
        const newDockLeft = position === 'left' ? 0 : viewportWidth - rect.width
        const newDx = rect.left - newDockLeft
        const openNow = this.open

        // Freeze the visual position before the anchor class flips: the
        // inline transform overrides the class transform, so no jump. The
        // settle animation then carries it to the new resting state, while
        // the `dragged` attribute keeps CSS transitions suppressed.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        container.style.setProperty('transform', `translateX(${newDx}px)`)
        // Drop any scrim opacity the drag interpolated in; the CSS class
        // value takes over (restores the modal scrim after relocation).
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        this.setAttribute('dragged', '')

        this.position = position
        await this.updateComplete
        await this.animateSideSheet(openNow
            ? SideSheetDragRelocateAnimation(newDx)
            : SideSheetDragSnapToPeekAnimation(position, newDx))
        this.endDragSettle(container)
        this.dispatchRelocate(position)
    }

    private dispatchRelocate(position: SideSheetPosition): void {
        this.dispatchEvent(new CustomEvent<ISideSheetRelocateEventDetail>(
            SIDE_SHEET_RELOCATE_EVENT,
            { bubbles: true, composed: true, detail: { position } },
        ))
    }

    // ── Drag-committed close / snap-back / reveal (invoked by drag end) ─────

    public async dragCommittedClose(fromDx?: number): Promise<void> {
        if (!this.open) return
        const scrimCurrent = this.scrimEl
            ? parseFloat(getComputedStyle(this.scrimEl).opacity)
            : 0
        const currentDx = fromDx ?? (this.containerEl
            ? this.readTranslateX(this.containerEl)
            : 0)
        const container = this.containerEl
        // The `dragged` attribute stays on through the settle animation so
        // CSS transitions never fight the WAAPI painting.
        if (container) container.style.removeProperty('cursor')
        if (this.handleEl) this.handleEl.style.removeProperty('cursor')
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        this.lastCloseReason = 'drag'
        // Flip the open state first: the underlying class values already
        // match the animation's end keyframes, so dropping the inline
        // transform afterwards cannot flash.
        this.open = false
        await this.updateComplete
        await this.animateSideSheet(
            SideSheetDragCommitCloseAnimation(this.position, currentDx, scrimCurrent),
        )
        this.endDragSettle(container)
        if (this.handleMode !== 'peek') this.closeDialog()
        this.dispatchEvent(new CustomEvent<ISideSheetClosedEventDetail>(
            SIDE_SHEET_CLOSED_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    returnValue: this.returnValue,
                    reason: 'drag',
                },
            },
        ))
        if (!this.noFocusTrap) this.restoreFocus()
    }

    public async dragSnapBack(fromDx?: number): Promise<void> {
        const scrimCurrent = this.scrimEl
            ? parseFloat(getComputedStyle(this.scrimEl).opacity)
            : SCRIM_OPACITY_PEAK
        const currentDx = fromDx ?? (this.containerEl
            ? this.readTranslateX(this.containerEl)
            : 0)
        const container = this.containerEl
        if (container) container.style.removeProperty('cursor')
        if (this.handleEl) this.handleEl.style.removeProperty('cursor')
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        await this.animateSideSheet(
            SideSheetDragSnapBackAnimation(currentDx, scrimCurrent),
        )
        this.endDragSettle(container)
    }

    /** Snap back to the peek sliver (peek mode, closed sheet). */
    public async dragSnapToPeek(fromDx?: number): Promise<void> {
        const currentDx = fromDx ?? (this.containerEl
            ? this.readTranslateX(this.containerEl)
            : 0)
        const container = this.containerEl
        if (container) container.style.removeProperty('cursor')
        if (this.handleEl) this.handleEl.style.removeProperty('cursor')
        await this.animateSideSheet(
            SideSheetDragSnapToPeekAnimation(this.position, currentDx),
        )
        this.endDragSettle(container)
    }

    /** Commit opening from the peek sliver (peek mode). */
    public async dragRevealOpen(fromDx?: number): Promise<void> {
        const currentDx = fromDx ?? (this.containerEl
            ? this.readTranslateX(this.containerEl)
            : 0)
        const container = this.containerEl
        if (container) container.style.removeProperty('cursor')
        if (this.handleEl) this.handleEl.style.removeProperty('cursor')
        this.suppressOpenAnimation = true
        this.open = true
        await this.updateComplete
        this.suppressOpenAnimation = false
        await this.animateSideSheet(SideSheetDragRevealOpenAnimation(currentDx))
        this.endDragSettle(container)
        this.dispatchEvent(new Event(
            SIDE_SHEET_OPENED_EVENT,
            { bubbles: true, composed: true },
        ))
        requestAnimationFrame(() => {
            if (!this.noFocusTrap) this.focusFirstInside()
        })
    }

    /**
     * Finish a drag settle animation: drop the inline transform while CSS
     * transitions are still suppressed by the `dragged` attribute, commit
     * the jump with a reflow, and only then re-enable transitions.
     *
     * Removing the inline transform after re-enabling transitions would
     * change the computed transform (drag offset → class rest value) and
     * start a CSS transition that REPLAYS the whole settle — the sheet
     * visibly settles twice.
     */
    private endDragSettle(container: HTMLElement | null): void {
        if (container) {
            container.style.removeProperty('transform')
            void container.offsetWidth
        }
        this.removeAttribute('dragged')
    }

    private readTranslateX(el: HTMLElement): number {        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const match = t.match(/matrix\([^)]*\)/)
        if (!match) return 0
        const parts = match[0].slice(7, -1).split(',').map((s) => parseFloat(s.trim()))
        // matrix(a, b, c, d, tx, ty)
        return parts.length >= 5 ? parts[4] : 0
    }

    /**
     * The container's closed resting offset, derived from the docked width
     * token (mirrors the `translateX(...)` of the CSS closed state). Needed
     * because a container inside a `display: none` dialog computes
     * `transform: none`, hiding the closed offset from `readTranslateX`.
     */
    private readClosedTranslateX(): number {
        const dialog = this.dialogEl
        const raw = dialog
            ? getComputedStyle(dialog)
                .getPropertyValue('--_enabled-container-width')
            : ''
        const parsed = parseFloat(raw)
        const width = Number.isFinite(parsed) ? parsed : 0
        return this.position === 'left' ? -width : width
    }

    private handleDragEnd(event: Event): void {
        const detail = (event as CustomEvent<ISideSheetDragEndEventDetail>).detail
        switch (detail.target) {
            case 'closed':
                void this.dragCommittedClose(detail.dx)
                break
            case 'reveal': {
                const run = async (): Promise<void> => {
                    await this.dragRevealOpen(detail.dx)
                    if (detail.relocateTo && detail.relocateTo !== this.position) {
                        await this.relocate(detail.relocateTo)
                    }
                }
                void run()
                break
            }
            case 'peek':
                void this.dragSnapToPeek(detail.dx)
                break
            case 'relocate':
                void this.relocate(detail.relocateTo ?? this.position)
                break
            case 'open':
            default:
                void this.dragSnapBack(detail.dx)
                break
        }
    }

    private handleHandlePointerDown(event: PointerEvent): void {
        this.dragController.handlePointerDown(event)
    }

    /**
     * Close the native `<dialog>` element, removing it from the top layer.
     * Safe to call multiple times — no-ops if the dialog is already closed.
     */
    private closeDialog(): void {
        const dialog = this.dialogEl
        if (!dialog?.open) return
        dialog.close(this.returnValue)
    }

    protected override willUpdate(changed: PropertyValues<this>): void {
        if (changed.has('open')) {
            if (this.open) {
                // Reset here (not in show()) so declaratively-opened sheets
                // get the same fresh state.
                this.lastCloseReason = 'programmatic'
                this.previouslyFocused = this.ownerDocument?.activeElement ?? null
                this.dispatchEvent(new Event(
                    SIDE_SHEET_OPENING_EVENT,
                    { bubbles: true, composed: true },
                ))
            } else {
                this.dispatchEvent(new Event(
                    SIDE_SHEET_CLOSING_EVENT,
                    { bubbles: true, composed: true },
                ))
            }
        }
        if (changed.has('handleMode')) {
            this.validateHandleMode()
        }
    }

    protected override updated(changed: PropertyValues<this>): void {
        if (!changed.has('open') && !changed.has('handleMode')) return
        // Keep the native dialog lifecycle aligned. `peek` mode keeps the
        // dialog rendered permanently so the sliver stays grabbable;
        // otherwise the dialog follows the open state, and declarative
        // attribute-driven changes that bypass show()/hide() are synced
        // here too. The dialog is shown only AFTER the render that applied
        // the `.open` class: Chrome paints the container's entrance
        // transform only when the first displayed frame is already
        // open-classed (see show()).
        const dialog = this.dialogEl
        if (!dialog) return
        if (this.handleMode === 'peek') {
            const wasDisplayed = dialog.open
            if (!dialog.open) {
                dialog.show()
            }
            if (changed.has('open') && this.open && !this.suppressOpenAnimation) {
                void this.autoOpen(wasDisplayed)
            }
            return
        }
        if (this.open) {
            const wasDisplayed = dialog.open
            if (!dialog.open) {
                if (this.variant === 'modal') {
                    dialog.showModal()
                } else {
                    dialog.show()
                }
            }
            if (changed.has('open') && !this.suppressOpenAnimation) {
                void this.autoOpen(wasDisplayed)
            }
        } else if (dialog.open && !this.closeTransitioning) {
            dialog.close(this.returnValue)
        }
    }

    /**
     * Entrance motion for open-state changes that bypass `show()`
     * (declarative `open` attribute / property assignment). Runs from
     * `updated()`, i.e. AFTER the render that applied the `.open` class,
     * so the dialog's first displayed frame already carries the open
     * state.
     */
    private async autoOpen(wasDisplayed: boolean): Promise<void> {
        const container = this.containerEl
        // Mid-flight exit (dialog still displayed) -> live offset; fresh
        // enter -> token-derived closed resting offset.
        const fromTx = wasDisplayed && container
            ? this.readTranslateX(container)
            : this.readClosedTranslateX()
        await this.playOpenAnimation(container, fromTx)
        // A declarative close may have interrupted the entrance.
        if (!this.open) return
        this.dispatchEvent(new Event(
            SIDE_SHEET_OPENED_EVENT,
            { bubbles: true, composed: true },
        ))
        requestAnimationFrame(() => {
            if (!this.noFocusTrap) this.focusFirstInside()
        })
    }

    /**
     * Run the entrance motion: the container is WAAPI-driven (see
     * SideSheetOpenAnimation) while the scrim's CSS transition is awaited
     * through `waitForTransitions`.
     */
    private async playOpenAnimation(
        container: HTMLElement | null,
        fromTx: number,
    ): Promise<void> {
        if (!this.quick && container) {
            await Promise.all([
                this.animateSideSheet(SideSheetOpenAnimation(fromTx)),
                this.waitForTransitions(),
            ])
        } else {
            await this.waitForTransitions()
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.validateHandleMode()
    }

    private validateHandleMode(): void {
        if (this.handleMode !== 'peek') return
        if (this.variant !== 'standard') {
            throw new Error(
                'mdc-side-sheet: handle-mode="peek" requires variant="standard" — a peeked sliver cannot co-exist with a blocking scrim.'
            )
        }
        if (!this.draggable) {
            throw new Error(
                'mdc-side-sheet: handle-mode="peek" requires draggable — the sliver exists only to be dragged.'
            )
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        // Cancel any in-flight animations; otherwise the WAAPI Animation
        // objects would keep ticking against a detached shadow tree.
        this.cancelAnimations?.abort()
        this.dragController.cancel()
        this.closeDialog()
    }

    /**
     * Wait until every CSS transition started by the last open-state change
     * is done. CSS transitions carry no awaitable handle of their own, so
     * the live ones are gathered from the rendered dialog and awaited
     * through the Web Animations `finished` promises.
     */
    private async waitForTransitions(): Promise<void> {
        const animations = [
            ...(this.dialogEl?.getAnimations({ subtree: true }) ?? []),
            ...(this.scrimEl?.getAnimations() ?? []),
        ]
        if (animations.length === 0) return
        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => {
                    // Ignore intentional interruptions (replace or cancel).
                }),
            ),
        )
    }

    private async animateSideSheet(animation: SideSheetAnimation): Promise<void> {
        // Abort any prior in-flight animations. Each prior Animation registered
        // an abort listener below that calls Animation.cancel(); its
        // `finished` Promise then rejects with AbortError, which the
        // `.catch(() => {})` below swallows. The fresh run then takes over.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const sheetContainer = this.containerEl
        const scrim = this.scrimEl
        const isModal = this.variant === 'modal'
        // Standard variant has no scrim; the modal scrim must exist or we
        // bail rather than animating against a missing target.
        if (!sheetContainer || (isModal && !scrim)) return

        const { scrim: scrimArgs, container: containerArgs } = animation

        const targets: Array<[Element, SideSheetAnimationArgs[]]> = [
            [sheetContainer, containerArgs ?? []],
        ]
        if (isModal && scrim) targets.push([scrim, scrimArgs ?? []])

        const animations: Animation[] = []
        for (const [element, args] of targets) {
            for (const a of args) {
                const anim = element.animate(...a)
                this.cancelAnimations!.signal.addEventListener('abort', () => {
                    anim.cancel()
                })
                animations.push(anim)
            }
        }

        await Promise.all(
            animations.map((anim) =>
                anim.finished.catch(() => {
                    // Ignore intentional AbortErrors when calling anim.cancel().
                }),
            ),
        )
    }

    private focusFirstInside(): void {
        const focusable = this.getFocusableElements()
        const target = focusable[0] ?? this.closeIconEl
        target?.focus()
    }

    private restoreFocus(): void {
        const previous = this.previouslyFocused
        if (previous && 'focus' in previous && previous instanceof HTMLElement) {
            previous.focus()
        }
        this.previouslyFocused = null
    }

    private getFocusableElements(): HTMLElement[] {
        const container = this.containerEl
        if (!container) return []
        const candidates = container.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        return Array.from(candidates).filter(
            (el) => !el.hasAttribute('disabled')
                && el.getAttribute('aria-hidden') !== 'true'
                && !el.classList.contains('focus-trap')
        )
    }

    private handleHeadlineSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasHeadline = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleContentSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleCloseIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasCloseIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleBackIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasBackIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleNativeCancel(event: Event): void {
        // Always prevent the browser's default close — we manage the dialog
        // lifecycle ourselves via show()/hide().
        event.preventDefault()
        if (this.variant !== 'modal' || !this.cancelable || !this.open) {
            return
        }
        this.lastCloseReason = 'escape'
        this.dispatchEvent(new CustomEvent<ISideSheetCancelEventDetail>(
            SIDE_SHEET_CANCEL_EVENT,
            { bubbles: true, composed: true, detail: { reason: 'escape' } },
        ))
        void this.hide()
    }

    private handleHostClick(event: MouseEvent): void {
        if (this.variant !== 'modal' || !this.cancelable || !this.open) return
        const path = event.composedPath()
        if (path.some((node) => (node as Element).classList?.contains?.('scrim'))) {
            this.lastCloseReason = 'scrim'
            this.dispatchEvent(new CustomEvent<ISideSheetCancelEventDetail>(
                SIDE_SHEET_CANCEL_EVENT,
                { bubbles: true, composed: true, detail: { reason: 'scrim' } },
            ))
            void this.hide()
        }
    }

    private handleKeydown(_event: KeyboardEvent): void {
        // The native `cancel` event on `<dialog>` already handles Esc.
        // This handler is reserved for future hotkeys (e.g., Ctrl+W) and is
        // intentionally a no-op in v1.
    }

    private handleCloseIconClick(_event: MouseEvent): void {
        this.dispatchEvent(new CustomEvent<ISideSheetActionEventDetail>(
            SIDE_SHEET_ACTION_EVENT,
            { bubbles: true, composed: true, detail: { source: 'close' } },
        ))
        this.lastCloseReason = 'close-button'
        void this.hide()
    }

    private handleBackIconClick(_event: MouseEvent): void {
        this.dispatchEvent(new CustomEvent<ISideSheetActionEventDetail>(
            SIDE_SHEET_ACTION_EVENT,
            { bubbles: true, composed: true, detail: { source: 'back' } },
        ))
        this.lastCloseReason = 'back-button'
        void this.hide()
    }

    private handleFirstFocusTrapFocus(): void {
        // Wrapped from start — jump focus to the last focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[focusable.length - 1].focus()
        }
    }

    private handleLastFocusTrapFocus(): void {
        // Wrapped from end — jump focus to the first focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[0].focus()
        }
    }
}
