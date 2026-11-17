/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { overrideTokens } from './override-tokens'

type OverrideValue =
    | string
    | number
    | { ToCSSVariable: () => string }
    | { cssText: string }
    | { rawVal: string }
    | null
    | undefined

const tokenKey = fc.constantFrom('container-color', 'label-text-color', '--outline-width', 'height')

const overrideValue: fc.Arbitrary<OverrideValue> = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.constant({ ToCSSVariable: () => 'var(--md-sys-color-primary)' }),
    fc.constant({ cssText: 'red' }),
    fc.constant({ rawVal: '8px' }),
    fc.constant(null),
    fc.constant(undefined),
)

const overrideRecord = fc.dictionary(tokenKey, overrideValue, { minKeys: 1 })

const cleanKey = (key: string): string => (key.startsWith('--') ? key.slice(2) : key)

const formatValue = (value: OverrideValue): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') {
        if ('ToCSSVariable' in value && typeof value.ToCSSVariable === 'function') {
            return value.ToCSSVariable()
        }
        if ('cssText' in value && typeof value.cssText === 'string') return value.cssText
        if ('rawVal' in value) return formatValue(value.rawVal)
    }
    return String(value)
}

const declarationsOf = (record: Record<string, OverrideValue>, prefix: string): string[] =>
    Object.entries(record)
        .map(([key, value]) => [cleanKey(key), formatValue(value)] as const)
        .filter(([, value]) => value.length > 0)
        .map(([key, value]) => `${prefix}-${key}: ${value};`)

describe('overrideTokens properties', () => {
    it('emits one public declaration per non-empty token', () => {
        fc.assert(
            fc.property(overrideRecord, (record) => {
                const result = overrideTokens('--mdc-button')(record)()

                expect(result.cssText).toBe(declarationsOf(record, '--mdc-button').join('\n'))
            }),
        )
    })

    it('never emits private custom properties', () => {
        fc.assert(
            fc.property(overrideRecord, (record) => {
                const result = overrideTokens('--mdc-button')(record)()

                expect(result.cssText).not.toContain('--_')
            }),
        )
    })

    it('normalizes string and options prefixes identically', () => {
        const prefixes = fc
            .tuple(
                fc.constantFrom('', '--'),
                fc.constantFrom('mdc-button', 'mdc-button-'),
                fc.constantFrom('', '-', '--'),
            )
            .map(([leading, body, trailing]) => `${leading}${body}${trailing}`)

        fc.assert(
            fc.property(prefixes, (rawPrefix) => {
                const trimmed = rawPrefix.trim()
                const normalized = (trimmed.startsWith('--') ? trimmed : `--${trimmed}`).replace(
                    /-+$/,
                    '',
                )

                const fromString = overrideTokens(rawPrefix)({ color: 'red' })().cssText
                const fromOptions = overrideTokens({ prefix: rawPrefix })({ color: 'red' })()
                    .cssText

                expect(fromString).toBe(fromOptions)
                expect(fromString).toBe(`${normalized}-color: red;`)
            }),
        )
    })

    it('wraps declarations only for a non-blank selector', () => {
        const selectors = fc.constantFrom(':host', ':host([data-theme="dark"])', '', '   ', '\n\t')

        fc.assert(
            fc.property(selectors, (selector) => {
                const result = overrideTokens({ prefix: '--mdc-button', selector })({
                    color: 'red',
                })().cssText

                if (selector.trim().length === 0) {
                    expect(result).toBe('--mdc-button-color: red;')
                    return
                }

                expect(result.startsWith(`${selector} {\n`)).toBe(true)
                expect(result.endsWith('\n}')).toBe(true)
                expect(result).toContain('    --mdc-button-color: red;')
            }),
        )
    })

    it('preserves entry order and is deterministic', () => {
        fc.assert(
            fc.property(overrideRecord, (record) => {
                const first = overrideTokens('--mdc-button')(record)().cssText
                const second = overrideTokens('--mdc-button')(record)().cssText

                expect(first).toBe(second)
            }),
        )
    })

    it('ignores the trailing definition argument', () => {
        fc.assert(
            fc.property(overrideRecord, fc.anything(), (record, definition) => {
                const result = overrideTokens('--mdc-button')(record)(definition as never)

                expect(result.cssText).toBe(declarationsOf(record, '--mdc-button').join('\n'))
            }),
        )
    })
})
