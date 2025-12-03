/**
 * @license
 * Copyright 2024 glare-labs & bre97-web
 * SPDX-License-Identifier: MIT
 */

export type TButtonTarget = '_blank' | '_parent' | '_self' | '_top'

export const ButtonTarget = {
    Blank: '_blank',
    Parent: '_parent',
    Self: '_self',
    Top: '_top',
} as const
