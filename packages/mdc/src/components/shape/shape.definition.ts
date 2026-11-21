/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

/**
 * Default pixel sizes corresponding to each `ShapeSize` preset.
 * Shared with `BaseShape` for initial SSR / pre-layout SVG path calculation.
 */
export const ShapeSizePixels = {
    'extra-small': 24,
    'small': 36,
    'medium': 48,
    'large': 72,
    'extra-large': 96,
} as const

export const ShapeDefinition = createStyleDefinition({
    // Size scale
    'container-size': {
        'extra-small': `${ShapeSizePixels['extra-small']}px`,
        'small': `${ShapeSizePixels['small']}px`,
        'medium': `${ShapeSizePixels['medium']}px`,
        'large': `${ShapeSizePixels['large']}px`,
        'extra-large': `${ShapeSizePixels['extra-large']}px`,
    },

    // Outline & Focus indicator
    'outline-width': '1px',
    'focus-outline-width': State.FocusIndicator.Thickness,
    'focus-outline-color': Color.Secondary,

    // Elevation drop shadow
    'elevated-shadow-offset-y': '2px',
    'elevated-shadow-blur': '6px',
    'elevated-shadow-color': `color-mix(in srgb, ${Color.Shadow} 22%, transparent)`,

    // Variant base tokens (primary color role default)
    'enabled-filled-container-color': Color.Primary,
    'enabled-filled-content-color': Color.OnPrimary,

    'enabled-tonal-container-color': Color.PrimaryContainer,
    'enabled-tonal-content-color': Color.OnPrimaryContainer,

    'enabled-outlined-container-color': 'transparent',
    'enabled-outlined-content-color': Color.OnSurface,
    'enabled-outlined-outline-color': Color.OutlineVariant,

    'enabled-elevated-container-color': Color.SurfaceContainerLow,
    'enabled-elevated-content-color': Color.Primary,

    'enabled-surface-container-color': Color.SurfaceContainerHighest,
    'enabled-surface-content-color': Color.OnSurface,

    'enabled-transparent-container-color': 'transparent',
    'enabled-transparent-content-color': Color.OnSurface,

    // Secondary color role overrides
    'enabled-filled-container-color-secondary': Color.Secondary,
    'enabled-filled-content-color-secondary': Color.OnSecondary,
    'enabled-tonal-container-color-secondary': Color.SecondaryContainer,
    'enabled-tonal-content-color-secondary': Color.OnSecondaryContainer,
    'enabled-outlined-outline-color-secondary': Color.Secondary,
    'enabled-elevated-content-color-secondary': Color.Secondary,

    // Tertiary color role overrides
    'enabled-filled-container-color-tertiary': Color.Tertiary,
    'enabled-filled-content-color-tertiary': Color.OnTertiary,
    'enabled-tonal-container-color-tertiary': Color.TertiaryContainer,
    'enabled-tonal-content-color-tertiary': Color.OnTertiaryContainer,
    'enabled-outlined-outline-color-tertiary': Color.Tertiary,
    'enabled-elevated-content-color-tertiary': Color.Tertiary,

    // Error color role overrides
    'enabled-filled-container-color-error': Color.Error,
    'enabled-filled-content-color-error': Color.OnError,
    'enabled-tonal-container-color-error': Color.ErrorContainer,
    'enabled-tonal-content-color-error': Color.OnErrorContainer,
    'enabled-outlined-outline-color-error': Color.Error,
    'enabled-elevated-content-color-error': Color.Error,

    // Surface color role overrides
    'enabled-filled-container-color-surface': Color.InverseSurface,
    'enabled-filled-content-color-surface': Color.InverseOnSurface,
    'enabled-tonal-container-color-surface': Color.SurfaceContainerHigh,
    'enabled-tonal-content-color-surface': Color.OnSurface,
    'enabled-outlined-outline-color-surface': Color.Outline,
    'enabled-elevated-content-color-surface': Color.OnSurface,

    // State layers & disabled
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'disabled-container-opacity': '0.12',
    'disabled-content-opacity': '0.38',
})
