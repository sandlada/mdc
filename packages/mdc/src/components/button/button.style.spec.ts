/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { buttonStyles } from './button.style'

const cssTexts = buttonStyles.map((part: any) =>
    typeof part === 'string' ? part : (part?.cssText ?? String(part))
)
const all = cssTexts.join('\n')
const tokens = cssTexts[0] ?? ''

describe('buttonStyles token injection', () => {
    it('emits button canonical variables on :host', () => {
        expect(tokens).toContain(':host')
        expect(tokens).toContain('--mdc-button-hovered-filled-container-color')
        expect(tokens).toContain('--_hovered-filled-container-color:')
        expect(tokens).toContain('--_extra-small-container-height:')
        expect(tokens).toContain('--_extra-small-label-leading:')
        expect(tokens).toContain('--_extra-small-container-shape-pressed-morph-start-start:')
    })

    it('does not emit toggle-specific variables on :host', () => {
        expect(tokens).not.toContain('--_hovered-filled-selected-container-color:')
    })
})

describe('buttonStyles state expansion', () => {
    it('expands interaction/variant combos onto container classes', () => {
        expect(all).toContain('.container:hover.filled .background { background-color: var(--_hovered-filled-container-color);')
        expect(all).toContain('.container:focus-within.outlined .outline')
        expect(all).toContain('border-color: var(--_focused-outlined-outline-color);')
        expect(all).toContain('.container.disabled.text .label')
        expect(all).toContain('color: var(--_disabled-text-label-color);')
        expect(all).toContain('opacity: var(--_disabled-label-opacity);')
    })

    it('expands the elevation bridge per interaction', () => {
        expect(all).toContain('.container:active.elevated mdc-elevation')
        expect(all).toContain('var(--_pressed-elevated-container-elevation)')
    })

    it('bridges ripple per variant with shared state-layer opacity', () => {
        expect(all).toContain('.container.filled mdc-ripple')
        expect(all).toContain('--mdc-ripple-hovered-color: var(--_hovered-filled-state-layer-color);')
        expect(all).toContain('--mdc-ripple-hovered-opacity: var(--_hovered-state-layer-opacity);')
        expect(all).not.toContain('--mdc-ripple-enabled-hovered-color')
    })

    it('bridges elevation, icon and focus-ring with child token key names', () => {
        expect(all).toContain('--mdc-elevation-level: var(--_pressed-elevated-container-elevation);')
        expect(all).toContain('--mdc-elevation-shadow-color: var(--_container-shadow-color);')
        expect(all).not.toContain('--mdc-elevation-enabled-level')
    })

    it('does not include toggle-scoped selectors', () => {
        expect(all).not.toContain('.container.togglable')
    })
})
