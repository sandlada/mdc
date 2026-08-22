/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
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

const ENGAGE_THRESHOLD_PX = 4
const DISTANCE_COMMIT_FRACTION = 0.25
const VELOCITY_COMMIT_PX_PER_MS = 0.5
const VELOCITY_WINDOW_MS = 80
const MAX_VERTICAL_RATIO = 2

/**
 * Host contract for {@link NavigationDrawerDragController}.
 */
export interface INavigationDrawerDragHost extends ReactiveControllerHost, HTMLElement {
    containerRef: () => HTMLElement | null
    scrimRef: () => HTMLElement | null
    enabled: () => boolean
    getVariant: () => NavigationDrawerVariant
    getDrawerEdge: () => NavigationDrawerEdge
}

/**
 * Pointer-driven horizontal swipe-to-dismiss controller for navigation drawer.
 */
export class NavigationDrawerDragController implements ReactiveController {
    private readonly host: INavigationDrawerDragHost

    private pointerId: number | null = null
    private startX = 0
    private startY = 0
    private engaged = false
    private canceled = false

    private currentDx = 0
    private containerWidth = 0
    private lastMoveT = 0
    private lastMoveDx = 0
    private releaseVelocity = 0

    private readonly handlePointerMoveBound: (e: PointerEvent) => void
    private readonly handlePointerUpBound: (e: PointerEvent) => void
    private readonly handlePointerCancelBound: (e: PointerEvent) => void

    public constructor(host: INavigationDrawerDragHost) {
        this.host = host
        host.addController(this)

        this.handlePointerMoveBound = (e) => this.handlePointerMove(e)
        this.handlePointerUpBound = (e) => this.handlePointerUp(e)
        this.handlePointerCancelBound = (e) => this.handlePointerUp(e)
    }

    public hostConnected(): void {}

    public hostDisconnected(): void {
        window.removeEventListener('pointermove', this.handlePointerMoveBound)
        window.removeEventListener('pointerup', this.handlePointerUpBound)
        window.removeEventListener('pointercancel', this.handlePointerCancelBound)
        this.resetState()
    }

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
        if (this.host.getVariant() !== 'modal') return
        if (!event.isPrimary) return

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
            } catch {}
            this.engaged = true
            this.containerWidth = container.getBoundingClientRect().width

            this.host.setAttribute('touch-action', 'none')
            container.style.cursor = 'grabbing'
            this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragStartEventDetail>(
                NAVIGATION_DRAWER_DRAG_START_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { drawerEdge: this.host.getDrawerEdge() },
                },
            ))
        }

        const edge = this.host.getDrawerEdge()
        let dx = 0

        if (edge === 'end') {
            if (deltaX < 0) {
                dx = deltaX * 0.2
            } else {
                dx = deltaX
            }
        } else {
            if (deltaX > 0) {
                dx = deltaX * 0.2
            } else {
                dx = deltaX
            }
        }

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
        const peak = 0.38

        if (scrim) {
            const progress = Math.min(1, Math.max(0, Math.abs(dx) / Math.max(1, this.containerWidth)))
            scrim.style.opacity = String(peak * (1 - progress))
        }

        if (container) container.style.transform = `translateX(${dx}px)`

        const totalW = this.containerWidth > 0 ? this.containerWidth : 1
        const progress = Math.min(1, Math.max(0, Math.abs(dx) / totalW))

        this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragEventDetail>(
            NAVIGATION_DRAWER_DRAG_EVENT,
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
            this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragEndEventDetail>(
                NAVIGATION_DRAWER_DRAG_END_EVENT,
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

        const edge = this.host.getDrawerEdge()
        const closeThreshold = Math.max(40, this.containerWidth * DISTANCE_COMMIT_FRACTION)

        let target: NavigationDrawerDragTarget = 'open'
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

        this.host.dispatchEvent(new CustomEvent<INavigationDrawerDragEndEventDetail>(
            NAVIGATION_DRAWER_DRAG_END_EVENT,
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
        this.host.removeAttribute('touch-action')
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
