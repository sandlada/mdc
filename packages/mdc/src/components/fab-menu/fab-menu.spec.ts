/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Typescale } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { MDCFabMenu } from './fab-menu'
import { MDCFabMenuItem } from './fab-menu-item'
import {
    PrimaryFabMenuDefinition,
    SecondaryFabMenuDefinition,
    TertiaryFabMenuDefinition,
} from './fab-menu.definition'
import {
    PrimaryFabMenuItemDefinition,
    SecondaryFabMenuItemDefinition,
    TertiaryFabMenuItemDefinition,
} from './fab-menu-item.definition'

describe('MDCFabMenu & MDCFabMenuItem', () => {
    it('instantiates MDCFabMenu with MD3E defaults', () => {
        const menu = new MDCFabMenu()
        expect(menu.variant).toBe('primary')
        expect(menu.size).toBe('small')
        expect(menu.expanded).toBe(false)
        expect(menu.horizontalAlignment).toBe('end')
        expect(menu.disabled).toBe(false)
        expect(menu.closeOnSelect).toBe(true)
        expect(menu.closeAriaLabel).toBeNull()
    })

    it('instantiates MDCFabMenuItem with MD3E defaults', () => {
        const item = new MDCFabMenuItem()
        expect(item.variant).toBe('primary')
        expect(item.disabled).toBe(false)
        expect(item.href).toBeNull()
        expect(item.target).toBeNull()
        expect(item.keepOpen).toBe(false)
    })

    it('defines MD3E FAB menu dimensions, spacing, and color sets', () => {
        expect(PrimaryFabMenuDefinition['close-button-container-height']).toBe('56px')
        expect(PrimaryFabMenuDefinition['close-button-container-width']).toBe('56px')
        expect(PrimaryFabMenuDefinition['close-button-icon-size']).toBe('24px')
        expect(PrimaryFabMenuDefinition['close-button-between-space']).toBe('8px')
        expect(PrimaryFabMenuDefinition['item-between-space']).toBe('4px')

        expect(PrimaryFabMenuDefinition['small-container-height']).toBe('56px')
        expect(PrimaryFabMenuDefinition['medium-container-height']).toBe('80px')
        expect(PrimaryFabMenuDefinition['large-container-height']).toBe('96px')

        expect(PrimaryFabMenuDefinition['enabled-container-color']).not.toBe(
            SecondaryFabMenuDefinition['enabled-container-color'],
        )
        expect(SecondaryFabMenuDefinition['enabled-container-color']).not.toBe(
            TertiaryFabMenuDefinition['enabled-container-color'],
        )
    })

    it('defines MD3E FAB menu item medium-button metrics and typography', () => {
        expect(PrimaryFabMenuItemDefinition['container-height']).toBe('56px')
        expect(PrimaryFabMenuItemDefinition['container-padding-inline-start']).toBe('24px')
        expect(PrimaryFabMenuItemDefinition['container-padding-inline-end']).toBe('24px')
        expect(PrimaryFabMenuItemDefinition['icon-size']).toBe('24px')
        expect(PrimaryFabMenuItemDefinition['icon-label-space']).toBe('8px')
        expect(PrimaryFabMenuItemDefinition['label-size']).toBe(Typescale.TitleMedium.FontSize)
        expect(PrimaryFabMenuItemDefinition['label-leading']).toBe(Typescale.TitleMedium.LineHeight)
        expect(PrimaryFabMenuItemDefinition['label-weight']).toBe(Typescale.TitleMedium.FontWeight)

        expect(PrimaryFabMenuItemDefinition['enabled-container-color']).not.toBe(
            SecondaryFabMenuItemDefinition['enabled-container-color'],
        )
        expect(SecondaryFabMenuItemDefinition['enabled-container-color']).not.toBe(
            TertiaryFabMenuItemDefinition['enabled-container-color'],
        )
    })

    it('bridges elevation tokens and avoids CSS var() second-arg fallbacks', () => {
        const menuCss = MDCFabMenu.styles.map((s) => s.toString()).join('\n')
        const itemCss = MDCFabMenuItem.styles.map((s) => s.toString()).join('\n')

        expect(menuCss).toContain('--mdc-elevation-level: var(--_enabled-container-elevation)')
        expect(menuCss).toContain('--mdc-elevation-shadow-color: var(--_enabled-container-shadow-color)')
        expect(itemCss).toContain('--mdc-elevation-level: var(--_enabled-container-elevation)')
        expect(itemCss).toContain('--mdc-elevation-shadow-color: var(--_enabled-container-shadow-color)')

        expect(menuCss).not.toMatch(/var\(--_[^,)]+,/)
        expect(itemCss).not.toMatch(/var\(--_[^,)]+,/)
    })
})
