/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { PullToRefreshState } from './pull-to-refresh.interface'
import {
    applyPullResistance,
    computeIndicatorScale,
    computePullProgress,
    resolvePullState,
} from './internal/pull-physics'

describe('pull-physics pure functions', () => {
    it('returns 0 for non-positive deltaY', () => {
        expect(applyPullResistance(0, 80, 144, 0.5)).toBe(0)
        expect(applyPullResistance(-20, 80, 144, 0.5)).toBe(0)
    })

    it('scales linearly by dragMultiplier up to threshold and applies asymptotic damping past threshold', () => {
        expect(applyPullResistance(100, 80, 144, 0.5)).toBe(50)
        expect(applyPullResistance(160, 80, 144, 0.5)).toBe(80)

        const damped = applyPullResistance(320, 80, 144, 0.5)
        expect(damped).toBeGreaterThan(80)
        expect(damped).toBeLessThan(144)
    })

    it('throws on invalid threshold, maxPullDistance, or dragMultiplier', () => {
        expect(() => applyPullResistance(50, 0, 144, 0.5)).toThrow()
        expect(() => applyPullResistance(50, 80, 60, 0.5)).toThrow()
        expect(() => applyPullResistance(50, 80, 144, 0)).toThrow()
        expect(() => applyPullResistance(50, 80, 144, 1.5)).toThrow()
    })

    it('computes clamped pull progress in [0, 1]', () => {
        expect(computePullProgress(0, 80)).toBe(0)
        expect(computePullProgress(40, 80)).toBe(0.5)
        expect(computePullProgress(120, 80)).toBe(1)
    })

    it('resolves lifecycle states accurately', () => {
        expect(resolvePullState(0, 80, false)).toBe(PullToRefreshState.Idle)
        expect(resolvePullState(40, 80, false)).toBe(PullToRefreshState.Pulling)
        expect(resolvePullState(80, 80, false)).toBe(PullToRefreshState.Ready)
        expect(resolvePullState(0, 80, true)).toBe(PullToRefreshState.Refreshing)
    })

    it('computes indicator scale for each state', () => {
        expect(computeIndicatorScale(0, PullToRefreshState.Idle)).toBe(0)
        expect(computeIndicatorScale(0.5, PullToRefreshState.Pulling)).toBe(0.5)
        expect(computeIndicatorScale(1, PullToRefreshState.Ready)).toBe(1)
        expect(computeIndicatorScale(0.2, PullToRefreshState.Refreshing)).toBe(1)
    })
})
