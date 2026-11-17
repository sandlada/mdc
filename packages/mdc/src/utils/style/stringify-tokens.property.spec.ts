/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { stringifyTokens } from './stringify-tokens'

type TokenValue =
    | string
    | number
    | { ToCSSVariable: () => string }
    | { cssText: string }
    | { rawVal: string }
    | null
    | undefined

const tokenKey = fc.constantFrom('size', 'color', 'thickness', 'container-color', '--custom-size')

const staticValue: fc.Arbitrary<Exclude<TokenValue, null | undefined>> = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.constant({ ToCSSVariable: () => 'var(--md-sys-color-outline)' }),
    fc.constant({ cssText: 'red' }),
    fc.constant({ rawVal: '8px' }),
)

const nestedValue = staticValue

const staticRecord = fc.dictionary(
    tokenKey,
    fc.oneof(staticValue, fc.constant(null), fc.constant(undefined)),
    { minKeys: 1 },
)

const stateRecord = fc.dictionary(
    fc.constantFrom('enabled', 'hovered', 'pressed'),
    fc.oneof(nestedValue, fc.constant(null)),
    { minKeys: 1 },
)

const cleanKey = (key: string): string => (key.startsWith('--') ? key.slice(2) : key)

const formatValue = (value: TokenValue): string => {
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

const declarationsOf = (
    record: Record<string, TokenValue>,
    prefix: string,
    includePublicVars: boolean,
): string[] =>
    Object.entries(record)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
            const name = cleanKey(key)
            const formatted = formatValue(value)
            return includePublicVars
                ? `--_${name}: var(${prefix}-${name}, ${formatted});`
                : `--_${name}: ${formatted};`
        })

describe('stringifyTokens properties', () => {
    it('emits one declaration per non-nullish token in insertion order', () => {
        fc.assert(
            fc.property(staticRecord, (record) => {
                const result = stringifyTokens('--mdc-test')(record)
                const expected = declarationsOf(record as Record<string, TokenValue>, '--mdc-test', true)

                expect(result.cssText).toBe(expected.join('\n'))
            }),
        )
    })

    it('omits the public fallback when includePublicVars is false', () => {
        fc.assert(
            fc.property(staticRecord, (record) => {
                const result = stringifyTokens({
                    prefix: '--mdc-test',
                    includePublicVars: false,
                })(record)
                const expected = declarationsOf(record as Record<string, TokenValue>, '--mdc-test', false)

                expect(result.cssText).toBe(expected.join('\n'))
                expect(result.cssText).not.toContain('var(--mdc-test-')
            }),
        )
    })

    it('preserves entry order and is deterministic', () => {
        fc.assert(
            fc.property(staticRecord, (record) => {
                const first = stringifyTokens('--mdc-test')(record).cssText
                const second = stringifyTokens('--mdc-test')(record).cssText

                expect(first).toBe(second)

                const names = first
                    .split('\n')
                    .filter(Boolean)
                    .map((line) => line.slice(3, line.indexOf(':')))
                const expected = Object.keys(record)
                    .filter((key) => record[key] !== null && record[key] !== undefined)
                    .map(cleanKey)

                expect(names).toEqual(expected)
            }),
        )
    })

    it('normalizes string and options prefixes identically', () => {
        const prefixes = fc
            .tuple(
                fc.constantFrom('', '--'),
                fc.constantFrom('mdc-icon', 'mdc-icon-'),
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

                const fromString = stringifyTokens(rawPrefix)({ size: '24px' }).cssText
                const fromOptions = stringifyTokens({ prefix: rawPrefix })({ size: '24px' }).cssText

                expect(fromString).toBe(fromOptions)
                expect(fromString).toContain(`var(${normalized}-size, 24px);`)
            }),
        )
    })

    it('wraps declarations only for a non-blank selector', () => {
        const selectors = fc.constantFrom(':host', ':host([variant="tonal"])', '   ', '\n\t')

        fc.assert(
            fc.property(selectors, (selector) => {
                const result = stringifyTokens({ prefix: '--mdc-test', selector })({
                    size: '24px',
                }).cssText

                if (selector.trim().length === 0) {
                    expect(result).toBe('--_size: var(--mdc-test-size, 24px);')
                    return
                }

                expect(result.startsWith(`${selector} {\n`)).toBe(true)
                expect(result.endsWith('\n}')).toBe(true)
                expect(result).toContain('    --_size: var(--mdc-test-size, 24px);')
            }),
        )
    })

    it('expands state records into one declaration per non-nullish state', () => {
        fc.assert(
            fc.property(stateRecord, (states) => {
                const result = stringifyTokens('--mdc-test')({ size: states }).cssText
                const expected = Object.entries(states)
                    .filter(([, value]) => value !== null)
                    .map(
                        ([state, value]) =>
                            `--_${state}-size: var(--mdc-test-${state}-size, ${formatValue(value)});`,
                    )

                expect(result).toBe(expected.join('\n'))
            }),
        )
    })

    it('rejects any top-level array token value', () => {
        fc.assert(
            fc.property(tokenKey, fc.array(staticValue, { minLength: 1 }), (key, value) => {
                expect(() => stringifyTokens('--mdc-test')({ [key]: value })).toThrow(
                    `[stringifyTokens] Token '${cleanKey(key)}' uses an array but the simplified style system holds no schema: only static values and plain records are allowed.`,
                )
            }),
        )
    })

    it('returns empty CSS when every token is nullish', () => {
        fc.assert(
            fc.property(tokenKey, (key) => {
                const result = stringifyTokens('--mdc-test')({ [key]: null, other: undefined })

                expect(result.cssText).toBe('')
            }),
        )
    })
})
