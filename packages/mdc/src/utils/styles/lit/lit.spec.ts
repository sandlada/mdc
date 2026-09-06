/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Contract for the Lit-bound twins: real `CSSResult` returns, `cssText`
 * parity with the framework-agnostic core, and the zero-wrapper DX proof.
 */

import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { stringifyTokens as coreStringifyTokens } from '../stringify-tokens'
import { overrideTokens as coreOverrideTokens } from '../override-tokens'
import { defineVariantTokens as coreDefineVariantTokens } from '../define-variant-tokens'
import { createStyleSheet as coreCreateStyleSheet } from '../compiler/create-style-sheet'
import { mapStateTriggers } from '../map-state-triggers'
import { pipe } from '../pipe'
import { stringifyTokens } from './stringify-tokens'
import { overrideTokens } from './override-tokens'
import { defineVariantTokens } from './define-variant-tokens'
import { createStyleSheet } from './create-style-sheet'

const ButtonSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
const ButtonDefinition = createStyleDefinition(ButtonSchema)({
    'container-color': ['#6750a4', '#7f67be', '#e0e0e0'],
    'container-shape': '8px'
})

const triggers = mapStateTriggers({
    'enabled': '',
    'hovered': ':hover',
    'disabled': '[disabled]'
})

describe('lit-bound twins', () => {
    it('stringifyTokens returns a real CSSResult with core-identical cssText', () => {
        const litResult = stringifyTokens('--mdc-button')(ButtonDefinition)
        const coreResult = coreStringifyTokens('--mdc-button')(ButtonDefinition)
        expect(litResult).toBeInstanceOf(CSSResult)
        expect(litResult.cssText).toBe(coreResult.cssText)
    })

    it('overrideTokens returns a real CSSResult with core-identical cssText', () => {
        const tokens = { 'container-color': '#b3261e' }
        const litResult = overrideTokens('--mdc-button')(tokens)()
        const coreResult = coreOverrideTokens('--mdc-button')(tokens)()
        expect(litResult).toBeInstanceOf(CSSResult)
        expect(litResult.cssText).toBe(coreResult.cssText)
    })

    it('defineVariantTokens returns a real CSSResult with core-identical cssText', () => {
        const variants = { 'filled': ButtonDefinition } as const
        const litResult = defineVariantTokens('--mdc-button')(variants)
        const coreResult = coreDefineVariantTokens('--mdc-button')(variants)
        expect(litResult).toBeInstanceOf(CSSResult)
        expect(litResult.cssText).toBe(coreResult.cssText)
    })

    it('createStyleSheet covers all invocation forms with real CSSResults', () => {
        const template = `
            @anchor .container {
                background-color: var(--_container-color);
            }
        `
        const forms: ReadonlyArray<[string, CSSResult]> = [
            ['tagged', createStyleSheet(ButtonDefinition)`
                @anchor .container {
                    background-color: var(--_container-color);
                }
            `],
            ['curried', createStyleSheet(ButtonDefinition)(template)],
            ['options-first', createStyleSheet(triggers)(ButtonDefinition)(template)],
            ['uncurried-callback', createStyleSheet(ButtonDefinition, () => css`
                @anchor .container {
                    background-color: var(--_container-color);
                }
            `)],
            ['pipe', pipe(triggers, createStyleSheet)(ButtonDefinition)(template)]
        ]
        for (const [label, result] of forms) {
            expect(result, label).toBeInstanceOf(CSSResult)
            expect(result.cssText, label).toBe(coreCreateStyleSheet(ButtonDefinition)(template).cssText)
        }
    })

    it('DX proof: results interpolate in css and sit in styles arrays with zero wrappers', () => {
        const tokens = stringifyTokens('--mdc-button')(ButtonDefinition)
        const stylePart = createStyleSheet(ButtonDefinition)(() => css`
            .container {
                background-color: var(--_container-color);
            }
        `)
        const host = css`
            :host {
                ${tokens};
            }
        `
        expect(host).toBeInstanceOf(CSSResult)
        expect(host.cssText).toContain('--_container-shape: var(--mdc-button-container-shape, 8px);')
        const styles: CSSResult[] = [host, stylePart]
        expect(styles[1].cssText).toContain('background-color: var(--_enabled-container-color);')
    })
})
