/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Logical dock-edge mapping shared by RTL-aware drag-to-dock surfaces.
 *
 * A surface that exposes a logical edge (`start` / `end`) still moves in
 * physical viewport space while dragged. These helpers convert between the
 * two against the ambient text direction, keeping the drag math physical
 * and the public contract logical.
 */

import type { DockSide } from './resolve-dock-side'

/**
 * Logical docking edge. Resolves to a physical side against the ambient
 * text direction: `start` is `left` under `ltr` and `right` under `rtl`.
 */
export type DockEdge = 'start' | 'end'

/** Ambient text direction of the docked surface. */
export type TextDirection = 'ltr' | 'rtl'

/**
 * Builds a logical-edge -> physical-side resolver. Curried: bind the text
 * direction once, feed edges per call.
 *
 * @example
 * ```ts
 * const sideOf = resolveDockSideOfEdge('rtl')
 * sideOf('start') // 'right'
 * ```
 */
export const resolveDockSideOfEdge = (direction: TextDirection) =>
    (edge: DockEdge): DockSide => {
        const startIsLeft = direction === 'ltr'
        if (edge === 'start') return startIsLeft ? 'left' : 'right'
        return startIsLeft ? 'right' : 'left'
    }

/**
 * Builds a physical-side -> logical-edge resolver, the inverse of
 * {@link resolveDockSideOfEdge}. Curried the same way.
 *
 * @example
 * ```ts
 * const edgeOf = resolveDockEdgeOfSide('rtl')
 * edgeOf('left') // 'end'
 * ```
 */
export const resolveDockEdgeOfSide = (direction: TextDirection) =>
    (side: DockSide): DockEdge => {
        const startIsLeft = direction === 'ltr'
        if (side === 'left') return startIsLeft ? 'start' : 'end'
        return startIsLeft ? 'end' : 'start'
    }
