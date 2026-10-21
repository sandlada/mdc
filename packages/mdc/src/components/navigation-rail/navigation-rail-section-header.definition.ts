/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-navigation-rail-section-header`.
 *
 * The header tokens are variant independent — the typography, the color and
 * the padding of a section label do not change with the rail variant. The
 * typescale uses `leading` for the line height.
 *
 * @version
 * Material Design 3 - Expressive
 */
import { Space, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandTypescale } from '../../utils/style'

export const NavigationRailSectionHeaderDefinition = createStyleDefinition({
    ...expandTypescale('')(Typescale.LabelLarge),
    ...expandPadding('')([Space.Space50, Space.Space200]),
    color: Color.OnSurfaceVariant,
} as const)
