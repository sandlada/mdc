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
export type NavigationRailVariant
    = 'collapsed'
    | 'expanded-docked'
    | 'expanded-floating'
    | 'xr'
export const NavigationRailVariant = {
    Collapsed       : 'collapsed',
    ExpandedDocked  : 'expanded-docked',
    ExpandedFloating: 'expanded-floating',
    XR              : 'xr',
} as const satisfies Record<string, NavigationRailVariant>

/**
 * Layout of the destinations while the rail is collapsed.
 *
 * - `'vertical'`: icon on top, label underneath.
 * - `'round'`: icon only, inside a round container.
 */
export type NavigationRailCollapsedLayout
    = 'vertical'
    | 'round'
export const NavigationRailCollapsedLayout = {
    Vertical: 'vertical',
    Round   : 'round',
} as const satisfies Record<string, NavigationRailCollapsedLayout>

export type NavigationRailAlignment
    = 'top'
    | 'center'
    | 'bottom'
export const NavigationRailAlignment = {
    Top   : 'top',
    Center: 'center',
    Bottom: 'bottom',
} as const satisfies Record<string, NavigationRailAlignment>

export interface INavigationRail extends LitElement {
    quick           : boolean
    variant         : NavigationRailVariant
    open            : boolean
    alignment       : NavigationRailAlignment
    collapsedLayout : NavigationRailCollapsedLayout
    returnValue     : string
    noFocusTrap     : boolean

    expand()                       : Promise<void>
    collapse(returnValue?: string) : Promise<void>
    show()                         : Promise<void>
    hide(returnValue?: string)     : Promise<void>
    close(returnValue?: string)    : Promise<void>
    toggle()                       : Promise<void>
}
