/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import type { NavigationTabVariant } from '../../navigation-tab/navigation-tab.interface'
import {
    NavigationRailVariant,
    type NavigationRailVariant as NavigationRailVariantType,
} from '../navigation-rail.interface'
import { resolveRailTabVariant } from './resolve-rail-tab-variant'

const CASES: ReadonlyArray<
    readonly [NavigationRailVariantType, boolean, NavigationTabVariant]
> = [
    [NavigationRailVariant.Collapsed, true, 'rail-vertical'],
    [NavigationRailVariant.Collapsed, false, 'rail-round'],
    [NavigationRailVariant.ExpandedDocked, true, 'rail-horizontal'],
    [NavigationRailVariant.ExpandedDocked, false, 'rail-horizontal'],
    [NavigationRailVariant.ExpandedFloating, true, 'rail-horizontal'],
    [NavigationRailVariant.ExpandedFloating, false, 'rail-horizontal'],
    [NavigationRailVariant.XR, true, 'rail-xr-vertical'],
    [NavigationRailVariant.XR, false, 'rail-xr-round'],
]

describe('resolveRailTabVariant', () => {
    it.each(CASES)(
        'resolves %s with hasLabel=%s to %s',
        (variant, hasLabel, expected) => {
            expect(resolveRailTabVariant(variant, hasLabel)).toBe(expected)
        },
    )
})
