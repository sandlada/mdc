/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { detectPlatform, isServer } from '../../utils'

export const STooltipController = Symbol('tooltipController')

export enum ETooltipPosition {
    Left = 'left',
    Above = 'above',
    Right = 'right',
    Below = 'below',
    Before = 'before',
    After = 'after',
}
export type TTooltipPosition = 'left' | 'above' | 'right' | 'below' | 'before' | 'after'
export type TTooltipTouchGestures = 'auto' | 'on' | 'off'
export type TooltipVisibility = 'initial' | 'visible' | 'hidden'
export interface ITooltip {
    open(delay?: number): void
    close(delay?: number): void
    position: Ref<TTooltipPosition>
    visibility: Ref<boolean>
    touchGestures: Ref<TTooltipTouchGestures>
}

export interface ITooltipControllerHost extends HTMLElement {
    [STooltipController]: ITooltip
}

export interface IUseTooltipOptions {
    position: Ref<TTooltipPosition>
    visibility: Ref<boolean>
    touchGestures: Ref<TTooltipTouchGestures>
    disabled: Ref<boolean>
    showDelay: Ref<number>
    hideDelay: Ref<number>

}

export function useTooltip(
    surfaceRef: Ref<ITooltipControllerHost | null>,
    anchorRef: Ref<HTMLElement | null>,
    options: Required<IUseTooltipOptions>
) {
    const { position, touchGestures, visibility, disabled } = options
    let touchstartTimeout: null | ReturnType<typeof setTimeout> = null
    let animationTimer = ref<ReturnType<typeof setTimeout> | null>(null)

    const platformSupportsMouseEvents = () => {
        return detectPlatform().isDesktop
    }

    const disableNativeGesturesIfNecessary = () => {
        const gestures = options?.touchGestures?.value ?? 'auto'
        const host = surfaceRef.value

        if (!host) {
            return
        }

        if (gestures !== 'off') {
            const style = host.style

            // If gestures are set to `auto`, we don't disable text selection on inputs and
            // textareas, because it prevents the user from typing into them on iOS Safari.
            if (gestures === 'on' || (host.nodeName !== 'INPUT' && host.nodeName !== 'TEXTAREA')) {
                style.userSelect = (style as any).msUserSelect = style.webkitUserSelect = (style as any).MozUserSelect = 'none'
            }

            // If we have `auto` gestures and the host uses native HTML dragging,
            // we don't set `-webkit-user-drag` because it prevents the native behavior.
            if (gestures === 'on' || !host.draggable) {
                (style as any).webkitUserDrag = 'none'
            }

            style.touchAction = 'none';
            (style as any).webkitTapHighlightColor = 'transparent'
        }
    }

    const show = (delay?: number, origin?: { x: number; y: number }): void => {
        if (!surfaceRef.value) {
            return
        }
        visibility.value = true
    }

    /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
    const hide = (delay?: number): void => {
        if (!surfaceRef.value) {
            return
        }
        visibility.value = false
    }

    /**
     * NEW
     */
    const handleAnchorMouseEnter = (event: MouseEvent) => {
        if (disabled.value || !anchorRef.value) {
            return
        }

        if (animationTimer.value) {
            clearTimeout(animationTimer.value)
        }

        let point = undefined
        if ((event as MouseEvent).x !== undefined && (event as MouseEvent).y !== undefined) {
            point = event as MouseEvent
        }

        animationTimer.value = setTimeout(() => {
            show(undefined, point)
        }, 500)

        anchorRef.value.addEventListener('mouseleave', handleAnchorMouseLeave)
        anchorRef.value.addEventListener('wheel', handleWheel, { passive: true, })
    }
    const handleAnchorMouseLeave = (e: MouseEvent) => {
        if (!anchorRef.value) {
            return
        }
        const newTarget = (event as MouseEvent).relatedTarget as Node | null
        if (!newTarget || !anchorRef.value.contains(newTarget)) {
            // hide()
        }

        if (animationTimer.value) {
            clearTimeout(animationTimer.value)
        }

        anchorRef.value.removeEventListener('mouseleave', handleAnchorMouseLeave)
        anchorRef.value.removeEventListener('wheel', handleAnchorMouseLeave)

        animationTimer.value = setTimeout(() => {
            hide()
        }, 500)
    }
    const handleWheel = (event: WheelEvent) => {
        if (visibility.value) {
            const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY)
            const element = surfaceRef.value

            // On non-touch devices we depend on the `mouseleave` event to close the tooltip, but it
            // won't fire if the user scrolls away using the wheel without moving their cursor. We
            // work around it by finding the element under the user's cursor and closing the tooltip
            // if it's not the trigger.
            if (elementUnderPointer !== element && !element?.contains(elementUnderPointer)) {
                hide()
            }
        }
    }

    // const handleAnchorTouchStart = () => {
    //     if (touchGestures.value !== 'off') {
    //         disableNativeGesturesIfNecessary()

    //         passiveListener.listeners.push([
    //             'touchstart',
    //             event => {
    //                 const touch = (event as TouchEvent).targetTouches?.[0]
    //                 const origin = touch ? { x: touch.clientX, y: touch.clientY } : undefined
    //                 // Note that it's important that we don't `preventDefault` here,
    //                 // because it can prevent click events from firing on the element.
    //                 // setupPointerExitEventsIfNeeded()
    //                 if (touchstartTimeout) {
    //                     clearTimeout(touchstartTimeout)
    //                 }

    //                 const DEFAULT_LONGPRESS_DELAY = 500
    //                 touchstartTimeout = setTimeout(() => {
    //                     touchstartTimeout = null
    //                     show(undefined, origin)
    //                 }, defaultOptions?.touchLongPressShowDelay ?? DEFAULT_LONGPRESS_DELAY)
    //             },
    //             {
    //                 passive: true,
    //             }
    //         ])
    //     }
    // }
    // const handleAnchorTouchEndAndCancel = () => {
    //     const touchendListener = () => {
    //         if (touchstartTimeout) {
    //             clearTimeout(touchstartTimeout)
    //         }
    //         hide(defaultOptions?.touchendHideDelay)
    //     }
    // }

    /**
     * Surface Methods
     */
    const handleSurfaceMouseEnter = () => {
        if (!surfaceRef.value || !visibility.value) {
            return
        }

        if (animationTimer.value) {
            clearTimeout(animationTimer.value)
        }

        animationTimer.value = setTimeout(() => {
            show(undefined)
        }, 500)

        surfaceRef.value.addEventListener('mouseleave', handleSurfaceMouseLeave)
        surfaceRef.value.addEventListener('wheel', handleWheel, { passive: true, })
    }

    const handleSurfaceMouseLeave = () => {
        if (!surfaceRef.value) {
            return
        }

        if (animationTimer.value) {
            clearTimeout(animationTimer.value)
        }

        surfaceRef.value.removeEventListener('mouseleave', handleSurfaceMouseLeave)
        // @ts-ignore
        surfaceRef.value.removeEventListener('wheel', handleWheel, { passive: true, })

        animationTimer.value = setTimeout(() => {
            hide()
        }, 500)
    }


    onMounted(() => {
        if (isServer()) {
            return
        }

        const host = surfaceRef.value

        if (!host) {
            return
        }

        // setupPointerEnterEventsIfNeeded()

        if (platformSupportsMouseEvents()) {
            anchorRef.value?.addEventListener('mouseenter', handleAnchorMouseEnter, { passive: true, })
            surfaceRef.value?.addEventListener('mouseenter', handleSurfaceMouseEnter, { passive: true, })
        } else if (touchGestures.value !== 'off') {
            disableNativeGesturesIfNecessary()

            // anchorRef.value?.addEventListener('mouseenter', handleAnchorTouchStart, { passive: true, })
        }

    })

    onBeforeUnmount(() => {
        if (isServer()) {
            return
        }
        const host = surfaceRef.value

        if (!host) {
            return
        }

        // passiveListener.removeListeners()
    })

    return {
        show,
        hide,
    }
}
