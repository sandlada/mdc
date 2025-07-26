/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * @link
 * https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts
 *
 * [Modified by Kai-Orion & Sandlada]
 */

import { Easing } from '@sandlada/mdk'
import { isServer, ReactiveElement } from 'lit'

const RippleState = {
    /**
     * Initial state of the control, no touch in progress.
     *
     * Transitions:
     *   - on touch down: transition to `TOUCH_DELAY`.
     *   - on mouse down: transition to `WAITING_FOR_CLICK`.
     */
    Inactive: 0,
    /**
     * Touch down has been received, waiting to determine if it's a swipe or
     * scroll.
     *
     * Transitions:
     *   - on touch up: begin press; transition to `WAITING_FOR_CLICK`.
     *   - on cancel: transition to `INACTIVE`.
     *   - after `Configuration.touchDelayMs`: begin press; transition to `HOLDING`.
     */
    TouchDelay: 1,
    /**
     * A touch has been deemed to be a press
     *
     * Transitions:
     *  - on up: transition to `WAITING_FOR_CLICK`.
     */
    Holding: 2,
    /**
     * The user touch has finished, transition into rest state.
     *
     * Transitions:
     *   - on click end press; transition to `INACTIVE`.
     */
    WaitingForClick: 3,
}

const RippleConfiguration = {
    pressGrowMs: 550,
    minimumPressMs: 250,
    initialOriginScale: 0.2,
    padding: 10,
    softEdgeMinimumSize: 75,
    softEdgeContainerRadio: 0.35,
    animationFill: 'forwards' as FillMode,
    touchDelayMs: 150,
} as const

/**
 * Events that the ripple listens to.
 */
const Events = [
    'click',
    'contextmenu',
    'pointercancel',
    'pointerdown',
    'pointerenter',
    'pointerleave',
    'pointerup',
    'focus',
    'blur',
]

export interface IRipple extends ReactiveElement {
    hovered: boolean
    focused: boolean
    pressed: boolean
    disabled: boolean
    disableHoverStateLayer: boolean
    disableFocusStateLayer: boolean
    disablePressStateLayer: boolean
    hoverStateLayerElement: HTMLElement
    focusStateLayerElement: HTMLElement
    pressStateLayerElement: HTMLElement
}

/**
 * Used to manage the `hovered`, `focused` and `pressed` states of ripple components.
 */
export class RippleAction {
    private readonly host: IRipple
    private state = RippleState.Inactive
    private startEvent: null | PointerEvent = null
    private checkBoundsAfterContextMenu = false
    private initialSize = 0
    private rippleScale = ''
    private rippleSize = ''
    private growAnimation: null | Animation = null

    constructor(host: IRipple) {
        this.host = host
    }

    public onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
        if (isServer) {
            return
        }
        for (const event of Events) {
            prev?.removeEventListener(event, this.handleEvent)
            next?.addEventListener(event, this.handleEvent)
        }
    }

    /**
     * Event handles
     */
    private handlePointerenter(event: PointerEvent) {
        if (!this.shouldReactToEvent(event)) {
            return
        }
        this.host.hovered = true
    }
    private handlePointerleave(event: PointerEvent) {
        if (!this.shouldReactToEvent(event)) {
            return
        }
        this.host.hovered = false
        if (this.state !== RippleState.Inactive) {
            this.endPressAnimation()
        }
    }
    private handlePointerup(event: PointerEvent) {
        if (!this.shouldReactToEvent(event)) {
            return
        }
        if (this.state === RippleState.Holding) {
            this.state = RippleState.WaitingForClick
            return
        }
        if (this.state === RippleState.TouchDelay) {
            this.state = RippleState.WaitingForClick
            this.startPressAnimation(this.startEvent || undefined)
            return
        }
    }
    private async handlePointerdown(event: PointerEvent) {
        if (!this.shouldReactToEvent(event)) {
            return
        }
        this.startEvent = event
        if (!this.isTouch(event)) {
            this.state = RippleState.WaitingForClick
            this.startPressAnimation(event)
            return
        }
        // after a longpress contextmenu event, an extra `pointerdown` can be
        // dispatched to the pressed element. Check that the down is within
        // bounds of the element in this case.
        if (this.checkBoundsAfterContextMenu && !this.inBounds(event)) {
            return
        }

        this.checkBoundsAfterContextMenu = false

        // Wait for a hold after touch delay
        this.state = RippleState.TouchDelay
        await new Promise((resolve) => {
            setTimeout(resolve, RippleConfiguration.touchDelayMs)
        })
        if (this.state !== RippleState.TouchDelay) return
        this.state = RippleState.Holding
        this.startPressAnimation(event)
    }
    private handlePointercancel(event: PointerEvent) {
        if (!this.shouldReactToEvent(event)) return
        this.endPressAnimation()
    }
    private handleClick() {
        if (this.host.disabled) return
        if (this.state === RippleState.WaitingForClick) {
            this.endPressAnimation()
            return
        }
        if (this.state === RippleState.Inactive) {
            // keyboard synthesized click event
            this.startPressAnimation()
            this.endPressAnimation()
        }
    }
    private handleContextmenu() {
        if (this.host.disabled) return
        this.checkBoundsAfterContextMenu = true
        this.endPressAnimation()
    }
    private handleFocus() {
        if (this.host.disabled) {
            return
        }
        this.host.focused = true
    }
    private handleBlur() {
        if (this.host.disabled) {
            return
        }
        this.host.focused = false
        if (this.state !== RippleState.Inactive) {
            this.endPressAnimation()
        }
    }

    /**
     * Animations about
     */
    private startPressAnimation(positionEvent?: Event) {
        this.host.pressed = true
        this.growAnimation?.cancel()
        this.determineRippleSize()
        const { startPoint, endPoint } = this.getTranslationCoordinates(positionEvent)!
        const translateStart = `${startPoint.x}px, ${startPoint.y}px`
        const translateEnd = `${endPoint.x}px, ${endPoint.y}px`
        if (this.host === null) return
        this.growAnimation = this.host.pressStateLayerElement.animate(
            {
                top: [0, 0],
                left: [0, 0],
                height: [this.rippleSize, this.rippleSize],
                width: [this.rippleSize, this.rippleSize],
                transform: [
                    `translate(${translateStart}) scale(1)`,
                    `translate(${translateEnd}) scale(${this.rippleScale})`,
                ],
            },
            {
                duration: RippleConfiguration.pressGrowMs,
                easing: Easing.Standard,
                fill: RippleConfiguration.animationFill,
            },
        )
    }
    private getTranslationCoordinates(positionEvent?: Event) {
        if (this.host === null) return

        const { height, width } = this.host.getBoundingClientRect()
        // end in the center
        const endPoint = {
            x: (width - this.initialSize) / 2,
            y: (height - this.initialSize) / 2,
        }
        let startPoint = {
            x: width / 2,
            y: height / 2,
        }
        if (positionEvent instanceof PointerEvent) {
            startPoint = this.getNormalizedPointerEventCoords(positionEvent)!
        }

        // center around start point
        startPoint = {
            x: startPoint.x - this.initialSize / 2,
            y: startPoint.y - this.initialSize / 2,
        }

        return { startPoint, endPoint }
    }
    private getNormalizedPointerEventCoords(pointerEvent: PointerEvent) {
        if (this.host === null) return
        const { scrollX, scrollY } = window
        const { left, top } = this.host.getBoundingClientRect()
        const documentX = scrollX + left
        const documentY = scrollY + top
        const { pageX, pageY } = pointerEvent
        return { x: pageX - documentX, y: pageY - documentY }
    }
    private async endPressAnimation() {
        this.state = RippleState.Inactive
        const animation = this.growAnimation
        let pressAnimationPlayState = Infinity
        if (typeof animation?.currentTime === 'number') {
            pressAnimationPlayState = animation.currentTime
        } else if (animation?.currentTime) {
            pressAnimationPlayState = animation.currentTime.to('ms').value
        }

        if (pressAnimationPlayState >= RippleConfiguration.minimumPressMs) {
            this.host.pressed = false
            return
        }

        await new Promise((resolve) => {
            setTimeout(resolve, RippleConfiguration.minimumPressMs - pressAnimationPlayState)
        })

        if (this.growAnimation !== animation) {
            // A new press animation was started. The old animation was canceled and
            // should not finish the pressed state.
            return
        }

        this.host.pressed = false
    }
    private determineRippleSize() {
        if (this.host === null) return
        const { height, width } = this.host.getBoundingClientRect()
        const maxDim = Math.max(height, width)
        const softEdgeSize = Math.max(
            RippleConfiguration.softEdgeContainerRadio * maxDim,
            RippleConfiguration.softEdgeMinimumSize,
        )

        const initialSizeNew = Math.floor(maxDim * RippleConfiguration.initialOriginScale)
        const hypotenuse = Math.sqrt(width ** 2 + height ** 2)
        const maxRadius = hypotenuse + RippleConfiguration.padding

        this.initialSize = initialSizeNew
        this.rippleScale = `${(maxRadius + softEdgeSize) / this.initialSize}`
        this.rippleSize = `${this.initialSize}px`
    }
    private inBounds({ x, y }: PointerEvent) {
        if (this.host === null) return
        const { top, left, bottom, right } = this.host.getBoundingClientRect()
        return x >= left && x <= right && y >= top && y <= bottom
    }
    private isTouch({ pointerType }: PointerEvent) {
        return pointerType === 'touch'
    }
    private shouldReactToEvent(event: PointerEvent) {
        if (this.host.disabled || !event.isPrimary) return false

        if (
            this.startEvent &&
            this.startEvent.pointerId !== event.pointerId
        ) {
            return false
        }

        if (event.type === 'pointerenter' || event.type === 'pointerleave') {
            return !this.isTouch(event)
        }

        const isPrimaryButton = event.buttons === 1
        return this.isTouch(event) || isPrimaryButton
    }
    private handleEvent = async (e: Event) => {
        switch (e.type) {
            case 'click':
                this.handleClick()
                break
            case 'contextmenu':
                this.handleContextmenu()
                break
            case 'pointercancel':
                this.handlePointercancel(e as PointerEvent)
                break
            case 'pointerdown':
                await this.handlePointerdown(e as PointerEvent)
                break
            case 'pointerenter':
                this.handlePointerenter(e as PointerEvent)
                break
            case 'pointerleave':
                this.handlePointerleave(e as PointerEvent)
                break
            case 'pointerup':
                this.handlePointerup(e as PointerEvent)
                break
            case 'focus':
                this.handleFocus()
                break
            case 'blur':
                this.handleBlur()
                break
            default:
                break
        }
    }

}
