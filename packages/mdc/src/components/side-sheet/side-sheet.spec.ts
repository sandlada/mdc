/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { SideSheet } from './side-sheet'

describe('SideSheet', () => {
    it('instantiates with defaults', () => {
        const sheet = new SideSheet()
        expect(sheet.variant).toBe('standard')
        expect(sheet.open).toBe(false)
        expect(sheet.position).toBe('right')
        expect(sheet.handleMode).toBe('open-only')
        expect(sheet.maxWidth).toBe(0)
        expect(sheet.quick).toBe(false)
        expect(sheet.cancelable).toBe(true)
        expect(sheet.noFocusTrap).toBe(false)
        expect(sheet.returnValue).toBe('')
        expect(sheet.showBackButton).toBe(false)
        expect(sheet.draggable).toBe(true)
    })

    it('allows updating properties', () => {
        const sheet = new SideSheet()
        sheet.variant = 'modal'
        sheet.position = 'left'
        sheet.handleMode = 'peek'
        sheet.maxWidth = 320
        sheet.quick = true
        sheet.cancelable = false
        sheet.noFocusTrap = true
        sheet.returnValue = 'done'
        sheet.showBackButton = true
        sheet.draggable = false
        expect(sheet.variant).toBe('modal')
        expect(sheet.position).toBe('left')
        expect(sheet.handleMode).toBe('peek')
        expect(sheet.maxWidth).toBe(320)
        expect(sheet.quick).toBe(true)
        expect(sheet.cancelable).toBe(false)
        expect(sheet.noFocusTrap).toBe(true)
        expect(sheet.returnValue).toBe('done')
        expect(sheet.showBackButton).toBe(true)
        expect(sheet.draggable).toBe(false)
    })
})