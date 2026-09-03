/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { DividerStyles } from './divider.style'

describe('DividerStyles compilation', () => {
    it('generates valid token definitions and base styles', () => {
        const tokenCss = DividerStyles[0].cssText
        const styleCss = DividerStyles[1].cssText

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
})
