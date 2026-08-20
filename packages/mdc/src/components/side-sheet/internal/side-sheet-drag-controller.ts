/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
    SIDE_SHEET_DRAG_END_EVENT,
    SIDE_SHEET_DRAG_EVENT,
    SIDE_SHEET_DRAG_START_EVENT,
    type ISideSheetDragEndEventDetail,
    type ISideSheetDragEventDetail,
    type ISideSheetDragStartEventDetail,
    type SideSheetDragTarget,
    type SideSheetEdge,
    type SideSheetVariant,
} from '../side-sheet.interface'

/** Distance (CSS px) the pointer must travel from the down point before a drag engages. */
const ENGAGE_THRESHOLD_PX = 4

/**
 * Snap-decision distance: drag must exceed this fraction of container width to
 * commit close.
 */
const DISTANCE_COMMIT_FRACTION = 0.25

/**
 * Snap-decision velocity: release must exceed this px/ms in the dismiss direction to commit
 * close (per Material Design spec).
 */
const VELOCITY_COMMIT_PX_PER_MS = 0.5

/**
 * Window over which to compute release velocity (ms).
 */
const VELOCITY_WINDOW_MS = 80

/**
 * Max vertical movement (px) allowed during a drag, expressed as a multiple
 * of the horizontal movement. Beyond this, the drag is canceled (vertical
 * scroll gesture likely).
 */
const MAX_VERTICAL_RATIO = 2

/**
 * Host contract for {@link SideSheetDragController}.
 */
export interface ISideSheetDragHost extends ReactiveControllerHost, HTMLElement {
    containerRef: () => HTMLElement | null
    headlineRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    enabled: () => boolean
    getVariant: () => SideSheetVariant
    getSheetEdge: () => SideSheetEdge
}

/**
 * Pointer-driven horizontal swipe-to-dismiss controller for side-sheet.
 * Tracks horizontal pointer movement, engages after 4px threshold, applies live
 * translateX during drag, and decides dismiss vs snap-back on release using distance
 * and velocity heuristics per M3 / MDC-Android specifications.
 */
export class SideSheetDragController implements ReactiveController {
    private readonly host: ISideSheetDragHost

    // ── Pointer state ──────────────────────────────────────────────────────
    private pointerId: number | null = null
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    // ── Drag geometry ──────────────────────────────────────────────────────
    private currentDx = 0
    private containerWidth = 0
    private lastMoveT = 0
    private lastMoveDx = 0
    private releaseVelocity = 0

    // ── Bound handlers ─────────────────────────────────────────────────────
    private readonly handlePointerMoveBound: (e: PointerEvent) => void
    private readonly handlePointerUpBound: (e: PointerEvent) => void
    private readonly handlePointerCancelBound: (e: PointerEvent) => void

    public constructor(host: ISideSheetDragHost) {
        this.host = host
        host.addController(this)

        this.handlePointerMoveBound = (e) => this.handlePointerMove(e)
        this.handlePointerUpBound = (e) => this.handlePointerUp(e)
        this.handlePointerCancelBound = (e) => this.handlePointerUp(e)
    }

    public hostConnected(): void {
        // Pointer down listener is bound on the header / container in template.
    }

    public hostDisconnected(): void {
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)
        this.resetState()
    }

    /**
     * Cancel any in-flight drag (e.g. when the host calls `hide()` mid-drag).
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
        this.host.removeAttribute('dragged')
    }

    public handlePointerDown(event: PointerEvent): void {
        if (this.pointerId !== null) return
        if (!this.host.enabled()) return
        // Only primary pointer (left mouse / first touch / pen tip).
        if (!event.isPrimary) return

        // Ignore clicks on interactive elements (buttons, inputs, links, etc.)
        const target = event.target as HTMLElement | null
        if (target && target.closest('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')) {
            return
        }

        this.pointerId = event.pointerId
        this.startX = event.clientX
        this.startY = event.clientY
        this.engaged = false
        this.canceled = false
        this.currentDx = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveDx = 0

        window.addEventListener('pointermove', this.handlePointerMoveBound)
        window.addEventListener('pointerup', this.handlePointerUpBound)
        window.addEventListener('pointercancel', this.handlePointerCancelBound)
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.pointerId !== event.pointerId) return
        if (this.canceled) return

        const deltaX = event.clientX - this.startX
        const deltaY = Math.abs(event.clientY - this.startY)

        // Vertical-dominant motion before engagement → cancel drag (user is scrolling vertically).
        if (!this.engaged && deltaY > MAX_VERTICAL_RATIO * Math.max(Math.abs(deltaX), 1)) {
            this.canceled = true
            this.handlePointerUp(event)
            return
        }

        if (!this.engaged) {
            if (Math.abs(deltaX) < ENGAGE_THRESHOLD_PX) return
            // Engage: take pointer capture so we keep getting moves off the container.
            const container = this.host.containerRef()
            if (!container) return
            try {
                container.setPointerCapture(event.pointerId)
            } catch {
                // setPointerCapture can throw on detached elements; safe to ignore.
            }
            this.engaged = true
            this.containerWidth = container.getBoundingClientRect().width

            this.host.setAttribute('touch-action', 'none')
            container.style.cursor = 'grabbing'
            this.host.dispatchEvent(new CustomEvent<ISideSheetDragStartEventDetail>(
                SIDE_SHEET_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { sheetEdge: this.host.getSheetEdge() },
                },
            ))
        }

        const edge = this.host.getSheetEdge()
        const isStandard = this.host.getVariant() === 'standard'

        // Calculate dx with rubber-band resistance against dragging into the viewport
        let dx = 0
        if (edge === 'end') {
            // Sheet is docked on the right. Moving right (+deltaX) dismisses it offscreen.
            if (deltaX < 0) {
                dx = deltaX * 0.2 // rubber-band
            } else {
                dx = deltaX
            }
        } else {
            // Sheet is docked on the left. Moving left (-deltaX) dismisses it offscreen.
            if (deltaX > 0) {
                dx = deltaX * 0.2 // rubber-band
            } else {
                dx = deltaX
            }
        }

        // Track release velocity using a moving window.
        const now = performance.now()
        const prevT = this.lastMoveT
        const prevDx = this.lastMoveDx
        this.lastMoveT = now
        this.lastMoveDx = dx
        if (prevT > 0 && now - prevT < VELOCITY_WINDOW_MS) {
            this.releaseVelocity = (dx - prevDx) / (now - prevT)
        } else if (now - prevT >= VELOCITY_WINDOW_MS) {
            this.releaseVelocity = 0
        }

        this.currentDx = dx
        if (Math.abs(dx) > 0) {
            this.host.setAttribute('dragged', '')
        } else {
            this.host.removeAttribute('dragged')
        }

        const container = this.host.containerRef()
        const scrim = this.host.scrimRef()
        const peak = 0.32

        // Scrim opacity interpolation (modal only)
        if (scrim && !isStandard) {
            const progress = Math.min(1, Math.max(0, Math.abs(dx) / Math.max(1, this.containerWidth)))
            scrim.style.opacity = String(peak * (1 - progress))
        }

        if (container) container.style.transform = `translateX(${dx}px)`

        const totalW = this.containerWidth > 0 ? this.containerWidth : 1
        const progress = Math.min(1, Math.max(0, Math.abs(dx) / totalW))

        this.host.dispatchEvent(new CustomEvent<ISideSheetDragEventDetail>(
            SIDE_SHEET_DRAG_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { dx, progress },
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
        const lastDx = this.currentDx

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
            this.host.removeAttribute('dragged')
            try { container?.releasePointerCapture(event.pointerId) } catch {}
            this.host.dispatchEvent(new CustomEvent<ISideSheetDragEndEventDetail>(
                SIDE_SHEET_DRAG_END_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { committed: false, target: 'open', reason: 'cancel', dx: lastDx },
                },
            ))
            this.resetState()
            return
        }

        try { container?.releasePointerCapture(event.pointerId) } catch {}

        const edge = this.host.getSheetEdge()
        const closeThreshold = Math.max(40, this.containerWidth * DISTANCE_COMMIT_FRACTION)

        let target: SideSheetDragTarget = 'open'
        let commitReason: 'distance' | 'velocity' | undefined = undefined

        if (edge === 'end') {
            if (this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS || this.currentDx > closeThreshold) {
                target = 'closed'
                commitReason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            }
        } else {
            if (this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS || this.currentDx < -closeThreshold) {
                target = 'closed'
                commitReason = this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS ? 'velocity' : 'distance'
            }
        }

        const isClosing = target === 'closed'

        this.host.dispatchEvent(new CustomEvent<ISideSheetDragEndEventDetail>(
            SIDE_SHEET_DRAG_END_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    committed: isClosing,
                    target,
                    reason: commitReason,
                    dx: lastDx,
                },
            },
        ))
        this.resetState()
    }

    private resetState(): void {
        this.host.removeAttribute('dragged')
        const container = this.host.containerRef()
        if (container) {
            container.style.removeProperty('cursor')
        }
        this.pointerId = null
        this.startX = 0
        this.startY = 0
        this.engaged = false
        this.canceled = false
        this.currentDx = 0
        this.containerWidth = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveDx = 0
    }
}
