/**
 * @version
 * 2026.9.9
 *
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `@variant(VARIANTNAME) { CSS BODY }`
 * - `@variant` 總是提升到頂層作用域 (會考慮@layer層級, 如果存在@layer, 總是提升到最近的@layer級別).
 * - `@variant` 遇到無效HOSTSELECTOR時總是輸出空白.
 * - `@variant` 不會修改其它選擇器.
 * - `@variant` 不會和其它選擇器合并.
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

    const greenMapping: HandlerMapping = [
        // 单名：三类挂载
        ['@variant(fill)', 'color: red;', '.container.fill { color: red }'],
        ['@variant(tonal)', 'button .label { color: red; }', ':host(.tonal) { button .label { color: red; } }'],
        ['@variant(outlined)', 'button:has(.label) { color: red; }', ':host([variant="outlined"]) { button:has(.label) { color: red; } }'],
        // 多名：混合壳并列
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

    const redMapping: HandlerMapping = [
        ['@variant()', 'color: red;', ''],
        ['@variant', 'color: red;', ''],
        ['@variant fill', 'color: red;', ''],
        ['@variant [fill]', 'color: red;', ''],
        ['@variant[fill]', 'color: red;', ''],
        ['@variant(*)', 'color: red;', ''],
        ['@variant(!tonal)', 'color: red;', ''],
        ['@variant(!)', 'color: red;', ''],
        ['@variant(*, fill)', 'color: red;', ''],
        ['@variant(fill, *)', 'color: red;', ''],
        ['@variant(**)', 'color: red;', ''],
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
