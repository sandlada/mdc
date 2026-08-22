/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { OnThisPageDefinition, OnThisPageItemDefinition } from '../src/component-definitions/on-this-page.definition'
import { OnThisPage } from '../src/components/on-this-page/on-this-page'
import { OnThisPageItem } from '../src/components/on-this-page/on-this-page-item'

describe('OnThisPageDefinition', () => {
    it('should define container, typography and indicator properties', () => {
        expect(OnThisPageDefinition['enabled-container-width']).toBe('220px')
        expect(OnThisPageDefinition['enabled-caption-font']).toBeDefined()
        expect(OnThisPageDefinition['enabled-headline-font']).toBeDefined()
        expect(OnThisPageDefinition['enabled-active-indicator-outline-color']).toBeDefined()
        expect(OnThisPageDefinition['enabled-active-indicator-outline-width']).toBe('1.5px')
        expect(OnThisPageDefinition['active-indicator-transition-duration']).toBe('400ms')
        expect(OnThisPageDefinition['active-indicator-transition-easing']).toBe('cubic-bezier(0.38, 1.21, 0.22, 1)')
    })

    it('should define item dimensions, label typography and state layers', () => {
        expect(OnThisPageItemDefinition['enabled-container-height']).toBe('38px')
        expect(OnThisPageItemDefinition['enabled-label-font']).toBeDefined()
        expect(OnThisPageItemDefinition['enabled-label-weight-selected']).toBe('700')
        expect(OnThisPageItemDefinition['hovered-state-layer-opacity']).toBe('0.04')
    })
})

describe('OnThisPage and OnThisPageItem classes', () => {
    it('should instantiate components with correct default properties', () => {
        const onThisPage = new OnThisPage()
        expect(onThisPage.caption).toBe('On this page')
        expect(onThisPage.headline).toBe('')
        expect(onThisPage.activeIndex).toBe(0)
        expect(onThisPage.scrollOffset).toBe(96)
        expect(onThisPage.updateHash).toBe(true)
        expect(onThisPage.indicatorFit).toBe('content')

        const item = new OnThisPageItem()
        expect(item.active).toBe(false)
        expect(item.disabled).toBe(false)
        expect(item.level).toBe(1)
        expect(item.targetId).toBe('')

        item.href = '#variants'
        expect(item.targetId).toBe('variants')
    })
})
