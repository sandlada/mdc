/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { OverlayTreeManager } from './overlay-tree'

export const OverlayPlacements = {
    Top: 'top',
    TopStart: 'top-start',
    TopEnd: 'top-end',
    Bottom: 'bottom',
    BottomStart: 'bottom-start',
    BottomEnd: 'bottom-end',
    Left: 'left',
    LeftStart: 'left-start',
    LeftEnd: 'left-end',
    Right: 'right',
    RightStart: 'right-start',
    RightEnd: 'right-end',
} as const
export type OverlayPlacements = (typeof OverlayPlacements)[keyof typeof OverlayPlacements]

export const OverlayDismissReasons = {
    OutsideClick: 'outside-click',
    Escape: 'escape',
    AnchorClick: 'anchor-click',
    PointerLeave: 'pointer-leave',
    Scroll: 'scroll',
    Programmatic: 'programmatic',
    Exclusive: 'exclusive',
} as const
export type OverlayDismissReasons = (typeof OverlayDismissReasons)[keyof typeof OverlayDismissReasons]

export type OverlayDirection = 'top' | 'bottom' | 'left' | 'right'

export interface IOverlayControllerOptions {
    /** Optional explicit node ID; auto-generated when omitted. */
    id?: string
    /** Optional explicit parent overlay ID; auto-discovered from DOM ancestry when omitted. */
    getParentOverlayId?: () => string | null | undefined
    /** Optional OverlayTree instance; defaults to the host document’s tree. */
    tree?: OverlayTreeManager
    /** Returns the floating surface element to position and animate. */
    getSurfaceElement: () => HTMLElement | null | undefined
    /** Returns the anchor element when not using virtual `(x, y)` coordinates. */
    getAnchorElement: () => HTMLElement | null | undefined
    /** Optional directional arrow element. */
    getArrowElement?: () => HTMLElement | null | undefined
    /** Additional elements ignored by outside-click dismiss. */
    getDismissIgnoreElements?: () => ReadonlyArray<HTMLElement | null | undefined>
    /** Preferred placement. */
    getPlacement: () => OverlayPlacements
    /** Offset in pixels between anchor and surface. */
    getOffset: () => number
    /** Whether flip middleware is disabled. */
    getDisableFlip?: () => boolean
    /** Whether open/close WAAPI animations are skipped. */
    getQuick?: () => boolean
    /** Whether scrolling dismisses the overlay. */
    getCloseOnScroll?: () => boolean
    /** Whether focus returns to the previously focused element on Escape/programmatic close. */
    shouldRestoreFocus?: () => boolean
    /** Optional sibling exclusion group name (e.g. `'mdc-context-menu'`). */
    exclusiveGroup?: string
    /** Invoked whenever open state changes. */
    onOpenChange: (open: boolean) => void
    /** Invoked when Floating UI resolves the effective placement. */
    onResolvedPlacementChange?: (placement: OverlayPlacements) => void
    /** Cancelable hook before opening; return `false` to abort. */
    onBeforeShow?: () => boolean
    /** Hook after opening completes. */
    onShown?: () => void
    /** Cancelable hook before closing; return `false` to abort. */
    onBeforeHide?: (reason: OverlayDismissReasons) => boolean
    /** Hook after closing completes. */
    onHidden?: (reason: OverlayDismissReasons) => void
}
