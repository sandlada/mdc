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
import { baseBottomSheetStyles } from './base-bottom-sheet.style'
import {
    BottomSheetDragController,
    type IBottomSheetDragHost,
} from './bottom-sheet-drag-controller'
import {
    BottomSheetDefaultCloseAnimation,
    BottomSheetDefaultOpenAnimation,
    BottomSheetDetentChangeAnimation,
    BottomSheetDragCommitCloseAnimation,
    BottomSheetDragSnapBackAnimation,
    type BottomSheetAnimation,
    type BottomSheetAnimationArgs,
} from '../bottom-sheet.animation'
import {
    BOTTOM_SHEET_CANCEL_EVENT,
    BOTTOM_SHEET_CLOSED_EVENT,
    BOTTOM_SHEET_CLOSING_EVENT,
    BOTTOM_SHEET_DRAG_END_EVENT,
    BOTTOM_SHEET_OPENED_EVENT,
    BOTTOM_SHEET_OPENING_EVENT,
    type BottomSheetCloseReason,
    type BottomSheetDetent,
    type BottomSheetVariant,
    type IBottomSheet,
    type IBottomSheetCancelEventDetail,
    type IBottomSheetClosedEventDetail,
    type IBottomSheetDragEndEventDetail,
} from '../bottom-sheet.interface'

const SCRIM_OPACITY_PEAK = 0.32

/**
 * Abstract base for `mdc-bottom-sheet`. Owns the lifecycle, focus traps,
 * drag controller, and event dispatch. Subclasses define the public tag and
 * the default variant.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-sheets/overview
 */
export abstract class BaseBottomSheet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IBottomSheet, IBottomSheetDragHost {

    public static override styles = [baseBottomSheetStyles]

    @property({ type: String })
    public variant: BottomSheetVariant = 'modal'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String })
    public detent: BottomSheetDetent = 'peek'

    @property({ type: Boolean })
    public quick: boolean = false

    /**
     * String-aware converter so `cancelable="false"` is honoured (Lit default
     * treats any present attribute as `true`).
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

    /**
     * Swipe-to-dismiss from the drag handle. Modal default is `true` per
     * the MD3 spec — the handle is the swipe affordance.
     */
    @property({ type: Boolean })
    public override draggable: boolean = true

    /**
     * Hide the visual drag-handle bar. The handle element stays in the
     * shadow DOM so swipe-to-dismiss continues to work from its position.
     */
    @property({ type: Boolean, attribute: 'hide-drag-handle' })
    public hideDragHandle: boolean = false

    @property({ type: Number, attribute: 'max-height' })
    public maxHeight: number = 0

    @state()
    protected hasContent: boolean = false

    private lastCloseReason: BottomSheetCloseReason = 'programmatic'
    private previouslyFocused: Element | null = null

    /**
     * Cancels any in-flight WAAPI animations (scrim + container) when a fresh
     * `show()` or `hide()` interrupts them. Mirrors side-sheet's pattern.
     */
    protected cancelAnimations?: AbortController

    @query('dialog')
    protected readonly dialogEl!: HTMLDialogElement | null

    @query('.container')
    protected readonly containerEl!: HTMLElement | null

    @query('.drag-handle')
    protected readonly dragHandleEl!: HTMLElement | null

    @query('.scrim')
    protected readonly scrimEl!: HTMLElement | null

    public declare ariaLabel: string | null

    private readonly dragController: BottomSheetDragController

    public constructor() {
        super()
        this.dragController = new BottomSheetDragController(this)
        this.addEventListener(BOTTOM_SHEET_DRAG_END_EVENT, this.handleDragEnd as EventListener)
    }

    // ── IBottomSheetDragHost implementation ─────────────────────────────────
    // The drag controller reads these each pointerdown, so they return the
    // current refs rather than caching.
    public dragHandleRef(): HTMLElement | null { return this.dragHandleEl }
    public containerRef(): HTMLElement | null { return this.containerEl }
    public scrimRef(): HTMLElement | null { return this.scrimEl }
    public enabled(): boolean {
        return this.open
            && this.variant === 'modal'
            && this.draggable
            && !this.quick
    }
    public getRestingDetent(): BottomSheetDetent { return this.detent }

    protected getRenderClasses(): Record<string, boolean | string> {
        return {
            'standard'         : this.variant === 'standard',
            'modal'            : this.variant === 'modal',
            [`detent-${this.detent}`]: true,
            'has-content'      : this.hasContent,
            'no-focus-trap'    : this.noFocusTrap,
            'quick'            : this.quick,
            'drag-handle-hidden': this.hideDragHandle,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <dialog
                class="host ${classMap(this.getRenderClasses())}"
                part="host"
                style=${styleMap(this.maxHeight > 0
                    ? { '--_container-max-height': `${this.maxHeight}px` }
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

                <div class="container" part="container">
                    <div class="drag-handle" part="drag-handle" aria-hidden="true">
                        <div class="drag-handle-bar"></div>
                    </div>
                    <div class="content">
                        <slot @slotchange=${this.handleContentSlotChange}></slot>
                    </div>
                </div>

                ${!this.noFocusTrap ? this.renderFocusTrap('last') : nothing}
            </dialog>
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

    // ── Lifecycle: open / close ─────────────────────────────────────────────

    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
        await this.updateComplete
        const dialog = this.dialogEl
        if (!dialog) return
        if (!dialog.open) {
            if (this.variant === 'modal') {
                dialog.showModal()
            } else {
                dialog.show()
            }
        }
        await this.animateBottomSheet(BottomSheetDefaultOpenAnimation())
        this.dispatchEvent(new Event(BOTTOM_SHEET_OPENED_EVENT, {
            bubbles: true, composed: true,
        }))
        requestAnimationFrame(() => {
            if (!this.noFocusTrap) this.focusFirstInside()
        })
    }

    public async hide(): Promise<void> {
        if (!this.open) return
        // Cancel any in-flight drag before tearing down.
        this.dragController.cancel()
        this.open = false
        await this.updateComplete
        await this.animateBottomSheet(BottomSheetDefaultCloseAnimation())
        this.closeDialog()
        this.dispatchEvent(new CustomEvent<IBottomSheetClosedEventDetail>(
            BOTTOM_SHEET_CLOSED_EVENT, {
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

    private closeDialog(): void {
        const dialog = this.dialogEl
        if (!dialog?.open) return
        dialog.close(this.returnValue)
    }

    // ── Drag-committed close / snap-back (invoked by drag controller) ───────

    public async dragCommittedClose(): Promise<void> {
        if (!this.open) return
        const scrimCurrent = this.scrimEl
            ? parseFloat(getComputedStyle(this.scrimEl).opacity)
            : 0
        const fromDy = this.containerEl
            ? this.readTranslateY(this.containerEl)
            : 0
        // Reset the inline styles the drag controller wrote so the WAAPI
        // animation can drive the container / scrim.
        if (this.containerEl) this.containerEl.style.removeProperty('transform')
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        this.removeAttribute('touch-action')
        await this.animateBottomSheet(
            BottomSheetDragCommitCloseAnimation(fromDy, scrimCurrent),
        )
        this.lastCloseReason = 'drag'
        this.open = false
        await this.updateComplete
        this.closeDialog()
        this.dispatchEvent(new CustomEvent<IBottomSheetClosedEventDetail>(
            BOTTOM_SHEET_CLOSED_EVENT, {
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

    public async dragSnapBack(): Promise<void> {
        const scrimCurrent = this.scrimEl
            ? parseFloat(getComputedStyle(this.scrimEl).opacity)
            : SCRIM_OPACITY_PEAK
        const fromDy = this.containerEl
            ? this.readTranslateY(this.containerEl)
            : 0
        if (this.containerEl) this.containerEl.style.removeProperty('transform')
        if (this.scrimEl) this.scrimEl.style.removeProperty('opacity')
        this.removeAttribute('touch-action')
        await this.animateBottomSheet(
            BottomSheetDragSnapBackAnimation(fromDy, scrimCurrent),
        )
    }

    /**
     * Read the y-translation component from a `matrix(a, b, c, d, e, f)` transform.
     * Returns 0 when no inline transform has been set.
     */
    private readTranslateY(el: HTMLElement): number {
        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const match = t.match(/matrix\([^)]*\)/)
        if (!match) return 0
        const parts = match[0].slice(7, -1).split(',').map((s) => parseFloat(s.trim()))
        // matrix(a, b, c, d, tx, ty)
        return parts.length >= 6 ? parts[5] : 0
    }

    // ── willUpdate: open / detent ──────────────────────────────────────────

    protected override willUpdate(changed: PropertyValues<this>): void {
        if (changed.has('open')) {
            if (this.open) {
                this.lastCloseReason = 'programmatic'
                this.previouslyFocused = this.ownerDocument?.activeElement ?? null
                this.dispatchEvent(new Event(
                    BOTTOM_SHEET_OPENING_EVENT, { bubbles: true, composed: true },
                ))
            } else {
                this.dispatchEvent(new Event(
                    BOTTOM_SHEET_CLOSING_EVENT, { bubbles: true, composed: true },
                ))
            }
        }
        if (changed.has('detent') && this.open && this.variant === 'modal') {
            // Detent changed while open + modal — animate between detents.
            const currentOffset = this.containerEl
                ? this.readTranslateY(this.containerEl)
                : 0
            const direction: 'expand' | 'collapse' =
                this.detent === 'full' ? 'expand' : 'collapse'
            void this.animateBottomSheet(BottomSheetDetentChangeAnimation(direction, currentOffset))
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cancelAnimations?.abort()
    }

    // ── Animation helper ───────────────────────────────────────────────────

    private async animateBottomSheet(animation: BottomSheetAnimation): Promise<void> {
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const sheetContainer = this.containerEl
        const scrim = this.scrimEl
        const isModal = this.variant === 'modal'
        if (!sheetContainer || (isModal && !scrim)) return

        const { scrim: scrimArgs, container: containerArgs } = animation

        const targets: Array<[Element, BottomSheetAnimationArgs[]]> = [
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

    // ── Focus helpers ──────────────────────────────────────────────────────

    private focusFirstInside(): void {
        const focusable = this.getFocusableElements()
        const target = focusable[0]
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
                && !el.classList.contains('drag-handle')
        )
    }

    // ── Slot change handlers ───────────────────────────────────────────────

    private handleContentSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedElements({ flatten: true }).length > 0
    }

    // ── Host-level event handlers ──────────────────────────────────────────

    private handleNativeCancel(event: Event): void {
        event.preventDefault()
        if (this.variant !== 'modal' || !this.cancelable || !this.open) return
        this.lastCloseReason = 'escape'
        this.dispatchEvent(new CustomEvent<IBottomSheetCancelEventDetail>(
            BOTTOM_SHEET_CANCEL_EVENT, {
                bubbles: true, composed: true,
                detail: { reason: 'escape' },
            },
        ))
        void this.hide()
    }

    private handleHostClick(event: MouseEvent): void {
        if (this.variant !== 'modal' || !this.cancelable || !this.open) return
        const path = event.composedPath()
        if (path.some((node) => (node as Element).classList?.contains?.('scrim'))) {
            this.lastCloseReason = 'scrim'
            this.dispatchEvent(new CustomEvent<IBottomSheetCancelEventDetail>(
                BOTTOM_SHEET_CANCEL_EVENT, {
                    bubbles: true, composed: true,
                    detail: { reason: 'scrim' },
                },
            ))
            void this.hide()
        }
    }

    private handleKeydown(_event: KeyboardEvent): void {
        // Reserved for future hotkeys; intentionally a no-op in v1.
    }

    private handleFirstFocusTrapFocus(): void {
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[focusable.length - 1].focus()
        }
    }

    private handleLastFocusTrapFocus(): void {
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[0].focus()
        }
    }

    private handleDragEnd(event: Event): void {
        const detail = (event as CustomEvent<IBottomSheetDragEndEventDetail>).detail
        if (detail.committed) {
            void this.dragCommittedClose()
        } else if (detail.reason !== 'cancel') {
            void this.dragSnapBack()
        }
        // 'cancel' reason (horizontal-dominant): drag controller already
        // cleared inline styles; nothing more to do.
    }
}
