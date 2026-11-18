/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'
import { MDCNavigationBar } from './navigation-bar'
import {
    NavigationBarVariant,
    type NavigationBarVariant as NavigationBarVariantType,
} from './navigation-bar.interface'

const Cases: ReadonlyArray<readonly [NavigationBarVariantType, NavigationTabVariant]> = [
    [NavigationBarVariant.Horizontal, 'bar-horizontal'],
    [NavigationBarVariant.Vertical, 'bar-vertical'],
    [NavigationBarVariant.VerticalXR, 'bar-xr-vertical'],
]

class TestNavigationBar extends MDCNavigationBar {
    public resolveVariant(): NavigationTabVariant {
        return this.resolveTabVariant()
    }
}

describe('MDCNavigationBar tab variants', () => {
    it.each(Cases)('maps %s to %s', (variant, expected) => {
        const bar = new TestNavigationBar()
        bar.variant = variant

        expect(bar.resolveVariant()).toBe(expected)
    })

    it('throws for an unsupported variant', () => {
        const bar = new TestNavigationBar()
        bar.variant = 'unsupported' as NavigationBarVariantType

        expect(() => bar.resolveVariant()).toThrow(
            '[mdc-navigation-bar] Unsupported variant "unsupported"',
        )
    })

    it('supports show(), hide(), and toggle() collapsed state', () => {
        const bar = new TestNavigationBar()
        expect(bar.scrollBehavior).toBe('pinned')
        expect(bar.collapsed).toBe(false)

        bar.hide()
        expect(bar.collapsed).toBe(true)

        bar.show()
        expect(bar.collapsed).toBe(false)

        bar.toggle()
        expect(bar.collapsed).toBe(true)
    })
})
