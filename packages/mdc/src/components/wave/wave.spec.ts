/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { CircularWave } from './circular-wave'
import { LinearWave } from './linear-wave'

describe('CircularWave', () => {
    it('initializes with default properties', () => {
        const el = new CircularWave()
        expect(el.wavelength).toBe(12)
        expect(el.waveAmplitude).toBe(4)
        expect(el.height).toBe(4)
        expect(el.radius).toBe(80)
        expect(el.waveCount).toBe(20)
        expect(el.speed).toBe(0.05)
        expect(el.phase).toBe(0)
    })

    it('allows updating properties', () => {
        const el = new CircularWave()
        el.radius = 100
        el.waveCount = 10
        el.speed = 0.1
        el.phase = 1
        el.waveAmplitude = 6
        expect(el.radius).toBe(100)
        expect(el.waveCount).toBe(10)
        expect(el.speed).toBe(0.1)
        expect(el.phase).toBe(1)
        expect(el.waveAmplitude).toBe(6)
    })
})

describe('LinearWave', () => {
    it('initializes with default properties', () => {
        const el = new LinearWave()
        expect(el.wavelength).toBe(12)
        expect(el.waveAmplitude).toBe(4)
        expect(el.height).toBe(8)
        expect(el.speed).toBe(0.1)
        expect(el.phase).toBe(0)
    })

    it('allows updating properties', () => {
        const el = new LinearWave()
        el.wavelength = 20
        el.speed = 0.2
        el.phase = 2
        el.height = 12
        expect(el.wavelength).toBe(20)
        expect(el.speed).toBe(0.2)
        expect(el.phase).toBe(2)
        expect(el.height).toBe(12)
    })
})