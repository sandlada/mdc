/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { NavigationDrawer } from './navigation-drawer'
import {
    NavigationDrawerEdge,
    NavigationDrawerVariant,
} from './navigation-drawer.interface'

describe('NavigationDrawer', () => {
    it('has correct default properties', () => {
        const drawer = new NavigationDrawer()
        expect(drawer.variant).toBe('modal')
        expect(drawer.open).toBe(false)
        expect(drawer.drawerEdge).toBe('start')
        expect(drawer.headline).toBe('')
        expect(drawer.quick).toBe(false)
        expect(drawer.cancelable).toBe(true)
        expect(drawer.draggable).toBe(true)
        expect(drawer.noFocusTrap).toBe(false)
        expect(drawer.returnValue).toBe('')
        expect(drawer.navigationScope).toBe('global')
    })

    it('allows updating properties', () => {
        const drawer = new NavigationDrawer()
        drawer.variant = NavigationDrawerVariant.Standard
        drawer.open = true
        drawer.drawerEdge = NavigationDrawerEdge.End
        drawer.headline = 'Mail'
        drawer.quick = true
        drawer.cancelable = false
        drawer.draggable = false
        drawer.noFocusTrap = true
        drawer.returnValue = 'value'
        drawer.navigationScope = 'scope'

        expect(drawer.variant).toBe('standard')
        expect(drawer.open).toBe(true)
        expect(drawer.drawerEdge).toBe('end')
        expect(drawer.headline).toBe('Mail')
        expect(drawer.quick).toBe(true)
        expect(drawer.cancelable).toBe(false)
        expect(drawer.draggable).toBe(false)
        expect(drawer.noFocusTrap).toBe(true)
        expect(drawer.returnValue).toBe('value')
        expect(drawer.navigationScope).toBe('scope')
    })

    it('throws for an unsupported variant', () => {
        const drawer = new NavigationDrawer()
        drawer.variant = 'unsupported' as NavigationDrawerVariant
        expect(() => (drawer as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-drawer] Unsupported variant "unsupported"',
        )
    })

    it('throws for an unsupported drawer edge', () => {
        const drawer = new NavigationDrawer()
        drawer.drawerEdge = 'unsupported' as NavigationDrawerEdge
        expect(() => (drawer as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-drawer] Unsupported drawer edge "unsupported"',
        )
    })
})
