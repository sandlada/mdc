/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { FocusRingStyle } from './focus-ring.style'

const CssText = FocusRingStyle.map((style) => style.cssText).join('\n')

describe('FocusRingStyle', () => {
    it('orders the hcm layer after contrast so forced colors win', () => {
        expect(CssText).toContain('@layer variable, component, motion, contrast, hcm')
    })

    it('keeps the private replay hook ahead of the component animation rules', () => {
        const replayIndex = CssText.indexOf(':host([data-replay][focused])')
        const outwardIndex = CssText.indexOf(':host([focused]:not([inward]))')

        expect(replayIndex).toBeGreaterThan(-1)
        expect(replayIndex).toBeGreaterThan(outwardIndex)
        expect(CssText).toContain('animation: none')
    })

    it('uses system colors in forced-colors mode', () => {
        expect(CssText).toContain('border-color: Highlight')
        expect(CssText).toContain('outline-color: Highlight')
        expect(CssText).toContain('color: Highlight')
    })

    it('disables motion when reduced motion is requested', () => {
        expect(CssText).toContain('@media (prefers-reduced-motion: reduce)')
        expect(CssText).toContain('animation: none')
        expect(CssText).toContain('transition: none')
    })

    it('does not rely on vendor-prefixed or selection-only properties', () => {
        expect(CssText).not.toContain('-webkit-tap-highlight-color')
        expect(CssText).not.toContain('user-select')
    })
})
