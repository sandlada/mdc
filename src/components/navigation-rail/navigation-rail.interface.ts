export type NavigationRailCollapsedVariant
    = 'vertical'
    | 'round'
export const NavigationRailCollapsedVariant = {
    Vertical: 'vertical',
    Round   : 'round',
} as const

export interface INavigationRail {
    quick   : boolean
    expanded: boolean
    modal   : boolean

    xr              : boolean
    collapsedVariant: NavigationRailCollapsedVariant

    returnValue: string

    expand()  : Promise<void>
    collapse(): Promise<void>
}
