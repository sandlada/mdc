import type { LitElement } from 'lit'

export type NavigationTabVariant
    = 'bar-vertical'
    | 'bar-horizontal'
    | 'bar-xr-vertical'
    | 'rail-vertical'
    | 'rail-horizontal'
    | 'rail-round'
    | 'rail-xr-vertical'
    | 'rail-xr-round'
export const NavigationTabVariant = {
    BarVertical: 'bar-vertical',
    BarHorizontal: 'bar-horizontal',
    BarXRVertical: 'bar-xr-vertical',
    RailVertical: 'rail-vertical',
    RailHorizontal: 'rail-horizontal',
    RailRound: 'rail-round',
    RailXRVertical: 'rail-xr-vertical',
    RailXRRound: 'rail-xr-round',
} as const satisfies Record<string, NavigationTabVariant>

export interface INavigationTab extends LitElement {
    name           : string
    value          : string
    href           : string | null
    navigationScope: string
    checked        : boolean
    disabled       : boolean

    variant: NavigationTabVariant
}
