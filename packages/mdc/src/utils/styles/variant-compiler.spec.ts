/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest'
import { compileStateSheet, matchVariants, appendToHostSelector, type StyleDiagnosticWarning } from './state-sheet-compiler'
import { createStyleSheet } from './create-style-sheet'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { mapStateTriggers } from './map-state-triggers'
import { selfTrigger } from './self-trigger'
import { hostTrigger } from './host-trigger'

const Schema = defineSchema(['enabled', 'hovered', 'disabled'] as const)

const BarVerticalDef = createStyleDefinition(Schema)({
    'container-width': '104px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'vertical-only-token': ['#aaa', '#bbb', '#ccc']
})

const BarHorizontalDef = createStyleDefinition(Schema)({
    'container-width': '92px',
    'container-height': '64px',
    'common-color': ['#111', '#222', '#333'],
    'horizontal-only-token': ['#ddd', '#eee', '#fff']
})

const RailVerticalDef = createStyleDefinition(Schema)({
    'container-width': '80px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'vertical-only-token': ['#aaa', '#bbb', '#ccc']
})

const DrawerDef = createStyleDefinition(Schema)({
    'container-width': '336px',
    'container-height': '56px',
    'common-color': ['#111', '#222', '#333'],
    'drawer-only-token': ['#123', '#456', '#789']
})

const MultiVariants = {
    'bar-vertical': BarVerticalDef,
    'bar-horizontal': BarHorizontalDef,
    'rail-vertical': RailVerticalDef,
    'drawer': DrawerDef
} as const

describe('matchVariants helper', () => {
    const allVariants = ['bar-vertical', 'bar-horizontal', 'rail-vertical', 'rail-horizontal', 'drawer', 'drawer-horizontal']

    it('matches exact variant names', () => {
        expect(matchVariants(['bar-vertical', 'drawer'], allVariants)).toEqual(['bar-vertical', 'drawer'])
    })

    it('matches wildcard patterns (*-vertical)', () => {
        expect(matchVariants(['*-vertical'], allVariants)).toEqual(['bar-vertical', 'rail-vertical'])
    })

    it('matches multiple wildcard patterns', () => {
        expect(matchVariants(['bar-*', 'rail-*'], allVariants)).toEqual([
            'bar-vertical',
            'bar-horizontal',
            'rail-vertical',
            'rail-horizontal'
        ])
    })

    it('matches negation patterns (!drawer*)', () => {
        expect(matchVariants(['!drawer*'], allVariants)).toEqual([
            'bar-vertical',
            'bar-horizontal',
            'rail-vertical',
            'rail-horizontal'
        ])
    })

    it('combines positive patterns and negation patterns', () => {
        expect(matchVariants(['bar-*', '!*-horizontal'], allVariants)).toEqual(['bar-vertical'])
    })
})

describe('Multi-Variant @variant Compiler', () => {
    it('compiles single and comma-separated @variant rules with default selector', () => {
        const css = `
            @variant(bar-vertical, rail-vertical) {
                .container {
                    width: 100%;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .container, :host([variant="rail-vertical"]) .container {')
        expect(compiled).toContain('width: 100%;')
    })

    it('supports wildcard pattern matching (*-vertical)', () => {
        const css = `
            @variant(*-vertical) {
                .indicator {
                    display: block;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .indicator, :host([variant="rail-vertical"]) .indicator {')
    })

    it('supports negation pattern matching (!drawer)', () => {
        const css = `
            @variant(!drawer) {
                .indicator {
                    border-radius: 8px;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .indicator, :host([variant="bar-horizontal"]) .indicator, :host([variant="rail-vertical"]) .indicator {')
        expect(compiled).not.toContain('variant="drawer"')
    })

    it('supports custom variantSelector option in compileStateSheet', () => {
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const css = `
            @variant(bar-vertical) {
                .container { height: 56px; }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css, { variantSelector: customSelector })
        expect(compiled).toContain(':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container {')
    })

    it('supports custom variantSelector in createStyleSheet HOF', () => {
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const sheet = createStyleSheet({
            variantSelector: customSelector
        })(MultiVariants)`
            @variant(drawer) {
                .container { max-width: 336px; }
            }
        `
        expect(sheet.cssText).toContain(':where(:host([variant="drawer"]), :host(:has(.drawer))) .container {')
    })

    it('correctly composes state triggers with @variant rules', () => {
        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': selfTrigger(':hover'),
            'disabled': hostTrigger('[disabled]')
        })

        const css = `
            @variant(bar-vertical) {
                @anchor .container {
                    background-color: var(--_common-color);
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css, { registry: triggers })
        expect(compiled).toContain(':host([variant="bar-vertical"]) .container {\n    background-color: var(--_enabled-common-color);\n}')
        expect(compiled).toContain(':host([variant="bar-vertical"]) .container:hover {\n    background-color: var(--_hovered-common-color);\n}')
        expect(compiled).toContain(':host([variant="bar-vertical"][disabled]) .container {\n    background-color: var(--_disabled-common-color);\n}')
    })

    it('supports bidirectional nesting: @variant inside @anchor and @anchor inside @variant', () => {
        const css = `
            @anchor .container {
                @variant(bar-vertical) {
                    padding: 8px;
                }
            }

            @variant(drawer) {
                @anchor .label {
                    font-size: 14px;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .container {\n    padding: 8px;\n}')
        expect(compiled).toContain(':host([variant="drawer"]) .label {\n    font-size: 14px;\n}')
    })

    it('supports nested @variant blocks', () => {
        const css = `
            @variant(*-vertical) {
                @variant(!bar-*) {
                    .indicator { width: 56px; }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="rail-vertical"]) .indicator {\n    width: 56px;\n}')
        expect(compiled).not.toContain('variant="bar-vertical"')
    })

    it('synthesizes complex custom variantSelector with @when and state triggers', () => {
        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': selfTrigger(':hover'),
            'disabled': hostTrigger('[disabled]')
        })
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const css = `
            @variant(bar-vertical) {
                @anchor .container {
                    background-color: var(--_common-color);
                    @when(:host([checked])) {
                        border-color: #f00;
                    }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css, {
            registry: triggers,
            variantSelector: customSelector
        })
        expect(compiled).toContain(':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container {\n    background-color: var(--_enabled-common-color);\n}')
        expect(compiled).toContain(':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) .container:hover {\n    background-color: var(--_hovered-common-color);\n}')
        expect(compiled).toContain(':where(:host([variant="bar-vertical"][disabled]), :host(:has(.bar-vertical)[disabled])) .container {\n    background-color: var(--_disabled-common-color);\n}')
        expect(compiled).toContain(':where(:host([variant="bar-vertical"][checked]), :host(:has(.bar-vertical)[checked])) .container {\n    border-color: #f00;\n}')
    })

    it('supports @variant nested with @slot and @slotted', () => {
        const css = `
            @variant(bar-vertical) {
                @slot(icon) {
                    .slot-container { display: flex; }
                }
                @slotted(icon) {
                    color: red;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]:has([slot="icon"])) .slot-container {')
        expect(compiled).toContain('::slotted([slot="icon"]) {')
    })

    it('correctly preserves outer host modifiers in deeply nested @when, @size, and @variant blocks', () => {
        const css = `
            @when(:host([checked])) {
                @size(large) {
                    @variant(*-vertical) {
                        @variant(!bar-*) {
                            .indicator { width: 56px; }
                        }
                    }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="rail-vertical"][checked][size="large"]) .indicator {\n    width: 56px;\n}')
        expect(compiled).not.toContain('variant="bar-vertical"')
    })

    it('correctly handles :host and :host(...) selector headers inside @variant blocks', () => {
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const css = `
            @variant(bar-vertical) {
                :host {
                    width: 104px;
                }
                :host([checked]) {
                    opacity: 1;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css, { variantSelector: customSelector })
        expect(compiled).toContain(':where(:host([variant="bar-vertical"]), :host(:has(.bar-vertical))) {\n    width: 104px;\n}')
        expect(compiled).toContain(':where(:host([variant="bar-vertical"][checked]), :host(:has(.bar-vertical)[checked])) {\n    opacity: 1;\n}')
    })

    it('correctly handles unparenthesized :host:hover and :host[disabled] inside @variant blocks', () => {
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const css = `
            @variant(bar-vertical) {
                :host:hover {
                    opacity: 0.8;
                }
                :host[disabled] {
                    cursor: not-allowed;
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css, { variantSelector: customSelector })
        expect(compiled).toContain(':where(:host([variant="bar-vertical"]:hover), :host(:has(.bar-vertical):hover)) {\n    opacity: 0.8;\n}')
        expect(compiled).toContain(':where(:host([variant="bar-vertical"][disabled]), :host(:has(.bar-vertical)[disabled])) {\n    cursor: not-allowed;\n}')
        expect(compiled).not.toContain(':host:host')
    })

    it('prunes dead rules when nested @variant filters result in an empty match set', () => {
        const css = `
            @variant(*-vertical) {
                @variant(drawer) {
                    .indicator { width: 999px; }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).not.toContain('999px')
        expect(compiled).not.toContain('drawer')
    })
})

describe('appendToHostSelector unit tests', () => {
    it('appends attributes, classes, and pseudo-classes to :host', () => {
        expect(appendToHostSelector(':host', '[disabled]')).toBe(':host([disabled])')
        expect(appendToHostSelector(':host', ':hover')).toBe(':host(:hover)')
        expect(appendToHostSelector(':host', '.active')).toBe(':host(.active)')
        expect(appendToHostSelector(':host', ':host([disabled])')).toBe(':host([disabled])')
        expect(appendToHostSelector(':host', ':host[disabled]')).toBe(':host([disabled])')
        expect(appendToHostSelector(':host', ':host:hover')).toBe(':host:hover')
        expect(appendToHostSelector(':host', ':host.active')).toBe(':host(.active)')
    })

    it('preserves :where and :is host wrapper selectors', () => {
        expect(appendToHostSelector(':host', ':where(:host([a]), :host([b]))')).toBe(':where(:host([a]), :host([b]))')
        expect(appendToHostSelector(':where(:host([a]), :host([b]))', ':host:hover')).toBe(':where(:host([a]:hover), :host([b]:hover))')
        expect(appendToHostSelector(':where(:host([a]), :host([b]))', ':host[disabled]')).toBe(':where(:host([a][disabled]), :host([b][disabled]))')
    })

    it('appends cleanly to :host(...) without generating :host(:host(...))', () => {
        expect(appendToHostSelector(':host([variant="bar"])', ':host[disabled]')).toBe(':host([variant="bar"][disabled])')
        expect(appendToHostSelector(':host([variant="bar"])', ':host:hover')).toBe(':host([variant="bar"]:hover)')
        expect(appendToHostSelector(':host([variant="bar"])', ':host.foo')).toBe(':host([variant="bar"].foo)')
        expect(appendToHostSelector(':host([variant="bar"])', ':host([checked])')).toBe(':host([variant="bar"][checked])')
        expect(appendToHostSelector(':host([variant="bar"])', '[checked]')).toBe(':host([variant="bar"][checked])')
    })

    it('handles pseudo-state base :host:hover', () => {
        expect(appendToHostSelector(':host:hover', '[disabled]')).toBe(':host([disabled]):hover')
        expect(appendToHostSelector(':host:hover', ':host[disabled]')).toBe(':host([disabled]):hover')
    })
})

describe('AST Diagnostic Warnings for Token Scopes', () => {
    it('warns when top-level shared scope references a token missing from some variants', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            .container {
                color: var(--_vertical-only-token);
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })

        expect(warnings.length).toBeGreaterThan(0)
        const warn = warnings.find((w) => w.type === 'missing-token-in-shared-scope' && w.token === 'vertical-only-token')
        expect(warn).toBeDefined()
        expect(warn?.variants).toContain('bar-vertical')
        expect(warn?.variants).toContain('rail-vertical')
        expect(warn?.missingVariants).toContain('bar-horizontal')
        expect(warn?.missingVariants).toContain('drawer')
    })

    it('warns when @variant scope references a token missing from that variant', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            @variant(bar-horizontal) {
                .container {
                    color: var(--_vertical-only-token);
                }
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })

        expect(warnings.length).toBeGreaterThan(0)
        const warn = warnings.find((w) => w.type === 'missing-token-in-variant-scope' && w.token === 'vertical-only-token')
        expect(warn).toBeDefined()
        expect(warn?.variant).toBe('bar-horizontal')
    })

    it('warns when unknown variant name is specified in @variant', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            @variant(nonexistent-variant) {
                .container { color: red; }
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })

        expect(warnings.length).toBeGreaterThan(0)
        const warn = warnings.find((w) => w.type === 'unknown-variant' && w.variant === 'nonexistent-variant')
        expect(warn).toBeDefined()
        expect(warn?.variants).toEqual(['bar-vertical', 'bar-horizontal', 'rail-vertical', 'drawer'])
    })

    it('does not warn when token is present across all variants or in target variant', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            .container {
                background: var(--_common-color);
            }
            @variant(bar-vertical) {
                .icon {
                    color: var(--_vertical-only-token);
                }
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })
        expect(warnings).toEqual([])
    })

    it('does not falsely warn when token is referenced with an explicit state prefix', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            .container {
                background: var(--_enabled-common-color);
            }
            @variant(bar-vertical) {
                .icon {
                    color: var(--_enabled-vertical-only-token);
                }
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })
        expect(warnings).toEqual([])
    })

    it('calls console.warn when onWarn is not provided and warning is emitted', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const css = `
            .container {
                color: var(--_vertical-only-token);
            }
        `
        compileStateSheet(MultiVariants, css)
        expect(spy).toHaveBeenCalled()
        expect(spy.mock.calls[0][0]).toContain('[MDC Style Warning]')
        spy.mockRestore()
    })

    it('warns for multiple unknown variants in a single @variant declaration', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            @variant(unknown-1, unknown-2) {
                .container { color: blue; }
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })
        expect(warnings.length).toBe(2)
        expect(warnings[0].variant).toBe('unknown-1')
        expect(warnings[1].variant).toBe('unknown-2')
    })

    it('correctly checks diagnostics when multiple tokens exist in a single declaration value', () => {
        const warnings: StyleDiagnosticWarning[] = []
        const onWarn = (w: StyleDiagnosticWarning) => warnings.push(w)

        const css = `
            .container {
                box-shadow: 0 0 4px var(--_vertical-only-token), 0 0 8px var(--_drawer-only-token);
            }
        `
        compileStateSheet(MultiVariants, css, { onWarn })
        expect(warnings.length).toBe(2)
        const tokens = warnings.map((w) => w.token)
        expect(tokens).toContain('vertical-only-token')
        expect(tokens).toContain('drawer-only-token')
    })
})

describe('Advanced Edge Cases & At-Rule Compositions', () => {
    it('supports multiple negative patterns in @variant', () => {
        const css = `
            @variant(!drawer, !*-horizontal) {
                .indicator { height: 32px; }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .indicator, :host([variant="rail-vertical"]) .indicator {')
        expect(compiled).not.toContain('variant="drawer"')
        expect(compiled).not.toContain('variant="bar-horizontal"')
    })

    it('supports positive wildcard combined with specific negative patterns', () => {
        const css = `
            @variant(bar-*, !bar-horizontal) {
                .container { display: grid; }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .container {\n    display: grid;\n}')
        expect(compiled).not.toContain('variant="bar-horizontal"')
    })

    it('handles extra whitespace and trailing commas in @variant parameter', () => {
        const css = `
            @variant(  bar-vertical ,  drawer  , ) {
                .badge { display: flex; }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain(':host([variant="bar-vertical"]) .badge, :host([variant="drawer"]) .badge {')
    })

    it('supports @variant nested inside @layer and @media wrapper at-rules', () => {
        const css = `
            @layer components {
                @variant(bar-vertical) {
                    .container { width: 104px; }
                }
            }
            @media (min-width: 600px) {
                @variant(drawer) {
                    .container { max-width: 400px; }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain('@layer components {\n:host([variant="bar-vertical"]) .container {\n    width: 104px;\n}\n}')
        expect(compiled).toContain('@media (min-width: 600px) {\n:host([variant="drawer"]) .container {\n    max-width: 400px;\n}\n}')
    })

    it('supports @variant nested inside @starting-style', () => {
        const css = `
            @starting-style {
                @variant(drawer) {
                    .indicator { opacity: 0; }
                }
            }
        `
        const compiled = compileStateSheet(MultiVariants, css)
        expect(compiled).toContain('@starting-style {\n:host([variant="drawer"]) .indicator {\n    opacity: 0;\n}\n}')
    })
})

