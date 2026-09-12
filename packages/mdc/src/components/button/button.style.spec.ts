/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { buttonStyles } from './internal/button.style'

const cssTexts = buttonStyles.map((part: any) =>
    typeof part === 'string' ? part : (part?.cssText ?? String(part))
)
const all = cssTexts.join('\n')
const tokens = cssTexts[0] ?? ''

describe('buttonStyles token injection', () => {
    it('emits button and toggle canonical variables on :host', () => {
        expect(tokens).toContain(':host')
        expect(tokens).toContain('--_hovered-filled-container-color:')
        expect(tokens).toContain('--_hovered-filled-selected-container-color:')
        expect(tokens).toContain('--_extra-small-container-height:')
        expect(tokens).toContain('--_extra-small-label-leading:')
        expect(tokens).toContain('--_extra-small-container-shape-pressed-morph-start-start:')
        expect(tokens).toContain('--_extra-small-container-shape-round-selected-start-start:')
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

    it('expands toggle combos with toggle scoping', () => {
        expect(all).toContain('.container.togglable:hover.filled.unselected .background')
        expect(all).toContain('var(--_hovered-filled-unselected-container-color)')
        expect(all).toContain('.container.togglable.selected.outlined mdc-ripple')
        expect(all).toContain('var(--_hovered-outlined-selected-state-layer-color)')
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
        expect(all).toContain('--mdc-icon-size: var(--_small-icon-size);')
        expect(all).not.toContain('--mdc-icon-enabled-size')
        expect(all).toContain('--mdc-focus-ring-shape-start-start:')
    })
})

describe('buttonStyles static rules', () => {
    it('keeps size, shape, morph and icon rules with scalar variables', () => {
        expect(all).toContain('.container.small .label')
        expect(all).toContain('var(--_small-label-leading)')
        expect(all).toContain('var(--_extra-small-container-shape-round-start-start)')
        expect(all).toContain('.container:not(.disable-morph')
        expect(all).toContain('var(--_small-container-shape-pressed-morph-start-start)')
        expect(all).toContain('.container.round.togglable.selected')
        expect(all).toContain('var(--_extra-small-container-shape-round-selected-start-start)')
        expect(all).toContain('.container.small :is(::slotted([slot="icon"]), .icon)')
        expect(all).toContain('var(--_small-icon-size)')
    })

    it('expands typescale and padding macros in compiled output', () => {
        expect(all).toContain('font-family: var(--_small-label-font);')
        expect(all).toContain('line-height: var(--_small-label-leading);')
        expect(all).toContain('letter-spacing: var(--_extra-small-label-tracking);')
        expect(all).toContain('padding-inline-start: var(--_small-container-padding-inline-start);')
        expect(all).toContain('padding-block-end: var(--_extra-large-container-padding-block-end);')
        expect(all).not.toContain('typescale: var(')
        expect(all).not.toContain('padding: var(--_small-container-padding)')
    })
    it('covers a11y media queries', () => {
        expect(all).toContain('@media (forced-colors: active)')
        expect(all).toContain('--_disabled-filled-icon-color: GrayText')
        expect(all).toContain('--_disabled-filled-selected-label-color: GrayText')
        expect(all).toContain('@media (prefers-reduced-motion: reduce)')
        expect(all).toContain('@media (prefers-contrast: more)')
        expect(all).toContain('@media (prefers-contrast: less)')
    })
})
