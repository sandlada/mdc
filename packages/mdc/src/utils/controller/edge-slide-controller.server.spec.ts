/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import {
    EdgeSlideController,
    type EdgeSlideOptions,
    type IEdgeSlideHost,
} from './edge-slide-controller'

const createServerHost = () => {
    const style = {
        getPropertyValue: vi.fn(() => ''),
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
    }
    const host = {
        isConnected: false,
        containerElement: null,
        style,
        updateComplete: Promise.resolve(true),
        addController: vi.fn(),
        requestUpdate: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getAnimations: vi.fn(() => []),
        animate: vi.fn(),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        dispatchEvent: vi.fn(),
    }

    return { host: host as unknown as IEdgeSlideHost, style }
}

describe('EdgeSlideController server behavior', () => {
    it('constructs with defaults without touching the DOM', () => {
        const { host } = createServerHost()

        const controller = new EdgeSlideController(host)

        expect(host.addController).toHaveBeenCalledWith(controller)
        expect(controller.floating).toBe(false)
        expect(controller.placement).toBe('bottom')
        expect(controller.autoHide).toBe(false)
        expect(controller.scrollElementId).toBe('')
        expect(controller.peekSize).toBe(24)
        expect(controller.quick).toBe(false)
        expect(controller.isOpen).toBe(false)
        expect(controller.isOpening).toBe(false)
    })

    it('applies constructor options', () => {
        const { host } = createServerHost()
        const options: EdgeSlideOptions = {
            floating: true,
            placement: 'top',
            autoHide: true,
            scrollElementId: 'scroller',
            peekSize: 8,
            quick: true,
        }

        const controller = new EdgeSlideController(host, options)

        expect(controller.floating).toBe(true)
        expect(controller.placement).toBe('top')
        expect(controller.autoHide).toBe(true)
        expect(controller.scrollElementId).toBe('scroller')
        expect(controller.peekSize).toBe(8)
        expect(controller.quick).toBe(true)
    })

    it('skips DOM side effects but still requests updates from setters', () => {
        const { host, style } = createServerHost()
        const controller = new EdgeSlideController(host)

        controller.floating = false
        controller.floating = true
        controller.placement = 'left'
        controller.autoHide = true
        controller.scrollElementId = 'scroller'
        controller.peekSize = 8
        controller.quick = true

        expect(host.requestUpdate).toHaveBeenCalled()
        expect(style.setProperty).not.toHaveBeenCalled()
        expect(style.removeProperty).not.toHaveBeenCalled()
    })

    it('does not register listeners or scroll targets when connected', () => {
        const { host } = createServerHost()
        const controller = new EdgeSlideController(host, { autoHide: true })

        controller.hostConnected()
        controller.rebindScroll()

        expect(host.addEventListener).not.toHaveBeenCalled()
    })

    it('cleans up listeners on disconnect', () => {
        const { host } = createServerHost()
        const controller = new EdgeSlideController(host)

        controller.hostDisconnected()

        expect(host.removeEventListener).toHaveBeenCalledWith(
            'mouseenter',
            expect.any(Function),
        )
        expect(host.removeEventListener).toHaveBeenCalledWith(
            'mouseleave',
            expect.any(Function),
        )
    })

    it('closes immediately while disconnected', async () => {
        const { host } = createServerHost()
        const controller = new EdgeSlideController(host, { quick: true })

        await controller.close()

        expect(controller.isOpen).toBe(false)
        expect(host.removeAttribute).toHaveBeenCalledWith('open')
        expect(host.dispatchEvent).not.toHaveBeenCalled()
    })
})
