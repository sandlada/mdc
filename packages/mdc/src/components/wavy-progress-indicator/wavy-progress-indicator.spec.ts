/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import {
    buildCircularWavyPath,
    buildLinearWavyPath,
    clamp01,
    computeCapProtrusion,
    computeCircularIndeterminateArc,
    computeLinearIndeterminateSegments,
    computeTargetAmplitude,
    stepAmplitudeTransition,
    stepSpring,
    wrapPositiveModulo,
} from './internal/wavy-math'
import { MDCWavyProgressIndicator } from './wavy-progress-indicator'

describe('wavy-math', () => {
    it('clamps values to [0, 1]', () => {
        expect(clamp01(-0.5)).toBe(0)
        expect(clamp01(0)).toBe(0)
        expect(clamp01(0.42)).toBe(0.42)
        expect(clamp01(1.5)).toBe(1)
        expect(clamp01(Number.NaN)).toBe(0)
    })

    it('follows Compose indicatorAmplitude thresholds (<= 0.1 and >= 0.95 are flat)', () => {
        expect(computeTargetAmplitude(0, false, null)).toBe(0)
        expect(computeTargetAmplitude(0.1, false, null)).toBe(0)
        expect(computeTargetAmplitude(0.11, false, null)).toBe(1)
        expect(computeTargetAmplitude(0.5, false, null)).toBe(1)
        expect(computeTargetAmplitude(0.949, false, null)).toBe(1)
        expect(computeTargetAmplitude(0.95, false, null)).toBe(0)
        expect(computeTargetAmplitude(1, false, null)).toBe(0)

        expect(computeTargetAmplitude(0, true, null)).toBe(1)
        expect(computeTargetAmplitude(1, true, null)).toBe(1)

        expect(computeTargetAmplitude(0.5, false, 0.4)).toBe(0.4)
        expect(computeTargetAmplitude(0.5, false, 2)).toBe(1)

        const customFn = (p: number) => (p > 0.25 && p < 0.75 ? 0.6 : 0)
        expect(computeTargetAmplitude(0.2, false, customFn)).toBe(0)
        expect(computeTargetAmplitude(0.5, false, customFn)).toBe(0.6)
    })

    it('wraps negative/positive phase modulo and computes cap protrusion', () => {
        expect(wrapPositiveModulo(-10, 40)).toBe(30)
        expect(wrapPositiveModulo(50, 40)).toBe(10)
        expect(computeCapProtrusion(4, 'round')).toBe(2)
        expect(computeCapProtrusion(4, 'square')).toBe(2)
        expect(computeCapProtrusion(4, 'butt')).toBe(0)
    })

    it('integrates critically damped spring without overshooting', () => {
        let state = { value: 0, velocity: 0 }
        for (let i = 0; i < 120; i++) {
            state = stepSpring(state, 1, 1 / 60)
            expect(state.value).toBeGreaterThanOrEqual(0)
            expect(state.value).toBeLessThanOrEqual(1)
        }
        expect(state.value).toBe(1)
        expect(state.velocity).toBe(0)

        for (let i = 0; i < 120; i++) {
            state = stepSpring(state, 0, 1 / 60)
            expect(state.value).toBeGreaterThanOrEqual(0)
            expect(state.value).toBeLessThanOrEqual(1)
        }
        expect(state.value).toBe(0)
    })

    it('transitions amplitude smoothly over 500ms', () => {
        let transition = { from: 0, target: 1, current: 0, elapsedMs: 0 }
        transition = stepAmplitudeTransition(transition, 250)
        expect(transition.current).toBeGreaterThan(0.5)
        expect(transition.current).toBeLessThan(1)

        transition = stepAmplitudeTransition(transition, 250)
        expect(transition.current).toBe(1)
        expect(transition.elapsedMs).toBe(500)
    })

    it('computes valid indeterminate linear segments across the 1750ms cycle', () => {
        for (const t of [0, 250, 500, 900, 1200, 1600, 1749]) {
            const [seg1, seg2] = computeLinearIndeterminateSegments(t)
            expect(seg1.tail).toBeGreaterThanOrEqual(0)
            expect(seg1.head).toBeLessThanOrEqual(1)
            expect(seg1.head).toBeGreaterThanOrEqual(seg1.tail)
            expect(seg2.tail).toBeGreaterThanOrEqual(0)
            expect(seg2.head).toBeLessThanOrEqual(1)
            expect(seg2.head).toBeGreaterThanOrEqual(seg2.tail)
        }
    })

    it('computes valid indeterminate circular arc sweeps in [0.1, 0.87] turns', () => {
        const minSweep = 0.1 * 2 * Math.PI - 1e-4
        const maxSweep = 0.87 * 2 * Math.PI + 1e-4
        for (const t of [0, 1500, 3000, 4500, 5999]) {
            const arc = computeCircularIndeterminateArc(t)
            expect(arc.sweepAngleRad).toBeGreaterThanOrEqual(minSweep)
            expect(arc.sweepAngleRad).toBeLessThanOrEqual(maxSweep)
        }
    })

    it('builds flat and wavy linear/circular SVG paths', () => {
        expect(buildLinearWavyPath(10, 5, 5, 3, 40, 0)).toBe('')
        expect(buildLinearWavyPath(2, 100, 5, 0, 40, 0)).toBe('M 2.00 5.00 L 100.00 5.00')

        const wavyLinear = buildLinearWavyPath(2, 100, 5, 3, 40, 0)
        expect(wavyLinear.startsWith('M 2.00 ')).toBe(true)
        expect(wavyLinear.split('L ').length).toBeGreaterThan(20)

        expect(buildCircularWavyPath(32, 32, 24, 0, 0, 2, 6, 0)).toBe('')
        const flatArc = buildCircularWavyPath(32, 32, 24, -Math.PI / 2, Math.PI, 0, 6, 0)
        expect(flatArc).toContain(' A 24.00 24.00 ')

        const wavyArc = buildCircularWavyPath(32, 32, 24, -Math.PI / 2, Math.PI, 2, 6, 0)
        expect(wavyArc.split('L ').length).toBeGreaterThan(20)
    })
})

describe('MDCWavyProgressIndicator', () => {
    it('has correct default properties', () => {
        const indicator = new MDCWavyProgressIndicator()
        expect(indicator.variant).toBe('linear')
        expect(indicator.value).toBe(0)
        expect(indicator.max).toBe(1)
        expect(indicator.indeterminate).toBe(false)
        expect(indicator.circularSize).toBe('medium')
        expect(indicator.wavelength).toBeNull()
        expect(indicator.waveSpeed).toBeNull()
        expect(indicator.amplitude).toBeNull()
    })

    it('allows updating every property', () => {
        const indicator = new MDCWavyProgressIndicator()
        indicator.variant = 'circular'
        indicator.value = 0.5
        indicator.max = 2
        indicator.indeterminate = true
        indicator.circularSize = 'large'
        indicator.wavelength = 32
        indicator.waveSpeed = 64
        indicator.amplitude = 0.8

        expect(indicator.variant).toBe('circular')
        expect(indicator.value).toBe(0.5)
        expect(indicator.max).toBe(2)
        expect(indicator.indeterminate).toBe(true)
        expect(indicator.circularSize).toBe('large')
        expect(indicator.wavelength).toBe(32)
        expect(indicator.waveSpeed).toBe(64)
        expect(indicator.amplitude).toBe(0.8)
    })

    it('supports Jetpack Compose stroke, cap, gap, stop, and amplitude callback customizations', async () => {
        const indicator = document.createElement('mdc-wavy-progress-indicator') as MDCWavyProgressIndicator
        indicator.value = 0.5
        indicator.strokeWidth = 6
        indicator.trackStrokeWidth = 2
        indicator.strokeCap = 'butt'
        indicator.trackStrokeCap = 'square'
        indicator.gapSize = 0
        indicator.stopSize = 0
        indicator.waveAmplitude = 5
        indicator.waveSpeed = -40
        indicator.animated = false
        indicator.amplitude = (p) => (p >= 0.4 ? 0.5 : 0)
        document.body.appendChild(indicator)
        await indicator.updateComplete

        const activePath = indicator.shadowRoot?.querySelector('.active-path') as SVGPathElement
        const trackPath = indicator.shadowRoot?.querySelector('.track-path') as SVGPathElement
        const stopDot = indicator.shadowRoot?.querySelector('.stop-dot') as SVGCircleElement

        expect(activePath.style.strokeWidth).toBe('6px')
        expect(trackPath.style.strokeWidth).toBe('2px')
        expect(activePath.style.strokeLinecap).toBe('butt')
        expect(trackPath.style.strokeLinecap).toBe('square')
        expect(Number(stopDot.getAttribute('r'))).toBe(0)

        indicator.remove()
    })

    it('renders progressbar ARIA and SVG paths for determinate linear and circular', async () => {
        const indicator = document.createElement('mdc-wavy-progress-indicator') as MDCWavyProgressIndicator
        indicator.value = 0.5
        document.body.appendChild(indicator)
        await indicator.updateComplete

        const progressEl = indicator.shadowRoot?.querySelector('.progress')
        expect(progressEl?.getAttribute('role')).toBe('progressbar')
        expect(progressEl?.getAttribute('aria-valuemin')).toBe('0')
        expect(progressEl?.getAttribute('aria-valuemax')).toBe('1')
        expect(progressEl?.getAttribute('aria-valuenow')).toBe('0.5')

        const activePath = indicator.shadowRoot?.querySelector('.active-path')
        const trackPath = indicator.shadowRoot?.querySelector('.track-path')
        const stopDot = indicator.shadowRoot?.querySelector('.stop-dot')
        expect(activePath?.getAttribute('d')).not.toBe('')
        expect(trackPath?.getAttribute('d')).not.toBe('')
        expect(Number(stopDot?.getAttribute('r'))).toBeGreaterThan(0)

        indicator.indeterminate = true
        await indicator.updateComplete
        expect(progressEl?.hasAttribute('aria-valuenow')).toBe(false)

        indicator.indeterminate = false
        indicator.variant = 'circular'
        await indicator.updateComplete
        expect(activePath?.getAttribute('d')).not.toBe('')
        expect(trackPath?.getAttribute('d')).not.toBe('')

        indicator.remove()
    })
})
