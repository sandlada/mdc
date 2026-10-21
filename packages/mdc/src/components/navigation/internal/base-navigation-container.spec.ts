/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { BaseNavigationContainer } from './base-navigation-container'

class TestNavigationContainer extends BaseNavigationContainer {}

interface ITestTab {
    navigationScope: string
    parentElement: { closest: (selector: string) => Element | null }
}

function createTabs(container: TestNavigationContainer, ...scopes: string[]): ITestTab[] {
    const parentElement = {
        closest: () => container as unknown as Element,
    }
    return scopes.map((navigationScope) => ({ navigationScope, parentElement }))
}

function mountTabs(container: TestNavigationContainer, tabs: ITestTab[]): void {
    ;(container as unknown as { querySelectorAll: () => ITestTab[] }).querySelectorAll = () => tabs
}

function syncTabsScope(container: TestNavigationContainer): void {
    ;(container as unknown as { syncTabsScope: () => void }).syncTabsScope()
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
