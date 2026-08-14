/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export type TabVariant = 'primary' | 'secondary' | 'floating'
export const TabVariant = {
    Primary: 'primary',
    Secondary: 'secondary',
    Floating: 'floating',
} as const satisfies Record<string, TabVariant>

export interface ITab extends LitElement {
    active: boolean
    selected: boolean
    variant: TabVariant
    hasIcon: boolean
    iconOnly: boolean
}
