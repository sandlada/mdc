/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @variant 名單規格（handleVariantBlock，Selector-focused）：
 *   綠隊 = 合法名單應生成變體殼；紅隊 = 非法名單（空 / 通配 / 否定 / 未知名）應透傳。
 *   精確相等（最小 canonicalization），不看 warn，結果不對即失敗。
 */

import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from '../../create-style-definition'
import { defineSchema } from '../../define-schema'
import { mapStateTriggers } from '../../map-state-triggers'
import { compileStateSheet } from '../compile-state-sheet'

type MappingRow = ReadonlyArray<readonly [input: string, expected: string | readonly string[]]>

function canonical(css: string | readonly string[]): string {
    // 數組以單空格連接：對應編譯器 `join(' ')` 的殼分隔語義；換行僅統一 \r\n，不折疊中間空白。
    // `button~.label` vs `button ~ .label` 仍判為不同。
    const text = typeof css === 'string' ? css : css.join(' ')
    return text.replace(/\r\n/g, '\n').trim()
}

describe('variant', () => {
    const VariantSchema = defineSchema(['enabled'] as const)
    const FilledDef = createStyleDefinition(VariantSchema)({
        'color': '#6750a4',
    })
    const TonalDef = createStyleDefinition(VariantSchema)({
        'color': '#e8def8',
    })
    const OutlinedDef = createStyleDefinition(VariantSchema)({
        'color': '#ffffff',
    })
    const VariantDefs = { 'filled': FilledDef, 'tonal': TonalDef, 'outlined': OutlinedDef } as const
    const StateTriggers = mapStateTriggers({
        'enabled': '',
    })

    /**
     * Variant 名單格式（本 describe 專用，沿用 button 的 R1–R8）：
     *   variant-rule := "@variant" "(" name ("," name)* ","? ")" "{" body "}"
     *   name         := 變體字典中的確切 key（大小寫敏感，不可省略，不可為空）
     *   不支援通配符與否定：`*`、`!name` 屬無效用法（warn），不收錄於 mapping，另行斷言
     * V1 單名 → 單殼（:host([variant="filled"]) { … }）
     * V2 多名 → 逗號並殼（:host([variant="a"]), :host([variant="b"]) { … }，單規則單字串）
     * V3 B1 保留嵌套：body 原樣嵌於殼內；@state 可內嵌，注入照 R2 在內層執行
     * 本 describe 用單態 schema（enabled），聚焦名單格式；狀態×變體交織留待實現期按 Red 補
     */
    const greenMapping: MappingRow = [
        // V1：單名單殼
        ['@variant(filled) { button {} }', ':host([variant="filled"]) { button {} }'],
        ['@variant(tonal) { button .label {} }', ':host([variant="tonal"]) { button .label {} }'],
        ['@variant(outlined) { button:has(.label) {} }', ':host([variant="outlined"]) { button:has(.label) {} }'],
        // V2：多名逗號並殼
        ['@variant(filled, tonal) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],
        ['@variant(filled, tonal, outlined) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]), :host([variant="outlined"]) { button {} }'],
        ['@variant(tonal, outlined) { button .label {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button .label {} }'],
        ['@variant(filled, outlined) { button[type="submit"] {} }', ':host([variant="filled"]), :host([variant="outlined"]) { button[type="submit"] {} }'],
        ['@variant(outlined) { button::before {} }', ':host([variant="outlined"]) { button::before {} }'],
        // 名單格式寬容（空白／尾逗號）
        ['@variant(  filled ,  tonal  ) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],
        ['@variant(filled, tonal,) { button {} }', ':host([variant="filled"]), :host([variant="tonal"]) { button {} }'],

    ]

    /**
     * 紅隊（redMapping）：@variant 名單非法形狀。expected 為透傳輸出，結果不對即失敗，不看 warn。你需要填寫：
     *   - 空名單 '@variant() { ... }'、通配符 '@variant(*) { ... }'、否定 '!name' 屬無效用法
     *   - 未知變體名 '@variant(nonexistent) { ... }' 應透傳（與實現約定一致後填期望）
     *   - 缺右括號等截斷輸入應不拋異常且原樣透傳
     */
    const redMapping: MappingRow = []

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(VariantDefs, input, { registry: StateTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(VariantDefs, input, { registry: StateTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

