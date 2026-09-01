/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { hostTrigger } from './host-trigger'
import { selfTrigger } from './self-trigger'
import { mapStateTriggers } from './map-state-triggers'
import { compileStateSheet, stripComments, composeStateSelector, appendToHostSelector, splitSelectorByComma } from './state-sheet-compiler'

describe('state-sheet-compiler', () => {
    describe('stripComments', () => {
        it('removes block comments /* ... */ cleanly', () => {
            const raw = '/* header comment */ .container { color: red; /* inline */ }'
            expect(stripComments(raw).trim()).toBe('.container { color: red;  }')
        })

        it('removes single line comments // ... cleanly', () => {
            const raw = '// top comment\n.container {\n    color: red; // trailing\n}'
            expect(stripComments(raw).trim()).toBe('.container {\n    color: red; \n}')
        })

        it('preserves quotes and strings containing comment characters', () => {
            const raw = '.container { content: "/* not a comment */"; url: "//test.png"; }'
            expect(stripComments(raw).trim()).toBe(raw)
        })
    })

    describe('splitSelectorByComma & appendToHostSelector & composeStateSelector', () => {
        it('splits selector by top-level commas respecting nested parens and brackets', () => {
            const sel = ':host([data-val="a, b"]), :host(:is(.x, .y)), .container'
            const parts = splitSelectorByComma(sel)
            expect(parts).toEqual([
                ':host([data-val="a, b"])',
                ':host(:is(.x, .y))',
                '.container'
            ])
        })

        it('appends modifier to simple :host selector', () => {
            expect(appendToHostSelector(':host', '[selected]')).toBe(':host([selected])')
        })

        it('appends modifier inside :host(...) respecting nested parens and quotes', () => {
            expect(appendToHostSelector(':host([variant="elevated"])', '[selected]')).toBe(':host([variant="elevated"][selected])')
            expect(appendToHostSelector(':host(:not([disabled]))', '[selected]')).toBe(':host(:not([disabled])[selected])')
            expect(appendToHostSelector(':host(:is([v="a"], [v="b"]))', '[selected]')).toBe(':host(:is([v="a"], [v="b"])[selected])')
            expect(appendToHostSelector(':host([data-expr="fn(1, 2)"])', '[selected]')).toBe(':host([data-expr="fn(1, 2)"][selected])')
        })

        it('composes state selector with pseudo-elements attaching modifier before pseudo-element', () => {
            const triggers = mapStateTriggers({
                'hovered': selfTrigger(':hover')
            })
            const sel = composeStateSelector({
                anchor: '.container::after',
                targetSelector: '.container::after',
                states: ['hovered'],
                registry: triggers
            })
            expect(sel).toBe('.container:hover::after')
        })

        it('composes state selector with host trigger on container anchor', () => {
            const triggers = mapStateTriggers({
                'selected': hostTrigger('[selected]')
            })
            const sel = composeStateSelector({
                anchor: '.container',
                targetSelector: '.container .label',
                states: ['selected'],
                registry: triggers
            })
            expect(sel).toBe(':host([selected]) .container .label')
        })
    })

    describe('Base Rule & Differential Minimal Delta Rules', () => {
        const ButtonSchema = defineSchema(['enabled', 'hovered', 'pressed', 'disabled'] as const)
        const ButtonDef = createStyleDefinition(ButtonSchema)({
            'container-shape': '8px',
            'container-color': ['#6750a4', '#7f67be', '#4f378b', '#e0e0e0'],
            'label-color': ['#ffffff', '#ffffff', '#ffffff', '#9e9e9e']
        })

        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': selfTrigger(':hover'),
            'pressed': selfTrigger(':active'),
            'disabled': hostTrigger('[disabled]')
        })

        it('emits Base Rule with invariant tokens and enabled state private variables', () => {
            const css = `
                @anchor .container {
                    border-radius: var(--_container-shape);
                    background-color: var(--_container-color);
                    .label {
                        color: var(--_label-color);
                    }
                }
            `
            const compiled = compileStateSheet(ButtonDef, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border-radius: var(--_container-shape);')
            expect(compiled).toContain('background-color: var(--_enabled-container-color);')
            expect(compiled).toContain('.container .label {')
            expect(compiled).toContain('color: var(--_enabled-label-color);')
        })

        it('emits Delta Rules only for states where token values actually differ', () => {
            const css = `
                @anchor .container {
                    background-color: var(--_container-color);
                    .label {
                        color: var(--_label-color);
                    }
                }
            `
            const compiled = compileStateSheet(ButtonDef, css, { registry: triggers })

            // container-color varies on hover, pressed, disabled
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background-color: var(--_hovered-container-color);')

            expect(compiled).toContain('.container:active {')
            expect(compiled).toContain('background-color: var(--_pressed-container-color);')

            expect(compiled).toContain(':host([disabled]) .container {')
            expect(compiled).toContain('background-color: var(--_disabled-container-color);')

            // label-color is identical for enabled, hovered, pressed (#ffffff) -> NO hover or active delta for .label!
            expect(compiled).not.toContain('.container:hover .label')
            expect(compiled).not.toContain('.container:active .label')

            // label-color differs on disabled (#9e9e9e) -> Delta rule emitted for disabled
            expect(compiled).toContain(':host([disabled]) .container .label {')
            expect(compiled).toContain('color: var(--_disabled-label-color);')
        })

        it('generates zero Delta Rules when all referenced tokens in a rule block are invariant', () => {
            const css = `
                @anchor .container {
                    border-radius: var(--_container-shape);
                    display: flex;
                    height: 40px;
                }
            `
            const compiled = compileStateSheet(ButtonDef, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border-radius: var(--_container-shape);')
            expect(compiled).toContain('display: flex;')
            expect(compiled).toContain('height: 40px;')

            expect(compiled).not.toContain(':hover')
            expect(compiled).not.toContain(':active')
            expect(compiled).not.toContain('[disabled]')
        })
    })

    describe('ATRules Lowering Grammar', () => {
        const Schema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
        const Def = createStyleDefinition(Schema)({
            'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
            'label-color': ['#ffffff', '#ffffff', '#9e9e9e']
        })

        it('lowers @when(...) conditions', () => {
            const css = `
                @anchor .container {
                    @when(.dense) {
                        padding: 4px;
                    }
                    @when(:host([variant="elevated"])) {
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                }
            `
            const compiled = compileStateSheet(Def, css)
            expect(compiled).toContain('.container.dense {')
            expect(compiled).toContain('padding: 4px;')
            expect(compiled).toContain(':host([variant="elevated"]) .container {')
            expect(compiled).toContain('box-shadow: 0 2px 4px rgba(0,0,0,0.2);')
        })

        it('lowers @variant(...) for single and comma-separated variants', () => {
            const css = `
                @anchor .container {
                    @variant(outlined) {
                        border: 1px solid var(--_label-color);
                    }
                    @variant(filled, tonal) {
                        background-color: var(--_container-color);
                    }
                }
            `
            const compiled = compileStateSheet(Def, css)
            expect(compiled).toContain(':host([variant="outlined"]) .container {')
            expect(compiled).toContain(':host([variant="filled"]) .container, :host([variant="tonal"]) .container {')
        })

        it('lowers @slot(...) and @slotted(...)', () => {
            const css = `
                @anchor .container {
                    @slot(leading) {
                        margin-inline-end: 8px;
                    }
                    @slot(default) {
                        flex: 1;
                    }
                    @slotted(leading) {
                        color: inherit;
                    }
                    @slotted(default) {
                        font-weight: 500;
                    }
                }
            `
            const compiled = compileStateSheet(Def, css)
            expect(compiled).toContain(':host(:has([slot="leading"])) .container {')
            expect(compiled).toContain('margin-inline-end: 8px;')
            expect(compiled).toContain(':host(:has(:not([slot]))) .container {')
            expect(compiled).toContain('flex: 1;')
            expect(compiled).toContain('::slotted([slot="leading"]) {')
            expect(compiled).toContain('::slotted(:not([slot])) {')
        })

        it('lowers @size(...) sugar', () => {
            const css = `
                @anchor .container {
                    @size(small) {
                        height: 32px;
                    }
                    @size(large) {
                        height: 48px;
                    }
                }
            `
            const compiled = compileStateSheet(Def, css)
            expect(compiled).toContain(':host([size="small"]) .container {')
            expect(compiled).toContain('height: 32px;')
            expect(compiled).toContain(':host([size="large"]) .container {')
            expect(compiled).toContain('height: 48px;')
        })

        it('expands @elevation(...) and merges transitions', () => {
            const triggers = mapStateTriggers({
                'enabled': '',
                'hovered': selfTrigger(':hover'),
                'disabled': hostTrigger('[disabled]')
            })
            const css = `
                @anchor .container {
                    background-color: var(--_container-color);
                    transition: transform 200ms ease;
                    @elevation(1)
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('box-shadow: var(--mdc-elevation-level-1);')
            expect(compiled).toContain('transition: transform 200ms ease, box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);')
            expect(compiled).toContain(':host([disabled]) .container {')
            expect(compiled).toContain('box-shadow: none;')
        })
    })

    describe('CSS Shorthand Decomposition', () => {
        const Schema = defineSchema(['enabled', 'hovered'] as const)
        const Def = createStyleDefinition(Schema)({
            'outline-color': ['#79747e', '#6750a4'],
            'label-color': ['#49454f', '#1d192b'],
            'container-color': ['transparent', '#e8def8']
        })

        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': selfTrigger(':hover')
        })

        it('decomposes border shorthand into minimal border-color in delta rules', () => {
            const css = `
                @anchor .container {
                    border: 1px solid var(--_label-color);
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border: 1px solid var(--_enabled-label-color);')

            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('border-color: var(--_hovered-label-color);')
            expect(compiled).not.toContain('border: 1px solid var(--_hovered-label-color);')
        })

        it('decomposes outline shorthand into outline-color in delta rules', () => {
            const css = `
                @anchor .container {
                    outline: 2px solid var(--_outline-color);
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('outline: 2px solid var(--_enabled-outline-color);')

            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('outline-color: var(--_hovered-outline-color);')
        })

        it('decomposes background shorthand into background-color in delta rules', () => {
            const css = `
                @anchor .container {
                    background: var(--_container-color);
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background-color: var(--_hovered-container-color);')
        })
    })

    describe('Wrapper At-Rules & Keyframes Isolation', () => {
        const Schema = defineSchema(['enabled', 'hovered'] as const)
        const Def = createStyleDefinition(Schema)({
            'container-color': ['#6750a4', '#7f67be']
        })

        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': selfTrigger(':hover')
        })

        it('preserves wrapper at-rules like @layer, @media, @supports, @container, @starting-style', () => {
            const css = `
                @layer components {
                    @media (min-width: 600px) {
                        @anchor .container {
                            background-color: var(--_container-color);
                        }
                    }
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('@layer components {')
            expect(compiled).toContain('@media (min-width: 600px) {')
            expect(compiled).toContain('.container {')
            expect(compiled).toContain('background-color: var(--_enabled-container-color);')
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('background-color: var(--_hovered-container-color);')
        })

        it('preserves @keyframes without proliferating state delta rules', () => {
            const css = `
                @keyframes pulse {
                    0% {
                        background-color: var(--_container-color);
                    }
                    100% {
                        opacity: 0;
                    }
                }
            `
            const compiled = compileStateSheet(Def, css, { registry: triggers })

            expect(compiled).toContain('@keyframes pulse {')
            expect(compiled).toContain('background-color: var(--_enabled-container-color);')
            expect(compiled).not.toContain('@keyframes pulse:hover')
            expect(compiled).not.toContain('var(--_hovered-container-color)')
        })
    })

    describe('End-to-End Scenarios from TASK.md', () => {
        it('Scenario 1: Button Component with 5 states, variant, slot, and elevation', () => {
            const ButtonSchema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)
            const ButtonDef = createStyleDefinition(ButtonSchema)({
                'container-shape': '20px',
                'container-height': '40px',
                'container-color': ['#6750a4', '#7f67be', '#4f378b', '#6750a4', '#e0e0e0'],
                'label-color': ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9e9e9e']
            })

            const triggers = mapStateTriggers({
                'enabled': '',
                'hovered': selfTrigger(':hover'),
                'pressed': selfTrigger(':active'),
                'focused': selfTrigger(':focus-visible'),
                'disabled': hostTrigger('[disabled]')
            })

            const css = `
                @anchor .container {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: var(--_container-height);
                    border-radius: var(--_container-shape);
                    background-color: var(--_container-color);

                    .label {
                        color: var(--_label-color);
                        font-family: Roboto, sans-serif;
                    }

                    @slot(leading) {
                        margin-inline-end: 8px;
                    }

                    @variant(outlined) {
                        background-color: transparent;
                        border: 1px solid var(--_label-color);
                    }

                    @elevation(1)
                }
            `
            const compiled = compileStateSheet(ButtonDef, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('background-color: var(--_enabled-container-color);')
            expect(compiled).toContain('.container .label {')
            expect(compiled).toContain(':host(:has([slot="leading"])) .container {')
            expect(compiled).toContain(':host([variant="outlined"]) .container {')
            expect(compiled).toContain('.container:hover {')
            expect(compiled).toContain('.container:active {')
            expect(compiled).toContain(':host([disabled]) .container {')
            expect(compiled).toContain('box-shadow: none;')
        })

        it('Scenario 2: Checkbox Component with Boolean States', () => {
            const CheckboxSchema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)
            const CheckboxDef = createStyleDefinition(CheckboxSchema)({
                'container-size': '18px',
                'container-shape': '2px',
                'container-color': ['transparent', '#6750a4', '#6750a4'],
                'outline-color': ['#79747e', 'transparent', 'transparent'],
                'icon-color': ['transparent', '#ffffff', '#ffffff']
            })

            const triggers = mapStateTriggers({
                'enabled': '',
                'checked': hostTrigger('[checked]'),
                'indeterminate': hostTrigger('[indeterminate]')
            })

            const css = `
                @anchor .container {
                    width: var(--_container-size);
                    height: var(--_container-size);
                    border-radius: var(--_container-shape);
                    background-color: var(--_container-color);
                    border: 2px solid var(--_outline-color);

                    .mark {
                        fill: var(--_icon-color);
                    }
                }
            `
            const compiled = compileStateSheet(CheckboxDef, css, { registry: triggers })

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border: 2px solid var(--_enabled-outline-color);')
            expect(compiled).toContain(':host([checked]) .container {')
            expect(compiled).toContain('background-color: var(--_checked-container-color);')
            expect(compiled).toContain('border-color: var(--_checked-outline-color);')
            expect(compiled).toContain(':host([indeterminate]) .container {')
            expect(compiled).toContain('background-color: var(--_indeterminate-container-color);')
            expect(compiled).toContain('border-color: var(--_indeterminate-outline-color);')
        })

        it('Scenario 3: Badge Component with Size Schema & @size Sugar', () => {
            const BadgeSchema = defineSchema(['small', 'large'] as const)
            const BadgeDef = createStyleDefinition(BadgeSchema)({
                'container-color': '#b3261e',
                'label-color': '#ffffff',
                'container-size': ['6px', '16px'],
                'container-shape': ['3px', '8px']
            })

            const css = `
                @anchor .container {
                    background-color: var(--_container-color);
                    color: var(--_label-color);
                    border-radius: var(--_container-shape);
                    width: var(--_container-size);
                    height: var(--_container-size);

                    @size(large) {
                        padding-inline: 4px;
                    }
                }
            `
            const compiled = compileStateSheet(BadgeDef, css)

            expect(compiled).toContain('.container {')
            expect(compiled).toContain('border-radius: var(--_small-container-shape);')
            expect(compiled).toContain('width: var(--_small-container-size);')
            expect(compiled).toContain(':host([size="large"]) .container {')
            expect(compiled).toContain('border-radius: var(--_large-container-shape);')
            expect(compiled).toContain('width: var(--_large-container-size);')
            expect(compiled).toContain('padding-inline: 4px;')
        })
    })

    describe('Edge Cases & Error Handling', () => {
        it('returns empty string on empty CSS text', () => {
            expect(compileStateSheet({}, '')).toBe('')
            expect(compileStateSheet({}, '   ')).toBe('')
        })

        it('handles unmapped custom state with automatic heuristic fallback', () => {
            const Schema = defineSchema(['enabled', 'loading'] as const)
            const Def = createStyleDefinition(Schema)({
                'color': ['#000', '#fff']
            })
            const css = `
                @anchor .container {
                    color: var(--_color);
                }
            `
            const compiled = compileStateSheet(Def, css)
            expect(compiled).toContain('.container.loading {')
            expect(compiled).toContain('color: var(--_loading-color);')
        })

        it('exports compileStateSheet identically from compile-state-sheet module mirror', async () => {
            const mirror = await import('./compile-state-sheet')
            expect(mirror.compileStateSheet).toBe(compileStateSheet)
        })
    })
})

