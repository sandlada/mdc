/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface IBreadcrumbCollapseSegment {
    type: 'item' | 'ellipsis'
    /** Original 0-based index when `type === 'item'`. */
    index?: number
    /** Hidden item indices when `type === 'ellipsis'`. */
    collapsedIndices?: number[]
}

export interface IComputeBreadcrumbSegmentsOptions {
    totalItems: number
    maxItems: number
    itemsBeforeCollapse: number
    itemsAfterCollapse: number
    expanded: boolean
}

/**
 * Pure function that computes the visible breadcrumb segments and any collapsed
 * middle indices according to `maxItems`, `itemsBeforeCollapse`, and `itemsAfterCollapse`.
 *
 * Throws on negative counts so invalid configuration fails loudly.
 */
export function computeBreadcrumbSegments(options: IComputeBreadcrumbSegmentsOptions): IBreadcrumbCollapseSegment[] {
    const {
        totalItems,
        maxItems,
        itemsBeforeCollapse,
        itemsAfterCollapse,
        expanded,
    } = options

    if (!Number.isInteger(totalItems) || totalItems < 0) {
        throw new Error(`Breadcrumb totalItems must be a non-negative integer, received ${totalItems}`)
    }
    if (!Number.isInteger(maxItems) || maxItems < 0) {
        throw new Error(`Breadcrumb maxItems must be a non-negative integer, received ${maxItems}`)
    }
    if (!Number.isInteger(itemsBeforeCollapse) || itemsBeforeCollapse < 0) {
        throw new Error(`Breadcrumb itemsBeforeCollapse must be a non-negative integer, received ${itemsBeforeCollapse}`)
    }
    if (!Number.isInteger(itemsAfterCollapse) || itemsAfterCollapse < 0) {
        throw new Error(`Breadcrumb itemsAfterCollapse must be a non-negative integer, received ${itemsAfterCollapse}`)
    }

    if (totalItems === 0) {
        return []
    }

    const shouldCollapse =
        !expanded &&
        maxItems > 0 &&
        totalItems > maxItems &&
        itemsBeforeCollapse + itemsAfterCollapse < totalItems

    if (!shouldCollapse) {
        const segments: IBreadcrumbCollapseSegment[] = []
        for (let i = 0; i < totalItems; i++) {
            segments.push({ type: 'item', index: i })
        }
        return segments
    }

    const segments: IBreadcrumbCollapseSegment[] = []
    for (let i = 0; i < itemsBeforeCollapse; i++) {
        segments.push({ type: 'item', index: i })
    }

    const collapsedStart = itemsBeforeCollapse
    const collapsedEnd = totalItems - itemsAfterCollapse
    const collapsedIndices: number[] = []
    for (let i = collapsedStart; i < collapsedEnd; i++) {
        collapsedIndices.push(i)
    }

    if (collapsedIndices.length > 0) {
        segments.push({
            type: 'ellipsis',
            collapsedIndices,
        })
    }

    for (let i = collapsedEnd; i < totalItems; i++) {
        segments.push({ type: 'item', index: i })
    }

    return segments
}
