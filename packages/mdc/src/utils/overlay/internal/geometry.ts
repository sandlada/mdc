/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { VirtualElement } from '@floating-ui/dom'
import type { OverlayDirection, OverlayPlacements } from '../overlay-types'

export interface IOverlayPoint {
    readonly x: number
    readonly y: number
}

export const getDirectionFromPlacement = (placement: OverlayPlacements): OverlayDirection => {
    const primary = placement.split('-')[0]
    if (primary === 'top' || primary === 'bottom' || primary === 'left' || primary === 'right') {
        return primary
    }
    throw new Error(`Invalid overlay placement: "${placement}"`)
}

export const assertValidOverlayPoint = (x: number, y: number): IOverlayPoint => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Overlay coordinates must be finite numbers, received (${x}, ${y})`)
    }
    return { x, y }
}

export const createVirtualPointElement = (x: number, y: number): VirtualElement => {
    const point = assertValidOverlayPoint(x, y)
    return {
        getBoundingClientRect(): DOMRect {
            return {
                x: point.x,
                y: point.y,
                top: point.y,
                left: point.x,
                bottom: point.y,
                right: point.x,
                width: 0,
                height: 0,
                toJSON() {
                    return this
                },
            } as DOMRect
        },
    }
}

export const getPlacementSlideOffset = (distancePx: number) => (placement: OverlayPlacements): IOverlayPoint => {
    switch (getDirectionFromPlacement(placement)) {
        case 'top':
            return { x: 0, y: distancePx }
        case 'bottom':
            return { x: 0, y: -distancePx }
        case 'left':
            return { x: distancePx, y: 0 }
        case 'right':
            return { x: -distancePx, y: 0 }
    }
}
