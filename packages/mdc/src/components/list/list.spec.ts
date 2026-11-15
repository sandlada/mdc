/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCList } from './list'
import { MDCListItem } from './list-item'

describe('MDCList', () => {
    it('instantiates with defaults', () => {
        const list = new MDCList()
        expect(list.items).toEqual([])
    })
})

describe('MDCListItem', () => {
    it('instantiates with defaults', () => {
        const item = new MDCListItem()
        expect(item.type).toBe('text')
        expect(item.disabled).toBe(false)
        expect(item.href).toBe('')
        expect(item.target).toBe('')
        expect(item.selected).toBe(false)
        expect(item.listTabIndex).toBe(0)
        expect(item.isInteractive).toBe(false)
        expect(item.isDisabled).toBe(false)
    })

    it('type becomes link when href is set', () => {
        const item = new MDCListItem()
        item.type = 'button'
        item.href = 'https://example.com'
        ;(item as any).willUpdate(new Map())
        expect(item.type).toBe('link')
        expect(item.target).toBe('')
    })
})