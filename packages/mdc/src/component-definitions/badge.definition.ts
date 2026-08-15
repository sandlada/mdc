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
    'enabled-large-container-color'                      : Color.Error,
    'large-container-shape-start-start'                  : Shape.Full,
    'large-container-shape-start-end'                    : Shape.Full,
    'large-container-shape-end-start'                    : Shape.Full,
    'large-container-shape-end-end'                      : Shape.Full,
    'large-container-size'                               : `16px`,
    'enabled-large-label-color'                          : Color.OnError,
    'large-label-font'                                   : Typescale.LabelSmall.Font,
    'large-label-line-height'                            : Typescale.LabelSmall.LineHeight,
    'large-label-size'                                   : Typescale.LabelSmall.FontSize,
    'large-label-tracking'                               : Typescale.LabelSmall.Tracking,
    'large-label-weight'                                 : Typescale.LabelSmall.FontWeight,
    'large-container-block-leading-padding-space'        : Space.Space0,
    'large-container-block-trailing-padding-space'       : Space.Space0,
    'large-container-inline-leading-padding-space'       : Space.Space50,
    'large-container-inline-trailing-padding-space'      : Space.Space50,

    // Small
    'enabled-small-container-color'                      : Color.Error,
    'small-container-shape-start-start'                  : Shape.Full,
    'small-container-shape-start-end'                    : Shape.Full,
    'small-container-shape-end-start'                    : Shape.Full,
    'small-container-shape-end-end'                      : Shape.Full,
    'small-container-size'                               : `6px`,
    'small-container-block-leading-padding-space'        : Space.Space25,
    'small-container-block-trailing-padding-space'       : Space.Space25,
    'small-container-inline-leading-padding-space'       : Space.Space25,
    'small-container-inline-trailing-padding-space'      : Space.Space25,
})
