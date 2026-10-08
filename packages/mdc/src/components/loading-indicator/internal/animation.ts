/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * The loading-indicator animation timeline: maps a (speed-scaled) timeline
 * position to the exact frame the MD3 Expressive indicator must render.
 *
 * Indeterminate: the seven Material shapes are morphed pairwise on a fixed
 * 4666/7 ms (≈666.57 ms) period — the global rotation duration divided by the
 * seven shapes, so the sequence loops seamlessly. The morph factor is a
 * continuous underdamped spring (stiffness 200, damping ratio 0.6) that is
 * re-targeted one shape further every period; the rendered shape index is the
 * floor of the spring value and the fraction is its remainder, so the handoff
 * from one morph to the next is continuous (the spring overshoots slightly
 * into the next shape). The rotation combines a constant 450/7° per period
 * with an additional 90° per period driven by the spring — three full turns
 * per loop, keeping the loop seamless.
 *
 * Determinate: a single circle → SoftBurst morph driven by `progress`, with a
 * counter-clockwise −180° rotation across the whole range.
 */

import { LoadingIndicatorDefinition } from '../loading-indicator.definition'
import { cubicsBoundsCenter, cubicsToPathData, type Morph } from './morph'
import { getDeterminateMorphs, getIndeterminateMorphs } from './material-shapes'
import { springMotionAt, type SpringParameters } from './spring'

/** Duration of the full seven-shape loop: 4666ms, the global rotation duration. */
export const LOOP_DURATION_MS = 4666

/** Duration of one shape period: one seventh of the loop (≈666.57 ms). */
export const SHAPE_PERIOD_MS = LOOP_DURATION_MS / 7

/**
 * Total rotation added by each shape period. The reference loops three full
 * turns per seven shapes (measured from the design video, whose loop is
 * seamless), i.e. 1080/7 ≈ 154.29° per period.
 */
export const ROTATION_PER_PERIOD = (3 * 360) / 7

/** Extra clockwise spin contributed by the morph spring of each period. */
export const SPRING_ROTATION_PER_PERIOD = 90

/** Constant (time-driven) part of the per-period rotation. */
export const CONSTANT_ROTATION_PER_PERIOD = ROTATION_PER_PERIOD - SPRING_ROTATION_PER_PERIOD

/** The morph spring parameters of the reference implementation. */
export const MORPH_SPRING: SpringParameters = { stiffness: 200, dampingRatio: 0.6 }

const morphSpring = springMotionAt(MORPH_SPRING)

/** Parses a pixel size token (e.g. `'48px'`) into its numeric value. */
const parseSizePx = (value: unknown): number => {
    if (typeof value !== 'string') throw new Error(`Expected a pixel size token, received: ${String(value)}`)
    const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim())
    if (!match) throw new Error(`Expected a pixel size token, received: ${value}`)
    return Number(match[1])
}

/** MD3 container size (48px), from the component token definition. */
export const CONTAINER_SIZE_PX = parseSizePx(LoadingIndicatorDefinition['container-size'])

/** MD3 active indicator size (38px), from the component token definition. */
export const INDICATOR_SIZE_PX = parseSizePx(LoadingIndicatorDefinition['indicator-size'])

/**
 * Draw scale of the normalized shapes within the active indicator size: the
 * design reference renders every shape at 35px inside the 38px active size
 * (the shapes span ~73% of the 48px container), which the video measurement
 * of all settled shapes confirms (≈186px at the reference's 256px container).
 */
export const SHAPE_DRAW_SCALE = 35 / 38

/**
 * The uniform path scale of the indeterminate sequence within the indicator
 * viewBox: the shapes are normalized into the unit square, so the scale in
 * viewBox units is `indicator-size × SHAPE_DRAW_SCALE`.
 */
export const getIndeterminateShapeScale = (): number => INDICATOR_SIZE_PX * SHAPE_DRAW_SCALE

/** The uniform path scale of the determinate sequence (see {@link getIndeterminateShapeScale}). */
export const getDeterminateShapeScale = (): number => INDICATOR_SIZE_PX * SHAPE_DRAW_SCALE

/** A single rendered frame of the indicator. */
export interface LoadingIndicatorFrame {
    /** SVG path data of the morphed shape, in normalized `[0, 1]²` coordinates. */
    readonly path: string
    /** Clockwise rotation of the shape, in degrees, about its bounds center. */
    readonly rotation: number
    /** X coordinate of the morphed path's control-point bounds center. */
    readonly centerX: number
    /** Y coordinate of the morphed path's control-point bounds center. */
    readonly centerY: number
}

const frameFromCubics = (cubics: ReturnType<Morph['asCubics']>, rotation: number): LoadingIndicatorFrame => {
    const center = cubicsBoundsCenter(cubics)
    return { path: cubicsToPathData(cubics), rotation, centerX: center.x, centerY: center.y }
}

/**
 * The frame the indeterminate indicator shows at `timelineMs` (already scaled
 * by the `speed` property).
 *
 * The morph factor advances by one per shape period through the continuous
 * spring; its floor selects the morph pair and its remainder the progress
 * within that morph. The rotation is the constant 450/7° per period plus the
 * spring-driven 90° per period.
 */
export const indeterminateFrameAt = (timelineMs: number): LoadingIndicatorFrame => {
    if (!Number.isFinite(timelineMs) || timelineMs < 0) {
        throw new Error('Timeline position must be a finite, non-negative number')
    }
    const morphs = getIndeterminateMorphs()
    const cycle = Math.floor(timelineMs / SHAPE_PERIOD_MS)
    const elapsed = timelineMs - cycle * SHAPE_PERIOD_MS
    // The spring animates from the previous shape (settled) to the next one.
    const morphFactor = cycle + morphSpring(0, 0, elapsed, 1).value
    const shapeIndex = ((Math.floor(morphFactor) % morphs.length) + morphs.length) % morphs.length
    const progress = morphFactor - Math.floor(morphFactor)
    // Each completed period contributes the constant rotation plus the full
    // spring rotation; within the current period the constant part advances
    // linearly and the spring part follows the morph factor.
    const rotation =
        (CONSTANT_ROTATION_PER_PERIOD + SPRING_ROTATION_PER_PERIOD) * cycle +
        CONSTANT_ROTATION_PER_PERIOD * (elapsed / SHAPE_PERIOD_MS) +
        SPRING_ROTATION_PER_PERIOD * (morphFactor - cycle)
    return frameFromCubics(morphs[shapeIndex].asCubics(progress), rotation)
}

/**
 * The frame the determinate indicator shows for `progress` (`0`–`1`,
 * clamped): the single circle → SoftBurst morph, rotated −180° across the
 * whole range.
 */
export const determinateFrameAt = (progress: number): LoadingIndicatorFrame => {
    if (!Number.isFinite(progress)) throw new Error('Progress must be a finite number')
    const clamped = Math.min(1, Math.max(0, progress))
    const cubics = getDeterminateMorphs()[0].asCubics(clamped)
    return frameFromCubics(cubics, -clamped * 180)
}
