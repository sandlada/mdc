/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCIcon } from './icon'

describe('MDCIcon', () => {
    it('has correct default properties', () => {
        const icon = new MDCIcon()
        expect(icon.name).toBeUndefined()
        expect(icon.filled).toBe(false)
        expect(icon.weight).toBe(400)
        expect(icon.grade).toBe(0)
        expect(icon.opticalSize).toBe(24)
    })

    it('allows updating every property', () => {
        const icon = new MDCIcon()
        icon.name = 'send'
        icon.filled = true
        icon.weight = 700
        icon.grade = 200
        icon.opticalSize = 48
        expect(icon.name).toBe('send')
        expect(icon.filled).toBe(true)
        expect(icon.weight).toBe(700)
        expect(icon.grade).toBe(200)
        expect(icon.opticalSize).toBe(48)
    })
})