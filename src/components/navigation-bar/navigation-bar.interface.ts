import type { LitElement } from 'lit'

export type NavigationBarVariant  = 'vertical' | 'horizontal' | 'vertical-xr'
export const NavigationBarVariant = {
    Vertical  : 'vertical',
    Horizontal : 'horizontal',
    VerticalXR: 'vertical-xr'
} as const satisfies Record<string, NavigationBarVariant>

export interface INavigationBar extends LitElement {
    variant: NavigationBarVariant
}
