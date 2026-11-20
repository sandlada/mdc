// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, afterEach } from 'vitest'
import '../tooltip/tooltip'
import { MDCTooltipBox } from './tooltip-box'

describe('MDCTooltipBox', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('instantiates with defaults', () => {
        const box = new MDCTooltipBox()
        expect(box.placement).toBe('bottom')
        expect(box.offset).toBe(8)
        expect(box.showDelay).toBe(400)
        expect(box.hideDelay).toBe(0)
        expect(box.trigger).toBe('auto')
        expect(box.open).toBe(false)
        expect(box.persistent).toBe(false)
        expect(box.caret).toBe(false)
        expect(box.disableFlip).toBe(false)
        expect(box.quick).toBe(false)
    })

    it('allows updating properties', () => {
        const box = new MDCTooltipBox()
        box.placement = 'top'
        box.offset = 12
        box.showDelay = 200
        box.hideDelay = 100
        box.trigger = 'manual'
        box.open = true
        box.persistent = true
        box.caret = true
        box.disableFlip = true
        box.quick = true
        expect(box.placement).toBe('top')
        expect(box.offset).toBe(12)
        expect(box.showDelay).toBe(200)
        expect(box.hideDelay).toBe(100)
        expect(box.trigger).toBe('manual')
        expect(box.open).toBe(true)
        expect(box.persistent).toBe(true)
        expect(box.caret).toBe(true)
        expect(box.disableFlip).toBe(true)
        expect(box.quick).toBe(true)
    })

    it('links anchor with aria-describedby and syncs caret to slotted tooltip', async () => {
        const box = document.createElement('mdc-tooltip-box') as MDCTooltipBox
        box.caret = true
        box.quick = true
        box.innerHTML = `
            <button>Action</button>
            <mdc-tooltip slot="tooltip">Helpful tip</mdc-tooltip>
        `
        document.body.appendChild(box)
        await box.updateComplete

        const button = box.querySelector('button')!
        const tooltip = box.querySelector('mdc-tooltip')!
        expect(tooltip.id).toBeTruthy()
        expect(button.getAttribute('aria-describedby')).toBe(tooltip.id)
        expect(tooltip.hasAttribute('caret')).toBe(true)
    })

    it('closes previously active tooltip box when another opens (global mutator)', async () => {
        const box1 = document.createElement('mdc-tooltip-box') as MDCTooltipBox
        box1.quick = true
        box1.trigger = 'manual'
        box1.innerHTML = `<button>One</button><mdc-tooltip slot="tooltip">Tip 1</mdc-tooltip>`

        const box2 = document.createElement('mdc-tooltip-box') as MDCTooltipBox
        box2.quick = true
        box2.trigger = 'manual'
        box2.innerHTML = `<button>Two</button><mdc-tooltip slot="tooltip">Tip 2</mdc-tooltip>`

        document.body.appendChild(box1)
        document.body.appendChild(box2)
        await Promise.all([box1.updateComplete, box2.updateComplete])

        await box1.show()
        expect(box1.open).toBe(true)

        await box2.show()
        expect(box2.open).toBe(true)
        expect(box1.open).toBe(false)
    })

    it('does not auto-hide on pointerleave when persistent is true', async () => {
        const box = document.createElement('mdc-tooltip-box') as MDCTooltipBox
        box.quick = true
        box.persistent = true
        box.innerHTML = `<button>Persistent</button><mdc-tooltip slot="tooltip" rich>Info</mdc-tooltip>`
        document.body.appendChild(box)
        await box.updateComplete

        await box.show()
        expect(box.open).toBe(true)

        box.dispatchEvent(new Event('pointerleave'))
        await new Promise((r) => setTimeout(r, 20))
        expect(box.open).toBe(true)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await new Promise((r) => setTimeout(r, 20))
        expect(box.open).toBe(false)
    })
})
