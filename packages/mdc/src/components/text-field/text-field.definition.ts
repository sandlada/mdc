/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandTypescale } from '../../utils/style'

/**
 * Style definitions for `mdc-text-field`.
 *
 * Chrome tokens (container, active indicator / outline, label, supporting text,
 * counter, leading/trailing icons) live on `mdc-field` (`--mdc-field-*`).
 * These tokens govern the inner input/textarea, caret, selection, placeholder,
 * and built-in clear button.
 *
 * Reference:
 * - MD3 spec: https://m3.material.io/components/text-fields/specs
 * - Android: `TextFieldDefaults` / `OutlinedTextFieldDefaults`
 */
const SharedTextFieldTokens = {
    ...expandTypescale('input-text')(Typescale.BodyLarge),

    'enabled-input-text-color': Color.OnSurface,
    'disabled-input-text-color': Color.OnSurface,
    'disabled-input-text-opacity': '0.38',

    'enabled-placeholder-color': Color.OnSurfaceVariant,
    'disabled-placeholder-color': Color.OnSurface,
    'disabled-placeholder-opacity': '0.38',

    'caret-color': Color.Primary,
    'invalid-caret-color': Color.Error,
    'selection-background-color': Color.PrimaryContainer,
    'selection-color': Color.OnPrimaryContainer,

    'clear-button-size': '40px',
    'clear-button-icon-size': '24px',
    'enabled-clear-button-color': Color.OnSurfaceVariant,
    'hovered-clear-button-state-layer-color': Color.OnSurfaceVariant,
    'hovered-clear-button-state-layer-opacity': State.HoveredStateLayerOpacity,
    'pressed-clear-button-state-layer-color': Color.OnSurfaceVariant,
    'pressed-clear-button-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

export const FilledTextFieldDefinition = createStyleDefinition({
    ...SharedTextFieldTokens,
})

export const OutlinedTextFieldDefinition = createStyleDefinition({
    ...SharedTextFieldTokens,
})

export const TextFieldDefinition = FilledTextFieldDefinition
