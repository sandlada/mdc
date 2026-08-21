/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export const CardVariant = {
    Elevated: 'elevated',
    Filled: 'filled',
    Outlined: 'outlined',
} as const
export type CardVariant = typeof CardVariant[keyof typeof CardVariant]

export const CardShape = {
    Round: 'round',
    Square: 'square',
} as const
export type CardShape = typeof CardShape[keyof typeof CardShape]

export interface ICard {
    variant: CardVariant
    interactive: boolean
    disabled: boolean
    horizontal: boolean
    shape: CardShape
    href: string
    target: string
    cardTabIndex: number
}
