/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { expandMargin } from './expand-margin'

type Tokens = Record<string, unknown>

const Edges = ['block-start', 'block-end', 'inline-start', 'inline-end'] as const

const keysOf = (base: string): string[] => Edges.map((edge) => `${base}-${edge}`)

const asTokens = (value: unknown): Tokens => value as Tokens

const value = fc.constantFrom('4px', '8px', '12px', '16px')

const normalizePrefix = (prefix: string): string => {
    const clean = prefix.trim().replace(/^--/, '').replace(/-+$/, '')

    if (clean.length === 0) return 'margin'
    if (clean === 'margin' || clean.endsWith('-margin')) return clean
    return `${clean}-margin`
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

describe('expandMargin properties', () => {
    it('broadcasts a scalar to every logical edge', () => {
        fc.assert(
            fc.property(value, (scalar) => {
                const tokens = asTokens(expandMargin('container')(scalar))

                expect(Object.keys(tokens)).toEqual(keysOf('container-margin'))
                for (const key of keysOf('container-margin')) {
                    expect(tokens[key]).toBe(scalar)
                }
            }),
        )
    })

    it('mirrors a 2-axis tuple on its block and inline pairs', () => {
        fc.assert(
            fc.property(value, value, (block, inline) => {
                const tokens = asTokens(expandMargin('container')([block, inline] as const))

                expect(tokens['container-margin-block-start']).toBe(block)
                expect(tokens['container-margin-block-end']).toBe(block)
                expect(tokens['container-margin-inline-start']).toBe(inline)
                expect(tokens['container-margin-inline-end']).toBe(inline)
            }),
        )
    })

    it('maps a 4-edge tuple positionally', () => {
        fc.assert(
            fc.property(value, value, value, value, (blockStart, blockEnd, inlineStart, inlineEnd) => {
                const tokens = asTokens(
                    expandMargin('container')(
                        [blockStart, blockEnd, inlineStart, inlineEnd] as const,
                    ),
                )

                expect(tokens['container-margin-block-start']).toBe(blockStart)
                expect(tokens['container-margin-block-end']).toBe(blockEnd)
                expect(tokens['container-margin-inline-start']).toBe(inlineStart)
                expect(tokens['container-margin-inline-end']).toBe(inlineEnd)
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
                const tokens = asTokens(expandMargin('container')(input as never))

                const block = input['block'] ?? input['all']
                const inline = input['inline'] ?? input['all']
                const expected = {
                    'container-margin-block-start':
                        input['block-start'] ?? input['blockStart'] ?? block,
                    'container-margin-block-end':
                        input['block-end'] ?? input['blockEnd'] ?? block,
                    'container-margin-inline-start':
                        input['inline-start'] ?? input['inlineStart'] ?? inline,
                    'container-margin-inline-end':
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
                fc.constantFrom('', 'container', 'container-margin', 'margin'),
                fc.constantFrom('', '-', '--'),
            )
            .map(([leading, body, trailing]) => `${leading}${body}${trailing}`)

        fc.assert(
            fc.property(prefixes, (prefix) => {
                const base = normalizePrefix(prefix)
                const tokens = asTokens(expandMargin(prefix)('8px'))

                expect(normalizePrefix(base)).toBe(base)
                expect(Object.keys(tokens)).toEqual(keysOf(base))
                expect(Object.keys(tokens).some((key) => key.startsWith('--'))).toBe(false)
                expect(Object.keys(tokens).some((key) => key.includes('margin-margin'))).toBe(false)
                expect(Object.keys(asTokens(expandMargin(base)('8px')))).toEqual(Object.keys(tokens))
            }),
        )
    })

    it('preserves state order and length for multi-state tuples', () => {
        fc.assert(
            fc.property(fc.array(stateValue, { minLength: 1 }), (states) => {
                const tokens = asTokens(expandMargin('container')(states as never))
                const quads = states.map(resolveState)

                const edges = {
                    'block-start': 'blockStart',
                    'block-end': 'blockEnd',
                    'inline-start': 'inlineStart',
                    'inline-end': 'inlineEnd',
                } as const

                for (const [edge, field] of Object.entries(edges)) {
                    const key = `container-margin-${edge}`
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
            fc.oneof(fc.option(value, { nil: null }), fc.tuple(value, value), partialObject),
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
                    expect(() => expandMargin('container')(input as never)).toThrow(
                        '[expandMargin] Margin object cannot be empty.',
                    )
                    return
                }

                const tokens = asTokens(expandMargin('container')(input as never))

                const edges = {
                    'block-start': 'blockStart',
                    'block-end': 'blockEnd',
                    'inline-start': 'inlineStart',
                    'inline-end': 'inlineEnd',
                } as const

                for (const [edge, field] of Object.entries(edges)) {
                    const key = `container-margin-${edge}`
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

    it('returns deterministic frozen output without mutating input', () => {
        fc.assert(
            fc.property(fc.array(fc.tuple(value, value), { minLength: 1 }), (states) => {
                const snapshot = JSON.stringify(states)
                const first = asTokens(expandMargin('container')(states as never))
                const second = asTokens(expandMargin('container')(states as never))

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
