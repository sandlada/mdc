// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { computePosition } from '@floating-ui/dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../../components/popover/popover'
import type { MDCPopover } from '../../components/popover/popover'
import { getOverlayTree } from './index'

vi.mock(import('@floating-ui/dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, computePosition: vi.fn(actual.computePosition) }
})

describe('OverlayController nested overlays ("popup inside popup")', () => {
    const mounted: HTMLElement[] = []

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.remove()
        }
        getOverlayTree(document).clear()
    })

    const mountPopover = async () => {
        const popover = document.createElement('mdc-popover') as MDCPopover
        popover.quick = true
        document.body.append(popover)
        mounted.push(popover)
        await popover.updateComplete
        return popover
    }

    it('lets a hide request supersede an opening that has not rendered yet', async () => {
        const popover = await mountPopover()
        const opening = popover.showAt(10, 20)
        await popover.hide()
        await opening
        expect(popover.open).toBe(false)
    })

    it('opens a queued request when the host first connects', async () => {
        const popover = document.createElement('mdc-popover') as MDCPopover
        popover.quick = true
        const opening = popover.showAt(10, 20)
        document.body.append(popover)
        mounted.push(popover)

        await opening
        expect(popover.open).toBe(true)
    })

    it('ignores previous positioning results after removal and reconnect', async () => {
        const popover = await mountPopover()
        const oldPosition = Promise.withResolvers<Awaited<ReturnType<typeof computePosition>>>()
        vi.mocked(computePosition).mockReturnValueOnce(oldPosition.promise)
        const opening = popover.showAt(10, 20)
        await vi.waitFor(() => expect(popover.open).toBe(true))
        const surface = popover.shadowRoot!.querySelector<HTMLElement>('.surface')!

        popover.remove()
        document.body.append(popover)
        await popover.showAt(40, 50)
        const currentLeft = surface.style.left
        oldPosition.resolve({ x: 987, y: 654, placement: 'left', strategy: 'fixed', middlewareData: {} })
        await opening

        expect(surface.style.left).toBe(currentLeft)
    })

    it('keeps active leaves isolated between documents', async () => {
        const documentA = document.implementation.createHTMLDocument('Overlay A')
        const documentB = document.implementation.createHTMLDocument('Overlay B')
        const treeA = getOverlayTree(documentA)
        const treeB = getOverlayTree(documentB)
        treeA.register('first')
        treeB.register('second')
        await treeA.markOpen('first')
        await treeB.markOpen('second')

        expect(getOverlayTree(documentA).getDeepestActiveLeafId()).toBe('first')
        expect(getOverlayTree(documentB).getDeepestActiveLeafId()).toBe('second')
    })

    it('keeps parent open when interacting with child, closes leaf-first on Escape, and cascades close from parent', async () => {
        const parent = document.createElement('mdc-popover') as MDCPopover
        parent.quick = true
        parent.innerHTML = `
            <button slot="trigger" type="button">Open Parent</button>
            <mdc-popover id="child-popover" quick>
                <button slot="trigger" type="button">Open Child</button>
                <div class="child-body">Nested Child Surface</div>
            </mdc-popover>
        `
        document.body.appendChild(parent)
        mounted.push(parent)
        await parent.updateComplete

        const child = parent.querySelector<MDCPopover>('#child-popover')!
        await child.updateComplete

        await parent.show()
        await child.show()
        expect(parent.open).toBe(true)
        expect(child.open).toBe(true)

        // Clicking inside child's surface must NOT dismiss parent
        const childSurface = child.shadowRoot!.querySelector<HTMLElement>('.surface')!
        childSurface.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
        await new Promise((r) => setTimeout(r, 20))
        expect(parent.open).toBe(true)
        expect(child.open).toBe(true)

        // Reposition the parent so its dismissal listener runs after the child's.
        await parent.showAt(10, 20)

        // First Escape closes ONLY child (deepest leaf)
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await new Promise((r) => setTimeout(r, 20))
        expect(child.open).toBe(false)
        expect(parent.open).toBe(true)

        // Re-open child, then closing parent must cascade close child
        await child.show()
        expect(child.open).toBe(true)
        await parent.hide()
        await new Promise((r) => setTimeout(r, 20))
        expect(parent.open).toBe(false)
        expect(child.open).toBe(false)
    })
})
