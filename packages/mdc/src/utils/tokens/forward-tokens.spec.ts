/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { createStyleDefinition } from './create-style-definition'
import { forwardTokens } from './forward-tokens'
import { defineComponentTokenRefs } from './define-component-token-refs'

describe('forwardTokens & defineComponentTokenRefs (Comprehensive Spec)', () => {
    // Simulated child component definitions
    const IconDefinition = createStyleDefinition({
        'color': ['#000000', null, null, null, null],
        'size': ['24px', null, null, null, null],
    })

    const RippleDefinition = createStyleDefinition({
        'color': ['transparent', '#000000', '#000000', '#000000', null],
        'opacity': ['0', '0.08', '0.12', '0.12', null],
    })

    const FocusRingDefinition = createStyleDefinition({
        'color': ['#6750a4', null, null, null, null],
        'width': ['3px', null, null, null, null],
        'shape-start-start': ['4px', null, null, null, null],
        'shape-start-end': ['4px', null, null, null, null],
        'shape-end-end': ['4px', null, null, null, null],
        'shape-end-start': ['4px', null, null, null, null],
    })

    it('allows spreading forwardTokens directly inside createStyleDefinition and expands all 5-state tuples', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-color': ['#primary', '#hover', '#press', '#focus', '#disabled'],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#on-primary', '#on-hover', '#on-press', '#on-focus', '#on-disabled'],
                    'size': '18px',
                },
            }),
        })

        // Verify every single expanded property key and value in ButtonDefinition
        expect(ButtonDefinition).toEqual({
            'enabled-container-color': '#primary',
            'hovered-container-color': '#hover',
            'pressed-container-color': '#press',
            'focused-container-color': '#focus',
            'disabled-container-color': '#disabled',
            'enabled-icon-color': '#on-primary',
            'hovered-icon-color': '#on-hover',
            'pressed-icon-color': '#on-press',
            'focused-icon-color': '#on-focus',
            'disabled-icon-color': '#on-disabled',
            'icon-size': '18px',
        })
    })

    it('defineComponentTokenRefs only emits child public variables for states supported by TargetDefinition', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-color': ['#primary', '#hover', '#press', '#focus', '#disabled'],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#on-primary', '#on-hover', '#on-press', '#on-focus', '#on-disabled'],
                    'size': '18px',
                },
            }),
        })

        const tokens = defineComponentTokenRefs(ButtonDefinition, {
            prefix: '--mdc-button',
        })

        expect(tokens).toBeInstanceOf(CSSResult)
        const cssText = tokens.cssText

        // 1. Parent private variables for internal button styling & createStyleSheet expansion
        expect(cssText).toContain('--_enabled-container-color: var(--mdc-button-enabled-container-color, #primary);')
        expect(cssText).toContain('--_hovered-container-color: var(--mdc-button-hovered-container-color, #hover);')
        expect(cssText).toContain('--_enabled-icon-color: var(--mdc-button-enabled-icon-color, #on-primary);')
        expect(cssText).toContain('--_hovered-icon-color: var(--mdc-button-hovered-icon-color, #on-hover);')
        expect(cssText).toContain('--_pressed-icon-color: var(--mdc-button-pressed-icon-color, #on-press);')
        expect(cssText).toContain('--_focused-icon-color: var(--mdc-button-focused-icon-color, #on-focus);')
        expect(cssText).toContain('--_disabled-icon-color: var(--mdc-button-disabled-icon-color, #on-disabled);')
        expect(cssText).toContain('--_icon-size: var(--mdc-button-icon-size, 18px);')

        // 2. Child public bridge variables: ONLY enabled is supported by IconDefinition
        expect(cssText).toContain('--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, #on-primary);')
        expect(cssText).toContain('--mdc-icon-enabled-size: var(--mdc-button-icon-size, 18px);')

        // 3. MUST NOT emit dead child variables for states that IconDefinition doesn't support
        expect(cssText).not.toContain('--mdc-icon-hovered-color')
        expect(cssText).not.toContain('--mdc-icon-pressed-color')
        expect(cssText).not.toContain('--mdc-icon-focused-color')
        expect(cssText).not.toContain('--mdc-icon-disabled-color')
    })

    it('supports multiple child forwarded definitions (Icon + Ripple + FocusRing) with proper state-filtering', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-height': '40px',
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#fff', '#fff', '#fff', '#fff', '#888'],
                },
            }),
            ...forwardTokens(RippleDefinition, {
                targetPrefix: '--mdc-ripple',
                name: 'ripple',
                tokens: {
                    'hovered-color': '#fff',
                    'hovered-opacity': '0.08',
                },
            }),
            ...forwardTokens(FocusRingDefinition, {
                targetPrefix: '--mdc-focus-ring',
                name: 'focus-ring',
                tokens: {
                    'color': '#6750a4',
                    'shape-start-start': '20px',
                    'shape-start-end': '20px',
                    'shape-end-end': '20px',
                    'shape-end-start': '20px',
                },
            }),
        })

        const tokens = defineComponentTokenRefs(ButtonDefinition, {
            prefix: '--mdc-button',
        })

        const cssText = tokens.cssText

        // Parent private
        expect(cssText).toContain('--_container-height: var(--mdc-button-container-height, 40px);')

        // Icon public bridge (only enabled)
        expect(cssText).toContain('--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, #fff);')
        expect(cssText).not.toContain('--mdc-icon-disabled-color')

        // Ripple public bridge (Ripple actually supports hovered)
        expect(cssText).toContain('--mdc-ripple-hovered-color: var(--mdc-button-ripple-hovered-color, #fff);')
        expect(cssText).toContain('--mdc-ripple-hovered-opacity: var(--mdc-button-ripple-hovered-opacity, 0.08);')

        // FocusRing public bridge (FocusRing supports enabled color and shapes)
        expect(cssText).toContain('--mdc-focus-ring-enabled-color: var(--mdc-button-focus-ring-color, #6750a4);')
        expect(cssText).toContain('--mdc-focus-ring-enabled-shape-start-start: var(--mdc-button-focus-ring-shape-start-start, 20px);')
        expect(cssText).toContain('--mdc-focus-ring-enabled-shape-start-end: var(--mdc-button-focus-ring-shape-start-end, 20px);')
        expect(cssText).toContain('--mdc-focus-ring-enabled-shape-end-end: var(--mdc-button-focus-ring-shape-end-end, 20px);')
        expect(cssText).toContain('--mdc-focus-ring-enabled-shape-end-start: var(--mdc-button-focus-ring-shape-end-start, 20px);')
    })

    it('infers default namespace name from targetPrefix when name is omitted', () => {
        const ButtonDefinition = createStyleDefinition({
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                tokens: {
                    'color': ['#on-primary', null, null, null, null],
                    'size': '20px',
                },
            }),
        })

        expect(ButtonDefinition).toHaveProperty('enabled-icon-color', '#on-primary')
        expect(ButtonDefinition).toHaveProperty('icon-size', '20px')

        const tokens = defineComponentTokenRefs(ButtonDefinition, { prefix: '--mdc-button' })
        expect(tokens.cssText).toContain('--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, #on-primary);')
        expect(tokens.cssText).toContain('--mdc-icon-enabled-size: var(--mdc-button-icon-size, 20px);')
    })

    it('supports custom selector wrapping in defineComponentTokenRefs', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-color': ['red', null, null, null, null],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['white', null, null, null, null],
                },
            }),
        })

        const tokens = defineComponentTokenRefs(ButtonDefinition, {
            prefix: '--mdc-button',
            selector: ':host(.custom-theme)',
        })

        expect(tokens.cssText).toContain(':host(.custom-theme) {')
        expect(tokens.cssText).toContain('--_enabled-container-color: var(--mdc-button-enabled-container-color, red);')
        expect(tokens.cssText).toContain('--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, white);')
        expect(tokens.cssText.endsWith('}')).toBe(true)
    })

    it('filters out null and undefined values cleanly', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-color': ['#primary', null, null, null, null],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#on-primary', null, null, null, null],
                    'size': null,
                },
            }),
        })

        expect(ButtonDefinition).toHaveProperty('enabled-container-color', '#primary')
        expect(ButtonDefinition).toHaveProperty('enabled-icon-color', '#on-primary')
        expect(ButtonDefinition).not.toHaveProperty('icon-size')
        expect(ButtonDefinition).not.toHaveProperty('hovered-icon-color')

        const tokens = defineComponentTokenRefs(ButtonDefinition, { prefix: '--mdc-button' })
        expect(tokens.cssText).not.toContain('--mdc-icon-enabled-size')
        expect(tokens.cssText).not.toContain('--mdc-icon-hovered-color')
    })

    it('handles empty definition or empty tokens gracefully without error', () => {
        const EmptyDefinition = createStyleDefinition({
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                tokens: {},
            }),
        })

        expect(EmptyDefinition).toEqual({})

        const tokens = defineComponentTokenRefs(EmptyDefinition, { prefix: '--mdc-button' })
        expect(tokens.cssText).toBe('')
    })

    it('can be directly embedded into Lit :host stylesheet seamlessly', () => {
        const ButtonDefinition = createStyleDefinition({
            'container-color': ['red', null, null, null, null],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['white', null, null, null, null],
                },
            }),
        })

        const tokens = defineComponentTokenRefs(ButtonDefinition, {
            prefix: '--mdc-button',
        })

        const hostStyles = css`
            :host {
                ${tokens};
            }
        `

        expect(hostStyles).toBeInstanceOf(CSSResult)
        expect(hostStyles.cssText).toContain(':host {')
        expect(hostStyles.cssText).toContain('--_enabled-container-color: var(--mdc-button-enabled-container-color, red);')
        expect(hostStyles.cssText).toContain('--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, white);')
    })
})
