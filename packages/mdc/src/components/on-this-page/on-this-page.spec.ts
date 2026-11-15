/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { OnThisPage } from './on-this-page'
import { OnThisPageItem } from './on-this-page-item'


describe('OnThisPage', () => {
    it('has correct default properties', () => {
        const page = new OnThisPage()
        expect(page.caption).toBe('On this page')
        expect(page.headline).toBe('')
        expect(page.activeHref).toBe('')
        expect(page.activeIndex).toBe(0)
        expect(page.scrollTarget).toBe('window')
        expect(page.scrollOffset).toBe(96)
        expect(page.updateHash).toBe(true)
        expect(page.contentSelector).toBe('')
        expect(page.autoDiscover).toBe(false)
        expect(page.indicatorFit).toBe('content')
    })

    it('allows updating properties', () => {
        const page = new OnThisPage()
        page.caption = 'Contents'
        page.headline = 'Navigation rail'
        page.activeHref = '#variants'
        page.activeIndex = 2
        page.scrollTarget = '#container'
        page.scrollOffset = 64
        page.updateHash = false
        page.contentSelector = 'main'
        page.autoDiscover = true
        page.indicatorFit = 'full'

        expect(page.caption).toBe('Contents')
        expect(page.headline).toBe('Navigation rail')
        expect(page.activeHref).toBe('#variants')
        expect(page.activeIndex).toBe(2)
        expect(page.scrollTarget).toBe('#container')
        expect(page.scrollOffset).toBe(64)
        expect(page.updateHash).toBe(false)
        expect(page.contentSelector).toBe('main')
        expect(page.autoDiscover).toBe(true)
        expect(page.indicatorFit).toBe('full')
    })
})

describe('OnThisPageItem', () => {
    it('has correct default properties', () => {
        const item = new OnThisPageItem()
        expect(item.href).toBe('')
        expect(item.target).toBe('')
        expect(item.label).toBe('')
        expect(item.active).toBe(false)
        expect(item.disabled).toBe(false)
        expect(item.level).toBe(1)
        expect(item.index).toBe(0)
    })

    it('allows updating properties', () => {
        const item = new OnThisPageItem()
        item.href = '#variants'
        item.target = 'variants'
        item.label = 'Variants'
        item.active = true
        item.disabled = true
        item.level = 2
        item.index = 3

        expect(item.href).toBe('#variants')
        expect(item.target).toBe('variants')
        expect(item.label).toBe('Variants')
        expect(item.active).toBe(true)
        expect(item.disabled).toBe(true)
        expect(item.level).toBe(2)
        expect(item.index).toBe(3)
    })
})
