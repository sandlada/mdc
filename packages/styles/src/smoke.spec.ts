/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Package smoke spec: asserts the public barrels wire up end to end.
 * Existence + minimal callability only; behavior details belong to the
 * focused unit specs. Must stay dependency-free of built output so it
 * also guards fresh checkouts.
 */

import { describe, expect, it } from 'vitest'
import {
    compileStateSheet,
    createStyleDefinition,
    defineSchema,
    flow,
} from './index'
import { expandShape } from './expand'
import { emptyTables, withState, withVariant } from './triggers'
import { forwardTokens, stringifyTokens } from './tokens'
import { createStyleSheet as createLitStyleSheet, toLit } from './lit'
import { mdcStyles } from './rolldown'

describe('package smoke', () => {
    it('builds a schema and definition through the root barrel', () => {
        const schema = defineSchema(['enabled', 'hovered'] as const)
        const def = createStyleDefinition(schema)({
            'container-color': ['red', 'blue'],
        })
        expect(def.tokens['container-color']).toEqual(['red', 'blue'])
    })

    it('compiles plain CSS through the root barrel', () => {
        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({ 'x': 'y' })
        const out = compileStateSheet(def, '.a { color: red }')
        expect(out).toContain('.a')
        expect(out).toContain('color: red')
    })

    it('exposes functional utilities from subpath barrels', () => {
        expect(typeof flow).toBe('function')
        expect(typeof withState).toBe('function')
        expect(typeof withVariant).toBe('function')
        expect(typeof forwardTokens).toBe('function')
        expect(typeof stringifyTokens).toBe('function')
        expect(typeof expandShape).toBe('function')
        expect(emptyTables.states).toEqual({})
        expect(emptyTables.variants).toEqual({})
    })

    it('converts sheets through the lit adapter', () => {
        expect(typeof createLitStyleSheet).toBe('function')
        expect(toLit(':host { color: red }').cssText).toContain('color: red')
    })

    it('constructs the rolldown plugin as a pre plugin', () => {
        const plugin = mdcStyles()
        expect(plugin.name).toBe('mdc-styles')
        expect(plugin.enforce).toBe('pre')
    })
})
