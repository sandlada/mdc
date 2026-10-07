/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
    resolveDockEdgeOfSide,
    resolveDockSide,
    resolveDockSideOfEdge,
    type DockSide,
    type TextDirection,
} from '../../../utils/docking'
import {
    NAVIGATION_DRAWER_DRAG_END_EVENT,
    NAVIGATION_DRAWER_DRAG_EVENT,
    NAVIGATION_DRAWER_DRAG_START_EVENT,
    type INavigationDrawerDragEndEventDetail,
    type INavigationDrawerDragEventDetail,
    type INavigationDrawerDragStartEventDetail,
    type NavigationDrawerDragTarget,
    type NavigationDrawerEdge,
    type NavigationDrawerVariant,
} from '../navigation-drawer.interface'

/** Distance (CSS px) the pointer must travel from the down point before a drag engages. */
const ENGAGE_THRESHOLD_PX = 4

/**
 * Snap-decision distance: drag must exceed this fraction of container
 * width to commit a dismissal.
 */
const DISTANCE_COMMIT_FRACTION = 0.25

/**
 * Snap-decision velocity: release must exceed this px/ms outward to commit
 * a dismissal.
 */
const VELOCITY_COMMIT_PX_PER_MS = 0.5

/** Window over which to compute release velocity (ms). */
const VELOCITY_WINDOW_MS = 80

/**
 * Max vertical movement (px) allowed during a drag, expressed as a
 * multiple of the horizontal movement. Beyond this, the drag is canceled.
 */
const MAX_VERTICAL_RATIO = 2

/** Resistance factor applied to movement beyond a drag's hard boundary. */
const RUBBER_BAND_FACTOR = 0.2

/**
 * Host contract for {@link NavigationDrawerDragController}.
 */
export interface INavigationDrawerDragHost extends ReactiveControllerHost, HTMLElement {
    containerRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    /** Drag gestures allowed at all (`draggable && !quick`). */
    enabled: () => boolean
    /** Whether the drawer currently rests open. */
    isOpen: () => boolean
    getVariant: () => NavigationDrawerVariant
    getDrawerEdge: () => NavigationDrawerEdge
    /** Ambient text direction of the host (`ltr` / `rtl`). */
    getDirection: () => TextDirection
    /**
     * Whether a pointer drag is currently in flight (engaged or tracking).
     * Async lifecycle flows must check this before cleaning up drag-owned
     * state or moving focus.
     */
    isDragging: () => boolean
    /**
     * Called the moment a gesture engages, BEFORE the first paint. The host
     * aborts any in-flight settle animation so it cannot keep overriding
     * the inline transform the drag is about to write.
     */
    onDragStart: () => void
    /**
     * Clear the live drag artifacts — inline transform / scrim opacity /
     * `dragged` attribute — when a gesture aborts without a settle
     * animation.
     */
    onDragCleanup: () => void
}

/**
 * Pointer-driven handle drag controller for the modal navigation drawer.
 *
 * The gesture starts on the top drag handle and follows the pointer in a
 * dock-agnostic "push-out value" space (`0` open, `W` fully off the docked
 * edge, negative values spilling towards the opposite edge):
 * - outward past the commit distance / velocity dismisses, mirroring the
 *   previous swipe-to-dismiss heuristics;
 * - a release whose center crossed the viewport midline relocates the
 *   drawer to the opposite edge (logical `start` / `end`, resolved against
 *   the text direction);
 * - anything else snaps back to the open resting position.
 */
export class NavigationDrawerDragController implements ReactiveController {
    private readonly host: INavigationDrawerDragHost

    // ── Pointer state ──────────────────────────────────────────────────────
    private pointerId: number | null = null
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    // ── Drag geometry ──────────────────────────────────────────────────────
    /**
     * Rest-relative push-out movement (0 at the grab point, outward
     * positive). Drives the snap decisions, velocity and scrim progress.
     */
    private currentValue = 0
    /** Physical translate at engagement — grabs mid-motion continue from it. */
    private baseTranslate = 0
    /** Physical translate currently painted on the container. */
    private currentTranslate = 0
    private containerWidth = 0
    private lastMoveT = 0
    private lastMoveValue = 0
    private releaseVelocity = 0
    /** Text direction captured when the gesture engaged. */
    private direction: TextDirection = 'ltr'

    // ── Bound handlers ─────────────────────────────────────────────────────
    private readonly handlePointerMoveBound: (e: PointerEvent) => void
    private readonly handlePointerUpBound: (e: PointerEvent) => void
    private readonly handlePointerCancelBound: (e: PointerEvent) => void

    public constructor(host: INavigationDrawerDragHost) {
        this.host = host
        host.addController(this)

        this.handlePointerMoveBound = (e) => this.handlePointerMove(e)
        this.handlePointerUpBound = (e) => this.handlePointerUp(e)
        this.handlePointerCancelBound = (e) => this.handlePointerUp(e, true)
    }

    public hostConnected(): void {
        // Pointer down listeners are bound on the handle in the template.
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

    /**
     * Whether a gesture is in flight (tracking or engaged). Async lifecycle
     * flows must not clean up drag-owned state while this is true.
     */
    public isDragging(): boolean {
        return this.pointerId !== null
    }

    // ── Gesture entry point (bound in the host template) ──────────────────

    /**
     * Pointer down on the drag handle. Only the open modal drawer accepts a
     * gesture — a closed container is off-viewport and standard/permanent
     * variants never drag.
     */
    public handlePointerDown(event: PointerEvent): void {
        if (this.pointerId !== null) return
        if (!this.host.enabled()) return
        if (this.host.getVariant() !== 'modal') return
        if (!this.host.isOpen()) return
        if (!event.isPrimary) return

        this.beginTracking(event)
    }

    // ── Tracking ───────────────────────────────────────────────────────────

    private beginTracking(event: PointerEvent): void {
        this.pointerId = event.pointerId
        this.startX = event.clientX
        this.startY = event.clientY
        this.engaged = false
        this.canceled = false
        this.currentValue = 0
        this.containerWidth = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveValue = 0
        this.direction = this.host.getDirection()

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
            // Read the LIVE offset before anything is canceled: a grab during
            // the open transition (or a settle animation) continues from the
            // position on screen instead of jumping to the pointer's rest
            // offset. Read first — aborting the animation / suppressing the
            // transition would fall the computed value back to the class rest.
            this.baseTranslate = this.readTranslateX(container)
            // Let the host abort any in-flight settle WAAPI: an animation
            // keeps overriding inline transforms, so the drag could not
            // paint until it finished.
            this.host.onDragStart()

            this.host.setAttribute('dragged', '')
            this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragStartEventDetail>(
                NAVIGATION_DRAWER_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { drawerEdge: this.host.getDrawerEdge() },
                },
            ))
        }

        const sign = this.currentSide() === 'left' ? -1 : 1
        // Rest-relative movement (push-out space, outward positive) drives
        // the snap decisions, velocity and scrim progress...
        const movement = sign * deltaX
        // ...while the painted translate follows the pointer from wherever
        // the drawer was when grabbed (physical space).
        let translate = this.baseTranslate + deltaX

        // Outward limit: fully off the docked edge. Inward limit: the
        // drawer's inner edge reaching the opposite viewport edge. The
        // limits live in physical space (sign * value).
        const viewportWidth = this.host.containerRef()
            ?.ownerDocument.defaultView?.innerWidth ?? 0
        const outwardHard = sign * this.containerWidth
        const inwardHard = -sign * (viewportWidth - this.containerWidth)
        const beyondOutward = sign > 0
            ? translate > outwardHard
            : translate < outwardHard
        const beyondInward = sign > 0
            ? translate < inwardHard
            : translate > inwardHard
        if (beyondOutward) {
            translate = outwardHard + (translate - outwardHard) * RUBBER_BAND_FACTOR
        } else if (beyondInward) {
            translate = inwardHard + (translate - inwardHard) * RUBBER_BAND_FACTOR
        }

        this.currentValue = movement
        this.currentTranslate = translate

        // Track release velocity in push-out space (outward positive).
        const now = performance.now()
        const prevT = this.lastMoveT
        const prevValue = this.lastMoveValue
        this.lastMoveT = now
        this.lastMoveValue = movement
        if (prevT > 0 && now - prevT < VELOCITY_WINDOW_MS) {
            this.releaseVelocity = (movement - prevValue) / (now - prevT)
        } else if (now - prevT >= VELOCITY_WINDOW_MS) {
            this.releaseVelocity = 0
        }

        this.paint(translate, movement)
        this.emitDrag(translate, movement)
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
            this.finishGesture('open', false, 'cancel')
            return
        }

        const lastValue = this.currentValue
        const width = this.containerWidth > 0 ? this.containerWidth : 1
        const commitDistance = Math.max(40, width * DISTANCE_COMMIT_FRACTION)

        let target: NavigationDrawerDragTarget = 'open'
        let reason: 'distance' | 'velocity' | undefined = undefined
        let relocateTo: NavigationDrawerEdge | undefined = undefined

        const rect = container?.getBoundingClientRect()
        const viewportWidth = container?.ownerDocument.defaultView?.innerWidth
            ?? rect?.width ?? 0
        const currentSide = this.currentSide()
        const sideByCenter = rect
            ? resolveDockSide(viewportWidth)(rect.left + rect.width / 2)
            : currentSide

        if (lastValue > commitDistance
            || this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
        ) {
            target = 'closed'
            reason = this.releaseVelocity > VELOCITY_COMMIT_PX_PER_MS
                ? 'velocity'
                : 'distance'
        } else if (sideByCenter !== currentSide) {
            // Released past the viewport midline: re-dock to that side's edge.
            target = 'relocate'
            relocateTo = resolveDockEdgeOfSide(this.direction)(sideByCenter)
        }

        this.finishGesture(target, target !== 'open', reason, relocateTo)
    }

    /**
     * Emits the drag-end event and clears the live drag bookkeeping. The
     * inline transform stays on the container until the host's settle
     * animation takes over.
     */
    private finishGesture(
        target: NavigationDrawerDragTarget,
        committed: boolean,
        reason: 'distance' | 'velocity' | 'cancel' | undefined,
        relocateTo?: NavigationDrawerEdge,
    ): void {
        this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragEndEventDetail>(
            NAVIGATION_DRAWER_DRAG_END_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    committed,
                    target,
                    reason,
                    // Physical position at release: settle animations start
                    // exactly where the drag left the container (which may
                    // differ from the rest-relative movement when the grab
                    // happened mid-motion).
                    dx: this.currentTranslate,
                    relocateTo,
                },
            },
        ))
        this.resetState()
    }

    private emitDrag(translate: number, movement: number): void {
        const width = this.containerWidth > 0 ? this.containerWidth : 1
        const progress = Math.min(1, Math.max(0, movement / width))
        this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragEventDetail>(
            NAVIGATION_DRAWER_DRAG_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { dx: translate, progress },
            },
        ))
    }

    /**
     * Paint the live physical translation. The scrim only follows the
     * OUTWARD (dismiss) direction; pulling the drawer inward must never dim
     * it.
     */
    private paint(translate: number, movement: number): void {
        const container = this.host.containerRef()
        if (container) container.style.transform = `translateX(${translate}px)`
        const scrim = this.host.scrimRef()
        const peak = 0.38
        if (scrim && movement > 0) {
            const width = this.containerWidth > 0 ? this.containerWidth : 1
            const progress = Math.min(1, Math.max(0, movement / Math.max(1, width)))
            scrim.style.opacity = String(peak * (1 - progress))
        }
    }

    /** Physical side of the drawer's current logical edge under its `dir`. */
    private currentSide(): DockSide {
        return resolveDockSideOfEdge(this.direction)(this.host.getDrawerEdge())
    }

    /** Read the x-translation component from a `matrix(a, b, c, d, e, f)`. */
    private readTranslateX(el: HTMLElement): number {
        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const match = t.match(/matrix\([^)]*\)/)
        if (!match) return 0
        const parts = match[0].slice(7, -1).split(',').map((s) => parseFloat(s.trim()))
        return parts.length >= 5 ? parts[4] : 0
    }

    private resetState(): void {
        this.pointerId = null
        this.startX = 0
        this.startY = 0
        this.engaged = false
        this.canceled = false
        this.currentValue = 0
        this.baseTranslate = 0
        this.currentTranslate = 0
        this.containerWidth = 0
        this.releaseVelocity = 0
        this.lastMoveT = 0
        this.lastMoveValue = 0
        this.direction = 'ltr'
    }
}
