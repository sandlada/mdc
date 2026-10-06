/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure docking decision helpers shared by drag-to-dock surfaces.
 *
 * All inputs are viewport-relative client coordinates or px values; the
 * functions never touch the DOM, so they stay trivially unit-testable.
 * Signatures follow the project's Data-Last / currying convention: the
 * context (viewport) binds first, the subject (element) binds last.
 */

/**
 * Physical docking side of an anchored surface. Physical — a `left` dock
 * anchors to the viewport's left edge in every `dir` value.
 */
export type DockSide = 'left' | 'right'

/**
 * Builds a dock-side resolver from the viewport half split. Curried:
 * bind the context once, feed subject coordinates per drag frame or per
 * release decision.
 *
 * The sheet docks to the side of the viewport that owns the majority of
 * its mass — equivalently, the side whose region contains the sheet's
 * center. A right-docked sheet flips exactly when its center crosses the
 * viewport midline.
 *
 * @example
 * ```ts
 * const dock = resolveDockSide(window.innerWidth)
 * const side = dock(sheetCenterX)
 * // 'left' | 'right'
 * ```
 */
export const resolveDockSide = (viewportWidth: number) =>
    (sheetCenterX: number): DockSide =>
        sheetCenterX < viewportWidth / 2 ? 'left' : 'right'
