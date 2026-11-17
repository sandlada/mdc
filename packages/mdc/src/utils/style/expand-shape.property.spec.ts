/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { expandShape } from './expand-shape'

type Tokens = Record<string, unknown>

const Corners = ['start-start', 'start-end', 'end-start', 'end-end'] as const
const CornerKeys = [
    'startStart',
    'startEnd',
    'endStart',
    'endEnd',
    'start-start',
    'start-end',
    'end-start',
    'end-end',
] as const

const keysOf = (base: string): string[] => Corners.map((corner) => `${base}-${corner}`)

const asTokens = (value: unknown): Tokens => value as Tokens

const scalar = fc.oneof(
    fc.constantFrom('4px', '8px', '12px'),
    fc.constantFrom(0, 4, 8, -2),
)

const normalizePrefix = (prefix: string): string => {
    const clean = prefix.trim().replace(/^--/, '').replace(/-+$/, '')

    if (clean === 'shape' || clean.endsWith('-shape')) return clean
    return clean.length === 0 ? 'shape' : `${clean}-shape`
}

const isCornerObject = (input: Record<string, unknown>): boolean =>
    Object.keys(input).some((key) =>
        (Corners as readonly string[]).includes(key) ||
        (['startStart', 'startEnd', 'endStart', 'endEnd'] as const).includes(
            key as never,
        ),
    )

const resolveCorner = (
    input: Record<string, unknown>,
    corner: string,
): unknown => {
    const camel = corner.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
    const value = input[corner] !== undefined ? input[corner] : input[camel]

    if (value === undefined || value === null) return undefined
    if (typeof value === 'string' && value.trim().length === 0) return undefined
    return value
}

const cornerObject = fc
    .tuple(
        fc.constantFrom(...Corners),
        scalar,
        fc.option(
            fc.dictionary(
                fc.constantFrom(...Corners),
                fc.oneof(scalar, fc.constant(null), fc.constant(''), fc.constant('   ')),
            ),
        ),
    )
    .map(([key, value, extras]) => ({ ...(extras ?? {}), [key]: value }))

const stateRecord = fc
    .tuple(
        fc.constantFrom('enabled', 'hovered', 'pressed'),
        scalar,
        fc.option(
            fc.dictionary(
                fc.constantFrom('enabled', 'hovered', 'pressed'),
                fc.oneof(scalar, fc.constant(null), fc.constant(''), fc.constant('   ')),
            ),
        ),
    )
    .map(([key, value, extras]) => ({ ...(extras ?? {}), [key]: value }))

describe('expandShape properties', () => {
    it('broadcasts a scalar to every logical corner', () => {
        fc.assert(
            fc.property(scalar, (input) => {
                const tokens = asTokens(expandShape('container')(input))

                expect(Object.keys(tokens)).toEqual(keysOf('container-shape'))
                for (const key of keysOf('container-shape')) {
                    expect(tokens[key]).toBe(input)
                }
            }),
        )
    })

    it('broadcasts a state tuple as one frozen copy', () => {
        fc.assert(
            fc.property(fc.array(scalar, { minLength: 1 }), (states) => {
                const input = [...states]
                const tokens = asTokens(expandShape('container')(input as never))
                const keys = keysOf('container-shape')

                for (const key of keys) {
                    expect(tokens[key]).toEqual(states)
                    expect(tokens[key]).toBe(tokens[keys[0]])
                    expect(Object.isFrozen(tokens[key])).toBe(true)
                    expect(tokens[key]).not.toBe(input)
                }

                input.push('mutated' as never)
                expect(tokens[keys[0]]).toEqual(states)
            }),
        )
    })

    it('keeps provider and CSS result scalars by identity', () => {
        const provider = { ToCSSVariable: () => 'var(--md-sys-shape-full)' }
        const result = { cssText: '50%' }

        fc.assert(
            fc.property(fc.constantFrom(provider, result), (input) => {
                const tokens = asTokens(expandShape('container')(input as never))

                for (const key of keysOf('container-shape')) {
                    expect(tokens[key]).toBe(input)
                }
            }),
        )
    })

    it('emits only the defined, non-blank corners of a corner object', () => {
        fc.assert(
            fc.property(cornerObject, (input) => {
                const tokens = asTokens(expandShape('container')(input as never))
                const expected: Record<string, unknown> = {}

                for (const corner of Corners) {
                    const value = resolveCorner(input, corner)
                    if (value !== undefined) {
                        expected[`container-shape-${corner}`] = value
                    }
                }

                expect(tokens).toEqual(expected)
                expect(Object.isFrozen(tokens)).toBe(true)
                expect(isCornerObject(input)).toBe(true)
            }),
        )
    })

    it('honors kebab-case keys over camelCase keys', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...Corners),
                scalar,
                scalar,
                (corner, kebab, camel) => {
                    const camelKey = corner.replace(
                        /-(\w)/g,
                        (_, letter: string) => letter.toUpperCase(),
                    )
                    const input = { [corner]: kebab, [camelKey]: camel }
                    const tokens = asTokens(expandShape('container')(input as never))

                    expect(tokens[`container-shape-${corner}`]).toBe(kebab)
                },
            ),
        )
    })

    it('cleans state records and shares one frozen record across corners', () => {
        fc.assert(
            fc.property(stateRecord, (input) => {
                const tokens = asTokens(expandShape('container')(input as never))
                const expected = Object.fromEntries(
                    Object.entries(input).filter(([, value]) => {
                        if (value === null || value === undefined) return false
                        if (typeof value === 'string' && value.trim().length === 0) return false
                        return true
                    }),
                )
                const keys = keysOf('container-shape')

                expect(tokens).toEqual(
                    Object.fromEntries(keys.map((key) => [key, expected])),
                )
                for (const key of keys) {
                    expect(tokens[key]).toBe(tokens[keys[0]])
                    expect(Object.isFrozen(tokens[key])).toBe(true)
                }
            }),
        )
    })

    it('normalizes prefixes idempotently', () => {
        const prefixes = fc
            .tuple(
                fc.constantFrom('', '--'),
                fc.constantFrom('', 'container', 'container-shape', 'shape'),
                fc.constantFrom('', '-', '--'),
            )
            .map(([leading, body, trailing]) => `${leading}${body}${trailing}`)

        fc.assert(
            fc.property(prefixes, (prefix) => {
                const base = normalizePrefix(prefix)
                const tokens = asTokens(expandShape(prefix)('8px'))

                expect(normalizePrefix(base)).toBe(base)
                expect(Object.keys(tokens)).toEqual(keysOf(base))
                expect(Object.keys(tokens).some((key) => key.startsWith('--'))).toBe(false)
                expect(Object.keys(tokens).some((key) => key.includes('shape-shape'))).toBe(false)
                expect(Object.keys(asTokens(expandShape(base)('8px')))).toEqual(Object.keys(tokens))
            }),
        )
    })

    it('returns frozen deterministic output', () => {
        const input = fc.oneof(
            scalar,
            fc.array(scalar, { minLength: 1 }),
            cornerObject,
            stateRecord,
        )

        fc.assert(
            fc.property(input, (value) => {
                const first = asTokens(expandShape('container')(value as never))
                const second = asTokens(expandShape('container')(value as never))

                expect(first).toEqual(second)
                expect(Object.isFrozen(first)).toBe(true)
            }),
        )
    })
})
