/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { resolveDockSide } from '../../../utils/docking'
import {
    SIDE_SHEET_DRAG_END_EVENT,
    SIDE_SHEET_DRAG_EVENT,
    SIDE_SHEET_DRAG_START_EVENT,
    type ISideSheetDragEndEventDetail,
    type ISideSheetDragEventDetail,
    type ISideSheetDragStartEventDetail,
    type SideSheetDragTarget,
    type SideSheetHandleMode,
    type SideSheetPosition,
    type SideSheetVariant,
} from '../side-sheet.interface'

/** Distance (CSS px) the pointer must travel from the down point before a drag engages. */
const ENGAGE_THRESHOLD_PX = 4

/**
 * Snap-decision distance: drag must exceed this fraction of container width to
 * commit close / reveal.
 */
const DISTANCE_COMMIT_FRACTION = 0.25

/**
 * Snap-decision velocity: release must exceed this px/ms in the commit
 * direction to commit (per Material Design spec).
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

/** Resistance factor applied to movement beyond a drag's hard boundary. */
const RUBBER_BAND_FACTOR = 0.2

/**
 * Drag gesture mode:
 * - `move`: sheet is open; free horizontal drag.
 * - `reveal`: sheet is closed in peek mode; dragging pulls the sheet out.
 */
type DragMode = 'move' | 'reveal'

/**
 * Host contract for {@link SideSheetDragController}.
 */
export interface ISideSheetDragHost extends ReactiveControllerHost, HTMLElement {
    containerRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    handleRef: () => HTMLElement | null
    /** Drag gestures allowed at all (`draggable && !quick`). */
    dragEnabled: () => boolean
    /** Whether the sheet currently shows its open resting state. */
    isOpen: () => boolean
    getVariant: () => SideSheetVariant
    getPosition: () => SideSheetPosition
    getHandleMode: () => SideSheetHandleMode
    /** Peek sliver width in CSS px (peek mode only). */
    peekWidthPx: () => number
    /**
     * Clear the live drag artifacts — inline transform / scrim opacity /
     * cursor / `dragged` attribute — when a gesture aborts without a
     * settle animation.
     */
    onDragCleanup: () => void
}

/**
 * Pointer-driven drag controller for side-sheet.
 *
 * Gestures start on the drag handle (or the peek grip) and engage after a
 * 4px horizontal threshold, canceling on vertical-dominant movement:
 * - **Move** (open sheet): the sheet follows the pointer freely for as
 *   long as it is held — outward until fully off the docked edge,
 *   inward until its inner edge reaches the opposite viewport edge —
 *   rubber-banding beyond either limit. On release the controller
 *   decides: push far/fast enough toward the docked edge commits the
 *   dismissal; otherwise the new dock side is judged from the sheet's
 *   center and release velocity — crossing to the opposite side
 *   relocates the sheet, anything else snaps back open.
 * - **Reveal** (peeked sheet): dragging pulls the sheet out; release
 *   commits open on distance/velocity, relocates across the midline, or
 *   snaps back to the peek sliver.
 *
 * All live motion is expressed in a dock-agnostic "push-out value": `0` is
 * the open resting position, `W` fully hidden, `W - peekWidth` the peek
 * sliver, negatives spill toward the opposite midline.
 */
export class SideSheetDragController implements ReactiveController {
    private readonly host: ISideSheetDragHost

    // ── Pointer state ──────────────────────────────────────────────────────
    private pointerId: number | null = null
    private mode: DragMode = 'move'
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    // ── Drag geometry ──────────────────────────────────────────────────────
    /** Dock-agnostic push-out value (0 open, W closed, W - peek sliver). */
    private currentValue = 0
    /** Base value the gesture started from (peek sliver or 0). */
    private baseValue = 0
    private containerWidth = 0
    private lastMoveT = 0
    private lastMoveValue = 0
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
        this.handlePointerCancelBound = (e) => this.handlePointerUp(e, true)
    }

    public hostConnected(): void {
        // Pointer down listeners are bound on the handle / peek grip in template.
    }

    public hostDisconnected(): void {
        this.detachWindowListeners()
        this.resetState()
    }

    /**
     * Cancel any in-flight drag (e.g. when the host calls `hide()` mid-drag).
     * Idempotent: also drops live artifacts left by an already-finished
     * gesture so a stale state never leaks into the next lifecycle step.
     */
    public cancel(): void {
        this.detachWindowListeners()
        this.resetState()
        this.host.onDragCleanup()
    }

    // ── Gesture entry point (bound in the host template) ──────────────────

    /**
     * Pointer down on the drag handle. Starts `move` (open sheet) or
     * `reveal` (peeked sheet).
     */
    public handlePointerDown(event: PointerEvent): void {
        if (this.pointerId !== null) return
        if (!this.host.dragEnabled()) return
        if (!event.isPrimary) return

        const open = this.host.isOpen()
        const peek = this.host.getHandleMode() === 'peek'
        if (!open && !peek) return

        this.mode = open ? 'move' : 'reveal'
        this.beginTracking(event)
    }

    // ── Tracking ───────────────────────────────────────────────────────────

    private beginTracking(event: PointerEvent): void {
        this.pointerId = event.pointerId
        this.startX = event.clientX
        this.startY = event.clientY
        this.engaged = false
        this.canceled = false
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveValue = 0
        this.containerWidth = 0
        this.baseValue = this.host.isOpen() ? 0 : this.restPeekValue()
        this.currentValue = this.baseValue

        window.addEventListener('pointermove', this.handlePointerMoveBound)
        window.addEventListener('pointerup', this.handlePointerUpBound)
        window.addEventListener('pointercancel', this.handlePointerCancelBound)
    }

    private detachWindowListeners(): void {
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.pointerId !== event.pointerId) return
        if (this.canceled) return

        const deltaX = event.clientX - this.startX
        const deltaY = Math.abs(event.clientY - this.startY)

        // Vertical-dominant motion before engagement → cancel drag.
        if (!this.engaged && deltaY > MAX_VERTICAL_RATIO * Math.max(Math.abs(deltaX), 1)) {
            this.canceled = true
            this.handlePointerUp(event)
            return
        }

        if (!this.engaged) {
            if (Math.abs(deltaX) < ENGAGE_THRESHOLD_PX) return
            const container = this.host.containerRef()
            if (!container) return
            try {
                container.setPointerCapture(event.pointerId)
            } catch {
                // setPointerCapture can throw on detached elements; safe to ignore.
            }
            this.engaged = true
            this.containerWidth = container.getBoundingClientRect().width

            this.host.setAttribute('dragged', '')
            this.host.handleRef()?.style.setProperty('cursor', 'grabbing')
            this.host.dispatchEvent(new CustomEvent<ISideSheetDragStartEventDetail>(
                SIDE_SHEET_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { position: this.host.getPosition() },
                },
            ))
        }

        const sign = this.host.getPosition() === 'left' ? -1 : 1
        // Dock-agnostic push-out value: pointer travel projected onto the
        // outward axis of the current dock. The sheet follows the pointer
        // for as long as it is held; the limits below only rubber-band.
        let value = this.baseValue + sign * deltaX

        // Outward limit: fully off the docked edge (move) / the peek rest
        // (reveal). Inward limit: the sheet's inner edge reaching the
        // opposite viewport edge.
        const viewportWidth = this.host.containerRef()
            ?.ownerDocument.defaultView?.innerWidth ?? 0
        const outwardHard = this.mode === 'reveal'
            ? this.baseValue
            : this.containerWidth
        const inwardHard = -(viewportWidth - this.containerWidth)
        if (value > outwardHard) {
            value = outwardHard + (value - outwardHard) * RUBBER_BAND_FACTOR
        } else if (value < inwardHard) {
            value = inwardHard + (value - inwardHard) * RUBBER_BAND_FACTOR
        }

        this.currentValue = value

        // Track release velocity in push-out space (outward positive).
        const now = performance.now()
        const prevT = this.lastMoveT
        const prevValue = this.lastMoveValue
        this.lastMoveT = now
        this.lastMoveValue = value
        if (prevT > 0 && now - prevT < VELOCITY_WINDOW_MS) {
            this.releaseVelocity = (value - prevValue) / (now - prevT)
        } else if (now - prevT >= VELOCITY_WINDOW_MS) {
            this.releaseVelocity = 0
        }

        this.paint(value)
        this.emitDrag(value)
    }

    private handlePointerUp(event: PointerEvent, canceled = false): void {
        if (this.pointerId !== event.pointerId) return
        this.detachWindowListeners()

        const container = this.host.containerRef()

        if (!this.engaged) {
            this.resetState()
            return
        }

        try { container?.releasePointerCapture(event.pointerId) } catch { /* detached */ }

        if (canceled || this.canceled) {
            this.finishGesture(this.mode === 'reveal' ? 'peek' : 'open', false, 'cancel')
            return
        }

        const lastValue = this.currentValue
        const width = this.containerWidth > 0 ? this.containerWidth : 1
        const commitDistance = Math.max(40, width * DISTANCE_COMMIT_FRACTION)

        let target: SideSheetDragTarget = this.mode === 'reveal' ? 'peek' : 'open'
        let reason: 'distance' | 'velocity' | undefined = undefined
        let relocateTo: SideSheetPosition | undefined = undefined

        const rect = container?.getBoundingClientRect()
        const viewportWidth = container?.ownerDocument.defaultView?.innerWidth
            ?? rect?.width ?? 0
        const sideByCenter = rect
            ? resolveDockSide(viewportWidth)(rect.left + rect.width / 2)
            : this.host.getPosition()

        if (this.mode === 'reveal' && (
            lastValue < this.baseValue - commitDistance
            || this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS
        )) {
            // Pulling the sheet out: far enough / fast enough reveals it.
            // The opened sheet re-docks to the side its center ended on.
            target = 'reveal'
            reason = this.releaseVelocity < -VELOCITY_COMMIT_PX_PER_MS
                ? 'velocity'
                : 'distance'
            if (sideByCenter !== this.host.getPosition()) relocateTo = sideByCenter
        } else if (this.mode === 'move' && (
            lastValue > commitDistance
            || this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
        )) {
            target = 'closed'
            reason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
                ? 'velocity'
                : 'distance'
        } else if (sideByCenter !== this.host.getPosition()) {
            // Free travel released away from a commit boundary: judge the
            // new dock side on release.
            target = 'relocate'
            relocateTo = sideByCenter
        }

        this.finishGesture(target, target === 'closed' || target === 'reveal', reason, relocateTo)
    }

    /**
     * Emits the drag-end event and clears the live drag bookkeeping. The
     * inline transform stays on the container until the host's settle
     * animation takes over.
     */
    private finishGesture(
        target: SideSheetDragTarget,
        committed: boolean,
        reason: 'distance' | 'velocity' | 'cancel' | undefined,
        relocateTo?: SideSheetPosition,
    ): void {
        const sign = this.host.getPosition() === 'left' ? -1 : 1
        this.host.dispatchEvent(new CustomEvent<ISideSheetDragEndEventDetail>(
            SIDE_SHEET_DRAG_END_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    committed,
                    target,
                    reason,
                    dx: sign * this.currentValue,
                    relocateTo,
                },
            },
        ))
        this.resetState()
    }

    private emitDrag(value: number): void {
        const sign = this.host.getPosition() === 'left' ? -1 : 1
        const translateX = sign * value
        const width = this.containerWidth > 0 ? this.containerWidth : 1
        let progress: number
        if (this.mode === 'reveal') {
            const travel = Math.max(1, width - this.host.peekWidthPx())
            progress = Math.min(1, Math.max(0, (this.baseValue - value) / travel))
        } else {
            progress = Math.min(1, Math.max(0, value / width))
        }
        this.host.dispatchEvent(new CustomEvent<ISideSheetDragEventDetail>(
            SIDE_SHEET_DRAG_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { dx: translateX, progress },
            },
        ))
    }

    /**
     * Paint the live translation for the current push-out value.
     */
    private paint(value: number): void {
        const sign = this.host.getPosition() === 'left' ? -1 : 1
        const container = this.host.containerRef()
        if (container) container.style.transform = `translateX(${sign * value}px)`
        // The scrim only follows the OUTWARD (dismiss) direction; pulling
        // the sheet inward (negative value) must never dim it.
        const scrim = this.host.scrimRef()
        const peak = 0.32
        if (scrim && this.host.getVariant() === 'modal' && value > 0) {
            const width = this.containerWidth > 0 ? this.containerWidth : 1
            const progress = Math.min(1, Math.max(0, value / Math.max(1, width)))
            scrim.style.opacity = String(peak * (1 - progress))
        }
    }

    private restPeekValue(): number {
        const width = this.host.containerRef()?.getBoundingClientRect().width
            ?? this.host.getBoundingClientRect().width
        return Math.max(0, width - this.host.peekWidthPx())
    }

    private resetState(): void {
        this.pointerId = null
        this.mode = 'move'
        this.startX = 0
        this.startY = 0
        this.engaged = false
        this.canceled = false
        this.currentValue = 0
        this.baseValue = 0
        this.containerWidth = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveValue = 0
    }
}
