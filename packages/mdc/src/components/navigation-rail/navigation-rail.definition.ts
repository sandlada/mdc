/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-navigation-rail`.
 *
 * Follows Material Design 3 Navigation Rail specifications:
 * https://m3.material.io/components/navigation-rail/specs
 * https://m3.material.io/components/navigation-rail/overview
 * https://m3.material.io/components/navigation-rail/guidelines
 *
 * The rail ships four variants:
 * - `collapsed`: docked, narrow rail (80dp).
 * - `expanded-docked`: docked, wide rail (220dp).
 * - `expanded-floating`: floating overlay (220dp) above a scrim.
 * - `xr`: docked XR rail (96dp).
 *
 * All four variants live in a single {@link NavigationRailDefinition}. Every
 * container token carries one value per variant, so each variant can be
 * themed on its own. `stringifyTokens` expands those records into the
 * `--_<variant>-<token>` private tokens, backed by the public
 * `--mdc-navigation-rail-<variant>-<token>` override variables.
 *
 * Tokens that do not depend on the variant (scrim, divider, shadow color)
 * stay static and are shared by every variant.
 *
 * ```plaintext
 * |-----------------------
 * |
 * |   Menu Icon Button Slot
 * |
 * |   Fab Slot
 * |
 * |   |---------------| |
 * |   | SectionHeader | |
 * |   | Tab Slot 1    | |
 * |   |_______________| |
 * |                     | Scrollable
 * |   |---------------| |
 * |   | SectionHeader | |
 * |   | Tab Slot 2    | |
 * |   |_______________| |
 * |
 * |   End Slot
 * |_______________________
 * ````
 *
 * @version
 * Material Design 3 - Expressive
 */
import { ElevationLevel, Shape, Space } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape } from '../../utils/style'
import { NavigationRailVariant } from './navigation-rail.interface'

/**
 * The value of a single token for every rail variant.
 */
interface NavigationRailVariantValues {
    collapsed: unknown
    expandedDocked: unknown
    expandedFloating: unknown
    xr: unknown
}

/**
 * Builds the variant record of a token.
 *
 * Every variant keeps its own value type, so a token may hold a different
 * kind of value per variant (e.g. a width in `px` and a shape token).
 *
 * @param values - The value of the token for every rail variant.
 * @returns The variant record, keyed by the variant names.
 */
const variants = <T extends NavigationRailVariantValues>(values: T): {
    'collapsed': T['collapsed']
    'expanded-docked': T['expandedDocked']
    'expanded-floating': T['expandedFloating']
    'xr': T['xr']
} => ({
    [NavigationRailVariant.Collapsed]: values.collapsed,
    [NavigationRailVariant.ExpandedDocked]: values.expandedDocked,
    [NavigationRailVariant.ExpandedFloating]: values.expandedFloating,
    [NavigationRailVariant.XR]: values.xr,
})

export const NavigationRailDefinition = createStyleDefinition({
    // Container
    ...expandShape('container-shape')(variants({
        collapsed: Shape.None,
        expandedDocked: Shape.None,
        expandedFloating: Shape.Large,
        xr: Shape.ExtraExtraLarge,
    })),
    'container-width': variants({
        collapsed: `96px`,
        expandedDocked: `220px`,
        expandedFloating: `220px`,
        xr: `96px`,
    }),
    'container-color': variants({
        collapsed: `transparent`,
        expandedDocked: `transparent`,
        expandedFloating: Color.SurfaceContainer,
        xr: Color.SurfaceContainer,
    }),
    'container-elevation-level': variants({
        collapsed: ElevationLevel.Level0,
        expandedDocked: ElevationLevel.Level0,
        expandedFloating: ElevationLevel.Level0,
        xr: ElevationLevel.Level0,
    }),
    'container-item-gap': variants({
        collapsed: Space.Space400,
        expandedDocked: Space.Space400,
        expandedFloating: Space.Space400,
        xr: Space.Space250,
    }),
    'container-padding-block-start': variants({
        collapsed: Space.Space500,
        expandedDocked: Space.Space500,
        expandedFloating: Space.Space500,
        xr: Space.Space0,
    }),
    'container-padding-block-end': variants({
        collapsed: Space.Space700,
        expandedDocked: Space.Space250,
        expandedFloating: Space.Space250,
        xr: Space.Space0,
    }),
    'container-padding-inline-start': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space250,
        expandedFloating: Space.Space250,
        xr: Space.Space0,
    }),
    'container-padding-inline-end': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space250,
        expandedFloating: Space.Space250,
        xr: Space.Space0,
    }),

    // Menu & Fab
    'menu-and-fab-item-gap': variants({
        collapsed: Space.Space50,
        expandedDocked: Space.Space50,
        expandedFloating: Space.Space50,
        xr: Space.Space50,
    }),
    'menu-and-fab-padding-block-start': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    }),
    'menu-and-fab-padding-block-end': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    }),
    'menu-and-fab-padding-inline-start': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    }),
    'menu-and-fab-padding-inline-end': variants({
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    }),

    // Variant independent chrome
    'divider-color': Color.OutlineVariant,
    'scrim-color': Color.Scrim,
    'scrim-opacity': `0.38`,
    'container-shadow-color': Color.Shadow,
})
