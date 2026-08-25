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
    'large-container-padding-block-start'                : Space.Space0,
    'large-container-padding-block-end'                  : Space.Space0,
    'large-container-padding-inline-start'                : Space.Space50,
    'large-container-padding-inline-end'                  : Space.Space50,

    // Small
    'enabled-small-container-color'                      : Color.Error,
    'small-container-shape-start-start'                  : Shape.Full,
    'small-container-shape-start-end'                    : Shape.Full,
    'small-container-shape-end-start'                    : Shape.Full,
    'small-container-shape-end-end'                      : Shape.Full,
    'small-container-size'                               : `6px`,
    'small-container-padding-block-start'                : Space.Space25,
    'small-container-padding-block-end'                  : Space.Space25,
    'small-container-padding-inline-start'                : Space.Space25,
    'small-container-padding-inline-end'                  : Space.Space25,
})
