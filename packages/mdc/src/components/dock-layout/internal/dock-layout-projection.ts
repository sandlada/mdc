/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { GridNode, Rect } from './dock-tree'

/**
 * Pure layout projection. Walks the tree top-down, distributing sizes to
 * children proportionally. The output is used by:
 *   - the renderer to set flex-basis values,
 *   - the hit tester to map pointer positions to leaf ids,
 *   - the drag controller to draw the drop preview overlay.
 *
 * Sizes on BranchNode.children are optional fractions (default = 1 each).
 * A child with no size is treated as size=1; the parent's primary axis is
 * distributed equally among children unless explicit sizes are present.
 */
export function projectLayout(containerRect: Rect, tree: GridNode): Map<string, Rect> {
    const out = new Map<string, Rect>()
    projectNode(containerRect, tree, out)
    return out
}

function projectNode(rect: Rect, node: GridNode, out: Map<string, Rect>): void {
    if (node.kind === 'leaf') {
        out.set(node.id, rect)
        return
    }
    const children = node.children
    const totalWeight = children.reduce((acc, c) => acc + (c.size ?? 1), 0)
    const isHorizontal = node.orientation === 'horizontal'

    let cursor = isHorizontal ? rect.x : rect.y
    const fullSize = isHorizontal ? rect.width : rect.height
    const crossSize = isHorizontal ? rect.height : rect.width

    children.forEach((child, i) => {
        const weight = child.size ?? 1
        const share = (weight / totalWeight) * fullSize
        const childRect: Rect = isHorizontal
            ? { x: cursor, y: rect.y, width: share, height: crossSize }
            : { x: rect.x, y: cursor, width: crossSize, height: share }
        cursor += share

        // The last child absorbs rounding error so widths sum exactly.
        if (i === children.length - 1) {
            if (isHorizontal) {
                childRect.width = rect.x + rect.width - childRect.x
            } else {
                childRect.height = rect.y + rect.height - childRect.y
            }
        }

        projectNode(childRect, child, out)
    })
}
