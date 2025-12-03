
export interface INavigationDrawerContext {
    currentLabelName: Readonly<string | null>
    setCurrentLabelName: (label: string) => void
    currentUrl: Readonly<string | null>
    setCurrentUrl: (url: string) => void
    labels: Readonly<Array<string>>
}

export const NavigationDrawerContext = Symbol('glare-navigation-drawer-context')
