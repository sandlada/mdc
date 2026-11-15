/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCFab } from './fab'
import { TonalSecondaryFabDefinition } from './fab.definition'

describe('MDCFab', () => {
    it('instantiates with defaults', () => {
        const fab = new MDCFab()
        expect(fab.variant).toBe('tonal-secondary')
        expect(fab.size).toBe('small')
        expect(fab.extended).toBe(false)
        expect(fab.trailingIcon).toBe(false)
        expect(fab.open).toBe(false)
    })

    it('exposes a button root in render output', () => {
        const fab = new MDCFab()
        const rendered = (fab as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })

    it('bridges level and shadow-color tokens to mdc-elevation', () => {
        expect(TonalSecondaryFabDefinition['enabled-container-elevation']).toBe('3')
        expect(TonalSecondaryFabDefinition['hovered-container-elevation']).toBe('4')

        const cssText = MDCFab.styles.map((s) => s.toString()).join('\n')
        expect(cssText).toContain('--mdc-elevation-level: var(--_enabled-container-elevation)')
        expect(cssText).toContain('--mdc-elevation-shadow-color: var(--_enabled-container-shadow-color)')
        expect(cssText).not.toContain('--mdc-elevation-enabled-level')
        expect(cssText).not.toContain('--mdc-elevation-enabled-shadow-color')
    })
})