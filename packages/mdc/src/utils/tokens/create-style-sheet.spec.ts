/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, unsafeCSS, CSSResult } from 'lit'
import { createStyleSheet } from './create-style-sheet'
import { withStateTriggers } from './with-state-triggers'
import { hostTrigger, selfTrigger } from './state-trigger'
import { pipe } from './pipe'
import { createStyleDefinition } from './create-style-definition'

describe('createStyleSheet', () => {
    const dummyDefinition = createStyleDefinition({
        'container-height': '36px',
        'container-color': '#112233',
        'hover:container-color': '#223344',
        'active:container-color': '#334455',
        'disabled:container-color': '#555555',
        'label-color': '#ffffff',
        'disabled:label-color': '#888888',
    })

    it('returns a valid Lit CSSResult instance with uncurried invocation', () => {
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
        expect(cssText).toContain('background-color: var(--_container-color);')
        expect(cssText).toContain(':host(:hover) {')
        expect(cssText).toContain('background-color: var(--_hover:container-color);')
    })

    it('supports curried definition-first: createStyleSheet(definition)(template)', () => {
        const compile = createStyleSheet(dummyDefinition)
        const style = compile(() => css`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `)

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain('.container {')
        expect(style.cssText).toContain('background-color: var(--_container-color);')
        expect(style.cssText).toContain('.container:hover {')
        expect(style.cssText).toContain('background-color: var(--_hover:container-color);')
    })

    it('supports curried 3-step with options: createStyleSheet(options)(definition)(template)', () => {
        const customCompiler = createStyleSheet(withStateTriggers([
            hostTrigger('[checked]', 'checked'),
        ])())

        const style = customCompiler(createStyleDefinition({
            'container-color': '#111',
            'checked:container-color': '#222',
            'checked:hover:container-color': '#333',
        }))(() => css`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `)

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain('.container {')
        expect(style.cssText).toContain(':host([checked]) .container {')
        expect(style.cssText).toContain(':host([checked]) .container:hover {')
    })

    it('supports tagged template literal: createStyleSheet(definition)`...`', () => {
        const style = createStyleSheet(dummyDefinition)`
            :host {
                color: var(--_label-color);
            }
        `

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain(':host {')
        expect(style.cssText).toContain('color: var(--_label-color);')
        expect(style.cssText).toContain(':host([disabled]) {')
        expect(style.cssText).toContain('color: var(--_disabled:label-color);')
    })

    it('supports tagged template literal with options: createStyleSheet(options)(definition)`...`', () => {
        const style = createStyleSheet({
            triggers: [selfTrigger('.dragged', 'dragged')],
        })(createStyleDefinition({
            'opacity': '1',
            'dragged:opacity': '0.5',
        }))`
            @anchor .container {
                opacity: var(--_opacity);
            }
        `

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain('.container {')
        expect(style.cssText).toContain('opacity: var(--_opacity);')
        expect(style.cssText).toContain('.container.dragged {')
        expect(style.cssText).toContain('opacity: var(--_dragged:opacity);')
    })

    it('supports pipe composition: pipe(definition, createStyleSheet)', () => {
        const compile = pipe(dummyDefinition, createStyleSheet)
        const style = compile(() => css`
            :host {
                color: var(--_label-color);
            }
        `)

        expect(style).toBeInstanceOf(CSSResult)
        expect(style.cssText).toContain(':host {')
        expect(style.cssText).toContain('color: var(--_label-color);')
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
        expect(cssText).toContain('color: var(--_label-color);')
    })

    it('supports pipe(withStateTriggers(...), createStyleSheet()) and pipe(withStateTriggers(...), createStyleSheet)', () => {
        const createCustomSheet1 = pipe(
            withStateTriggers({
                'small': '.small',
                'large': '.large',
            }),
            createStyleSheet()
        )

        const style1 = createCustomSheet1(createStyleDefinition({
            'container-color': '#fff',
            'small:container-color': '#aaa',
            'large:container-color': '#bbb',
        }))(() => css`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `)

        expect(style1).toBeInstanceOf(CSSResult)
        expect(style1.cssText).toContain('.container {')
        expect(style1.cssText).toContain('.container.small {')
        expect(style1.cssText).toContain('.container.large {')

        // Also with function reference
        const createCustomSheet2 = pipe(
            withStateTriggers({
                'small': '.small',
                'large': '.large',
            }),
            createStyleSheet
        )
        const style2 = createCustomSheet2(dummyDefinition)(() => css`
            @anchor .container {
                color: var(--_label-color);
            }
        `)
        expect(style2).toBeInstanceOf(CSSResult)
    })
})

