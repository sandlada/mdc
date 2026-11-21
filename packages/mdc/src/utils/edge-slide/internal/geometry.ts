/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { Placement } from '../edge-slide-controller'

export const getEdgeSlideDimension = (placement: Placement): 'width' | 'height' =>
    placement === 'top' || placement === 'bottom' ? 'height' : 'width'

const getHiddenEdgeSize = (floating: boolean) => (peekSize: number): number =>
    floating ? Math.max(0, peekSize) : 0

const getFullCloseOffset = (placement: Placement) => (naturalSize: number): number => {
    switch (placement) {
        case 'bottom':
        case 'left': return naturalSize
        case 'right': return -naturalSize
        case 'top': return 0
    }
}

export const getEdgeSlideGeometry = (placement: Placement, floating: boolean) => (peekSize: number) => (naturalSize: number) => {
    const dimension = getEdgeSlideDimension(placement)
    const translation = dimension === 'height' ? 'translateY' : 'translateX'
    const hiddenSize = getHiddenEdgeSize(floating)(peekSize)
    // Top and left peek modes reveal the opposite side of the inner container.
    const peekOffset = placement === 'top' || placement === 'left' ? -Math.max(0, naturalSize - hiddenSize) : 0
    const closeOffset = floating ? peekOffset : getFullCloseOffset(placement)(naturalSize)
    const openOffset = floating ? closeOffset : -closeOffset
    return { dimension, translation, hiddenSize, openOffset, closeOffset }
}
