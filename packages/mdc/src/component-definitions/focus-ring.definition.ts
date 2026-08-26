/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Duration, Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const FocusRingDefinition = createStyleDefinition({
    'active-width'          : [`8px`, null, null, null, null],
    'color'                 : [Color.Secondary, null, null, null, null],
    'color-reduced-contrast': [Color.Outline, null, null, null, null],
    'duration'              : [Duration.Long4, null, null, null, null],
    'inward-offset'         : [`0px`, null, null, null, null],
    'outward-offset'        : [`2px`, null, null, null, null],
    'width'                 : [`3px`, null, null, null, null],

    'shape-start-start': [Shape.Full, null, null, null, null],
    'shape-start-end'  : [Shape.Full, null, null, null, null],
    'shape-end-start'  : [Shape.Full, null, null, null, null],
    'shape-end-end'    : [Shape.Full, null, null, null, null],
})
