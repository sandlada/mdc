/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export type BadgeSize = 'large' | 'small'
export const BadgeSize = {
    Large: 'large',
    Small: 'small',
} as const satisfies Record<string, BadgeSize>

export interface IBadge extends LitElement {
    size: BadgeSize
    value: string | number | null
    label: string | null
    max: number | null
    autoSizeOnZero: boolean
}
