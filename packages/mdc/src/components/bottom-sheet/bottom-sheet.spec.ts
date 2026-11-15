/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { BottomSheet } from './bottom-sheet'

describe('BottomSheet', () => {
    it('instantiates with defaults', () => {
        const sheet = new BottomSheet()
        expect(sheet.variant).toBe('modal')
        expect(sheet.open).toBe(false)
        expect(sheet.detent).toBe('peek')
        expect(sheet.quick).toBe(false)
        expect(sheet.cancelable).toBe(true)
        expect(sheet.noFocusTrap).toBe(false)
        expect(sheet.returnValue).toBe('')
        expect(sheet.draggable).toBe(true)
        expect(sheet.hideDragHandle).toBe(false)
        expect(sheet.maxHeight).toBe(0)
    })

    it('allows updating properties', () => {
        const sheet = new BottomSheet()
        sheet.variant = 'standard'
        sheet.detent = 'full'
        sheet.cancelable = false
        sheet.draggable = false
        sheet.hideDragHandle = true
        sheet.maxHeight = 400
        expect(sheet.variant).toBe('standard')
        expect(sheet.detent).toBe('full')
        expect(sheet.cancelable).toBe(false)
        expect(sheet.draggable).toBe(false)
        expect(sheet.hideDragHandle).toBe(true)
        expect(sheet.maxHeight).toBe(400)
    })
})