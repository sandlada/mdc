/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definition for the `mdc-tabs` container.
 *
 * Metrics aligned with Material Design 3 Figma specs and Jetpack Compose
 * Material 3 (`TabRowDefaults` / `PrimaryScrollableTabRow` / `SecondaryScrollableTabRow`):
 * - Divider: 1dp `OutlineVariant`
 * - Scrollable edge start padding: 52dp (`ScrollableTabRowEdgeStartPadding`)
 *
 * @link
 * https://m3.material.io/components/tabs/specs
 */
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

export const TabsDefinition = createStyleDefinition({
    'enabled-container-color': `transparent`,
    'enabled-divider-color'  : Color.OutlineVariant,
    'divider-height'         : `1px`,
    'scrollable-edge-padding': `52px`,
})
