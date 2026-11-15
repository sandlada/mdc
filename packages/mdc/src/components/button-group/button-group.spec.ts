/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCButtonGroup } from './button-group'

describe('MDCButtonGroup', () => {
    it('instantiates with defaults', () => {
        const group = new MDCButtonGroup()
        expect(group.variant).toBe('connected')
        expect(group.selectionMode).toBe('none')
        expect(group.size).toBe('small')
        expect(group.shape).toBe('round')
        expect(group.orientation).toBe('horizontal')
        expect(group.disableMorph).toBe(false)
        expect(group.expandOnActive).toBe(false)
        expect(group.disabled).toBe(false)
    })

    it('exposes a container in render output', () => {
        const group = new MDCButtonGroup()
        const rendered = (group as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
        expect(html).toContain('role=')
    })
})