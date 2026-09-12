/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { projectLayout } from './dock-layout-projection.ts'
import type { Direction, GridNode, Rect } from './dock-tree.ts'

/**
 * A drop zone is a single actionable place where a dragged view can land.
 * The hit tester returns the single best zone for a given pointer position;
 * preview rects are computed against the projected layout.
 *
 *  - `merge`: drop on the body of a leaf → add as a tab to that leaf
 *  - `split`: drop near a leaf edge → split that leaf and place adjacent
 *  - `sash`:  drop on a sash between two leaves → take that leaf's slot
 *  - `outer`: drop near the workbench's outer edge → dock to a sidebar/panel
 */
export type DropZone =
    | { kind: 'merge'; leafId: string; rect: Rect; preview: Rect; label: string }
    | { kind: 'split'; leafId: string; edge: Direction; rect: Rect; preview: Rect; label: string }
    | { kind: 'sash'; leafId: string; index: number; rect: Rect; preview: Rect; label: string }
    | { kind: 'outer'; edge: 'left' | 'right' | 'bottom'; rect: Rect; preview: Rect; label: string }

export interface IHitTesterOptions {
    /** Fraction of a leaf's primary axis that forms the split band (default 0.25). */
    edgeSplitRatio?: number
    /** Pixel band on the workbench outer edges (default 28). */
    workbenchEdgePx?: number
}

export function evaluate(
    pointer: { x: number; y: number },
    containerRect: Rect,
    tree: GridNode,
    options?: IHitTesterOptions,
    outerRects?: { left?: Rect; right?: Rect; bottom?: Rect; panel?: Rect },
): DropZone | null {
    const edgeSplitRatio = options?.edgeSplitRatio ?? 0.25
    const workbenchEdgePx = options?.workbenchEdgePx ?? 28

    // 1. Outer edges of the workbench (only if outerRects provided).
    if (outerRects) {
        const left = outerRects.left ?? containerRect
        if (pointer.x - left.x <= workbenchEdgePx) {
            const width = Math.max(220, left.width * 0.25)
            return {
                kind: 'outer',
                edge: 'left',
                rect: left,
                preview: { x: left.x, y: left.y, width, height: left.height },
                label: 'Dock to Primary Side Bar',
            }
        }
        const right = outerRects.right ?? containerRect
        if (right.x + right.width - pointer.x <= workbenchEdgePx) {
            const width = Math.max(220, right.width * 0.25)
            return {
                kind: 'outer',
                edge: 'right',
                rect: right,
                preview: { x: right.x + right.width - width, y: right.y, width, height: right.height },
                label: 'Dock to Secondary Side Bar',
            }
        }
        const panel = outerRects.panel
        if (panel && panel.y + panel.height - pointer.y <= workbenchEdgePx) {
            const height = Math.max(160, panel.height * 0.3)
            return {
                kind: 'outer',
                edge: 'bottom',
                rect: panel,
                preview: { x: panel.x, y: panel.y + panel.height - height, width: panel.width, height },
                label: 'Dock to Bottom Panel',
            }
        }
    }

    // 2. Walk the tree; find the leaf under the pointer.
    const leafRects = projectLayout(containerRect, tree)
    for (const [leafId, rect] of leafRects) {
        if (
            pointer.x >= rect.x &&
            pointer.x <= rect.x + rect.width &&
            pointer.y >= rect.y &&
            pointer.y <= rect.y + rect.height
        ) {
            return innerZone(pointer, rect, leafId, edgeSplitRatio)
        }
    }

    return null
}

function innerZone(
    pointer: { x: number; y: number },
    rect: Rect,
    leafId: string,
    splitRatio: number,
): DropZone {
    const relX = (pointer.x - rect.x) / rect.width
    const relY = (pointer.y - rect.y) / rect.height

    if (relX < splitRatio) {
        return {
            kind: 'split',
            leafId,
            edge: 'left',
            rect,
            preview: { x: rect.x, y: rect.y, width: rect.width * 0.5, height: rect.height },
            label: 'Split Left',
        }
    }
    if (relX > 1 - splitRatio) {
        return {
            kind: 'split',
            leafId,
            edge: 'right',
            rect,
            preview: { x: rect.x + rect.width * 0.5, y: rect.y, width: rect.width * 0.5, height: rect.height },
            label: 'Split Right',
        }
    }
    if (relY < splitRatio) {
        return {
            kind: 'split',
            leafId,
            edge: 'top',
            rect,
            preview: { x: rect.x, y: rect.y, width: rect.width, height: rect.height * 0.5 },
            label: 'Split Up',
        }
    }
    if (relY > 1 - splitRatio) {
        return {
            kind: 'split',
            leafId,
            edge: 'bottom',
            rect,
            preview: { x: rect.x, y: rect.y + rect.height * 0.5, width: rect.width, height: rect.height * 0.5 },
            label: 'Split Down',
        }
    }
    return {
        kind: 'merge',
        leafId,
        rect,
        preview: rect,
        label: 'Add as Tab',
    }
}