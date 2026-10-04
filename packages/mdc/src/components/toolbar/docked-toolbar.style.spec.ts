/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { MDCDockedToolbarStyles } from './internal/docked-toolbar.styles'
import { CSSResult } from 'lit'

describe('MDCDockedToolbarStyles', () => {
    it('exports valid CSSResult with icon-button override variables and layer styles', () => {
        expect(MDCDockedToolbarStyles).toBeDefined()
        const stylesArray = Array.isArray(MDCDockedToolbarStyles) ? MDCDockedToolbarStyles : [MDCDockedToolbarStyles]
        for (const s of stylesArray) {
            expect(s).toBeInstanceOf(CSSResult)
        }

        const fullCss = stylesArray.map((s) => s.cssText).join('\n')

        // Layer declaration
        expect(fullCss).toContain('@layer mdc.docked-toolbar')

        // Action icon button overrides for standard toolbar
        expect(fullCss).toContain('--mdc-icon-button-container-color')
        expect(fullCss).toContain('--mdc-icon-button-icon-color')

        // Container structure and sizing
        expect(fullCss).toContain('.container.standard')
        expect(fullCss).toContain('.container.vibrant')
        expect(fullCss).toContain('height: var(--_container-height)')
        expect(fullCss).toContain('padding-inline-start: var(--_container-padding-inline-start);')
        expect(fullCss).toContain('padding-block-start: var(--_container-padding-block-start);')

        // Background layer
        expect(fullCss).toContain('.container > .background')
        expect(fullCss).toContain('background: var(--_enabled-standard-container-color);')
        expect(fullCss).toContain('background: var(--_enabled-vibrant-container-color);')
    })
})
