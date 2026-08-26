/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import {
    extractStateTokenMetadata,
    compileStateSheet,
} from './state-sheet-compiler'

describe('state-sheet-compiler', () => {
    // Dummy definition representing component tokens
    const sampleDefinition = {
        // Static tokens
        'container-height': '40px',
        'label-size': '14px',
        'label-font': 'Roboto, sans-serif',
        'outline-width': '1px',

        // 5-state base tokens
        'enabled-container-color': '#6750a4',
        'hovered-container-color': '#7965b2',
        'focused-container-color': '#6750a4',
        'pressed-container-color': '#533c8f',
        'disabled-container-color': '#1c1b1f',

        'enabled-label-color': '#ffffff',
        'hovered-label-color': '#ffffff',
        'focused-label-color': '#ffffff',
        'pressed-label-color': '#ffffff',
        'disabled-label-color': '#1c1b1f',

        'enabled-outline-color': '#79747e',
        'hovered-outline-color': '#79747e',
        'focused-outline-color': '#6750a4',
        'pressed-outline-color': '#79747e',
        'disabled-outline-color': '#1c1b1f',

        // 5-state tokens with variant/modifier suffix (-selected, -toggle-selected)
        'enabled-label-color-toggle-selected': '#381e72',
        'hovered-label-color-toggle-selected': '#381e72',
        'focused-label-color-toggle-selected': '#381e72',
        'pressed-label-color-toggle-selected': '#381e72',
        'disabled-label-color-toggle-selected': '#1c1b1f',

        'enabled-container-color-selected': '#e8def8',
        'hovered-container-color-selected': '#ded3ef',
        'focused-container-color-selected': '#e8def8',
        'pressed-container-color-selected': '#cfc2e5',
        'disabled-container-color-selected': '#1c1b1f',

        'enabled-error-outline-color-unselected': '#b3261e',
        'hovered-error-outline-color-unselected': '#8c1d18',
        'focused-error-outline-color-unselected': '#b3261e',
        'pressed-error-outline-color-unselected': '#601410',
        'disabled-error-outline-color-unselected': '#1c1b1f',
    }

    describe('extractStateTokenMetadata', () => {
        it('identifies 5-state tokens and their base names', () => {
            const meta = extractStateTokenMetadata(sampleDefinition)
            expect(meta.isStateToken('container-color')).toBe(true)
            expect(meta.isStateToken('label-color')).toBe(true)
            expect(meta.isStateToken('outline-color')).toBe(true)
            expect(meta.isStateToken('label-color-toggle-selected')).toBe(true)
            expect(meta.isStateToken('container-color-selected')).toBe(true)
            expect(meta.isStateToken('error-outline-color-unselected')).toBe(true)
        })

        it('identifies static tokens as non-state tokens', () => {
            const meta = extractStateTokenMetadata(sampleDefinition)
            expect(meta.isStateToken('container-height')).toBe(false)
            expect(meta.isStateToken('label-size')).toBe(false)
            expect(meta.isStateToken('label-font')).toBe(false)
            expect(meta.isStateToken('outline-width')).toBe(false)
        })

        it('supports array of multiple definitions', () => {
            const defA = { 'enabled-color-a': 'red', 'hovered-color-a': 'darkred' }
            const defB = { 'enabled-color-b': 'blue', 'hovered-color-b': 'darkblue' }
            const meta = extractStateTokenMetadata([defA, defB])
            expect(meta.isStateToken('color-a')).toBe(true)
            expect(meta.isStateToken('color-b')).toBe(true)
        })
    })

    describe('compileStateSheet - Default :host anchor', () => {
        it('expands multi-state properties on :host with differential delta rules', () => {
            const inputCss = `
                :host {
                    display: inline-flex;
                    height: var(--_container-height);
                    background-color: var(--_container-color);
                    color: var(--_label-color);
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            // Base rule should contain static properties and enabled state tokens
            expect(result).toContain(':host {')
            expect(result).toContain('display: inline-flex;')
            expect(result).toContain('height: var(--_container-height);')
            expect(result).toContain('background-color: var(--_enabled-container-color);')
            expect(result).toContain('color: var(--_enabled-label-color);')

            // Hover delta rule should ONLY contain hovered tokens (NOT static display or height)
            expect(result).toContain(':host(:hover) {')
            expect(result).toContain('background-color: var(--_hovered-container-color);')
            expect(result).toContain('color: var(--_hovered-label-color);')
            expect(result).not.toMatch(/:host\(:hover\) \{[^}]*display:/)
            expect(result).not.toMatch(/:host\(:hover\) \{[^}]*height:/)

            // Focused, Pressed, Disabled delta rules
            expect(result).toContain(':host(:focus-within) {')
            expect(result).toContain('background-color: var(--_focused-container-color);')
            expect(result).toContain('color: var(--_focused-label-color);')

            expect(result).toContain(':host(:active) {')
            expect(result).toContain('background-color: var(--_pressed-container-color);')
            expect(result).toContain('color: var(--_pressed-label-color);')

            expect(result).toContain(':host([disabled]) {')
            expect(result).toContain('background-color: var(--_disabled-container-color);')
            expect(result).toContain('color: var(--_disabled-label-color);')
        })
    })

    describe('compileStateSheet - @anchor .container scope', () => {
        it('attaches state pseudo-classes to the declared anchor element', () => {
            const inputCss = `
                @anchor .container {
                    display: flex;
                    align-items: center;

                    .label {
                        font-size: var(--_label-size);
                        color: var(--_label-color);
                    }

                    .background {
                        background-color: var(--_container-color);
                    }
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            // Base rules
            expect(result).toContain('.container {')
            expect(result).toContain('display: flex;')
            expect(result).toContain('.container .label {')
            expect(result).toContain('font-size: var(--_label-size);')
            expect(result).toContain('color: var(--_enabled-label-color);')
            expect(result).toContain('.container .background {')
            expect(result).toContain('background-color: var(--_enabled-container-color);')

            // Hover delta rules
            expect(result).toContain('.container:hover .label {')
            expect(result).toContain('color: var(--_hovered-label-color);')
            expect(result).toContain('.container:hover .background {')
            expect(result).toContain('background-color: var(--_hovered-container-color);')
            // Static font-size should NOT be duplicated in hover
            expect(result).not.toMatch(/\.container:hover \.label \{[^}]*font-size:/)

            // Focused delta rules
            expect(result).toContain('.container:focus-within .label {')
            expect(result).toContain('color: var(--_focused-label-color);')

            // Pressed delta rules
            expect(result).toContain('.container:active .label {')
            expect(result).toContain('color: var(--_pressed-label-color);')

            // Disabled delta rules
            expect(result).toContain('.container.disabled .label {')
            expect(result).toContain('color: var(--_disabled-label-color);')
        })
    })

    describe('compileStateSheet - @when condition modifiers', () => {
        it('synthesizes orthogonal matrix rules for @when conditions', () => {
            const inputCss = `
                @anchor .container {
                    .label {
                        color: var(--_label-color);

                        @when(.togglable.selected) {
                            color: var(--_label-color-toggle-selected);
                        }
                    }
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            // 1. Base / Enabled
            expect(result).toContain('.container .label {')
            expect(result).toContain('color: var(--_enabled-label-color);')
            expect(result).toContain('.container.togglable.selected .label {')
            expect(result).toContain('color: var(--_enabled-label-color-toggle-selected);')

            // 2. Hovered
            expect(result).toContain('.container:hover .label {')
            expect(result).toContain('color: var(--_hovered-label-color);')
            expect(result).toContain('.container.togglable.selected:hover .label {')
            expect(result).toContain('color: var(--_hovered-label-color-toggle-selected);')

            // 3. Focused
            expect(result).toContain('.container:focus-within .label {')
            expect(result).toContain('color: var(--_focused-label-color);')
            expect(result).toContain('.container.togglable.selected:focus-within .label {')
            expect(result).toContain('color: var(--_focused-label-color-toggle-selected);')

            // 4. Pressed
            expect(result).toContain('.container:active .label {')
            expect(result).toContain('color: var(--_pressed-label-color);')
            expect(result).toContain('.container.togglable.selected:active .label {')
            expect(result).toContain('color: var(--_pressed-label-color-toggle-selected);')

            // 5. Disabled
            expect(result).toContain('.container.disabled .label {')
            expect(result).toContain('color: var(--_disabled-label-color);')
            expect(result).toContain('.container.disabled.togglable.selected .label {')
            expect(result).toContain('color: var(--_disabled-label-color-toggle-selected);')
        })

        it('synthesizes host attribute modifiers like @when([data-aria-invalid="true"])', () => {
            const inputCss = `
                @anchor :host {
                    .outline {
                        border-color: var(--_outline-color);

                        @when([data-aria-invalid="true"]) {
                            border-color: var(--_error-outline-color-unselected);
                        }
                    }
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            expect(result).toContain(':host .outline {')
            expect(result).toContain('border-color: var(--_enabled-outline-color);')
            expect(result).toContain(':host([data-aria-invalid="true"]) .outline {')
            expect(result).toContain('border-color: var(--_enabled-error-outline-color-unselected);')

            expect(result).toContain(':host(:hover) .outline {')
            expect(result).toContain('border-color: var(--_hovered-outline-color);')
            expect(result).toContain(':host([data-aria-invalid="true"]:hover) .outline {')
            expect(result).toContain('border-color: var(--_hovered-error-outline-color-unselected);')
        })

        it('optimizes static / literal values inside @when to a single rule without 5-state explosion', () => {
            const inputCss = `
                @anchor .container {
                    .outline {
                        border-color: var(--_outline-color);

                        @when(.selected) {
                            border-color: transparent;
                        }
                    }
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            // Normal outline token expands to 5 states
            expect(result).toContain('.container .outline {')
            expect(result).toContain('border-color: var(--_enabled-outline-color);')
            expect(result).toContain('.container:hover .outline {')
            expect(result).toContain('border-color: var(--_hovered-outline-color);')

            // Literal transparent is emitted only once for .selected
            expect(result).toContain('.container.selected .outline {')
            expect(result).toContain('border-color: transparent;')

            // Should NOT emit .container.selected:hover .outline { border-color: transparent; }
            expect(result).not.toContain('.container.selected:hover .outline')
        })

        it('properly balances nested parentheses for complex host selectors like :host(:not([variant*="drawer"]))', () => {
            const inputCss = `
                :host(:not([variant*="drawer"])) {
                    .indicator {
                        background-color: var(--_outline-color);

                        @when([checked]) {
                            background-color: var(--_error-outline-color-unselected);
                        }
                    }
                }
            `

            const result = compileStateSheet(sampleDefinition, inputCss)

            // Enabled Base Rules
            expect(result).toContain(':host(:not([variant*="drawer"])) .indicator {')
            expect(result).toContain(':host(:not([variant*="drawer"])[checked]) .indicator {')

            // Hovered Delta Rules
            expect(result).toContain(':host(:not([variant*="drawer"]):hover) .indicator {')
            expect(result).toContain(':host(:not([variant*="drawer"])[checked]:hover) .indicator {')

            // Disabled Delta Rules
            expect(result).toContain(':host(:not([variant*="drawer"])[disabled]) .indicator {')
            expect(result).toContain(':host(:not([variant*="drawer"])[checked][disabled]) .indicator {')

            // Crucial: conditions must NEVER be swallowed into :not(...)
            expect(result).not.toContain(':not([variant*="drawer"][checked]')
            expect(result).not.toContain(':not([variant*="drawer"][checked][disabled]')
        })
    })
})
