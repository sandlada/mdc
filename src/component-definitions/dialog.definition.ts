/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const BasicDialogDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.ExtraLarge,
    'container-shape-start-end': Shape.ExtraLarge,
    'container-shape-end-start': Shape.ExtraLarge,
    'container-shape-end-end': Shape.ExtraLarge,
    'container-color'                  : Color.SurfaceContainerHigh,
    'container-elevation'              : ElevationLevel.Level3,
    'action-label-font'                : Typescale.LabelLarge.Font,
    'action-label-line-height'         : Typescale.LabelLarge.LineHeight,
    'action-label-size'                : Typescale.LabelLarge.FontSize,
    'action-label-weight'              : Typescale.LabelLarge.FontWeight,
    'action-label-tracking'            : Typescale.LabelLarge.Tracking,
    'action-label-color'               : Color.Primary,
    'icon-size'                        : `24px`,
    'icon-color'                       : Color.Secondary,
    'headline-label-font'              : Typescale.HeadlineSmall.Font,
    'headline-label-line-height'       : Typescale.HeadlineSmall.LineHeight,
    'headline-label-size'              : Typescale.HeadlineSmall.FontSize,
    'headline-label-weight'            : Typescale.HeadlineSmall.FontWeight,
    'headline-label-tracking'          : Typescale.HeadlineSmall.Tracking,
    'headline-label-color'             : Color.OnSurface,
    'supporting-text-label-font'       : Typescale.BodyMedium.Font,
    'supporting-text-label-line-height': Typescale.BodyMedium.LineHeight,
    'supporting-text-label-size'       : Typescale.BodyMedium.FontSize,
    'supporting-text-label-weight'     : Typescale.BodyMedium.FontWeight,
    'supporting-text-label-tracking'   : Typescale.BodyMedium.Tracking,
    'supporting-text-label-color'      : Color.OnSurfaceVariant,
    // Hovered
    'hovered-action-label-color'        : Color.Primary,
    'hovered-action-state-layer-color'  : Color.Primary,
    'hovered-action-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Focused
    'focused-action-label-color'        : Color.Primary,
    'focused-action-state-layer-color'  : Color.Primary,
    'focused-action-state-layer-opacity': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-action-label-color'        : Color.Primary,
    'pressed-action-state-layer-color'  : Color.Primary,
    'pressed-action-state-layer-opacity': State.PressedStateLayerOpacity,
})

export const FullscreenDialogDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.None,
    'container-shape-start-end': Shape.None,
    'container-shape-end-start': Shape.None,
    'container-shape-end-end': Shape.None,
    'on-scroll-container-color'           : Color.SurfaceContainer,
    'container-color'                     : Color.SurfaceContainerHigh,
    'container-elevation'                 : ElevationLevel.Level0,
    'header-container-height'             : `56px`,
    'header-container-color'              : Color.Surface,
    'header-container-elevation'          : ElevationLevel.Level0,
    'header-on-scroll-container-elevation': ElevationLevel.Level2,
    'action-label-font'                   : Typescale.LabelLarge.Font,
    'action-label-line-height'            : Typescale.LabelLarge.LineHeight,
    'action-label-size'                   : Typescale.LabelLarge.FontSize,
    'action-label-weight'                 : Typescale.LabelLarge.FontWeight,
    'action-label-tracking'               : Typescale.LabelLarge.Tracking,
    'action-label-color'                  : Color.Primary,
    'header-icon-size'                    : `24px`,
    'header-icon-color'                   : Color.OnSurface,
    'headline-label-font'                 : Typescale.TitleLarge.Font,
    'headline-label-line-height'          : Typescale.TitleLarge.LineHeight,
    'headline-label-size'                 : Typescale.TitleLarge.FontSize,
    'headline-label-weight'               : Typescale.TitleLarge.FontWeight,
    'headline-label-tracking'             : Typescale.TitleLarge.Tracking,
    'headline-label-color'                : Color.OnSurface,
    // Hovered
    'hovered-header-action-label-color'        : Color.Primary,
    'hovered-header-action-state-layer-color'  : Color.Primary,
    'hovered-header-action-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Focused
    'focused-header-action-label-color'        : Color.Primary,
    'focused-header-action-state-layer-color'  : Color.Primary,
    'focused-header-action-state-layer-opacity': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-header-action-label-color'        : Color.Primary,
    'pressed-header-action-state-layer-color'  : Color.Primary,
    'pressed-header-action-state-layer-opacity': State.PressedStateLayerOpacity,
})
