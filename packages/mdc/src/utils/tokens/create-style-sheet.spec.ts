/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, unsafeCSS, CSSResult } from 'lit'
import { createStyleSheet } from './create-style-sheet'

describe('createStyleSheet', () => {
    const dummyDefinition = {
        'container-height': '36px',
        'enabled-container-color': '#112233',
        'hovered-container-color': '#223344',
        'focused-container-color': '#112233',
        'pressed-container-color': '#334455',
        'disabled-container-color': '#555555',
        'enabled-label-color': '#ffffff',
        'hovered-label-color': '#ffffff',
        'focused-label-color': '#ffffff',
        'pressed-label-color': '#ffffff',
        'disabled-label-color': '#888888',
    }

    it('returns a valid Lit CSSResult instance', () => {
        const style = createStyleSheet(dummyDefinition, () => css`
            :host {
                height: var(--_container-height);
                background-color: var(--_container-color);
            }
        `)

        expect(style).toBeInstanceOf(CSSResult)
        const cssText = style.cssText
        expect(cssText).toContain(':host {')
        expect(cssText).toContain('height: var(--_container-height);')
        expect(cssText).toContain('background-color: var(--_enabled-container-color);')
        expect(cssText).toContain(':host(:hover) {')
        expect(cssText).toContain('background-color: var(--_hovered-container-color);')
    })

    it('handles template literal interpolations (unsafeCSS, variables)', () => {
        const customEasing = unsafeCSS('cubic-bezier(0.2, 0, 0, 1)')
        const extraClass = 'custom-modifier'

        const style = createStyleSheet(dummyDefinition, () => css`
            :host {
                transition-timing-function: ${customEasing};
            }
            .${unsafeCSS(extraClass)} {
                color: var(--_label-color);
            }
        `)

        const cssText = style.cssText
        expect(cssText).toContain('transition-timing-function: cubic-bezier(0.2, 0, 0, 1);')
        expect(cssText).toContain('.custom-modifier {')
        expect(cssText).toContain('color: var(--_enabled-label-color);')
    })

    it('supports direct CSS tagged template without callback', () => {
        const style = createStyleSheet(dummyDefinition)`
            :host {
                color: var(--_label-color);
            }
        `

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain(':host {')
        expect(style.cssText).toContain('color: var(--_enabled-label-color);')
        expect(style.cssText).toContain(':host(:hover) {')
        expect(style.cssText).toContain('color: var(--_hovered-label-color);')
    })
})
