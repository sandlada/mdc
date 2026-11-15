/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { BasicDialog } from './basic-dialog'

describe('BasicDialog', () => {
    it('instantiates with defaults', () => {
        const dialog = new BasicDialog()
        expect(dialog.open).toBe(false)
        expect(dialog.quick).toBe(false)
        expect(dialog.returnValue).toBe('')
        expect(dialog.type).toBe('')
        expect(dialog.noFocusTrap).toBe(false)
    })

    it('allows updating properties', () => {
        const dialog = new BasicDialog()
        dialog.quick = true
        dialog.returnValue = 'ok'
        dialog.type = 'alert'
        dialog.noFocusTrap = true
        expect(dialog.quick).toBe(true)
        expect(dialog.returnValue).toBe('ok')
        expect(dialog.type).toBe('alert')
        expect(dialog.noFocusTrap).toBe(true)
    })
})