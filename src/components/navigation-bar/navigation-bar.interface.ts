import type { LitElement } from 'lit'

export type Direction = 'vertical' | 'horizonal' | 'vertical-xr'
export const Direction = {
    Vertical: 'vertical',
    Horizonal: 'horizonal',
    VerticalXR: 'vertical-xr'
} as const satisfies Record<string, Direction>

export interface INavigationBar extends LitElement {

}
