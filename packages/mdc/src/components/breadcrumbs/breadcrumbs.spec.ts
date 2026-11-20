/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { BreadcrumbsDefinition } from './breadcrumbs.definition'
import { computeBreadcrumbSegments } from './internal/breadcrumbs-collapse'

describe('computeBreadcrumbSegments', () => {
    it('returns empty array when totalItems is 0', () => {
        expect(computeBreadcrumbSegments({
            totalItems: 0,
            maxItems: 4,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toEqual([])
    })

    it('returns all items when maxItems is 0 or totalItems <= maxItems', () => {
        expect(computeBreadcrumbSegments({
            totalItems: 5,
            maxItems: 0,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toEqual([
            { type: 'item', index: 0 },
            { type: 'item', index: 1 },
            { type: 'item', index: 2 },
            { type: 'item', index: 3 },
            { type: 'item', index: 4 },
        ])

        expect(computeBreadcrumbSegments({
            totalItems: 4,
            maxItems: 4,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toHaveLength(4)
    })

    it('collapses middle items into an ellipsis segment when totalItems > maxItems', () => {
        expect(computeBreadcrumbSegments({
            totalItems: 6,
            maxItems: 4,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toEqual([
            { type: 'item', index: 0 },
            { type: 'ellipsis', collapsedIndices: [1, 2, 3] },
            { type: 'item', index: 4 },
            { type: 'item', index: 5 },
        ])
    })

    it('returns all items when expanded is true', () => {
        const result = computeBreadcrumbSegments({
            totalItems: 6,
            maxItems: 4,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: true,
        })
        expect(result).toHaveLength(6)
        expect(result.every((seg) => seg.type === 'item')).toBe(true)
    })

    it('does not collapse when itemsBeforeCollapse + itemsAfterCollapse >= totalItems', () => {
        const result = computeBreadcrumbSegments({
            totalItems: 5,
            maxItems: 3,
            itemsBeforeCollapse: 2,
            itemsAfterCollapse: 3,
            expanded: false,
        })
        expect(result).toHaveLength(5)
    })

    it('throws on negative or non-integer counts', () => {
        expect(() => computeBreadcrumbSegments({
            totalItems: -1,
            maxItems: 4,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toThrow()

        expect(() => computeBreadcrumbSegments({
            totalItems: 5,
            maxItems: -2,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 2,
            expanded: false,
        })).toThrow()
    })
})

describe('BreadcrumbsDefinition', () => {
    it('uses leading instead of line-height in token definitions', () => {
        const keys = Object.keys(BreadcrumbsDefinition)
        expect(keys.some((k) => k.endsWith('line-height'))).toBe(false)
        expect(keys.some((k) => k.endsWith('leading'))).toBe(true)
    })
})
