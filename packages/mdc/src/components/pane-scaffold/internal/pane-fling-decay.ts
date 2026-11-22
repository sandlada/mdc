/**
 * @license
 * Copyright 2020 The Android Open Source Project
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: Apache-2.0
 */
import type { IPaneExpansionMotion, IPaneExpansionTrajectory } from '../pane-scaffold.interface'
import { invertUnitCurve, unitBezier } from './pane-curve'

// Adapted from AndroidX SplineBasedDecay.kt. CSS pixels play the role of dp.
const Inflection = 0.35
const DecelerationRate = Math.log(0.78) / Math.log(0.9)
const Friction = 0.015 * 9.80665 * 39.37 * 160 * 0.84

const timeAt = unitBezier(Inflection / 2, Inflection)
const distanceAt = unitBezier(0.5, 1)
const parameterAtTime = invertUnitCurve(timeAt)
const parameterAtDistance = invertUnitCurve(distanceAt)

export type PaneFlingDecay = IPaneExpansionMotion & IPaneExpansionTrajectory

export const resolveFlingDecay = (position: number, velocity: number, min: number, max: number): PaneFlingDecay | undefined => {
    const speed = Math.abs(velocity)
    if (speed <= 1) return
    const timeScale = (Inflection * speed / Friction) ** (1 / (DecelerationRate - 1))
    const duration = timeScale * 1000
    const distance = Inflection * velocity * timeScale
    const bound = velocity < 0 ? min : max
    const fraction = Math.max(0, (bound - position) / distance)
    const clipped = fraction < 1
    const stop = clipped ? parameterAtDistance(fraction) : 1
    const stopTime = duration * timeAt(stop)
    const end = clipped ? bound : position + distance
    const inverse = 1 - stop
    const distanceSlope = 1.5 * inverse ** 2 + 3 * inverse * stop
    const timeSlope = 1.5 * Inflection * inverse ** 2 + 3 * Inflection * inverse * stop + 3 * (1 - Inflection) * stop ** 2
    return {
        duration: fraction === 0 ? 0 : stopTime,
        position: end,
        velocity: distance / timeScale * distanceSlope / timeSlope,
        positionAt: milliseconds => {
            if (milliseconds <= 0) return position
            if (milliseconds >= stopTime) return end
            return position + distance * distanceAt(parameterAtTime(milliseconds / duration))
        },
    }
}
