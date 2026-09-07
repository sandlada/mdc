/**
 * @version 2026.9.7
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @when 宿主条件规格：只测条件 / 外壳提升，不测声明内容。
 * 绿队 = 合法宿主条件必须提升为顶层外壳；红队 = 非法条件必须安全失败（[P] 保留嵌套 / [D] 输出空串）。
 */

import { describe, expect, it } from 'vitest'
import { compileStateSheet } from '../compile-state-sheet'

type MappingRow = ReadonlyArray<readonly [input: string, expected: string | readonly string[]]>

function canonical(css: string | readonly string[]): string {
    // 数组以单空格连接；换行仅统一 \r\n，不折叠中间空白。
    const text = typeof css === 'string' ? css : css.join(' ')
    return text.replace(/\r\n/g, '\n').trim()
}

describe('when', () => {
    /**
     * @when(condition, ...) { body }：condition 须显式包含 :host。
     * W1 显式宿主；W2 深层嵌套提升为顶层外壳并保留祖先路径；W3 提升后零 &；W4 多条件并列单外壳。
     * 条件侧覆盖裸 :host / 用户态伪类 / 结构伪类 / :has-:is-:where / 伪元素 / 属性操作符 / 组合条件；
     * Body 侧覆盖伪类 / :not / 伪元素 / ::slotted / 组合子 / 逗号分支（正交抽样，全矩阵归 @state 侧）。
     */
    const greenMapping: MappingRow = [
        ['@when(:host([checked])) { button {} }', ':host([checked]) { button {} }'],
        ['@when(:host([dense])) { button .label {} }', ':host([dense]) { button .label {} }'],
        ['@when(:host(:not([disabled]))) { button:has(.label) {} }', ':host(:not([disabled])) { button:has(.label) {} }'],
        ['@when(:host(.active)) { .container button {} }', ':host(.active) { .container button {} }'],
        ['@when(:where(:host)) { button {} }', ':where(:host) { button {} }'],
        ['@when(:is(:host([a]), :host([b]))) { button {} }', ':is(:host([a]), :host([b])) { button {} }'],
        ['@when(:host([checked])) { button.active {} }', ':host([checked]) { button.active {} }'],
        // W1 裸 :host
        ['@when(:host) { button {} }', ':host { button {} }'],
        // W1 用户态伪类条件
        ['@when(:host(:hover)) { button {} }', ':host(:hover) { button {} }'],
        ['@when(:host(:focus-visible)) { button {} }', ':host(:focus-visible) { button {} }'],
        ['@when(:host(:active)) { button {} }', ':host(:active) { button {} }'],
        ['@when(:host(:checked)) { button {} }', ':host(:checked) { button {} }'],
        ['@when(:host(:disabled)) { button {} }', ':host(:disabled) { button {} }'],
        ['@when(:host(:focus-within)) { button {} }', ':host(:focus-within) { button {} }'],
        // W1 结构伪类条件
        ['@when(:host(:first-child)) { button {} }', ':host(:first-child) { button {} }'],
        ['@when(:host(:nth-child(2n+1))) { button {} }', ':host(:nth-child(2n+1)) { button {} }'],
        ['@when(:host(:empty)) { button {} }', ':host(:empty) { button {} }'],
        // W1 关系 / 逻辑函数条件
        ['@when(:host(:has(.label))) { button {} }', ':host(:has(.label)) { button {} }'],
        ['@when(:host(:is(:hover, :focus-visible))) { button {} }', ':host(:is(:hover, :focus-visible)) { button {} }'],
        ['@when(:host(:where(.icon, .label))) { button {} }', ':host(:where(.icon, .label)) { button {} }'],
        // W1 伪元素条件
        ['@when(:host(::before)) { button {} }', ':host(::before) { button {} }'],
        ['@when(:host(::after)) { button {} }', ':host(::after) { button {} }'],
        ['@when(:host(::part(label))) { button {} }', ':host(::part(label)) { button {} }'],
        // W1 属性操作符条件
        ['@when(:host([type="submit"])) { button {} }', ':host([type="submit"]) { button {} }'],
        ['@when(:host([v="x" i])) { button {} }', ':host([v="x" i]) { button {} }'],
        // W1 组合条件：类 + 伪类 / 属性 + 伪类 / 双重否定
        ['@when(:host(.active:hover)) { button {} }', ':host(.active:hover) { button {} }'],
        ['@when(:host([dense]:hover)) { button {} }', ':host([dense]:hover) { button {} }'],
        ['@when(:host(:not(.a):not([b]))) { button {} }', ':host(:not(.a):not([b])) { button {} }'],
        // W1 自定义态透传
        ['@when(:host(:state(checked))) { button {} }', ':host(:state(checked)) { button {} }'],
        // W4 多条件
        ['@when(:host([checked]), :host([active])) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(  :host([checked]) ,  :host([active])  ) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host([checked]), :host([active]),) { button {} }', ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host(:hover), :host([checked])) { button {} }', ':host(:hover), :host([checked]) { button {} }'],
        ['@when(:host([a]), :host([b]), :host([c])) { button {} }', ':host([a]), :host([b]), :host([c]) { button {} }'],
        // Body 正交抽样：伪类 / :not / 伪元素 / ::slotted / 组合子 / 逗号分支
        ['@when(:host([checked])) { button:hover {} }', ':host([checked]) { button:hover {} }'],
        ['@when(:host([checked])) { button:focus-visible {} }', ':host([checked]) { button:focus-visible {} }'],
        ['@when(:host([checked])) { button:not(.disabled) {} }', ':host([checked]) { button:not(.disabled) {} }'],
        ['@when(:host([checked])) { button::before {} }', ':host([checked]) { button::before {} }'],
        ['@when(:host([checked])) { button::part(label) {} }', ':host([checked]) { button::part(label) {} }'],
        ['@when(:host([checked])) { button ~ .label {} }', ':host([checked]) { button ~ .label {} }'],
        ['@when(:host([checked])) { button, button .label {} }', ':host([checked]) { button, button .label {} }'],
        ['@when(:host([checked])) { slot::slotted(button) {} }', ':host([checked]) { slot::slotted(button) {} }'],
        // W2 深层提升
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
        // W2 祖先丰富：否定 / 兄弟组合子 / 深层嵌套 / :where(:host) 根合并
        ['.wrapper:not(.hidden) { @when(:host([checked])) { button {} } }', '.wrapper:not(.hidden) {} :host([checked]) { .wrapper:not(.hidden) { button {} } }'],
        ['.wrapper + .sibling { @when(:host([checked])) { button {} } }', '.wrapper + .sibling {} :host([checked]) { .wrapper + .sibling { button {} } }'],
        ['.wrapper { .inner { @when(:host([checked])) { button {} } } }', '.wrapper { .inner {} } :host([checked]) { .wrapper { .inner { button {} } } }'],
        [':where(:host) { .wrapper { @when(:host([checked])) { button {} } } }', ':where(:host) { .wrapper {} } :where(:host([checked])) { .wrapper { button {} } }'],
        // W2 负载为伪类 + 伪元素
        ['.wrapper { @when(:host([checked])) { button:hover::before {} } }', '.wrapper {} :host([checked]) { .wrapper { button:hover::before {} } }'],
        // W3 祖先含 &：提升后零 &（& .inner 正规化为相对形式）
        ['.wrapper { & .inner { @when(:host([checked])) { button {} } } }', '.wrapper { & .inner {} } :host([checked]) { .wrapper { .inner { button {} } } }'],
    ]

    /**
     * 红队：W1 非 host 条件 [D]；空条件 [D]。
     */
    const redMapping: MappingRow = [
        ['.card { @when(.dense) { padding: 4px; } }', '.card { }'],
        ['.card { @when(&.dense) { padding: 4px; } }', '.card { }'],
        ['@when { button {} }', ''],
        ['@when .dense { button {} }', ''],
        ['@when() { button {} }', ''],
        ['@when(   ) { button {} }', ''],
        ['@when(.dense) { button {} }', ''],
        ['@when(:hover) { button {} }', ''],
        ['@when(button:hover) { button {} }', ''],
        ['.card { @when(:hover) { padding: 4px; } }', '.card { }'],
        ['.card { @when(button:hover) { padding: 4px; } }', '.card { }'],
        ['.card { @when(::before) { padding: 4px; } }', '.card { }'],
        ['.card { @when(button::before) { padding: 4px; } }', '.card { }'],
        ['.card { @when(host) { padding: 4px; } }', '.card { }'],
        ['.card { @when(.host) { padding: 4px; } }', '.card { }'],
        ['.card { @when(:HOST) { padding: 4px; } }', '.card { }'],
        ['.card { @when(:hostx) { padding: 4px; } }', '.card { }'],
        ['.card { @when(:hostx([checked])) { padding: 4px; } }', '.card { }'],
        ['@when(:host([checked])) { @when(:host) button.active {} }', ''],
    ]

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
