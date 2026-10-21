/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-navigation-rail-section`.
 *
 * Every token carries one value per rail variant, so a section can be themed
 * on its own per variant. `stringifyTokens` expands those records into the
 * `--_<variant>-<token>` private tokens, backed by the public
 * `--mdc-navigation-rail-section-<variant>-<token>` override variables.
 *
 * @version
 * Material Design 3 - Expressive
 */
import { Space } from '@sandlada/mdk'
import { createStyleDefinition } from '../../utils/style'

export const NavigationRailSectionDefinition = createStyleDefinition({
    // Segments
    'item-between': {
        collapsed: Space.Space50,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space50,
    },
    'padding-block-start': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-block-end': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-inline-start': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-inline-end': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
} as const)
