import type { LitElement } from 'lit'

export const NavigationBarVariant = {
    Vertical  : 'vertical',
    Horizontal: 'horizontal',
    VerticalXR: 'vertical-xr',
} as const
export type NavigationBarVariant = (typeof NavigationBarVariant)[keyof typeof NavigationBarVariant]

export const NavigationBarScrollBehavior = {
    Pinned    : 'pinned',
    ExitAlways: 'exit-always',
} as const
export type NavigationBarScrollBehavior = (typeof NavigationBarScrollBehavior)[keyof typeof NavigationBarScrollBehavior]

export const NavigationBarVisibilityChangeEvent = 'navigation-bar-visibility-change'

export interface INavigationBarVisibilityChangeDetail {
    collapsed: boolean
}

export interface INavigationBar extends LitElement {
    variant       : NavigationBarVariant
    scrollBehavior: NavigationBarScrollBehavior
    collapsed     : boolean
    scrollTarget  : HTMLElement | Window | string | null

    show()  : void
    hide()  : void
    toggle(): void
}
