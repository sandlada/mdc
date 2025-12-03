/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

export const SplitButtonAppearance = {
    Filled: 'filled',
    FilledTonal: 'filled-tonal',
    Outlined: 'outlined',
} as const

export type TSplitButtonAppearance = typeof SplitButtonAppearance[keyof typeof SplitButtonAppearance]
