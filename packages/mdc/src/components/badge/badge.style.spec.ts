/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { BadgeStyles } from './badge.style'
import { CSSResult } from 'lit'

describe('BadgeStyles', () => {
    it('exports a valid array of CSSResult or CSSResult', () => {
        expect(BadgeStyles).toBeDefined()
        const stylesArray = Array.isArray(BadgeStyles) ? BadgeStyles : [BadgeStyles]
        for (const s of stylesArray) {
            expect(s).toBeInstanceOf(CSSResult)
        }
    })

    it('contains compiled token references with size states', () => {
        const fullCss = (Array.isArray(BadgeStyles) ? BadgeStyles : [BadgeStyles])
            .map((s) => s.cssText)
            .join('\n')

        expect(fullCss).toContain('var(--_container-color)')
        expect(fullCss).toContain('var(--_label-color)')
        expect(fullCss).toContain('var(--_small-container-size)')
        expect(fullCss).toContain('var(--_large-container-size)')
    })

    it('contains high contrast and forced-colors rules using native system colors', () => {
        const fullCss = (Array.isArray(BadgeStyles) ? BadgeStyles : [BadgeStyles])
            .map((s) => s.cssText)
            .join('\n')

        expect(fullCss).toContain('@media (forced-colors: active)')
        expect(fullCss).toContain('Highlight')
        expect(fullCss).toContain('HighlightText')
        expect(fullCss).toContain('CanvasText')
        expect(fullCss).toContain('@media (prefers-contrast: more)')
        expect(fullCss).toContain('@media (prefers-contrast: less)')
    })
})
