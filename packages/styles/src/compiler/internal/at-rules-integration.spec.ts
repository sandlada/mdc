/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * 跨 at-rule 殼交織規格（@variant × @state × @when，Selector-focused，fake 層）：
 *   只測殼交織；聲明內容（var 重寫 / expanders / a11y）不在此測（歸 at-rules-sheet.spec.ts）。
 *   直調 transformStatements + fake ctx（fakeBaseCtx / fakeMeta / fakeTables），
 *   不依賴 compileStateSheet 與真實 defineSchema / createStyleDefinition / with* 實現。
 *   上游真實實現變更時，只有 at-rules-sheet.spec.ts 變紅。
 *   綠隊 = 合法交織必須正確嵌套展開，展開不對即失敗；紅隊 = 非法一律 [D] 丟棄為空
 *   （@when 非 host 掛載不透傳；@state 體內非法 @when 只跳過該條，保留 @state 展開）。
 *   雙隊斷言相同：精確相等（最小 canonicalization），不看 warn。
 */

import { describe, expect, it } from 'vitest'
import type { StateDimensionItem } from '../rewrite-state-variables'
import { parseStatements, transformStatements } from './at-rules-transformer'
import {
    fakeBaseCtx,
    fakeMeta,
    fakeTables
} from './spec-fakes'

type MappingRow = ReadonlyArray<readonly [input: string, expected: string]>

function canonical(css: string): string {
    return css.replace(/\r\n/g, '\n').trim()
}

const sizeStates: readonly StateDimensionItem[] = [
    { name: 'small', modifier: '.small', target: 'self' },
    { name: 'medium', modifier: '.medium', target: 'self' },
    { name: 'large', modifier: '.large', target: 'self' }
]

const fakeCtx = () => fakeBaseCtx({
    states: sizeStates,
    isCombo: false,
    tables: fakeTables({}, {
        'filled': ':host([variant="filled"])',
        'tonal': ':host([variant="tonal"])',
        'outlined': ':host([variant="outlined"])'
    }),
    meta: fakeMeta(['filled', 'tonal', 'outlined']),
    ancestorPath: []
})

function runFakeSheet(input: string): string {
    const stmts = parseStatements(input)
    const res = transformStatements(stmts, fakeCtx())
    return canonical([...res.baseRules, ...res.hoistedRules].join(' '))
}

describe('Intergration', () => {
    /**
     * 跨 At-Rule 整合規格（Intergration，fake 層）：
     *   只測殼交織（@variant × @state × @when），I5–I7（a11y / expanders）與
     *   token 重寫 / 發射規則歸 at-rules-sheet.spec.ts（真實 compileStateSheet）。
     *
     * I1: @variant + @state
     *   - 變體外殼包裹狀態目標，狀態按 R2 在內層展開；多態時笛卡爾展開
     * I2: @variant + @when
     *   - 變體外殼保持純粹，宿主條件轉 `&` 相對層向內嵌套（BUG-12：剩餘 host 祖先同轉 `&` 層，消滅嵌套 `:host`）
     * I3: @when + @state
     *   - 雙向協同：外層 @when 包裹 @state，或 @state 內就近定義 @when 提升至頂層，狀態展開均保持一致
     * I4: @variant + @state + @when (三者交織)
     *   - 頂層外殼為純變體，when 條件轉 `&` 層，內層元素精確注入 state 狀態
     */
    const greenMapping: MappingRow = [
        // I1: @variant + @state
        ['@variant(filled) { @state(button) button {} }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} }'],
        ['@variant(tonal, outlined) { @state(button) button .label {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@variant(filled) { @state(button) button, button .label {} }', ':host([variant="filled"]) { button.small, button.small .label {} button.medium, button.medium .label {} button.large, button.large .label {} }'],
        ['@variant(tonal, outlined) { @state(button.show[selected]) button.show[selected].foo {} }', ':host([variant="tonal"]), :host([variant="outlined"]) { button.show[selected].small.foo {} button.show[selected].medium.foo {} button.show[selected].large.foo {} }'],

        // I2: @variant + @when
        ['@variant(filled) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]) { &[checked] { button {} } }'],
        ['@variant(filled) { .container { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { .container {} } :host([variant="filled"]) { &[checked] { .container { button {} } } }'],
        ['@variant(filled, tonal) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]), :host([variant="tonal"]) {} :host([variant="filled"]), :host([variant="tonal"]) { &[checked] { button {} } }'],
        ['@variant(filled) { @when(:host(:state(checked))) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]) { &:state(checked) { button {} } }'],
        // I2 BUG-12：@variant 內 host 規則 + @when → 剩餘 host 祖先轉 `&` 層
        ['@variant(filled) { :host([dense]) { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { &[dense] {} } :host([variant="filled"]) { &[checked] { &[dense] { button {} } } }'],

        // I3: @when + @state
        ['@when(:host([checked])) { @state(button) button {} }', ':host([checked]) { button.small {} button.medium {} button.large {} }'],
        ['@when(:host([checked])) { @state(button) button .label {} }', ':host([checked]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.small {} button.medium {} button.large {} :host([dense]) { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } }'],
        ['.wrapper { @state(button) button { @when(:host([dense])) { height: 32px; } } }', '.wrapper { button.small {} button.medium {} button.large {} } :host([dense]) { .wrapper { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } } }'],

        // I4: @variant + @state + @when (三者交織)
        ['@variant(filled) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"]) { &[checked] { button.small { color: red; } button.medium { color: red; } button.large { color: red; } } }'],
        ['@variant(filled, tonal) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"]), :host([variant="tonal"]) { &[checked] { button.small { color: red; } button.medium { color: red; } button.large { color: red; } } }'],

        // 帶 & 前綴 / 祖先包裹保留
        ['@variant(filled) { .wrapper { @state(button) & button {} } }', ':host([variant="filled"]) { .wrapper { & button.small {} & button.medium {} & button.large {} } }'],
        ['@variant(filled) { .wrapper { & .inner { @when(:host([checked])) { button {} } } } }', ':host([variant="filled"]) { .wrapper { & .inner {} } } :host([variant="filled"]) { &[checked] { .wrapper { & .inner { button {} } } } }'],
    ]

    /**
     * 紅隊（redMapping）：跨 at-rule 交織的非法組合，一律 [D]，不看 warn。
     *   - R8 在變體殼內：內層丟棄、外殼留空
     *   - @when 非 host 掛載：整塊丟棄（.container 空殼保留，@when 不透傳）
     *   - :is() / :where() 主體判定：後代掛載整塊丟棄
     *   - @state 體內非法 @when：只跳過該條，@state 展開保留
     *   - 嵌套 @variant / 嵌套 @when：非法整塊丟棄為空 [D]
     */
    const redMapping: MappingRow = [
        // R8 在變體殼內：內層丟棄，外殼留空
        ['@variant(filled) { @state(button) .card {} }', ':host([variant="filled"]) {}'],
        // 非 host 掛載在變體殼內：丟棄該條，.container 空殼保留
        ['@variant(filled) { .container { @when(.dense) { padding: 4px; } } }', ':host([variant="filled"]) { .container {} }'],
        // :is() / :where() 後代掛載：整塊丟棄
        ['@variant(filled) { @when(:where(:host .container)) { button {} } }', ':host([variant="filled"]) {}'],
        ['@variant(filled) { @when(:where(:host .container, :host([selected]) button)) { button {} } }', ':host([variant="filled"]) {}'],
        // @state 體內非法 @when：只跳過該條
        ['@state(button) button { @when(.dense) { color: red; } }', 'button.small {} button.medium {} button.large {}'],
        // 嵌套 @variant / 嵌套 @when：非法整塊丟棄為空 [D]
        ['@variant(filled) { @variant(tonal) { button {} } }', ''],
        ['@when(:host([checked])) { @when(:host([dense])) { button {} } }', ''],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            expect(runFakeSheet(input)).toBe(canonical(expected))
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            expect(runFakeSheet(input)).toBe(canonical(expected))
        })
    }
})
