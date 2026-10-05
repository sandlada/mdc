/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, Typescale, Space } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandPadding, expandTypescale } from '../../utils/style'

export const BadgeDefinition = createStyleDefinition({
    // Shape & Color (Static / Shared across sizes)
    ...expandShape('container-shape')(Shape.Full),
    'container-color': Color.Error,

    // Size-differentiated Tokens (small / large records)
    'container-size': { small: '6px', large: '16px' },
    ...expandPadding('container-padding')({
        small: [Space.Space25, Space.Space25],
        large: [Space.Space0, Space.Space50],
    }),

    // Typography
    'label-color': Color.OnError,
    ...expandTypescale('label')(Typescale.LabelSmall),
})
