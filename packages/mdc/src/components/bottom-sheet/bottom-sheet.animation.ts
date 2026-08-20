/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'

/**
 * A bottom-sheet animation's arguments. See `Element.prototype.animate`.
 */
export type BottomSheetAnimationArgs = Parameters<Element['animate']>

/**
 * A collection of bottom-sheet animations. Each element of the sheet may have
 * multiple animations.
 */
export interface BottomSheetAnimation {
    /**
     * Animations for the scrim backdrop.
     */
    scrim?: BottomSheetAnimationArgs[]

    /**
     * Animations for the container of the bottom sheet.
     */
    container?: BottomSheetAnimationArgs[]
}

// Mirror --_enabled-container-opacity-modal (see bottom-sheet.definition.ts).
// Centralised here so the WAAPI keyframes and the CSS rest state stay in sync.
const SCRIM_OPACITY_PEAK = 0.32

/**
 * The default bottom-sheet open animation.
 *  - Scrim: opacity 0 -> 0.32 over 500ms, linear.
 *  - Container: translateY(100%) -> translateY(0) over 500ms, Emphasized.
 */
export const BottomSheetDefaultOpenAnimation = (): BottomSheetAnimation => ({
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
            [
                { transform: 'translateY(100%)' },
                { transform: 'translateY(0)' },
            ],
            { duration: 500, easing: Easing.Emphasized.ToCSSValue() },
        ],
    ],
})

/**
 * The default bottom-sheet close animation. Mirror of `BottomSheetDefaultOpenAnimation`
 * with shorter durations and the accelerating easing curve.
 *  - Scrim: opacity 0.32 -> 0 over 150ms, linear.
 *  - Container: translateY(0) -> translateY(100%) over 150ms, EmphasizedAccelerate.
 */
export const BottomSheetDefaultCloseAnimation = (): BottomSheetAnimation => ({
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
            [
                { transform: 'translateY(0)' },
                { transform: 'translateY(100%)' },
            ],
            { duration: 150, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The detent-change animation (modal only). Animates `translateY` from a
 * current offset (e.g. mid-snap from a drag) back to 0 while the CSS rule
 * for the new detent's `max-height` is applied via the variant class.
 *
 *  - Container: translateY(currentOffset) -> translateY(0) over 350ms,
 *    Emphasized. Only emits a keyframes pair when `currentOffset > 0`;
 *    otherwise the caller already at-rest and no translate animation is
 *    needed (max-height transition is handled by CSS).
 *  - Scrim: no animation (opacity is the same at both detents).
 *
 * `direction` is currently informational — the host decides the new `max-height`
 * by toggling the `detent-full` / `detent-peek` class on the dialog. Kept in
 * the signature for future use (e.g. distinct expand vs collapse easings).
 */
export const BottomSheetDetentChangeAnimation = (
    direction: 'expand' | 'collapse',
    currentOffset: number,
): BottomSheetAnimation => {
    void direction
    return {
        container: Math.abs(currentOffset) > 0.5
            ? [
                [
                    [
                        { transform: `translateY(${currentOffset}px)` },
                        { transform: 'translateY(0)' },
                    ],
                    { duration: 350, easing: Easing.Emphasized.ToCSSValue() },
                ],
            ]
            : [],
    }
}

/**
 * The drag-snap-back animation. Animates the container from the current drag
 * offset back to its resting position, and the scrim from its current
 * (interpolated) opacity back to the peak.
 *
 *  - Scrim: opacity scrimCurrent -> 0.32 over 250ms, linear.
 *  - Container: translateY(fromDy) -> translateY(0) over 250ms,
 *    EmphasizedDecelerate.
 */
export const BottomSheetDragSnapBackAnimation = (
    fromDy: number,
    scrimCurrent: number,
): BottomSheetAnimation => ({
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
                { transform: `translateY(${fromDy}px)` },
                { transform: 'translateY(0)' },
            ],
            { duration: 250, easing: Easing.EmphasizedDecelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-commit-close animation. Animates the container from the current
 * drag offset out the bottom of the viewport, and fades the scrim to 0.
 *
 *  - Scrim: opacity scrimCurrent -> 0 over 200ms, linear.
 *  - Container: translateY(fromDy) -> translateY(100%) over 200ms,
 *    EmphasizedAccelerate.
 */
export const BottomSheetDragCommitCloseAnimation = (
    fromDy: number,
    scrimCurrent: number,
): BottomSheetAnimation => ({
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
                { transform: `translateY(${fromDy}px)` },
                { transform: 'translateY(100%)' },
            ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})
