/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { mapStateTriggers } from './map-state-triggers'
import { pipe } from './pipe'
import { createStyleSheet } from './create-style-sheet'

describe('createStyleSheet', () => {
    const ButtonSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
    const ButtonDefinition = createStyleDefinition(ButtonSchema)({
        'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
        'label-color': ['#ffffff', '#ffffff', '#9e9e9e'],
        'container-shape': '8px'
    })

    const triggers = mapStateTriggers({
        'enabled': '',
        'hovered': ':hover',
        'disabled': '[disabled]'
    })

    it('compiles via tagged template literal: createStyleSheet(def)`...`', () => {
        const styles = createStyleSheet(ButtonDefinition)`
            @anchor .container {
                border-radius: var(--_container-shape);
                background-color: var(--_container-color);
                .label {
                    color: var(--_label-color);
                }
            }
        `

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('.container {')
        expect(styles.cssText).toContain('border-radius: var(--_container-shape);')
        expect(styles.cssText).toContain('background-color: var(--_enabled-container-color);')
        expect(styles.cssText).toContain('.container:hover {')
        expect(styles.cssText).toContain('background-color: var(--_hovered-container-color);')
    })

    it('interpolates strings, numbers, Color objects with ToCSSVariable, and nested CSSResults', () => {
        const height = '48px'
        const zIndex = 10
        const colorObj = { ToCSSVariable: () => 'var(--mdc-color-primary)' }
        const embeddedRule = css`margin: 0;`
        const multiValues = [css`padding: 4px;`, 'display: inline-flex;']

        const styles = createStyleSheet(ButtonDefinition)`
            @anchor .container {
                height: ${height};
                z-index: ${zIndex};
                border-color: ${colorObj};
                ${embeddedRule}
                ${multiValues}
            }
        `

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('height: 48px;')
        expect(styles.cssText).toContain('z-index: 10;')
        expect(styles.cssText).toContain('border-color: var(--mdc-color-primary);')
        expect(styles.cssText).toContain('margin: 0;')
        expect(styles.cssText).toContain('padding: 4px;')
        expect(styles.cssText).toContain('display: inline-flex;')
    })

    it('supports curried definition-first invocation: createStyleSheet(def)(template)', () => {
        const compile = createStyleSheet(ButtonDefinition)
        const styles = compile`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('.container {')
        expect(styles.cssText).toContain('background-color: var(--_enabled-container-color);')
    })

    it('supports options/registry-first invocation: createStyleSheet(triggers)(def)`...`', () => {
        const compile = createStyleSheet(triggers)
        const styles = compile(ButtonDefinition)`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('.container:hover {')
        expect(styles.cssText).toContain('background-color: var(--_hovered-container-color);')
    })

    it('supports options object: createStyleSheet({ registry })', () => {
        const compile = createStyleSheet({ registry: triggers })
        const styles = compile(ButtonDefinition)`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('.container:hover {')
    })

    it('supports uncurried callback: createStyleSheet(def, () => css`...`)', () => {
        const styles = createStyleSheet(ButtonDefinition, () => css`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `)

        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toContain('.container {')
        expect(styles.cssText).toContain('background-color: var(--_enabled-container-color);')
    })

    it('supports point-free pipeline composition via pipe', () => {
        // 1. pipe(triggers, createStyleSheet)
        const compileWithTriggers = pipe(triggers, createStyleSheet)
        const styles1 = compileWithTriggers(ButtonDefinition)`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `
        expect(styles1).toBeInstanceOf(CSSResult)
        expect(styles1.cssText).toContain('.container:hover {')

        // 2. pipe(ButtonDefinition, createStyleSheet)
        const compileDef = pipe(ButtonDefinition, createStyleSheet)
        const styles2 = compileDef`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `
        expect(styles2).toBeInstanceOf(CSSResult)
        expect(styles2.cssText).toContain('.container {')

        // 3. 0-arg createStyleSheet in pipeline: pipe(createStyleSheet)
        const compileZero = pipe(createStyleSheet)
        const styles3 = compileZero(ButtonDefinition)`
            @anchor .container {
                background-color: var(--_container-color);
            }
        `
        expect(styles3).toBeInstanceOf(CSSResult)
    })

    it('returns empty CSSResult on empty template string', () => {
        const styles = createStyleSheet(ButtonDefinition)``
        expect(styles).toBeInstanceOf(CSSResult)
        expect(styles.cssText).toBe('')
    })
})
