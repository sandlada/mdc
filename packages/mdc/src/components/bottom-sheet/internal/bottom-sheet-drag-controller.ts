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
    type IBottomSheetDragEndEventDetail,
    type IBottomSheetDragEventDetail,
    type IBottomSheetDragStartEventDetail,
} from '../bottom-sheet.interface'

/** Distance (CSS px) the pointer must travel from the down point before a drag engages. */
const ENGAGE_THRESHOLD_PX = 4

/**
 * Snap-decision distance: drag must exceed this fraction of container height to
 * commit close (per Material Design spec).
 */
const DISTANCE_COMMIT_FRACTION = 0.25

/**
 * Snap-decision velocity: release must exceed this px/ms downward to commit
 * close (per Material Design spec).
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
 * animated) and the scrim (whose `opacity` is animated). The `enabled`
 * function is re-evaluated on every `pointerdown` so changes to `open`,
 * `variant`, or `draggable` take effect immediately.
 */
export interface IBottomSheetDragHost extends ReactiveControllerHost, HTMLElement {
    dragHandleRef: () => HTMLElement | null
    containerRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    enabled: () => boolean
    /**
     * Returns the resting detent. Read at drag-start and at pointerup (for
     * the `drag-end` event detail and for snap-back target).
     */
    getRestingDetent: () => BottomSheetDetent
}

/**
 * Pointer-driven drag-to-dismiss controller for the bottom-sheet. Tracks
 * vertical pointer movement, engages after a 4px movement threshold, applies
 * `translateY(dy)` to the container inline during the drag, and decides
 * snap-back vs commit-close on pointerup using a distance-or-velocity
 * heuristic.
 */
export class BottomSheetDragController implements ReactiveController {
    private readonly host: IBottomSheetDragHost

    // ── Pointer state ──────────────────────────────────────────────────────
    private pointerId: number | null = null
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    // ── Drag state ─────────────────────────────────────────────────────────
    private currentDy = 0
    private containerHeight = 0
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
        const handle = this.host.dragHandleRef()
        handle?.addEventListener('pointerdown', this.handlePointerDownBound)
    }

    public hostDisconnected(): void {
        const handle = this.host.dragHandleRef()
        handle?.removeEventListener('pointerdown', this.handlePointerDownBound)
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
        this.resetState()
        const container = this.host.containerRef()
        if (container) {
            container.style.removeProperty('transform')
            container.style.removeProperty('cursor')
        }
        const scrim = this.host.scrimRef()
        if (scrim) scrim.style.removeProperty('opacity')
        this.host.removeAttribute('touch-action')
    }

    // ── Pointer handlers ───────────────────────────────────────────────────

    private handlePointerDown(event: PointerEvent): void {
        if (this.pointerId !== null) return
        if (!this.host.enabled()) return
        // Only primary pointer (left mouse / first touch / pen tip).
        if (!event.isPrimary) return

        this.pointerId = event.pointerId
        this.startX = event.clientX
        this.startY = event.clientY
        this.engaged = false
        this.canceled = false
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

        const dy = Math.max(0, event.clientY - this.startY)
        const dx = Math.abs(event.clientX - this.startX)

        // Horizontal-dominant motion → cancel drag (user is scrolling horizontally).
        if (dx > MAX_HORIZONTAL_RATIO * Math.max(dy, 1)) {
            this.canceled = true
            this.handlePointerUp(event)
            return
        }

        if (!this.engaged) {
            if (dy < ENGAGE_THRESHOLD_PX) return
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
            this.host.setAttribute('touch-action', 'none')
            container.style.cursor = 'grabbing'
            this.host.dispatchEvent(new CustomEvent<IBottomSheetDragStartEventDetail>(
                BOTTOM_SHEET_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { detent: this.host.getRestingDetent() },
                },
            ))
        }

        // Track release velocity using a moving window.
        const now = performance.now()
        const prevT = this.lastMoveT
        const prevDy = this.lastMoveDy
        this.lastMoveT = now
        this.lastMoveDy = dy
        if (prevT > 0 && now - prevT < VELOCITY_WINDOW_MS) {
            // Only update velocity if the window is fresh; otherwise the previous
            // window's value is stale.
            this.releaseVelocity = (dy - prevDy) / (now - prevT)
        }

        this.currentDy = dy
        const container = this.host.containerRef()
        const scrim = this.host.scrimRef()
        const peak = 0.32
        const progress = this.containerHeight > 0
            ? Math.min(1, Math.max(0, dy / this.containerHeight))
            : 0
        if (container) container.style.transform = `translateY(${dy}px)`
        if (scrim) scrim.style.opacity = String(peak * (1 - progress))
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

        if (!this.engaged) {
            // Never engaged — let the underlying click fire normally.
            this.resetState()
            return
        }

        const container = this.host.containerRef()
        const scrim = this.host.scrimRef()
        const distanceThreshold = this.containerHeight * DISTANCE_COMMIT_FRACTION
        const shouldCommit = this.currentDy > distanceThreshold
            || this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
        const commitReason: 'distance' | 'velocity' | undefined =
            this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
                ? 'velocity'
                : (this.currentDy > distanceThreshold ? 'distance' : undefined)

        if (this.canceled) {
            // Horizontal-dominant motion — always snap back.
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
                    detail: { committed: false, reason: 'cancel' },
                },
            ))
            this.resetState()
            return
        }

        // Release pointer capture; release velocity is the last computed value.
        try { container?.releasePointerCapture(event.pointerId) } catch {}

        this.host.dispatchEvent(new CustomEvent<IBottomSheetDragEndEventDetail>(
            BOTTOM_SHEET_DRAG_END_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    committed: shouldCommit,
                    reason: shouldCommit ? commitReason : undefined,
                },
            },
        ))
        // Reset transient inline styles; the host's snap/commit animation will
        // own the visual transition from here. If neither engages (unlikely),
        // restore the resting state.
        this.resetState()
    }

    private resetState(): void {
        this.pointerId = null
        this.startX = 0
        this.startY = 0
        this.engaged = false
        this.canceled = false
        this.currentDy = 0
        this.containerHeight = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveDy = 0
    }
}
