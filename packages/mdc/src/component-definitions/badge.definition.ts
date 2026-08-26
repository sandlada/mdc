/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, Typescale, Space } from '@sandlada/mdk'
import { createStyleDefinition }   from '../utils/tokens/create-style-definition'
import { Color }                   from '../utils/tokens/theme'

/**
 * variants:
 * - enabled
 * - disabled
 */
export const BadgeDefinition = createStyleDefinition({
    // Large With Label
    'large-container-shape-start-start'   : [Shape.Full, null, null, null, null],
    'large-container-shape-start-end'     : [Shape.Full, null, null, null, null],
    'large-container-shape-end-start'     : [Shape.Full, null, null, null, null],
    'large-container-shape-end-end'       : [Shape.Full, null, null, null, null],
    'large-container-color'               : [Color.Error, null, null, null, null],
    'large-container-size'                : [`16px`, null, null, null, null],
    'large-label-color'                   : [Color.OnError, null, null, null, null],
    'large-label-font'                    : [Typescale.LabelSmall.Font, null, null, null, null],
    'large-label-leading'                 : [Typescale.LabelSmall.LineHeight, null, null, null, null],
    'large-label-size'                    : [Typescale.LabelSmall.FontSize, null, null, null, null],
    'large-label-tracking'                : [Typescale.LabelSmall.Tracking, null, null, null, null],
    'large-label-weight'                  : [Typescale.LabelSmall.FontWeight, null, null, null, null],
    'large-container-padding-block-start' : [Space.Space0, null, null, null, null],
    'large-container-padding-block-end'   : [Space.Space0, null, null, null, null],
    'large-container-padding-inline-start': [Space.Space50, null, null, null, null],
    'large-container-padding-inline-end'  : [Space.Space50, null, null, null, null],

    // Small
    'small-container-shape-start-start'   : [Shape.Full, null, null, null, null],
    'small-container-shape-start-end'     : [Shape.Full, null, null, null, null],
    'small-container-shape-end-start'     : [Shape.Full, null, null, null, null],
    'small-container-shape-end-end'       : [Shape.Full, null, null, null, null],
    'small-container-color'               : [Color.Error, null, null, null, null],
    'small-container-size'                : [`6px`, null, null, null, null],
    'small-container-padding-block-start' : [Space.Space25, null, null, null, null],
    'small-container-padding-block-end'   : [Space.Space25, null, null, null, null],
    'small-container-padding-inline-start': [Space.Space25, null, null, null, null],
    'small-container-padding-inline-end'  : [Space.Space25, null, null, null, null],
})
