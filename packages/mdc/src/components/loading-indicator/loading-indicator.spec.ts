/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCLoadingIndicator } from './loading-indicator'
import { LOADING_INDICATOR_COMPLETE_EVENT } from './loading-indicator.interface'

describe('MDCLoadingIndicator', () => {
    it('has correct default properties', () => {
        const indicator = new MDCLoadingIndicator()
        expect(indicator.indeterminate).toBe(false)
        expect(indicator.progress).toBe(0)
        expect(indicator.variant).toBe('primary')
        expect(indicator.contained).toBe(false)
        expect(indicator.speed).toBe(1)
    })

    it('allows updating every property', () => {
        const indicator = new MDCLoadingIndicator()
        indicator.indeterminate = true
        indicator.progress = 0.5
        indicator.variant = 'error'
        indicator.contained = true
        indicator.speed = 2
        expect(indicator.indeterminate).toBe(true)
        expect(indicator.progress).toBe(0.5)
        expect(indicator.variant).toBe('error')
        expect(indicator.contained).toBe(true)
        expect(indicator.speed).toBe(2)
    })

    it('exposes the complete event name as part of the contract', () => {
        expect(LOADING_INDICATOR_COMPLETE_EVENT).toBe('loading-indicator-complete')
    })

    it('resolves the very first determinate frame before the first render', () => {
        const indicator = new MDCLoadingIndicator()
        // `willUpdate` is what Lit calls before the first render.
        const internal = indicator as any
        internal.willUpdate(new Map())
        const frame = internal.currentFrame
        expect(frame).not.toBeNull()
        expect(frame.rotation).toBeCloseTo(0, 6)
        expect(frame.path.startsWith('M')).toBe(true)
    })
})
