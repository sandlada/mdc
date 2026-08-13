/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale, Space } from '@sandlada/mdk'
import { createStyleDefinition }   from '../utils/tokens/create-style-definition'
import { Color }                   from '../utils/tokens/theme'

export const BadgeDefinition = createStyleDefinition({
    // Large
    'large-container-color'                : Color.Error,
    'large-container-shape'                : Shape.Full,
    'large-container-size'                 : `16px`,
    'large-label-text-color'               : Color.OnError,
    'large-label-text-font'                : Typescale.LabelSmall.Font,
    'large-label-text-line-height'         : Typescale.LabelSmall.LineHeight,
    'large-label-text-size'                : Typescale.LabelSmall.FontSize,
    'large-label-text-tracking'            : Typescale.LabelSmall.Tracking,
    'large-label-text-weight'              : Typescale.LabelSmall.FontWeight,
    'large-container-block-leading-space'  : Space.Space0,
    'large-container-block-trailing-space' : Space.Space0,
    'large-container-inline-leading-space' : Space.Space50,
    'large-container-inline-trailing-space': Space.Space50,

    // Small
    'small-container-color'                : Color.Error,
    'small-container-shape'                : Shape.Full,
    'small-container-size'                 : `6px`,
    'small-container-block-leading-space'  : Space.Space25,
    'small-container-block-trailing-space' : Space.Space25,
    'small-container-inline-leading-space' : Space.Space25,
    'small-container-inline-trailing-space': Space.Space25,
})
