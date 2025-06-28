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

export const IconButtonSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const

export type TIconButtonSize = typeof IconButtonSize[keyof typeof IconButtonSize]

export const IconButtonWidth = {
    Narrow: 'narrow',
    Default: 'default',
    Wide: 'wide',
} as const

export type TIconButtonWidth = typeof IconButtonWidth[keyof typeof IconButtonWidth]

export const IconButtonShape = {
    Round: 'round',
    Suare: 'square',
} as const

export type TIconButtonShape = typeof IconButtonShape[keyof typeof IconButtonShape]
