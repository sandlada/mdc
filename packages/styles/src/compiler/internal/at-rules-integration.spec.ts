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
 *   @state 插入位置遵循 tail-canonical（transform-state.spec.ts 新契約：
 *   修飾符插 compound-pre 尾；長 target 緊貼 target-end 例外）；實作尚未跟進的行已標註。
 *   `:host` 包裝 @state 的兩行自 transform-state.spec.ts 搬移（handler 層直調無法表達）。
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

describe('At Rules Intergration', () => {
    /**
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
        // I1 tail-canonical 取樣（@state 修飾符插 compound-pre 尾；長 target 緊貼 target-end 例外見上一行）：
        ['@variant(filled) { @state(button) button:hover {} }', ':host([variant="filled"]) { button:hover.small {} button:hover.medium {} button:hover.large {} }'],
        ['@variant(filled) { @state(button) button:not(.disabled) {} }', ':host([variant="filled"]) { button:not(.disabled).small {} button:not(.disabled).medium {} button:not(.disabled).large {} }'],
        ['@variant(filled) { @state(button) button[type="button"] {} }', ':host([variant="filled"]) { button[type="button"].small {} button[type="button"].medium {} button[type="button"].large {} }'],

        // I2: @variant + @when
        ['@variant(filled) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]) { &[checked] { button {} } }'],
        ['@variant(filled) { .container { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { .container {} } :host([variant="filled"]) { &[checked] { .container { button {} } } }'],
        ['@variant(filled, tonal) { @when(:host([checked])) { button {} } }', ':host([variant="filled"]), :host([variant="tonal"]) {} :host([variant="filled"]), :host([variant="tonal"]) { &[checked] { button {} } }'],
        ['@variant(filled) { @when(:host(:state(checked))) { button {} } }', ':host([variant="filled"]) {} :host([variant="filled"]) { &:state(checked) { button {} } }'],
        // @variant 內 host 規則 + @when → 剩餘 host 祖先轉 `&` 層
        ['@variant(filled) { :host([dense]) { @when(:host([checked])) { button {} } } }', ':host([variant="filled"]) { &[dense] {} } :host([variant="filled"]) { &[checked] { &[dense] { button {} } } }'],

        // I3: @when + @state
        ['@when(:host([checked])) { @state(button) button {} }', ':host([checked]) { button.small {} button.medium {} button.large {} }'],
        ['@when(:host([checked])) { @state(button) button .label {} }', ':host([checked]) { button.small .label {} button.medium .label {} button.large .label {} }'],
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.small {} button.medium {} button.large {} :host([dense]) { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } }'],
        ['.wrapper { @state(button) button { @when(:host([dense])) { height: 32px; } } }', '.wrapper { button.small {} button.medium {} button.large {} } :host([dense]) { .wrapper { button.small { height: 32px; } button.medium { height: 32px; } button.large { height: 32px; } } }'],
        // I3 tail-canonical 取樣
        ['@when(:host([checked])) { @state(button) button:not(.disabled) {} }', ':host([checked]) { button:not(.disabled).small {} button:not(.disabled).medium {} button:not(.disabled).large {} }'],
        ['@state(button) button:hover { @when(:host([dense])) { height: 32px; } }', 'button:hover.small {} button:hover.medium {} button:hover.large {} :host([dense]) { button:hover.small { height: 32px; } button:hover.medium { height: 32px; } button:hover.large { height: 32px; } }'],

        // I4: @variant + @state + @when (三者交織)
        ['@variant(filled) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"]) { &[checked] { button.small { color: red; } button.medium { color: red; } button.large { color: red; } } }'],
        ['@variant(filled, tonal) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]), :host([variant="tonal"]) { button.small {} button.medium {} button.large {} } :host([variant="filled"]), :host([variant="tonal"]) { &[checked] { button.small { color: red; } button.medium { color: red; } button.large { color: red; } } }'],
        // I4 tail-canonical 取樣
        ['@variant(filled) { @state(button) button:hover { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button:hover.small {} button:hover.medium {} button:hover.large {} } :host([variant="filled"]) { &[checked] { button:hover.small { color: red; } button:hover.medium { color: red; } button:hover.large { color: red; } } }'],

        // @layer 隔離容器 + @when：@layer 不進入 ancestorPath，提升殼留在層內
        ['@layer components { .card { @when(:host([dense])) { padding: 4px; } } }', '@layer components { .card {} :host([dense]) { .card { padding: 4px; } } }'],
        // @layer 隔離容器 + @variant：提升到最近 @layer 級別，不逃到頂層
        ['@layer components { @variant(filled) { button {} } }', '@layer components { :host([variant="filled"]) { button {} } }'],
        ['@layer components { @variant(filled) { @when(:host([checked])) { button {} } } }', '@layer components { :host([variant="filled"]) {} :host([variant="filled"]) { &[checked] { button {} } } }'],

        // :host 包裝 @state（自 transform-state.spec.ts 搬移：handler 層直調無法表達，歸 sheet 層）
        [':host { @state(.btn) .btn {} }', ':host { .btn.small {} .btn.medium {} .btn.large {} }'],

        // 帶 & 前綴 / 祖先包裹保留
        ['@variant(filled) { .wrapper { @state(button) & button {} } }', ':host([variant="filled"]) { .wrapper { & button.small {} & button.medium {} & button.large {} } }'],
        ['@variant(filled) { .wrapper { & .inner { @when(:host([checked])) { button {} } } } }', ':host([variant="filled"]) { .wrapper { & .inner {} } } :host([variant="filled"]) { &[checked] { .wrapper { & .inner { button {} } } } }'],
    ]

    const redMapping: MappingRow = [
        // 在變體殼內：內層丟棄，外殼留空
        ['@variant(filled) { @state(button) .card {} }', ':host([variant="filled"]) {}'],
        // 在變體殼內（新選擇器形態取樣）：偽類分支同樣零匹配丟棄
        ['@variant(filled) { @state(button) .card:hover {} }', ':host([variant="filled"]) {}'],
        // 內層丟棄，外殼留空
        [':host { @state(:host) .btn {} }', ':host {}'],
        // 非 host 掛載在變體殼內：丟棄該條，.container 空殼保留
        ['@variant(filled) { .container { @when(.dense) { padding: 4px; } } }', ':host([variant="filled"]) { .container {} }'],
        // when :is() / :where() 後代掛載：when整塊丟棄
        ['@variant(filled) { @when(:where(:host .container)) { button {} } }', ':host([variant="filled"]) {}'],
        ['@variant(filled) { @when(:where(:host .container, :host([selected]) button)) { button {} } }', ':host([variant="filled"]) {}'],
        // @state 體內非法 @when：只跳過該條
        ['@state(button) button { @when(.dense) { color: red; } }', 'button.small {} button.medium {} button.large {}'],
        // 嵌套 @variant / 嵌套 @when：非法整塊丟棄為空
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
