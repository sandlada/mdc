/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export { findNearestAncestorOverlayId, isOutsideComposedPath, OverlayIdAttribute } from './overlay-boundary'
export { OverlayController } from './overlay-controller'
export { getOverlayTree, OverlayTreeManager, type IOverlayTreeNode, type OverlayTreeMap } from './overlay-tree'
export { OverlayDismissReasons, OverlayPlacements, type IOverlayControllerOptions, type OverlayDirection } from './overlay-types'
export { getDirectionFromPlacement } from './internal'
