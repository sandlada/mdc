/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    addLeafAt,
    removeLeaf,
    resizeLeaf,
    serialize,
    deserialize,
    type GridNode,
    type LeafNode,
} from './dock-tree.ts'

const makeLeaf = (id: string, view = id): LeafNode => ({ kind: 'leaf', id, view })

test('addLeafAt on root wraps the root in a branch', () => {
    const root = makeLeaf('a')
    const newLeaf = makeLeaf('b')
    const result = addLeafAt(root, newLeaf, 'a', 'right')
    assert.equal(result.kind, 'branch')
    if (result.kind === 'branch') {
        assert.equal(result.children.length, 2)
        assert.equal(result.children[0].id, 'a')
        assert.equal(result.children[1].id, 'b')
        assert.equal(result.orientation, 'horizontal')
    }
})

test('addLeafAt on a leaf with same-orientation parent inserts adjacent', () => {
    const tree: GridNode = {
        kind: 'branch',
        id: 'root',
        orientation: 'horizontal',
        children: [makeLeaf('a'), makeLeaf('b')],
    }
    const result = addLeafAt(tree, makeLeaf('c'), 'a', 'right')
    if (result.kind === 'branch') {
        assert.equal(result.children.length, 3)
        assert.equal(result.children[1].id, 'c')
    }
})

test('addLeafAt with leading direction inserts before', () => {
    const tree: GridNode = {
        kind: 'branch',
        id: 'root',
        orientation: 'horizontal',
        children: [makeLeaf('a'), makeLeaf('b')],
    }
    const result = addLeafAt(tree, makeLeaf('c'), 'b', 'left')
    if (result.kind === 'branch') {
        assert.equal(result.children.map((c) => c.id).join(','), 'a,c,b')
    }
})

test('addLeafAt with different-orientation parent creates a new branch', () => {
    const tree: GridNode = {
        kind: 'branch',
        id: 'root',
        orientation: 'horizontal',
        children: [makeLeaf('a'), makeLeaf('b')],
    }
    const result = addLeafAt(tree, makeLeaf('c'), 'b', 'top')
    if (result.kind === 'branch') {
        // root is still horizontal
        assert.equal(result.orientation, 'horizontal')
        // b was wrapped in a vertical branch
        const wrappedB = result.children[1]
        assert.equal(wrappedB.kind, 'branch')
        if (wrappedB.kind === 'branch') {
            assert.equal(wrappedB.orientation, 'vertical')
            assert.equal(wrappedB.children.length, 2)
            assert.equal(wrappedB.children[0].id, 'c')
            assert.equal(wrappedB.children[1].id, 'b')
        }
    }
})

test('removeLeaf collapses a single-child branch', () => {
    const tree: GridNode = {
        kind: 'branch',
        id: 'root',
        orientation: 'horizontal',
        children: [
            makeLeaf('a'),
            {
                kind: 'branch',
                id: 'mid',
                orientation: 'vertical',
                children: [makeLeaf('b'), makeLeaf('c')],
            },
        ],
    }
    const after = removeLeaf(tree, 'a')
    if (after.kind === 'branch') {
        assert.equal(after.children.length, 1)
        assert.equal(after.children[0].id, 'mid')
    }
})

test('resizeLeaf clamps to 0.01..0.99', () => {
    const tree: GridNode = {
        kind: 'branch',
        id: 'root',
        orientation: 'horizontal',
        children: [makeLeaf('a'), makeLeaf('b')],
    }
    const tooSmall = resizeLeaf(tree, 'a', -1)
    if (tooSmall.kind === 'branch') {
        assert.equal(tooSmall.children[0].size, 0.01)
    }
    const tooBig = resizeLeaf(tree, 'a', 5)
    if (tooBig.kind === 'branch') {
        assert.equal(tooBig.children[0].size, 0.99)
    }
})

test('serialize/deserialize round-trips', () => {
    const data = { root: makeLeaf('a') }
    const json = serialize(data)
    const back = deserialize(json)
    assert.equal(back.root.id, 'a')
})
