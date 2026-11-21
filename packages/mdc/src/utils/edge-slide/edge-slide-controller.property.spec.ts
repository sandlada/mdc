/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import fc from 'fast-check'
import type { ReactiveController } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    EdgeSlideController,
    Placement,
    type IEdgeSlideHost,
} from './edge-slide-controller'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class PropertyHost extends HTMLElement {
    public containerElement = document.createElement('div')
    public updateComplete: Promise<boolean> = Promise.resolve(true)
    public addController(_controller: ReactiveController) {}
    public requestUpdate() {}
}

customElements.define('edge-property-host', PropertyHost)

interface Frames {
    openHost: Keyframe[]
    openInner: Keyframe[]
    closeHost: Keyframe[]
    closeInner: Keyframe[]
}

const geometry = async (
    placement: (typeof Placement)[keyof typeof Placement],
    floating: boolean,
    natural: number,
    peek: number,
): Promise<Frames> => {
    const host = new PropertyHost()
    host.getBoundingClientRect = () =>
        ({ width: natural, height: natural }) as DOMRect
    host.getAnimations = () => []

    const captured: Keyframe[][] = []
    const animate = (target: HTMLElement) => {
        target.animate = ((frames: Keyframe[]) => {
            captured.push([...frames])
            return {
                finished: Promise.resolve(),
                cancel: () => {},
            } as unknown as Animation
        }) as never
        target.getAnimations = () => []
    }

    animate(host)
    animate(host.containerElement)

    document.body.appendChild(host)
    const controller = new EdgeSlideController(host as unknown as IEdgeSlideHost, {
        placement,
        floating,
        peekSize: peek,
    })
    controller.hostConnected()

    await controller.show()
    await controller.close()

    return {
        openHost: captured[0],
        openInner: captured[1],
        closeHost: captured[2],
        closeInner: captured[3],
    }
}

const expectedOffsets = (
    placement: string,
    floating: boolean,
    natural: number,
    peek: number,
): { close: number; open: number } => {
    if (!floating) {
        switch (placement) {
            case 'bottom':
                return { close: natural, open: -natural }
            case 'top':
                return { close: 0, open: 0 }
            case 'left':
                return { close: natural, open: -natural }
            default:
                return { close: -natural, open: natural }
        }
    }

    const magnitude = Math.max(0, natural - Math.max(0, peek))

    switch (placement) {
        case 'bottom':
            return { close: 0, open: 0 }
        case 'top':
            return { close: -magnitude, open: -magnitude }
        case 'left':
            return { close: -magnitude, open: -magnitude }
        default:
            return { close: 0, open: 0 }
    }
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('EdgeSlideController geometry properties', () => {
    it('derives hidden size, keyframes and offsets from placement', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(...Object.values(Placement)),
                fc.boolean(),
                fc.integer({ min: 0, max: 500 }),
                fc.integer({ min: -50, max: 500 }),
                async (placement, floating, natural, peek) => {
                    const frames = await geometry(placement, floating, natural, peek)
                    const measured = natural || 64
                    const hidden = floating ? Math.max(0, peek) : 0
                    const offsets = expectedOffsets(placement, floating, measured, peek)
                    const axis = placement === 'top' || placement === 'bottom' ? 'height' : 'width'
                    const translate =
                        placement === 'top' || placement === 'bottom' ? 'translateY' : 'translateX'

                    expect(frames.openHost).toEqual([
                        { [axis]: `${hidden}px` },
                        { [axis]: `${measured}px` },
                    ])
                    expect(frames.openInner).toEqual([
                        { transform: `${translate}(${offsets.open}px)` },
                        { transform: `${translate}(0px)` },
                    ])
                    expect(frames.closeHost).toEqual([
                        { [axis]: `${measured}px` },
                        { [axis]: `${hidden}px` },
                    ])
                    expect(frames.closeInner).toEqual([
                        { transform: `${translate}(0px)` },
                        { transform: `${translate}(${offsets.close}px)` },
                    ])
                },
            ),
            { numRuns: 100 },
        )
    })

    it('mirrors full-mode offsets across the docked edge', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(...Object.values(Placement)),
                fc.integer({ min: 1, max: 500 }),
                async (placement, natural) => {
                    const frames = await geometry(placement, false, natural, 24)
                    const readOffset = (value: string | number | null | undefined) =>
                        Number(/\((-?\d+)px\)/.exec(String(value))?.[1])
                    const open = readOffset(frames.openInner[0].transform)
                    const close = readOffset(frames.closeInner[1].transform)

                    if (placement === 'top') {
                        expect(open).toBe(0)
                        expect(close).toBe(0)
                        return
                    }

                    expect(open).toBe(-close)
                },
            ),
            { numRuns: 100 },
        )
    })
})
