/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for `mdc-context-menu` (Material Design 3 Expressive).
 */
const ContextMenuSharedTokens = {
    ...expandShape('enabled-container-shape')(Shape.Large),
    ...expandShape('enabled-item-shape')(Shape.Small),
    ...expandPadding('enabled-container-padding')({ block: '6px', inline: '6px' }),
    ...expandTypescale('enabled-item-label')(Typescale.LabelLarge),
    ...expandTypescale('enabled-item-shortcut')(Typescale.LabelMedium),
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),

    'enabled-container-elevation': ElevationLevel.Level3,
    'enabled-container-min-width': `196px`,
    'enabled-container-max-width': `320px`,
    'enabled-container-max-height': `calc(100vh - 32px)`,

    'enabled-item-height': `44px`,
    'enabled-item-padding-inline': `12px`,
    'enabled-item-gap': `12px`,
    'enabled-icon-size': `20px`,

    'enabled-divider-color': Color.OutlineVariant,
    'enabled-divider-thickness': `1px`,
    'enabled-group-label-height': `32px`,

    'disabled-content-opacity': `0.38`,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
}

export const StandardContextMenuDefinition = createStyleDefinition({
    ...ContextMenuSharedTokens,

    'enabled-container-color': Color.SurfaceContainerLow,
    'enabled-item-label-color': Color.OnSurface,
    'enabled-item-icon-color': Color.OnSurfaceVariant,
    'enabled-item-shortcut-color': Color.OnSurfaceVariant,
    'enabled-item-selected-container-color': Color.SecondaryContainer,
    'enabled-item-selected-label-color': Color.OnSecondaryContainer,
    'enabled-item-destructive-color': Color.Error,
    'enabled-group-label-color': Color.OnSurfaceVariant,

    'hovered-state-layer-color': Color.OnSurface,
    'focused-state-layer-color': Color.OnSurface,
    'pressed-state-layer-color': Color.OnSurface,
})

export const VibrantContextMenuDefinition = createStyleDefinition({
    ...ContextMenuSharedTokens,

    'enabled-container-color': Color.TertiaryContainer,
    'enabled-item-label-color': Color.OnTertiaryContainer,
    'enabled-item-icon-color': Color.OnTertiaryContainer,
    'enabled-item-shortcut-color': Color.OnTertiaryContainer,
    'enabled-item-selected-container-color': Color.Tertiary,
    'enabled-item-selected-label-color': Color.OnTertiary,
    'enabled-item-destructive-color': Color.Error,
    'enabled-group-label-color': Color.OnTertiaryContainer,

    'hovered-state-layer-color': Color.OnTertiaryContainer,
    'focused-state-layer-color': Color.OnTertiaryContainer,
    'pressed-state-layer-color': Color.OnTertiaryContainer,
})

export const ContextMenuDefinitions = {
    Standard: StandardContextMenuDefinition,
    Vibrant: VibrantContextMenuDefinition,
} as const
