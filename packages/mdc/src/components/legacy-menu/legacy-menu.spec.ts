/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCLegacyMenu } from './legacy-menu'
import { MDCLegacyMenuItem } from './legacy-menu-item'
import { MDCLegacyMenuSubmenu } from './legacy-menu-submenu'

describe('MDCLegacyMenu', () => {
    it('instantiates with defaults', () => {
        const menu = new MDCLegacyMenu()
        expect(menu.open).toBe(false)
        expect(menu.quick).toBe(false)
        expect(menu.placement).toBe('bottom-start')
        expect(menu.colorStyle).toBe('standard')
        expect(menu.layout).toBe('standard')
        expect(menu.label).toBeNull()
        expect(menu.anchor).toBe('')
        expect(menu.anchorElement).toBeNull()
        expect(menu.stayOpenOnOutsideClick).toBe(false)
        expect(menu.stayOpenOnFocusout).toBe(false)
        expect(menu.skipRestoreFocus).toBe(false)
        expect(menu.hasOverflow).toBe(false)
        expect(menu.xOffset).toBe(0)
        expect(menu.yOffset).toBe(0)
        expect(menu.typeaheadDelay).toBe(500)
        expect(menu.defaultFocus).toBe('first-item')
        expect(menu.noHorizontalFlip).toBe(false)
        expect(menu.noVerticalFlip).toBe(false)
        expect(menu.items).toEqual([])
    })
})

describe('MDCLegacyMenuItem', () => {
    it('instantiates with defaults', () => {
        const item = new MDCLegacyMenuItem()
        expect(item.type).toBe('button')
        expect(item.disabled).toBe(false)
        expect(item.href).toBe('')
        expect(item.target).toBe('')
        expect(item.selected).toBe(false)
        expect(item.checkable).toBe(false)
        expect(item.radio).toBe(false)
        expect(item.value).toBe('')
        expect(item.shortcut).toBe('')
        expect(item.badge).toBeNull()
        expect(item.listTabIndex).toBe(0)
        expect(item.keepOpen).toBe(false)
        expect(item.name).toBe('')
        expect(item.label).toBe('')
        expect(item.typeaheadText).toBe('')
        expect(item.isInteractive).toBe(true)
        expect(item.isDisabled).toBe(false)
        expect(item.itemRole).toBe('menuitem')
    })

    it('type becomes link when href is set', () => {
        const item = new MDCLegacyMenuItem()
        item.type = 'button'
        item.href = 'https://example.com'
        ;(item as any).willUpdate(new Map())
        expect(item.type).toBe('link')
        expect(item.target).toBe('')
    })
})

describe('MDCLegacyMenuSubmenu', () => {
    it('instantiates with defaults', () => {
        const submenu = new MDCLegacyMenuSubmenu()
        expect(submenu.label).toBe('')
        expect(submenu.disabled).toBe(false)
        expect(submenu.placement).toBe('right-start')
        expect(submenu.openDelay).toBe(120)
        expect(submenu.closeDelay).toBe(220)
        expect(submenu.open).toBe(false)
        expect(submenu.quick).toBe(false)
        expect(submenu.listTabIndex).toBe(-1)
        expect(submenu.typeaheadDelay).toBe(500)
    })
})