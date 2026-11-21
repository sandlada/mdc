/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    EdgeSlideController,
    type EdgeSlideOptions,
    type IEdgeSlideHost,
} from './edge-slide-controller'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class ScrollHost extends HTMLElement {
    public controllers: ReactiveController[] = []
    public containerElement: HTMLElement | null = null
    public requestUpdate = vi.fn()
    public updateComplete: Promise<boolean> = Promise.resolve(true)
    public addController(controller: ReactiveController) {
        this.controllers.push(controller)
    }
}

customElements.define('edge-scroll-test-host', ScrollHost)

interface Scroller {
    element: HTMLElement
    id: string
    setTop: (value: number) => void
    setLeft: (value: number) => void
    setVerticalScrollable: (scrollable: boolean) => void
    setHorizontalScrollable: (scrollable: boolean) => void
}

let frames: Array<FrameRequestCallback | null> = []
let seed = 0

const flushFrames = () => {
    const pending = frames
    frames = []
    pending.forEach((callback) => callback?.(0))
}

const defineValue = (target: object, name: string, value: unknown) => {
    Object.defineProperty(target, name, {
        configurable: true,
        writable: true,
        value,
    })
}

const scrollWindow = document.defaultView!
const setWindowValue = (name: string, value: unknown) => defineValue(scrollWindow, name, value)

const createScroller = (): Scroller => {
    const element = document.createElement('div')
    element.id = `scroll-element-${++seed}`
    document.body.appendChild(element)

    const state = {
        top: 0,
        left: 0,
        scrollHeight: 1000,
        clientHeight: 100,
        scrollWidth: 1000,
        clientWidth: 100,
    }

    defineValue(element, 'scrollTop', 0)
    defineValue(element, 'scrollLeft', 0)
    Object.defineProperties(element, {
        scrollTop: {
            configurable: true,
            get: () => state.top,
            set: (value: number) => {
                state.top = value
            },
        },
        scrollLeft: {
            configurable: true,
            get: () => state.left,
            set: (value: number) => {
                state.left = value
            },
        },
        scrollHeight: { configurable: true, get: () => state.scrollHeight },
        clientHeight: { configurable: true, get: () => state.clientHeight },
        scrollWidth: { configurable: true, get: () => state.scrollWidth },
        clientWidth: { configurable: true, get: () => state.clientWidth },
    })

    return {
        element,
        id: element.id,
        setTop: (value) => {
            state.top = value
        },
        setLeft: (value) => {
            state.left = value
        },
        setVerticalScrollable: (scrollable) => {
            state.scrollHeight = scrollable ? 1000 : 100
            state.clientHeight = 100
        },
        setHorizontalScrollable: (scrollable) => {
            state.scrollWidth = scrollable ? 1000 : 100
            state.clientWidth = 100
        },
    }
}

const setup = (options: EdgeSlideOptions = {}) => {
    const host = new ScrollHost()
    document.body.appendChild(host)
    const controller = new EdgeSlideController(
        host as unknown as IEdgeSlideHost,
        { autoHide: true, ...options },
    )
    const show = vi.spyOn(controller, 'show').mockResolvedValue()
    const close = vi.spyOn(controller, 'close').mockResolvedValue()

    controller.hostConnected()

    return { host, controller, show, close }
}

const scrollOn = (target: EventTarget) => target.dispatchEvent(new Event('scroll'))

beforeEach(() => {
    frames = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
        frames[id - 1] = null
    })

    setWindowValue('scrollY', 0)
    setWindowValue('scrollX', 0)
    setWindowValue('innerHeight', 100)
    setWindowValue('innerWidth', 100)
    defineValue(document.documentElement, 'scrollTop', 0)
    defineValue(document.documentElement, 'scrollLeft', 0)
    defineValue(document.documentElement, 'scrollHeight', 1000)
    defineValue(document.documentElement, 'scrollWidth', 1000)
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
})

describe('EdgeSlideController scroll behavior', () => {
    it('attaches a passive scroll listener for a resolved element', () => {
        const scroller = createScroller()
        const host = new ScrollHost()
        document.body.appendChild(host)
        const controller = new EdgeSlideController(host as unknown as IEdgeSlideHost, {
            autoHide: true,
            scrollElementId: scroller.id,
        })
        vi.spyOn(controller, 'show').mockResolvedValue()
        vi.spyOn(controller, 'close').mockResolvedValue()
        const add = vi.spyOn(scroller.element, 'addEventListener')

        controller.hostConnected()

        expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    })

    it('falls back to the window for an empty or whitespace id', () => {
        const { close } = setup({ scrollElementId: '   ' })

        setWindowValue('scrollY', 10)
        scrollOn(scrollWindow)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('resolves the scroll target in the host shadow root', () => {
        const outside = createScroller()
        const inside = createScroller()
        inside.element.id = outside.id
        const wrapper = document.createElement('div')
        const root = wrapper.attachShadow({ mode: 'open' })
        const host = new ScrollHost()
        root.append(host, inside.element)
        document.body.append(wrapper)
        const controller = new EdgeSlideController(host, { autoHide: true, scrollElementId: outside.id })
        const close = vi.spyOn(controller, 'close').mockResolvedValue()
        controller.hostConnected()

        outside.setTop(20)
        scrollOn(outside.element)
        flushFrames()
        expect(close).not.toHaveBeenCalled()

        inside.setTop(20)
        scrollOn(inside.element)
        flushFrames()
        expect(close).toHaveBeenCalledOnce()
        controller.hostDisconnected()
    })

    it('does not fall back to the window when the referenced id is missing', () => {
        const { show, close } = setup({ scrollElementId: 'missing-element' })

        setWindowValue('scrollY', 10)
        scrollOn(scrollWindow)
        flushFrames()

        expect(show).not.toHaveBeenCalled()
        expect(close).not.toHaveBeenCalled()
    })

    it('does nothing when autoHide is disabled', () => {
        const { show, close } = setup({ autoHide: false })

        setWindowValue('scrollY', 10)
        scrollOn(scrollWindow)
        flushFrames()

        expect(show).not.toHaveBeenCalled()
        expect(close).not.toHaveBeenCalled()
    })

    it('closes when scrolling away from the edge and shows when returning', () => {
        const scroller = createScroller()
        const { show, close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        scroller.setTop(0)
        scrollOn(scroller.element)
        flushFrames()
        expect(show).toHaveBeenCalledTimes(1)
    })

    it('suppresses repeated actions in the same direction', () => {
        const scroller = createScroller()
        const { close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        flushFrames()

        scroller.setTop(20)
        scrollOn(scroller.element)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('ignores sub-threshold jitter and acts at the 4px boundary', () => {
        const scroller = createScroller()
        const { close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(3)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).not.toHaveBeenCalled()

        scroller.setTop(4)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)
    })

    it('keeps the host shown when the element is not scrollable', () => {
        const scroller = createScroller()
        scroller.setVerticalScrollable(false)
        const { show, close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        flushFrames()

        expect(show).toHaveBeenCalledTimes(1)
        expect(close).not.toHaveBeenCalled()
    })

    it('coalesces bursts into one animation-frame check', () => {
        const scroller = createScroller()
        const { close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        scrollOn(scroller.element)
        scrollOn(scroller.element)

        expect(frames.filter(Boolean)).toHaveLength(1)

        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('resets the action memory and baseline on rebind', () => {
        const scroller = createScroller()
        const { controller, close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        controller.rebindScroll()
        scroller.setTop(20)
        scrollOn(scroller.element)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(2)
    })

    it('switches the tracked axis when the placement changes', () => {
        const scroller = createScroller()
        const { controller, close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        controller.placement = 'right'
        scroller.setLeft(10)
        scrollOn(scroller.element)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(2)
    })

    it('handles horizontal element scrolling', () => {
        const scroller = createScroller()
        const { show, close } = setup({
            placement: 'right',
            scrollElementId: scroller.id,
        })

        scroller.setLeft(10)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        scroller.setLeft(0)
        scrollOn(scroller.element)
        flushFrames()
        expect(show).toHaveBeenCalledTimes(1)
    })

    it('keeps the host shown when horizontal content fits', () => {
        const scroller = createScroller()
        scroller.setHorizontalScrollable(false)
        const { show, close } = setup({
            placement: 'right',
            scrollElementId: scroller.id,
        })

        scroller.setLeft(10)
        scrollOn(scroller.element)
        flushFrames()

        expect(show).toHaveBeenCalledTimes(1)
        expect(close).not.toHaveBeenCalled()
    })

    it('detaches the previous element when rebinding', () => {
        const first = createScroller()
        const second = createScroller()
        const { controller, close } = setup({ scrollElementId: first.id })

        first.setTop(10)
        scrollOn(first.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        controller.scrollElementId = second.id
        first.setTop(20)
        scrollOn(first.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        second.setTop(10)
        scrollOn(second.element)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(2)
    })

    it('stops listening and cancels a pending frame on disconnect', () => {
        const scroller = createScroller()
        const { controller, close } = setup({ scrollElementId: scroller.id })

        scroller.setTop(10)
        scrollOn(scroller.element)
        controller.hostDisconnected()
        flushFrames()
        expect(close).not.toHaveBeenCalled()

        scroller.setTop(20)
        scrollOn(scroller.element)
        flushFrames()
        expect(close).not.toHaveBeenCalled()
    })

    it('handles vertical window scrolling', () => {
        const { show, close } = setup()

        setWindowValue('scrollY', 10)
        scrollOn(scrollWindow)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        setWindowValue('scrollY', 4)
        scrollOn(scrollWindow)
        flushFrames()
        expect(show).toHaveBeenCalledTimes(1)
    })

    it('handles horizontal window scrolling', () => {
        const { close } = setup({ placement: 'right' })

        setWindowValue('scrollX', 10)
        scrollOn(scrollWindow)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('shows when the window is at the leading edge', () => {
        const { show, close } = setup({ placement: 'right' })

        setWindowValue('scrollX', 10)
        scrollOn(scrollWindow)
        flushFrames()
        expect(close).toHaveBeenCalledTimes(1)

        setWindowValue('scrollX', 0)
        scrollOn(scrollWindow)
        flushFrames()
        expect(show).toHaveBeenCalledTimes(1)
    })

    it('shows when the document is not scrollable', () => {
        defineValue(document.documentElement, 'scrollHeight', 100)
        setWindowValue('innerHeight', 100)
        setWindowValue('scrollY', 10)
        const { show, close } = setup()

        scrollOn(scrollWindow)
        flushFrames()

        expect(show).toHaveBeenCalledTimes(1)
        expect(close).not.toHaveBeenCalled()
    })

    it('falls back to documentElement scrollTop when scrollY is undefined', () => {
        setWindowValue('scrollY', undefined)
        defineValue(document.documentElement, 'scrollTop', 10)
        const { close } = setup()

        defineValue(document.documentElement, 'scrollTop', 20)
        scrollOn(scrollWindow)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('falls back to documentElement scrollLeft when scrollX is undefined', () => {
        setWindowValue('scrollX', undefined)
        defineValue(document.documentElement, 'scrollLeft', 10)
        const { close } = setup({ placement: 'right' })

        defineValue(document.documentElement, 'scrollLeft', 20)
        scrollOn(scrollWindow)
        flushFrames()

        expect(close).toHaveBeenCalledTimes(1)
    })

    it('defaults to zero when both window scroll properties are undefined', () => {
        setWindowValue('scrollY', undefined)
        defineValue(document.documentElement, 'scrollTop', undefined)
        const { show, close } = setup()

        scrollOn(scrollWindow)
        flushFrames()

        expect(show).toHaveBeenCalledTimes(1)
        expect(close).not.toHaveBeenCalled()
    })
})
