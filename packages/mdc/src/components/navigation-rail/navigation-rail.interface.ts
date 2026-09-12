/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export type NavigationRailCollapsedVariant
    = 'vertical'
    | 'round'
export const NavigationRailCollapsedVariant = {
    Vertical: 'vertical',
    Round   : 'round',
} as const satisfies Record<string, NavigationRailCollapsedVariant>

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
    expanded        : boolean
    modal           : boolean
    open            : boolean
    alignment       : NavigationRailAlignment
    xr              : boolean
    collapsedVariant: NavigationRailCollapsedVariant
    returnValue     : string

    expand()                       : Promise<void>
    collapse(returnValue?: string) : Promise<void>
    show()                         : Promise<void>
    hide(returnValue?: string)     : Promise<void>
    close(returnValue?: string)    : Promise<void>
    toggle()                       : Promise<void>
}

