/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, Shape, State } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

const sharedShapes = (prefix: string) => createLogicShapeTokens(prefix, {
    'extra-small-container-shape-round'         : Shape.Full,
    'extra-small-container-shape-square'        : Shape.Medium,
    'extra-small-shape-pressed-morph'           : Shape.Small,
    'extra-small-selected-container-shape-round' : Shape.Medium,
    'extra-small-selected-container-shape-square': Shape.Full,

    'small-container-shape-round'         : Shape.Full,
    'small-container-shape-square'        : Shape.Medium,
    'small-shape-pressed-morph'           : Shape.Small,
    'small-selected-container-shape-round' : Shape.Medium,
    'small-selected-container-shape-square': Shape.Full,

    'medium-container-shape-round'         : Shape.Full,
    'medium-container-shape-square'        : Shape.Large,
    'medium-shape-pressed-morph'           : Shape.Medium,
    'medium-selected-container-shape-round' : Shape.Large,
    'medium-selected-container-shape-square': Shape.Full,

    'large-container-shape-round'         : Shape.Full,
    'large-container-shape-square'        : Shape.ExtraLarge,
    'large-shape-pressed-morph'           : Shape.Large,
    'large-selected-container-shape-round' : Shape.ExtraLarge,
    'large-selected-container-shape-square': Shape.Full,

    'extra-large-container-shape-round'         : Shape.Full,
    'extra-large-container-shape-square'        : Shape.ExtraLarge,
    'extra-large-shape-pressed-morph'           : Shape.Large,
    'extra-large-selected-container-shape-round' : Shape.ExtraLarge,
    'extra-large-selected-container-shape-square': Shape.Full,
}, 'all', false)

const shared = {
    'extra-small-container-height'      : `32px`,
    'extra-small-icon-size'             : `20px`,
    'extra-small-narrow-leading-space'  : `4px`,
    'extra-small-narrow-trailing-space' : `4px`,
    'extra-small-default-leading-space' : `6px`,
    'extra-small-default-trailing-space': `6px`,
    'extra-small-wide-leading-space'    : `10px`,
    'extra-small-wide-trailing-space'   : `10px`,
    'extra-small-outline-width'         : `1px`,

    'small-container-height'      : `40px`,
    'small-icon-size'             : `24px`,
    'small-narrow-leading-space'  : `4px`,
    'small-narrow-trailing-space' : `4px`,
    'small-default-leading-space' : `8px`,
    'small-default-trailing-space': `8px`,
    'small-wide-leading-space'    : `14px`,
    'small-wide-trailing-space'   : `14px`,
    'small-outline-width'         : `1px`,

    'medium-container-height'      : `56px`,
    'medium-icon-size'             : `24px`,
    'medium-narrow-leading-space'  : `12px`,
    'medium-narrow-trailing-space' : `12px`,
    'medium-default-leading-space' : `16px`,
    'medium-default-trailing-space': `16px`,
    'medium-wide-leading-space'    : `24px`,
    'medium-wide-trailing-space'   : `24px`,
    'medium-outline-width'         : `1px`,

    'large-container-height'      : `96px`,
    'large-icon-size'             : `32px`,
    'large-narrow-leading-space'  : `16px`,
    'large-narrow-trailing-space' : `16px`,
    'large-default-leading-space' : `32px`,
    'large-default-trailing-space': `32px`,
    'large-wide-leading-space'    : `48px`,
    'large-wide-trailing-space'   : `48px`,
    'large-outline-width'         : `2px`,

    'extra-large-container-height'      : `136px`,
    'extra-large-icon-size'             : `40px`,
    'extra-large-narrow-leading-space'  : `32px`,
    'extra-large-narrow-trailing-space' : `32px`,
    'extra-large-default-leading-space' : `48px`,
    'extra-large-default-trailing-space': `48px`,
    'extra-large-wide-leading-space'    : `72px`,
    'extra-large-wide-trailing-space'   : `72px`,
    'extra-large-outline-width'         : `3px`,
} as const

export const OutlinedIconButtonDefinition = {
    ...shared,
    ...sharedShapes('--mdc-outlined-icon-button'),
    // Enabled
    'outline-color'                    : Color.OutlineVariant,
    'outline-color-toggle-unselected'  : Color.OutlineVariant,
    'outline-color-toggle-selected'    : `transparent`,
    'container-color'                  : `transparent`,
    'container-color-toggle-unselected': `transparent`,
    'container-color-toggle-selected'  : Color.InverseSurface,
    'icon-color'                       : Color.OnSurfaceVariant,
    'icon-color-toggle-unselected'     : Color.OnSurfaceVariant,
    'icon-color-toggle-selected'       : Color.InverseOnSurface,
    // Disabled
    'disabled-outline-color'                      : Color.OutlineVariant,
    'disabled-outline-color-toggle-unselected'    : Color.OutlineVariant,
    'disabled-outline-color-toggle-selected'      : `transparent`,
    'disabled-container-color'                    : `transparent`,
    'disabled-container-color-toggle-unselected'  : `transparent`,
    'disabled-container-color-toggle-selected'    : Color.OnSurface,
    'disabled-container-opacity'                  : `0.1`,
    'disabled-container-opacity-toggle-unselected': `0.1`,
    'disabled-container-opacity-toggle-selected'  : `0.1`,
    'disabled-icon-color'                         : Color.OnSurface,
    'disabled-icon-opacity'                       : `0.38`,
    // Hovered
    'hovered-state-layer-color'                  : Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-icon-color'                         : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-selected'         : Color.InverseOnSurface,
    // Focused
    'focused-state-layer-color'                  : Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-icon-color'                         : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-selected'         : Color.InverseOnSurface,
    // Pressed
    'pressed-state-layer-color'                  : Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-icon-color'                         : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-selected'         : Color.InverseOnSurface,
} as const

export const StandardIconButtonDefinition = {
    ...shared,
    ...sharedShapes('--mdc-standard-icon-button'),
    // Enabled
    'icon-color'                  : Color.OnSurfaceVariant,
    'icon-color-toggle-unselected': Color.OnSurfaceVariant,
    'icon-color-toggle-selected'  : Color.Primary,
    // Disabled
    'disabled-icon-color'  : Color.OnSurface,
    'disabled-icon-opacity': `0.38`,
    // Hovered
    'hovered-state-layer-color'                  : Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-selected'  : Color.Primary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-icon-color'                         : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-selected'         : Color.Primary,
    // Focused
    'focused-state-layer-color'                  : Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-selected'  : Color.Primary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-icon-color'                         : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-selected'         : Color.Primary,
    // Pressed
    'pressed-state-layer-color'                  : Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-selected'  : Color.Primary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-icon-color'                         : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-selected'         : Color.Primary,
} as const

export const FilledIconButtonDefinition = {
    ...shared,
    ...sharedShapes('--mdc-filled-icon-button'),
    // Enabled
    'container-color'                  : Color.Primary,
    'container-color-toggle-unselected': Color.SurfaceContainer,
    'container-color-toggle-selected'  : Color.Primary,
    'icon-color'                       : Color.OnPrimary,
    'icon-color-toggle-unselected'     : Color.OnSurfaceVariant,
    'icon-color-toggle-selected'       : Color.OnPrimary,
    // Disabled
    'disabled-container-color'  : Color.OnSurface,
    'disabled-container-opacity': `0.1`,
    'disabled-icon-color'       : Color.OnSurface,
    'disabled-icon-opacity'     : `0.38`,
    // Hovered
    'hovered-state-layer-color'                  : Color.OnPrimary,
    'hovered-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-icon-color'                         : Color.OnPrimary,
    'hovered-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-selected'         : Color.OnPrimary,
    // Focused
    'focused-state-layer-color'                  : Color.OnPrimary,
    'focused-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-icon-color'                         : Color.OnPrimary,
    'focused-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-selected'         : Color.OnPrimary,
    // Pressed
    'pressed-state-layer-color'                  : Color.OnPrimary,
    'pressed-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-icon-color'                         : Color.OnPrimary,
    'pressed-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-selected'         : Color.OnPrimary,
} as const

export const FilledTonalIconButtonDefinition = {
    ...shared,
    ...sharedShapes('--mdc-filled-tonal-icon-button'),
    // Enabled
    'container-color'                  : Color.SecondaryContainer,
    'container-color-toggle-unselected': Color.SecondaryContainer,
    'container-color-toggle-selected'  : Color.Secondary,
    'icon-color'                       : Color.OnSecondaryContainer,
    'icon-color-toggle-unselected'     : Color.OnSecondaryContainer,
    'icon-color-toggle-selected'       : Color.OnSecondary,
    // Disabled
    'disabled-container-color'  : Color.OnSurface,
    'disabled-container-opacity': `0.1`,
    'disabled-icon-color'       : Color.OnSurface,
    'disabled-icon-opacity'     : `0.38`,
    // Hovered
    'hovered-state-layer-color'                  : Color.OnSecondaryContainer,
    'hovered-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'hovered-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-icon-color'                         : Color.OnSecondaryContainer,
    'hovered-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'hovered-icon-color-toggle-selected'         : Color.OnSecondary,
    // Focused
    'focused-state-layer-color'                  : Color.OnSecondaryContainer,
    'focused-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'focused-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-icon-color'                         : Color.OnSecondaryContainer,
    'focused-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'focused-icon-color-toggle-selected'         : Color.OnSecondary,
    // Pressed
    'pressed-state-layer-color'                  : Color.OnSecondaryContainer,
    'pressed-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'pressed-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-icon-color'                         : Color.OnSecondaryContainer,
    'pressed-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'pressed-icon-color-toggle-selected'         : Color.OnSecondary,
} as const
