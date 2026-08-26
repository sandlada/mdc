/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MDCRipple } from './ripple'
import { RippleAction } from './ripple-action'
import type { IRipple } from './ripple.interface'

describe('MDCRipple', () => {
    it('has default configuration and state properties', () => {
        const ripple = new MDCRipple()
        expect(ripple.hovered).toBe(false)
        expect(ripple.focused).toBe(false)
        expect(ripple.pressed).toBe(false)
        expect(ripple.disabled).toBe(false)
        expect(ripple.ignoreGlobalConfig).toBe(false)
        expect(ripple.disableHoverStateLayer).toBe(false)
        expect(ripple.disableFocusStateLayer).toBe(false)
        expect(ripple.disablePressStateLayer).toBe(false)
    })

    it('allows toggling state properties', () => {
        const ripple = new MDCRipple()
        ripple.hovered = true
        expect(ripple.hovered).toBe(true)
        ripple.hovered = false
        expect(ripple.hovered).toBe(false)

        ripple.focused = true
        expect(ripple.focused).toBe(true)
        ripple.focused = false
        expect(ripple.focused).toBe(false)

        ripple.pressed = true
        expect(ripple.pressed).toBe(true)
        ripple.pressed = false
        expect(ripple.pressed).toBe(false)
    })

    it('allows configuring disable layer options and disabled state', () => {
        const ripple = new MDCRipple()
        ripple.disabled = true
        expect(ripple.disabled).toBe(true)

        ripple.disableHoverStateLayer = true
        expect(ripple.disableHoverStateLayer).toBe(true)

        ripple.disableFocusStateLayer = true
        expect(ripple.disableFocusStateLayer).toBe(true)

        ripple.disablePressStateLayer = true
        expect(ripple.disablePressStateLayer).toBe(true)

        ripple.ignoreGlobalConfig = true
        expect(ripple.ignoreGlobalConfig).toBe(true)
    })

    it('allows attaching and detaching an external control', () => {
        const ripple = new MDCRipple()
        const mockControl = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as HTMLElement

        ripple.attach(mockControl)
        expect(ripple.control).toBe(mockControl)

        ripple.detach()
        expect(ripple.control).toBe(null)
    })
})

describe('RippleAction', () => {
    let mockAnimation: {
        cancel: ReturnType<typeof vi.fn>
        currentTime: number
    }
    let mockPressLayer: HTMLElement
    let mockHost: IRipple
    let action: RippleAction

    beforeEach(() => {
        vi.useFakeTimers()

        mockAnimation = {
            cancel: vi.fn(),
            currentTime: 0,
        }

        mockPressLayer = {
            animate: vi.fn(() => mockAnimation as unknown as Animation),
        } as unknown as HTMLElement

        mockHost = {
            hovered: false,
            focused: false,
            pressed: false,
            disabled: false,
            ignoreGlobalConfig: false,
            disableHoverStateLayer: false,
            disableFocusStateLayer: false,
            disablePressStateLayer: false,
            hoverStateLayerElement: {} as HTMLElement,
            focusStateLayerElement: {} as HTMLElement,
            pressStateLayerElement: mockPressLayer,
            getBoundingClientRect: vi.fn(() => ({
                top: 0,
                left: 0,
                bottom: 50,
                right: 100,
                width: 100,
                height: 50,
            })),
            hasAttribute: (attr: string) => (mockHost as unknown as Record<string, boolean>)[attr] ?? false,
            toggleAttribute: (attr: string, force?: boolean) => {
                const val = force ?? !(mockHost as unknown as Record<string, boolean>)[attr]
                ;(mockHost as unknown as Record<string, boolean>)[attr] = val
                return val
            },
        } as unknown as IRipple

        // Mock window and PointerEvent properties if running in node env
        if (typeof window === 'undefined') {
            ;(globalThis as any).window = {
                scrollX: 0,
                scrollY: 0,
            }
        }
        if (typeof globalThis.MouseEvent === 'undefined') {
            class MockMouseEvent extends Event {
                public detail: number = 0
                constructor(type: string, dict: any = {}) {
                    super(type, dict)
                    Object.assign(this, dict)
                }
            }
            ;(globalThis as any).MouseEvent = MockMouseEvent
        }
        if (typeof globalThis.PointerEvent === 'undefined') {
            class MockPointerEvent extends Event {
                public pointerId: number = 1
                public pointerType: string = 'mouse'
                public isPrimary: boolean = true
                public buttons: number = 0
                public pageX: number = 0
                public pageY: number = 0
                constructor(type: string, dict: any = {}) {
                    super(type, dict)
                    Object.assign(this, dict)
                }
            }
            ;(globalThis as any).PointerEvent = MockPointerEvent
        }

        action = new RippleAction(mockHost)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('manages hover state on pointerenter and pointerleave', () => {
        const enterEvent = new PointerEvent('pointerenter', {
            isPrimary: true,
            pointerType: 'mouse',
            buttons: 0,
        })

        action.handlePointerenter(enterEvent)
        expect(mockHost.hovered).toBe(true)

        const leaveEvent = new PointerEvent('pointerleave', {
            isPrimary: true,
            pointerType: 'mouse',
            buttons: 0,
        })

        action.handlePointerleave(leaveEvent)
        expect(mockHost.hovered).toBe(false)
    })

    it('manages focus and blur states', () => {
        action.handleFocus()
        expect(mockHost.focused).toBe(true)

        action.handleBlur()
        expect(mockHost.focused).toBe(false)
    })

    it('handles standard mouse click lifecycle smoothly', async () => {
        const downEvent = new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 1,
            pageX: 50,
            pageY: 25,
        } as any)

        await action.handlePointerdown(downEvent)
        expect(mockHost.pressed).toBe(true)
        expect(mockPressLayer.animate).toHaveBeenCalledTimes(1)

        const upEvent = new PointerEvent('pointerup', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 0,
        })

        action.handlePointerup(upEvent)

        const clickEvent = new MouseEvent('click', {
            detail: 1,
        })

        action.handleClick(clickEvent)

        // Advance past minimumPressMs (250ms)
        mockAnimation.currentTime = 250
        await vi.advanceTimersByTimeAsync(250)

        expect(mockHost.pressed).toBe(false)
        expect(mockPressLayer.animate).toHaveBeenCalledTimes(1)
    })

    it('prevents animation restart when user clicks and quickly leaves the element (quick leave bug regression)', async () => {
        const downEvent = new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 1,
            pageX: 80,
            pageY: 20,
        } as any)

        // 1. Pointer down starts ripple at (80, 20)
        await action.handlePointerdown(downEvent)
        expect(mockHost.pressed).toBe(true)
        expect(mockPressLayer.animate).toHaveBeenCalledTimes(1)

        // 2. Fast mouse move triggers pointerleave before click
        const leaveEvent = new PointerEvent('pointerleave', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 0,
        })

        action.handlePointerleave(leaveEvent)
        expect(mockHost.hovered).toBe(false)

        // 3. Browser dispatches click event (detail: 1)
        const clickEvent = new MouseEvent('click', {
            detail: 1,
        })

        action.handleClick(clickEvent)

        // Verify that handleClick did NOT cancel and restart a second animation from the center
        expect(mockPressLayer.animate).toHaveBeenCalledTimes(1)
        expect(mockAnimation.cancel).not.toHaveBeenCalled()

        // Advance time to conclude press animation gracefully
        mockAnimation.currentTime = 250
        await vi.advanceTimersByTimeAsync(250)
        expect(mockHost.pressed).toBe(false)
    })

    it('triggers centered animation for keyboard-triggered synthetic click (detail: 0)', async () => {
        const keyboardClickEvent = new MouseEvent('click', {
            detail: 0,
        })

        action.handleClick(keyboardClickEvent)

        expect(mockHost.pressed).toBe(true)
        expect(mockPressLayer.animate).toHaveBeenCalledTimes(1)

        mockAnimation.currentTime = 250
        await vi.advanceTimersByTimeAsync(250)
        expect(mockHost.pressed).toBe(false)
    })

    it('does not react when host is disabled', async () => {
        mockHost.disabled = true

        const enterEvent = new PointerEvent('pointerenter', {
            isPrimary: true,
            pointerType: 'mouse',
            buttons: 0,
        })

        action.handlePointerenter(enterEvent)
        expect(mockHost.hovered).toBe(false)

        const downEvent = new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 1,
            pageX: 50,
            pageY: 25,
        } as any)

        await action.handlePointerdown(downEvent)
        expect(mockHost.pressed).toBe(false)
        expect(mockPressLayer.animate).not.toHaveBeenCalled()

        action.handleClick(new MouseEvent('click', { detail: 0 }))
        expect(mockHost.pressed).toBe(false)
    })

    it('cleans up startEvent pointerId on pointercancel', async () => {
        const downEvent = new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 1,
            pageX: 50,
            pageY: 25,
        } as any)

        await action.handlePointerdown(downEvent)
        expect(mockHost.pressed).toBe(true)

        const cancelEvent = new PointerEvent('pointercancel', {
            isPrimary: true,
            pointerType: 'mouse',
            pointerId: 1,
            buttons: 0,
        })

        action.handlePointercancel(cancelEvent)

        // Subsequent down with different pointerId should now be accepted
        const secondDownEvent = new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'touch',
            pointerId: 2,
            buttons: 1,
            pageX: 30,
            pageY: 20,
        } as any)

        // Advance timers for touch delay
        const downPromise = action.handlePointerdown(secondDownEvent)
        vi.advanceTimersByTime(150)
        await downPromise

        expect(mockPressLayer.animate).toHaveBeenCalledTimes(2)
    })
})
