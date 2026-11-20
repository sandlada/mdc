/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Re-exports shared pure overlay geometry/boundary helpers from `utils/controller`.
 */
export {
    assertValidOverlayPoint as assertValidPoint,
    createVirtualPointElement,
    getDirectionFromPlacement,
    getPlacementSlideOffset,
    isOutsideComposedPath,
    type OverlayDirection as PopoverDirection,
} from '../../../utils/controller/overlay-controller'
