/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { expandMargin } from './expand-margin'
import { expandPadding } from './expand-padding'

type Tokens = Record<string, unknown>

const Edges = ['block-start', 'block-end', 'inline-start', 'inline-end'] as const

const keysOf = (base: string): string[] => Edges.map((edge) => `${base}-${edge}`)

const asTokens = (value: unknown): Tokens => value as Tokens

const value = fc.constantFrom('4px', '8px', '12px', '16px')

const normalizePrefix = (prefix: string): string => {
    const clean = prefix.trim().replace(/^--/, '').replace(/-+$/, '')

    if (clean.length === 0) return 'padding'
    if (clean === 'padding' || clean.endsWith('-padding')) return clean
    return `${clean}-padding`
}

const partialObject = fc.dictionary(
    fc.constantFrom('block', 'inline', 'blockStart', 'blockEnd', 'inlineStart', 'inlineEnd'),
    value,
    { minKeys: 1 },
)

const stateValue = fc.oneof(
    fc.tuple(value, value),
    partialObject,
)

const recordValue = fc.oneof(
    fc.option(value, { nil: null }),
    stateValue,
)

const resolveState = (
    state: string | readonly [string, string] | Record<string, string>,
) => {
    if (typeof state === 'string') {
        return {
            blockStart: state,
            blockEnd: state,
            inlineStart: state,
            inlineEnd: state,
        }
    }

    if (Array.isArray(state)) {
        return {
            blockStart: state[0],
            blockEnd: state[0],
            inlineStart: state[1],
            inlineEnd: state[1],
        }
    }

    const object = state as Record<string, string>
    const block = object['block']
    const inline = object['inline']

    return {
        blockStart: object['blockStart'] ?? block,
        blockEnd: object['blockEnd'] ?? block,
        inlineStart: object['inlineStart'] ?? inline,
        inlineEnd: object['inlineEnd'] ?? inline,
    }
}

describe('expandPadding properties', () => {
    it('broadcasts a scalar to every logical edge', () => {
        fc.assert(
            fc.property(value, (scalar) => {
                const tokens = asTokens(expandPadding('container')(scalar))

                expect(Object.keys(tokens)).toEqual(keysOf('container-padding'))
                for (const key of keysOf('container-padding')) {
                    expect(tokens[key]).toBe(scalar)
                }
            }),
        )
    })

    it('mirrors a 2-axis tuple on its block and inline pairs', () => {
        fc.assert(
            fc.property(value, value, (block, inline) => {
                const tokens = asTokens(expandPadding('container')([block, inline] as const))

                expect(tokens['container-padding-block-start']).toBe(block)
                expect(tokens['container-padding-block-end']).toBe(block)
                expect(tokens['container-padding-inline-start']).toBe(inline)
                expect(tokens['container-padding-inline-end']).toBe(inline)
            }),
        )
    })

    it('maps a 4-edge tuple positionally', () => {
        fc.assert(
            fc.property(value, value, value, value, (blockStart, blockEnd, inlineStart, inlineEnd) => {
                const tokens = asTokens(
                    expandPadding('container')(
                        [blockStart, blockEnd, inlineStart, inlineEnd] as const,
                    ),
                )

                expect(tokens['container-padding-block-start']).toBe(blockStart)
                expect(tokens['container-padding-block-end']).toBe(blockEnd)
                expect(tokens['container-padding-inline-start']).toBe(inlineStart)
                expect(tokens['container-padding-inline-end']).toBe(inlineEnd)
            }),
        )
    })

    it('resolves object declarations with edge > axis > all precedence', () => {
        const layers = fc.dictionary(
            fc.constantFrom(
                'all',
                'block',
                'inline',
                'blockStart',
                'blockEnd',
                'inlineStart',
                'inlineEnd',
                'block-start',
                'block-end',
                'inline-start',
                'inline-end',
            ),
            value,
            { minKeys: 1 },
        )

        fc.assert(
            fc.property(layers, (input) => {
                const tokens = asTokens(expandPadding('container')(input as never))

                const block = input['block'] ?? input['all']
                const inline = input['inline'] ?? input['all']
                const expected = {
                    'container-padding-block-start':
                        input['block-start'] ?? input['blockStart'] ?? block,
                    'container-padding-block-end':
                        input['block-end'] ?? input['blockEnd'] ?? block,
                    'container-padding-inline-start':
                        input['inline-start'] ?? input['inlineStart'] ?? inline,
                    'container-padding-inline-end':
                        input['inline-end'] ?? input['inlineEnd'] ?? inline,
                }

                const defined = Object.entries(expected).filter(([, entry]) => entry !== undefined)
                expect(tokens).toEqual(Object.fromEntries(defined))
            }),
        )
    })

    it('normalizes prefixes idempotently', () => {
        const prefixes = fc
            .tuple(
                fc.constantFrom('', '--'),
                fc.constantFrom('', 'container', 'container-padding', 'padding'),
                fc.constantFrom('', '-', '--'),
            )
            .map(([leading, body, trailing]) => `${leading}${body}${trailing}`)

        fc.assert(
            fc.property(prefixes, (prefix) => {
                const base = normalizePrefix(prefix)
                const tokens = asTokens(expandPadding(prefix)('8px'))

                expect(normalizePrefix(base)).toBe(base)
                expect(Object.keys(tokens)).toEqual(keysOf(base))
                expect(Object.keys(tokens).some((key) => key.startsWith('--'))).toBe(false)
                expect(Object.keys(tokens).some((key) => key.includes('padding-padding'))).toBe(false)
                expect(Object.keys(asTokens(expandPadding(base)('8px')))).toEqual(Object.keys(tokens))
            }),
        )
    })

    it('preserves state order and length for multi-state tuples', () => {
        fc.assert(
            fc.property(fc.array(stateValue, { minLength: 1 }), (states) => {
                const tokens = asTokens(expandPadding('container')(states as never))
                const quads = states.map(resolveState)

                const edges = {
                    'block-start': 'blockStart',
                    'block-end': 'blockEnd',
                    'inline-start': 'inlineStart',
                    'inline-end': 'inlineEnd',
                } as const

                for (const [edge, field] of Object.entries(edges)) {
                    const key = `container-padding-${edge}`
                    const defined = quads.some((quad) => quad[field as keyof typeof quad] !== undefined)

                    expect(key in tokens).toBe(defined)
                    if (!defined) continue

                    expect(tokens[key]).toEqual(quads.map((quad) => quad[field as keyof typeof quad]))
                    expect((tokens[key] as unknown[]).length).toBe(states.length)
                    expect(Object.isFrozen(tokens[key])).toBe(true)
                }
            }),
        )
    })

    it('cleans multi-state records and drops nullish states', () => {
        const stateRecord = fc.dictionary(
            fc.constantFrom('enabled', 'hovered', 'pressed'),
            recordValue,
            { minKeys: 1 },
        )

        fc.assert(
            fc.property(stateRecord, (input) => {
                const entries = Object.entries(input).filter(
                    ([, state]) => state !== null && state !== undefined,
                )
                const quads = entries.map(([, state]) => resolveState(state as never))
                const hasAnyEdge = quads.some((quad) =>
                    Object.values(quad).some((entry) => entry !== undefined),
                )

                if (!hasAnyEdge) {
                    expect(() => expandPadding('container')(input as never)).toThrow(
                        '[expandPadding] Padding object cannot be empty.',
                    )
                    return
                }

                const tokens = asTokens(expandPadding('container')(input as never))

                const edges = {
                    'block-start': 'blockStart',
                    'block-end': 'blockEnd',
                    'inline-start': 'inlineStart',
                    'inline-end': 'inlineEnd',
                } as const

                for (const [edge, field] of Object.entries(edges)) {
                    const key = `container-padding-${edge}`
                    const expected: Record<string, unknown> = {}

                    quads.forEach((quad, index) => {
                        const stateValue = quad[field as keyof typeof quad]
                        if (stateValue !== undefined) {
                            expected[entries[index][0]] = stateValue
                        }
                    })

                    expect(key in tokens).toBe(Object.keys(expected).length > 0)
                    if (key in tokens) {
                        expect(tokens[key]).toEqual(expected)
                        expect(Object.isFrozen(tokens[key])).toBe(true)
                    }
                }
            }),
        )
    })

    it('is structurally isomorphic to expandMargin', () => {
        const singleValue = fc.oneof(
            value,
            fc.tuple(value, value),
            fc.tuple(value, value, value, value),
            partialObject,
        )

        fc.assert(
            fc.property(singleValue, (input) => {
                const margin = asTokens(expandMargin('container')(input as never))
                const padding = asTokens(expandPadding('container')(input as never))
                const renamed = Object.fromEntries(
                    Object.entries(margin).map(([key, entry]) => [
                        key.replace('-margin-', '-padding-'),
                        entry,
                    ]),
                )

                expect(renamed).toEqual(padding)
            }),
        )
    })

    it('returns deterministic frozen output without mutating input', () => {
        fc.assert(
            fc.property(fc.array(fc.tuple(value, value), { minLength: 1 }), (states) => {
                const snapshot = JSON.stringify(states)
                const first = asTokens(expandPadding('container')(states as never))
                const second = asTokens(expandPadding('container')(states as never))

                expect(first).toEqual(second)
                expect(Object.isFrozen(first)).toBe(true)
                for (const entry of Object.values(first)) {
                    expect(Object.isFrozen(entry)).toBe(true)
                }
                expect(JSON.stringify(states)).toBe(snapshot)
            }),
        )
    })
})
