/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const FocusRingDefinition = createStyleDefinition({
    'active-width'          : `8px`,
    'color'                 : Color.Secondary,
    'color-reduced-contrast': Color.Outline,
    'duration'              : Duration.Long4,
    'inward-offset'         : `0px`,
    'outward-offset'        : `2px`,
    'width'                 : `3px`,

    'shape-start-start': Shape.Full,
    'shape-start-end': Shape.Full,
    'shape-end-start': Shape.Full,
    'shape-end-end': Shape.Full,
})
