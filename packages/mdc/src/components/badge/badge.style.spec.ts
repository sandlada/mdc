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

    it('contains compiled token references with size states in specific rule blocks', () => {
        expect(Array.isArray(BadgeStyles)).toBe(true)
        const [tokenSheet, styleSheet] = BadgeStyles as [CSSResult, CSSResult]

        // 1. Injected token layer (:host custom property bindings)
        expect(tokenSheet.cssText).toContain('--_small-container-size:')
        expect(tokenSheet.cssText).toContain('--_large-container-size:')
        expect(tokenSheet.cssText).toContain('--_small-container-padding-block-start:')
        expect(tokenSheet.cssText).toContain('--_large-container-padding-block-start:')

        // 2. Component style rules: exact rule blocks must reference state-specific variables
        const styleCss = styleSheet.cssText

        // Extract .container.small rule block
        const smallMatch = styleCss.match(/\.container\.small\s*\{([^}]+)\}/)
        expect(smallMatch).not.toBeNull()
        const smallBody = smallMatch![1]
        expect(smallBody).toContain('height: var(--_small-container-size);')
        expect(smallBody).toContain('min-width: var(--_small-container-size);')
        expect(smallBody).toContain('padding-block-start: var(--_small-container-padding-block-start);')
        expect(smallBody).toContain('padding-block-end: var(--_small-container-padding-block-end);')
        expect(smallBody).toContain('padding-inline-start: var(--_small-container-padding-inline-start);')
        expect(smallBody).toContain('padding-inline-end: var(--_small-container-padding-inline-end);')
        expect(smallBody).not.toContain('var(--_container-size)')
        expect(smallBody).not.toContain('var(--_container-padding')

        // Extract .container.large rule block
        const largeMatch = styleCss.match(/\.container\.large\s*\{([^}]+)\}/)
        expect(largeMatch).not.toBeNull()
        const largeBody = largeMatch![1]
        expect(largeBody).toContain('height: var(--_large-container-size);')
        expect(largeBody).toContain('min-width: var(--_large-container-size);')
        expect(largeBody).toContain('padding-block-start: var(--_large-container-padding-block-start);')
        expect(largeBody).toContain('padding-block-end: var(--_large-container-padding-block-end);')
        expect(largeBody).toContain('padding-inline-start: var(--_large-container-padding-inline-start);')
        expect(largeBody).toContain('padding-inline-end: var(--_large-container-padding-inline-end);')
        expect(largeBody).not.toContain('var(--_container-size)')
        expect(largeBody).not.toContain('var(--_container-padding')

        // Base container rule must keep invariant tokens
        expect(styleCss).toContain('background: var(--_container-color);')
        expect(styleCss).toContain('color: var(--_label-color);')
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
