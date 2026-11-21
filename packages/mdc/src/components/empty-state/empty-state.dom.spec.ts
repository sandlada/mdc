// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import type { MDCEmptyState } from './empty-state'
import './index'

describe('mdc-empty-state', () => {
    it('projects the illustration, heading, explanation, and action in reading order', async () => {
        const element = await fixture<MDCEmptyState>(html`
            <mdc-empty-state>
                <button slot="actions">Clear filters</button>
                <p slot="supporting-text">Try a different filter.</p>
                <h3 slot="headline">No results</h3>
                <img slot="illustration" alt="" />
            </mdc-empty-state>
        `)

        const slots = [...element.shadowRoot!.querySelectorAll('slot')]
        expect(slots.map((slot) => slot.name)).toEqual(['illustration', 'headline', 'supporting-text', 'actions'])
        expect(slots.map((slot) => slot.assignedElements()[0]?.localName)).toEqual(['img', 'h3', 'p', 'button'])
        expect(slots.every((slot) => !slot.hidden)).toBe(true)
        const onClick = new Event('click', { bubbles: true, composed: true })
        const received = new Promise<Event>((resolve) => element.addEventListener('click', resolve, { once: true }))
        element.querySelector('button')!.dispatchEvent(onClick)
        await expect(received).resolves.toBe(onClick)
    })

    it('keeps unassigned slots out of the layout and responds to reassignment and removal', async () => {
        const element = await fixture<MDCEmptyState>(html`
            <mdc-empty-state>
                <h2 slot="headline">No saved items</h2>
                <div><button slot="actions">Nested action</button></div>
            </mdc-empty-state>
        `)
        const actions = element.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!
        const illustration = element.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="illustration"]')!
        expect(actions.hidden).toBe(true)
        expect(illustration.hidden).toBe(true)

        const button = document.createElement('button')
        button.slot = 'actions'
        element.append(button)
        await Promise.resolve()
        await element.updateComplete
        expect(actions.hidden).toBe(false)

        button.slot = 'illustration'
        await Promise.resolve()
        await element.updateComplete
        expect(actions.hidden).toBe(true)
        expect(illustration.hidden).toBe(false)

        button.remove()
        await Promise.resolve()
        await element.updateComplete
        expect(illustration.hidden).toBe(true)
    })
})
