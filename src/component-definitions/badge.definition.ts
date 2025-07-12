/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, Shape, Typescale } from '@sandlada/mdk'

export const BadgeDefinition = {
    'color'                       : Color.Error,
    'large-color'                 : Color.Error,
    'large-label-text-color'      : Color.OnError,
    'large-label-text-font'       : Typescale.LabelSmallFont,
    'large-label-text-line-height': Typescale.LabelSmallLineHeight,
    'large-label-text-size'       : Typescale.LabelSmallSize,
    'large-label-text-tracking'   : Typescale.LabelSmallTracking,
    'large-label-text-weight'     : Typescale.LabelSmallWeight,
    'large-shape'                 : Shape.Full,
    'large-size'                  : `16px`,
    'shape'                       : Shape.Full,
    'size'                        : `6px`,
} as const
