// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import './accordion'
import './expansion-panel'
import type { MDCAccordion } from './accordion'
import type { IMDCAccordionChangeDetail, IMDCExpansionPanelToggleDetail } from './accordion.interface'
import type { MDCExpansionPanel } from './expansion-panel'

const mountContainer = (markup: string): HTMLDivElement => {
    const container = document.createElement('div')
    container.innerHTML = markup
    document.body.appendChild(container)
    return container
}

describe('MDCAccordion & MDCExpansionPanel DOM', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('toggles a standalone MDCExpansionPanel on header click and updates ARIA state', async () => {
        const container = mountContainer(`
            <mdc-expansion-panel headline="Details" supporting-text="Summary" quick>
                <p>Body content</p>
            </mdc-expansion-panel>
        `)
        const panel = container.querySelector('mdc-expansion-panel') as MDCExpansionPanel
        await panel.updateComplete

        const header = panel.shadowRoot!.querySelector<HTMLButtonElement>('.header')!
        const body = panel.shadowRoot!.querySelector<HTMLDivElement>('.collapse')!

        expect(panel.expanded).toBe(false)
        expect(header.getAttribute('aria-expanded')).toBe('false')
        expect(body.getAttribute('aria-hidden')).toBe('true')
        expect(body.hasAttribute('inert')).toBe(true)
        expect(header.getAttribute('aria-controls')).toBe(body.id)
        expect(body.getAttribute('aria-labelledby')).toBe(header.id)

        const expandedSpy = vi.fn()
        panel.addEventListener('expansion-panel-expanded', expandedSpy)

        header.click()
        await panel.updateComplete

        expect(panel.expanded).toBe(true)
        expect(header.getAttribute('aria-expanded')).toBe('true')
        expect(body.getAttribute('aria-hidden')).toBe('false')
        expect(body.hasAttribute('inert')).toBe(false)
        expect(expandedSpy).toHaveBeenCalledTimes(1)
    })

    it('respects cancelable expansion-panel-toggle event', async () => {
        const container = mountContainer(`
            <mdc-expansion-panel headline="Locked" quick>Content</mdc-expansion-panel>
        `)
        const panel = container.querySelector('mdc-expansion-panel') as MDCExpansionPanel
        await panel.updateComplete

        panel.addEventListener('expansion-panel-toggle', (event) => {
            const detail = (event as CustomEvent<IMDCExpansionPanelToggleDetail>).detail
            expect(detail.expanded).toBe(true)
            event.preventDefault()
        })

        panel.shadowRoot!.querySelector<HTMLButtonElement>('.header')!.click()
        await panel.updateComplete
        expect(panel.expanded).toBe(false)
    })

    it('coordinates single-expand mode and emits accordion-change', async () => {
        const container = mountContainer(`
            <mdc-accordion mode="single" variant="filled" connected quick>
                <mdc-expansion-panel headline="One" expanded>First</mdc-expansion-panel>
                <mdc-expansion-panel headline="Two">Second</mdc-expansion-panel>
                <mdc-expansion-panel headline="Three">Third</mdc-expansion-panel>
            </mdc-accordion>
        `)
        const accordion = container.querySelector('mdc-accordion') as MDCAccordion
        await accordion.updateComplete
        const panels = accordion.panels as MDCExpansionPanel[]
        await Promise.all(panels.map(p => p.updateComplete))

        expect(panels).toHaveLength(3)
        expect(panels[0].variant).toBe('filled')
        expect(panels[0].hasAttribute('data-connected')).toBe(true)
        expect(panels[0].hasAttribute('data-first')).toBe(true)
        expect(panels[1].hasAttribute('data-first')).toBe(false)
        expect(panels[1].hasAttribute('data-last')).toBe(false)
        expect(panels[2].hasAttribute('data-last')).toBe(true)

        const changes: IMDCAccordionChangeDetail[] = []
        accordion.addEventListener('accordion-change', (e) => {
            changes.push((e as CustomEvent<IMDCAccordionChangeDetail>).detail)
        })

        panels[1].shadowRoot!.querySelector<HTMLButtonElement>('.header')!.click()
        await Promise.all(panels.map(p => p.updateComplete))
        await Promise.resolve()

        expect(panels[0].expanded).toBe(false)
        expect(panels[1].expanded).toBe(true)
        expect(panels[2].expanded).toBe(false)
        expect(changes).toHaveLength(1)
        expect(changes[0].expandedIndices).toEqual([1])
        expect(changes[0].changedPanel).toBe(panels[1])
        expect(changes[0].expanded).toBe(true)
    })

    it('prevents collapsing the last open panel in single mode when collapsible is false', async () => {
        const container = mountContainer(`
            <mdc-accordion mode="single" quick>
                <mdc-expansion-panel headline="One" expanded>First</mdc-expansion-panel>
                <mdc-expansion-panel headline="Two">Second</mdc-expansion-panel>
            </mdc-accordion>
        `)
        const accordion = container.querySelector('mdc-accordion') as MDCAccordion
        accordion.collapsible = false
        await accordion.updateComplete
        const panels = accordion.panels as MDCExpansionPanel[]
        await Promise.all(panels.map(p => p.updateComplete))

        panels[0].shadowRoot!.querySelector<HTMLButtonElement>('.header')!.click()
        await panels[0].updateComplete

        expect(panels[0].expanded).toBe(true)
    })

    it('supports expandAll, collapseAll, expandAt, collapseAt, toggleAt in multiple mode', async () => {
        const container = mountContainer(`
            <mdc-accordion mode="multiple" quick>
                <mdc-expansion-panel headline="A">A</mdc-expansion-panel>
                <mdc-expansion-panel headline="B" disabled>B</mdc-expansion-panel>
                <mdc-expansion-panel headline="C">C</mdc-expansion-panel>
            </mdc-accordion>
        `)
        const accordion = container.querySelector('mdc-accordion') as MDCAccordion
        await accordion.updateComplete
        const panels = accordion.panels as MDCExpansionPanel[]

        accordion.expandAll()
        expect(panels[0].expanded).toBe(true)
        expect(panels[1].expanded).toBe(false)
        expect(panels[2].expanded).toBe(true)

        accordion.collapseAll()
        expect(panels[0].expanded).toBe(false)
        expect(panels[2].expanded).toBe(false)

        accordion.expandAt(2)
        expect(panels[2].expanded).toBe(true)

        accordion.toggleAt(2)
        expect(panels[2].expanded).toBe(false)
    })

    it('supports keyboard ArrowDown/ArrowUp/Home/End navigation across enabled headers', async () => {
        const container = mountContainer(`
            <mdc-accordion quick>
                <mdc-expansion-panel headline="One">1</mdc-expansion-panel>
                <mdc-expansion-panel headline="Two" disabled>2</mdc-expansion-panel>
                <mdc-expansion-panel headline="Three">3</mdc-expansion-panel>
            </mdc-accordion>
        `)
        const accordion = container.querySelector('mdc-accordion') as MDCAccordion
        await accordion.updateComplete
        const panels = accordion.panels as MDCExpansionPanel[]
        await Promise.all(panels.map(p => p.updateComplete))

        const header0 = panels[0].shadowRoot!.querySelector<HTMLButtonElement>('.header')!
        const focus0 = vi.spyOn(panels[0], 'focusHeader')
        const focus2 = vi.spyOn(panels[2], 'focusHeader')

        header0.focus()

        header0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }))
        expect(focus2).toHaveBeenCalledTimes(1)

        const header2 = panels[2].shadowRoot!.querySelector<HTMLButtonElement>('.header')!
        header2.focus()
        header2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }))
        expect(focus0).toHaveBeenCalledTimes(1)

        header0.focus()
        header0.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }))
        expect(focus2).toHaveBeenCalledTimes(2)

        header2.focus()
        header2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }))
        expect(focus0).toHaveBeenCalledTimes(2)
    })

    it('renders optional heading-level wrapper when headingLevel is 1..6', async () => {
        const container = mountContainer(`
            <mdc-expansion-panel headline="Section" heading-level="3" quick>Body</mdc-expansion-panel>
        `)
        const panel = container.querySelector('mdc-expansion-panel') as MDCExpansionPanel
        await panel.updateComplete

        const heading = panel.shadowRoot!.querySelector('[role="heading"]')
        expect(heading).not.toBeNull()
        expect(heading?.getAttribute('aria-level')).toBe('3')
    })
})
