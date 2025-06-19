/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

export const IconButtonAppearance = {
    Filled: 'filled',
    Outlined: 'outlined',
    FilledTonal: 'filled-tonal',
    Standard: 'standard',
} as const

export type TIconButtonAppearance = typeof IconButtonAppearance[keyof typeof IconButtonAppearance]
