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
    'container-color': string
    'container-elevation': string
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
    'active-indicator-color': string
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
    'label-text-font': string
    'label-text-size': string
    'label-text-line-height': string
    'label-text-weight': string
    'label-text-tracking': string
    'unselected-label-color': string
    'selected-label-color': string
    'hovered-label-color': string
    'focused-label-color': string
    'pressed-label-color': string

    // Icon
    'icon-size': string
    'unselected-icon-color': string
    'selected-icon-color': string
    'hovered-icon-color': string
    'focused-icon-color': string
    'pressed-icon-color': string

    // State layers — unselected
    'unselected-enabled-state-layer-color': string
    'unselected-hovered-state-layer-color': string
    'unselected-focused-state-layer-color': string
    'unselected-pressed-state-layer-color': string
    'unselected-enabled-state-layer-opacity': string
    'unselected-hovered-state-layer-opacity': string
    'unselected-focused-state-layer-opacity': string
    'unselected-pressed-state-layer-opacity': string

    // State layers — selected
    'selected-enabled-state-layer-color': string
    'selected-hovered-state-layer-color': string
    'selected-focused-state-layer-color': string
    'selected-pressed-state-layer-color': string
    'selected-enabled-state-layer-opacity': string
    'selected-hovered-state-layer-opacity': string
    'selected-focused-state-layer-opacity': string
    'selected-pressed-state-layer-opacity': string

    'spacing-between-icon-and-label': string
}

// Untyped base so mdk token objects (`Color`, `Shape`, `State`, `Typescale`,
// `ElevationLevel`) are resolved to CSS values before the typed wrappers below
// re-check the scheme shape.
const SharedScheme = createStyleDefinition({
    'container-color': `transparent`,
    'container-elevation': ElevationLevel.Level0,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `16px`,
    'container-inline-trailing-space': `16px`,

    'active-indicator-inline-leading-space': `0px`,
    'active-indicator-inline-trailing-space': `0px`,
    'active-indicator-block-leading-space': `0px`,
    'active-indicator-block-trailing-space': `0px`,

    'label-text-font': Typescale.TitleSmall.Font,
    'label-text-size': Typescale.TitleSmall.FontSize,
    'label-text-line-height': Typescale.TitleSmall.LineHeight,
    'label-text-weight': Typescale.TitleSmall.FontWeight,
    'label-text-tracking': Typescale.TitleSmall.Tracking,
    'unselected-label-color': Color.OnSurfaceVariant,
    'selected-label-color': Color.Primary,
    'hovered-label-color': Color.OnSurfaceVariant,
    'focused-label-color': Color.OnSurfaceVariant,
    'pressed-label-color': Color.OnSurfaceVariant,

    'icon-size': `24px`,
    'unselected-icon-color': Color.OnSurfaceVariant,
    'selected-icon-color': Color.Primary,
    'hovered-icon-color': Color.OnSurfaceVariant,
    'focused-icon-color': Color.OnSurfaceVariant,
    'pressed-icon-color': Color.OnSurfaceVariant,

    'unselected-enabled-state-layer-color': Color.OnSurface,
    'unselected-hovered-state-layer-color': Color.OnSurface,
    'unselected-focused-state-layer-color': Color.OnSurface,
    'unselected-pressed-state-layer-color': Color.OnSurface,
    'unselected-enabled-state-layer-opacity': `0`,
    'unselected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'unselected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'unselected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    'selected-enabled-state-layer-color': Color.OnSurface,
    'selected-hovered-state-layer-color': Color.OnSurface,
    'selected-focused-state-layer-color': Color.OnSurface,
    'selected-pressed-state-layer-color': Color.OnSurface,
    'selected-enabled-state-layer-opacity': `0`,
    'selected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'selected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'selected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,

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

    'active-indicator-color': Color.Primary,
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

    'active-indicator-color': Color.Primary,
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

    'active-indicator-color': Color.SecondaryContainer,
    'active-indicator-height': `56px`,
    'active-indicator-shape-start-start': Shape.Full,
    'active-indicator-shape-start-end': Shape.Full,
    'active-indicator-shape-end-start': Shape.Full,
    'active-indicator-shape-end-end': Shape.Full,

    'unselected-label-color': Color.OnSurfaceVariant,
    'selected-label-color': Color.OnSecondaryContainer,
    'unselected-icon-color': Color.OnSurfaceVariant,
    'selected-icon-color': Color.OnSecondaryContainer,

    'selected-enabled-state-layer-color': Color.OnSecondaryContainer,
    'selected-hovered-state-layer-color': Color.OnSecondaryContainer,
    'selected-focused-state-layer-color': Color.OnSecondaryContainer,
    'selected-pressed-state-layer-color': Color.OnSecondaryContainer,
})

export const FloatingTabDefinition = createStyleDefinition<Partial<ITabScheme>>(FloatingTabValues)
