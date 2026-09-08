/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * @variant 名单规格（handler 单元层）：直调 handleVariantBlock，只测名单 / 外壳，
 * 不测声明内容，不依赖 compileStateSheet 与真实 tables 实现。
 * 挂载选择器由 ctx.tables.variants 给出（fill→容器后代、tonal→host 类、
 * outlined→host 属性）；名单合法 = 变体字典确切 key（大小写敏感）且 tables
 * 有映射，任一缺失即非法。字典成员来自 ctx.meta.allVariantNames。
 * 绿队 = 合法名单必须生成外壳；红队 = 非法名单必须安全失败（[D] 输出空串）。
 * 跨 handler 组装与 token 发射归 at-rules-integration.spec.ts。
 */

import { describe, expect, it } from 'vitest'
import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import {
    canonicalHandlerResult,
    echoRecurse,
    fakeBaseCtx,
    fakeMeta,
    fakeTables,
    type HandlerMapping
} from './spec-fakes'
import { handleVariantBlock } from './transform-variant'

describe('variant', () => {
    const variantCtx: AtRulesCompilerContext = fakeBaseCtx({
        meta: fakeMeta(['fill', 'tonal', 'outlined']),
        tables: fakeTables({}, {
            'fill': '.container.fill',
            'tonal': ':host(.tonal)',
            'outlined': ':host([variant="outlined"])'
        })
    })

    /**
     * @variant(name, ...) { body }：name 须同时为变体字典确切 key 与 tables 已映射名，大小写敏感。
     * V1 单名单壳；V2 多名逗号并壳；V3 body 透传回声，@state 可内嵌原文；V4 嵌套 @variant 非法丢弃 [D]。`*` / `!name` 非法，不收录。
     * 壳形状由 registry 决定，不回退 `:host([variant])` 默认。
     */
    const greenMapping: HandlerMapping = [
        // V1 单名：三类挂载
        ['@variant(fill)', 'color: red;', '.container.fill { color: red }'],
        ['@variant(tonal)', 'button .label { color: red; }', ':host(.tonal) { button .label { color: red; } }'],
        ['@variant(outlined)', 'button:has(.label) { color: red; }', ':host([variant="outlined"]) { button:has(.label) { color: red; } }'],
        // V2 多名：混合壳并列
        ['@variant(fill, tonal)', 'color: red;', '.container.fill, :host(.tonal) { color: red }'],
        ['@variant(fill, tonal, outlined)', 'color: red;', '.container.fill, :host(.tonal), :host([variant="outlined"]) { color: red }'],
        ['@variant(tonal, outlined)', 'button .label { color: red; }', ':host(.tonal), :host([variant="outlined"]) { button .label { color: red; } }'],
        ['@variant(fill, outlined)', 'button[type="submit"] { color: red; }', '.container.fill, :host([variant="outlined"]) { button[type="submit"] { color: red; } }'],
        ['@variant(outlined)', 'button::before { color: red; }', ':host([variant="outlined"]) { button::before { color: red; } }'],
        // 名单宽容空白与尾逗号
        ['@variant(  fill ,  tonal  )', 'color: red;', '.container.fill, :host(.tonal) { color: red }'],
        ['@variant(fill, tonal,)', 'color: red;', '.container.fill, :host(.tonal) { color: red }'],
        // 空 body 恒发射空壳
        ['@variant(tonal)', '', ':host(.tonal) {}'],
    ]

    /**
     * [D]：语法非法、字典缺 key、registry 无映射（任一缺失即整块丢弃）。
    */
    const redMapping: HandlerMapping = [
        ['@variant()', 'color: red;', ''],
        ['@variant', 'color: red;', ''],
        ['@variant fill', 'color: red;', ''],
        ['@variant [fill]', 'color: red;', ''],
        ['@variant[fill]', 'color: red;', ''],
        ['@variant(unknown)', 'color: red;', ''],
        ['@variant(invalid-variant)', 'color: red;', ''],
        ['@variant(:host)', 'color: red;', ''],
        ['@variant(filled)', 'color: red;', ''],
        ['@variant(Fill)', 'color: red;', ''],
        ['@variant(fill)', '@variant(tonal) { color: red; }', ''],
    ]

    for (const [header, body, expected] of greenMapping) {
        it(`green: ${header} { ${body} }`, () => {
            const output = handleVariantBlock(header, body, variantCtx, echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    for (const [header, body, expected] of redMapping) {
        it(`red: ${header} { ${body} }`, () => {
            const output = handleVariantBlock(header, body, variantCtx, echoRecurse)
            expect(canonicalHandlerResult(output)).toBe(expected)
        })
    }

    it('red: Defs 有但 tables 无映射 → [D]', () => {
        const partialCtx = fakeBaseCtx({
            meta: fakeMeta(['fill', 'tonal', 'outlined']),
            tables: fakeTables({}, { 'fill': '.container.fill' })
        })
        const output = handleVariantBlock('@variant(tonal)', 'color: red;', partialCtx, echoRecurse)
        expect(canonicalHandlerResult(output)).toBe('')
    })

    it('red: tables 有但 Defs 无 key → [D]', () => {
        const extraCtx = fakeBaseCtx({
            meta: fakeMeta(['fill', 'tonal', 'outlined']),
            tables: fakeTables({}, {
                'fill': '.container.fill',
                'tonal': ':host(.tonal)',
                'outlined': ':host([variant="outlined"])',
                'unknown': '.container.unknown'
            })
        })
        const output = handleVariantBlock('@variant(unknown)', 'color: red;', extraCtx, echoRecurse)
        expect(canonicalHandlerResult(output)).toBe('')
    })

    it('red: 缺 tables 映射视同无处挂载 → [D]', () => {
        const bareCtx = fakeBaseCtx({ meta: fakeMeta(['fill', 'tonal', 'outlined']) })
        const output = handleVariantBlock('@variant(fill)', 'color: red;', bareCtx, echoRecurse)
        expect(canonicalHandlerResult(output)).toBe('')
    })

    it('green: 缺 meta 时跳过字典校验 → 正常发射', () => {
        const noMetaCtx = fakeBaseCtx({
            tables: fakeTables({}, { 'fill': '.container.fill' })
        })
        const output = handleVariantBlock('@variant(fill)', 'color: red;', noMetaCtx, echoRecurse)
        expect(canonicalHandlerResult(output)).toBe('.container.fill { color: red }')
    })
})
