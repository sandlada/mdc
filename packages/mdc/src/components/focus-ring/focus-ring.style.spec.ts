/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { FocusRingStyle } from './focus-ring.style'
import { CSSResult } from 'lit'

describe('FocusRingStyle', () => {
    it('exports a valid array of CSSResult', () => {
        expect(FocusRingStyle).toBeDefined()
        const stylesArray = Array.isArray(FocusRingStyle) ? FocusRingStyle : [FocusRingStyle]
        for (const s of stylesArray) {
            expect(s).toBeInstanceOf(CSSResult)
        }
    })

    it('contains valid @layer mdc, @keyframes, and @media definitions without selector corruption', () => {
        const fullCss = (Array.isArray(FocusRingStyle) ? FocusRingStyle : [FocusRingStyle])
            .map((s) => s.cssText)
            .join('\n')

        // Must contain valid @layer mdc
        expect(fullCss).toContain('@layer mdc')

        // Must contain @keyframes outward-grow and outward-shrink
        expect(fullCss).toContain('@keyframes outward-grow')
        expect(fullCss).toContain('@keyframes outward-shrink')
        expect(fullCss).toContain('outline-width: var(--_enabled-active-width);')

        // Must display on focused or persistent
        expect(fullCss).toContain(':host([persistent])')

        // Must support discrete display transition and @starting-style
        expect(fullCss).toContain('transition-behavior: allow-discrete;')
        expect(fullCss).toContain('@starting-style')

        // Must support asymmetric duration (fast entrance, smooth exit)
        expect(fullCss).toContain('calc(var(--_enabled-duration) * 0.4)')
        expect(fullCss).toContain('calc(var(--_enabled-duration) * 0.15)')


        // Must contain @media queries and forced-colors Highlight
        expect(fullCss).toContain('@media (prefers-reduced-motion: reduce)')
        expect(fullCss).toContain('@media (forced-colors: active)')
        expect(fullCss).toContain('border-color: Highlight;')
        expect(fullCss).toContain('outline-color: Highlight;')

        // Must NOT contain corrupted selector combinations
        expect(fullCss).not.toContain(':host([focused]) ,')
        expect(fullCss).not.toContain(':host([persistent]) ,')
        expect(fullCss).not.toContain(':host , @layer')
        expect(fullCss).not.toContain('@layer mdc @keyframes')
    })
})



