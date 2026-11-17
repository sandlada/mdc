/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MeasuredDimensionController } from './measured-dimension-controller'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class Host extends HTMLElement {
    public controllers: ReactiveController[] = []
    public addController(c: ReactiveController) {
        this.controllers.push(c)
    }
    public requestUpdate() {}
    public updateComplete = Promise.resolve(true)
}
customElements.define('measured-host', Host)

interface IFakeAnim {
    cancel: ReturnType<typeof vi.fn>
    finished: Promise<void>
    finish: () => void
}

const FakeAnimation = (): IFakeAnim => {
    let resolve!: () => void
    let reject!: (e: unknown) => void
    const finished = new Promise<void>((res, rej) => {
        resolve = res
        reject = rej
    })
    finished.catch(() => {})
    return { cancel: vi.fn(() => reject(new Error('cancelled'))), finished, finish: resolve }
}

describe('MeasuredDimensionController', () => {
    let frames: Array<FrameRequestCallback | null>
    let host: Host
    let size: { scrollWidth: number; scrollHeight: number; rectWidth: number; rectHeight: number }
    let target: HTMLElement & { animate: ReturnType<typeof vi.fn> }
    let animations: IFakeAnim[]

    const Flush = () => {
        const pending = frames.slice()
        frames = []
        pending.forEach((cb) => cb?.(0))
    }

    const Setup = (options: Partial<ConstructorParameters<typeof MeasuredDimensionController>[1]> = {}) => {
        const c = new MeasuredDimensionController(host, { target: () => target, ...options })
        document.body.appendChild(host)
        c.hostConnected()
        return c
    }

    beforeEach(() => {
        frames = []
        animations = []
        size = { scrollWidth: 100, scrollHeight: 20, rectWidth: 100, rectHeight: 20 }
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            frames.push(cb)
            return frames.length
        })
        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            frames[id - 1] = null
        })
        host = new Host()
        target = document.createElement('div') as never
        Object.defineProperty(target, 'scrollWidth', { get: () => size.scrollWidth })
        Object.defineProperty(target, 'scrollHeight', { get: () => size.scrollHeight })
        target.getBoundingClientRect = () =>
            ({ width: size.rectWidth, height: size.rectHeight }) as DOMRect
        target.animate = vi.fn(() => {
            const a = FakeAnimation()
            animations.push(a)
            return a
        })
    })
    afterEach(() => vi.unstubAllGlobals())

    it('registers with host', () => {
        const c = new MeasuredDimensionController(host, { target: () => target })
        expect(host.controllers).toContain(c)
    })

    it('first update only records the size', () => {
        const c = Setup()
        size.scrollWidth = 200
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('animates width from previous natural size to new natural size', () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 160
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)
        const [frames_, opts] = target.animate.mock.calls[0]
        expect(frames_).toEqual([
            { width: '100px', offset: 0 },
            { width: '100px', offset: 0.15 },
            { width: '160px', offset: 1 },
        ])
        expect(opts).toEqual({ duration: 300, easing: 'cubic-bezier(0.2, 0, 0.2, 1)', fill: 'none' })
    })

    it('supports height dimension and reads scrollHeight', () => {
        const c = Setup({ dimension: 'height', duration: 50, easing: 'linear' })
        c.hostUpdated()
        size.scrollHeight = 60
        c.hostUpdated()
        const [frames_, opts] = target.animate.mock.calls[0]
        expect(frames_[0]).toEqual({ height: '20px', offset: 0 })
        expect(frames_[2]).toEqual({ height: '60px', offset: 1 })
        expect(opts).toMatchObject({ duration: 50, easing: 'linear' })
    })

    it('ignores changes smaller than 1px', () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 100.5
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('does not animate on a change of exactly 1px boundary below threshold, does at 1px', () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 101
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('interrupts a running animation starting from the live rect size', () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 200
        c.hostUpdated()
        size.rectWidth = 140
        size.scrollWidth = 50
        c.hostUpdated()
        expect(animations[0].cancel).toHaveBeenCalledTimes(1)
        const frames_ = target.animate.mock.calls[1][0]
        expect(frames_[0]).toEqual({ width: '140px', offset: 0 })
        expect(frames_[2]).toEqual({ width: '50px', offset: 1 })
    })

    it('does nothing when target is null', () => {
        const c = new MeasuredDimensionController(host, { target: () => null })
        c.hostConnected()
        expect(() => {
            c.hostUpdated()
            c.hostUpdated()
        }).not.toThrow()
    })

    it('light DOM mutation measures on next frame, coalescing bursts', async () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 180
        host.append(document.createElement('i'))
        host.append(document.createElement('i'))
        await new Promise((r) => setTimeout(r))
        expect(frames.filter(Boolean)).toHaveLength(1)
        Flush()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('hostUpdated skips while a mutation frame is pending', async () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 180
        host.append(document.createElement('i'))
        await new Promise((r) => setTimeout(r))
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
        Flush()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('mutation before the first recorded size is ignored', async () => {
        Setup()
        host.append(document.createElement('i'))
        await new Promise((r) => setTimeout(r))
        Flush()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('disconnect cancels animation and frame, and stops observing', async () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 180
        c.hostUpdated()
        host.append(document.createElement('i'))
        await new Promise((r) => setTimeout(r))
        c.hostDisconnected()
        expect(animations[0].cancel).toHaveBeenCalled()
        Flush()
        expect(target.animate).toHaveBeenCalledTimes(1)
        host.append(document.createElement('b'))
        await new Promise((r) => setTimeout(r))
        expect(frames.filter(Boolean)).toHaveLength(0)
    })

    it('reconnect forgets the previous size', () => {
        const c = Setup()
        c.hostUpdated()
        c.hostDisconnected()
        c.hostConnected()
        size.scrollWidth = 500
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('finished animation is cleared (later change measures from natural size, no cancel)', async () => {
        const c = Setup()
        c.hostUpdated()
        size.scrollWidth = 150
        c.hostUpdated()
        animations[0].finish()
        await Promise.resolve()
        await Promise.resolve()
        size.scrollWidth = 90
        c.hostUpdated()
        expect(animations[0].cancel).not.toHaveBeenCalled()
        expect(target.animate.mock.calls[1][0][0]).toEqual({ width: '150px', offset: 0 })
    })
})
