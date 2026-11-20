/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { BasicDialog } from './basic-dialog'
import { FullscreenDialog } from './fullscreen-dialog'
import { BasicDialogDefinition, FullscreenDialogDefinition } from './dialog.definition'

describe('BasicDialog', () => {
    it('instantiates with defaults', () => {
        const dialog = new BasicDialog()
        expect(dialog.open).toBe(false)
        expect(dialog.quick).toBe(false)
        expect(dialog.returnValue).toBe('')
        expect(dialog.type).toBe('')
        expect(dialog.noFocusTrap).toBe(false)
        expect(dialog.dismissOnClickOutside).toBe(true)
        expect(dialog.dismissOnEscape).toBe(true)
    })

    it('allows updating properties', () => {
        const dialog = new BasicDialog()
        dialog.quick = true
        dialog.returnValue = 'ok'
        dialog.type = 'alert'
        dialog.noFocusTrap = true
        dialog.dismissOnClickOutside = false
        dialog.dismissOnEscape = false
        expect(dialog.quick).toBe(true)
        expect(dialog.returnValue).toBe('ok')
        expect(dialog.type).toBe('alert')
        expect(dialog.noFocusTrap).toBe(true)
        expect(dialog.dismissOnClickOutside).toBe(false)
        expect(dialog.dismissOnEscape).toBe(false)
    })
})

describe('FullscreenDialog', () => {
    it('instantiates with defaults', () => {
        const dialog = new FullscreenDialog()
        expect(dialog.open).toBe(false)
        expect(dialog.quick).toBe(false)
        expect(dialog.returnValue).toBe('')
        expect(dialog.type).toBe('')
        expect(dialog.noFocusTrap).toBe(false)
        expect(dialog.dismissOnClickOutside).toBe(true)
        expect(dialog.dismissOnEscape).toBe(true)
        expect(dialog.closeLabel).toBe('Close')
    })
})

describe('Dialog definitions', () => {
    it('uses -leading instead of -line-height for typescale tokens', () => {
        const basicKeys = Object.keys(BasicDialogDefinition)
        expect(basicKeys).toContain('headline-label-leading')
        expect(basicKeys).toContain('supporting-text-label-leading')
        expect(basicKeys).toContain('action-label-leading')
        expect(basicKeys.some((k) => k.endsWith('-line-height'))).toBe(false)

        const fullscreenKeys = Object.keys(FullscreenDialogDefinition)
        expect(fullscreenKeys).toContain('headline-label-leading')
        expect(fullscreenKeys).toContain('supporting-text-label-leading')
        expect(fullscreenKeys).toContain('action-label-leading')
        expect(fullscreenKeys.some((k) => k.endsWith('-line-height'))).toBe(false)
    })
})
