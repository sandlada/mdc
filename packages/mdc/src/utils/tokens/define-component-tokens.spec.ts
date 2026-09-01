/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { defineComponentTokens } from './define-component-tokens'

describe('defineComponentTokens', () => {
    const dummyDefinition = {
        'container-height': '36px',
        'container-shape': '8px',
        'enabled-container-color': '#112233',
    }

    it('returns a Lit CSSResult instance containing CSS variable declarations', () => {
        const tokens = defineComponentTokens(dummyDefinition, {
            prefix: '--mdc-test',
        })

        expect(tokens).toBeInstanceOf(CSSResult)
        const cssText = tokens.cssText
        expect(cssText).toContain('--_container-height: var(--mdc-test-container-height, 36px);')
        expect(cssText).toContain('--_enabled-container-color: var(--mdc-test-enabled-container-color, #112233);')
    })

    it('supports expandShapes option', () => {
        const tokens = defineComponentTokens(dummyDefinition, {
            prefix: '--mdc-test',
            expandShapes: true,
            useBaseFallback: true,
        })

        expect(tokens).toBeInstanceOf(CSSResult)
        const cssText = tokens.cssText
        expect(cssText).toContain('--_container-shape-start-start: var(--mdc-test-container-shape-start-start, var(--mdc-test-container-shape, 8px));')
        expect(cssText).toContain('--_container-shape-start-end: var(--mdc-test-container-shape-start-end, var(--mdc-test-container-shape, 8px));')
        expect(cssText).toContain('--_container-shape-end-end: var(--mdc-test-container-shape-end-end, var(--mdc-test-container-shape, 8px));')
        expect(cssText).toContain('--_container-shape-end-start: var(--mdc-test-container-shape-end-start, var(--mdc-test-container-shape, 8px));')
    })

    it('can be directly interpolated into a Lit css tagged template', () => {
        const tokens = defineComponentTokens(dummyDefinition, {
            prefix: '--mdc-test',
        })

        const styleSheet = css`
            :host {
                ${tokens}
            }
        `

        expect(styleSheet).toBeInstanceOf(CSSResult)
        expect(styleSheet.cssText).toContain(':host {')
        expect(styleSheet.cssText).toContain('--_container-height: var(--mdc-test-container-height, 36px);')
    })
})
