/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { DividerStyles } from './divider.style'
import { CSSResult } from 'lit'

describe('DividerStyles compilation', () => {
    it('exports a valid array of CSSResult', () => {
        expect(DividerStyles).toBeDefined()
        expect(Array.isArray(DividerStyles)).toBe(true)
        for (const s of DividerStyles) {
            expect(s).toBeInstanceOf(CSSResult)
        }
    })

    it('generates valid token definitions and base styles', () => {
        const [layerCss, tokenCss, styleCss] = DividerStyles.map((s) => s.cssText)

        expect(layerCss).toContain('@layer mdc.divider')
        expect(layerCss).toContain('@layer variable, component, motion, hcm, contrast, transparency;')

        expect(tokenCss).toContain('--mdc-divider-thickness')
        expect(tokenCss).toContain('--mdc-divider-color')

        expect(styleCss).toContain(':host {')
        expect(styleCss).toContain('height: var(--_thickness);')
        expect(styleCss).toContain('color: var(--_color);')
        expect(styleCss).toContain(':host([inset])')
        expect(styleCss).toContain(':host([inset-start])')
        expect(styleCss).toContain(':host([inset-end])')
        expect(styleCss).toContain(':host::before')
        expect(styleCss).toContain('@media (forced-colors: active)')
        expect(styleCss).not.toContain(':host(:host')
    })

    it('contains accessibility media query rules', () => {
        const fullCss = DividerStyles.map((s) => s.cssText).join('\n')

        expect(fullCss).toContain('@layer mdc.divider.motion')
        expect(fullCss).toContain('@media (prefers-reduced-motion: reduce)')

        expect(fullCss).toContain('@layer mdc.divider.hcm')
        expect(fullCss).toContain('@media (forced-colors: active)')
        expect(fullCss).toContain('CanvasText')

        expect(fullCss).toContain('@layer mdc.divider.contrast')
        expect(fullCss).toContain('@media (prefers-contrast: more)')
        expect(fullCss).toContain('@media (prefers-contrast: less)')

        expect(fullCss).toContain('@layer mdc.divider.transparency')
        expect(fullCss).toContain('@media (prefers-reduced-transparency: reduce)')
    })
})
