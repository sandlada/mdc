/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { NavigationStateStore } from './navigation-state-store'

describe('NavigationStateStore', () => {
    it('tracks active value per scope and notifies subscribers', () => {
        const store = NavigationStateStore.Instance
        const scope = `test-scope-${Math.random()}`
        const listener = vi.fn()

        const unsubscribe = store.subscribe(scope, listener)
        expect(store.getActive(scope)).toBeNull()

        store.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })
        expect(store.getActive(scope)).toBe('/home')
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                scope,
                activeValue: '/home',
                previousValue: null,
                changed: true,
                source: 'user',
                trigger: 'pointer',
            })
        )

        unsubscribe()
        store.setActive(scope, '/settings')
        expect(listener).toHaveBeenCalledTimes(1)
    })
})
