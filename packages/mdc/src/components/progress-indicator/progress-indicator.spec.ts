/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCProgressIndicator } from './progress-indicator'

describe('MDCProgressIndicator', () => {
    it('has correct default properties', () => {
        const indicator = new MDCProgressIndicator()
        expect(indicator.variant).toBe('linear')
        expect(indicator.value).toBe(0)
        expect(indicator.max).toBe(1)
        expect(indicator.indeterminate).toBe(false)
        expect(indicator.circularSize).toBe('medium')
    })

    it('allows updating every property', () => {
        const indicator = new MDCProgressIndicator()
        indicator.variant = 'circular'
        indicator.value = 0.5
        indicator.max = 2
        indicator.indeterminate = true
        indicator.circularSize = 'large'
        expect(indicator.variant).toBe('circular')
        expect(indicator.value).toBe(0.5)
        expect(indicator.max).toBe(2)
        expect(indicator.indeterminate).toBe(true)
        expect(indicator.circularSize).toBe('large')
    })
})