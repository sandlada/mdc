/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { SideSheetEdge } from './side-sheet.interface'

/**
 * A side-sheet animation's arguments. See `Element.prototype.animate`.
 */
export type SideSheetAnimationArgs = Parameters<Element['animate']>

/**
 * A collection of side-sheet animations. Each element of the sheet may have
 * multiple animations.
 */
export interface SideSheetAnimation {
    /**
     * Animations for the scrim backdrop.
     */
    scrim?: SideSheetAnimationArgs[]

    /**
     * Animations for the container of the side sheet.
     */
    container?: SideSheetAnimationArgs[]
}

// Mirror --_enabled-container-opacity-modal (see side-sheet.definition.ts).
// Centralised here so the WAAPI keyframes and the CSS rest state stay in sync.
const SCRIM_OPACITY_PEAK = 0.32

/**
 * The default side-sheet open animation. The `sheetEdge` argument picks the
 * off-screen keyframe direction — `end` slides in from the inline-end edge,
 * `start` slides in from the inline-start edge.
 *
 *  - Scrim: opacity 0 → 0.32 over 500ms, linear.
 *  - Container: translateX(±100%) → translateX(0) over 500ms, Emphasized.
 */
export const SideSheetDefaultOpenAnimation = (sheetEdge: SideSheetEdge): SideSheetAnimation => ({
    scrim: [
        [
            [
                { opacity: 0 },
                { opacity: SCRIM_OPACITY_PEAK },
            ],
            { duration: 500, easing: 'linear' },
        ],
    ],
    container: [
        [
            sheetEdge === 'start'
                ? [
                    { transform: 'translateX(-100%)' },
                    { transform: 'translateX(0)' },
                ]
                : [
                    { transform: 'translateX(100%)' },
                    { transform: 'translateX(0)' },
                ],
            { duration: 500, easing: Easing.Emphasized.ToCSSValue() },
        ],
    ],
})

/**
 * The default side-sheet close animation. Mirror of `SideSheetDefaultOpenAnimation`
 * with shorter durations and the accelerating easing curve.
 *
 *  - Scrim: opacity 0.32 → 0 over 150ms, linear.
 *  - Container: translateX(0) → translateX(±100%) over 150ms, EmphasizedAccelerate.
 */
export const SideSheetDefaultCloseAnimation = (sheetEdge: SideSheetEdge): SideSheetAnimation => ({
    scrim: [
        [
            [
                { opacity: SCRIM_OPACITY_PEAK },
                { opacity: 0 },
            ],
            { duration: 150, easing: 'linear' },
        ],
    ],
    container: [
        [
            sheetEdge === 'start'
                ? [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-100%)' },
                ]
                : [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(100%)' },
                ],
            { duration: 150, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})