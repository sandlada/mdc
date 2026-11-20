/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Composable Lit ReactiveController for overlay trigger gestures:
 * - `click`: toggle on click
 * - `hover`: pointer enter / leave with configurable delays & surface hover keep-open
 * - `focus`: focusin / focusout
 * - `contextmenu`: right-click (`preventDefault()`) with `(clientX, clientY)`
 * - `long-press`: Android-style touch/pen hold (default 500ms, 8px touch-slop cancel,
 *   suppresses trailing synthetic click)
 * - `keyboard`: `ContextMenu` key or `Shift+F10` centered on target
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

export const TriggerKinds = {
    Click: 'click',
    Hover: 'hover',
    Focus: 'focus',
    ContextMenu: 'contextmenu',
    LongPress: 'long-press',
    Keyboard: 'keyboard',
} as const
export type TriggerKinds = (typeof TriggerKinds)[keyof typeof TriggerKinds]

export interface ITriggerActionDetail {
    readonly kind: TriggerKinds
    readonly x?: number
    readonly y?: number
    readonly originalEvent: Event
}

export interface ITriggerControllerOptions {
    /** Active trigger kinds (e.g. `['click']` or `['contextmenu', 'long-press', 'keyboard']`). */
    getKinds: () => ReadonlyArray<TriggerKinds>
    /** Delay in ms before hover opens. Defaults to `150`. */
    getShowDelay?: () => number
    /** Delay in ms before hover closes. Defaults to `150`. */
    getHideDelay?: () => number
    /** Delay in ms for Android long-press activation. Defaults to `500`. */
    getLongPressDelay?: () => number
    /** Optional check whether pointer/focus moved into the floating surface. */
    isEventInsideSurface?: (target: Node | null) => boolean
    /** Triggered when an open/toggle gesture fires. */
    onOpen: (detail: ITriggerActionDetail) => void
    /** Triggered when a click toggle gesture fires (defaults to `onOpen` if omitted). */
    onToggle?: (detail: ITriggerActionDetail) => void
    /** Triggered when hover/focus leave requests closing. */
    onClose?: (detail: ITriggerActionDetail) => void
    /** Notifies pressing feedback state during long-press hold. */
    onPressingChange?: (pressing: boolean) => void
}

const TouchSlopPx = 8
const DefaultHoverDelayMs = 150
const DefaultLongPressDelayMs = 500

export class TriggerController implements ReactiveController {
    private readonly host: ReactiveControllerHost & HTMLElement
    private readonly options: ITriggerControllerOptions

    private target: HTMLElement | null = null
    private showTimer: ReturnType<typeof setTimeout> | null = null
    private hideTimer: ReturnType<typeof setTimeout> | null = null
    private longPressTimer: ReturnType<typeof setTimeout> | null = null
    private pressStartPoint: { x: number; y: number } | null = null
    private activePointerId: number | null = null
    private suppressNextClick = false

    public constructor(
        host: ReactiveControllerHost & HTMLElement,
        options: ITriggerControllerOptions,
    ) {
        this.host = host
        this.options = options
        host.addController(this)
    }

    public setTarget(target: HTMLElement | null): void {
        if (this.target === target) return
        this.detachListeners()
        this.target = target
        this.attachListeners()
    }

    public cancelPendingTimers(): void {
        this.clearHoverTimers()
        this.cancelLongPress()
    }

    /**
     * Call from surface `pointerenter` to keep hover-triggered overlays open.
     */
    public notifySurfacePointerEnter(): void {
        if (!this.hasKind(TriggerKinds.Hover)) return
        this.clearHoverTimers()
    }

    /**
     * Call from surface `pointerleave` to schedule hover close.
     */
    public notifySurfacePointerLeave(event: PointerEvent): void {
        if (!this.hasKind(TriggerKinds.Hover)) return
        this.scheduleHoverClose(event)
    }

    public hostConnected(): void {
        this.attachListeners()
    }

    public hostDisconnected(): void {
        this.cancelPendingTimers()
        this.detachListeners()
    }

    private hasKind(kind: TriggerKinds): boolean {
        return this.options.getKinds().includes(kind)
    }

    private attachListeners(): void {
        if (typeof document === 'undefined' || !this.target) return
        this.target.addEventListener('click', this.handleClickCapture, { capture: true })
        this.target.addEventListener('click', this.handleClick)
        this.target.addEventListener('pointerenter', this.handlePointerEnter)
        this.target.addEventListener('pointerleave', this.handlePointerLeave)
        this.target.addEventListener('focusin', this.handleFocusIn)
        this.target.addEventListener('focusout', this.handleFocusOut)
        this.target.addEventListener('contextmenu', this.handleContextMenu)
        this.target.addEventListener('pointerdown', this.handlePointerDown)
        this.target.addEventListener('pointermove', this.handlePointerMove)
        this.target.addEventListener('pointerup', this.handlePointerEnd)
        this.target.addEventListener('pointercancel', this.handlePointerEnd)
        this.target.addEventListener('keydown', this.handleKeyDown)
    }

    private detachListeners(): void {
        if (typeof document === 'undefined' || !this.target) return
        this.target.removeEventListener('click', this.handleClickCapture, { capture: true })
        this.target.removeEventListener('click', this.handleClick)
        this.target.removeEventListener('pointerenter', this.handlePointerEnter)
        this.target.removeEventListener('pointerleave', this.handlePointerLeave)
        this.target.removeEventListener('focusin', this.handleFocusIn)
        this.target.removeEventListener('focusout', this.handleFocusOut)
        this.target.removeEventListener('contextmenu', this.handleContextMenu)
        this.target.removeEventListener('pointerdown', this.handlePointerDown)
        this.target.removeEventListener('pointermove', this.handlePointerMove)
        this.target.removeEventListener('pointerup', this.handlePointerEnd)
        this.target.removeEventListener('pointercancel', this.handlePointerEnd)
        this.target.removeEventListener('keydown', this.handleKeyDown)
    }

    private readonly handleClickCapture = (event: MouseEvent): void => {
        if (!this.suppressNextClick) return
        this.suppressNextClick = false
        event.preventDefault()
        event.stopPropagation()
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (!this.hasKind(TriggerKinds.Click)) return
        const detail: ITriggerActionDetail = { kind: TriggerKinds.Click, originalEvent: event }
        if (this.options.onToggle) {
            this.options.onToggle(detail)
        } else {
            this.options.onOpen(detail)
        }
    }

    private readonly handlePointerEnter = (event: PointerEvent): void => {
        if (!this.hasKind(TriggerKinds.Hover)) return
        this.clearHoverTimers()
        const delay = this.options.getShowDelay?.() ?? DefaultHoverDelayMs
        const detail: ITriggerActionDetail = { kind: TriggerKinds.Hover, originalEvent: event }
        if (delay <= 0) {
            this.options.onOpen(detail)
            return
        }
        this.showTimer = setTimeout(() => {
            this.showTimer = null
            this.options.onOpen(detail)
        }, delay)
    }

    private readonly handlePointerLeave = (event: PointerEvent): void => {
        if (!this.hasKind(TriggerKinds.Hover)) return
        this.scheduleHoverClose(event)
    }

    private readonly handleFocusIn = (event: FocusEvent): void => {
        if (!this.hasKind(TriggerKinds.Focus) && !this.hasKind(TriggerKinds.Hover)) return
        this.clearHoverTimers()
        this.options.onOpen({ kind: TriggerKinds.Focus, originalEvent: event })
    }

    private readonly handleFocusOut = (event: FocusEvent): void => {
        if (!this.hasKind(TriggerKinds.Focus) && !this.hasKind(TriggerKinds.Hover)) return
        const related = event.relatedTarget as Node | null
        if (related && (this.host.contains(related) || this.host.shadowRoot?.contains(related) || this.options.isEventInsideSurface?.(related))) {
            return
        }
        this.scheduleHoverClose(event)
    }

    private readonly handleContextMenu = (event: MouseEvent): void => {
        if (!this.hasKind(TriggerKinds.ContextMenu)) return
        event.preventDefault()
        event.stopPropagation()
        this.cancelLongPress()
        this.options.onOpen({
            kind: TriggerKinds.ContextMenu,
            x: event.clientX,
            y: event.clientY,
            originalEvent: event,
        })
    }

    private readonly handlePointerDown = (event: PointerEvent): void => {
        if (!this.hasKind(TriggerKinds.LongPress)) return
        const isOnlyLongPress = !this.hasKind(TriggerKinds.ContextMenu)
        if (event.pointerType === 'mouse' && !isOnlyLongPress) {
            return
        }
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return
        }

        this.cancelLongPress()
        this.activePointerId = event.pointerId
        this.pressStartPoint = { x: event.clientX, y: event.clientY }
        this.options.onPressingChange?.(true)

        const delay = Math.max(0, this.options.getLongPressDelay?.() ?? DefaultLongPressDelayMs)
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = null
            const point = this.pressStartPoint
            this.activePointerId = null
            this.pressStartPoint = null
            this.options.onPressingChange?.(false)
            if (!point) return
            this.suppressNextClick = true
            this.options.onOpen({
                kind: TriggerKinds.LongPress,
                x: point.x,
                y: point.y,
                originalEvent: event,
            })
        }, delay)
    }

    private readonly handlePointerMove = (event: PointerEvent): void => {
        if (this.activePointerId === null || event.pointerId !== this.activePointerId || !this.pressStartPoint) {
            return
        }
        const dx = event.clientX - this.pressStartPoint.x
        const dy = event.clientY - this.pressStartPoint.y
        if (Math.hypot(dx, dy) > TouchSlopPx) {
            this.cancelLongPress()
        }
    }

    private readonly handlePointerEnd = (event: PointerEvent): void => {
        if (this.activePointerId !== null && event.pointerId === this.activePointerId) {
            this.cancelLongPress()
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (!this.hasKind(TriggerKinds.Keyboard)) return
        const isContextKey = event.key === 'ContextMenu'
        const isShiftF10 = event.key === 'F10' && event.shiftKey
        if (!isContextKey && !isShiftF10) return

        event.preventDefault()
        event.stopPropagation()

        const anchor = (event.target instanceof HTMLElement ? event.target : this.target) ?? this.host
        const rect = anchor.getBoundingClientRect()
        this.options.onOpen({
            kind: TriggerKinds.Keyboard,
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            originalEvent: event,
        })
    }

    private scheduleHoverClose(event: Event): void {
        this.clearHoverTimers()
        const delay = this.options.getHideDelay?.() ?? DefaultHoverDelayMs
        const detail: ITriggerActionDetail = { kind: TriggerKinds.Hover, originalEvent: event }
        if (delay <= 0) {
            this.options.onClose?.(detail)
            return
        }
        this.hideTimer = setTimeout(() => {
            this.hideTimer = null
            this.options.onClose?.(detail)
        }, delay)
    }

    private clearHoverTimers(): void {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer)
            this.showTimer = null
        }
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer)
            this.hideTimer = null
        }
    }

    private cancelLongPress(): void {
        if (this.longPressTimer !== null) {
            clearTimeout(this.longPressTimer)
            this.longPressTimer = null
        }
        this.activePointerId = null
        this.pressStartPoint = null
        this.options.onPressingChange?.(false)
    }
}
