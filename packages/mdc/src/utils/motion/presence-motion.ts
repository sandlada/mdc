/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'

export interface IPresenceSnapshot {
    opacity  : string
    transform: string
}

export interface IScaleFadeTransitionOptions {
    startOpacity?  : number
    startScale?    : number
    exitScale?     : number
    onExitComplete?: () => void
}

export function isReducedMotion(): boolean {
    return (
        typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

export function hasRunningAnimation(el: HTMLElement | null): boolean {
    if (!el || typeof el.getAnimations !== 'function') return false
    return el.getAnimations().some((anim) => anim.playState === 'running')
}

export function isInvertibleTransform(transform: string): boolean {
    if (!transform || transform === 'none') return false
    const match = transform.match(/^matrix\(([^)]+)\)$/)
    if (!match) return true
    const parts = match[1].split(',').map((v) => Number.parseFloat(v.trim()))
    if (parts.length !== 6 || parts.some((v) => !Number.isFinite(v))) return false
    const [a, b, c, d] = parts
    return Math.abs(a * d - b * c) > 1e-4
}

export function cancelTrackedAnimations(
    tracker: Set<Animation>,
    targets?: Array<HTMLElement | null>,
): void {
    if (!targets) {
        for (const anim of tracker) {
            anim.cancel()
        }
        tracker.clear()
        return
    }

    const targetSet = new Set(targets.filter((el): el is HTMLElement => el !== null))
    for (const anim of tracker) {
        const effectTarget = (anim.effect as KeyframeEffect | null)?.target as HTMLElement | null
        if (effectTarget && targetSet.has(effectTarget)) {
            anim.cancel()
            tracker.delete(anim)
        }
    }
}

export function capturePresenceSnapshot(
    el: HTMLElement | null,
    wasVisible: boolean,
): IPresenceSnapshot {
    const running = hasRunningAnimation(el)
    const style = running && el && typeof getComputedStyle === 'function' ? getComputedStyle(el) : null
    const rawTransform = style?.transform ?? ''

    return {
        opacity  : running && style ? style.opacity : (wasVisible ? '1' : '0'),
        transform: running && isInvertibleTransform(rawTransform) ? rawTransform : '',
    }
}

export function runScaleFadeTransition(
    tracker: Set<Animation>,
    el: HTMLElement | null,
    visible: boolean,
    snapshot: IPresenceSnapshot,
    options: IScaleFadeTransitionOptions = {},
): void {
    const {
        startOpacity: customStartOpacity = 0,
        startScale = 0.6,
        exitScale = 0.6,
        onExitComplete,
    } = options

    if (isReducedMotion()) {
        if (!visible) onExitComplete?.()
        return
    }

    if (!el || typeof el.animate !== 'function') {
        if (!visible) onExitComplete?.()
        return
    }

    cancelTrackedAnimations(tracker, [el])

    const parsedOpacity = Number.parseFloat(snapshot.opacity)

    if (!visible) {
        const startOpacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1
        const startTransform = snapshot.transform || 'scale(1)'

        const anim = el.animate(
            [
                { opacity: startOpacity, transform: startTransform },
                { opacity: 0, transform: `scale(${exitScale})` },
            ],
            {
                duration: Duration.ExpressiveFastEffects.Value,
                easing  : Easing.ExpressiveFastEffects.ToCSSValue(),
                fill    : 'forwards',
            },
        )
        tracker.add(anim)
        const cleanup = () => tracker.delete(anim)
        anim.addEventListener('cancel', cleanup, { once: true })
        anim.addEventListener('finish', () => {
            onExitComplete?.()
            anim.cancel()
            tracker.delete(anim)
        }, { once: true })
        return
    }

    const hasRunningTransform = Boolean(snapshot.transform)
    const startOpacity = hasRunningTransform && Number.isFinite(parsedOpacity) ? parsedOpacity : customStartOpacity
    const startTransform = snapshot.transform || `scale(${startScale})`

    const anim = el.animate(
        [
            { opacity: startOpacity, transform: startTransform },
            { opacity: 1, transform: 'scale(1)' },
        ],
        {
            duration: Duration.ExpressiveFastSpatial.Value,
            easing  : Easing.ExpressiveFastSpatial.ToCSSValue(),
            fill    : 'none',
        },
    )
    tracker.add(anim)
    const cleanup = () => tracker.delete(anim)
    anim.addEventListener('cancel', cleanup, { once: true })
    anim.addEventListener('finish', cleanup, { once: true })
}
