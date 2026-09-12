/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version 2026.9.8
 *
 * @fileoverview
 * tables 規格：無方法凍結資料 + data-last HOF 合併 + 純 resolver。
 * 期望值依據 `state-trigger-registry` 解析語義與 `create-default-triggers`
 * 預設表獨立推導，不迎合實現輸出。
 */

import { describe, it, expect } from 'vitest'
import {
    emptyTables,
    isTriggerTables,
    resolveState,
    resolveVariant,
    withState,
    withVariant
} from './triggers'

describe('TriggerTables data', () => {
    it('emptyTables is frozen and empty', () => {
        expect(emptyTables.states).toEqual({})
        expect(emptyTables.variants).toEqual({})
        expect(Object.isFrozen(emptyTables)).toBe(true)
        expect(Object.isFrozen(emptyTables.states)).toBe(true)
        expect(Object.isFrozen(emptyTables.variants)).toBe(true)
    })

    it('withState merges without mutating input and trims selectors', () => {
        const base = withState({ 'small': '  .small  ' })(emptyTables)
        expect(base.states).toEqual({ 'small': '.small' })
        expect(base.variants).toEqual({})
        expect(emptyTables.states).toEqual({})
        expect(Object.isFrozen(base)).toBe(true)
        expect(Object.isFrozen(base.states)).toBe(true)

        const extended = withState({ 'large': '.large' })(base)
        expect(extended.states).toEqual({ 'small': '.small', 'large': '.large' })
        expect(base.states).toEqual({ 'small': '.small' })
    })

    it('withVariant merges without mutating input', () => {
        const base = withVariant({ 'filled': ':host([variant="filled"])' })(emptyTables)
        expect(base.variants).toEqual({ 'filled': ':host([variant="filled"])' })
        expect(base.states).toEqual({})
        expect(emptyTables.variants).toEqual({})
    })

    it('withState and withVariant compose and preserve each other', () => {
        const tables = withVariant({ 'filled': ':host([variant="filled"])' })(
            withState({ 'small': '.small' })(emptyTables)
        )
        expect(tables.states).toEqual({ 'small': '.small' })
        expect(tables.variants).toEqual({ 'filled': ':host([variant="filled"])' })
    })

    it('later mappings override earlier ones per key', () => {
        const tables = withState({ 'small': '.a' })(withState({ 'small': '.small' })(emptyTables))
        expect(tables.states).toEqual({ 'small': '.a' })
    })

    it('withState throws on non-record input and non-string values', () => {
        expect(() => (withState as any)(null)(emptyTables)).toThrow(TypeError)
        expect(() => (withState as any)({ 'small': 42 })(emptyTables)).toThrow(TypeError)
        expect(() => (withVariant as any)('nope')(emptyTables)).toThrow(TypeError)
    })

    it('nullish entries are skipped like the legacy registry', () => {
        const tables = withState({ 'small': '.small', 'large': null as never })(emptyTables)
        expect(tables.states).toEqual({ 'small': '.small' })
    })
})

describe('isTriggerTables', () => {
    it('accepts tables and rejects definitions, options and registries', () => {
        expect(isTriggerTables(emptyTables)).toBe(true)
        expect(isTriggerTables({ states: {}, variants: {} })).toBe(true)
        expect(isTriggerTables({ states: ['small'], variants: {} })).toBe(false)
        expect(isTriggerTables({ registry: {}, variants: {} })).toBe(false)
        expect(isTriggerTables(null)).toBe(false)
        expect(isTriggerTables('tables')).toBe(false)
    })
})

describe('resolveState (pure)', () => {
    it('explicit host selectors resolve to host target', () => {
        const tables = withState({
            'extra-small': `:host([circular-size='extra-small'])`,
            'disabled': '[disabled]'
        })(emptyTables)
        expect(resolveState('extra-small')(tables)).toEqual({
            target: 'host',
            modifier: `:host([circular-size='extra-small'])`
        })
        expect(resolveState('disabled')(tables)).toEqual({ target: 'host', modifier: '[disabled]' })
    })

    it('enabled resolves to empty self modifier', () => {
        expect(resolveState('enabled')(emptyTables)).toEqual({ target: 'self', modifier: '' })
    })

    it('built-in defaults apply without explicit mapping', () => {
        expect(resolveState('hovered')(emptyTables)).toEqual({ target: 'self', modifier: ':hover' })
        expect(resolveState('disabled')(emptyTables)).toEqual({ target: 'host', modifier: '[disabled]' })
    })

    it('explicit entries override built-in defaults', () => {
        const tables = withState({ 'hovered': '.hovered' })(emptyTables)
        expect(resolveState('hovered')(tables)).toEqual({ target: 'self', modifier: '.hovered' })
    })

    it('unmapped custom names fall back to class heuristic', () => {
        expect(resolveState('small')(emptyTables)).toEqual({ target: 'self', modifier: '.small' })
        expect(resolveState('small', { isHostAnchor: true })(emptyTables)).toEqual({
            target: 'host',
            modifier: '[small]'
        })
    })

    it('does not mutate the input tables', () => {
        const tables = withState({ 'small': '.small' })(emptyTables)
        resolveState('small')(tables)
        expect(tables.states).toEqual({ 'small': '.small' })
    })
})

describe('resolveVariant (pure)', () => {
    it('returns mount selectors and undefined for unmapped names', () => {
        const tables = withVariant({
            'linear': `:host([variant='linear'])`,
            'circular': `:host([variant='circular'])`
        })(emptyTables)
        expect(resolveVariant('linear')(tables)).toBe(`:host([variant='linear'])`)
        expect(resolveVariant('circular')(tables)).toBe(`:host([variant='circular'])`)
        expect(resolveVariant('filled')(tables)).toBeUndefined()
        expect(resolveVariant('linear')(emptyTables)).toBeUndefined()
    })
})
