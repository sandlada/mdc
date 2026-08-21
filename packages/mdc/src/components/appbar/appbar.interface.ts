/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export type AppBarVariant =
    | 'small'
    | 'center-aligned'
    | 'medium-flexible'
    | 'large-flexible'
    | 'medium'
    | 'large'
    | 'search'

export const AppBarVariant = {
    Small         : 'small',
    CenterAligned : 'center-aligned',
    MediumFlexible: 'medium-flexible',
    LargeFlexible : 'large-flexible',
    Medium        : 'medium',
    Large         : 'large',
    Search        : 'search',
} as const satisfies Record<string, AppBarVariant>

export type AppBarAlignment = 'start' | 'center'

export const AppBarAlignment = {
    Start : 'start',
    Center: 'center',
} as const satisfies Record<string, AppBarAlignment>

export interface IAppBar extends LitElement {
    variant: AppBarVariant
    alignment: AppBarAlignment
    headline: string
    subtitle: string
    scrolled: boolean
    scrollTarget: HTMLElement | Window | string | null
}
