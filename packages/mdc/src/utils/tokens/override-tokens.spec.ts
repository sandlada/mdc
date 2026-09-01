/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { overrideTokens } from './override-tokens'
import { pipe } from './pipe'
import { createStyleDefinition } from './create-style-definition'

describe('overrideTokens (Comprehensive Spec)', () => {
    const sampleDefinition = createStyleDefinition({
        'container-height': '40px',
        'container-color': '#6750a4',
        'hover:container-color': '#7965b2',
        'active:container-color': '#533c8f',
        'disabled:container-color': '#1c1b1f',
        'shape-start-start': '4px',
        'shape-start-end': '4px',
    })

    it('supports curried data-last invocation: overrideTokens(prefix)(tokens)(definition)', () => {
        const createOverride = overrideTokens('--mdc-button')({
            'shape-start-start': '8px',
        })

        const result = createOverride(sampleDefinition)
        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toBe('--mdc-button-shape-start-start: 8px;')
    })

    it('supports pipe composition: pipe(definition, overrideTokens(prefix)(tokens))', () => {
        const result = pipe(
            sampleDefinition,
            overrideTokens('--mdc-button')({
                'container-color': 'red',
                'hover:container-color': 'darkred',
            })
        )

        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toContain('--mdc-button-container-color: red;')
        expect(result.cssText).toContain('--mdc-button-hover:container-color: darkred;')
    })

    it('supports 2-arg curried invocation: overrideTokens(prefix, tokens)(definition)', () => {
        const applyOverride = overrideTokens('--mdc-button', {
            'container-height': '48px',
        })

        const result = applyOverride(sampleDefinition)
        expect(result.cssText).toBe('--mdc-button-container-height: 48px;')
    })

    it('supports uncurried direct invocation: overrideTokens(definition, prefix, tokens)', () => {
        const result = overrideTokens(sampleDefinition, '--mdc-button', {
            'shape-start-end': '12px',
        })

        expect(result.cssText).toBe('--mdc-button-shape-start-end: 12px;')
    })

    it('supports state object overrides: { hover: "#...", active: "#..." }', () => {
        const result = overrideTokens(sampleDefinition, '--mdc-button', {
            'container-color': {
                '': '#112233',
                'hover': '#223344',
                'active': '#334455',
            },
        })

        expect(result.cssText).toContain('--mdc-button-container-color: #112233;')
        expect(result.cssText).toContain('--mdc-button-hover:container-color: #223344;')
        expect(result.cssText).toContain('--mdc-button-active:container-color: #334455;')
    })

    it('supports 5-state tuple overrides [enabled, hovered, pressed, focused, disabled]', () => {
        const result = overrideTokens(sampleDefinition, '--mdc-button', {
            'container-color': ['#e', '#h', '#p', null, '#d'],
        })

        expect(result.cssText).toContain('--mdc-button-enabled-container-color: #e;')
        expect(result.cssText).toContain('--mdc-button-hovered-container-color: #h;')
        expect(result.cssText).toContain('--mdc-button-pressed-container-color: #p;')
        expect(result.cssText).not.toContain('focused-container-color')
        expect(result.cssText).toContain('--mdc-button-disabled-container-color: #d;')
    })

    it('supports selector wrapping option', () => {
        const result = overrideTokens(sampleDefinition, {
            prefix: '--mdc-button',
            selector: ':host([variant="outlined"])',
        }, {
            'container-height': '36px',
        })

        expect(result.cssText).toBe(':host([variant="outlined"]) { --mdc-button-container-height: 36px; }')
    })

    it('filters out null and undefined values', () => {
        const result = overrideTokens(sampleDefinition, '--mdc-button', {
            'shape-start-start': '10px',
            'container-height': null,
            'container-color': undefined,
        })

        expect(result.cssText).toBe('--mdc-button-shape-start-start: 10px;')
    })
})
