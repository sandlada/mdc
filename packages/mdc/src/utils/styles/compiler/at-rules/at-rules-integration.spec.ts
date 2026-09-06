/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * 跨 at-rule 殼交織規格（@variant × @state × @when，Selector-focused）：
 *   只測殼交織；聲明內容（var 重寫 / expanders / a11y）不在此測。
 *   綠隊 = 合法交織應正確嵌套展開；紅隊 = 內層非法（R8 / 非法名單 / 非 host 條件）應透傳。
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

describe('Intergration', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
    })
    const SizeTriggers = mapStateTriggers({
        'small': '.small',
        'medium': '.medium',
        'large': '.large',
    })
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

    /**
     * 跨 At-Rule 整合規格（Intergration）：
     *   涵蓋多個 at-rule（@variant, @state, @when, @reduced-motion, @forced-colors 等）
     *   在同一樣式表中巢狀、並列或交織出現時的協同編譯行為。
     *
     * I1: @variant + @state
     *   - 變體外殼包裹狀態目標，狀態按 R2 在內層展開；多態時笛卡爾展開
     * I2: @variant + @when
     *   - 變體外殼結合宿主條件提升，依 H3/W4 在括號內合併屬性（:host([variant="..."][...])）
     * I3: @when + @state
     *   - 雙向協同：外層 @when 包裹 @state，或 @state 內就近定義 @when 提升至頂層，狀態展開均保持一致
     * I4: @variant + @state + @when (三者交織)
     *   - 頂層外殼合併變體與 when 條件，內層元素精確注入 state 狀態
     * I5: @state + A11y 巨集 (@reduced-motion / @forced-colors)
     *   - 媒體查詢巨集保持原生 CSS 巢狀，並隨 state 狀態維度共同展開
     * I6: @variant + A11y 巨集
     *   - 變體外殼包裹媒體查詢巨集
     * I7: @state + Property Expanders (shape / padding)
     *   - 狀態展開與屬性巨集展開正交協同
     */
    const greenMapping: MappingRow = [
        // I1: @variant + @state
        ['@variant(filled) { @state(button) button {} }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} }'],
        ['@variant(tonal, outlined) { @state(button) button .label {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@variant(filled) { @state(button) button, button .label {} }', ':host([variant="filled"]) { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        ['@variant(tonal, outlined) { @state(button.show[selected]) button.show[selected].foo {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],

        // I2: @variant + @when
        ['@variant(filled) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"][checked]) { button {} }'],
        ['@variant(filled) { .container { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { .container {} } :host([variant="filled"][checked]) { .container { button {} } }'],
        ['@variant(filled, tonal) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]), :host([variant="tonal"]) {} :host([variant="filled"][checked]), :host([variant="tonal"][checked]) { button {} }'],
        ['@variant(filled) { @when(:host(:state(checked))) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]:state(checked)) { button {} }'],

        // I3: @when + @state
        ['@when(:host([checked])) { @state(button) button {} }', ':host([checked]) { button.small {} button.medium {} button.large {} }'],
        ['@when(:host([checked])) { @state(button) button .label {} }', ':host([checked]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.small {} button.medium {} button.large {} :host([dense]) { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } }'],
        ['.wrapper { @state(button) button { @when(:host([dense])) { height: 32px; } } }', '.wrapper { button.small {} button.medium {} button.large {} } :host([dense]) { .wrapper { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } } }'],

        // I4: @variant + @state + @when (三者交織)
        ['@variant(filled) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'],
        ['@variant(filled, tonal) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"][checked]), :host([variant="tonal"][checked]) { button.small { color: red; } button.medium { color: red; } button.large { color: red; } }'],

        // I5: @state + A11y 巨集
        [
            '@state(button) button { @reduced-motion { transition: none; } }',
            [
                'button.small { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.medium { @media (prefers-reduced-motion: reduce) { transition: none; } }',
                'button.large { @media (prefers-reduced-motion: reduce) { transition: none; } }',
            ],
        ],
        [
            '@state(button) button { @forced-colors { outline: 1px solid CanvasText; } }',
            [
                'button.small { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
                'button.medium { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
                'button.large { @media (forced-colors: active) { outline: 1px solid CanvasText; } }',
            ],
        ],

        // I6: @variant + A11y 巨集
        ['@variant(filled) { @reduced-motion { button { transition: none; } } }', ':host([variant="filled"]) { @media (prefers-reduced-motion: reduce) { button { transition: none; } } }'],
        ['@variant(filled, tonal) { @forced-colors { button { outline: 1px solid CanvasText; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { @media (forced-colors: active) { button { outline: 1px solid CanvasText; } } }'],

        // I7: @state + Property Expanders (shape / padding)
        [
            '@state(button) button { shape: var(--_shape); }',
            [
                'button.small { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.medium { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
                'button.large { border-start-start-radius: var(--_shape-start-start); border-start-end-radius: var(--_shape-start-end); border-end-end-radius: var(--_shape-end-end); border-end-start-radius: var(--_shape-end-start); }',
            ],
        ],
        [
            '@state(button) button { padding: var(--_padding); }',
            [
                'button.small { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
                'button.medium { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
                'button.large { padding-inline-start: var(--_padding-inline-start); padding-inline-end: var(--_padding-inline-end); padding-block-start: var(--_padding-block-start); padding-block-end: var(--_padding-block-end); }',
            ],
        ],
    ]

    /**
     * 紅隊（redMapping）：跨 at-rule 交織的非法組合。expected 為透傳輸出，結果不對即失敗，不看 warn。你需要填寫：
     *   - 內層 @state 的 target 未出現在 selector 即整條透傳（R8 在變體殼內同樣生效）
     *   - @variant 非法名單包裹 @state：外殼不生成，內層按無殼處理（以實現約定為準）
     *   - @when 非 host 條件在 @variant/@state 內：不提升、原樣保留嵌套
     *   註：本塊只測殼交織；聲明內容（var 重寫/expanders/a11y）已移出，不在此填。
     */
    const redMapping: MappingRow = []

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { registry: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

