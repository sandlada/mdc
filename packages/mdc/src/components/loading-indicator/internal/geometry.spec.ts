/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    Morph,
    SHAPE_PERIOD_MS,
    calculateScaleFactor,
    determinateFrameAt,
    estimateAnimationDurationMillis,
    getDeterminateMorphs,
    getDeterminatePolygons,
    getIndeterminateMorphs,
    getIndeterminatePolygons,
    indeterminateFrameAt,
    springMotionAt,
    type RoundedPolygon,
} from './index'

const boundsOf = (polygon: RoundedPolygon): [number, number, number, number] => {
    const bounds = polygon.calculateBounds(new Float64Array(4))
    return [bounds[0], bounds[1], bounds[2], bounds[3]]
}

describe('loading-indicator geometry', () => {
    it('normalizes every indeterminate shape into the centered unit square', () => {
        const polygons = getIndeterminatePolygons()
        expect(polygons).toHaveLength(7)
        for (const polygon of polygons) {
            const [left, top, right, bottom] = boundsOf(polygon)
            const width = right - left
            const height = bottom - top
            // The larger dimension spans exactly the unit square…
            expect(Math.max(width, height)).toBeCloseTo(1, 5)
            // …and the shape is centered.
            expect((left + right) / 2).toBeCloseTo(0.5, 5)
            expect((top + bottom) / 2).toBeCloseTo(0.5, 5)
        }
    })

    it('builds a closed circular morph sequence of seven morphs', () => {
        const morphs = getIndeterminateMorphs()
        expect(morphs).toHaveLength(7)
        for (const morph of morphs) {
            const cubics = morph.asCubics(0)
            expect(cubics.length).toBeGreaterThan(1)
            // The outline is contiguous and closed.
            for (let i = 1; i < cubics.length; i++) {
                expect(cubics[i].anchor0X).toBeCloseTo(cubics[i - 1].anchor1X, 9)
                expect(cubics[i].anchor0Y).toBeCloseTo(cubics[i - 1].anchor1Y, 9)
            }
            const last = cubics[cubics.length - 1]
            expect(last.anchor1X).toBeCloseTo(cubics[0].anchor0X, 9)
            expect(last.anchor1Y).toBeCloseTo(cubics[0].anchor0Y, 9)
        }
    })

    it('reproduces the start shape at progress 0 for every morph', () => {
        const polygons = getIndeterminatePolygons()
        const morphs = getIndeterminateMorphs()
        for (let i = 0; i < polygons.length; i++) {
            // At progress 0 the morph renders the (possibly cut) start shape;
            // its control-point bounds must match the start polygon's.
            const cubics = morphs[i].asCubics(0)
            let minX = Infinity
            let minY = Infinity
            let maxX = -Infinity
            let maxY = -Infinity
            for (const cubic of cubics) {
                minX = Math.min(minX, cubic.anchor0X, cubic.control0X, cubic.control1X, cubic.anchor1X)
                minY = Math.min(minY, cubic.anchor0Y, cubic.control0Y, cubic.control1Y, cubic.anchor1Y)
                maxX = Math.max(maxX, cubic.anchor0X, cubic.control0X, cubic.control1X, cubic.anchor1X)
                maxY = Math.max(maxY, cubic.anchor0Y, cubic.control0Y, cubic.control1Y, cubic.anchor1Y)
            }
            const [left, top, right, bottom] = boundsOf(polygons[i])
            // Cut curves shift the control polygon slightly; allow a small margin.
            expect(minX).toBeGreaterThan(left - 0.02)
            expect(minY).toBeGreaterThan(top - 0.02)
            expect(maxX).toBeLessThan(right + 0.02)
            expect(maxY).toBeLessThan(bottom + 0.02)
        }
    })

    it('computes the rotation-headroom scale factor of the sequence', () => {
        // The oval is the limiting shape: its max bounds exceed its bounds by
        // the rotation headroom, which yields the shared scale of the sequence.
        expect(calculateScaleFactor(getIndeterminatePolygons())).toBeCloseTo(0.8656, 3)
        expect(calculateScaleFactor(getDeterminatePolygons())).toBeCloseTo(1, 3)
    })

    it('builds a single determinate morph from circle to soft burst', () => {
        expect(getDeterminatePolygons()).toHaveLength(2)
        expect(getDeterminateMorphs()).toHaveLength(1)
        expect(getDeterminateMorphs()[0]).toBeInstanceOf(Morph)
    })

    it('estimates the morph spring duration exactly like the reference', () => {
        // Compose `spring(stiffness = 200, dampingRatio = 0.6, visibilityThreshold = 0.1)`.
        expect(
            estimateAnimationDurationMillis({
                stiffness: 200,
                dampingRatio: 0.6,
                initialVelocity: 0,
                initialDisplacement: (0 - 1) / 0.1,
                delta: 1,
            }),
        ).toBe(297)
    })

    it('integrates an underdamped spring that overshoots then settles', () => {
        const spring = springMotionAt({ stiffness: 200, dampingRatio: 0.6 })
        expect(spring(0, 0, 0, 1).value).toBe(0)
        let peak = 0
        for (let t = 0; t <= 400; t += 5) peak = Math.max(peak, spring(0, 0, t, 1).value)
        // The 0.6 damping ratio overshoots by roughly 9.5%.
        expect(peak).toBeGreaterThan(1.08)
        expect(peak).toBeLessThan(1.11)
        expect(Math.abs(spring(0, 0, 544, 1).value - 1)).toBeLessThan(0.01)
        expect(spring(0, 0, 1000, 1).value).toBeCloseTo(1, 3)
    })

    it('rejects invalid inputs fast', () => {
        expect(() => indeterminateFrameAt(-1)).toThrow()
        expect(() => determinateFrameAt(Number.NaN)).toThrow()
        expect(() => springMotionAt({ stiffness: 0, dampingRatio: 0.6 })(0, 0, 0, 1)).toThrow()
        expect(() => springMotionAt({ stiffness: 200, dampingRatio: -1 })(0, 0, 0, 1)).toThrow()
    })

    it('runs the indeterminate loop on seven shape periods per global turn', () => {
        // 4666ms (the global rotation duration) divided by the seven shapes.
        expect(SHAPE_PERIOD_MS).toBeCloseTo(666.5714, 3)
        // The very first frame is the soft burst at the canonical orientation.
        const first = indeterminateFrameAt(0)
        expect(first.rotation).toBeCloseTo(0, 6)
        const startPath = getIndeterminateMorphs()[0].asCubics(0)
        expect(first.path.length).toBeGreaterThan(100)
        expect(first.centerX).toBeCloseTo(0.5, 1)
        expect(startPath.length).toBeGreaterThan(1)
    })

    it('keeps the indeterminate rotation continuous across period handoffs', () => {
        for (const boundary of [SHAPE_PERIOD_MS, 2 * SHAPE_PERIOD_MS, 3 * SHAPE_PERIOD_MS]) {
            const before = indeterminateFrameAt(boundary - 0.5).rotation
            const after = indeterminateFrameAt(boundary + 0.5).rotation
            expect(Math.abs(after - before)).toBeLessThan(1)
        }
        // Rotation advances steadily: one full turn per loop plus the spring spin.
        const t0 = indeterminateFrameAt(0).rotation
        const t1 = indeterminateFrameAt(4666).rotation
        expect(t1 - t0).toBeGreaterThan(900)
        expect(t1 - t0).toBeLessThan(1100)
    })

    it('renders determinate frames with a counter-clockwise half turn', () => {
        expect(determinateFrameAt(0).rotation).toBeCloseTo(0, 6)
        expect(determinateFrameAt(0.5).rotation).toBeCloseTo(-90, 6)
        expect(determinateFrameAt(1).rotation).toBeCloseTo(-180, 6)
        // Progress is clamped.
        expect(determinateFrameAt(2).rotation).toBeCloseTo(-180, 6)
        expect(determinateFrameAt(-1).rotation).toBeCloseTo(0, 6)
        // The path is a valid closed SVG path.
        const frame = determinateFrameAt(0.5)
        expect(frame.path.startsWith('M')).toBe(true)
        expect(frame.path.endsWith('Z')).toBe(true)
        expect(frame.path).toContain('C')
        expect(Number.isFinite(frame.centerX)).toBe(true)
        expect(Number.isFinite(frame.centerY)).toBe(true)
    })
})
