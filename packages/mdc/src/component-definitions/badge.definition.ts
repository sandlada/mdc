/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, Typescale, Space } from '@sandlada/mdk'
import {
    defineSchema,
    createStyleDefinition,
    Color,
    expandShape,
    expandPadding,
    expandTypescale
} from '../utils/styles'

/**
 * Badge state schema:
 * - small: dot badge (6px)
 * - large: labeled badge (16px)
 */
export const BadgeSchema = defineSchema([
    ['small', 'large']
] as const)

export const BadgeDefinition = createStyleDefinition(BadgeSchema)({
    // Shape & Color (Static / Shared across sizes)
    ...expandShape('container-shape')(Shape.Full),
    'container-color': Color.Error,

    // Size-differentiated Tokens [small, large]
    'container-size': ['6px', '16px'],
    ...expandPadding('container-padding')({
        small: [Space.Space25, Space.Space25],
        large: [Space.Space0, Space.Space50],
    }),

    // Typography
    'label-color': Color.OnError,
    ...expandTypescale('label')(Typescale.LabelSmall),
})
