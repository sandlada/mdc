/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export const TabVariant = {
    Primary: 'primary',
    Secondary: 'secondary',
    Floating: 'floating',
} as const
export type TabVariant = (typeof TabVariant)[keyof typeof TabVariant]

export interface ITab extends LitElement {
    active: boolean
    selected: boolean
    variant: TabVariant
    hasIcon: boolean
    iconOnly: boolean
}
