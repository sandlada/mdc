/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCNavigationTab } from './navigation-tab'
import { NavigationTabVariant } from './navigation-tab.interface'

describe('MDCNavigationTab', () => {
    it('has correct default properties', () => {
        const tab = new MDCNavigationTab()
        expect(tab.label).toBe('')
        expect(tab.badge).toBe('')
        expect(tab.value).toBe('')
        expect(tab.href).toBe(null)
        expect(tab.target).toBe(null)
        expect(tab.navigationScope).toBe('')
        expect(tab.checked).toBe(false)
        expect(tab.defaultChecked).toBe(false)
        expect(tab.required).toBe(false)
        expect(tab.disabled).toBe(false)
        expect(tab.variant).toBe('bar-vertical')
    })

    it('allows updating properties', () => {
        const tab = new MDCNavigationTab()
        tab.label = 'Home'
        tab.badge = '3'
        tab.value = '/home'
        tab.href = '/home'
        tab.target = '_blank'
        tab.navigationScope = 'main'
        tab.checked = true
        tab.defaultChecked = true
        tab.required = true
        tab.disabled = true
        tab.variant = NavigationTabVariant.Drawer

        expect(tab.label).toBe('Home')
        expect(tab.badge).toBe('3')
        expect(tab.value).toBe('/home')
        expect(tab.href).toBe('/home')
        expect(tab.target).toBe('_blank')
        expect(tab.navigationScope).toBe('main')
        expect(tab.checked).toBe(true)
        expect(tab.defaultChecked).toBe(true)
        expect(tab.required).toBe(true)
        expect(tab.disabled).toBe(true)
        expect(tab.variant).toBe('drawer')
    })

    it('throws for an unsupported variant', () => {
        const tab = new MDCNavigationTab()
        tab.variant = 'unsupported' as NavigationTabVariant
        expect(() => (tab as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-tab] Unsupported variant "unsupported"',
        )
    })
})
