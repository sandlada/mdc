/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { Divider } from './divider'

describe('mdc-divider component', () => {
    it('initializes with default properties', () => {
        const el = new Divider()
        expect(el.inset).toBe(false)
        expect(el.insetStart).toBe(false)
        expect(el.insetEnd).toBe(false)
    })

    it('allows toggling inset properties', () => {
        const el = new Divider()
        el.inset = true
        el.insetStart = true
        el.insetEnd = true
        expect(el.inset).toBe(true)
        expect(el.insetStart).toBe(true)
        expect(el.insetEnd).toBe(true)
    })
})
