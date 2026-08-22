/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { NavigationDrawerEdge } from './navigation-drawer.interface'

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
 * The default navigation drawer open animation.
 *
 * - Scrim: opacity 0 -> 0.38 over 400ms, linear.
 * - Container: translateX(±100%) -> translateX(0) over 400ms, Emphasized.
 */
export const NavigationDrawerDefaultOpenAnimation = (
    drawerEdge: NavigationDrawerEdge,
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
            drawerEdge === 'start'
                ? [
                    { transform: 'translateX(-100%)' },
                    { transform: 'translateX(0)' },
                ]
                : [
                    { transform: 'translateX(100%)' },
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
 * - Container: translateX(0) -> translateX(±100%) over 200ms, EmphasizedAccelerate.
 */
export const NavigationDrawerDefaultCloseAnimation = (
    drawerEdge: NavigationDrawerEdge,
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
            drawerEdge === 'start'
                ? [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-100%)' },
                ]
                : [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(100%)' },
                ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag snap-back animation when dismiss threshold is not met.
 *
 * - Scrim: opacity scrimCurrent -> 0.38 over 250ms, linear.
 * - Container: translateX(fromDx px) -> translateX(0) over 250ms, EmphasizedDecelerate.
 */
export const NavigationDrawerDragSnapBackAnimation = (
    drawerEdge: NavigationDrawerEdge,
    fromDx: number,
    scrimCurrent: number,
): NavigationDrawerAnimation => {
    void drawerEdge
    return {
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
    }
}

/**
 * The drag commit-close animation when dismiss threshold is met.
 *
 * - Scrim: opacity scrimCurrent -> 0 over 200ms, linear.
 * - Container: translateX(fromDx px) -> translateX(±100%) over 200ms, EmphasizedAccelerate.
 */
export const NavigationDrawerDragCommitCloseAnimation = (
    drawerEdge: NavigationDrawerEdge,
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
            drawerEdge === 'start'
                ? [
                    { transform: `translateX(${fromDx}px)` },
                    { transform: 'translateX(-100%)' },
                ]
                : [
                    { transform: `translateX(${fromDx}px)` },
                    { transform: 'translateX(100%)' },
                ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})
