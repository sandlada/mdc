/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { DockSide } from '../../utils/docking'

/**
 * A navigation drawer animation's arguments. See `Element.prototype.animate`.
 */
export type NavigationDrawerAnimationArgs = Parameters<Element['animate']>

/**
 * A collection of navigation drawer animations for scrim and container.
 */
export interface NavigationDrawerAnimation {
    /** Animations for the scrim backdrop. */
    scrim?: NavigationDrawerAnimationArgs[]
    /** Animations for the drawer container surface. */
    container?: NavigationDrawerAnimationArgs[]
}

const SCRIM_OPACITY_PEAK = 0.38

/**
 * Pixel-space keyframe for the container's off-dock resting offset on a
 * physical dock side. The factories take the PHYSICAL side (resolved from
 * the logical `drawer-edge` against `dir` by the host) so `translateX`
 * always points off the actual docked edge, including under `rtl`.
 */
const offDockTransform = (side: DockSide): string =>
    side === 'left' ? 'translateX(-100%)' : 'translateX(100%)'

/**
 * The default navigation drawer open animation.
 *
 * - Scrim: opacity 0 -> 0.38 over 400ms, linear.
 * - Container: translateX(off-dock) -> translateX(0) over 400ms, Emphasized.
 */
export const NavigationDrawerDefaultOpenAnimation = (
    side: DockSide,
): NavigationDrawerAnimation => ({
    scrim: [
        [
            [
                { opacity: 0 },
                { opacity: SCRIM_OPACITY_PEAK },
            ],
            { duration: 400, easing: 'linear' },
        ],
    ],
    container: [
        [
            [
                { transform: offDockTransform(side) },
                { transform: 'translateX(0)' },
            ],
            { duration: 400, easing: Easing.Emphasized.ToCSSValue() },
        ],
    ],
})

/**
 * The default navigation drawer close animation.
 *
 * - Scrim: opacity 0.38 -> 0 over 200ms, linear.
 * - Container: translateX(0) -> translateX(off-dock) over 200ms, EmphasizedAccelerate.
 */
export const NavigationDrawerDefaultCloseAnimation = (
    side: DockSide,
): NavigationDrawerAnimation => ({
    scrim: [
        [
            [
                { opacity: SCRIM_OPACITY_PEAK },
                { opacity: 0 },
            ],
            { duration: 200, easing: 'linear' },
        ],
    ],
    container: [
        [
            [
                { transform: 'translateX(0)' },
                { transform: offDockTransform(side) },
            ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag snap-back animation when neither the dismiss nor the relocate
 * threshold is met.
 *
 * - Scrim: opacity scrimCurrent -> 0.38 over 250ms, linear.
 * - Container: translateX(fromDx px) -> translateX(0) over 250ms, EmphasizedDecelerate.
 */
export const NavigationDrawerDragSnapBackAnimation = (
    fromDx: number,
    scrimCurrent: number,
): NavigationDrawerAnimation => ({
    scrim: [
        [
            [
                { opacity: scrimCurrent },
                { opacity: SCRIM_OPACITY_PEAK },
            ],
            { duration: 250, easing: 'linear' },
        ],
    ],
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: 'translateX(0)' },
            ],
            { duration: 250, easing: Easing.EmphasizedDecelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag commit-close animation when the dismiss threshold is met.
 *
 * - Scrim: opacity scrimCurrent -> 0 over 200ms, linear.
 * - Container: translateX(fromDx px) -> translateX(off-dock) over 200ms,
 *   EmphasizedAccelerate.
 */
export const NavigationDrawerDragCommitCloseAnimation = (
    side: DockSide,
    fromDx: number,
    scrimCurrent: number,
): NavigationDrawerAnimation => ({
    scrim: [
        [
            [
                { opacity: scrimCurrent },
                { opacity: 0 },
            ],
            { duration: 200, easing: 'linear' },
        ],
    ],
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: offDockTransform(side) },
            ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-relocate (edge flip) animation. The container starts from the
 * visual position the drag handed over — expressed against the NEW dock —
 * and animates to the open resting position while the dock anchor swaps.
 *
 * - Container: translateX(newDx px) -> translateX(0) over 300ms,
 *   EmphasizedDecelerate.
 */
export const NavigationDrawerDragRelocateAnimation = (
    newDx: number,
): NavigationDrawerAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${newDx}px)` },
                { transform: 'translateX(0)' },
            ],
            { duration: 300, easing: Easing.EmphasizedDecelerate.ToCSSValue() },
        ],
    ],
})
