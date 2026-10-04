/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { toggleButtonStyles } from './toggle-button.style'

const cssTexts = toggleButtonStyles.map((part: any) =>
    typeof part === 'string' ? part : (part?.cssText ?? String(part))
)
const all = cssTexts.join('\n')
const tokens = cssTexts[0] ?? ''

describe('toggleButtonStyles token injection', () => {
    it('emits toggle button canonical variables on :host with --mdc-toggle-button prefix', () => {
        expect(tokens).toContain(':host')
        expect(tokens).toContain('--mdc-toggle-button-hovered-filled-selected-container-color')
        expect(tokens).toContain('--_hovered-filled-selected-container-color:')
        expect(tokens).toContain('--_extra-small-container-height:')
        expect(tokens).toContain('--_extra-small-label-leading:')
        expect(tokens).toContain('--_extra-small-container-shape-pressed-morph-start-start:')
        expect(tokens).toContain('--_extra-small-container-shape-round-selected-start-start:')
    })

    it('does not emit 2D button-only token variables', () => {
        expect(tokens).not.toContain('--_hovered-filled-container-color:')
    })
})

describe('toggleButtonStyles state expansion', () => {
    it('expands toggle combos with toggle scoping', () => {
        expect(all).toContain('.container.togglable:hover.filled.unselected .background')
        expect(all).toContain('var(--_hovered-filled-unselected-container-color)')
        expect(all).toContain('.container.togglable.selected.outlined mdc-ripple')
        expect(all).toContain('var(--_hovered-outlined-selected-state-layer-color)')
    })

    it('contains toggle-input styling', () => {
        expect(all).toContain('.toggle-input')
    })

    it('bridges elevation and icon correctly', () => {
        expect(all).toContain('--mdc-elevation-level: var(--_container-elevation);')
        expect(all).toContain('--mdc-elevation-shadow-color: var(--_container-shadow-color);')
        expect(all).toContain('--mdc-icon-size: var(--_extra-small-icon-size);')
    })
})
