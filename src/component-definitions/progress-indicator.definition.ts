import { Color, Shape } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

const shape = {
    'active-indicator-shape': Shape.Full,
    'track-shape': Shape.Full,
    'stop-indicator-shape': Shape.Full,
} as const

const shared = {
    'active-indicator-color': Color.Primary,
    'track-color': Color.SecondaryContainer,
    'stop-indicator-color': Color.Primary,
} as const

export const LinearProgressIndicatorDefinition = {
    ...shared,
    ...createLogicShapeTokens('--mdc-linear-progress', shape, 'all', false),
    'height': `4px`,
    'with-wave-height': `10px`,
    'active-indicator-thickness': `4px`,
    'track-thickness': `4px`,
    'stop-indicator-size': `4px`,
    'track-active-indicator-space': `4px`,
    'stop-indicator-trailing-space': `0px`,
    'wave-amplitude': `3px`,
    'wave-wavelength': `40px`,
    'indeterminate-wave-wavelength': `20px`,
} as const

export const CircularProgressIndicatorDefinition = {
    ...shared,
    ...createLogicShapeTokens('--mdc-circular-progress', shape, 'all', false),
    'height': `40px`,
    'size-with-wave': `48px`,
    'active-indicator-thickness': `4px`,
    'track-thickness': `4px`,
    'stop-indicator-size': `4px`,
    'track-active-indicator-amplitude': `1.6px`,
    'active-indicator-wave-wavelength': `20px`,
} as const
