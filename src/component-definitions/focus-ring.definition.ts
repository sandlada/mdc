/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, Duration, Shape } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

export const FocusRingDefinition = {
    'active-width'  : `8px`,
    'color'         : Color.Secondary,
    'duration'      : Duration.Long4,
    'inward-offset' : `0px`,
    'outward-offset': `2px`,
    'width'         : `3px`,
    ...createLogicShapeTokens('--mdc-focus-ring', {
        'shape': Shape.Full
    }, ['shape'], false)
} as const
