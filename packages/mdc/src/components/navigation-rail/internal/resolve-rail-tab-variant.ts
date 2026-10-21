/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { NavigationTabVariant } from '../../navigation-tab/navigation-tab.interface'
import { NavigationRailVariant } from '../navigation-rail.interface'

/**
 * Resolves the tab variant for one destination.
 *
 * A destination with a label keeps the vertical layout; only destinations
 * without a label collapse into the round icon container. The expanded rail
 * always lays destinations out horizontally, while XR keeps the same
 * vertical/round split as the collapsed rail.
 */
export function resolveRailTabVariant(
    variant: NavigationRailVariant,
    hasLabel: boolean,
): NavigationTabVariant {
    switch (variant) {
        case NavigationRailVariant.Collapsed:
            return hasLabel
                ? NavigationTabVariant.RailVertical
                : NavigationTabVariant.RailRound
        case NavigationRailVariant.ExpandedDocked:
        case NavigationRailVariant.ExpandedFloating:
            return NavigationTabVariant.RailHorizontal
        case NavigationRailVariant.XR:
            return hasLabel
                ? NavigationTabVariant.RailXRVertical
                : NavigationTabVariant.RailXRRound
        default:
            throw new Error(`[mdc-navigation-rail] Unsupported variant "${String(variant)}".`)
    }
}
