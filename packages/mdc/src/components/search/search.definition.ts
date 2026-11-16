/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, Space, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandMargin,
    expandPadding,
    expandShape,
    expandTypescale,
} from '../../utils/style'

/**
 * Style definition for `mdc-search-bar` (MD3 / Android `SearchBar` / Figma).
 *
 * - Height: `56px`
 * - Shape: `Shape.Full` (pill)
 * - Container: `SurfaceContainerHigh`
 * - Typography: `BodyLarge`
 */
export const SearchBarDefinition = createStyleDefinition({
    'enabled-container-height'             : `56px`,
    'enabled-container-color'              : Color.SurfaceContainerHigh,
    'enabled-container-elevation'          : ElevationLevel.Level0,
    ...expandShape('enabled-container-shape')(Shape.Full),
    ...expandPadding('enabled-container-padding')({
        inline: Space.Space100,
        block: Space.Space100,
    }),
    ...expandMargin('enabled-container-margin')(Space.Space0),
    'enabled-container-items-gap'          : `4px`,

    'enabled-leading-icon-color'           : Color.OnSurfaceVariant,
    'enabled-leading-icon-size'            : `24px`,
    'enabled-trailing-icon-color'          : Color.OnSurfaceVariant,
    'enabled-trailing-icon-size'           : `24px`,

    'enabled-avatar-size'                  : `30px`,
    'enabled-avatar-label-color'           : Color.OnPrimary,
    'enabled-avatar-color'                 : Color.Primary,
    ...expandShape('enabled-avatar-shape')(Shape.Full),
    'enabled-avatar-container-width'       : `48px`,
    'enabled-avatar-container-height'      : `48px`,
    'enabled-avatar-container-color'       : `transparent`,
    ...expandShape('enabled-avatar-container-shape')(Shape.Full),
    ...expandPadding('enabled-avatar-container-padding')({
        inline: Space.Space100,
        block: Space.Space0,
    }),
    ...expandMargin('enabled-avatar-container-margin')(Space.Space0),

    ...expandPadding('enabled-content-padding')(Space.Space250),
    ...expandMargin('enabled-content-margin')(Space.Space0),
    'enabled-supporting-text-color'        : Color.OnSurfaceVariant,
    ...expandTypescale('enabled-supporting-text')(Typescale.BodyLarge),
    'enabled-input-text-color'             : Color.OnSurface,
    ...expandTypescale('enabled-input-text')(Typescale.BodyLarge),

    // Hovered
    'hovered-container-color'              : Color.SurfaceContainerHigh,
    'hovered-state-layer-color'            : Color.OnSurfaceVariant,
    'hovered-state-layer-opacity'          : State.HoveredStateLayerOpacity,
    // Pressed
    'pressed-container-color'              : Color.SurfaceContainerHigh,
    'pressed-state-layer-color'            : Color.OnSurfaceVariant,
    'pressed-state-layer-opacity'          : State.PressedStateLayerOpacity,
    // Focused
    'focused-indicator-color'              : Color.Secondary,
    'focused-indicator-thickness'          : State.FocusIndicator.Thickness,
    'focused-indicator-offset'             : State.FocusIndicator.OuterOffset,
    // Disabled
    'disabled-container-color'             : Color.SurfaceContainerHigh,
    'disabled-container-opacity'           : `0.38`,
    'disabled-supporting-text-color'       : Color.OnSurface,
    'disabled-input-text-color'            : Color.OnSurface,
})

/**
 * Style definition for `mdc-search-view` (MD3 / Android `SearchView` / Figma).
 *
 * - Fullscreen header height: `72px`, shape: `Shape.None`
 * - Docked header height: `56px`, shape: `Shape.ExtraLarge` (`28px`), min-width `360px`, max-width `720px`
 * - Container: `SurfaceContainerHigh`, elevation: `Level3` (docked)
 * - Divider: `1px` `OutlineVariant`
 */
export const SearchViewDefinition = createStyleDefinition({
    'enabled-container-color'              : Color.SurfaceContainerHigh,
    'enabled-container-elevation'          : ElevationLevel.Level3,
    ...expandShape('enabled-fullscreen-container-shape')(Shape.None),
    ...expandShape('enabled-docked-container-shape')(Shape.ExtraLarge),

    'enabled-header-height'                : `72px`,
    'enabled-docked-header-height'         : `56px`,
    ...expandPadding('enabled-header-padding')({
        inline: Space.Space100,
        block: Space.Space0,
    }),
    'enabled-header-gap'                   : `4px`,

    'enabled-docked-min-width'             : `360px`,
    'enabled-docked-max-width'             : `720px`,
    'enabled-docked-max-height'            : `480px`,

    'enabled-divider-color'                : Color.OutlineVariant,
    'enabled-divider-thickness'            : `1px`,

    'enabled-leading-icon-color'           : Color.OnSurface,
    'enabled-leading-icon-size'            : `24px`,
    'enabled-trailing-icon-color'          : Color.OnSurfaceVariant,
    'enabled-trailing-icon-size'           : `24px`,

    ...expandPadding('enabled-content-padding')({
        inline: Space.Space100,
        block: Space.Space0,
    }),
    'enabled-supporting-text-color'        : Color.OnSurfaceVariant,
    ...expandTypescale('enabled-supporting-text')(Typescale.BodyLarge),
    'enabled-input-text-color'             : Color.OnSurface,
    ...expandTypescale('enabled-input-text')(Typescale.BodyLarge),

    ...expandPadding('enabled-body-padding')({
        inline: Space.Space0,
        block: Space.Space100,
    }),
})
