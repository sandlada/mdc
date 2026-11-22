/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

export const PaneScaffoldDefinition = createStyleDefinition({
    'enabled-separator-color': Color.OutlineVariant,
    'hovered-separator-color': Color.OnSurfaceVariant,
    'focused-separator-color': Color.Primary,
    'enabled-handle-color': Color.OnSurfaceVariant,
    'hovered-handle-color': Color.OnSurface,
    'pressed-handle-color': Color.Primary,
    'handle-inline-size': '4px',
    'handle-block-size': '48px',
    'handle-min-touch-inline-size': '24px',
    'pane-motion-duration': '250ms',
    'enabled-levitated-container-color': Color.SurfaceContainerHigh,
    'enabled-levitated-content-color': Color.OnSurface,
    'enabled-scrim-color': Color.Scrim,
    'enabled-scrim-opacity': 0.32,
})
