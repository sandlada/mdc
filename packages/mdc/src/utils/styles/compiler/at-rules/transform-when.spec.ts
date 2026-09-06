/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @when 宿主條件規格（handleWhenBlock，Selector-focused）：
 *   綠隊 = 合法宿主條件應提升為頂層外殼；紅隊 = 非 host 條件應保留嵌套、不提升。
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

describe('when', () => {
    /**
     * When 語法語義（宿主條件就近書寫、頂層外殼提升）：
     *   when-rule  := "@when" "(" condition ("," condition)* ","? ")" "{" body "}"
     *   condition  := host-selector（必須顯式包含 :host，如 :host([checked])、:where(:host)）
     *   不支援非 host 選擇器：`@when(.dense)` 等純內部選擇器屬無效用法（warn），請使用原生 CSS 巢狀 `&.dense`
     * W1 顯式宿主：條件必須顯式宣告 :host，未包含者發出 warn 或原樣透傳
     * W2 頂層外殼提升（Shell Hoisting）：無論巢狀於多深層的選擇器中，均將 :host 條件提升為最近隔離容器（@layer, @media, @supports, @scope）內部獨立的頂層外殼，內部保留完整上下文路徑
     * W3 零 & 原則（H2）：提升後的頂層 :host 外殼子樹內禁止輸出 &
     * W4 逗號多條件並列：多條件展開為並列頂層外殼（如 :host([a]), :host([b]) { … }）
     */
    const greenMapping: MappingRow = [
        // 基礎頂層 @when
        ['@when(:host([checked])) { button {} }', ':host([checked]) { button {} }'],
        ['@when(:host([dense])) { button .label {} }', ':host([dense]) { button .label {} }'],
        ['@when(:host(:not([disabled]))) { button:has(.label) {} }', ':host(:not([disabled])) { button:has(.label) {} }'],
        ['@when(:host(.active)) { .container button {} }', ':host(.active) { .container button {} }'],
        ['@when(:where(:host)) { button {} }', ':where(:host) { button {} }'],
        ['@when(:is(:host([a]), :host([b]))) { button {} }', ':is(:host([a]), :host([b])) { button {} }'],
        // W4：逗號多條件並列
        ['@when(:host([checked]), :host([active])) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(  :host([checked]) ,  :host([active])  ) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host([checked]), :host([active]),) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        // W2：深層巢狀外殼提升（Shell Hoisting）
        ['.container { button { @when(:host([checked])) { color: red; } } }', '.container { button {} } :host([checked]) { .container { button { color: red; } } }'],
        ['.wrapper { @when(:host([checked])) { button {} } }', '.wrapper {} :host([checked]) { .wrapper { button {} } }'],
        ['.card > .title { @when(:host([dense])) { font-size: 12px; } }', '.card > .title {} :host([dense]) { .card > .title { font-size: 12px; } }'],
        [':host { .wrapper { @when(:host([checked])) { button {} } } }', ':host { .wrapper {} } :host([checked]) { .wrapper { button {} } }'],
        [
            '.container { button { color: blue; @when(:host([checked])) { color: red; } } }',
            '.container { button { color: blue; } } :host([checked]) { .container { button { color: red; } } }'
        ],
        [
            '@layer components { .card { @when(:host([dense])) { padding: 4px; } } }',
            '@layer components { .card {} :host([dense]) { .card { padding: 4px; } } }'
        ],
    ]

    /**
     * 紅隊（redMapping）：@when 非法條件。expected 為透傳輸出，結果不對即失敗，不看 warn。你需要填寫：
     *   - W1 非 host 選擇器：'.card { @when(.dense) { padding: 4px; } }' 應保留嵌套、不提升
     *   - 空條件 '@when() { ... }' / '@when(   ) { ... }' 應透傳
     *   - 未閉合 '@when(:host([checked] { ... }' 應不拋異常且透傳
     */
    const redMapping: MappingRow = []

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet({}, input)
            expect(canonical(output)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            const output = compileStateSheet({}, input)
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

