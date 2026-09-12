/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { styles, ElevationStyles } from './elevation.style'
import { CSSResult } from 'lit'

describe('ElevationStyles', () => {
    it('exports a valid array of CSSResult', () => {
        expect(styles).toBeDefined()
        expect(ElevationStyles).toBe(styles)
        expect(Array.isArray(styles)).toBe(true)
        for (const s of styles) {
            expect(s).toBeInstanceOf(CSSResult)
        }
    })

    it('contains layer declarations and compiled token references', () => {
        const [layerSheet, tokenSheet, styleSheet] = styles as [CSSResult, CSSResult, CSSResult]

        // 1. Layer declarations
        expect(layerSheet.cssText).toContain('@layer mdc.elevation')
        expect(layerSheet.cssText).toContain('@layer variable, component, motion, hcm, contrast, transparency;')

        // 2. Token definitions
        expect(tokenSheet.cssText).toContain('@layer mdc.elevation.variable')
        expect(tokenSheet.cssText).toContain('--_level: var(--mdc-elevation-level')
        expect(tokenSheet.cssText).toContain('--_shadow-color: var(--mdc-elevation-shadow-color')

        // 3. Component structure & pseudo-element shadow rules
        const styleCss = styleSheet.cssText
        expect(styleCss).toContain('@layer mdc.elevation.component')
        expect(styleCss).toContain(':host {')
        expect(styleCss).toContain('pointer-events: none;')
        expect(styleCss).toContain(':host([disabled])')
        expect(styleCss).toContain(':host(.hidden)')
        expect(styleCss).toContain('.elevation::before')
        expect(styleCss).toContain('.elevation::after')
        expect(styleCss).toContain('@starting-style')
        expect(styleCss).toContain('box-shadow:')
        expect(styleCss).toContain('transition-property: box-shadow, opacity, display;')
        expect(styleCss).toContain('transition-behavior: allow-discrete;')
    })

    it('contains accessibility and contrast rules', () => {
        const fullCss = styles.map((s) => s.cssText).join('\n')

        expect(fullCss).toContain('@layer mdc.elevation.motion')
        expect(fullCss).toContain('@media (prefers-reduced-motion: reduce)')

        expect(fullCss).toContain('@layer mdc.elevation.hcm')
        expect(fullCss).toContain('@media (forced-colors: active)')

        expect(fullCss).toContain('@layer mdc.elevation.contrast')
        expect(fullCss).toContain('@media (prefers-contrast: more)')
        expect(fullCss).toContain('CanvasText')
        expect(fullCss).toContain('@media (prefers-contrast: less)')
        expect(fullCss).toContain('ButtonBorder')

        expect(fullCss).toContain('@layer mdc.elevation.transparency')
        expect(fullCss).toContain('@media (prefers-reduced-transparency: reduce)')
    })
})
