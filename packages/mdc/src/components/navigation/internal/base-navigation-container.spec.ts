/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import type { NavigationTabVariant } from '../../navigation-tab/navigation-tab.interface'
import {
    BaseNavigationContainer,
    type INavigationTabTarget,
} from './base-navigation-container'

class TestNavigationContainer extends BaseNavigationContainer {}

class LabelledVariantContainer extends BaseNavigationContainer {

    protected override resolveTabVariant(tab: INavigationTabTarget): NavigationTabVariant {
        return tab.label.trim().length > 0 ? 'rail-vertical' : 'rail-round'
    }
}

class UndefinedVariantContainer extends BaseNavigationContainer {

    protected override resolveTabVariant(): NavigationTabVariant {
        // Simulates an untyped resolver that fails to return a variant.
        return undefined as unknown as NavigationTabVariant
    }
}

interface ITestTab {
    navigationScope: string
    label: string
    variant: NavigationTabVariant
    parentElement: { closest: (selector: string) => Element | null }
}

function createTab(
    container: BaseNavigationContainer,
    overrides: Partial<Omit<ITestTab, 'parentElement'>> = {},
): ITestTab {
    return {
        navigationScope: '',
        label: '',
        variant: 'bar-vertical',
        parentElement: {
            closest: () => container as unknown as Element,
        },
        ...overrides,
    }
}

function createTabs(container: BaseNavigationContainer, ...scopes: string[]): ITestTab[] {
    return scopes.map((navigationScope) => createTab(container, { navigationScope }))
}

function mountTabs(container: BaseNavigationContainer, tabs: ITestTab[]): void {
    ;(container as unknown as { querySelectorAll: () => ITestTab[] }).querySelectorAll = () => tabs
}

function syncTabsScope(container: BaseNavigationContainer): void {
    ;(container as unknown as { syncTabsScope: () => void }).syncTabsScope()
}

function syncTabVariants(container: BaseNavigationContainer): void {
    ;(container as unknown as { syncTabVariants: () => void }).syncTabVariants()
}

describe('BaseNavigationContainer navigation scope inheritance', () => {
    it('inherits the container scope into a tab nested in a wrapper', () => {
        const container = new TestNavigationContainer()
        const tabs = createTabs(container, '')
        mountTabs(container, tabs)

        syncTabsScope(container)

        expect(tabs[0].navigationScope).toBe('global')
    })

    it('updates inherited tabs when the container scope changes', () => {
        const container = new TestNavigationContainer()
        const tabs = createTabs(container, '')
        mountTabs(container, tabs)

        syncTabsScope(container)
        container.navigationScope = 'scope-next'
        syncTabsScope(container)

        expect(tabs[0].navigationScope).toBe('scope-next')
    })

    it('keeps a scope the tab declared before the container saw it', () => {
        const container = new TestNavigationContainer()
        const tabs = createTabs(container, 'explicit')
        mountTabs(container, tabs)

        syncTabsScope(container)
        container.navigationScope = 'scope-next'
        syncTabsScope(container)

        expect(tabs[0].navigationScope).toBe('explicit')
    })

    it('stops managing a tab after its inherited scope is overridden', () => {
        const container = new TestNavigationContainer()
        const tabs = createTabs(container, '')
        mountTabs(container, tabs)

        syncTabsScope(container)
        tabs[0].navigationScope = 'custom'
        syncTabsScope(container)
        container.navigationScope = 'scope-next'
        syncTabsScope(container)

        expect(tabs[0].navigationScope).toBe('custom')
    })

    it('inherits the scope again after the tab scope is cleared', () => {
        const container = new TestNavigationContainer()
        const tabs = createTabs(container, '')
        mountTabs(container, tabs)

        syncTabsScope(container)
        tabs[0].navigationScope = 'custom'
        syncTabsScope(container)
        tabs[0].navigationScope = ''
        syncTabsScope(container)

        expect(tabs[0].navigationScope).toBe('global')
    })
})

describe('BaseNavigationContainer tab variant propagation', () => {
    it('leaves tab variants untouched when the container does not manage them', () => {
        const container = new TestNavigationContainer()
        const tab = createTab(container, { variant: 'bar-horizontal' })
        mountTabs(container, [tab])

        syncTabVariants(container)

        expect(tab.variant).toBe('bar-horizontal')
    })

    it('resolves a variant per tab', () => {
        const container = new LabelledVariantContainer()
        const labelled = createTab(container, { label: 'Home' })
        const iconOnly = createTab(container, { label: '' })
        mountTabs(container, [labelled, iconOnly])

        syncTabVariants(container)

        expect(labelled.variant).toBe('rail-vertical')
        expect(iconOnly.variant).toBe('rail-round')
    })

    it('re-resolves a tab variant when its label changes', () => {
        const container = new LabelledVariantContainer()
        const tab = createTab(container, { label: 'Home' })
        mountTabs(container, [tab])

        syncTabVariants(container)
        tab.label = ''
        syncTabVariants(container)

        expect(tab.variant).toBe('rail-round')
    })

    it('overwrites a variant set on the tab', () => {
        const container = new LabelledVariantContainer()
        const tab = createTab(container, { label: 'Home', variant: 'drawer' })
        mountTabs(container, [tab])

        syncTabVariants(container)

        expect(tab.variant).toBe('rail-vertical')
    })

    it('ignores an undefined variant resolved for a tab', () => {
        const container = new UndefinedVariantContainer()
        const tab = createTab(container, { variant: 'bar-horizontal' })
        mountTabs(container, [tab])

        syncTabVariants(container)

        expect(tab.variant).toBe('bar-horizontal')
    })
})
