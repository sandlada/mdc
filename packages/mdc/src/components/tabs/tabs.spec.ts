/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { Tab } from './tab'
import { Tabs } from './tabs'
import { TabVariant } from './tab.interface'

describe('Tab', () => {
    it('has correct default properties', () => {
        const tab = new Tab()
        expect(tab.isTab).toBe(true)
        expect(tab.active).toBe(false)
        expect(tab.selected).toBe(false)
        expect(tab.variant).toBe('primary')
        expect(tab.index).toBe(0)
        expect(tab.hasIcon).toBe(false)
        expect(tab.iconOnly).toBe(false)
    })

    it('allows updating properties', () => {
        const tab = new Tab()
        tab.active = true
        tab.variant = TabVariant.Secondary
        tab.index = 2
        tab.hasIcon = true
        tab.iconOnly = true

        expect(tab.active).toBe(true)
        expect(tab.selected).toBe(true)
        expect(tab.variant).toBe('secondary')
        expect(tab.index).toBe(2)
        expect(tab.hasIcon).toBe(true)
        expect(tab.iconOnly).toBe(true)
    })

    it('keeps selected in sync with active', () => {
        const tab = new Tab()
        tab.selected = true
        expect(tab.active).toBe(true)
        expect(tab.selected).toBe(true)

        tab.active = false
        expect(tab.selected).toBe(false)
    })
})

describe('Tabs', () => {
    it('has correct default properties', () => {
        const tabs = new Tabs()
        expect(tabs.activeTabIndex).toBe(0)
        expect(tabs.autoActivate).toBe(true)
        expect(tabs.activeTab).toBe(null)
    })

    it('allows updating properties', () => {
        const tabs = new Tabs()
        tabs.activeTabIndex = 1
        tabs.autoActivate = false

        expect(tabs.activeTabIndex).toBe(1)
        expect(tabs.autoActivate).toBe(false)
    })
})
