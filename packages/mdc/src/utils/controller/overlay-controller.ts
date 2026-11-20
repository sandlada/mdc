/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Shared Lit ReactiveController for floating overlays (Popover, ContextMenu,
 * Menu, Submenu, FabMenu, TooltipBox, Select, etc.).
 *
 * Integrates `@floating-ui/dom` positioning (element or virtual `(x, y)` anchor),
 * `OverlayTreeManager` (nested parent-child overlays, leaf-first Escape,
 * subtree-safe outside click, sibling exclusion, cascading close),
 * WAAPI motion, and focus restoration.
 */
import {
    arrow as arrowMiddleware,
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
    type Middleware,
    type VirtualElement,
} from '@floating-ui/dom'
import { Easing } from '@sandlada/mdk'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { DefaultOverlayTree, type OverlayTreeManager } from './overlay-tree'

export const OverlayPlacements = {
    Top: 'top',
    TopStart: 'top-start',
    TopEnd: 'top-end',
    Bottom: 'bottom',
    BottomStart: 'bottom-start',
    BottomEnd: 'bottom-end',
    Left: 'left',
    LeftStart: 'left-start',
    LeftEnd: 'left-end',
    Right: 'right',
    RightStart: 'right-start',
    RightEnd: 'right-end',
} as const
export type OverlayPlacements = (typeof OverlayPlacements)[keyof typeof OverlayPlacements]

export const OverlayDismissReasons = {
    OutsideClick: 'outside-click',
    Escape: 'escape',
    AnchorClick: 'anchor-click',
    PointerLeave: 'pointer-leave',
    Scroll: 'scroll',
    Programmatic: 'programmatic',
    Exclusive: 'exclusive',
} as const
export type OverlayDismissReasons = (typeof OverlayDismissReasons)[keyof typeof OverlayDismissReasons]

export type OverlayDirection = 'top' | 'bottom' | 'left' | 'right'

export interface IOverlayPoint {
    readonly x: number
    readonly y: number
}

export interface IOverlayControllerOptions {
    /** Optional explicit node ID; auto-generated when omitted. */
    id?: string
    /** Optional explicit parent overlay ID; auto-discovered from DOM ancestry when omitted. */
    getParentOverlayId?: () => string | null | undefined
    /** Optional OverlayTree instance; defaults to `DefaultOverlayTree`. */
    tree?: OverlayTreeManager
    /** Returns the floating surface element to position and animate. */
    getSurfaceElement: () => HTMLElement | null | undefined
    /** Returns the anchor element when not using virtual `(x, y)` coordinates. */
    getAnchorElement: () => HTMLElement | null | undefined
    /** Optional directional arrow element. */
    getArrowElement?: () => HTMLElement | null | undefined
    /** Additional elements ignored by outside-click dismiss. */
    getDismissIgnoreElements?: () => ReadonlyArray<HTMLElement | null | undefined>
    /** Preferred placement. */
    getPlacement: () => OverlayPlacements
    /** Offset in pixels between anchor and surface. */
    getOffset: () => number
    /** Whether flip middleware is disabled. */
    getDisableFlip?: () => boolean
    /** Whether open/close WAAPI animations are skipped. */
    getQuick?: () => boolean
    /** Whether scrolling dismisses the overlay. */
    getCloseOnScroll?: () => boolean
    /** Whether focus returns to the previously focused element on Escape/programmatic close. */
    shouldRestoreFocus?: () => boolean
    /** Optional sibling exclusion group name (e.g. `'mdc-context-menu'`). */
    exclusiveGroup?: string
    /** Invoked whenever open state changes. */
    onOpenChange: (open: boolean) => void
    /** Invoked when Floating UI resolves the effective placement. */
    onResolvedPlacementChange?: (placement: OverlayPlacements) => void
    /** Cancelable hook before opening; return `false` to abort. */
    onBeforeShow?: () => boolean
    /** Hook after opening completes. */
    onShown?: () => void
    /** Cancelable hook before closing; return `false` to abort. */
    onBeforeHide?: (reason: OverlayDismissReasons) => boolean
    /** Hook after closing completes. */
    onHidden?: (reason: OverlayDismissReasons) => void
}

export const OverlayIdAttribute = 'data-mdc-overlay-id'

const ViewportShiftPadding = 8
const ArrowEdgePadding = 8
const OpenMotionDurationMs = 180
const CloseMotionDurationMs = 140
const SlideDistancePx = 8

let NextOverlayUid = 0

export const getDirectionFromPlacement = (placement: OverlayPlacements): OverlayDirection => {
    const primary = placement.split('-')[0]
    if (primary === 'top' || primary === 'bottom' || primary === 'left' || primary === 'right') {
        return primary
    }
    throw new Error(`Invalid overlay placement: "${placement}"`)
}

export const assertValidOverlayPoint = (x: number, y: number): IOverlayPoint => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Overlay coordinates must be finite numbers, received (${x}, ${y})`)
    }
    return { x, y }
}

export const createVirtualPointElement = (x: number, y: number): VirtualElement => {
    const point = assertValidOverlayPoint(x, y)
    return {
        getBoundingClientRect(): DOMRect {
            return {
                x: point.x,
                y: point.y,
                top: point.y,
                left: point.x,
                bottom: point.y,
                right: point.x,
                width: 0,
                height: 0,
                toJSON() {
                    return this
                },
            } as DOMRect
        },
    }
}

export const getPlacementSlideOffset = (distancePx: number) => (placement: OverlayPlacements): IOverlayPoint => {
    switch (getDirectionFromPlacement(placement)) {
        case 'top':
            return { x: 0, y: distancePx }
        case 'bottom':
            return { x: 0, y: -distancePx }
        case 'left':
            return { x: distancePx, y: 0 }
        case 'right':
            return { x: -distancePx, y: 0 }
    }
}

export const isOutsideComposedPath = (
    path: readonly EventTarget[],
    boundaries: ReadonlyArray<EventTarget | null | undefined>,
): boolean => {
    for (const boundary of boundaries) {
        if (boundary && path.includes(boundary)) {
            return false
        }
    }
    return true
}

/**
 * Walks up the composed DOM tree (crossing ShadowRoot boundaries) to find the
 * nearest ancestor overlay ID, enabling automatic parent-child overlay nesting.
 */
export const findNearestAncestorOverlayId = (startNode: Node | null, selfId: string): string | null => {
    let cursor: Node | null = startNode
    while (cursor) {
        if (cursor instanceof Element) {
            const candidate = cursor.getAttribute(OverlayIdAttribute)
            if (candidate && candidate !== selfId) {
                return candidate
            }
            if (cursor.assignedSlot) {
                cursor = cursor.assignedSlot
                continue
            }
        }
        if (cursor.parentNode) {
            cursor = cursor.parentNode
        } else if (cursor instanceof ShadowRoot) {
            cursor = cursor.host
        } else {
            cursor = null
        }
    }
    return null
}

const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getFocusedElementDeep = (): HTMLElement | null => {
    if (typeof document === 'undefined') return null
    let active: Element | null = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active instanceof HTMLElement ? active : null
}

/**
 * Reusable floating overlay controller shared by Popover, ContextMenu, Menu, FabMenu, etc.
 */
export class OverlayController implements ReactiveController {
    public readonly overlayId: string

    private readonly host: ReactiveControllerHost & HTMLElement
    private readonly options: IOverlayControllerOptions
    private readonly tree: OverlayTreeManager

    private isOpen = false
    private lifecycle = 0
    private virtualPoint: IOverlayPoint | null = null
    private cleanupAutoUpdate: (() => void) | null = null
    private activeAnimation: Animation | null = null
    private dismissListenersAttached = false
    private returnFocusTarget: HTMLElement | null = null

    public constructor(
        host: ReactiveControllerHost & HTMLElement,
        options: IOverlayControllerOptions,
    ) {
        this.host = host
        this.options = options
        this.tree = options.tree ?? DefaultOverlayTree
        this.overlayId = options.id ?? `mdc-overlay-${++NextOverlayUid}`
        host.addController(this)
    }

    public get opened(): boolean {
        return this.isOpen
    }

    public hostConnected(): void {
        this.registerInTree()
    }

    public hostDisconnected(): void {
        this.teardownPositioning()
        this.detachDismissListeners()
        this.cancelActiveAnimation()
        this.tree.unregister(this.overlayId)
        this.isOpen = false
    }

    public async show(): Promise<void> {
        this.virtualPoint = null
        await this.openInternal(false)
    }

    public async showAt(x: number, y: number): Promise<void> {
        this.virtualPoint = assertValidOverlayPoint(x, y)
        await this.openInternal(true)
    }

    public async hide(reason: OverlayDismissReasons = OverlayDismissReasons.Programmatic): Promise<void> {
        if (!this.isOpen) return

        if (this.options.onBeforeHide && !this.options.onBeforeHide(reason)) {
            return
        }

        const token = ++this.lifecycle
        this.detachDismissListeners()
        this.teardownPositioning()

        await this.tree.markClosed(this.overlayId, reason)
        if (token !== this.lifecycle) return

        await this.animateSurface('close')
        if (token !== this.lifecycle) return

        this.isOpen = false
        this.virtualPoint = null
        this.options.onOpenChange(false)
        await this.host.updateComplete
        if (token !== this.lifecycle) return

        if (this.options.shouldRestoreFocus?.() !== false) {
            this.restoreFocus(reason)
        }
        this.options.onHidden?.(reason)
    }

    public async toggle(): Promise<void> {
        if (this.isOpen) {
            await this.hide(OverlayDismissReasons.AnchorClick)
        } else {
            await this.show()
        }
    }

    public async updatePosition(): Promise<void> {
        if (!this.isOpen || typeof document === 'undefined') return
        const surface = this.options.getSurfaceElement()
        const reference = this.resolveReference()
        if (!surface || !reference) return

        surface.setAttribute(OverlayIdAttribute, this.overlayId)

        const placement = this.options.getPlacement()
        const offsetPx = this.options.getOffset()
        const arrowEl = this.options.getArrowElement?.()

        const middleware: Middleware[] = [offset(offsetPx)]
        if (!this.options.getDisableFlip?.()) {
            middleware.push(flip())
        }
        middleware.push(shift({ padding: ViewportShiftPadding }))
        if (arrowEl) {
            middleware.push(arrowMiddleware({ element: arrowEl, padding: ArrowEdgePadding }))
        }

        const result = await computePosition(reference, surface, {
            strategy: 'fixed',
            placement,
            middleware,
        })

        const resolvedPlacement = result.placement as OverlayPlacements
        surface.style.position = 'fixed'
        surface.style.left = `${Math.round(result.x)}px`
        surface.style.top = `${Math.round(result.y)}px`
        surface.style.right = 'auto'
        surface.style.bottom = 'auto'
        surface.style.transform = 'none'
        surface.style.margin = '0'
        surface.dataset['placement'] = resolvedPlacement
        this.options.onResolvedPlacementChange?.(resolvedPlacement)

        if (arrowEl && result.middlewareData.arrow) {
            const { x: arrowX, y: arrowY } = result.middlewareData.arrow
            const staticSideMap = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            } as const
            const direction = getDirectionFromPlacement(resolvedPlacement)
            const staticSide = staticSideMap[direction]

            arrowEl.style.left = arrowX != null ? `${Math.round(arrowX)}px` : ''
            arrowEl.style.top = arrowY != null ? `${Math.round(arrowY)}px` : ''
            arrowEl.style.right = ''
            arrowEl.style.bottom = ''
            arrowEl.style[staticSide] = '-5px'
        }
    }

    private registerInTree(): void {
        if (typeof document !== 'undefined') {
            this.host.setAttribute(OverlayIdAttribute, this.overlayId)
        }
        const parentId = this.resolveParentOverlayId()
        this.tree.register(this.overlayId, {
            parentId,
            group: this.options.exclusiveGroup ?? null,
            getSurface: () => this.options.getSurfaceElement(),
            onClose: (reason) => this.closeFromTree(reason as OverlayDismissReasons),
        })
    }

    private resolveParentOverlayId(): string | null {
        const explicit = this.options.getParentOverlayId?.()
        if (explicit !== undefined) return explicit
        if (typeof document === 'undefined') return null
        return findNearestAncestorOverlayId(this.host, this.overlayId)
    }

    private async closeFromTree(reason: OverlayDismissReasons): Promise<void> {
        if (!this.isOpen) return
        const token = ++this.lifecycle
        this.detachDismissListeners()
        this.teardownPositioning()
        this.cancelActiveAnimation()
        this.isOpen = false
        this.virtualPoint = null
        this.options.onOpenChange(false)
        await this.host.updateComplete
        if (token !== this.lifecycle) return
        this.options.onHidden?.(reason)
    }

    private async openInternal(repositionIfOpen: boolean): Promise<void> {
        if (this.isOpen && !repositionIfOpen) return

        if (!this.isOpen && this.options.onBeforeShow && !this.options.onBeforeShow()) {
            return
        }

        const token = ++this.lifecycle
        this.registerInTree()
        this.tree.setParent(this.overlayId, this.resolveParentOverlayId())

        await this.tree.markOpen(this.overlayId)
        if (token !== this.lifecycle) return

        if (!this.isOpen) {
            this.returnFocusTarget = getFocusedElementDeep()
        }

        this.isOpen = true
        this.options.onOpenChange(true)
        await this.host.updateComplete
        if (token !== this.lifecycle) return

        const surface = this.options.getSurfaceElement()
        surface?.setAttribute(OverlayIdAttribute, this.overlayId)

        this.setupPositioning()
        await this.updatePosition()
        if (token !== this.lifecycle) return

        this.attachDismissListeners()
        await this.animateSurface('open')
        if (token !== this.lifecycle) return

        this.options.onShown?.()
    }

    private resolveReference(): HTMLElement | VirtualElement | null {
        if (this.virtualPoint) {
            return createVirtualPointElement(this.virtualPoint.x, this.virtualPoint.y)
        }
        return this.options.getAnchorElement() ?? null
    }

    private setupPositioning(): void {
        if (typeof document === 'undefined') return
        this.teardownPositioning()

        const surface = this.options.getSurfaceElement()
        const reference = this.resolveReference()
        if (!surface || !reference) return

        if (this.virtualPoint) {
            void this.updatePosition()
            return
        }

        this.cleanupAutoUpdate = autoUpdate(reference, surface, () => {
            void this.updatePosition()
        })
    }

    private teardownPositioning(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
    }

    private cancelActiveAnimation(): void {
        if (this.activeAnimation) {
            this.activeAnimation.cancel()
            this.activeAnimation = null
        }
    }

    private async animateSurface(mode: 'open' | 'close'): Promise<void> {
        if (typeof document === 'undefined' || this.options.getQuick?.() || prefersReducedMotion()) {
            return
        }
        const surface = this.options.getSurfaceElement()
        if (!surface || typeof surface.animate !== 'function') {
            return
        }

        this.cancelActiveAnimation()

        const resolvedPlacement = (surface.dataset['placement'] as OverlayPlacements | undefined) ?? this.options.getPlacement()
        const { x, y } = getPlacementSlideOffset(SlideDistancePx)(resolvedPlacement)
        const translate = `translate3d(${x}px, ${y}px, 0)`

        const keyframes: Keyframe[] = mode === 'open'
            ? [
                { opacity: 0, transform: `${translate} scale(0.94)` },
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
            ]
            : [
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
                { opacity: 0, transform: `${translate} scale(0.96)` },
            ]

        const animation = surface.animate(keyframes, {
            duration: mode === 'open' ? OpenMotionDurationMs : CloseMotionDurationMs,
            easing: mode === 'open'
                ? Easing.EmphasizedDecelerate.ToCSSValue()
                : Easing.EmphasizedAccelerate.ToCSSValue(),
        })
        this.activeAnimation = animation

        try {
            await animation.finished
        } catch {
            // Cancelled animations reject `finished`; ignore safely.
        } finally {
            if (this.activeAnimation === animation) {
                this.activeAnimation = null
            }
        }
    }

    private attachDismissListeners(): void {
        if (typeof document === 'undefined' || this.dismissListenersAttached) return
        this.dismissListenersAttached = true
        window.addEventListener('pointerdown', this.handleWindowPointerDown, { capture: true })
        window.addEventListener('keydown', this.handleWindowKeyDown, { capture: true })
        if (this.options.getCloseOnScroll?.()) {
            window.addEventListener('scroll', this.handleWindowScroll, { capture: true, passive: true })
        }
    }

    private detachDismissListeners(): void {
        if (typeof document === 'undefined' || !this.dismissListenersAttached) return
        this.dismissListenersAttached = false
        window.removeEventListener('pointerdown', this.handleWindowPointerDown, { capture: true })
        window.removeEventListener('keydown', this.handleWindowKeyDown, { capture: true })
        window.removeEventListener('scroll', this.handleWindowScroll, { capture: true })
    }

    private readonly handleWindowPointerDown = (event: PointerEvent): void => {
        if (!this.isOpen) return
        const path = event.composedPath()
        const ignoreElements = this.options.getDismissIgnoreElements?.() ?? []
        const descendantSurfaces = this.tree.getOpenDescendantSurfaces(this.overlayId)
        const boundaries: Array<EventTarget | null | undefined> = [
            this.options.getSurfaceElement(),
            this.options.getAnchorElement(),
            ...ignoreElements,
            ...descendantSurfaces,
        ]
        if (isOutsideComposedPath(path, boundaries)) {
            void this.hide(OverlayDismissReasons.OutsideClick)
        }
    }

    private readonly handleWindowKeyDown = (event: KeyboardEvent): void => {
        if (!this.isOpen || event.key !== 'Escape') return
        // Leaf-first Escape: only the deepest active overlay handles this Escape press.
        if (this.tree.getDeepestActiveLeafId() !== this.overlayId) return
        event.stopPropagation()
        void this.hide(OverlayDismissReasons.Escape)
    }

    private readonly handleWindowScroll = (): void => {
        if (!this.isOpen || !this.options.getCloseOnScroll?.()) return
        void this.hide(OverlayDismissReasons.Scroll)
    }

    private restoreFocus(reason: OverlayDismissReasons): void {
        if (reason !== OverlayDismissReasons.Escape && reason !== OverlayDismissReasons.Programmatic) {
            this.returnFocusTarget = null
            return
        }
        const target = this.returnFocusTarget
        this.returnFocusTarget = null
        if (target && target.isConnected) {
            target.focus()
        }
    }
}
