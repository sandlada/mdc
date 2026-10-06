/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { SideSheetPosition } from './side-sheet.interface'

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
 * Pixel resting offsets are token-driven so the keyframes stay in sync
 * with the CSS closed state. Percentage transforms must NOT be used on
 * the container: Chrome resolves a starting-style percentage transform
 * straight to the destination frame and never paints the slide.
 */
const dockOutOffset = (position: SideSheetPosition, extra = ''): string =>
    position === 'left'
        ? `translateX(calc(-1 * (var(--_enabled-container-width)${extra})))`
        : `translateX(calc(var(--_enabled-container-width)${extra}))`

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
 * with shorter duration and the accelerating easing curve. The end offset
 * resolves against the container width token, exactly matching the CSS
 * closed resting value.
 *
 *  - Container: translateX(fromDx) -> token-width offset over 150ms,
 *    EmphasizedAccelerate.
 */
export const SideSheetCloseAnimation = (
    position: SideSheetPosition,
    fromDx: number,
): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: dockOutOffset(position) },
            ],
            { duration: 150, easing: Easing.EmphasizedAccelerate.ToCSSValue() },
        ],
    ],
})

/**
 * The drag-commit-close animation. Animates the container from the current
 * drag offset out the docked viewport edge, and fades the scrim to 0.
 *
 *  - Scrim: opacity scrimCurrent -> 0 over 200ms, linear.
 *  - Container: translateX(fromDx) -> token-width offset over 200ms,
 *    EmphasizedAccelerate.
 */
export const SideSheetDragCommitCloseAnimation = (
    position: SideSheetPosition,
    fromDx: number,
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
                { transform: dockOutOffset(position) },
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
 * container from the current drag offset back to the peek sliver offset.
 * `restPx` is the container's push-out rest value (`W - peekWidth`).
 *
 *  - Container: translateX(fromDx) -> peek offset over 250ms,
 *    EmphasizedDecelerate.
 */
export const SideSheetDragSnapToPeekAnimation = (
    position: SideSheetPosition,
    fromDx: number,
): SideSheetAnimation => ({
    container: [
        [
            [
                { transform: `translateX(${fromDx}px)` },
                { transform: dockOutOffset(position, ' - var(--_peeked-container-width)') },
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
