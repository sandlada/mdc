/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * The four visual states of the navigation rail.
 *
 * - `'collapsed'`: docked, narrow rail with icon-above-label destinations.
 * - `'expanded-docked'`: docked, wide rail with icon-next-to-label destinations.
 * - `'expanded-floating'`: floating overlay with scrim, always wide.
 * - `'xr'`: docked XR rail with XR destinations.
 */
export const NavigationRailVariant = {
    Collapsed       : 'collapsed',
    ExpandedDocked  : 'expanded-docked',
    ExpandedFloating: 'expanded-floating',
    XR              : 'xr',
} as const
export type NavigationRailVariant = (typeof NavigationRailVariant)[keyof typeof NavigationRailVariant]

/**
 * Vertical alignment of destination items within the rail.
 */
export const NavigationRailAlignment = {
    Top   : 'top',
    Center: 'center',
    Bottom: 'bottom',
} as const
export type NavigationRailAlignment = (typeof NavigationRailAlignment)[keyof typeof NavigationRailAlignment]

export const NavigationRailScrollBehavior = {
    Pinned    : 'pinned',
    ExitAlways: 'exit-always',
} as const
export type NavigationRailScrollBehavior = (typeof NavigationRailScrollBehavior)[keyof typeof NavigationRailScrollBehavior]

export const NavigationRailVisibilityChangeEvent = 'navigation-rail-visibility-change'

export interface INavigationRailVisibilityChangeDetail {
    railHidden: boolean
}

export interface INavigationRail extends LitElement {
    quick           : boolean
    variant         : NavigationRailVariant
    open            : boolean
    railHidden      : boolean
    scrollBehavior  : NavigationRailScrollBehavior
    scrollTarget    : HTMLElement | Window | string | null
    alignment       : NavigationRailAlignment
    returnValue     : string
    noFocusTrap     : boolean

    expand()                       : Promise<void>
    collapse(returnValue?: string) : Promise<void>
    show()                         : Promise<void>
    hide(returnValue?: string)     : Promise<void>
    close(returnValue?: string)    : Promise<void>
    toggle()                       : Promise<void>
    showRail()                     : void
    hideRail()                     : void
    toggleRail()                   : void
}
