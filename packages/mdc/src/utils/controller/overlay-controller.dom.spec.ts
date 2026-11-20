// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it } from 'vitest'
import '../../components/popover/popover'
import type { MDCPopover } from '../../components/popover/popover'
import { DefaultOverlayTree } from './overlay-tree'

describe('OverlayController nested overlays ("popup inside popup")', () => {
    const mounted: HTMLElement[] = []

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.remove()
        }
        DefaultOverlayTree.clear()
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
