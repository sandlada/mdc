export interface INavigationTab {
    name           : string
    value          : string
    href           : string | null
    navigationScope: string
    checked        : boolean
    disabled       : boolean
}
