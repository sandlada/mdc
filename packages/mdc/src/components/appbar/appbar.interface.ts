/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export const AppBarVariant = {
    Small         : 'small',
    CenterAligned : 'center-aligned',
    MediumFlexible: 'medium-flexible',
    LargeFlexible : 'large-flexible',
    Medium        : 'medium',
    Large         : 'large',
    Search        : 'search',
} as const
export type AppBarVariant = (typeof AppBarVariant)[keyof typeof AppBarVariant]

export const AppBarAlignment = {
    Start : 'start',
    Center: 'center',
} as const
export type AppBarAlignment = (typeof AppBarAlignment)[keyof typeof AppBarAlignment]

export interface IAppBar extends LitElement {
    variant: AppBarVariant
    alignment: AppBarAlignment
    headline: string
    subtitle: string
    scrolled: boolean
    scrollTarget: HTMLElement | Window | string | null
}
