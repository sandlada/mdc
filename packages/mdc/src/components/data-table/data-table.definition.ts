/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

export const DataTableDefinition = createStyleDefinition({
    // Container surface & outline
    'enabled-outlined-container-color'  : Color.Surface,
    'enabled-outlined-outline-color'    : Color.OutlineVariant,
    'enabled-filled-container-color'    : Color.SurfaceContainerLow,
    'enabled-elevated-container-color'  : Color.SurfaceContainerLow,
    'enabled-elevated-shadow-color'     : Color.Shadow,
    'enabled-elevated-elevation'        : ElevationLevel.Level1.Value,
    'outline-width'                     : `1px`,

    ...expandShape('container-shape')(Shape.Medium),

    // Header & toolbar
    'enabled-toolbar-color'             : Color.Surface,
    'enabled-toolbar-label-color'       : Color.OnSurface,
    'enabled-selection-bar-color'       : Color.SecondaryContainer,
    'enabled-selection-bar-label-color' : Color.OnSecondaryContainer,
    'toolbar-height'                    : `64px`,
    'toolbar-padding-inline'            : `16px`,

    // Table header row
    'enabled-header-container-color'    : Color.Surface,
    'enabled-header-label-color'        : Color.OnSurfaceVariant,
    'enabled-header-sorted-label-color' : Color.OnSurface,
    'enabled-sort-icon-color'           : Color.OnSurfaceVariant,
    'enabled-sorted-icon-color'         : Color.OnSurface,
    'header-height': {
        'small' : `44px`,
        'medium': `56px`,
        'large' : `64px`,
    },

    // Body rows & cells
    'enabled-row-container-color'       : `transparent`,
    'enabled-striped-row-color'         : Color.SurfaceContainerLowest,
    'enabled-expanded-row-color'        : Color.SurfaceContainerLow,
    'enabled-sticky-cell-color'         : Color.Surface,
    'enabled-selected-row-color'        : Color.SecondaryContainer,
    'enabled-selected-row-opacity'      : `0.45`,
    'enabled-row-label-color'           : Color.OnSurface,
    'enabled-supporting-text-color'     : Color.OnSurfaceVariant,
    'enabled-divider-color'             : Color.OutlineVariant,
    'row-height': {
        'small' : `40px`,
        'medium': `52px`,
        'large' : `60px`,
    },
    'cell-padding-inline': {
        'small' : `12px`,
        'medium': `16px`,
        'large' : `20px`,
    },
    'checkbox-column-width'             : `56px`,
    'expand-column-width'               : `48px`,
    'sort-icon-size'                    : `18px`,

    // Typography
    ...expandTypescale('toolbar-title')(Typescale.TitleLarge),
    ...expandTypescale('header-label')(Typescale.LabelLarge),
    ...expandTypescale('cell-label')(Typescale.BodyMedium),
    ...expandTypescale('empty-label')(Typescale.BodyMedium),

    // State layers & disabled
    'hovered-state-layer-color'         : Color.OnSurface,
    'hovered-state-layer-opacity'       : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity'       : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity'       : State.PressedStateLayerOpacity,
    'disabled-content-opacity'          : `0.38`,
})
