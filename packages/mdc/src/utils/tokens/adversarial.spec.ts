/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, unsafeCSS, CSSResult } from 'lit'
import {
    createStyleDefinition,
    createStyleSheet,
    withStateTriggers,
    hostTrigger,
    selfTrigger,
    overrideTokens,
    overrideStyleSheet,
    pipe,
    compileStateSheet,
    composeStateSelector,
} from './index'

describe('Adversarial Test Suite', () => {
    describe('1. overrideTokens - Base key expansion with modern colon state definition', () => {
        it('expands base token name across all modern colon states defined in definition', () => {
            const ModernButtonDef = createStyleDefinition({
                'container-color': '#111111',
                'hover:container-color': '#222222',
                'active:container-color': '#333333',
                'disabled:container-color': '#444444',
            })

            const result = overrideTokens(ModernButtonDef, '--mdc-button', {
                'container-color': 'red',
            })

            expect(result.cssText).toContain('--mdc-button-container-color: red;')
            expect(result.cssText).toContain('--mdc-button-hover:container-color: red;')
            expect(result.cssText).toContain('--mdc-button-active:container-color: red;')
            expect(result.cssText).toContain('--mdc-button-disabled:container-color: red;')
        })

        it('maps modern colon override keys to legacy hyphen tokens when definition is legacy', () => {
            const LegacyButtonDef = {
                'enabled-container-color': '#111',
                'hovered-container-color': '#222',
                'pressed-container-color': '#333',
                'disabled-container-color': '#444',
            }

            const result = overrideTokens(LegacyButtonDef, '--mdc-button', {
                'hover:container-color': 'blue',
            })

            expect(result.cssText).toBe('--mdc-button-hovered-container-color: blue;')
        })

        it('maps legacy hyphen override keys to modern colon tokens when definition is modern', () => {
            const ModernDef = {
                'container-color': '#111',
                'hover:container-color': '#222',
            }

            const result = overrideTokens(ModernDef, '--mdc-button', {
                'hovered-container-color': 'cyan',
            })

            expect(result.cssText).toBe('--mdc-button-hover:container-color: cyan;')
        })
    })

    describe('2. createStyleSheet & tagged template literals with array interpolations', () => {
        it('handles array of CSSResult interpolations inside createStyleSheet tagged template', () => {
            const def = createStyleDefinition({
                'color': 'red',
            })

            const subStyle1 = css`opacity: 1;`
            const subStyle2 = css`display: flex;`

            const style = createStyleSheet(def)`
                :host {
                    ${[subStyle1, subStyle2]}
                    color: var(--_color);
                }
            `

            expect(style.cssText).toContain('opacity: 1;')
            expect(style.cssText).toContain('display: flex;')
            expect(style.cssText).not.toContain('[object Object]')
        })

        it('supports passing uninvoked withStateTriggers to createStyleSheet', () => {
            const style = createStyleSheet(withStateTriggers([
                hostTrigger('[active-tab]', 'active-tab'),
            ]))(createStyleDefinition({
                'container-color': 'white',
                'active-tab:container-color': 'blue',
            }))`
                @anchor .container {
                    background: var(--_container-color);
                }
            `

            expect(style.cssText).toContain(':host([active-tab]) .container {')
            expect(style.cssText).toContain('background: var(--_active-tab:container-color);')
        })
    })

    describe('3. Selector composition & @anchor edge cases', () => {
        it('correctly handles compound selectors on anchor: &.selected -> .container.selected:hover', () => {
            const def = createStyleDefinition({
                'container-color': 'white',
                'hover:container-color': 'yellow',
            })

            const cssText = `
                @anchor .container {
                    &.selected {
                        background-color: var(--_container-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container.selected {')
            expect(compiled).toContain('.container.selected:hover {')
            expect(compiled).not.toContain('.container:hover .selected')
        })

        it('does not confuse class names that share string prefix with anchor: .box-title vs @anchor .box', () => {
            const def = createStyleDefinition({
                'title-color': 'black',
                'hover:title-color': 'blue',
            })

            const cssText = `
                @anchor .box {
                    .box-title {
                        color: var(--_title-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.box .box-title {')
            expect(compiled).toContain('.box:hover .box-title {')
            expect(compiled).not.toContain('.box:hover -title')
            expect(compiled).not.toContain('.box -title')
        })

        it('supports nested @when conditions: @when(.selected) { @when([error]) { ... } }', () => {
            const def = createStyleDefinition({
                'label-color': 'black',
                'error-label-color-selected': 'red',
            })

            const cssText = `
                @anchor .container {
                    .label {
                        color: var(--_label-color);

                        @when(.selected) {
                            @when([error]) {
                                color: var(--_error-label-color-selected);
                            }
                        }
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container.selected[error] .label {')
            expect(compiled).toContain('color: var(--_error-label-color-selected);')
        })

        it('safely handles strings containing semicolons and data URIs', () => {
            const def = createStyleDefinition({
                'icon-color': 'black',
            })

            const cssText = `
                :host {
                    font-family: 'Foo;Bar', sans-serif;
                    background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 10 10"><path d="M0 0; 10 10"/></svg>');
                    color: var(--_icon-color);
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain("font-family: 'Foo;Bar', sans-serif;")
            expect(compiled).toContain("background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 10 10\"><path d=\"M0 0; 10 10\"/></svg>');")
            expect(compiled).toContain('color: var(--_icon-color);')
        })

        it('supports multiple @anchor blocks in a single stylesheet', () => {
            const def = createStyleDefinition({
                'container-color': 'white',
                'hover:container-color': 'lightgray',
                'badge-color': 'red',
                'hover:badge-color': 'darkred',
            })

            const cssText = `
                @anchor .container {
                    background-color: var(--_container-color);
                }

                @anchor .badge {
                    color: var(--_badge-color);
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container {')
            expect(compiled).toContain('background-color: var(--_container-color);')
            expect(compiled).toContain('.badge {')
            expect(compiled).toContain('color: var(--_badge-color);')

            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background-color: var(--_hover:container-color);')
            expect(compiled).toContain('.badge:hover {')
            expect(compiled).toContain('color: var(--_hover:badge-color);')
        })

        it('handles deeply nested @layer + @media + @anchor blocks', () => {
            const def = createStyleDefinition({
                'container-color': 'white',
                'hover:container-color': 'blue',
            })

            const cssText = `
                @layer mdc {
                    @media (min-width: 600px) {
                        @anchor .container {
                            background-color: var(--_container-color);
                        }
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('@layer mdc {')
            expect(compiled).toContain('@media (min-width: 600px) {')
            expect(compiled).toContain('.container {')
            expect(compiled).toContain('background-color: var(--_container-color);')
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background-color: var(--_hover:container-color);')
        })

        it('supports 3+ compound state chains with host triggers: :host([checked][error]) .container.dragged:hover', () => {
            const def = createStyleDefinition({
                'item-color': 'white',
                'checked:error:dragged:hover:item-color': 'purple',
            })

            const cssText = `
                @anchor .container {
                    .item {
                        color: var(--_item-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container .item {')
            expect(compiled).toContain(':host([checked][error]) .container.dragged:hover .item {')
            expect(compiled).toContain('color: var(--_checked:error:dragged:hover:item-color);')
        })

        it('properly distributes comma-separated child selectors under @anchor for base and state deltas', () => {
            const def = createStyleDefinition({
                'text-color': 'black',
                'hover:text-color': 'blue',
            })

            const cssText = `
                @anchor .container {
                    .icon,
                    .label {
                        color: var(--_text-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container .icon, .container .label {')
            expect(compiled).toContain('color: var(--_text-color);')
            expect(compiled).toContain('.container:hover .icon, .container:hover .label {')
            expect(compiled).toContain('color: var(--_hover:text-color);')
        })

        it('properly expands comma-separated compound selectors &.active, &.selected', () => {
            const def = createStyleDefinition({
                'container-color': 'white',
                'hover:container-color': 'yellow',
            })

            const cssText = `
                @anchor .container {
                    &.active,
                    &.selected {
                        background: var(--_container-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container.active, .container.selected {')
            expect(compiled).toContain('.container.active:hover, .container.selected:hover {')
            expect(compiled).toContain('background: var(--_hover:container-color);')
        })

        it('correctly places pseudo-elements after state pseudo-classes: .container:hover::before', () => {
            const def = createStyleDefinition({
                'indicator-color': 'blue',
                'hover:indicator-color': 'darkblue',
                'checked:indicator-color': 'green',
            })

            const cssText = `
                @anchor .container {
                    &::before {
                        background: var(--_indicator-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container::before {')
            expect(compiled).toContain('background: var(--_indicator-color);')
            expect(compiled).toContain('.container:hover::before {')
            expect(compiled).toContain('background: var(--_hover:indicator-color);')
            expect(compiled).not.toContain('.container::before:hover')

            expect(compiled).toContain(':host([checked]) .container::before {')
            expect(compiled).toContain('background: var(--_checked:indicator-color);')
        })

        it('handles compound anchor selectors with pseudo-elements: .container.selected:hover::after', () => {
            const def = createStyleDefinition({
                'accent-color': 'gray',
                'hover:accent-color': 'black',
            })

            const cssText = `
                @anchor .container {
                    &.selected::after {
                        background: var(--_accent-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container.selected::after {')
            expect(compiled).toContain('.container.selected:hover::after {')
            expect(compiled).not.toContain('.container.selected::after:hover')
        })

        it('handles host pseudo-elements correctly: :host(:hover)::before', () => {
            const def = createStyleDefinition({
                'bg-color': 'white',
                'hover:bg-color': 'red',
            })

            const cssText = `
                @anchor :host {
                    &::before {
                        background: var(--_bg-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain(':host::before {')
            expect(compiled).toContain(':host(:hover)::before {')
            expect(compiled).not.toContain(':host::before:hover')
        })

        it('handles direct child and sibling combinators under @anchor: > .icon, + .label, ~ .badge', () => {
            const def = createStyleDefinition({
                'icon-color': 'red',
                'hover:icon-color': 'darkred',
                'label-color': 'green',
                'hover:label-color': 'darkgreen',
            })

            const cssText = `
                @anchor .container {
                    > .icon {
                        color: var(--_icon-color);
                    }
                    + .label {
                        color: var(--_label-color);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container > .icon {')
            expect(compiled).toContain('.container:hover > .icon {')
            expect(compiled).toContain('.container + .label {')
            expect(compiled).toContain('.container:hover + .label {')
        })

        it('handles descendant element with pseudo-elements under @anchor: .container .label::after', () => {
            const def = createStyleDefinition({
                'accent': 'black',
                'hover:accent': 'blue',
                'checked:accent': 'purple',
            })

            const cssText = `
                @anchor .container {
                    .label::after {
                        content: '*';
                        color: var(--_accent);
                    }
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container .label::after {')
            expect(compiled).toContain('color: var(--_accent);')
            expect(compiled).toContain('.container:hover .label::after {')
            expect(compiled).toContain('color: var(--_hover:accent);')
            expect(compiled).toContain(':host([checked]) .container .label::after {')
            expect(compiled).toContain('color: var(--_checked:accent);')
        })
    })

    describe('4. Override state aliases resolution', () => {
        it('resolves hovered, pressed, focused colon keys in override records', () => {
            const def = createStyleDefinition({
                'color': 'black',
                'hover:color': 'blue',
                'active:color': 'red',
                'focus:color': 'yellow',
            })

            const result = overrideTokens(def, '--mdc-btn', {
                'hovered:color': 'cyan',
                'pressed:color': 'magenta',
                'focused:color': 'gold',
            })

            expect(result.cssText).toContain('--mdc-btn-hover:color: cyan;')
            expect(result.cssText).toContain('--mdc-btn-active:color: magenta;')
            expect(result.cssText).toContain('--mdc-btn-focus:color: gold;')
        })
    })

    describe('5. Multiple tokens per declaration & CSS function resolution', () => {
        it('expands multiple tokens within a single declaration: border: var(--_width) solid var(--_color)', () => {
            const def = createStyleDefinition({
                'border-width': '2px',
                'border-color': 'gray',
                'hover:border-color': 'blue',
            })

            const cssText = `
                @anchor .container {
                    border: var(--_border-width) solid var(--_border-color);
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border: var(--_border-width) solid var(--_border-color);')
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('border: var(--_border-width) solid var(--_hover:border-color);')
        })

        it('expands multiple stateful tokens with orthogonal states: linear-gradient(var(--_start), var(--_end))', () => {
            const def = createStyleDefinition({
                'start-color': '#fff',
                'hover:start-color': '#eee',
                'end-color': '#000',
                'checked:end-color': '#111',
            })

            const cssText = `
                @anchor .container {
                    background: linear-gradient(var(--_start-color), var(--_end-color));
                }
            `

            const compiled = compileStateSheet(def, cssText)
            expect(compiled).toContain('.container {')
            expect(compiled).toContain('background: linear-gradient(var(--_start-color), var(--_end-color));')
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background: linear-gradient(var(--_hover:start-color), var(--_end-color));')
            expect(compiled).toContain(':host([checked]) .container {')
            expect(compiled).toContain('background: linear-gradient(var(--_start-color), var(--_checked:end-color));')
        })
    })

    describe('6. Functional Pipe Combinations', () => {
        it('composes full style compilation pipeline using pipe()', () => {
            const def = createStyleDefinition({
                'container-color': 'white',
                'hover:container-color': 'yellow',
                'checked:container-color': 'green',
            })

            const compile = pipe(
                def,
                createStyleSheet(withStateTriggers([
                    hostTrigger('[checked]', 'checked'),
                ]))
            )

            const sheet = compile(() => css`
                @anchor .container {
                    background-color: var(--_container-color);
                }
            `)

            expect(sheet).toBeInstanceOf(CSSResult)
            expect(sheet.cssText).toContain('.container {')
            expect(sheet.cssText).toContain('.container:hover {')
            expect(sheet.cssText).toContain(':host([checked]) .container {')
        })
    })
})
