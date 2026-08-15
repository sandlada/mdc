/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-tab` per Material Design 3 and the
 * MD3 Expressive (MD3E) additions.
 *
 * Three variants are provided:
 * - `primary`   : the standard MD3 primary tab — a full-width cell with a
 *                 3dp active indicator bar at the bottom edge. Icon and label
 *                 stack vertically by default.
 * - `secondary` : the MD3 secondary tab — inline icon + label with a 2dp
 *                 full-width active indicator.
 * - `floating`  : the MD3E Expressive floating tab — a pill-shaped cell whose
 *                 active indicator is a filled, fully-rounded container that
 *                 slides between tabs.
 *
 * @link
 * https://m3.material.io/components/tabs/overview
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

interface ITabScheme {
    // Container
    'enabled-container-color': string
    'enabled-container-elevation': string
    'container-height': string
    'container-shape-start-start': string
    'container-shape-start-end': string
    'container-shape-end-start': string
    'container-shape-end-end': string
    'container-block-leading-space': string
    'container-block-trailing-space': string
    'container-inline-leading-space': string
    'container-inline-trailing-space': string
    'with-icon-and-label-text-container-height': string

    // Active indicator
    'enabled-active-indicator-color': string
    'active-indicator-height': string
    'active-indicator-shape-start-start': string
    'active-indicator-shape-start-end': string
    'active-indicator-shape-end-start': string
    'active-indicator-shape-end-end': string
    'active-indicator-inline-leading-space': string
    'active-indicator-inline-trailing-space': string
    'active-indicator-block-leading-space': string
    'active-indicator-block-trailing-space': string

    // Label
    'label-font': string
    'label-size': string
    'label-line-height': string
    'label-weight': string
    'label-tracking': string
    'enabled-label-color-unselected': string
    'enabled-label-color-selected': string
    'hovered-label-color': string
    'focused-label-color': string
    'pressed-label-color': string

    // Icon
    'icon-size': string
    'enabled-icon-color-unselected': string
    'enabled-icon-color-selected': string
    'hovered-icon-color': string
    'focused-icon-color': string
    'pressed-icon-color': string

    // State layers — unselected
    'enabled-state-layer-color-unselected': string
    'hovered-state-layer-color-unselected': string
    'focused-state-layer-color-unselected': string
    'pressed-state-layer-color-unselected': string
    'enabled-state-layer-opacity-unselected': string
    'hovered-state-layer-opacity-unselected': string
    'focused-state-layer-opacity-unselected': string
    'pressed-state-layer-opacity-unselected': string

    // State layers — selected
    'enabled-state-layer-color-selected': string
    'hovered-state-layer-color-selected': string
    'focused-state-layer-color-selected': string
    'pressed-state-layer-color-selected': string
    'enabled-state-layer-opacity-selected': string
    'hovered-state-layer-opacity-selected': string
    'focused-state-layer-opacity-selected': string
    'pressed-state-layer-opacity-selected': string

    'spacing-between-icon-and-label': string
}

// Untyped base so mdk token objects (`Color`, `Shape`, `State`, `Typescale`,
// `ElevationLevel`) are resolved to CSS values before the typed wrappers below
// re-check the scheme shape.
const SharedScheme = createStyleDefinition({
    'enabled-container-color': `transparent`,
    'enabled-container-elevation': ElevationLevel.Level0,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `16px`,
    'container-inline-trailing-space': `16px`,

    'active-indicator-inline-leading-space': `0px`,
    'active-indicator-inline-trailing-space': `0px`,
    'active-indicator-block-leading-space': `0px`,
    'active-indicator-block-trailing-space': `0px`,

    'label-font': Typescale.TitleSmall.Font,
    'label-size': Typescale.TitleSmall.FontSize,
    'label-line-height': Typescale.TitleSmall.LineHeight,
    'label-weight': Typescale.TitleSmall.FontWeight,
    'label-tracking': Typescale.TitleSmall.Tracking,
    'enabled-label-color-unselected': Color.OnSurfaceVariant,
    'enabled-label-color-selected': Color.Primary,
    'hovered-label-color': Color.OnSurfaceVariant,
    'focused-label-color': Color.OnSurfaceVariant,
    'pressed-label-color': Color.OnSurfaceVariant,

    'icon-size': `24px`,
    'enabled-icon-color-unselected': Color.OnSurfaceVariant,
    'enabled-icon-color-selected': Color.Primary,
    'hovered-icon-color': Color.OnSurfaceVariant,
    'focused-icon-color': Color.OnSurfaceVariant,
    'pressed-icon-color': Color.OnSurfaceVariant,

    'enabled-state-layer-color-unselected': Color.OnSurface,
    'hovered-state-layer-color-unselected': Color.OnSurface,
    'focused-state-layer-color-unselected': Color.OnSurface,
    'pressed-state-layer-color-unselected': Color.OnSurface,
    'enabled-state-layer-opacity-unselected': `0`,
    'hovered-state-layer-opacity-unselected': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity-unselected': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity-unselected': State.PressedStateLayerOpacity,

    'enabled-state-layer-color-selected': Color.OnSurface,
    'hovered-state-layer-color-selected': Color.OnSurface,
    'focused-state-layer-color-selected': Color.OnSurface,
    'pressed-state-layer-color-selected': Color.OnSurface,
    'enabled-state-layer-opacity-selected': `0`,
    'hovered-state-layer-opacity-selected': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity-selected': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity-selected': State.PressedStateLayerOpacity,

    'spacing-between-icon-and-label': `8px`,
})

const PrimaryTabValues = createStyleDefinition({
    ...SharedScheme,

    'container-height': `48px`,
    'with-icon-and-label-text-container-height': `64px`,
    'container-shape-start-start': Shape.None,
    'container-shape-start-end': Shape.None,
    'container-shape-end-start': Shape.None,
    'container-shape-end-end': Shape.None,

    'enabled-active-indicator-color': Color.Primary,
    'active-indicator-height': `3px`,
    'active-indicator-shape-start-start': Shape.None,
    'active-indicator-shape-start-end': Shape.None,
    'active-indicator-shape-end-start': Shape.None,
    'active-indicator-shape-end-end': Shape.None,

    'spacing-between-icon-and-label': `2px`,
})

export const PrimaryTabDefinition = createStyleDefinition<Partial<ITabScheme>>(PrimaryTabValues)

const SecondaryTabValues = createStyleDefinition({
    ...SharedScheme,

    'container-height': `48px`,
    'container-shape-start-start': Shape.None,
    'container-shape-start-end': Shape.None,
    'container-shape-end-start': Shape.None,
    'container-shape-end-end': Shape.None,

    'enabled-active-indicator-color': Color.Primary,
    'active-indicator-height': `2px`,
    'active-indicator-shape-start-start': Shape.None,
    'active-indicator-shape-start-end': Shape.None,
    'active-indicator-shape-end-start': Shape.None,
    'active-indicator-shape-end-end': Shape.None,
})

export const SecondaryTabDefinition = createStyleDefinition<Partial<ITabScheme>>(SecondaryTabValues)

const FloatingTabValues = createStyleDefinition({
    ...SharedScheme,

    'container-height': `56px`,
    'container-shape-start-start': Shape.Full,
    'container-shape-start-end': Shape.Full,
    'container-shape-end-start': Shape.Full,
    'container-shape-end-end': Shape.Full,
    'container-inline-leading-space': `8px`,
    'container-inline-trailing-space': `8px`,

    'enabled-active-indicator-color': Color.SecondaryContainer,
    'active-indicator-height': `56px`,
    'active-indicator-shape-start-start': Shape.Full,
    'active-indicator-shape-start-end': Shape.Full,
    'active-indicator-shape-end-start': Shape.Full,
    'active-indicator-shape-end-end': Shape.Full,

    'enabled-label-color-unselected': Color.OnSurfaceVariant,
    'enabled-label-color-selected': Color.OnSecondaryContainer,
    'enabled-icon-color-unselected': Color.OnSurfaceVariant,
    'enabled-icon-color-selected': Color.OnSecondaryContainer,

    'enabled-state-layer-color-selected': Color.OnSecondaryContainer,
    'hovered-state-layer-color-selected': Color.OnSecondaryContainer,
    'focused-state-layer-color-selected': Color.OnSecondaryContainer,
    'pressed-state-layer-color-selected': Color.OnSecondaryContainer,
})

export const FloatingTabDefinition = createStyleDefinition<Partial<ITabScheme>>(FloatingTabValues)
