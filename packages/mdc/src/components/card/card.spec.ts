/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCCard } from './card'

describe('MDCCard', () => {
    it('instantiates with defaults', () => {
        const card = new MDCCard()
        expect(card.variant).toBe('filled')
        expect(card.interactive).toBe(false)
        expect(card.disabled).toBe(false)
        expect(card.horizontal).toBe(false)
        expect(card.shape).toBe('round')
        expect(card.href).toBe('')
        expect(card.target).toBe('')
        expect(card.cardTabIndex).toBe(0)
        expect(card.isInteractive).toBe(false)
    })

    it('becomes interactive when href is set', () => {
        const card = new MDCCard()
        card.href = 'https://example.com'
        expect(card.isInteractive).toBe(true)
    })

    it('renders an anchor when href is set', () => {
        const card = new MDCCard()
        card.href = 'https://example.com'
        const rendered = (card as any).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<a')
    })

    it('renders a container by default', () => {
        const card = new MDCCard()
        const rendered = (card as any).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })
})