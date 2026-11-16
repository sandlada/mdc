/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { NavigationRail } from './navigation-rail'
import { NavigationRailDefinition } from './navigation-rail.definition'
import { MDCNavigationRailSection } from './navigation-rail-section'
import { MDCNavigationRailSectionHeader } from './navigation-rail-section-header'
import { NavigationRailSectionHeaderStyles } from './navigation-rail-section-header.style'
import { NavigationRailStyles } from './navigation-rail.style'
import {
    NavigationRailAlignment,
    NavigationRailVariant,
} from './navigation-rail.interface'

describe('NavigationRail', () => {
    it('has correct default properties', () => {
        const rail = new NavigationRail()
        expect(rail.quick).toBe(false)
        expect(rail.variant).toBe('collapsed')
        expect(rail.open).toBe(false)
        expect(rail.alignment).toBe('top')
        expect(rail.returnValue).toBe('')
        expect(rail.noFocusTrap).toBe(false)
        expect(rail.navigationScope).toBe('global')
    })

    it('allows updating properties', () => {
        const rail = new NavigationRail()
        rail.quick = true
        rail.variant = NavigationRailVariant.XR
        rail.open = true
        rail.alignment = NavigationRailAlignment.Bottom
        rail.returnValue = 'value'
        rail.noFocusTrap = true
        rail.navigationScope = 'scope'

        expect(rail.quick).toBe(true)
        expect(rail.variant).toBe('xr')
        expect(rail.open).toBe(true)
        expect(rail.alignment).toBe('bottom')
        expect(rail.returnValue).toBe('value')
        expect(rail.noFocusTrap).toBe(true)
        expect(rail.navigationScope).toBe('scope')
    })

    it('throws for an unsupported variant', () => {
        const rail = new NavigationRail()
        rail.variant = 'unsupported' as NavigationRailVariant
        expect(() => (rail as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-rail] Unsupported variant "unsupported"',
        )
    })

    it('throws for an unsupported alignment', () => {
        const rail = new NavigationRail()
        rail.alignment = 'unsupported' as NavigationRailAlignment
        expect(() => (rail as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-rail] Unsupported alignment "unsupported"',
        )
    })
})

describe('MDCNavigationRailSection', () => {
    it('has correct default render classes', () => {
        const section = new MDCNavigationRailSection()
        expect(section.getContainerClasses()).toEqual({
            section: true,
            'has-header': false,
            'has-content': false,
        })
    })
})

describe('MDCNavigationRailSectionHeader', () => {
    it('has correct default properties', () => {
        const header = new MDCNavigationRailSectionHeader()
        expect(header.header).toBe(null)
    })

    it('allows updating header property', () => {
        const header = new MDCNavigationRailSectionHeader()
        header.header = 'Main'
        expect(header.header).toBe('Main')
    })

    it('uses valid font-size and display tokens in section header styles', () => {
        const cssText = NavigationRailSectionHeaderStyles.map((s) => s.cssText).join('\n')
        expect(cssText).toContain('font-size: var(--_size)')
        expect(cssText).toContain('display: var(--_display)')
        expect(cssText).not.toMatch(/(?:^|[;{\s])size\s*:/)
    })
})

describe('NavigationRail Figma M3E alignment', () => {
    it('matches Figma dimensions and spacing tokens', () => {
        expect(NavigationRailDefinition['container-width'].collapsed).toBe('96px')
        expect(NavigationRailDefinition['container-width']['expanded-docked']).toBe('220px')
        expect(NavigationRailDefinition['container-width']['expanded-floating']).toBe('220px')
        expect(NavigationRailDefinition['container-width'].xr).toBe('96px')
        expect(String(NavigationRailDefinition['container-item-gap'].collapsed)).toContain('40px')
        expect(String(NavigationRailDefinition['container-item-gap'].xr)).toContain('40px')
        expect(String(NavigationRailDefinition['container-padding-block-start'].collapsed)).toContain('44px')
        expect(String(NavigationRailDefinition['container-padding-block-start'].xr)).toContain('20px')
    })

    it('keeps expanded nav items unstretched and hides empty header/end sections', () => {
        const cssText = NavigationRailStyles.map((s) => s.cssText).join('\n')
        expect(cssText).not.toContain('--mdc-navigation-tab-enabled-container-width: 100%')
        expect(cssText).toContain('dialog:not(.has-menu) .menu')
        expect(cssText).toContain('align-items: flex-start')
    })
})
