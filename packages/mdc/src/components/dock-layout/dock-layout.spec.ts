/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    addLeafAt,
    removeLeaf,
    resizeLeaf,
    serialize,
    deserialize,
    type GridNode,
    type LeafNode,
} from './dock-layout.interface'
import { projectLayout } from './internal/dock-layout-projection'
import { evaluate } from './internal/dock-hit-tester'

const makeLeaf = (id: string): LeafNode => ({ kind: 'leaf', id, view: id })

describe('dock-layout', () => {
    it('serializes and deserializes a layout', () => {
        const data = { root: makeLeaf('a') }
        const json = serialize(data)
        const back = deserialize(json)
        expect(back.root.id).toBe('a')
    })

    it('wraps the root when adding a leaf', () => {
        const root = makeLeaf('a')
        const result = addLeafAt(root, makeLeaf('b'), 'a', 'right')
        expect(result.kind).toBe('branch')
        if (result.kind === 'branch') {
            expect(result.orientation).toBe('horizontal')
            expect(result.children.map((c) => c.id)).toEqual(['a', 'b'])
        }
    })

    it('removes a leaf', () => {
        const tree: GridNode = {
            kind: 'branch',
            id: 'root',
            orientation: 'horizontal',
            children: [makeLeaf('a'), makeLeaf('b')],
        }
        const after = removeLeaf(tree, 'a')
        if (after.kind === 'branch') {
            expect(after.children.map((c) => c.id)).toEqual(['b'])
        }
    })

    it('clamps resized leaf sizes', () => {
        const tree: GridNode = {
            kind: 'branch',
            id: 'root',
            orientation: 'horizontal',
            children: [makeLeaf('a'), makeLeaf('b')],
        }
        const tooSmall = resizeLeaf(tree, 'a', -1)
        const tooBig = resizeLeaf(tree, 'a', 5)
        if (tooSmall.kind === 'branch') expect(tooSmall.children[0].size).toBe(0.01)
        if (tooBig.kind === 'branch') expect(tooBig.children[0].size).toBe(0.99)
    })

    it('projects a single leaf to the container', () => {
        const tree: GridNode = makeLeaf('a')
        const rects = projectLayout({ x: 0, y: 0, width: 100, height: 50 }, tree)
        expect(rects.get('a')).toEqual({ x: 0, y: 0, width: 100, height: 50 })
    })

    it('evaluates a center hit as merge', () => {
        const tree: GridNode = makeLeaf('a')
        const zone = evaluate({ x: 50, y: 25 }, { x: 0, y: 0, width: 100, height: 50 }, tree)
        expect(zone?.kind).toBe('merge')
        if (zone?.kind === 'merge') expect(zone.leafId).toBe('a')
    })
})