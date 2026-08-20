/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
    BOTTOM_SHEET_DRAG_END_EVENT,
    BOTTOM_SHEET_DRAG_EVENT,
    BOTTOM_SHEET_DRAG_START_EVENT,
    type BottomSheetDetent,
    type BottomSheetDragTarget,
    type BottomSheetVariant,
    type IBottomSheetDragEndEventDetail,
    type IBottomSheetDragEventDetail,
    type IBottomSheetDragStartEventDetail,
} from '../bottom-sheet.interface'

/** Distance (CSS px) the pointer must travel from the down point before a drag engages. */
const ENGAGE_THRESHOLD_PX = 4

/**
 * Snap-decision distance: drag must exceed this fraction of container height to
 * commit close or transition detent.
 */
const DISTANCE_COMMIT_FRACTION = 0.25

/**
 * Snap-decision velocity: release must exceed this px/ms downward or upward to commit
 * state transition (per Material Design spec).
 */
const VELOCITY_COMMIT_PX_PER_MS = 0.5

/**
 * Window over which to compute release velocity (ms). We track the last
 * move's timestamp and dy and divide (currentDy - lastMoveDy) by
 * (performance.now() - lastMoveT).
 */
const VELOCITY_WINDOW_MS = 80

/**
 * Max horizontal movement (px) allowed during a drag, expressed as a multiple
 * of the vertical movement. Beyond this, the drag is canceled (horizontal
 * scroll gesture likely).
 */
const MAX_HORIZONTAL_RATIO = 2

/**
 * Host contract for {@link BottomSheetDragController}.
 *
 * The host must provide refs that resolve to the drag handle (where
 * `pointerdown` is observed), the inner container (whose `transform` is
 * animated), the header, and the scrim (whose `opacity` is animated). The `enabled`
 * function is re-evaluated on every `pointerdown` so changes to `open`,
 * `variant`, or `draggable` take effect immediately.
 */
export interface IBottomSheetDragHost extends ReactiveControllerHost, HTMLElement {
    dragHandleRef: () => HTMLElement | null
    containerRef: () => HTMLElement | null
    headerRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    enabled: () => boolean
    getVariant: () => BottomSheetVariant
    /**
     * Returns the resting detent. Read at drag-start and at pointerup (for
     * the `drag-end` event detail and for snap-back target).
     */
    getRestingDetent: () => BottomSheetDetent
    /** Whether slot="header" has assigned content. */
    hasHeaderContent: () => boolean
    /** Whether the default body slot has assigned content. */
    hasBodyContent: () => boolean
}

/**
 * 3-State pointer-driven drag controller for bottom-sheet (both standard and modal).
 * Tracks vertical pointer movement, engages after 4px threshold, applies live
 * translateY during drag (supporting upward expansion from peek to full, downward
 * collapse from full to peek, and dismissal to closed), and decides 3-state snap target
 * on release using distance and velocity heuristics per M3 specifications.
 */
export class BottomSheetDragController implements ReactiveController {
    private readonly host: IBottomSheetDragHost

    // ── Pointer state ──────────────────────────────────────────────────────
    private pointerId: number | null = null
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    // ── Drag & 3-state geometry ────────────────────────────────────────────
    private initialDetent: BottomSheetDetent = 'peek'
    private currentDy = 0
    private containerHeight = 0
    private fullHeight = 0
    private peekHeight = 0
    private deltaH = 0
    private lastMoveT = 0
    private lastMoveDy = 0
    private releaseVelocity = 0

    // ── Bound handlers ─────────────────────────────────────────────────────
    private readonly handlePointerDownBound: (e: PointerEvent) => void
    private readonly handlePointerMoveBound: (e: PointerEvent) => void
    private readonly handlePointerUpBound: (e: PointerEvent) => void
    private readonly handlePointerCancelBound: (e: PointerEvent) => void

    public constructor(host: IBottomSheetDragHost) {
        this.host = host
        host.addController(this)

        this.handlePointerDownBound = (e) => this.handlePointerDown(e)
        this.handlePointerMoveBound = (e) => this.handlePointerMove(e)
        this.handlePointerUpBound = (e) => this.handlePointerUp(e)
        this.handlePointerCancelBound = (e) => this.handlePointerUp(e)
    }

    // ── ReactiveController lifecycle ───────────────────────────────────────

    public hostConnected(): void {
        // Pointer down listener is bound declaratively on the drag-handle in template.
    }

    public hostDisconnected(): void {
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)
        this.resetState()
    }

    // ── Public API ─────────────────────────────────────────────────────────

    /**
     * Cancel any in-flight drag (e.g. when the host calls `hide()` mid-drag).
     * Snaps back to the current detent without dispatching a drag-end event
     * (the host's lifecycle events own the close path).
     */
    public cancel(): void {
        if (this.pointerId === null) return
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)
        this.resetState()
        const container = this.host.containerRef()
        if (container) {
            container.style.removeProperty('transform')
            container.style.removeProperty('cursor')
        }
        const scrim = this.host.scrimRef()
        if (scrim) scrim.style.removeProperty('opacity')
        this.host.removeAttribute('touch-action')
        this.host.removeAttribute('dragged-upward')
    }

    /**
     * Whether the bottom sheet supports multi-detent (3-stage) transitions.
     * True only when BOTH header and lower body content are provided.
     * When there is no lower content (or no header), the sheet operates as a 2-stage
     * sheet (closed <-> full/header) and downward drag closes directly in one step.
     */
    private hasMultiDetent(): boolean {
        return this.host.hasHeaderContent() && this.host.hasBodyContent()
    }

    // ── Pointer handlers ───────────────────────────────────────────────────

    public handlePointerDown(event: PointerEvent): void {
        if (this.pointerId !== null) return
        if (!this.host.enabled()) return
        // Only primary pointer (left mouse / first touch / pen tip).
        if (!event.isPrimary) return

        this.pointerId = event.pointerId
        this.startX = event.clientX
        this.startY = event.clientY
        this.engaged = false
        this.canceled = false
        this.initialDetent = this.host.getRestingDetent()
        this.currentDy = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveDy = 0

        window.addEventListener('pointermove', this.handlePointerMoveBound)
        window.addEventListener('pointerup', this.handlePointerUpBound)
        window.addEventListener('pointercancel', this.handlePointerCancelBound)
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.pointerId !== event.pointerId) return
        if (this.canceled) return

        const deltaY = event.clientY - this.startY
        const deltaX = Math.abs(event.clientX - this.startX)

        // Horizontal-dominant motion before engagement → cancel drag (user is scrolling horizontally).
        if (!this.engaged && deltaX > MAX_HORIZONTAL_RATIO * Math.max(Math.abs(deltaY), 1)) {
            this.canceled = true
            this.handlePointerUp(event)
            return
        }

        if (!this.engaged) {
            if (Math.abs(deltaY) < ENGAGE_THRESHOLD_PX) return
            // Engage: take pointer capture so we keep getting moves off the container.
            const container = this.host.containerRef()
            if (!container) return
            try {
                container.setPointerCapture(event.pointerId)
            } catch {
                // setPointerCapture can throw on detached elements; safe to ignore.
            }
            this.engaged = true
            this.containerHeight = container.getBoundingClientRect().height

            // Calculate 3-state detent dimensions
            const vh = window.innerHeight
            const maxFull = window.innerWidth > 640
                ? Math.min(0.96 * vh, vh - 56)
                : Math.min(0.96 * vh, vh - 72)
            const maxPeek = Math.min(0.40 * vh, maxFull)

            const multiDetent = this.hasMultiDetent()

            if (!multiDetent) {
                // When there is no lower body content (or no header), the sheet operates as a 2-stage sheet
                this.fullHeight = this.containerHeight
                this.peekHeight = this.containerHeight
                this.deltaH = 0
            } else if (this.initialDetent === 'peek') {
                this.peekHeight = this.containerHeight
                this.fullHeight = Math.max(this.containerHeight, maxFull)
                this.deltaH = Math.max(0, this.fullHeight - this.peekHeight)
            } else {
                this.fullHeight = this.containerHeight
                const headerEl = this.host.headerRef()
                const dragHandleEl = this.host.dragHandleRef()
                if (headerEl && dragHandleEl) {
                    const headerBox = headerEl.getBoundingClientRect()
                    const handleBox = dragHandleEl.getBoundingClientRect()
                    this.peekHeight = Math.min(this.containerHeight, Math.max(handleBox.height + headerBox.height, maxPeek))
                } else {
                    this.peekHeight = Math.min(this.containerHeight, maxPeek)
                }
                this.deltaH = Math.max(0, this.fullHeight - this.peekHeight)
            }

            this.host.setAttribute('touch-action', 'none')
            container.style.cursor = 'grabbing'
            this.host.dispatchEvent(new CustomEvent<IBottomSheetDragStartEventDetail>(
                BOTTOM_SHEET_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { detent: this.initialDetent },
                },
            ))
        }

        const isStandard = this.host.getVariant() === 'standard'
        const multiDetent = this.hasMultiDetent()

        // Calculate translateY based on active states mapping
        let dy = 0
        if (!multiDetent) {
            // 2-Stage sheet: dragging down pulls toward closed directly in one step
            if (deltaY <= 0) {
                dy = deltaY * 0.2
            } else {
                dy = deltaY
            }
        } else if (this.initialDetent === 'peek') {
            if (deltaY <= 0) {
                // Pulling upward towards Full
                const upward = -deltaY
                if (upward > this.deltaH) {
                    // Rubber-band resistance above full
                    dy = -this.deltaH - (upward - this.deltaH) * 0.2
                } else {
                    dy = deltaY
                }
            } else {
                // Pulling downward towards Closed
                dy = deltaY
            }
        } else {
            // initialDetent === 'full' with multiDetent
            if (deltaY <= 0) {
                // Pulling upward past full — rubber band
                dy = deltaY * 0.2
            } else {
                // Pulling downward towards Peek (single-step transition)
                if (deltaY > this.deltaH) {
                    // Rubber-band resistance past peek to enforce single-step
                    dy = this.deltaH + (deltaY - this.deltaH) * 0.2
                } else {
                    dy = deltaY
                }
            }
        }

        // Track release velocity using a moving window.
        const now = performance.now()
        const prevT = this.lastMoveT
        const prevDy = this.lastMoveDy
        this.lastMoveT = now
        this.lastMoveDy = dy
        if (prevT > 0 && now - prevT < VELOCITY_WINDOW_MS) {
            this.releaseVelocity = (dy - prevDy) / (now - prevT)
        } else if (now - prevT >= VELOCITY_WINDOW_MS) {
            this.releaseVelocity = 0
        }

        this.currentDy = dy
        if (dy < 0) {
            this.host.setAttribute('dragged-upward', '')
        } else {
            this.host.removeAttribute('dragged-upward')
        }

        const container = this.host.containerRef()
        const scrim = this.host.scrimRef()
        const peak = 0.32

        // Scrim opacity interpolation (modal only)
        if (scrim && !isStandard) {
            if (!multiDetent) {
                // Fades out as dy pulls toward closed
                const progress = Math.min(1, Math.max(0, dy / Math.max(1, this.containerHeight)))
                scrim.style.opacity = String(peak * (1 - progress))
            } else if (this.initialDetent === 'peek') {
                if (dy <= 0) {
                    scrim.style.opacity = String(peak)
                } else {
                    const progress = Math.min(1, Math.max(0, dy / Math.max(1, this.peekHeight)))
                    scrim.style.opacity = String(peak * (1 - progress))
                }
            } else {
                // When dragging down from full to peek, scrim stays at peak opacity
                scrim.style.opacity = String(peak)
            }
        }

        if (container) container.style.transform = `translateY(${dy}px)`

        const totalH = this.containerHeight > 0 ? this.containerHeight : 1
        const progress = Math.min(1, Math.max(0, dy / totalH))

        this.host.dispatchEvent(new CustomEvent<IBottomSheetDragEventDetail>(
            BOTTOM_SHEET_DRAG_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { dy, progress },
            },
        ))
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.pointerId !== event.pointerId) return
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)

        const container = this.host.containerRef()
        const scrim = this.host.scrimRef()
        const lastDy = this.currentDy

        if (!this.engaged) {
            this.resetState()
            return
        }

        if (this.canceled) {
            if (container) {
                container.style.transform = ''
                container.style.cursor = ''
            }
            if (scrim) scrim.style.opacity = ''
            this.host.removeAttribute('touch-action')
            try { container?.releasePointerCapture(event.pointerId) } catch {}
            this.host.dispatchEvent(new CustomEvent<IBottomSheetDragEndEventDetail>(
                BOTTOM_SHEET_DRAG_END_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { committed: false, target: this.initialDetent, reason: 'cancel', dy: lastDy },
                },
            ))
            this.resetState()
            return
        }

        try { container?.releasePointerCapture(event.pointerId) } catch {}

        const multiDetent = this.hasMultiDetent()

        // Snap Target Decision based on active states mapping
        let target: BottomSheetDragTarget = this.initialDetent
        let commitReason: 'distance' | 'velocity' | undefined = undefined

        if (!multiDetent) {
            // When there is no lower content (or no header), dragging down closes directly in one step!
            const closeThreshold = Math.max(30, this.containerHeight * DISTANCE_COMMIT_FRACTION)
            if (this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS || this.currentDy > closeThreshold) {
                target = 'closed'
                commitReason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            } else {
                target = this.initialDetent
            }
        } else if (this.initialDetent === 'full') {
            // In 3-state 'full': can only transition down to 'peek', NEVER directly to 'closed'
            const collapseThreshold = Math.max(40, this.deltaH * DISTANCE_COMMIT_FRACTION)
            if (this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS || this.currentDy >= collapseThreshold) {
                target = 'peek'
                commitReason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            } else {
                target = 'full'
            }
        } else {
            // In 3-state 'peek': can transition up to 'full' or down to 'closed'
            const expandThreshold = Math.max(40, this.deltaH * DISTANCE_COMMIT_FRACTION)
            const closeThreshold = Math.max(30, this.peekHeight * DISTANCE_COMMIT_FRACTION)

            if (this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS || this.currentDy < -expandThreshold) {
                target = 'full'
                commitReason = this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            } else if (this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS || this.currentDy > closeThreshold) {
                target = 'closed'
                commitReason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            } else {
                target = 'peek'
            }
        }

        const isClosing = target === 'closed'

        this.host.dispatchEvent(new CustomEvent<IBottomSheetDragEndEventDetail>(
            BOTTOM_SHEET_DRAG_END_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    committed: isClosing,
                    target,
                    reason: commitReason,
                    dy: lastDy,
                },
            },
        ))
        this.resetState()
    }

    private resetState(): void {
        this.host.removeAttribute('dragged-upward')
        const container = this.host.containerRef()
        if (container) {
            container.style.removeProperty('cursor')
        }
        this.pointerId = null
        this.startX = 0
        this.startY = 0
        this.engaged = false
        this.canceled = false
        this.currentDy = 0
        this.containerHeight = 0
        this.fullHeight = 0
        this.peekHeight = 0
        this.deltaH = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveDy = 0
    }
}
