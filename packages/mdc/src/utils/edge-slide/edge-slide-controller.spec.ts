/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { Duration, Easing } from '@sandlada/mdk'
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

class EdgeHost extends HTMLElement {
    public controllers: ReactiveController[] = []
    public containerElement: HTMLElement | null = document.createElement('div')
    public requestUpdate = vi.fn()
    public updateComplete: Promise<boolean> = Promise.resolve(true)
    public addController(controller: ReactiveController) {
        this.controllers.push(controller)
    }
}

customElements.define('edge-slide-test-host', EdgeHost)

interface FakeAnimation {
    cancel: ReturnType<typeof vi.fn>
    finished: Promise<void>
    finish: () => void
}

interface AnimateCall {
    target: HTMLElement
    frames: Keyframe[]
    options: KeyframeAnimationOptions
    animation: FakeAnimation
}

interface SetupConfig {
    rect?: number
    container?: boolean
    connected?: boolean
}

let HoldAnimations = false

const createFakeAnimation = (): FakeAnimation => {
    let settle!: () => void
    const finished = new Promise<void>((resolve) => {
        settle = resolve
    })

    if (!HoldAnimations) {
        settle()
    }

    return { cancel: vi.fn(settle), finished, finish: settle }
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const setup = (options: EdgeSlideOptions = {}, config: SetupConfig = {}) => {
    const host = new EdgeHost()
    let rect = config.rect ?? 100
    const calls: AnimateCall[] = []

    host.getBoundingClientRect = () =>
        ({
            width: rect,
            height: rect,
            top: 0,
            left: 0,
            right: rect,
            bottom: rect,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }) as DOMRect
    host.getAnimations = vi.fn(() => []) as never

    const bindAnimate = (target: HTMLElement) => {
        target.animate = vi.fn((frames: Keyframe[], options: KeyframeAnimationOptions) => {
            const animation = createFakeAnimation()
            calls.push({ target, frames, options, animation })
            return animation as unknown as Animation
        }) as never
    }

    bindAnimate(host)
    const container = config.container === false ? null : host.containerElement
    host.containerElement = container
    if (container) {
        container.getAnimations = vi.fn(() => []) as never
        bindAnimate(container)
    }

    const controller = new EdgeSlideController(
        host as unknown as IEdgeSlideHost,
        options,
    )

    if (config.connected !== false) {
        document.body.appendChild(host)
        controller.hostConnected()
    }

    return {
        host,
        container,
        controller,
        calls,
        setRect: (value: number) => {
            rect = value
        },
    }
}

const recordEvents = (target: EventTarget, types: readonly string[]): string[] => {
    const seen: string[] = []
    for (const type of types) {
        target.addEventListener(type, () => seen.push(type))
    }
    return seen
}

const axisOf = (placement: string): 'height' | 'width' =>
    placement === 'top' || placement === 'bottom' ? 'height' : 'width'

const translateOf = (placement: string): 'translateY' | 'translateX' =>
    placement === 'top' || placement === 'bottom' ? 'translateY' : 'translateX'

beforeEach(() => {
    HoldAnimations = false
})

afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
})

describe('EdgeSlideController', () => {
    describe('options and setters', () => {
        it('registers with the host and exposes the defaults', () => {
            const { host, controller } = setup({}, { connected: false })

            expect(host.controllers).toContain(controller)
            expect(controller.floating).toBe(false)
            expect(controller.placement).toBe('bottom')
            expect(controller.autoHide).toBe(false)
            expect(controller.scrollElementId).toBe('')
            expect(controller.peekSize).toBe(24)
            expect(controller.quick).toBe(false)
            expect(controller.isOpen).toBe(false)
            expect(controller.isOpening).toBe(false)
        })

        it('applies every constructor option', () => {
            const { controller } = setup(
                {
                    floating: true,
                    placement: 'left',
                    autoHide: true,
                    scrollElementId: 'scroller',
                    peekSize: 12,
                    quick: true,
                },
                { connected: false },
            )

            expect(controller.floating).toBe(true)
            expect(controller.placement).toBe('left')
            expect(controller.autoHide).toBe(true)
            expect(controller.scrollElementId).toBe('scroller')
            expect(controller.peekSize).toBe(12)
            expect(controller.quick).toBe(true)
        })

        it('does not request an update when a setter receives the same value', () => {
            const { host, controller } = setup({}, { connected: false })

            controller.floating = false
            controller.placement = 'bottom'
            controller.autoHide = false
            controller.scrollElementId = ''
            controller.peekSize = 24
            controller.quick = false

            expect(host.requestUpdate).not.toHaveBeenCalled()
        })

        it('requests an update for every changed option', () => {
            const { host, controller } = setup({}, { connected: false })

            controller.floating = true
            controller.placement = 'top'
            controller.autoHide = true
            controller.scrollElementId = 'scroller'
            controller.peekSize = 8
            controller.quick = true

            expect(host.requestUpdate).toHaveBeenCalledTimes(6)
            expect(controller.floating).toBe(true)
            expect(controller.placement).toBe('top')
            expect(controller.autoHide).toBe(true)
            expect(controller.scrollElementId).toBe('scroller')
            expect(controller.peekSize).toBe(8)
            expect(controller.quick).toBe(true)
        })

        it('applies the hidden state when leaving floating mode while closed', () => {
            const { host, container, controller } = setup(
                { floating: true },
                { connected: false },
            )

            controller.floating = false

            expect(host.style.height).toBe('0px')
            expect(container?.style.transform).toBe('translateY(100px)')
        })

        it('applies the hidden state when the placement changes while closed', () => {
            const { host, container, controller } = setup({}, { connected: false })

            controller.placement = 'right'

            expect(host.style.width).toBe('0px')
            expect(container?.style.transform).toBe('translateX(-100px)')
        })

        it('applies the hidden state when the peek size changes while closed', () => {
            const { host, container, controller } = setup(
                { floating: true },
                { connected: false },
            )

            controller.peekSize = 12

            expect(host.style.height).toBe('12px')
            expect(container?.style.transform).toBe('translateY(0px)')
        })

        it('does not rebuild the hidden state while open', async () => {
            const { host, controller } = setup()

            await controller.show()
            host.style.height = '42px'
            controller.peekSize = 12

            expect(host.style.height).toBe('42px')
        })

        it('rebinds the scroll listener when scroll-related options change', () => {
            const { controller } = setup({}, { connected: false })
            const rebind = vi.spyOn(controller, 'rebindScroll')

            controller.placement = 'top'
            controller.autoHide = true
            controller.scrollElementId = 'scroller'

            expect(rebind).toHaveBeenCalledTimes(3)
        })
    })

    describe('lifecycle', () => {
        it('registers hover listeners and resolves the connection promise', async () => {
            const { host, controller } = setup({}, { connected: false })
            const add = vi.spyOn(host, 'addEventListener')

            controller.hostConnected()

            expect(add).toHaveBeenCalledWith('mouseenter', expect.any(Function))
            expect(add).toHaveBeenCalledWith('mouseleave', expect.any(Function))

            await controller.show()

            expect(controller.isOpen).toBe(true)
        })

        it('removes listeners and rejects stale operations on disconnect', async () => {
            HoldAnimations = true
            const { host, controller, calls } = setup()
            const remove = vi.spyOn(host, 'removeEventListener')
            const events = recordEvents(host, ['opened'])
            const showPromise = controller.show()

            await flush()
            expect(calls).toHaveLength(2)

            controller.hostDisconnected()

            expect(remove).toHaveBeenCalledWith('mouseenter', expect.any(Function))
            expect(remove).toHaveBeenCalledWith('mouseleave', expect.any(Function))
            expect(calls[0].animation.cancel).toHaveBeenCalled()

            await showPromise

            expect(events).toEqual([])
        })

        it('waits for connection before showing', async () => {
            const { host, controller } = setup({}, { connected: false })
            let settled = false
            const events = recordEvents(host, ['opened'])
            const showPromise = controller.show().then(() => {
                settled = true
            })

            await flush()
            expect(settled).toBe(false)
            expect(events).toEqual([])

            document.body.appendChild(host)
            controller.hostConnected()
            await showPromise

            expect(settled).toBe(true)
            expect(events).toEqual(['opened'])
        })
    })

    describe('show', () => {
        it('fires open then opened and applies the shown state', async () => {
            const { host, container, controller, calls } = setup()
            const events = recordEvents(host, ['open', 'opened'])

            host.style.height = '5px'
            host.style.width = '6px'
            container!.style.transform = 'none'

            await controller.show()

            expect(events).toEqual(['open', 'opened'])
            expect(controller.isOpen).toBe(true)
            expect(controller.isOpening).toBe(false)
            expect(host.hasAttribute('open')).toBe(true)
            expect(host.style.height).toBe('')
            expect(host.style.width).toBe('')
            expect(container!.style.transform).toBe('')
            expect(calls).toHaveLength(2)
            expect(calls[0].target).toBe(host)
            expect(calls[1].target).toBe(container)
            expect(calls[0].options).toEqual({
                duration: Duration.ExpressiveFastSpatial.Value,
                easing: Easing.Emphasized.ToCSSValue(),
                fill: 'forwards',
            })
        })

        it('can cancel the open event before any animation starts', async () => {
            const { host, controller, calls } = setup()
            const events = recordEvents(host, ['open', 'opened'])
            host.addEventListener('open', (event) => event.preventDefault())

            await controller.show()

            expect(events).toEqual(['open'])
            expect(calls).toHaveLength(0)
            expect(controller.isOpen).toBe(false)
            expect(host.hasAttribute('open')).toBe(false)
        })

        it('keeps an already-open host open when open is cancelled', async () => {
            const { host, controller } = setup()
            await controller.show()
            host.addEventListener('open', (event) => event.preventDefault())

            await controller.show()

            expect(controller.isOpen).toBe(true)
            expect(host.hasAttribute('open')).toBe(true)
        })

        it('skips animation in quick mode', async () => {
            const { host, controller, calls } = setup({ quick: true })
            const events = recordEvents(host, ['open', 'opened'])
            host.style.height = '5px'

            await controller.show()

            expect(events).toEqual(['open', 'opened'])
            expect(calls).toHaveLength(0)
            expect(controller.isOpen).toBe(true)
            expect(host.hasAttribute('open')).toBe(true)
            expect(host.style.height).toBe('')
        })

        it('still opens without a container element', async () => {
            const { host, controller, calls } = setup({}, { container: false })
            const events = recordEvents(host, ['open', 'opened'])

            await controller.show()

            expect(events).toEqual(['open', 'opened'])
            expect(calls).toHaveLength(0)
            expect(controller.isOpen).toBe(true)
            expect(host.hasAttribute('open')).toBe(true)
        })

        it('exposes isOpening until the animation settles', async () => {
            HoldAnimations = true
            const { host, controller, calls } = setup()
            const events = recordEvents(host, ['opened'])
            const showPromise = controller.show()

            await flush()

            expect(controller.isOpening).toBe(true)
            expect(controller.isOpen).toBe(true)
            expect(host.hasAttribute('open')).toBe(true)
            expect(events).toEqual([])

            calls.forEach((call) => call.animation.finish())
            await showPromise

            expect(controller.isOpening).toBe(false)
            expect(events).toEqual(['opened'])
        })

        it('invalidates a previous show when a newer show starts', async () => {
            HoldAnimations = true
            const { controller, calls } = setup()
            const events = recordEvents(controller['host'] as EventTarget, ['opened'])

            const first = controller.show()
            await flush()
            const firstCalls = calls.slice()

            const second = controller.show()
            await flush()

            expect(firstCalls[0].animation.cancel).toHaveBeenCalled()

            calls.forEach((call) => call.animation.finish())
            await Promise.all([first, second])

            expect(events).toEqual(['opened'])
            expect(controller.isOpen).toBe(true)
        })

        it('invalidates an in-flight show when close starts', async () => {
            HoldAnimations = true
            const { host, controller, calls } = setup()
            const events = recordEvents(host, ['open', 'opened', 'close', 'closed'])

            const showPromise = controller.show()
            await flush()

            const closePromise = controller.close()
            await flush()

            calls.forEach((call) => call.animation.finish())
            await Promise.all([showPromise, closePromise])

            expect(events).toEqual(['open', 'close', 'closed'])
            expect(controller.isOpen).toBe(false)
        })
    })

    describe('close', () => {
        it('fires close then closed and applies the hidden state', async () => {
            const { host, container, controller, calls } = setup()
            await controller.show()
            const events = recordEvents(host, ['close', 'closed'])
            const openCalls = calls.length

            await controller.close()

            const closeCalls = calls.slice(openCalls)
            expect(events).toEqual(['close', 'closed'])
            expect(controller.isOpen).toBe(false)
            expect(controller.isOpening).toBe(false)
            expect(host.hasAttribute('open')).toBe(false)
            expect(host.style.height).toBe('0px')
            expect(container!.style.transform).toBe('translateY(100px)')
            expect(closeCalls[0].options).toEqual({
                duration: Duration.ExpressiveFastEffects.Value,
                easing: Easing.EmphasizedAccelerate.ToCSSValue(),
                fill: 'forwards',
            })
        })

        it('can cancel the close event', async () => {
            const { host, controller } = setup()
            await controller.show()
            const events = recordEvents(host, ['close', 'closed'])
            host.addEventListener('close', (event) => event.preventDefault())

            await controller.close()

            expect(events).toEqual(['close'])
            expect(controller.isOpen).toBe(true)
            expect(host.hasAttribute('open')).toBe(true)
        })

        it('keeps an already-closed host closed when close is cancelled', async () => {
            const { host, controller } = setup()
            host.addEventListener('close', (event) => event.preventDefault())

            await controller.close()

            expect(controller.isOpen).toBe(false)
            expect(host.hasAttribute('open')).toBe(false)
        })

        it('skips animation in quick mode', async () => {
            const { host, controller, calls } = setup({ quick: true })
            await controller.show()
            const events = recordEvents(host, ['close', 'closed'])

            await controller.close()

            expect(events).toEqual(['close', 'closed'])
            expect(calls).toHaveLength(0)
            expect(controller.isOpen).toBe(false)
            expect(host.hasAttribute('open')).toBe(false)
            expect(host.style.height).toBe('0px')
        })

        it('resets the state without events while disconnected', async () => {
            const { host, controller } = setup({}, { connected: false })
            host.setAttribute('open', '')
            const events = recordEvents(host, ['close', 'closed'])

            await controller.close()

            expect(events).toEqual([])
            expect(controller.isOpen).toBe(false)
            expect(host.hasAttribute('open')).toBe(false)
        })

        it('still closes without a container element', async () => {
            const { host, controller, calls } = setup({}, { container: false })
            await controller.show()
            const events = recordEvents(host, ['closed'])

            await controller.close()

            expect(events).toEqual(['closed'])
            expect(calls).toHaveLength(0)
            expect(host.style.height).toBe('0px')
            expect(controller.isOpen).toBe(false)
        })
    })

    describe('geometry', () => {
        const cases = [
            { placement: 'bottom', floating: false, hidden: 0, close: 100, open: -100 },
            { placement: 'top', floating: false, hidden: 0, close: 0, open: 0 },
            { placement: 'left', floating: false, hidden: 0, close: 100, open: -100 },
            { placement: 'right', floating: false, hidden: 0, close: -100, open: 100 },
            { placement: 'bottom', floating: true, hidden: 24, close: 0, open: 0 },
            { placement: 'top', floating: true, hidden: 24, close: -76, open: -76 },
            { placement: 'left', floating: true, hidden: 24, close: -76, open: -76 },
            { placement: 'right', floating: true, hidden: 24, close: 0, open: 0 },
        ] as const

        it.each(cases)(
            '$placement (floating: $floating) builds the documented keyframes',
            async ({ placement, floating, hidden, close, open }) => {
                const { controller, calls } = setup({ placement, floating })
                await controller.show()

                const axis = axisOf(placement)
                const translate = translateOf(placement)

                expect(calls[0].frames).toEqual([
                    { [axis]: `${hidden}px` },
                    { [axis]: '100px' },
                ])
                expect(calls[1].frames).toEqual([
                    { transform: `${translate}(${open}px)` },
                    { transform: `${translate}(0px)` },
                ])

                const openCalls = calls.length
                await controller.close()
                const closeCalls = calls.slice(openCalls)

                expect(closeCalls[0].frames).toEqual([
                    { [axis]: '100px' },
                    { [axis]: `${hidden}px` },
                ])
                expect(closeCalls[1].frames).toEqual([
                    { transform: `${translate}(0px)` },
                    { transform: `${translate}(${close}px)` },
                ])
            },
        )

        it('clamps a negative peek size to zero', async () => {
            const { controller, calls } = setup({
                placement: 'top',
                floating: true,
                peekSize: -10,
            })

            await controller.show()

            expect(calls[0].frames).toEqual([{ height: '0px' }, { height: '100px' }])
            expect(calls[1].frames).toEqual([
                { transform: 'translateY(-100px)' },
                { transform: 'translateY(0px)' },
            ])
        })

        it('clamps the peek offset when peek exceeds the natural size', async () => {
            const { controller, calls } = setup({
                placement: 'top',
                floating: true,
                peekSize: 200,
            })

            await controller.show()

            expect(calls[0].frames).toEqual([{ height: '200px' }, { height: '100px' }])
            expect(calls[1].frames).toEqual([{ transform: 'translateY(0px)' }, { transform: 'translateY(0px)' }])
        })

        it('falls back to 64px when the natural size cannot be measured', async () => {
            const { controller, calls } = setup({}, { rect: 0 })

            await controller.show()

            expect(calls[0].frames).toEqual([{ height: '0px' }, { height: '64px' }])
        })

        it('measures with inline size styles cleared', async () => {
            const { host, controller } = setup()
            const measure = host.getBoundingClientRect
            const measuredStyles: string[] = []
            host.style.height = '999px'

            host.getBoundingClientRect = () => {
                measuredStyles.push(host.style.height)
                return measure()
            }

            await controller.show()

            expect(measuredStyles[0]).toBe('')
            expect(host.style.height).toBe('')
        })

        it('leaves animations owned by another behavior running while measuring', async () => {
            const { host, controller } = setup()
            const stale = { cancel: vi.fn() }
            host.getAnimations = vi.fn(() => [stale as unknown as Animation]) as never

            await controller.show()

            expect(stale.cancel).not.toHaveBeenCalled()
        })
    })

    describe('hover', () => {
        it('opens on mouse enter in floating mode', async () => {
            const { host, controller } = setup({ floating: true })

            host.dispatchEvent(new Event('mouseenter'))
            await flush()

            expect(controller.isOpen).toBe(true)
        })

        it('does not open on mouse enter outside floating mode', async () => {
            const { host, controller } = setup()

            host.dispatchEvent(new Event('mouseenter'))
            await flush()

            expect(controller.isOpen).toBe(false)
        })

        it('closes two seconds after mouse leave', async () => {
            vi.useFakeTimers()
            const { host, controller } = setup({ floating: true })
            await controller.show()

            host.dispatchEvent(new Event('mouseleave'))
            await vi.advanceTimersByTimeAsync(1999)
            expect(controller.isOpen).toBe(true)

            await vi.advanceTimersByTimeAsync(1)
            await Promise.resolve()
            expect(controller.isOpen).toBe(false)
        })

        it('does not schedule a close while opening', async () => {
            HoldAnimations = true
            vi.useFakeTimers()
            const { host, controller, calls } = setup({ floating: true })
            const close = vi.spyOn(controller, 'close')
            const showPromise = controller.show()
            await Promise.resolve()

            host.dispatchEvent(new Event('mouseleave'))
            await vi.advanceTimersByTimeAsync(2000)

            expect(close).not.toHaveBeenCalled()

            calls.forEach((call) => call.animation.finish())
            await showPromise
        })

        it('clears a pending close when the pointer re-enters', async () => {
            vi.useFakeTimers()
            const { host, controller } = setup({ floating: true })
            await controller.show()

            host.dispatchEvent(new Event('mouseleave'))
            host.dispatchEvent(new Event('mouseenter'))
            await vi.advanceTimersByTimeAsync(2000)

            expect(controller.isOpen).toBe(true)
        })

        it('clears a pending close on disconnect', async () => {
            vi.useFakeTimers()
            const { host, controller } = setup({ floating: true })
            const close = vi.spyOn(controller, 'close')
            await controller.show()

            host.dispatchEvent(new Event('mouseleave'))
            controller.hostDisconnected()
            await vi.advanceTimersByTimeAsync(2000)

            expect(close).not.toHaveBeenCalled()
        })

        it('does not close on mouse leave outside floating mode', async () => {
            vi.useFakeTimers()
            const { host, controller } = setup()
            const close = vi.spyOn(controller, 'close')
            await controller.show()

            host.dispatchEvent(new Event('mouseleave'))
            await vi.advanceTimersByTimeAsync(2000)

            expect(close).not.toHaveBeenCalled()
            expect(controller.isOpen).toBe(true)
        })
    })
})
