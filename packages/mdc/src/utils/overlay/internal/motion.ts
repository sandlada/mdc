/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { OverlayPlacements } from '../overlay-types'
import { getPlacementSlideOffset } from './geometry'

const OpenMotionDurationMs = 180
const CloseMotionDurationMs = 140
const SlideDistancePx = 8

export class OverlayMotion {
    private activeAnimation: Animation | null = null

    public stop(): void {
        const animation = this.activeAnimation
        this.activeAnimation = null
        animation?.cancel()
    }

    public async play(
        surface: HTMLElement | null | undefined,
        mode: 'open' | 'close',
        placement: OverlayPlacements,
    ): Promise<void> {
        if (!surface || surface.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }
        this.stop()
        const resolvedPlacement = (surface.dataset['placement'] as OverlayPlacements | undefined) ?? placement
        const { x, y } = getPlacementSlideOffset(SlideDistancePx)(resolvedPlacement)
        const translate = `translate3d(${x}px, ${y}px, 0)`

        const keyframes: Keyframe[] = mode === 'open'
            ? [
                { opacity: 0, transform: `${translate} scale(0.94)` },
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
            ]
            : [
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
                { opacity: 0, transform: `${translate} scale(0.96)` },
            ]

        const animation = surface.animate(keyframes, {
            duration: mode === 'open' ? OpenMotionDurationMs : CloseMotionDurationMs,
            easing: mode === 'open'
                ? Easing.EmphasizedDecelerate.ToCSSValue()
                : Easing.EmphasizedAccelerate.ToCSSValue(),
        })
        this.activeAnimation = animation

        try {
            await animation.finished
        } catch (error) {
            if ((error as DOMException | null)?.name !== 'AbortError') throw error
        } finally {
            if (this.activeAnimation === animation) {
                this.activeAnimation = null
            }
        }
    }
}
