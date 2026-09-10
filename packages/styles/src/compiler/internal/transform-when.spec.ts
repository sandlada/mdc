/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @when 宿主条件规格（handler 单元层）：直调 handleWhenBlock，只测条件 / 外壳提升，
 * 不测声明内容，不依赖 compileStateSheet。
 */

import { describe, expect, it } from 'vitest'
import {
    canonicalHandlerResult,
    echoRecurse,
    fakeBaseCtx
} from './spec-fakes'
import { handleWhenBlock } from './transform-when'

type WhenRow = readonly [header: string, body: string, ancestors: readonly string[], expected: string]

type WhenMapping = ReadonlyArray<WhenRow>

describe('when', () => {
    /**
     * @when(condition, ...) { body }：condition 须挂载在 :host 选择器上（:host 为主体），
     * 非 host 挂载一律 [D] 输出空串。:is() / :where() 内各分支须全员 host 主体。
     * W1 显式宿主；W2 深层嵌套提升为顶层外壳并保留祖先路径；W3 祖先包裹保留相對 &（如 & .inner、& > .inner 保留，單獨 & 本體丟棄）；W4 多条件并列单外壳；W5 嵌套 @when 非法丢弃 [D]。
     */
    const greenMapping: WhenMapping = [
        ['@when(:host([checked]))', 'button {}', [], ':host([checked]) { button {} }'],
        ['@when(:host([dense]))', 'button .label {}', [], ':host([dense]) { button .label {} }'],
        ['@when(:host(:not([disabled])))', 'button:has(.label) {}', [], ':host(:not([disabled])) { button:has(.label) {} }'],
        ['@when(:host(.active))', '.container button {}', [], ':host(.active) { .container button {} }'],
        ['@when(:where(:host))', 'button {}', [], ':where(:host) { button {} }'],
        ['@when(:is(:host([a]), :host([b])))', 'button {}', [], ':is(:host([a]), :host([b])) { button {} }'],
        ['@when(:where(:host([disabled]), :host(:has(.disabled))))', 'button {}', [], ':where(:host([disabled]), :host(:has(.disabled))) { button {} }'],
        ['@when(:host([checked]))', 'button.active {}', [], ':host([checked]) { button.active {} }'],
        // W1 裸 :host
        ['@when(:host)', 'button {}', [], ':host { button {} }'],
        // W1 用户态伪类条件
        ['@when(:host(:hover))', 'button {}', [], ':host(:hover) { button {} }'],
        ['@when(:host(:focus-visible))', 'button {}', [], ':host(:focus-visible) { button {} }'],
        ['@when(:host(:active))', 'button {}', [], ':host(:active) { button {} }'],
        ['@when(:host(:checked))', 'button {}', [], ':host(:checked) { button {} }'],
        ['@when(:host(:disabled))', 'button {}', [], ':host(:disabled) { button {} }'],
        ['@when(:host(:focus-within))', 'button {}', [], ':host(:focus-within) { button {} }'],
        // W1 结构伪类条件
        ['@when(:host(:first-child))', 'button {}', [], ':host(:first-child) { button {} }'],
        ['@when(:host(:nth-child(2n+1)))', 'button {}', [], ':host(:nth-child(2n+1)) { button {} }'],
        ['@when(:host(:empty))', 'button {}', [], ':host(:empty) { button {} }'],
        // W1 关系 / 逻辑函数条件
        ['@when(:host(:has(.label)))', 'button {}', [], ':host(:has(.label)) { button {} }'],
        ['@when(:host(:is(:hover, :focus-visible)))', 'button {}', [], ':host(:is(:hover, :focus-visible)) { button {} }'],
        ['@when(:host(:where(.icon, .label)))', 'button {}', [], ':host(:where(.icon, .label)) { button {} }'],
        // W1 伪元素条件
        ['@when(:host(::before))', 'button {}', [], ':host(::before) { button {} }'],
        ['@when(:host(::after))', 'button {}', [], ':host(::after) { button {} }'],
        ['@when(:host(::part(label)))', 'button {}', [], ':host(::part(label)) { button {} }'],
        // W1 属性操作符条件
        ['@when(:host([type="submit"]))', 'button {}', [], ':host([type="submit"]) { button {} }'],
        ['@when(:host([v="x" i]))', 'button {}', [], ':host([v="x" i]) { button {} }'],
        // W1 组合条件：类 + 伪类 / 属性 + 伪类 / 双重否定
        ['@when(:host(.active:hover))', 'button {}', [], ':host(.active:hover) { button {} }'],
        ['@when(:host([dense]:hover))', 'button {}', [], ':host([dense]:hover) { button {} }'],
        ['@when(:host(:not(.a):not([b])))', 'button {}', [], ':host(:not(.a):not([b])) { button {} }'],
        // W1 自定义态透传
        ['@when(:host(:state(checked)))', 'button {}', [], ':host(:state(checked)) { button {} }'],
        ['@when(:host(:state(checked)))', 'color: red;', ['.container', 'button'], ':host(:state(checked)) { .container { button { color: red } } }'],
        // W4 多条件
        ['@when(:host([checked]), :host([active]))', 'button {}', [], ':host([checked]), :host([active]) { button {} }'],
        ['@when(  :host([checked]) ,  :host([active])  )', 'button {}', [], ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host([checked]), :host([active]),)', 'button {}', [], ':host([checked]), :host([active]) { button {} }'],
        ['@when(:host(:hover), :host([checked]))', 'button {}', [], ':host(:hover), :host([checked]) { button {} }'],
        ['@when(:host([a]), :host([b]), :host([c]))', 'button {}', [], ':host([a]), :host([b]), :host([c]) { button {} }'],
        // Body 正交抽样：伪类 / :not / 伪元素 / ::slotted / 组合子 / 逗号分支
        ['@when(:host([checked]))', 'button:hover {}', [], ':host([checked]) { button:hover {} }'],
        ['@when(:host([checked]))', 'button:focus-visible {}', [], ':host([checked]) { button:focus-visible {} }'],
        ['@when(:host([checked]))', 'button:not(.disabled) {}', [], ':host([checked]) { button:not(.disabled) {} }'],
        ['@when(:host([checked]))', 'button::before {}', [], ':host([checked]) { button::before {} }'],
        ['@when(:host([checked]))', 'button::part(label) {}', [], ':host([checked]) { button::part(label) {} }'],
        ['@when(:host([checked]))', 'button ~ .label {}', [], ':host([checked]) { button ~ .label {} }'],
        ['@when(:host([checked]))', 'button, button .label {}', [], ':host([checked]) { button, button .label {} }'],
        ['@when(:host([checked]))', 'slot::slotted(button) {}', [], ':host([checked]) { slot::slotted(button) {} }'],
        // W2 深层提升（祖先经 ctx.ancestorPath 传入）
        ['@when(:host([checked]))', 'color: red;', ['.container', 'button'], ':host([checked]) { .container { button { color: red } } }'],
        ['@when(:host([checked]))', 'button {}', ['.wrapper'], ':host([checked]) { .wrapper { button {} } }'],
        ['@when(:host([dense]))', 'font-size: 12px;', ['.card > .title'], ':host([dense]) { .card > .title { font-size: 12px } }'],
        ['@when(:host([checked]))', 'button {}', [':host', '.wrapper'], ':host([checked]) { .wrapper { button {} } }'],
        ['@when(:host([checked]))', 'button {}', [':where(:host)', '.wrapper'], ':where(:host([checked])) { .wrapper { button {} } }'],
        ['@when(:host([dense]))', 'padding: 4px;', ['@layer components', '.card'], ':host([dense]) { @layer components { .card { padding: 4px } } }'],
        // W2 祖先丰富：否定 / 兄弟组合子 / 深层嵌套
        ['@when(:host([checked]))', 'button {}', ['.wrapper:not(.hidden)'], ':host([checked]) { .wrapper:not(.hidden) { button {} } }'],
        ['@when(:host([checked]))', 'button {}', ['.wrapper + .sibling'], ':host([checked]) { .wrapper + .sibling { button {} } }'],
        ['@when(:host([checked]))', 'button {}', ['.wrapper', '.inner'], ':host([checked]) { .wrapper { .inner { button {} } } }'],
        // W2 负载为伪类 + 伪元素
        ['@when(:host([checked]))', 'button:hover::before {}', ['.wrapper'], ':host([checked]) { .wrapper { button:hover::before {} } }'],
        ['@when(:host([checked]))', 'button {}', ['.wrapper', '& .inner'], ':host([checked]) { .wrapper { & .inner { button {} } } }'],
        ['@when(:host([checked]))', 'button {}', ['.wrapper', '& > .inner'], ':host([checked]) { .wrapper { & > .inner { button {} } } }'],
    ]

    /**
     * 红队：非法表头 [D] 输出空串；非 host 挂载 [D] 输出空串（不透传）。
     * 含 :is() / :where() 主体判定：内部分支须全员 host 主体，出现后代即整块丢弃；
     * 多条件逗号并列任一非法即整块丢弃。
     */
    const redMapping: WhenMapping = [
        ['@when', 'button {}', [], ''],
        ['@when .dense', 'button {}', [], ''],
        ['@when()', 'button {}', [], ''],
        ['@when(   )', 'button {}', [], ''],
        ['@when(.dense)', 'button {}', [], ''],
        ['@when(.dense)', 'padding: 4px;', ['.card'], ''],
        ['@when(&.dense)', 'padding: 4px;', ['.card'], ''],
        ['@when(:hover)', 'button {}', [], ''],
        ['@when(button:hover)', 'button {}', [], ''],
        ['@when(::before)', 'padding: 4px;', ['.card'], ''],
        ['@when(button::before)', 'padding: 4px;', ['.card'], ''],
        ['@when(host)', 'padding: 4px;', ['.card'], ''],
        ['@when(.host)', 'padding: 4px;', ['.card'], ''],
        ['@when(:HOST)', 'padding: 4px;', ['.card'], ''],
        // W5 嵌套 @when 非法丢弃 [D]
        ['@when(:host([checked]))', '@when(:host) button.active {}', [], ''],
        // 非 host 挂载：后代 / 兄弟组合子一律丢弃
        ['@when(:host .container)', 'button {}', [], ''],
        ['@when(:host button)', 'button {}', [], ''],
        ['@when(:host>.container)', 'button {}', [], ''],
        ['@when(:host + .sibling)', 'button {}', [], ''],
        // 前缀误匹配
        ['@when(:hostx)', 'padding: 4px;', ['.card'], ''],
        ['@when(:hostx([checked]))', 'padding: 4px;', ['.card'], ''],
        // :is() / :where() 主体判定
        ['@when(:where(:host .container, :host([selected]) button))', 'button {}', [], ''],
        ['@when(:where(:host([selected]) button))', 'button {}', [], ''],
        ['@when(:is(:host .container))', 'button {}', [], ''],
        // 多条件混入非法分支即整块丢弃
        ['@when(:host([checked]), .dense)', 'button {}', [], ''],
        ['@when(:host([checked]), :host button)', 'button {}', [], ''],
        ['@when(:where(:host([disabled])), .foo)', 'button {}', [], ''],
    ]

    for (const [header, body, ancestors, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const ctx = fakeBaseCtx({ ancestorPath: ancestors })
            const output = handleWhenBlock(header, body, ctx, echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, ancestors, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const ctx = fakeBaseCtx({ ancestorPath: ancestors })
            const output = handleWhenBlock(header, body, ctx, echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }
})
