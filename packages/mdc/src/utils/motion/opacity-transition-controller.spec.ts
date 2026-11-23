/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OpacityTransitionController, type OpacityTransitionOptions } from './opacity-transition-controller'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class Host extends HTMLElement {
    public controllers: ReactiveController[] = []
    public hasLabel = false
    public extended = false
    public selected = false
    public variant = 'filter'
    public disabled = false

    public addController(c: ReactiveController) {
        this.controllers.push(c)
    }
    public requestUpdate() {}
    public updateComplete = Promise.resolve(true)
}
customElements.define('opacity-host', Host)

const FakeAnimation = () => {
    let resolve!: () => void
    let reject!: (e: unknown) => void
    const finished = new Promise<void>((res, rej) => {
        resolve = res
        reject = rej
    })
    finished.catch(() => {})
    return {
        cancel: vi.fn(() => reject(new Error('cancelled'))),
        finished,
        finish: resolve,
    }
}

describe('OpacityTransitionController', () => {
    let frames: Array<FrameRequestCallback | null>
    let host: Host
    let target: HTMLElement & { animate: ReturnType<typeof vi.fn> }
    let animations: ReturnType<typeof FakeAnimation>[]

    const Flush = () => {
        const pending = frames.slice()
        frames = []
        pending.forEach((cb) => cb?.(0))
    }

    const Setup = (
        options: Partial<Omit<OpacityTransitionOptions<Host>, 'target'>> & {
            target?: () => HTMLElement | null
        } = {},
    ) => {
        const controller = new OpacityTransitionController(host, {
            target: () => target,
            ...options,
        })
        document.body.appendChild(host)
        controller.hostConnected()
        return controller
    }

    beforeEach(() => {
        frames = []
        animations = []
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            frames.push(cb)
            return frames.length
        })
        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            frames[id - 1] = null
        })
        host = new Host()
        target = document.createElement('div') as never
        target.textContent = 'Initial'
        target.animate = vi.fn(() => {
            const a = FakeAnimation()
            animations.push(a)
            return a
        })
    })
    afterEach(() => vi.unstubAllGlobals())

    it('registers itself with the host', () => {
        const c = new OpacityTransitionController(host, { target: () => target })
        expect(host.controllers).toContain(c)
    })

    it('does not animate on the first render', () => {
        const c = Setup()
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('does not animate on unrelated hostUpdated() when content and watched fields are unchanged', () => {
        const c = Setup()
        c.hostUpdated()
        host.disabled = true
        c.hostUpdated()
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('animates when target text content changes with default options', () => {
        const c = Setup()
        c.hostUpdated()
        target.textContent = 'Updated'
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)
        const [keyframes, opts] = target.animate.mock.calls[0]
        expect(keyframes).toEqual([
            { opacity: '0', offset: 0 },
            { opacity: '0', offset: 0.15 },
            { opacity: '1', offset: 1 },
        ])
        expect(opts).toEqual({ duration: 300, easing: 'cubic-bezier(0.2, 0, 0.2, 1)', fill: 'none' })
    })

    it('honors custom duration and easing', () => {
        const c = Setup({ duration: 100, easing: 'linear' })
        c.hostUpdated()
        target.textContent = 'Changed'
        c.hostUpdated()
        expect(target.animate.mock.calls[0][1]).toMatchObject({ duration: 100, easing: 'linear' })
    })

    it('does nothing while target is null', () => {
        const c = new OpacityTransitionController(host, { target: () => null })
        c.hostConnected()
        c.hostUpdated()
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('animates when target transitions from null on first render to an element on watch change', () => {
        let currentTarget: HTMLElement | null = null
        const c = Setup({
            target: () => currentTarget,
            watch: 'selected',
        })
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()

        host.selected = true
        currentTarget = target
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('supports single-field watch via getter and property key', () => {
        const getterCtrl = Setup({ watch: () => host.hasLabel })
        getterCtrl.hostUpdated()
        host.disabled = true
        getterCtrl.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()

        host.hasLabel = true
        getterCtrl.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)

        const keyCtrl = Setup({ watch: 'extended' })
        keyCtrl.hostUpdated()
        host.disabled = false
        keyCtrl.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)

        host.extended = true
        keyCtrl.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(2)
    })

    it('supports multi-field tuple getter and mixed watch arrays without false positives', () => {
        const c = Setup({
            watch: ['hasLabel', () => [host.extended, host.variant]],
        })
        c.hostUpdated()

        // Unrelated property change, new array instances with same values
        host.disabled = true
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()

        // Property key field changes
        host.hasLabel = true
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)

        // Nested tuple element changes
        host.variant = 'assist'
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(2)
    })

    it('supports mixing watch with observeContent: true', () => {
        const c = Setup({
            watch: 'hasLabel',
            observeContent: true,
        })
        c.hostUpdated()

        // Unrelated update
        host.disabled = true
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()

        // Watched field changes
        host.hasLabel = true
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(1)

        // Target content changes while watched field stays the same
        target.textContent = 'New label'
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(2)
    })

    it('cancels the in-flight animation when a new one starts', () => {
        const c = Setup()
        c.hostUpdated()
        target.textContent = 'First'
        c.hostUpdated()
        target.textContent = 'Second'
        c.hostUpdated()
        expect(target.animate).toHaveBeenCalledTimes(2)
        expect(animations[0].cancel).toHaveBeenCalledTimes(1)
        expect(animations[1].cancel).not.toHaveBeenCalled()
    })

    it('light DOM slotted text mutation animates on next frame (coalesced), ignoring unrelated slots', async () => {
        const shadow = host.attachShadow({ mode: 'open' })
        target.textContent = ''
        const defaultSlot = document.createElement('slot')
        const iconSlot = document.createElement('slot')
        iconSlot.name = 'icon'
        target.append(defaultSlot)
        shadow.append(target, iconSlot)

        const c = Setup()
        c.hostUpdated()

        // Mutating an unrelated named slot should NOT animate target
        const icon = document.createElement('span')
        icon.setAttribute('slot', 'icon')
        icon.textContent = 'home'
        host.append(icon)
        await new Promise((r) => setTimeout(r))
        Flush()
        expect(target.animate).not.toHaveBeenCalled()

        // Mutating the default slot inside target SHOULD animate once (coalesced)
        host.append(document.createTextNode('Hello'))
        host.append(document.createTextNode(' World'))
        await new Promise((r) => setTimeout(r))
        expect(frames.filter(Boolean)).toHaveLength(1)
        Flush()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('hostUpdated defers to a pending mutation frame', async () => {
        const shadow = host.attachShadow({ mode: 'open' })
        target.textContent = ''
        target.append(document.createElement('slot'))
        shadow.append(target)

        const c = Setup()
        c.hostUpdated()
        host.append(document.createTextNode('Deferred'))
        await new Promise((r) => setTimeout(r))
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
        Flush()
        expect(target.animate).toHaveBeenCalledTimes(1)
    })

    it('mutation before first render does not animate', async () => {
        Setup()
        host.append(document.createTextNode('Early'))
        await new Promise((r) => setTimeout(r))
        Flush()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('disconnect cancels animation, pending frame and stops observing', async () => {
        const c = Setup()
        c.hostUpdated()
        target.textContent = 'Trigger'
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

    it('reconnect resets first-render suppression', () => {
        const c = Setup()
        c.hostUpdated()
        c.hostDisconnected()
        c.hostConnected()
        c.hostUpdated()
        expect(target.animate).not.toHaveBeenCalled()
    })

    it('finished animation is cleared and not cancelled afterwards', async () => {
        const c = Setup()
        c.hostUpdated()
        target.textContent = 'Done'
        c.hostUpdated()
        animations[0].finish()
        await Promise.resolve()
        await Promise.resolve()
        c.hostDisconnected()
        expect(animations[0].cancel).not.toHaveBeenCalled()
    })
})
