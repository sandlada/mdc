/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import '../elevation/elevation'
import {
    SnackbarActionEvent,
    SnackbarAnimationMode,
    SnackbarClosedEvent,
    SnackbarClosingEvent,
    SnackbarDuration,
    SnackbarOpenedEvent,
    SnackbarOpeningEvent,
    SnackbarResult,
    SnackbarVariant,
    type ISnackbar,
    type ISnackbarActionEventDetail,
    type ISnackbarCloseEventDetail,
} from './snackbar.interface'
import { SnackbarStyles } from './snackbar.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-snackbar': MDCSnackbar
    }
}

const OpenAnimationDurationMs = 250
const CloseAnimationDurationMs = 150
const SwipeSlopPx = 8
const SwipeDismissThresholdRatio = 0.35
const SwipeDismissVelocityPxPerMs = 0.5

/**
 * @element mdc-snackbar
 *
 * A brief message displayed at the bottom (or top) of the screen.
 * Can include an optional leading icon, action button, and close icon.
 * Supports Android-style swipe-to-dismiss, auto-hide pause on hover/focus,
 * and `action-on-new-line` layout.
 *
 * @slot - The snackbar message text.
 * @slot icon - Optional leading icon.
 * @slot action - Optional action button.
 * @slot close-icon - Optional close icon button.
 *
 * @fires snackbar-opening - Dispatched when the snackbar starts opening.
 * @fires snackbar-opened - Dispatched when the snackbar is fully open.
 * @fires snackbar-closing - Dispatched when the snackbar starts closing (`detail.reason`).
 * @fires snackbar-closed - Dispatched when the snackbar is fully closed (`detail.reason`).
 * @fires snackbar-action - Dispatched when the action button is clicked (cancelable to prevent auto-dismiss).
 *
 * @cssproperty --mdc-snackbar-enabled-container-color
 * @cssproperty --mdc-snackbar-container-shape-start-start
 * @cssproperty --mdc-snackbar-container-shape-start-end
 * @cssproperty --mdc-snackbar-container-shape-end-start
 * @cssproperty --mdc-snackbar-container-shape-end-end
 * @cssproperty --mdc-snackbar-enabled-label-color
 * @cssproperty --mdc-snackbar-enabled-action-text-color
 * @cssproperty --mdc-snackbar-enabled-close-icon-color
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/snackbar/overview
 */
@customElement('mdc-snackbar')
export class MDCSnackbar extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ISnackbar {

    static override styles = SnackbarStyles

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, attribute: 'duration', reflect: true })
    public duration: SnackbarDuration | number = SnackbarDuration.Short

    @property({ type: String, attribute: 'animation-mode', reflect: true })
    public animationMode: SnackbarAnimationMode = SnackbarAnimationMode.Slide

    @property({ type: Boolean, reflect: true })
    public multiline: boolean = false

    @property({ type: Boolean, attribute: 'action-on-new-line', reflect: true })
    public actionOnNewLine: boolean = false

    @property({ type: Boolean, attribute: 'swipe-to-dismiss', reflect: true })
    public swipeToDismiss: boolean = true

    @property({ type: Boolean, attribute: 'has-close-icon', reflect: true })
    public hasCloseIcon: boolean = false

    @property({ type: String, reflect: true })
    public variant: SnackbarVariant = SnackbarVariant.InverseSurface

    @state()
    public hasAction: boolean = false

    @state()
    public hasIcon: boolean = false

    @state()
    private hasSlottedCloseIcon: boolean = false

    @state()
    private isClosing: boolean = false

    @state()
    private isDragging: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    @query('.action')
    protected readonly actionButton!: HTMLButtonElement | null

    @query('.close-icon')
    protected readonly closeButton!: HTMLButtonElement | null

    private autoHideTimer: ReturnType<typeof setTimeout> | null = null
    private openAnimationTimer: ReturnType<typeof setTimeout> | null = null
    private closeAnimationTimer: ReturnType<typeof setTimeout> | null = null
    private remainingDurationMs: number | null = null
    private timerStartedAt: number = 0
    private isHovered: boolean = false
    private isFocusedWithin: boolean = false
    private pendingCloseReason: SnackbarResult = SnackbarResult.Dismiss

    // Swipe-to-dismiss tracking
    private activePointerId: number | null = null
    private dragStartX: number = 0
    private dragStartY: number = 0
    private dragStartTime: number = 0
    private currentDragDx: number = 0

    public constructor() {
        super()
        if (typeof window === 'undefined') {
            return
        }
        this.addEventListener('pointerenter', this.handlePointerEnter)
        this.addEventListener('pointerleave', this.handlePointerLeave)
        this.addEventListener('focusin', this.handleFocusIn)
        this.addEventListener('focusout', this.handleFocusOut)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.hasAttribute('open')) {
            this.open = true
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearAutoHideTimer()
        this.clearAnimationTimers()
        this.resetDragStyles()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('open')) {
            if (this.open) {
                this.handleOpen()
            } else if (changedProperties.get('open') === true) {
                this.handleClose()
            }
        }
        if (changedProperties.has('duration') && this.open && !this.isClosing) {
            this.startAutoHideTimer()
        }
    }

    protected getRenderClasses() {
        const showCloseIcon = this.hasCloseIcon || this.hasSlottedCloseIcon
        return ({
            'container': true,
            [`variant-${this.variant}`]: true,
            'multiline': this.multiline,
            'action-on-new-line': this.actionOnNewLine,
            'has-action': this.hasAction,
            'has-close-icon': showCloseIcon,
            'has-icon': this.hasIcon,
            'closing': this.isClosing,
            'dragging': this.isDragging,
        })
    }

    protected override render(): TemplateResult {
        const isError = this.variant === SnackbarVariant.Error || this.variant === SnackbarVariant.ErrorContainer
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="${isError ? 'alert' : 'status'}"
                aria-live="${isError ? 'assertive' : 'polite'}"
                aria-atomic="true"
                @pointerdown=${this.handlePointerDown}
                @pointermove=${this.handlePointerMove}
                @pointerup=${this.handlePointerUp}
                @pointercancel=${this.handlePointerCancel}
            >
                <mdc-elevation></mdc-elevation>
                <span class="background"></span>
                <span class="body">
                    ${this.renderIcon()}
                    ${this.renderLabel()}
                </span>
                <span class="actions">
                    ${this.renderAction()}
                    ${this.renderCloseIcon()}
                </span>
            </div>
        `
    }

    protected renderIcon(): TemplateResult {
        return html`
            <span class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    protected renderLabel(): TemplateResult {
        return html`
            <span class="label">
                <slot></slot>
            </span>
        `
    }

    protected renderAction(): TemplateResult {
        return html`
            <button
                type="button"
                class="action"
                @click=${this.handleActionClick}
            >
                <slot name="action" @slotchange=${this.handleActionSlotChange}></slot>
            </button>
        `
    }

    protected renderCloseIcon(): TemplateResult {
        return html`
            <button
                type="button"
                class="close-icon"
                aria-label="Close"
                @click=${this.handleCloseIconClick}
            >
                <slot name="close-icon" @slotchange=${this.handleCloseIconSlotChange}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </slot>
            </button>
        `
    }

    /**
     * Shows the snackbar.
     */
    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
    }

    /**
     * Hides the snackbar with an optional dismiss reason.
     */
    public async hide(reason: SnackbarResult = SnackbarResult.Dismiss): Promise<void> {
        if (!this.open) return
        this.pendingCloseReason = reason
        this.open = false
    }

    /**
     * Resets the auto-hide timer (e.g. when content is updated in place via `tag`).
     */
    public resetAutoHideTimer(): void {
        if (!this.open || this.isClosing) return
        this.startAutoHideTimer()
    }

    private handleOpen(): void {
        this.clearAnimationTimers()
        this.isClosing = false
        this.toggleAttribute('closing', false)
        this.pendingCloseReason = SnackbarResult.Dismiss
        this.resetDragStyles()

        this.dispatchEvent(new Event(SnackbarOpeningEvent, { bubbles: true, composed: true }))
        this.startAutoHideTimer()

        const delay = this.prefersReducedMotion() ? 0 : OpenAnimationDurationMs
        this.openAnimationTimer = setTimeout(() => {
            this.openAnimationTimer = null
            if (this.open) {
                this.dispatchEvent(new Event(SnackbarOpenedEvent, { bubbles: true, composed: true }))
            }
        }, delay)
    }

    private handleClose(): void {
        this.clearAutoHideTimer()
        this.clearAnimationTimers()

        const reason = this.pendingCloseReason
        this.isClosing = true
        this.toggleAttribute('closing', true)

        this.dispatchEvent(new CustomEvent<ISnackbarCloseEventDetail>(
            SnackbarClosingEvent,
            { detail: { reason }, bubbles: true, composed: true }
        ))

        const delay = this.prefersReducedMotion() ? 0 : CloseAnimationDurationMs
        this.closeAnimationTimer = setTimeout(() => {
            this.closeAnimationTimer = null
            this.isClosing = false
            this.toggleAttribute('closing', false)
            this.resetDragStyles()
            this.dispatchEvent(new CustomEvent<ISnackbarCloseEventDetail>(
                SnackbarClosedEvent,
                { detail: { reason }, bubbles: true, composed: true }
            ))
        }, delay)
    }

    private resolveDurationMs(): number | null {
        if (this.duration === SnackbarDuration.Indefinite) return null
        if (this.duration === SnackbarDuration.Short) return 4000
        if (this.duration === SnackbarDuration.Long) return 10000
        const numeric = Number(this.duration)
        return Number.isFinite(numeric) && numeric > 0 ? numeric : null
    }

    private startAutoHideTimer(): void {
        this.clearAutoHideTimer()
        const durationMs = this.resolveDurationMs()
        if (durationMs === null) {
            this.remainingDurationMs = null
            return
        }
        this.remainingDurationMs = durationMs
        if (!this.isHovered && !this.isFocusedWithin && !this.isDragging) {
            this.scheduleAutoHide(durationMs)
        }
    }

    private scheduleAutoHide(delayMs: number): void {
        this.clearAutoHideTimer()
        this.timerStartedAt = Date.now()
        this.autoHideTimer = setTimeout(() => {
            this.autoHideTimer = null
            this.remainingDurationMs = null
            this.pendingCloseReason = SnackbarResult.Timeout
            this.open = false
        }, delayMs)
    }

    private pauseAutoHideTimer(): void {
        if (this.autoHideTimer !== null && this.remainingDurationMs !== null) {
            const elapsed = Date.now() - this.timerStartedAt
            this.remainingDurationMs = Math.max(0, this.remainingDurationMs - elapsed)
            this.clearAutoHideTimer()
        }
    }

    private resumeAutoHideTimer(): void {
        if (!this.open || this.isClosing || this.isHovered || this.isFocusedWithin || this.isDragging) {
            return
        }
        if (this.remainingDurationMs !== null && this.autoHideTimer === null) {
            this.scheduleAutoHide(this.remainingDurationMs)
        }
    }

    private clearAutoHideTimer(): void {
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer)
            this.autoHideTimer = null
        }
    }

    private clearAnimationTimers(): void {
        if (this.openAnimationTimer !== null) {
            clearTimeout(this.openAnimationTimer)
            this.openAnimationTimer = null
        }
        if (this.closeAnimationTimer !== null) {
            clearTimeout(this.closeAnimationTimer)
            this.closeAnimationTimer = null
        }
    }

    private prefersReducedMotion(): boolean {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    private handlePointerEnter = (): void => {
        this.isHovered = true
        this.pauseAutoHideTimer()
    }

    private handlePointerLeave = (): void => {
        this.isHovered = false
        this.resumeAutoHideTimer()
    }

    private handleFocusIn = (): void => {
        this.isFocusedWithin = true
        this.pauseAutoHideTimer()
    }

    private handleFocusOut = (event: FocusEvent): void => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && (this.contains(nextTarget) || this.shadowRoot?.contains(nextTarget))) {
            return
        }
        this.isFocusedWithin = false
        this.resumeAutoHideTimer()
    }

    private handlePointerDown(event: PointerEvent): void {
        if (!this.swipeToDismiss || !this.open || this.isClosing) return
        if (event.button !== 0 && event.pointerType === 'mouse') return

        this.activePointerId = event.pointerId
        this.dragStartX = event.clientX
        this.dragStartY = event.clientY
        this.dragStartTime = Date.now()
        this.currentDragDx = 0
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.activePointerId !== event.pointerId || !this.swipeToDismiss) return

        const dx = event.clientX - this.dragStartX
        const dy = event.clientY - this.dragStartY

        if (!this.isDragging) {
            if (Math.abs(dx) < SwipeSlopPx || Math.abs(dx) <= Math.abs(dy)) {
                return
            }
            this.isDragging = true
            this.pauseAutoHideTimer()
            this.containerElement?.setPointerCapture?.(event.pointerId)
        }

        this.currentDragDx = dx
        const width = this.containerElement?.offsetWidth || 344
        const opacity = Math.max(0, 1 - Math.abs(dx) / (width * 0.6))
        if (this.containerElement) {
            this.containerElement.style.transform = `translateX(${dx}px)`
            this.containerElement.style.opacity = String(opacity)
        }
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.activePointerId !== event.pointerId) return
        this.finishDrag(event.pointerId, false)
    }

    private handlePointerCancel(event: PointerEvent): void {
        if (this.activePointerId !== event.pointerId) return
        this.finishDrag(event.pointerId, true)
    }

    private finishDrag(pointerId: number, cancelled: boolean): void {
        this.activePointerId = null
        if (!this.isDragging) return

        this.isDragging = false
        if (this.containerElement?.hasPointerCapture?.(pointerId)) {
            this.containerElement.releasePointerCapture(pointerId)
        }

        const width = this.containerElement?.offsetWidth || 344
        const elapsed = Math.max(1, Date.now() - this.dragStartTime)
        const velocity = Math.abs(this.currentDragDx) / elapsed
        const shouldDismiss = !cancelled && (
            Math.abs(this.currentDragDx) > width * SwipeDismissThresholdRatio ||
            velocity > SwipeDismissVelocityPxPerMs
        )

        if (shouldDismiss) {
            const direction = this.currentDragDx >= 0 ? 1 : -1
            if (this.containerElement) {
                this.containerElement.style.transform = `translateX(${direction * width}px)`
                this.containerElement.style.opacity = '0'
            }
            this.pendingCloseReason = SnackbarResult.Swipe
            this.open = false
        } else {
            this.resetDragStyles()
            this.resumeAutoHideTimer()
        }
        this.currentDragDx = 0
    }

    private resetDragStyles(): void {
        this.isDragging = false
        this.activePointerId = null
        this.currentDragDx = 0
        if (this.containerElement) {
            this.containerElement.style.transform = ''
            this.containerElement.style.opacity = ''
        }
    }

    private handleActionClick(): void {
        const actionText = this.actionButton?.textContent?.trim() ?? ''
        const actionEvent = new CustomEvent<ISnackbarActionEventDetail>(
            SnackbarActionEvent,
            {
                detail: { action: actionText },
                bubbles: true,
                composed: true,
                cancelable: true,
            }
        )
        const shouldAutoDismiss = this.dispatchEvent(actionEvent)
        if (shouldAutoDismiss) {
            this.pendingCloseReason = SnackbarResult.Action
            this.open = false
        }
    }

    private handleCloseIconClick(): void {
        this.pendingCloseReason = SnackbarResult.Close
        this.open = false
    }

    private handleActionSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasAction = slot.assignedElements().length > 0
    }

    private handleCloseIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedCloseIcon = slot.assignedElements().length > 0
    }

    private handleIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasIcon = slot.assignedElements().length > 0
    }
}
