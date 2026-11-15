import type { LitElement } from 'lit'

export const NavigationBarVariant = {
    Vertical  : 'vertical',
    Horizontal : 'horizontal',
    VerticalXR: 'vertical-xr'
} as const
export type NavigationBarVariant = (typeof NavigationBarVariant)[keyof typeof NavigationBarVariant]

export interface INavigationBar extends LitElement {
    variant: NavigationBarVariant
}
