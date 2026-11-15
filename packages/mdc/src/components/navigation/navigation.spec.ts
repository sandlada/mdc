/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    BaseNavigationContainer,
    type INavigationTabTarget,
} from './internal/base-navigation-container'
import { NavigationEventController, type INavigationEventHost } from './internal/navigation-event-controller'

class TestNavigationContainer extends BaseNavigationContainer {}

describe('BaseNavigationContainer', () => {
    it('has correct default properties', () => {
        const container = new TestNavigationContainer()
        expect(container.navigationScope).toBe('global')
        expect(container.activeValue).toBe(null)
    })

    it('allows updating navigationScope', () => {
        const container = new TestNavigationContainer()
        container.navigationScope = 'main'
        expect(container.navigationScope).toBe('main')
    })

    it('setActive updates activeValue for the scope', () => {
        const container = new TestNavigationContainer()
        container.navigationScope = 'spec-scope'
        container.setActive('/home')
        expect(container.activeValue).toBe('/home')
    })
})

describe('NavigationEventController', () => {
    it('can be constructed with a host', () => {
        const host = {
            navigationScope: 'global',
            addController: () => {},
            removeController: () => {},
            requestUpdate: () => {},
            dispatchEvent: () => true,
        } as unknown as INavigationEventHost & {
            addController: (controller: unknown) => void
            removeController: (controller: unknown) => void
            requestUpdate: (...args: unknown[]) => void
            dispatchEvent: (event: Event) => boolean
        }

        const controller = new NavigationEventController(host as any)
        expect(controller).toBeDefined()
        expect(() => controller.hostConnected()).not.toThrow()
        expect(() => controller.hostUpdated()).not.toThrow()
        expect(() => controller.hostDisconnected()).not.toThrow()
    })
})
