/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { Color } from '../../utils/color'
import { Tab } from './tab'
import { Tabs } from './tabs'
import { TabVariant } from './tab.interface'
import { TabsMode } from './tabs.interface'
import {
    FloatingTabDefinition,
    PrimaryTabDefinition,
    SecondaryTabDefinition,
} from './tab.definition'
import { TabsDefinition } from './tabs.definition'

interface TabInternals {
    getContentClasses(): Record<string, boolean>
    updated(changed: Map<string, unknown>): void
    handleContentClick(event: Event): void
    handleKeydown(event: KeyboardEvent): void
}

interface TabsInternals {
    tabs: Tab[]
    getTabsClasses(): Record<string, boolean>
    syncChildVariants(): void
    handleKeydown(event: KeyboardEvent): void
    isRtl(): boolean
}

function asTabInternals(tab: Tab): TabInternals {
    return tab as unknown as TabInternals
}

function asTabsInternals(tabs: Tabs): TabsInternals {
    return tabs as unknown as TabsInternals
}

function createMockTabs(...configs: Array<{ disabled?: boolean; variant?: TabVariant }>): {
    tabs: Tabs
    items: Tab[]
} {
    const tabs = new Tabs()
    const items = configs.map((cfg, index) => {
        const tab = new Tab()
        tab.index = index
        if (cfg.disabled) tab.disabled = true
        if (cfg.variant) {
            tab.variant = cfg.variant
            tab.setAttribute('variant', cfg.variant)
        }
        tab.focus = vi.fn()
        return tab
    })
    asTabsInternals(tabs).tabs = items
    asTabsInternals(tabs).isRtl = () => false
    if (items[0] && !items[0].disabled) {
        items[0].active = true
        items[0].tabIndex = 0
    }
    return { tabs, items }
}

describe('Tab', () => {
    it('has correct default properties', () => {
        const tab = new Tab()
        expect(tab.isTab).toBe(true)
        expect(tab.active).toBe(false)
        expect(tab.disabled).toBe(false)
        expect(tab.alwaysFocusable).toBe(false)
        expect(tab.variant).toBe('primary')
        expect(tab.index).toBe(0)
        expect(tab.hasIcon).toBe(false)
        expect(tab.iconOnly).toBe(false)
        expect(tab.hasBadge).toBe(false)
        expect(tab.label).toBe('')
    })

    it('allows updating properties', () => {
        const tab = new Tab()
        tab.active = true
        tab.disabled = true
        tab.alwaysFocusable = true
        tab.variant = TabVariant.Secondary
        tab.index = 2
        tab.hasIcon = true
        tab.iconOnly = true
        tab.hasBadge = true
        tab.label = 'Home'

        expect(tab.active).toBe(true)
        expect(tab.disabled).toBe(true)
        expect(tab.alwaysFocusable).toBe(true)
        expect(tab.variant).toBe('secondary')
        expect(tab.index).toBe(2)
        expect(tab.hasIcon).toBe(true)
        expect(tab.iconOnly).toBe(true)
        expect(tab.hasBadge).toBe(true)
        expect(tab.label).toBe('Home')
    })

    it('computes content classes from hasIcon, iconOnly, and hasBadge', () => {
        const tab = new Tab()
        expect(asTabInternals(tab).getContentClasses()).toEqual({
            'has-icon' : false,
            'has-label': true,
            'has-badge': false,
        })

        tab.hasIcon = true
        tab.iconOnly = true
        tab.hasBadge = true
        expect(asTabInternals(tab).getContentClasses()).toEqual({
            'has-icon' : true,
            'has-label': false,
            'has-badge': true,
        })
    })

    it('updates aria-selected and aria-disabled on property updates', () => {
        const tab = new Tab()
        tab.active = true
        tab.disabled = true
        asTabInternals(tab).updated(new Map([['active', false], ['disabled', false]]))

        expect(tab.getAttribute('aria-selected')).toBe('true')
        expect(tab.getAttribute('aria-disabled')).toBe('true')

        tab.disabled = false
        asTabInternals(tab).updated(new Map([['disabled', true]]))
        expect(tab.hasAttribute('aria-disabled')).toBe(false)
    })

    it('blocks click and keydown activation when disabled', () => {
        const tab = new Tab()
        tab.disabled = true
        const clickSpy = vi.fn()
        tab.click = clickSpy

        const clickEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event
        asTabInternals(tab).handleContentClick(clickEvent)
        expect(clickEvent.preventDefault).toHaveBeenCalled()
        expect(clickSpy).not.toHaveBeenCalled()

        const keyEvent = { key: 'Enter', defaultPrevented: false, preventDefault: vi.fn() } as unknown as KeyboardEvent
        asTabInternals(tab).handleKeydown(keyEvent)
        expect(clickSpy).not.toHaveBeenCalled()
    })
})

describe('Tabs', () => {
    it('has correct default properties', () => {
        const tabs = new Tabs()
        expect(tabs.activeTabIndex).toBe(0)
        expect(tabs.autoActivate).toBe(true)
        expect(tabs.mode).toBe(TabsMode.Fixed)
        expect(tabs.variant).toBeUndefined()
        expect(tabs.noDivider).toBe(false)
        expect(tabs.label).toBe('')
        expect(tabs.activeTab).toBe(null)
    })

    it('computes tabs layout classes for fixed and scrollable modes', () => {
        const tabs = new Tabs()
        expect(asTabsInternals(tabs).getTabsClasses()).toEqual({
            scrollable: false,
            fixed     : true,
        })

        tabs.mode = TabsMode.Scrollable
        expect(asTabsInternals(tabs).getTabsClasses()).toEqual({
            scrollable: true,
            fixed     : false,
        })
    })

    it('propagates variant to child tabs that do not explicitly set variant', () => {
        const { tabs, items } = createMockTabs({}, { variant: TabVariant.Floating })
        tabs.variant = TabVariant.Secondary
        asTabsInternals(tabs).syncChildVariants()

        expect(items[0].variant).toBe(TabVariant.Secondary)
        expect(items[1].variant).toBe(TabVariant.Floating)
    })

    it('activates target tab, updates roving tabindex, and ignores disabled tabs', async () => {
        const { tabs, items } = createMockTabs({}, { disabled: true }, {})

        await tabs.activateTab(items[1], false)
        expect(tabs.activeTabIndex).toBe(0)
        expect(items[1].active).toBe(false)

        await tabs.activateTab(items[2], false)
        expect(tabs.activeTabIndex).toBe(2)
        expect(items[0].active).toBe(false)
        expect(items[2].active).toBe(true)
        expect(items[0].tabIndex).toBe(-1)
        expect(items[2].tabIndex).toBe(0)
    })

    it('wraps ArrowLeft from first tab to last non-disabled tab and skips disabled tabs', async () => {
        const { tabs, items } = createMockTabs({}, { disabled: true }, {})

        const leftFromFirst = {
            key: 'ArrowLeft',
            target: items[0],
            defaultPrevented: false,
            ctrlKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent

        asTabsInternals(tabs).handleKeydown(leftFromFirst)
        await new Promise((r) => setTimeout(r, 0))
        expect(tabs.activeTabIndex).toBe(2)
        expect(items[2].active).toBe(true)

        const leftFromLast = {
            key: 'ArrowLeft',
            target: items[2],
            defaultPrevented: false,
            ctrlKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent

        asTabsInternals(tabs).handleKeydown(leftFromLast)
        await new Promise((r) => setTimeout(r, 0))
        expect(tabs.activeTabIndex).toBe(0)
        expect(items[0].active).toBe(true)
    })

    it('moves focus without activating when autoActivate is false', () => {
        const { tabs, items } = createMockTabs({}, {})
        tabs.autoActivate = false

        const rightKey = {
            key: 'ArrowRight',
            target: items[0],
            defaultPrevented: false,
            ctrlKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent

        asTabsInternals(tabs).handleKeydown(rightKey)
        expect(tabs.activeTabIndex).toBe(0)
        expect(items[0].active).toBe(true)
        expect(items[1].active).toBe(false)
        expect(items[1].tabIndex).toBe(0)
        expect(items[0].tabIndex).toBe(-1)
        expect(items[1].focus).toHaveBeenCalled()
    })

    it('reverts selection when change event is canceled', async () => {
        const { tabs, items } = createMockTabs({}, {})
        tabs.dispatchEvent = () => false

        await tabs.activateTab(items[1], false)
        expect(tabs.activeTabIndex).toBe(0)
        expect(items[0].active).toBe(true)
        expect(items[1].active).toBe(false)
    })
})

describe('Tabs & Tab Definitions (Figma / Android MD3 specs)', () => {
    it('defines MD3 Primary tab tokens accurately', () => {
        expect(PrimaryTabDefinition['container-height']).toBe('48px')
        expect(PrimaryTabDefinition['with-icon-and-label-text-container-height']).toBe('64px')
        expect(PrimaryTabDefinition['active-indicator-height']).toBe('3px')
        expect(PrimaryTabDefinition['active-indicator-min-width']).toBe('24px')
        expect(PrimaryTabDefinition['active-indicator-shape-start-start']).toBe('3px')
        expect(PrimaryTabDefinition['active-indicator-shape-start-end']).toBe('3px')
        expect(PrimaryTabDefinition['enabled-label-color-selected']).toBe(Color.Primary)
        expect(PrimaryTabDefinition['label-leading']).toBeDefined()
    })

    it('defines MD3 Secondary tab tokens accurately', () => {
        expect(SecondaryTabDefinition['container-height']).toBe('48px')
        expect(SecondaryTabDefinition['with-icon-and-label-text-container-height']).toBe('48px')
        expect(SecondaryTabDefinition['active-indicator-height']).toBe('2px')
        expect(SecondaryTabDefinition['enabled-active-indicator-color']).toBe(Color.Primary)
        expect(SecondaryTabDefinition['enabled-label-color-selected']).toBe(Color.OnSurface)
        expect(SecondaryTabDefinition['enabled-icon-color-selected']).toBe(Color.OnSurface)
    })

    it('defines MD3E Floating tab and Tabs container tokens accurately', () => {
        expect(FloatingTabDefinition['container-height']).toBe('56px')
        expect(FloatingTabDefinition['enabled-active-indicator-color']).toBe(Color.SecondaryContainer)
        expect(TabsDefinition['divider-height']).toBe('1px')
        expect(TabsDefinition['scrollable-edge-padding']).toBe('52px')
    })
})
