/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

const shared = (prefix: string) => ({
    ...createLogicShapeTokens(prefix, {
        'small-container-shape' : Shape.Large,
        'medium-container-shape': Shape.LargeIncreased,
        'large-container-shape' : Shape.ExtraLarge,
    }, 'all', false),

    'small-container-height': '56px',
    'small-container-width' : '56px',
    'small-icon-size'       : '24px',

    'medium-container-height': '80px',
    'medium-container-width' : '80px',
    'medium-icon-size'       : '28px',

    'large-container-height': '96px',
    'large-container-width' : '96px',
    'large-icon-size'       : '36px',
}) as const

export const TonalPrimaryFabDefinition = {
    ...shared('--mdc-tonal-primary-fab'),
    // Enabled
    'container-color'       : Color.PrimaryContainer,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnPrimaryContainer,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnPrimaryContainer,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnPrimaryContainer,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnPrimaryContainer,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnPrimaryContainer,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnPrimaryContainer,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnPrimaryContainer,
} as const

export const TonalSecondaryFabDefinition = {
    ...shared('--mdc-tonal-secondary-fab'),
    // Enabled
    'container-color'       : Color.SecondaryContainer,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnSecondaryContainer,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnSecondaryContainer,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnSecondaryContainer,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnSecondaryContainer,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnSecondaryContainer,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnSecondaryContainer,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnSecondaryContainer,
} as const

export const TonalTertiaryFabDefinition = {
    ...shared('--mdc-tonal-tertiary-fab'),
    // Enabled
    'container-color'       : Color.TertiaryContainer,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnTertiaryContainer,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnTertiaryContainer,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnTertiaryContainer,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnTertiaryContainer,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnTertiaryContainer,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnTertiaryContainer,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnTertiaryContainer,
} as const

export const PrimaryFabDefinition = {
    ...shared('--mdc-primary-fab'),
    // Enabled
    'container-color'       : Color.Primary,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnPrimary,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnPrimary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnPrimary,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnPrimary,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnPrimary,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnPrimary,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnPrimary,
} as const

export const SecondaryFabDefinition = {
    ...shared('--mdc-secondary-fab'),
    // Enabled
    'container-color'       : Color.Secondary,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnSecondary,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnSecondary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnSecondary,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnSecondary,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnSecondary,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnSecondary,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnSecondary,
} as const

export const TertiaryFabDefinition = {
    ...shared('--mdc-tertiary-fab'),
    // Enabled
    'container-color'       : Color.Tertiary,
    'container-shadow-color': Color.Shadow,
    'container-elevation'   : ElevationLevel.Level3,
    'icon-color'            : Color.OnTertiary,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level4,
    'hovered-state-layer-color'  : Color.OnTertiary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-icon-color'         : Color.OnTertiary,

    // Focused
    'focused-container-elevation': ElevationLevel.Level3,
    'focused-state-layer-color'  : Color.OnTertiary,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-icon-color'         : Color.OnTertiary,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level3,
    'pressed-state-layer-color'  : Color.OnTertiary,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-icon-color'         : Color.OnTertiary,
} as const

const extendedShared = {
    'small-label-font'       : Typescale.TitleMediumFont,
    'small-label-line-height': Typescale.TitleMediumLineHeight,
    'small-label-size'       : Typescale.TitleMediumSize,
    'small-label-tracking'   : Typescale.TitleMediumTracking,
    'small-label-weight'     : Typescale.TitleMediumWeight,
    'small-leading-space'    : `16px`,
    'small-icon-label-space' : `8px`,
    'small-trailing-space'   : `16px`,

    'medium-label-font'       : Typescale.TitleLargeFont,
    'medium-label-line-height': Typescale.TitleLargeLineHeight,
    'medium-label-size'       : Typescale.TitleLargeSize,
    'medium-label-tracking'   : Typescale.TitleLargeTracking,
    'medium-label-weight'     : Typescale.TitleLargeWeight,
    'medium-leading-space'    : `26px`,
    'medium-icon-label-space' : `12px`,
    'medium-trailing-space'   : `26px`,

    'large-label-font'       : Typescale.HeadlineSmallFont,
    'large-label-line-height': Typescale.HeadlineSmallLineHeight,
    'large-label-size'       : Typescale.HeadlineSmallSize,
    'large-label-tracking'   : Typescale.HeadlineSmallTracking,
    'large-label-weight'     : Typescale.HeadlineSmallWeight,
    'large-leading-space'    : `28px`,
    'large-icon-label-space' : `16px`,
    'large-trailing-space'   : `28px`,
} as const

export const TonalPrimaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnPrimaryContainer,
    'hovered-label-color': Color.OnPrimaryContainer,
    'focused-label-color': Color.OnPrimaryContainer,
    'pressed-label-color': Color.OnPrimaryContainer,
}, { ...TonalPrimaryFabDefinition, ...extendedShared })
export const TonalSecondaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnSecondaryContainer,
    'hovered-label-color': Color.OnSecondaryContainer,
    'focused-label-color': Color.OnSecondaryContainer,
    'pressed-label-color': Color.OnSecondaryContainer,
}, { ...TonalSecondaryFabDefinition, ...extendedShared })
export const TonalTertiaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnTertiaryContainer,
    'hovered-label-color': Color.OnTertiaryContainer,
    'focused-label-color': Color.OnTertiaryContainer,
    'pressed-label-color': Color.OnTertiaryContainer,
}, { ...TonalTertiaryFabDefinition, ...extendedShared })
export const PrimaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnPrimary,
    'hovered-label-color': Color.OnPrimary,
    'focused-label-color': Color.OnPrimary,
    'pressed-label-color': Color.OnPrimary,
}, { ...PrimaryFabDefinition, ...extendedShared })
export const SecondaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnSecondary,
    'hovered-label-color': Color.OnSecondary,
    'focused-label-color': Color.OnSecondary,
    'pressed-label-color': Color.OnSecondary,
}, { ...SecondaryFabDefinition, ...extendedShared })
export const TertiaryExtendedFabDefinition = Object.assign({
    'label-color'        : Color.OnTertiary,
    'hovered-label-color': Color.OnTertiary,
    'focused-label-color': Color.OnTertiary,
    'pressed-label-color': Color.OnTertiary,
}, { ...TertiaryFabDefinition, ...extendedShared })
