/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'

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

/*
 * Docked-out keyframes take explicit pixel offsets from the host, which
 * resolves them against the container's RENDERED width (capped at the
 * viewport by its max-width) so the animated end state matches the CSS
 * rest exactly — the width token alone overshoots on narrow viewports.
 * Percentage transforms must NOT be used on the container: Chrome
 * resolves a starting-style percentage transform straight to the
 * destination frame and never paints the slide.
 */

/**
 * The programmatic open animation. Slides the container in from `fromDx`
 * (the container's live offset at the moment show() engaged — the closed
 * resting offset for a fresh enter, or the mid-flight value of an
 * interrupted exit).
 *
 * The transform MUST be driven by WAAPI, and the sheet's `.open` class
 * MUST be in place BEFORE the native dialog is first shown: Chrome only
 * paints the entrance transform when the dialog's first displayed frame
 * already carries the open state. Showing the dialog first and flipping
 * the class afterwards leaves `getComputedStyle` animating the transform
 * while the painted geometry stays pinned at the resting position
 * (right-docked sheets); CSS transitions do not paint this motion at all.
 * See `BaseSideSheet.show()` for the ordering.
 *
 *  - Container: translateX(fromDx) -> translateX(0) over 500ms, Emphasized.
 */
export const SideSheetOpenAnimation = (fromDx: number): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: 'translateX(0px)' },
            ],
            { duration: 500, easing: Easing.Emphasized.ToCSSValue() },
        ],
    ],
})

/**
 * The programmatic close animation. Mirror of `SideSheetOpenAnimation`
 * with shorter duration and the accelerating easing curve. `toDx` is the
 * signed closed resting offset resolved by the host (peek sliver for
 * `handle-mode="peek"`, rendered width otherwise).
 *
 *  - Container: translateX(fromDx) -> translateX(toDx) over 150ms,
 *    EmphasizedAccelerate.
 */
export const SideSheetCloseAnimation = (
    fromDx: number,
    toDx: number,
): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: `translateX(${toDx}px)` },
            ],
            { duration: 150, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-commit-close animation. Animates the container from the current
 * drag offset to the signed closed resting offset (`toDx`, resolved by the
 * host), and fades the scrim to 0.
 *
 *  - Scrim: opacity scrimCurrent -> 0 over 200ms, linear.
 *  - Container: translateX(fromDx) -> translateX(toDx) over 200ms,
 *    EmphasizedAccelerate.
 */
export const SideSheetDragCommitCloseAnimation = (
    fromDx: number,
    toDx: number,
    scrimCurrent: number,
): SideSheetAnimation => ({
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
                { transform: `translateX(${toDx}px)` },
            ],
            { duration: 200, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-snap-back animation. Animates the container from the current drag
 * offset back to its resting open position (translateX 0), and the scrim from
 * its current (interpolated) opacity back to the peak.
 *
 *  - Scrim: opacity scrimCurrent -> 0.32 over 250ms, linear.
 *  - Container: translateX(fromDx) -> translateX(0) over 250ms,
 *    EmphasizedDecelerate.
 */
export const SideSheetDragSnapBackAnimation = (
    fromDx: number,
    scrimCurrent: number,
): SideSheetAnimation => ({
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
 * The drag-snap-to-peek animation (peek mode, closed sheet). Animates the
 * container from the current drag offset back to the peek sliver offset
 * (`toDx`, resolved by the host as `rendered width - peek width`, signed).
 *
 *  - Container: translateX(fromDx) -> translateX(toDx) over 250ms,
 *    EmphasizedDecelerate.
 */
export const SideSheetDragSnapToPeekAnimation = (
    fromDx: number,
    toDx: number,
): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: `translateX(${toDx}px)` },
            ],
            { duration: 250, easing: Easing.EmphasizedDecelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The reveal-commit animation (peek mode). Animates the container from the
 * current drag offset to the open resting position while the sheet switches
 * from peeked to open.
 *
 *  - Container: translateX(fromDx) -> translateX(0) over 300ms,
 *    EmphasizedDecelerate.
 */
export const SideSheetDragRevealOpenAnimation = (
    fromDx: number,
): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: 'translateX(0)' },
            ],
            { duration: 300, easing: Easing.EmphasizedDecelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-relocate (edge flip) animation. The container starts from the
 * visual position the drag handed over — expressed against the NEW dock —
 * and animates to the open resting position while the dock anchor swaps.
 *
 *  - Container: translateX(newDx) -> translateX(0) over 300ms,
 *    EmphasizedDecelerate.
 */
export const SideSheetDragRelocateAnimation = (
    newDx: number,
): SideSheetAnimation => ({
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
