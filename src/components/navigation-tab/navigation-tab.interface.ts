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

export interface INavigationTab extends LitElement {
    name           : string
    value          : string
    href           : string | null
    navigationScope: string
    checked        : boolean
    disabled       : boolean

    variant: NavigationTabVariant
}
