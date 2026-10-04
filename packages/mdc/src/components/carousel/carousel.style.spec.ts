/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { CarouselStyles } from './carousel.style'
import { CarouselItemStyles } from './carousel-item.style'
import { CSSResult } from 'lit'

describe('CarouselStyles', () => {
    it('exports a valid array of CSSResult', () => {
        expect(Array.isArray(CarouselStyles)).toBe(true)
        for (const s of CarouselStyles) {
            expect(s).toBeInstanceOf(CSSResult)
        }
    })

    it('injects definition-driven tokens with per-size item variables', () => {
        const [, tokenCss] = CarouselStyles.map((s) => s.cssText)

        // Per-size width chains (size acts as the state dimension).
        expect(tokenCss).toContain('--_small-item-width:')
        expect(tokenCss).toContain('--_medium-item-width:')
        expect(tokenCss).toContain('--_large-item-width:')
        expect(tokenCss).toContain('--mdc-carousel-small-item-width')
        expect(tokenCss).toContain('--mdc-carousel-medium-item-width')
        expect(tokenCss).toContain('--mdc-carousel-large-item-width')

        // Shape expanded to the four logical corners, per size.
        for (const size of ['small', 'medium', 'large']) {
            for (const corner of ['start-start', 'start-end', 'end-start', 'end-end']) {
                expect(tokenCss).toContain(`--_${size}-item-shape-${corner}:`)
            }
        }
        expect(tokenCss).toContain('--mdc-carousel-large-item-shape-start-start')

        // Static tokens.
        expect(tokenCss).toContain('--_item-spacing:')
        expect(tokenCss).toContain('--_item-height:')
        expect(tokenCss).toContain('--_container-padding-inline-start:')
        expect(tokenCss).toContain('--_container-padding-inline-end:')
        expect(tokenCss).toContain('--_container-padding-block-start:')
        expect(tokenCss).toContain('--_container-padding-block-end:')
    })

    it('styles the host as the scroll-snap container', () => {
        const styleCss = CarouselStyles[2].cssText

        expect(styleCss).toContain('display: flex;')
        expect(styleCss).toContain('align-items: stretch;')
        expect(styleCss).toContain('gap: var(--_item-spacing);')
        expect(styleCss).toContain('padding-inline-start: var(--_container-padding-inline-start);')
        expect(styleCss).toContain('padding-block-start: var(--_container-padding-block-start);')
        expect(styleCss).toContain('scroll-snap-type: x mandatory;')
        expect(styleCss).toContain('scroll-padding-inline-start: var(--_container-padding-inline-start);')
        expect(styleCss).toContain('scroll-snap-align: start;')
        expect(styleCss).toContain('scroll-snap-stop: always;')
        expect(styleCss).toContain('::slotted(mdc-carousel-item)')
    })

    it('disables snapping in the uncontained variant', () => {
        const styleCss = CarouselStyles[2].cssText

        const uncontainedMatch = styleCss.match(/:host\(\[variant='uncontained'\]\)\s*\{([^}]+)\}/)
        expect(uncontainedMatch).not.toBeNull()
        expect(uncontainedMatch![1]).toContain('scroll-snap-type: none;')

        const itemMatch = styleCss.match(/:host\(\[variant='uncontained'\]\) ::slotted\(mdc-carousel-item\)\s*\{([^}]+)\}/)
        expect(itemMatch).not.toBeNull()
        expect(itemMatch![1]).toContain('scroll-snap-align: none;')
    })

    it('contains a reduced-motion layer', () => {
        const fullCss = CarouselStyles.map((s) => s.cssText).join('\n')

        expect(fullCss).toContain('@layer mdc.carousel.motion')
        expect(fullCss).toContain('@media (prefers-reduced-motion: reduce)')
        expect(fullCss).toContain('scroll-behavior: auto;')
    })
})

describe('CarouselItemStyles', () => {
    it('consumes the inherited carousel tokens per size', () => {
        expect(CarouselItemStyles).toBeInstanceOf(CSSResult)
        const cssText = CarouselItemStyles.cssText

        expect(cssText).toContain('height: var(--_item-height);')
        expect(cssText).toContain('width: var(--_large-item-width);')
        expect(cssText).toContain('width: var(--_medium-item-width);')
        expect(cssText).toContain('width: var(--_small-item-width);')

        // Four-corner roundness, per size.
        for (const size of ['small', 'medium', 'large']) {
            for (const corner of ['start-start', 'start-end', 'end-start', 'end-end']) {
                expect(cssText).toContain(`border-${corner}-radius: var(--_${size}-item-shape-${corner});`)
            }
        }
    })

    it('stretches slotted content to fill the cell', () => {
        const cssText = CarouselItemStyles.cssText

        expect(cssText).toContain('::slotted(*)')
        expect(cssText).toContain('flex: 1;')
        expect(cssText).toContain('min-width: 0;')
    })
})
