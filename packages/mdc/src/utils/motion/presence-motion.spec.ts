/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    cancelTrackedAnimations,
    capturePresenceSnapshot,
    hasRunningAnimation,
    isInvertibleTransform,
    isReducedMotion,
    runScaleFadeTransition,
} from './presence-motion'

const FakeAnim = (target: HTMLElement | null = null, playState = 'running') => {
    const listeners: Record<string, () => void> = {}
    return {
        playState,
        effect: { target },
        cancel: vi.fn(),
        addEventListener: vi.fn((type: string, cb: () => void) => (listeners[type] = cb)),
        fire: (type: string) => listeners[type]?.(),
    }
}

const Reduced = (matches: boolean) =>
    vi.stubGlobal('matchMedia', (q: string) => ({ matches, media: q }))

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('isReducedMotion', () => {
    it('reflects prefers-reduced-motion media query', () => {
        const spy = vi.fn(() => ({ matches: true }))
        vi.stubGlobal('matchMedia', spy)
        expect(isReducedMotion()).toBe(true)
        expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
        Reduced(false)
        expect(isReducedMotion()).toBe(false)
    })
})

describe('hasRunningAnimation', () => {
    it('false for null or elements without getAnimations', () => {
        expect(hasRunningAnimation(null)).toBe(false)
        expect(hasRunningAnimation({} as HTMLElement)).toBe(false)
    })

    it('true only when some animation is running', () => {
        const el = { getAnimations: () => [{ playState: 'paused' }, { playState: 'running' }] } as unknown as HTMLElement
        expect(hasRunningAnimation(el)).toBe(true)
        const none = { getAnimations: () => [{ playState: 'finished' }] } as unknown as HTMLElement
        expect(hasRunningAnimation(none)).toBe(false)
        expect(hasRunningAnimation({ getAnimations: () => [] } as unknown as HTMLElement)).toBe(false)
    })
})

describe('isInvertibleTransform', () => {
    it.each([
        ['', false],
        ['none', false],
        ['matrix(1, 0, 0, 1, 0, 0)', true],
        ['matrix(0, 0, 0, 0, 0, 0)', false],
        ['matrix(1, 2, 2, 4, 0, 0)', false],
        ['matrix(1, 0, 0, 1e-9, 0, 0)', false],
        ['matrix(1, 0, 0)', false],
        ['matrix(a, b, c, d, e, f)', false],
        ['matrix(NaN, 0, 0, 1, 0, 0)', false],
        ['matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)', true],
        ['scale(0.5)', true],
    ])('%s -> %s', (value, expected) => {
        expect(isInvertibleTransform(value)).toBe(expected)
    })
})

describe('cancelTrackedAnimations', () => {
    it('without targets cancels and clears everything', () => {
        const a = FakeAnim()
        const b = FakeAnim()
        const tracker = new Set([a, b] as unknown as Animation[])
        cancelTrackedAnimations(tracker)
        expect(a.cancel).toHaveBeenCalled()
        expect(b.cancel).toHaveBeenCalled()
        expect(tracker.size).toBe(0)
    })

    it('with targets cancels only matching animations', () => {
        const x = document.createElement('div')
        const y = document.createElement('div')
        const ax = FakeAnim(x)
        const ay = FakeAnim(y)
        const tracker = new Set([ax, ay] as unknown as Animation[])
        cancelTrackedAnimations(tracker, [x, null])
        expect(ax.cancel).toHaveBeenCalled()
        expect(ay.cancel).not.toHaveBeenCalled()
        expect(tracker.size).toBe(1)
    })

    it('with an empty target list cancels nothing', () => {
        const a = FakeAnim(document.createElement('div'))
        const tracker = new Set([a] as unknown as Animation[])
        cancelTrackedAnimations(tracker, [])
        expect(a.cancel).not.toHaveBeenCalled()
    })

    it('ignores animations without an effect target', () => {
        const a = FakeAnim(null)
        const tracker = new Set([a] as unknown as Animation[])
        cancelTrackedAnimations(tracker, [document.createElement('div')])
        expect(a.cancel).not.toHaveBeenCalled()
    })
})

describe('capturePresenceSnapshot', () => {
    it('idle: visible -> opacity 1, hidden -> opacity 0, no transform', () => {
        expect(capturePresenceSnapshot(null, true)).toEqual({ opacity: '1', transform: '' })
        expect(capturePresenceSnapshot(null, false)).toEqual({ opacity: '0', transform: '' })
    })

    it('running: reads computed opacity and invertible transform', () => {
        const el = document.createElement('div') as HTMLElement
        el.getAnimations = (() => [{ playState: 'running' }]) as never
        vi.stubGlobal('getComputedStyle', () => ({ opacity: '0.4', transform: 'matrix(1, 0, 0, 1, 0, 0)' }))
        expect(capturePresenceSnapshot(el, false)).toEqual({
            opacity: '0.4',
            transform: 'matrix(1, 0, 0, 1, 0, 0)',
        })
    })

    it('running with non-invertible transform drops the transform', () => {
        const el = document.createElement('div') as HTMLElement
        el.getAnimations = (() => [{ playState: 'running' }]) as never
        vi.stubGlobal('getComputedStyle', () => ({ opacity: '0.4', transform: 'matrix(0, 0, 0, 0, 0, 0)' }))
        expect(capturePresenceSnapshot(el, true).transform).toBe('')
    })
})

describe('runScaleFadeTransition', () => {
    const Setup = () => {
        const anim = FakeAnim()
        const el = document.createElement('div') as HTMLElement
        el.animate = vi.fn(() => anim as never) as never
        return { el, anim, tracker: new Set<Animation>() }
    }
    const Snap = { opacity: '1', transform: '' }

    it('reduced motion: no animation; exit completes immediately', () => {
        Reduced(true)
        const { el, tracker } = Setup()
        const done = vi.fn()
        runScaleFadeTransition(tracker, el, false, Snap, { onExitComplete: done })
        expect(el.animate).not.toHaveBeenCalled()
        expect(done).toHaveBeenCalledTimes(1)
        runScaleFadeTransition(tracker, el, true, Snap, { onExitComplete: done })
        expect(done).toHaveBeenCalledTimes(1)
    })

    it('missing element or animate(): exit completes, enter is a no-op', () => {
        Reduced(false)
        const done = vi.fn()
        runScaleFadeTransition(new Set(), null, false, Snap, { onExitComplete: done })
        expect(done).toHaveBeenCalledTimes(1)
        const bare = document.createElement('div') as HTMLElement
        ;(bare as unknown as { animate: unknown }).animate = undefined
        runScaleFadeTransition(new Set(), bare, true, Snap, { onExitComplete: done })
        expect(done).toHaveBeenCalledTimes(1)
    })

    it('enter: animates from startScale/startOpacity to identity and tracks', () => {
        Reduced(false)
        const { el, anim, tracker } = Setup()
        runScaleFadeTransition(tracker, el, true, Snap)
        const [kf, opts] = (el.animate as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(kf).toEqual([
            { opacity: 0, transform: 'scale(0.6)' },
            { opacity: 1, transform: 'scale(1)' },
        ])
        expect(opts.fill).toBe('none')
        expect(tracker.has(anim as never)).toBe(true)
        anim.fire('finish')
        expect(tracker.size).toBe(0)
    })

    it('enter honors custom start values', () => {
        Reduced(false)
        const { el, tracker } = Setup()
        runScaleFadeTransition(tracker, el, true, Snap, { startOpacity: 0.2, startScale: 0.9 })
        expect((el.animate as ReturnType<typeof vi.fn>).mock.calls[0][0][0]).toEqual({
            opacity: 0.2,
            transform: 'scale(0.9)',
        })
    })

    it('enter resumes from a running snapshot', () => {
        Reduced(false)
        const { el, tracker } = Setup()
        runScaleFadeTransition(tracker, el, true, { opacity: '0.5', transform: 'scale(0.8)' })
        expect((el.animate as ReturnType<typeof vi.fn>).mock.calls[0][0][0]).toEqual({
            opacity: 0.5,
            transform: 'scale(0.8)',
        })
    })

    it('cancel removes the animation from the tracker', () => {
        Reduced(false)
        const { el, anim, tracker } = Setup()
        runScaleFadeTransition(tracker, el, true, Snap)
        anim.fire('cancel')
        expect(tracker.size).toBe(0)
    })

    it('exit: fades to 0 with exit scale, holds forwards', () => {
        Reduced(false)
        const { el, tracker } = Setup()
        runScaleFadeTransition(tracker, el, false, Snap, { exitScale: 0.5 })
        const [kf, opts] = (el.animate as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(kf).toEqual([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.5)' },
        ])
        expect(opts.fill).toBe('forwards')
    })

    it('exit from non-finite snapshot opacity starts at 1', () => {
        Reduced(false)
        const { el, tracker } = Setup()
        runScaleFadeTransition(tracker, el, false, { opacity: '', transform: '' })
        expect((el.animate as ReturnType<typeof vi.fn>).mock.calls[0][0][0].opacity).toBe(1)
    })

    it('exit finish calls onExitComplete, cancels the fill, and untracks', () => {
        Reduced(false)
        const { el, anim, tracker } = Setup()
        const done = vi.fn()
        runScaleFadeTransition(tracker, el, false, Snap, { onExitComplete: done })
        anim.fire('finish')
        expect(done).toHaveBeenCalledTimes(1)
        expect(anim.cancel).toHaveBeenCalled()
        expect(tracker.size).toBe(0)
    })

    it('exit cancelled does not call onExitComplete', () => {
        Reduced(false)
        const { el, anim, tracker } = Setup()
        const done = vi.fn()
        runScaleFadeTransition(tracker, el, false, Snap, { onExitComplete: done })
        anim.fire('cancel')
        expect(done).not.toHaveBeenCalled()
        expect(tracker.size).toBe(0)
    })

    it('cancels prior tracked animations for the same element first', () => {
        Reduced(false)
        const { el, tracker } = Setup()
        const prior = FakeAnim(el)
        tracker.add(prior as never)
        runScaleFadeTransition(tracker, el, true, Snap)
        expect(prior.cancel).toHaveBeenCalled()
        expect(tracker.has(prior as never)).toBe(false)
    })
})
