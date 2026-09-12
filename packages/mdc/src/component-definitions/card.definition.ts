/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { ElevationLevel, Shape, State } from '@sandlada/mdk'
import {
    Color,
    createStyleDefinition,
    defineSchema,
    expandPadding,
    expandShape,
} from '../utils/styles'

export const CardSchema = defineSchema([
    ['enabled', 'hovered', 'focused', 'pressed', 'dragged', 'disabled'],
    ['round', 'square'],
] as const)

const shared = {
    ...expandShape('container-shape')({
        round: Shape.Medium,
        square: Shape.None,
    }),

    ...expandPadding('container-padding')(`16px`),

    'container-margin-inline-start': `0px`,
    'container-margin-inline-end': `0px`,
    'container-margin-block-start': `0px`,
    'container-margin-block-end': `0px`,

    'enabled-icon-color': Color.Primary,
    'icon-size': `24px`,
} as const

export const ElevatedCardDefinition = createStyleDefinition(CardSchema)({
    ...shared,

    'container-color': {
        enabled: Color.SurfaceContainerLow,
        disabled: Color.Surface,
    },
    'container-elevation': {
        enabled: ElevationLevel.Level1.Value,
        hovered: ElevationLevel.Level2.Value,
        focused: ElevationLevel.Level1.Value,
        pressed: ElevationLevel.Level1.Value,
        dragged: ElevationLevel.Level4.Value,
        disabled: ElevationLevel.Level1.Value,
    },
    'container-shadow-color': {
        enabled: Color.Shadow,
    },
    'container-opacity': {
        disabled: `0.38`,
    },

    // State Layer (Ripple & Dragged)
    'state-layer-color': {
        hovered: Color.OnSurface,
        focused: Color.OnSurface,
        pressed: Color.OnSurface,
        dragged: Color.OnSurface,
    },
    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity,
        dragged: State.DraggedStateLayerOpacity,
    },

    // Focus Indicator
    'indicator-color': {
        focused: Color.Secondary,
    },
    'indicator-offset': {
        focused: State.FocusIndicator.OuterOffset,
    },
    'indicator-thickness': {
        focused: State.FocusIndicator.Thickness,
    },
})

export const FilledCardDefinition = createStyleDefinition(CardSchema)({
    ...shared,

    'container-color': {
        enabled: Color.SurfaceContainerHighest,
        disabled: Color.SurfaceVariant,
    },
    'container-elevation': {
        enabled: ElevationLevel.Level0,
        hovered: ElevationLevel.Level1,
        focused: ElevationLevel.Level0,
        pressed: ElevationLevel.Level0,
        dragged: ElevationLevel.Level3,
        disabled: ElevationLevel.Level0,
    },
    'container-shadow-color': {
        enabled: Color.Shadow,
    },
    'container-opacity': {
        disabled: `0.38`,
    },

    // State Layer (Ripple & Dragged)
    'state-layer-color': {
        hovered: Color.OnSurface,
        focused: Color.OnSurface,
        pressed: Color.OnSurface,
        dragged: Color.OnSurface,
    },
    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity,
        dragged: State.DraggedStateLayerOpacity,
    },

    // Focus Indicator
    'indicator-color': {
        focused: Color.Secondary,
    },
    'indicator-offset': {
        focused: State.FocusIndicator.OuterOffset,
    },
    'indicator-thickness': {
        focused: State.FocusIndicator.Thickness,
    },
})

export const OutlinedCardDefinition = createStyleDefinition(CardSchema)({
    ...shared,

    'container-color': {
        enabled: Color.Surface,
        disabled: Color.Surface,
    },
    'container-elevation': {
        enabled: ElevationLevel.Level0,
        hovered: ElevationLevel.Level1,
        focused: ElevationLevel.Level0,
        pressed: ElevationLevel.Level0,
        dragged: ElevationLevel.Level3,
        disabled: ElevationLevel.Level0,
    },
    'container-shadow-color': {
        enabled: Color.Shadow,
    },
    'container-opacity': {
        disabled: `0.38`,
    },

    'outline-color': {
        enabled: Color.OutlineVariant,
        hovered: Color.OutlineVariant,
        focused: Color.OnSurface,
        pressed: Color.OutlineVariant,
        dragged: Color.OutlineVariant,
        disabled: Color.Outline,
    },
    'outline-opacity': {
        disabled: `0.12`,
    },
    'outline-width': `1px`,

    // State Layer (Ripple & Dragged)
    'state-layer-color': {
        hovered: Color.OnSurface,
        focused: Color.OnSurface,
        pressed: Color.OnSurface,
        dragged: Color.OnSurface,
    },
    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity,
        dragged: State.DraggedStateLayerOpacity,
    },

    // Focus Indicator
    'indicator-color': {
        focused: Color.Secondary,
    },
    'indicator-offset': {
        focused: State.FocusIndicator.OuterOffset,
    },
    'indicator-thickness': {
        focused: State.FocusIndicator.Thickness,
    },
})

export const CardDefinitionVariants = {
    'elevated': ElevatedCardDefinition,
    'filled': FilledCardDefinition,
    'outlined': OutlinedCardDefinition,
} as const
