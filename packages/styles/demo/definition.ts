/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Demo style definition (badge-proven expander shapes).
 */

import { Shape, Space, Typescale } from '@sandlada/mdk'
import { createStyleDefinition } from '@sandlada/styles/schema'
import { expandPadding, expandShape, expandTypescale } from '@sandlada/styles/tokens'
import { DemoSchema } from './schema.ts'

export const DemoDefinition = createStyleDefinition(DemoSchema)({
    ...expandShape('demo-shape')(Shape.Full),
    'demo-color': 'rebeccapurple',

    'demo-size': ['6px', '16px'],
    ...expandPadding('demo-padding')({
        small: [Space.Space25, Space.Space25],
        large: [Space.Space0, Space.Space50],
    }),

    ...expandTypescale('demo-label')(Typescale.LabelSmall),
})
