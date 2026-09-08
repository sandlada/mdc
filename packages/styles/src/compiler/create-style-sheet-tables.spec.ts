/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version 2026.9.8
 *
 * @fileoverview
 * tables-first 規格：`flow(withState, withVariant)(emptyTables)` 組裝的
 * `TriggerTables` 經 `createStyleSheet(tables)(def)` 編譯，與 options 物件形
 * 輸出一致；缺 definition 的狀態感知模板顯性失敗。
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { emptyTables, withState, withVariant } from '../triggers/tables'
import { flow } from '../pipe/flow'
import { createStyleSheet } from './create-style-sheet'

describe('createStyleSheet tables-first', () => {
    const SizeSchema = defineSchema(['small', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': ['12px', '16px']
    })

    const VariantSchema = defineSchema(['enabled'] as const)
    const VariantDefs = {
        'filled': createStyleDefinition(VariantSchema)({ 'color': '#6750a4' }),
        'tonal': createStyleDefinition(VariantSchema)({ 'color': '#e8def8' })
    } as const

    const tables = flow(
        withState({ 'small': '.small', 'large': '.large' }),
        withVariant({
            'filled': ':host([variant="filled"])',
            'tonal': ':host([variant="tonal"])'
        })
    )(emptyTables)

    it('tables built stepwise equal flow-composed tables', () => {
        const stepwise = withVariant({
            'filled': ':host([variant="filled"])',
            'tonal': ':host([variant="tonal"])'
        })(withState({ 'small': '.small', 'large': '.large' })(emptyTables))
        expect(stepwise).toEqual(tables)
    })

    it('state expansion matches the options-object form', () => {
        const template = `
            @state(button) button {
                height: var(--_size);
            }
        `
        const fromTables = createStyleSheet(tables)(SizeDef)(template).cssText
        const fromOptions = createStyleSheet({ tables })(SizeDef)(template).cssText
        expect(fromTables).toBe(fromOptions)
        expect(fromTables).toContain('button.small {')
        expect(fromTables).toContain('button.large {')
        expect(fromTables).toContain('height: var(--_small-size);')
        expect(fromTables).toContain('height: var(--_large-size);')
    })

    it('variant shells wrap exact names without fallback', () => {
        const template = `@variant(filled, tonal) { button {} }`
        const fromTables = createStyleSheet(tables)(VariantDefs)(template).cssText
        expect(fromTables).toContain(':host([variant="filled"]), :host([variant="tonal"]) {')
    })

    it('host-attribute state triggers expand on :host', () => {
        const hostTables = flow(
            withState({ 'small': `:host([circular-size='small'])` }),
            withVariant({ 'circular': `:host([variant='circular'])` })
        )(emptyTables)
        const output = createStyleSheet(hostTables)(SizeDef)(`
            @variant(circular) { @state(button) button {} }
        `).cssText
        expect(output).toContain(`:host([variant='circular'])`)
        expect(output).toContain(`:host([variant='circular'][circular-size='small'])`)
    })

    it('missing definition with state-aware template throws fail-fast', () => {
        expect(() => (createStyleSheet as any)(tables)(undefined)(`@state(button) button {}`)).toThrow(
            /requires a style definition/
        )
        expect(() => (createStyleSheet as any)(tables)(null)(`@variant(filled) { button {} }`)).toThrow(
            /requires a style definition/
        )
    })

    it('missing definition with static CSS passes through', () => {
        const output = (createStyleSheet as any)(tables)(undefined)(`.static { color: red; }`).cssText
        expect(output).toContain('.static')
    })
})
