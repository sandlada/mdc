// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { isOutsideComposedPath } from '../overlay-boundary'
import { OverlayPlacements } from '../overlay-types'
import {
    assertValidOverlayPoint,
    createVirtualPointElement,
    getDirectionFromPlacement,
    getPlacementSlideOffset,
} from './geometry'

describe('Overlay geometry and boundary', () => {
    it('extracts cardinal direction from placement and rejects invalid values', () => {
        expect(getDirectionFromPlacement(OverlayPlacements.TopStart)).toBe('top')
        expect(getDirectionFromPlacement(OverlayPlacements.BottomEnd)).toBe('bottom')
        expect(getDirectionFromPlacement(OverlayPlacements.Left)).toBe('left')
        expect(getDirectionFromPlacement(OverlayPlacements.RightStart)).toBe('right')
        expect(() => getDirectionFromPlacement('center' as OverlayPlacements)).toThrow()
    })

    it('validates finite coordinates and creates virtual rect at (x, y)', () => {
        expect(assertValidOverlayPoint(120, 240)).toEqual({ x: 120, y: 240 })
        expect(() => assertValidOverlayPoint(Number.NaN, 10)).toThrow()
        expect(() => assertValidOverlayPoint(10, Number.POSITIVE_INFINITY)).toThrow()

        const virtual = createVirtualPointElement(42, 84)
        const rect = virtual.getBoundingClientRect()
        expect(rect.x).toBe(42)
        expect(rect.y).toBe(84)
        expect(rect.width).toBe(0)
        expect(rect.height).toBe(0)
    })

    it('computes slide offset vector by placement direction', () => {
        const offset8 = getPlacementSlideOffset(8)
        expect(offset8(OverlayPlacements.Top)).toEqual({ x: 0, y: 8 })
        expect(offset8(OverlayPlacements.BottomStart)).toEqual({ x: 0, y: -8 })
        expect(offset8(OverlayPlacements.LeftEnd)).toEqual({ x: 8, y: 0 })
        expect(offset8(OverlayPlacements.Right)).toEqual({ x: -8, y: 0 })
    })

    it('detects whether composedPath is outside boundary elements', () => {
        const inside = document.createElement('div')
        const outside = document.createElement('span')
        expect(isOutsideComposedPath([inside, document.body], [inside])).toBe(false)
        expect(isOutsideComposedPath([outside, document.body], [inside, null])).toBe(true)
    })
})
