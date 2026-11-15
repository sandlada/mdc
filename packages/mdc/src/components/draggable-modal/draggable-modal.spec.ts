/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCDraggableModal } from './draggable-modal'
import { DraggableModalController } from './draggable-modal-controller'

describe('MDCDraggableModal', () => {
    it('initializes with default properties', () => {
        const el = new MDCDraggableModal()
        expect(el.boundaryProtection).toBe(false)
        expect(el.position).toBe('fixed')
    })

    it('allows updating properties', () => {
        const el = new MDCDraggableModal()
        el.boundaryProtection = true
        el.position = 'absolute'
        expect(el.boundaryProtection).toBe(true)
        expect(el.position).toBe('absolute')
    })
})

describe('DraggableModalController', () => {
    it('initializes with default properties', () => {
        const host = { requestUpdate: () => {} } as unknown as any
        const controller = new DraggableModalController(host)
        expect(controller.position).toEqual({ x: 0, y: 0 })
        expect(controller.positioningMode).toBe('fixed')
        expect(controller.boundaryProtection).toBe(false)
        expect(controller.isDragging).toBe(false)
    })

    it('accepts config overrides', () => {
        const host = { requestUpdate: () => {} } as unknown as any
        const controller = new DraggableModalController(host, {
            initialX: 10,
            initialY: 20,
            positioningMode: 'absolute',
            boundaryProtection: true,
        })
        expect(controller.position).toEqual({ x: 10, y: 20 })
        expect(controller.positioningMode).toBe('absolute')
        expect(controller.boundaryProtection).toBe(true)
    })
})