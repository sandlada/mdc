import type { LitElement } from 'lit'

export type Direction  = 'vertical' | 'horizonal' | 'vertical-xr'
export const Direction = {
    Vertical  : 'vertical',
    Horizonal : 'horizonal',
    VerticalXR: 'vertical-xr'
} as const satisfies Record<string, Direction>

/**
 * Which viewport/document edge the bar is docked to. The slide-out direction
 * is derived from this value:
 * - `top`    → slides up (out the top)
 * - `bottom` → slides down (out the bottom)
 * - `left`   → slides left (out the left)
 * - `right`  → slides right (out the right)
 *
 * @deprecated Use `Placement` from `EdgeSlideController` instead.
 */
export type Edge  = 'top' | 'bottom' | 'left' | 'right'
export const Edge = {
    Top   : 'top',
    Bottom: 'bottom',
    Left  : 'left',
    Right : 'right',
} as const satisfies Record<string, Edge>

/**
 * How the bar hides when `close()` is called.
 * - `full` → host height/width collapses to `0` (fully removed from layout).
 * - `peek` → host collapses to `peekSize`; most content translates outside the
 *   clipped host, leaving a small sliver visible (MD3 docked pattern).
 *
 * @deprecated `EdgeSlideController` derives peek/full mode from `floating`.
 */
export type HideMode  = 'full' | 'peek'
export const HideMode = {
    Full: 'full',
    Peek: 'peek',
} as const satisfies Record<string, HideMode>

/**
 * Public interface for `MDCNavigationBar`.
 * The component now focuses solely on Material Design 3 variant rendering.
 *
 * For imperative show/close and scroll-driven auto-hide, attach an
 * {@link EdgeSlideController} from `src/utils/controller/edge-slide-controller.ts`.
 */
export interface INavigationBar extends LitElement {
    variant: Direction
}
