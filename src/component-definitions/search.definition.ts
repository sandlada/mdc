import { Color, ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils'

export const SearchBarDefinition = {
    'container-inline-leading-space': `16px`,
    'container-inline-trailing-space': `16px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-width-minimum': `360px`,
    'container-width-maximum': `720px`,
    'leading-icon-and-label-between-space': `16px`,
    'trailing-icon-and-label-between-space': `16px`,
    'trailing-icons-between-space': `16px`,

    'avatar-size'                : `30px`,
    'container-color'            : Color.SurfaceContainerHigh,
    'container-elevation'        : ElevationLevel.Level0,
    'container-height'           : `56px`,
    'leading-icon-color'         : Color.OnSurface,
    'trailing-icon-color'        : Color.OnSurfaceVariant,
    'supporting-text-color'      : Color.OnSurfaceVariant,
    'supporting-text-font'       : Typescale.BodyLargeFont,
    'supporting-text-line-height': Typescale.BodyLargeLineHeight,
    'supporting-text-size'       : Typescale.BodyLargeSize,
    'supporting-text-weight'     : Typescale.BodyLargeWeight,
    'supporting-text-tracking'   : Typescale.BodyLargeTracking,
    'input-text-color'           : Color.OnSurface,
    'input-text-font'            : Typescale.BodyLargeFont,
    'input-text-line-height'     : Typescale.BodyLargeLineHeight,
    'input-text-size'            : Typescale.BodyLargeSize,
    'input-text-weight'          : Typescale.BodyLargeWeight,
    'input-text-tracking'        : Typescale.BodyLargeTracking,
    // Hovered
    'hovered-state-layer-color'    : Color.OnSurface,
    'hovered-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'hovered-supporting-text-color': Color.OnSurfaceVariant,
    // Pressed
    'Pressed-state-layer-color'    : Color.OnSurface,
    'Pressed-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'Pressed-supporting-text-color': Color.OnSurfaceVariant,
    // Focused
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,

    ...createLogicShapeTokens('--mdc-search-bar', {
        'avatar-shape'               : Shape.Full,
        'container-shape'            : Shape.Full,
    }, 'all', false),
} as const
