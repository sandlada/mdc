/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * 提升共用原語規格（hoist-helpers，單元行）：
 *   本文件直接調用純函數，不走編譯器入口。期望須從 H1 / H3 / W2 語義獨立推導，
 *   可用 transform-when.spec.ts 的綠隊行做交叉核對（同一語義在 sheet 層的表現）。
 *   綠隊 = 正常輸入必須按 H1 / H3 / W2 提升，提升不對即失敗；紅隊 = 邊界輸入必須安全失敗（[P] 原樣直出：不合併、不拆分；[D] 丟棄該層：空段 / '&' 本體不產生選擇器）。
 *   雙隊斷言相同：精確相等，不看 warn。
 */

import { describe, expect, it } from 'vitest'
import {
    computeHoistedShell,
    hoistCondition,
    isHostRootSelector,
    wrapWithAncestorPath
} from './hoist-helpers'

describe('isHostRootSelector', () => {
    /**
     * 綠隊：每行 [input, expected]。
     *   判定規則（H1 / W2，嚴格主體）：每逗號分支皆須 `:host` 主體——':host' 本體、
     *   ':host(...)' 複合（`(...)` / `[...]` / `.x` / `:y` / `::z`，無空白與組合子）、
     *   ':where(:host...' / ':is(:host...' 內全員 host 主體。
     *   需要覆寫：':host'、':host([dense])'、':host(.a:hover)'、':where(:host)'、
     *   ':is(:host([a]), :host([b]))'、':where(:host([disabled]), :host(:has(.disabled)))' 為真；
     *   'button'、'.card'、':hostx'、':host .container'、
     *   ':where(:host .container, :host([selected]) button)' 為假。
     * 紅隊：每行 [input, expected]，邊界輸入。
     *   需要覆寫：''（空字串）、' :host'（前導空白，不做 trim 魔法即為假）、
     *   ':HOST'（大小寫敏感即為假）。
     */
    const greenMapping: Array<readonly [input: string, expected: boolean]> = [
        // 為真：':host' 本體、':host(...)' 複合、':where(:host...' / ':is(:host...' 全員主體
        [':host', true],
        [':host([dense])', true],
        [':host(.a:hover)', true],
        [':where(:host)', true],
        [':is(:host([a]), :host([b]))', true],
        [':where(:host([disabled]), :host(:has(.disabled)))', true],
        // 為假：非 host 根、前綴誤匹配、後代掛載
        ['button', false],
        ['.card', false],
        [':hostx', false],
        [':host .container', false],
        [':host([selected]) button', false],
        [':where(:host .container, :host([selected]) button)', false],
        [':where(:host([selected]) button)', false],
    ]

    const redMapping: Array<readonly [input: string, expected: boolean]> = [
        // [P] 邊界輸入：空字串、前導空白（不做 trim 魔法）、大小寫敏感
        ['', false],
        [' :host', false],
        [':HOST', false],
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            expect(isHostRootSelector(input)).toBe(expected)
        })
    }

    for (const [input, expected] of redMapping) {
        it(`red: ${input}`, () => {
            expect(isHostRootSelector(input)).toBe(expected)
        })
    }
})

describe('computeHoistedShell', () => {
    /**
     * 綠隊：每行 [[variantSelector, ancestorPath, condition], [shell, remainingPath]]。
     *   規則（H1 / H3 / W2，三選一，按順序）：
     *   1. variantSelector 非空 → shell = variantSelector 與 condition 括號內合併
     *     （如 ':host([variant="filled"])' + ':host([checked])' → ':host([variant="filled"][checked])'），
     *      remainingPath = ancestorPath 去首元素。
     *   2. 無 variant 且 ancestorPath[0] 為 host 根 → shell = 該根與 condition 合併，
     *      remainingPath = 去首元素。
     *   3. 否則 shell = condition 原樣，remainingPath = 全保留。
     *   需要覆寫三條分支各至少兩行（含 ':where(:host)' 作 ancestorPath[0] 的情形，
     *   合併結果對照 transform-when.spec.ts 綠隊的 ':where(:host([checked]))' 行）。
     * 紅隊：邊界輸入，expected 為按 H1 / H3 / W2 原樣直出的輸出（不合併、不拆分）。
     *   需要覆寫：ancestorPath 為 []（三條分支皆不命中，shell = condition 原樣）；
     *   condition 為多條件並列（', ' 連接保持原樣，不拆分）。
     */
    type Args = readonly [variantSelector: string | undefined, ancestorPath: readonly string[], condition: string]
    type Expected = readonly [shell: string, remainingPath: readonly string[]]

    const greenMapping: Array<readonly [args: Args, expected: Expected]> = [
        // 分支 1：variantSelector 非空 → 與 condition 括號內合併，remaining 去首元素
        [[':host([variant="filled"])', ['.wrapper'], ':host([checked])'], [':host([variant="filled"][checked])', []]],
        [[':host([variant="filled"])', [':where(:host)', '.card'], ':host([checked])'], [':host([variant="filled"][checked])', ['.card']]],
        // 分支 2：無 variant 且 ancestorPath[0] 為 host 根 → 該根與 condition 合併
        [[undefined, [':where(:host)', '.card'], ':host([checked])'], [':where(:host([checked]))', ['.card']]],
        [[undefined, [':host([dense])'], ':host([checked])'], [':host([dense][checked])', []]],
        // 分支 3：否則 shell = condition 原樣，remaining 全保留
        [[undefined, ['.card', '.title'], ':host([checked])'], [':host([checked])', ['.card', '.title']]],
        [[undefined, ['button'], ':where(:host)'], [':where(:host)', ['button']]],
    ]

    const redMapping: Array<readonly [args: Args, expected: Expected]> = [
        // [P] ancestorPath 為空：三條分支皆不命中，shell = condition 原樣
        [[undefined, [], ':host([checked])'], [':host([checked])', []]],
        // [P] 多條件並列：', ' 連接保持原樣，不拆分
        [[undefined, ['.card'], ':host([a]), :host([b])'], [':host([a]), :host([b])', ['.card']]],
    ]

    for (const [args, expected] of greenMapping) {
        it(`green: ${args[2]} in [${args[1].join(' > ')}]`, () => {
            const actual = computeHoistedShell(args[0], args[1], args[2])
            expect(actual.shell).toBe(expected[0])
            expect(actual.remainingPath).toEqual(expected[1])
        })
    }

    for (const [args, expected] of redMapping) {
        it(`red: ${args[2]} in [${args[1].join(' > ')}]`, () => {
            const actual = computeHoistedShell(args[0], args[1], args[2])
            expect(actual.shell).toBe(expected[0])
            expect(actual.remainingPath).toEqual(expected[1])
        })
    }
})

describe('wrapWithAncestorPath', () => {
    /**
     * 綠隊：每行 [[path, content], expected]。
     *   規則（H2 / W3 祖先保留 &）：path 由內向外逐層包裹為規則；相對 '&' 開頭的層予以保留
     *   （'& .inner' 保留為 '& .inner'，'& > .inner' 保留為 '& > .inner'；僅單獨 '&' 本體或空段丟棄該層）；空 path → content 原樣。
     *   需要覆寫：單層、多層嵌套順序（最內層緊貼 content）、相對 '&'（如 '& .inner'、'& > .inner'）保留。
     * 紅隊：邊界輸入。
     *   需要覆寫：path 為 []；path 含 '' 空段（丟棄該層，不產生空選擇器）；
     *   content 為 ''（包裹空內容仍精確輸出，如 '.a {}'，對照 formatRule 語義）。
     */
    const greenMapping: Array<readonly [args: readonly [path: readonly string[], content: string], expected: string]> = [
        // 單層包裹
        [[['.a'], 'button {}'], '.a { button {} }'],
        // 多層：最內層緊貼 content（path[0] 為最外層）
        [[['.outer', '.inner'], 'button {}'], '.outer { .inner { button {} } }'],
        // 相對 '&'（如 '& .inner'、'& > .inner'）予以保留
        [[['& .inner'], 'button {}'], '& .inner { button {} }'],
        [[['& > .inner'], 'button {}'], '& > .inner { button {} }'],
        // 空 path → content 原樣
        [[[], 'button {}'], 'button {}'],
    ]

    const redMapping: Array<readonly [args: readonly [path: readonly string[], content: string], expected: string]> = [
        // [D] 空段丟棄該層，不產生空選擇器
        [[['', '.a'], 'button {}'], '.a { button {} }'],
        // [D] '&' 本體丟棄該層
        [[['&'], 'button {}'], 'button {}'],
        // 空內容仍精確輸出殼形狀
        [[['.a'], ''], '.a {}'],
    ]

    for (const [args, expected] of greenMapping) {
        it(`green: [${args[0].join(' > ')}]`, () => {
            expect(wrapWithAncestorPath(args[0], args[1])).toBe(expected)
        })
    }

    for (const [args, expected] of redMapping) {
        it(`red: [${args[0].join(' > ')}]`, () => {
            expect(wrapWithAncestorPath(args[0], args[1])).toBe(expected)
        })
    }
})

describe('hoistCondition', () => {
    /**
     * 綠隊：每行 [[variantSelector, ancestorPath, condition, content], expected]。
     *   語義 = computeHoistedShell + wrapWithAncestorPath 的端到端組合：
     *   expected 為一條完整頂層規則字串（如 ':host([checked]) { .wrapper { button {} } }'）。
     *   每行須能在 transform-when.spec.ts 找到對應的 sheet 層綠隊行做交叉核對
     *   （把 it 標題記成對應的 input，方便對照）。
     * 紅隊：邊界組合（空 path + 帶 variant 等），expected 精確寫出。
     */
    type Args = readonly [
        variantSelector: string | undefined,
        ancestorPath: readonly string[],
        condition: string,
        content: string
    ]

    const greenMapping: Array<readonly [args: Args, expected: string]> = [
        // 對照 transform-when.spec.ts 綠隊 '.wrapper { @when(:host([checked])) { button {} } }' 行
        [[undefined, ['.wrapper'], ':host([checked])', 'button {}'], ':host([checked]) { .wrapper { button {} } }'],
        // 對照 transform-when.spec.ts 綠隊深層嵌套提升行
        [[undefined, ['.container', 'button'], ':host([checked])', 'color: red;'], ':host([checked]) { .container { button { color: red; } } }'],
        // 對照 transform-when.spec.ts 綠隊 '.wrapper { & .inner { @when(:host([checked])) { button {} } } }' 行（保留 & .inner）
        [[undefined, ['.wrapper', '& .inner'], ':host([checked])', 'button {}'], ':host([checked]) { .wrapper { & .inner { button {} } } }'],
        [[undefined, ['.wrapper', '& > .inner'], ':host([checked])', 'button {}'], ':host([checked]) { .wrapper { & > .inner { button {} } } }'],
    ]

    const redMapping: Array<readonly [args: Args, expected: string]> = [
        // [P] 空 path：shell 原樣，內容直掛殼下
        [[undefined, [], ':host([checked])', 'button {}'], ':host([checked]) { button {} }'],
        // [P] 空 path + 帶 variant：括號內合併後直掛
        [[':host([variant="filled"])', [], ':host([checked])', 'button {}'], ':host([variant="filled"][checked]) { button {} }'],
    ]

    for (const [args, expected] of greenMapping) {
        it(`green: ${args[2]} in [${args[1].join(' > ')}]`, () => {
            expect(hoistCondition(args[0], args[1], args[2], args[3])).toBe(expected)
        })
    }

    for (const [args, expected] of redMapping) {
        it(`red: ${args[2]} in [${args[1].join(' > ')}]`, () => {
            expect(hoistCondition(args[0], args[1], args[2], args[3])).toBe(expected)
        })
    }
})
