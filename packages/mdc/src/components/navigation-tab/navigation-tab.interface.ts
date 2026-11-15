import type { LitElement } from 'lit'
import type { FormAssociated } from '../../utils/form/form-associated'

export const NavigationTabVariant = {
    BarVertical: 'bar-vertical',
    BarHorizontal: 'bar-horizontal',
    BarXRVertical: 'bar-xr-vertical',
    RailVertical: 'rail-vertical',
    RailHorizontal: 'rail-horizontal',
    RailRound: 'rail-round',
    RailXRVertical: 'rail-xr-vertical',
    RailXRRound: 'rail-xr-round',
    Drawer: 'drawer',
    DrawerHorizontal: 'drawer-horizontal',
} as const
export type NavigationTabVariant = (typeof NavigationTabVariant)[keyof typeof NavigationTabVariant]

export interface INavigationTab extends LitElement, FormAssociated {
    name           : string
    value          : string
    label          : string
    badge          : string
    href           : string | null
    target         : string | null
    navigationScope: string
    checked        : boolean
    defaultChecked : boolean
    disabled       : boolean
    required       : boolean

    variant: NavigationTabVariant
}
