/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { defineSchema } from './define-schema'

describe('defineSchema', () => {
    it('creates an immutable branded StateSchema descriptor with exact states and count', () => {
        const schema = defineSchema(['enabled', 'selected'] as const)

        expect(schema.__brand).toBe('StateSchema')
        expect(schema.states).toEqual(['enabled', 'selected'])
        expect(schema.count).toBe(2)
        expect(Object.isFrozen(schema)).toBe(true)
        expect(Object.isFrozen(schema.states)).toBe(true)
    })

    it('supports a single-state base schema', () => {
        const schema = defineSchema(['enabled'] as const)

        expect(schema.__brand).toBe('StateSchema')
        expect(schema.states).toEqual(['enabled'])
        expect(schema.count).toBe(1)
    })

    it('supports a 3-state checkbox topology', () => {
        const schema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)

        expect(schema.__brand).toBe('StateSchema')
        expect(schema.states).toEqual(['enabled', 'checked', 'indeterminate'])
        expect(schema.count).toBe(3)
    })

    it('supports a 5-state standard interaction topology', () => {
        const schema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)

        expect(schema.__brand).toBe('StateSchema')
        expect(schema.states).toEqual(['enabled', 'hovered', 'pressed', 'focused', 'disabled'])
        expect(schema.count).toBe(5)
    })

    it('supports domain custom states (e.g. badge size schema)', () => {
        const schema = defineSchema(['small', 'large'] as const)

        expect(schema.__brand).toBe('StateSchema')
        expect(schema.states).toEqual(['small', 'large'])
        expect(schema.count).toBe(2)
    })

    it('throws error when states array is empty', () => {
        expect(() => defineSchema([] as unknown as readonly string[])).toThrow(
            '[defineSchema] States array must contain at least 1 state name.'
        )
    })

    it('throws error when states parameter is falsy or null', () => {
        expect(() => defineSchema(null as unknown as readonly string[])).toThrow(
            '[defineSchema] States array must contain at least 1 state name.'
        )
        expect(() => defineSchema(undefined as unknown as readonly string[])).toThrow(
            '[defineSchema] States array must contain at least 1 state name.'
        )
    })

    it('throws error when duplicate state names are present in adjacent positions', () => {
        expect(() => defineSchema(['enabled', 'selected', 'selected'] as const)).toThrow(
            '[defineSchema] Duplicate state names detected in schema definition.'
        )
    })

    it('throws error when duplicate state names are present in non-adjacent positions', () => {
        expect(() => defineSchema(['enabled', 'hovered', 'enabled'] as const)).toThrow(
            '[defineSchema] Duplicate state names detected in schema definition.'
        )
    })

    it('throws error when state name is empty string or non-string', () => {
        expect(() => defineSchema(['enabled', '   '] as const)).toThrow(
            '[defineSchema] State names must be non-empty strings.'
        )
        expect(() => defineSchema(['enabled', 123 as unknown as string] as const)).toThrow(
            '[defineSchema] State names must be non-empty strings.'
        )
    })
})
