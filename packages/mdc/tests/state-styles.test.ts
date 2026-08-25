/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
if (typeof globalThis.HTMLElement === 'undefined') {
    // @ts-ignore
    globalThis.HTMLElement = class {}
}
if (typeof globalThis.document === 'undefined') {
    // @ts-ignore
    globalThis.document = {
        createComment: () => ({}),
        createElement: () => ({}),
        createTreeWalker: () => ({ currentNode: null, nextNode: () => null }),
    }
}
if (typeof globalThis.customElements === 'undefined') {
    // @ts-ignore
    globalThis.customElements = {
        get: () => undefined,
        define: () => {},
    }
}

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
const { stateStyles } = await import('../build/utils/tokens/state-styles.js')

describe('stateStyles', () => {
    it('expands full 5-state token suffix with $state placeholder outside :host(...)', () => {
        const result = stateStyles({
            selector: ':host(:not([checked]))$state .label',
            disabled: ':has(.container.disabled)',
            properties: {
                color: 'unselected-label-color',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host(:not([checked])) .label {\n    color: var(--_enabled-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked])):hover .label {\n    color: var(--_hovered-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked])):active .label {\n    color: var(--_pressed-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked])):focus-within .label {\n    color: var(--_focused-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked])):has(.container.disabled) .label {\n    color: var(--_disabled-unselected-label-color);\n}'))
    })

    it('supports complex multi-token expressions with $state in property values', () => {
        const result = stateStyles({
            selector: ':host(:not([checked]))$state .container',
            properties: {
                'grid-template-rows': 'var(--_$state-indicator-height) min(var(--_$state-label-line-height), var(--_$state-label-size))',
                'gap': 'spacing-between-icon-and-label',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host(:not([checked])) .container {\n    grid-template-rows: var(--_enabled-indicator-height) min(var(--_enabled-label-line-height), var(--_enabled-label-size));\n    gap: var(--_enabled-spacing-between-icon-and-label);\n}'))
        assert.ok(css.includes(':host(:not([checked])):hover .container {\n    grid-template-rows: var(--_hovered-indicator-height) min(var(--_hovered-label-line-height), var(--_hovered-label-size));\n    gap: var(--_hovered-spacing-between-icon-and-label);\n}'))
        assert.ok(css.includes(':host(:not([checked]))[disabled] .container {\n    grid-template-rows: var(--_disabled-indicator-height) min(var(--_disabled-label-line-height), var(--_disabled-label-size));\n    gap: var(--_disabled-spacing-between-icon-and-label);\n}'))
    })

    it('supports property generator functions', () => {
        const result = stateStyles({
            selector: ':host$state .item',
            properties: {
                transform: (state) => state === 'pressed' ? 'scale(0.95)' : 'none',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host .item {\n    transform: none;\n}'))
        assert.ok(css.includes(':host:active .item {\n    transform: scale(0.95);\n}'))
    })

    it('supports completely overriding an individual state selector via `selectors`', () => {
        const result = stateStyles({
            selector: ':host(:not([checked]))$state .label',
            selectors: {
                disabled: ':host(:not([checked]):has(.container.disabled)) .label',
            },
            properties: {
                color: 'unselected-label-color',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host(:not([checked])) .label {\n    color: var(--_enabled-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked])):hover .label {\n    color: var(--_hovered-unselected-label-color);\n}'))
        assert.ok(css.includes(':host(:not([checked]):has(.container.disabled)) .label {\n    color: var(--_disabled-unselected-label-color);\n}'))
    })

    it('supports selector object with base and specific state overrides', () => {
        const result = stateStyles({
            selector: {
                base: ':host$state .icon',
                disabled: ':host(:has(.disabled-container)) .icon',
            },
            properties: {
                color: 'icon-color',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host .icon {\n    color: var(--_enabled-icon-color);\n}'))
        assert.ok(css.includes(':host:hover .icon {\n    color: var(--_hovered-icon-color);\n}'))
        assert.ok(css.includes(':host(:has(.disabled-container)) .icon {\n    color: var(--_disabled-icon-color);\n}'))
    })

    it('handles sparse tuples by only generating rules for non-null states', () => {
        const result = stateStyles({
            selector: ':host(:not([checked]))$state .label',
            disabled: ':has(.container.disabled)',
            properties: {
                color: ['unselected-label-color', null, null, null, 'unselected-label-color'],
                opacity: [null, null, null, null, '0.38'],
            },
        })

        const css = result.cssText

        // Only enabled and disabled should be produced
        assert.ok(css.includes(':host(:not([checked])) .label {\n    color: var(--_enabled-unselected-label-color);\n}'))
        assert.ok(!css.includes(':host(:not([checked])):hover'))
        assert.ok(!css.includes(':host(:not([checked])):active'))
        assert.ok(!css.includes(':host(:not([checked])):focus-within'))
        assert.ok(css.includes(':host(:not([checked])):has(.container.disabled) .label {\n    color: var(--_disabled-unselected-label-color);\n    opacity: 0.38;\n}'))
    })

    it('merges multiple properties under the same state selector', () => {
        const result = stateStyles({
            selector: '.container$state .outline',
            disabled: '.disabled',
            properties: {
                'border-color': 'outline-color',
                'border-width': ['1px', '2px', '2px', '2px', '1px'],
            },
        })

        const css = result.cssText

        assert.ok(css.includes('.container .outline {\n    border-color: var(--_enabled-outline-color);\n    border-width: 1px;\n}'))
        assert.ok(css.includes('.container:hover .outline {\n    border-color: var(--_hovered-outline-color);\n    border-width: 2px;\n}'))
        assert.ok(css.includes('.container:active .outline {\n    border-color: var(--_pressed-outline-color);\n    border-width: 2px;\n}'))
        assert.ok(css.includes('.container:focus-within .outline {\n    border-color: var(--_focused-outline-color);\n    border-width: 2px;\n}'))
        assert.ok(css.includes('.container.disabled .outline {\n    border-color: var(--_disabled-outline-color);\n    border-width: 1px;\n}'))
    })

    it('supports 5-state tuple of custom selectors', () => {
        const result = stateStyles({
            selector: [
                ':host .label',
                ':host:hover .label',
                ':host:active .label',
                ':host:focus-visible .label',
                ':host[disabled] .label',
            ],
            properties: {
                color: 'label-color',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host .label {\n    color: var(--_enabled-label-color);\n}'))
        assert.ok(css.includes(':host:hover .label {\n    color: var(--_hovered-label-color);\n}'))
        assert.ok(css.includes(':host:active .label {\n    color: var(--_pressed-label-color);\n}'))
        assert.ok(css.includes(':host:focus-visible .label {\n    color: var(--_focused-label-color);\n}'))
        assert.ok(css.includes(':host[disabled] .label {\n    color: var(--_disabled-label-color);\n}'))
    })

    it('supports selector map object', () => {
        const result = stateStyles({
            selector: {
                enabled: ':host .icon',
                hovered: ':host:hover .icon',
                disabled: ':host(.disabled) .icon',
            },
            properties: {
                color: 'icon-color',
            },
        })

        const css = result.cssText

        assert.ok(css.includes(':host .icon {\n    color: var(--_enabled-icon-color);\n}'))
        assert.ok(css.includes(':host:hover .icon {\n    color: var(--_hovered-icon-color);\n}'))
        assert.ok(css.includes(':host(.disabled) .icon {\n    color: var(--_disabled-icon-color);\n}'))
        assert.ok(!css.includes(':active'))
        assert.ok(!css.includes(':focus'))
    })
})
