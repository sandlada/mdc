/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import {
    getConflictingOpenSiblings,
    getDeepestActiveLeafId,
    getOverlayAncestors,
    getOverlayDepth,
    getOverlayDescendantsPostOrder,
    isOverlayInSubtree,
    OverlayTreeManager,
} from './overlay-tree'

describe('OverlayTree pure helpers & OverlayTreeManager', () => {
    it('tracks parent-child hierarchy, ancestors, depth, and subtree membership', () => {
        const tree = new OverlayTreeManager()
        tree.register('root')
        tree.register('child-a', { parentId: 'root' })
        tree.register('grandchild-a1', { parentId: 'child-a' })
        tree.register('other-root')

        const snap = tree.snapshot
        expect(getOverlayAncestors('grandchild-a1')(snap)).toEqual(['child-a', 'root'])
        expect(getOverlayDepth('root')(snap)).toBe(0)
        expect(getOverlayDepth('grandchild-a1')(snap)).toBe(2)

        expect(isOverlayInSubtree('root')('grandchild-a1')(snap)).toBe(true)
        expect(isOverlayInSubtree('root')('root')(snap)).toBe(true)
        expect(isOverlayInSubtree('root')('other-root')(snap)).toBe(false)
        expect(getOverlayDescendantsPostOrder('root')(snap)).toEqual(['grandchild-a1', 'child-a'])
    })

    it('throws on invalid IDs, self-parenting, circular hierarchy, or opening unregistered node', async () => {
        const tree = new OverlayTreeManager()
        expect(() => tree.register('')).toThrow()
        expect(() => tree.register('a', { parentId: 'a' })).toThrow()

        tree.register('a')
        tree.register('b', { parentId: 'a' })
        expect(() => tree.setParent('a', 'b')).toThrow()
        await expect(tree.markOpen('missing')).rejects.toThrow()
    })

    it('enforces sibling exclusion by group and cascades close to descendants', async () => {
        const tree = new OverlayTreeManager()
        const closedOrder: string[] = []

        tree.register('menu-1', {
            group: 'ctx',
            onClose: () => { closedOrder.push('menu-1') },
        })
        tree.register('sub-1', {
            parentId: 'menu-1',
            onClose: () => { closedOrder.push('sub-1') },
        })
        tree.register('menu-2', {
            group: 'ctx',
            onClose: () => { closedOrder.push('menu-2') },
        })

        await tree.markOpen('menu-1')
        await tree.markOpen('sub-1')
        expect(getConflictingOpenSiblings('menu-2')(tree.snapshot)).toEqual(['menu-1'])

        await tree.markOpen('menu-2')
        expect(closedOrder).toEqual(['sub-1', 'menu-1'])
        expect(tree.snapshot.get('menu-1')?.open).toBe(false)
        expect(tree.snapshot.get('sub-1')?.open).toBe(false)
        expect(tree.snapshot.get('menu-2')?.open).toBe(true)
    })

    it('resolves deepest active leaf first for Escape handling', async () => {
        const tree = new OverlayTreeManager()
        tree.register('root-1')
        tree.register('child-1', { parentId: 'root-1' })
        tree.register('root-2')

        expect(getDeepestActiveLeafId(tree.snapshot)).toBeNull()

        await tree.markOpen('root-1')
        expect(tree.getDeepestActiveLeafId()).toBe('root-1')

        await tree.markOpen('root-2')
        expect(tree.getDeepestActiveLeafId()).toBe('root-2')

        await tree.markOpen('child-1')
        // child-1 is depth 1 (> root-2 depth 0), so it wins
        expect(tree.getDeepestActiveLeafId()).toBe('child-1')

        await tree.markClosed('child-1')
        expect(tree.getDeepestActiveLeafId()).toBe('root-2')
    })

    it('keeps only the latest exclusive overlay open when a previous close is pending', async () => {
        const tree = new OverlayTreeManager()
        const closeFirst = Promise.withResolvers<void>()
        tree.register('first', { group: 'menu', onClose: () => closeFirst.promise })
        tree.register('second', { group: 'menu' })
        tree.register('third', { group: 'menu' })

        await tree.markOpen('first')
        const suspended = tree.markOpen('second')
        await tree.markOpen('third')
        closeFirst.resolve()
        await suspended

        expect(Array.from(tree.snapshot.values()).filter((node) => node.open).map((node) => node.id)).toEqual(['third'])
    })

    it('cascades close to open descendants when parent calls markClosed', async () => {
        const tree = new OverlayTreeManager()
        const onChildClose = vi.fn()
        tree.register('parent')
        tree.register('child', { parentId: 'parent', onClose: onChildClose })

        await tree.markOpen('parent')
        await tree.markOpen('child')
        await tree.markClosed('parent', 'escape')

        expect(onChildClose).toHaveBeenCalledWith('escape')
        expect(tree.snapshot.get('child')?.open).toBe(false)
        expect(tree.snapshot.get('parent')?.open).toBe(false)
    })
})
