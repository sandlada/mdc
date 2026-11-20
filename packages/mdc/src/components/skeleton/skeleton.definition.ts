/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape } from '../../utils/style'

export const SkeletonDefinition = createStyleDefinition({
    // Surface & shimmer colors (MD3 surface roles, auto light/dark)
    'enabled-container-color'  : Color.SurfaceContainerHighest,
    'enabled-shimmer-color'    : Color.SurfaceContainerLowest,
    'shimmer-opacity'          : `0.65`,

    // Motion
    'shimmer-duration'         : `1600ms`,
    'shimmer-easing'           : `cubic-bezier(0.4, 0, 0.2, 1)`,
    'pulse-duration'           : `1500ms`,
    'pulse-easing'             : `ease-in-out`,
    'pulse-min-opacity'        : `0.45`,
    'reveal-duration'          : `200ms`,

    // Multi-line text layout
    'text-line-gap'            : `8px`,
    'text-last-line-width'     : `60%`,

    // Size presets per variant family
    'text-height': {
        'extra-small': `14px`,
        'small'      : `16px`,
        'medium'     : `20px`,
        'large'      : `26px`,
        'extra-large': `36px`,
    },
    'circular-size': {
        'extra-small': `24px`,
        'small'      : `32px`,
        'medium'     : `40px`,
        'large'      : `56px`,
        'extra-large': `96px`,
    },
    'pill-height': {
        'extra-small': `28px`,
        'small'      : `32px`,
        'medium'     : `40px`,
        'large'      : `48px`,
        'extra-large': `56px`,
    },
    'pill-width': {
        'extra-small': `64px`,
        'small'      : `80px`,
        'medium'     : `96px`,
        'large'      : `120px`,
        'extra-large': `144px`,
    },
    'block-height': {
        'extra-small': `48px`,
        'small'      : `72px`,
        'medium'     : `120px`,
        'large'      : `180px`,
        'extra-large': `240px`,
    },

    // Shapes
    ...expandShape('text-container-shape')(Shape.ExtraSmall),
    ...expandShape('rectangular-container-shape')(Shape.None),
    ...expandShape('rounded-container-shape')(Shape.Medium),
    ...expandShape('circular-container-shape')(Shape.Full),
    ...expandShape('pill-container-shape')(Shape.Full),
})
