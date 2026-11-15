/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { overrideTokens } from '../../../utils/style'
import type { StandardIconButtonDefinition } from '../../icon-button/icon-button.definition'

export const StandardToolbarIconButtonBridge = overrideTokens<typeof StandardIconButtonDefinition>('--mdc-icon-button')({
    'enabled-container-color'                  : 'var(--_enabled-standard-button-container-color)',
    'enabled-container-color-toggle-unselected': 'var(--_enabled-standard-button-container-color)',
    'enabled-container-color-toggle-selected'  : 'var(--_enabled-standard-selected-button-container-color)',
    'enabled-icon-color'                       : 'var(--_enabled-standard-icon-color)',
    'enabled-icon-color-toggle-unselected'     : 'var(--_enabled-standard-icon-color)',
    'enabled-icon-color-toggle-selected'       : 'var(--_enabled-standard-selected-icon-color)',
    'hovered-icon-color'                       : 'var(--_enabled-standard-icon-color)',
    'hovered-icon-color-toggle-unselected'     : 'var(--_enabled-standard-icon-color)',
    'hovered-icon-color-toggle-selected'       : 'var(--_enabled-standard-selected-icon-color)',
    'focused-icon-color'                       : 'var(--_enabled-standard-icon-color)',
    'focused-icon-color-toggle-unselected'     : 'var(--_enabled-standard-icon-color)',
    'focused-icon-color-toggle-selected'       : 'var(--_enabled-standard-selected-icon-color)',
    'pressed-icon-color'                       : 'var(--_enabled-standard-icon-color)',
    'pressed-icon-color-toggle-unselected'     : 'var(--_enabled-standard-icon-color)',
    'pressed-icon-color-toggle-selected'       : 'var(--_enabled-standard-selected-icon-color)',
    'hovered-state-layer-color'                : 'var(--_hovered-standard-state-layer-color)',
    'hovered-state-layer-color-toggle-unselected': 'var(--_hovered-standard-state-layer-color)',
    'hovered-state-layer-color-toggle-selected'  : 'var(--_hovered-standard-selected-state-layer-color)',
    'focused-state-layer-color'                : 'var(--_focused-standard-state-layer-color)',
    'focused-state-layer-color-toggle-unselected': 'var(--_focused-standard-state-layer-color)',
    'focused-state-layer-color-toggle-selected'  : 'var(--_focused-standard-selected-state-layer-color)',
    'pressed-state-layer-color'                : 'var(--_pressed-standard-state-layer-color)',
    'pressed-state-layer-color-toggle-unselected': 'var(--_pressed-standard-state-layer-color)',
    'pressed-state-layer-color-toggle-selected'  : 'var(--_pressed-standard-selected-state-layer-color)',
})()

export const VibrantToolbarIconButtonBridge = overrideTokens<typeof StandardIconButtonDefinition>('--mdc-icon-button')({
    'enabled-container-color'                  : 'var(--_enabled-vibrant-button-container-color)',
    'enabled-container-color-toggle-unselected': 'var(--_enabled-vibrant-button-container-color)',
    'enabled-container-color-toggle-selected'  : 'var(--_enabled-vibrant-selected-button-container-color)',
    'enabled-icon-color'                       : 'var(--_enabled-vibrant-icon-color)',
    'enabled-icon-color-toggle-unselected'     : 'var(--_enabled-vibrant-icon-color)',
    'enabled-icon-color-toggle-selected'       : 'var(--_enabled-vibrant-selected-icon-color)',
    'hovered-icon-color'                       : 'var(--_enabled-vibrant-icon-color)',
    'hovered-icon-color-toggle-unselected'     : 'var(--_enabled-vibrant-icon-color)',
    'hovered-icon-color-toggle-selected'       : 'var(--_enabled-vibrant-selected-icon-color)',
    'focused-icon-color'                       : 'var(--_enabled-vibrant-icon-color)',
    'focused-icon-color-toggle-unselected'     : 'var(--_enabled-vibrant-icon-color)',
    'focused-icon-color-toggle-selected'       : 'var(--_enabled-vibrant-selected-icon-color)',
    'pressed-icon-color'                       : 'var(--_enabled-vibrant-icon-color)',
    'pressed-icon-color-toggle-unselected'     : 'var(--_enabled-vibrant-icon-color)',
    'pressed-icon-color-toggle-selected'       : 'var(--_enabled-vibrant-selected-icon-color)',
    'hovered-state-layer-color'                : 'var(--_hovered-vibrant-state-layer-color)',
    'hovered-state-layer-color-toggle-unselected': 'var(--_hovered-vibrant-state-layer-color)',
    'hovered-state-layer-color-toggle-selected'  : 'var(--_hovered-vibrant-selected-state-layer-color)',
    'focused-state-layer-color'                : 'var(--_focused-vibrant-state-layer-color)',
    'focused-state-layer-color-toggle-unselected': 'var(--_focused-vibrant-state-layer-color)',
    'focused-state-layer-color-toggle-selected'  : 'var(--_focused-vibrant-selected-state-layer-color)',
    'pressed-state-layer-color'                : 'var(--_pressed-vibrant-state-layer-color)',
    'pressed-state-layer-color-toggle-unselected': 'var(--_pressed-vibrant-state-layer-color)',
    'pressed-state-layer-color-toggle-selected'  : 'var(--_pressed-vibrant-selected-state-layer-color)',
})()
