import { Color, ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

export const BasicDialogDefinition = {
    ...createLogicShapeTokens('--mdc-basic-dialog', {
        'container-shape': Shape.ExtraLarge,
    }, 'all', false),
    'container-color': Color.SurfaceContainerHigh,
    'container-elevation': ElevationLevel.Level3,
    'action-label-font': Typescale.LabelLargeFont,
    'action-label-line-height': Typescale.LabelLargeLineHeight,
    'action-label-size': Typescale.LabelLargeSize,
    'action-label-weight': Typescale.LabelLargeWeight,
    'action-label-tracking': Typescale.LabelLargeTracking,
    'action-label-color': Color.Primary,
    'icon-size': `24px`,
    'icon-color': Color.Secondary,
    'headline-label-font': Typescale.HeadlineSmallFont,
    'headline-label-line-height': Typescale.HeadlineSmallLineHeight,
    'headline-label-size': Typescale.HeadlineSmallSize,
    'headline-label-weight': Typescale.HeadlineSmallWeight,
    'headline-label-tracking': Typescale.HeadlineSmallTracking,
    'headline-label-color': Color.OnSurface,
    'supporting-text-label-font': Typescale.BodyMediumFont,
    'supporting-text-label-line-height': Typescale.BodyMediumLineHeight,
    'supporting-text-label-size': Typescale.BodyMediumSize,
    'supporting-text-label-weight': Typescale.BodyMediumWeight,
    'supporting-text-label-tracking': Typescale.BodyMediumTracking,
    'supporting-text-label-color': Color.OnSurfaceVariant,
    // Hovered
    'hovered-action-label-color': Color.Primary,
    'hovered-action-state-layer-color': Color.Primary,
    'hovered-action-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Focused
    'focused-action-label-color': Color.Primary,
    'focused-action-state-layer-color': Color.Primary,
    'focused-action-state-layer-opacity': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-action-label-color': Color.Primary,
    'pressed-action-state-layer-color': Color.Primary,
    'pressed-action-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

export const FullscreenDialogDefinition = {
    ...createLogicShapeTokens('--mdc-basic-dialog', {
        'container-shape': Shape.None,
    }, 'all', false),
    'on-scroll-container-color': Color.SurfaceContainer,
    'container-color': Color.SurfaceContainerHigh,
    'container-elevation': ElevationLevel.Level0,
    'header-container-height': `56px`,
    'header-container-color': Color.Surface,
    'header-container-elevation': ElevationLevel.Level0,
    'header-on-scroll-container-elevation': ElevationLevel.Level2,
    'action-label-font': Typescale.LabelLargeFont,
    'action-label-line-height': Typescale.LabelLargeLineHeight,
    'action-label-size': Typescale.LabelLargeSize,
    'action-label-weight': Typescale.LabelLargeWeight,
    'action-label-tracking': Typescale.LabelLargeTracking,
    'action-label-color': Color.Primary,
    'header-icon-size': `24px`,
    'header-icon-color': Color.OnSurface,
    'headline-label-font': Typescale.TitleLargeFont,
    'headline-label-line-height': Typescale.TitleLargeLineHeight,
    'headline-label-size': Typescale.TitleLargeSize,
    'headline-label-weight': Typescale.TitleLargeWeight,
    'headline-label-tracking': Typescale.TitleLargeTracking,
    'headline-label-color': Color.OnSurface,
    // Hovered
    'hovered-header-action-label-color': Color.Primary,
    'hovered-header-action-state-layer-color': Color.Primary,
    'hovered-header-action-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Focused
    'focused-header-action-label-color': Color.Primary,
    'focused-header-action-state-layer-color': Color.Primary,
    'focused-header-action-state-layer-opacity': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-header-action-label-color': Color.Primary,
    'pressed-header-action-state-layer-color': Color.Primary,
    'pressed-header-action-state-layer-opacity': State.PressedStateLayerOpacity,
} as const
