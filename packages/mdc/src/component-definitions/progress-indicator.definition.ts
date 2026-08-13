/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

const shared = {
    'active-indicator-shape-start-start': Shape.Full,
    'active-indicator-shape-start-end': Shape.Full,
    'active-indicator-shape-end-start': Shape.Full,
    'active-indicator-shape-end-end': Shape.Full,
    'track-shape-start-start': Shape.Full,
    'track-shape-start-end': Shape.Full,
    'track-shape-end-start': Shape.Full,
    'track-shape-end-end': Shape.Full,
    'stop-indicator-shape-start-start': Shape.Full,
    'stop-indicator-shape-start-end': Shape.Full,
    'stop-indicator-shape-end-start': Shape.Full,
    'stop-indicator-shape-end-end': Shape.Full,
    'active-indicator-color': Color.Primary,
    'track-color'           : Color.SecondaryContainer,
    'stop-indicator-color'  : Color.Primary,
} as const

export const LinearProgressIndicatorDefinition = createStyleDefinition({
    ...shared,
    'height'                       : `4px`,
    'with-wave-height'             : `10px`,
    'active-indicator-thickness'   : `4px`,
    'track-thickness'              : `4px`,
    'stop-indicator-size'          : `4px`,
    'track-active-indicator-space' : `4px`,
    'stop-indicator-trailing-space': `0px`,
    'wave-amplitude'               : `3px`,
    'wave-wavelength'              : `16px`,
    'indeterminate-wave-wavelength': `20px`,
})

export const CircularProgressIndicatorDefinition = createStyleDefinition({
    ...shared,
    'height'                          : `40px`,
    'size-with-wave'                  : `48px`,
    'active-indicator-thickness'      : `4px`,
    'track-thickness'                 : `4px`,
    'stop-indicator-size'             : `4px`,
    'track-active-indicator-amplitude': `1.6px`,
    'active-indicator-wave-wavelength': `20px`,
})
