/**
 * @version 2026.9.9
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Mapping-format suite: every row is `[input, expected, opts?]` where `opts`
 * selects the fixture/entry and any warning or containment assertions.
 * Row order follows the original Issue 1–17 grouping (kept as comments).
 */

import { describe, it, expect } from 'vitest'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { emptyTables, withState, withVariant } from '../triggers/tables'
import { flow } from '../pipe'
import {
    compileAtRulesSheet,
    expandDeclaration,
    splitCssValues,
    replaceTargetInBranch,
    removeAmpersandForHostSubtree,
    rewriteStateVariables,
    compileStateSheet,
    extractStateTokenMetadata,
    type StyleDiagnosticWarning
} from './index'

function normalizeCss(css: string | readonly string[]): string {
    const text: string = typeof css === 'string' ? css : css.join(' ')
    return text
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\{\s+/g, '{ ')
        .replace(/\s+\}/g, ' }')
        .replace(/\{\s*\}/g, '{}')
        .replace(/;\s*\}/g, '; }')
        .trim()
}

const ComboSchema = defineSchema([['medium', 'large'], ['enabled', 'disabled']] as const)
const ComboDef = createStyleDefinition(ComboSchema)({
    'size': { 'medium': '12px', 'large': '16px' },
    'opacity': { 'enabled': '1', 'disabled': '0.38' }
})
const ComboTriggers = withState({
    'medium': '.medium',
    'large': '.large',
    'enabled': '',
    'disabled': '[disabled]'
})(emptyTables)

const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
const SizeDef = createStyleDefinition(SizeSchema)({ 'size': [12, 14, 16] })
const SizeTriggers = withState({
    'small': '.small',
    'medium': '.medium',
    'large': '.large'
})(emptyTables)

const TwoStateSchema = defineSchema(['small', 'medium'] as const)
const TwoStateDef = createStyleDefinition(TwoStateSchema)({ 'size': [12, 14] })
const TwoStateTriggers = withState({ 'small': '.small', 'medium': '.medium' })(emptyTables)

const LargeComboSchema = defineSchema([
    ['d1a', 'd1b', 'd1c'],
    ['d2a', 'd2b', 'd2c'],
    ['d3a', 'd3b', 'd3c'],
    ['d4a', 'd4b', 'd4c'],
    ['d5a', 'd5b', 'd5c']
] as const)
const LargeComboDef = createStyleDefinition(LargeComboSchema)({
    'size': { 'd1a': 10, 'd1b': 12, 'd1c': 14 }
})

type WarnExpect = string | { type: string; count?: number; min?: number }

interface SheetOpts {
    readonly fixture?: 'combo' | 'size' | 'size-variant' | 'two-state' | 'large-combo'
    readonly entry?: 'atrules'
    readonly warn?: WarnExpect
    readonly absent?: string | readonly string[]
    readonly present?: string | readonly string[]
}

type SheetRow = readonly [input: string, expected: string | readonly string[] | null, opts?: SheetOpts]

const SizeVariantTables = flow(
    withState({
        'small': '.small',
        'medium': '.medium',
        'large': '.large'
    }),
    withVariant({
        'filled': ':host([variant="filled"])',
        'tonal': ':host([variant="tonal"])',
        'outlined': ':host([variant="outlined"])'
    })
)(emptyTables)

const fixtures = {
    'combo': { def: ComboDef, tables: ComboTriggers },
    'size': { def: SizeDef, tables: SizeTriggers },
    'size-variant': { def: SizeDef, tables: SizeVariantTables },
    'two-state': { def: TwoStateDef, tables: TwoStateTriggers },
    'large-combo': { def: LargeComboDef, tables: emptyTables }
} as const

function runSheetRow([input, expected, opts]: SheetRow): void {
    const warnings: StyleDiagnosticWarning[] = []
    const onWarn = (w: StyleDiagnosticWarning): void => {
        warnings.push(w)
    }
    const fixture = opts?.fixture !== undefined ? fixtures[opts.fixture] : undefined
    const def = fixture?.def ?? {}
    const options = { tables: fixture?.tables ?? emptyTables, onWarn }
    const output = opts?.entry === 'atrules'
        ? compileAtRulesSheet(def, input, options)
        : compileStateSheet(def, input, options)

    if (expected !== null) {
        expect(normalizeCss(output)).toBe(normalizeCss(expected))
    }
    if (opts?.present !== undefined) {
        const present = Array.isArray(opts.present) ? opts.present : [opts.present]
        for (const snippet of present) {
            expect(normalizeCss(output)).toContain(normalizeCss(snippet))
        }
    }
    if (opts?.absent !== undefined) {
        const absent = Array.isArray(opts.absent) ? opts.absent : [opts.absent]
        for (const snippet of absent) {
            expect(output).not.toContain(snippet)
        }
    }
    if (opts?.warn !== undefined) {
        const type = typeof opts.warn === 'string' ? opts.warn : opts.warn.type
        const count = typeof opts.warn === 'string' ? undefined : opts.warn.count
        const min = typeof opts.warn === 'string' ? undefined : opts.warn.min
        expect(warnings.some((w) => w.type === type)).toBe(true)
        if (count !== undefined) {
            expect(warnings.length).toBe(count)
        }
        if (min !== undefined) {
            expect(warnings.length).toBeGreaterThanOrEqual(min)
        }
    }
}

describe('at-rules-compiler — Adversarial Reviewer Verification Suite', () => {
    const sheetRows: SheetRow[] = [
        // Issue 1: Outer :host attributes/modifiers preservation when hoisting @when
        [':host([dense]) { .wrapper { @when(:host([checked])) { button { color: red; } } } }', ':host([dense]) { .wrapper {} } :host([dense][checked]) { .wrapper { button { color: red; } } }'],
        [':where(:host) { .card { @when(:host([checked])) { padding: 8px; } } }', ':where(:host) { .card {} } :where(:host([checked])) { .card { padding: 8px; } }'],
        [':host([dense]) { .card { @when(:host([a]), :host([b])) { padding: 4px; } } }', ':host([dense]) { .card {} } :host([dense][a]), :host([dense][b]) { .card { padding: 4px; } }'],
        // Issue 2: Combo state matrix in nested @when inside @state
        ['@state(button) button { @when(:host([dense])) { height: 32px; } }', 'button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} :host([dense]) { button.medium { height: 32px; } button.medium[disabled] { height: 32px; } button.large { height: 32px; } button.large[disabled] { height: 32px; } }', { fixture: 'combo' }],
        [':host([variant="filled"]) { @state(button) button { @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.medium {} button.medium[disabled] {} button.large {} button.large[disabled] {} } :host([variant="filled"][checked]) { button.medium { color: red; } button.medium[disabled] { color: red; } button.large { color: red; } button.large[disabled] { color: red; } }', { fixture: 'combo' }],
        // Issue 3: Rule R8 failure when target does not match non-& selector (drop + warning).
        // 規格變更注記：R8 由透傳改為丟棄（零匹配即丟棄整塊），故期望由 '.card { color: red; }' 同步修正為 ''（只修代碼原則之例外）。
        ['@state(button) .card { color: red; }', '', { fixture: 'size', entry: 'atrules', warn: { type: 'invalid-state-target', count: 1 } }],
        // BUG-01 A4: `:hostx` 前綴誤匹配 → R8 零匹配丟棄 + 單一 warn（host-like 短路，不誤展）。
        ['@state(:hostx) :hostx { color: red; }', '', { entry: 'atrules', warn: { type: 'invalid-state-target', count: 1 } }],
        // BUG-02 B3: `//` 在表頭不再是註解 → target 變髒字串觸發 R8（修復前會被剝成 `button` 而誤展）。
        ['@state(button // x) button { color: red; }', '', { entry: 'atrules', warn: { type: 'invalid-state-target', count: 1 } }],
        // Issue 3: R7 — retain & when followed by whitespace and an element
        ['.wrapper { @state(button) & button {} }', '.wrapper { & button.small {} & button.medium {} & button.large {} }', { fixture: 'size' }],
        // Issue 5: Non-host conditions in @when (Rule W1) — warning, discarded.
        // 規格變更注記：W1 由保留嵌套（[P]）改為丟棄整塊（[D]，非 host 掛載一律 ''），故期望由
        // '.card { .dense { padding: 4px; } }' 同步修正為 '.card {}'（只修代碼原則之例外）。
        ['.card { @when(.dense) { padding: 4px; } }', '.card {}', { entry: 'atrules', warn: { type: 'invalid-when-condition', count: 1 }, absent: '.dense { padding' }],
        // BUG-06 D1: 非 host 條件 + 嵌套 @when 並存 → host 先驗，報 `invalid-when-condition`（不再被 `nested-when` 搶先）。
        ['.card { @when(.dense) { @when(:host([checked])) { button { color: red; } } } }', '.card {}', { entry: 'atrules', warn: { type: 'invalid-when-condition', count: 1 } }],
        // BUG-06 D2: @state 內嵌同形輸入與 transform-when 一致（跨 handler 一致性）。
        ['@state(button) button { @when(.dense) { @when(:host([checked])) { height: 10px; } } }', 'button.small {} button.medium {} button.large {}', { fixture: 'size', entry: 'atrules', warn: { type: 'invalid-when-condition', count: 1 } }],
        // Issue 6: empty/malformed @variant — warning, no empty-shell output
        ['@variant() { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-variant', min: 1 }, absent: ' {}' }],
        // Issue 6: wildcards and negations in @variant
        // 規格變更注記（BUG-05）：通配 / 否定 warn 收斂為單一 `invalid-variant-name`
        //（實現直接返回，不再落入字典查找二次 warn），故斷言由存在性收緊為 `count: 1`。
        ['@variant(*, !tonal) { button { color: red; } }', null, { entry: 'atrules', warn: { type: 'invalid-variant-name', count: 1 } }],
        // BUG-05 C3: `!` 單獨成案同樣單一 warn。
        ['@variant(!tonal) { button { color: red; } }', null, { entry: 'atrules', warn: { type: 'invalid-variant-name', count: 1 } }],
        // Issue 6: nested @variant is illegal (Rule V4) — discard [D] with warning
        ['@variant(filled) { @variant(tonal) { button { color: red; } } }', '', { entry: 'atrules', fixture: 'size-variant', warn: 'nested-variant' }],
        // Issue 7: Retain relative & in hoisted :host subtrees (Rule H2 & W3)
        ['.wrapper { & .inner { @when(:host([checked])) { color: red; } } }', '.wrapper { & .inner {} } :host([checked]) { .wrapper { & .inner { color: red; } } }'],
        // Issue 10: isolation containers preserve outer ancestor context during hoisting
        ['.card { @reduced-motion { @when(:host([dense])) { padding: 4px; } } }', '.card { @media (prefers-reduced-motion: reduce) { :host([dense]) { .card { padding: 4px; } } } }'],
        // Issue 11: invalid @contrast arguments
        ['.card { @contrast(invalid) { color: black; } }', null, { entry: 'atrules', warn: 'invalid-a11y-macro' }],
        // Issue 11: excessive state nesting depth >= 3
        ['@state(button) button { @state(button) button { @state(button) button { @state(button) button { color: red; } } } }', null, { entry: 'atrules', fixture: 'two-state', warn: 'excessive-state-nesting' }],
        // Issue 11: explosive Cartesian combinations exceeding threshold
        ['@state(button) button { color: red; }', null, { entry: 'atrules', fixture: 'large-combo', warn: 'explosive-cartesian-matrix' }],
        // Issue 13: compileStateSheet routes to compileAtRulesSheet even with options.onWarn
        ['.card { @when(:host([dense])) { padding: 4px; } }', '.card {} :host([dense]) { .card { padding: 4px; } }'],
        ['button { shape: 8px 16px; }', 'button { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; }'],
        // BUG-02 B1: `url(https://…)` 端到端原文保留（`//` 不再是行註解）。
        ['button { background: url(https://example.com/x.css); }', 'button { background: url(https://example.com/x.css); }'],
        ['button { @reduced-motion { transition: none; } }', 'button { @media (prefers-reduced-motion: reduce) { transition: none; } }'],
        // Issue 13: invalid-when-condition warning through compileStateSheet entrypoint
        // 規格變更注記：同 Issue 5，W1 改為 [D]，期望同步修正為 '.card {}'。
        ['.card { @when(.dense) { padding: 4px; } }', '.card {}', { warn: { type: 'invalid-when-condition', count: 1 } }],
        // Issue 15: empty @when() condition list validation
        ['@when() { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-when', count: 1 }, absent: ['{} {', ' {}'] }],
        // BUG-06 D3: 完整優先鏈 syntax > host > nesting——語法錯搶先於一切（本次調序未動此層）。
        ['@when() { @when(:host([checked])) { button { color: red; } } }', null, { entry: 'atrules', warn: { type: 'invalid-when', count: 1 } }],
        ['@when(   ) { button { color: blue; } }', null, { entry: 'atrules', warn: { type: 'invalid-when', count: 1 } }],
        // Issue 15: nested @when is illegal (Rule W5) — discard [D] with warning
        ['@when(:host([checked])) { @when(:host([dense])) { button { color: red; } } }', '', { entry: 'atrules', warn: 'nested-when' }],
        // Issue 16: malformed @state syntax validation (Rule R1)
        ['@state(button) { color: red; }', null, { entry: 'atrules', warn: 'invalid-state-syntax' }],
        ['@state() button { color: red; }', null, { entry: 'atrules', warn: 'invalid-state-syntax' }],
        // Issue 17: deep multi-rule integration composing @variant, @state, @when, and property expanders
        ['@variant(filled) { @state(button) button { shape: 8px 16px; @when(:host([checked])) { color: red; } } }', ':host([variant="filled"]) { button.small { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.medium { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } button.large { border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px; } } :host([variant="filled"]) { &[checked] { button.small { color: red; } button.medium { color: red; } button.large { color: red; } } }', { fixture: 'size-variant' }],
        // Issue 18: state variable rewriting in @state blocks for multi-state tokens
        ['@state(button) button { height: var(--_size); }', 'button.small { height: var(--_small-size); } button.medium { height: var(--_medium-size); } button.large { height: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button { height: var(--_size, 16px); }', 'button.small { height: var(--_small-size, 16px); } button.medium { height: var(--_medium-size, 16px); } button.large { height: var(--_large-size, 16px); }', { fixture: 'size' }],
        ['@state(button) button { min-width: calc(var(--_size) * 2); }', 'button.small { min-width: calc(var(--_small-size) * 2); } button.medium { min-width: calc(var(--_medium-size) * 2); } button.large { min-width: calc(var(--_large-size) * 2); }', { fixture: 'size' }],
        ['@state(button) button::before { width: var(--_size); }', 'button.small::before { width: var(--_small-size); } button.medium::before { width: var(--_medium-size); } button.large::before { width: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button, button .icon { width: var(--_size); }', 'button.small, button.small .icon { width: var(--_small-size); } button.medium, button.medium .icon { width: var(--_medium-size); } button.large, button.large .icon { width: var(--_large-size); }', { fixture: 'size' }],
        ['@state(button) button { height: var(--_size); opacity: var(--_opacity); }', 'button.medium { height: var(--_medium-size); opacity: var(--_enabled-opacity); } button.medium[disabled] { height: var(--_medium-size); opacity: var(--_disabled-opacity); } button.large { height: var(--_large-size); opacity: var(--_enabled-opacity); } button.large[disabled] { height: var(--_large-size); opacity: var(--_disabled-opacity); }', { fixture: 'combo' }],
        ['@state(button) button { @when(:host([checked])) { height: var(--_size); } }', 'button.small {} button.medium {} button.large {} :host([checked]) { button.small { height: var(--_small-size); } button.medium { height: var(--_medium-size); } button.large { height: var(--_large-size); } }', { fixture: 'size' }],
    ]

    for (const row of sheetRows) {
        it(row[0], () => {
            runSheetRow(row)
        })
    }

    // Issue 4 + Issue 9: expandDeclaration — rows are [[prop, value], expanded]
    const declRows: Array<[[string, string], string]> = [
        // Issue 4: CSS custom properties without --_ and whitespace
        [['shape', 'var( --mdc-shape )'], 'border-start-start-radius: var(--mdc-shape-start-start); border-start-end-radius: var(--mdc-shape-start-end); border-end-end-radius: var(--mdc-shape-end-end); border-end-start-radius: var(--mdc-shape-end-start);'],
        [['padding', 'var(--mdc-padding)'], 'padding-inline-start: var(--mdc-padding-inline-start); padding-inline-end: var(--mdc-padding-inline-end); padding-block-start: var(--mdc-padding-block-start); padding-block-end: var(--mdc-padding-block-end);'],
        [['typescale', 'var(--mdc-typescale)'], 'font-family: var(--mdc-typescale-font); font-size: var(--mdc-typescale-size); line-height: var(--mdc-typescale-leading); font-weight: var(--mdc-typescale-weight); letter-spacing: var(--mdc-typescale-tracking);'],
        // Issue 9: calc(), multi-value, comments
        [['shape', 'calc(10px + 2px)'], 'border-start-start-radius: calc(10px + 2px); border-start-end-radius: calc(10px + 2px); border-end-end-radius: calc(10px + 2px); border-end-start-radius: calc(10px + 2px);'],
        [['shape', 'calc(10px + 2px) 4px'], 'border-start-start-radius: calc(10px + 2px); border-start-end-radius: 4px; border-end-end-radius: calc(10px + 2px); border-end-start-radius: 4px;'],
        [['padding', 'calc(10px + 2px) 16px'], 'padding-inline-start: 16px; padding-inline-end: 16px; padding-block-start: calc(10px + 2px); padding-block-end: calc(10px + 2px);'],
        [['margin', '8px calc(12px - 4px)'], 'margin-inline-start: calc(12px - 4px); margin-inline-end: calc(12px - 4px); margin-block-start: 8px; margin-block-end: 8px;'],
        [['padding', '8px;'], 'padding: 8px;'],
        // BUG-09: 純字面 4 值正常展開；動態 5 token 豁免 arity、底部透傳（throw 案例見 expand-declaration.spec.ts）
        [['padding', '1px 2px 3px 4px'], 'padding-inline-start: 4px; padding-inline-end: 2px; padding-block-start: 1px; padding-block-end: 3px;'],
        [['padding', 'var(--x) 2px 3px 4px 5px'], 'padding: var(--x) 2px 3px 4px 5px;'],
        [['shape', '8px /* top */ 16px;'], 'border-start-start-radius: 8px; border-start-end-radius: 16px; border-end-end-radius: 8px; border-end-start-radius: 16px;'],
        [['typescale', 'var(--mdc-body /* comment */)'], 'font-family: var(--mdc-body-font); font-size: var(--mdc-body-size); line-height: var(--mdc-body-leading); font-weight: var(--mdc-body-weight); letter-spacing: var(--mdc-body-tracking);'],
        // BUG-09: 4-value px control expands; dynamic 5-token strings are exempt (passthrough)
        [['padding', '1px 2px 3px 4px'], 'padding-inline-start: 4px; padding-inline-end: 2px; padding-block-start: 1px; padding-block-end: 3px;'],
        [['padding', 'var(--x) 2px 3px 4px 5px'], 'padding: var(--x) 2px 3px 4px 5px;'],
    ]

    for (const [[prop, value], expected] of declRows) {
        it(`${prop}: ${value}`, () => {
            expect(expandDeclaration(prop, value)).toBe(expected)
        })
    }

    // Issue 9: splitCssValues — rows are [input, tokens]
    const tokensRows: Array<[string, readonly string[]]> = [
        ['calc(10px + 2px) var(--pad, 4px 8px) 16px', ['calc(10px + 2px)', 'var(--pad, 4px 8px)', '16px']],
    ]

    for (const [input, expected] of tokensRows) {
        it(`split: ${input}`, () => {
            expect(splitCssValues(input)).toEqual(expected)
        })
    }

    // Issue 7: removeAmpersandForHostSubtree — rows are [input, expected]
    const ampRows: Array<[string, string]> = [
        ['& .inner', '& .inner'],
        ['& > .inner', '& > .inner'],
        ['&', ''],
        ['.card', '.card'],
    ]

    for (const [input, expected] of ampRows) {
        it(`ampersand: ${input}`, () => {
            expect(removeAmpersandForHostSubtree(input)).toBe(expected)
        })
    }

    // Issue 8 + Issue 14: replaceTargetInBranch — rows are [[branch, target, modifier], expectedResult, expectedMatched?]
    // BUG-01 (A3/A6/A7)：host 邊界行以第四元組顯式斷言 `matched`（預設 true，與既有行相容）。
    const replaceRows: Array<[[string, string, string], string, boolean?]> = [
        // Issue 8: tag-attached class / ID targets
        [['div.card', '.card', '.small'], 'div.card.small'],
        [['button#submit', '#submit', '.small'], 'button#submit.small'],
        // Issue 14: combinator variable whitespace in descendant targets
        [['.container   .card', '.container .card', '.active'], '.container   .card.active'],
        [['.container \t .card::before', '.container .card::before', '.active'], '.container \t .card.active::before'],
        // BUG-01 A3: host-like 但邊界非法 → 短路 matched: false（R8 [D] 上游）
        [[':hostx', ':hostx', ':hover'], ':hostx', false],
        [[':hostx', ':host', ':hover'], ':hostx', false],
        [[':where(:hostx)', ':where(:hostx)', ':hover'], ':where(:hostx)', false],
        // BUG-01 A6: 大小寫敏感、前綴誤匹配 target
        [[':HOST', ':host', ':hover'], ':HOST', false],
        [[':host-foo', ':host-foo', ':hover'], ':host-foo', false],
        // BUG-01 A7: 合法 host 包裝 + 後代對照組
        [[':where(:host) .label', ':where(:host)', ':hover'], ':where(:host(:hover)) .label', true],
        [[':is(:host([a]), :host([b]))', ':is(:host([a]), :host([b]))', ':hover'], ':is(:host([a]:hover), :host([b]:hover))', true],
        [[':host .label', ':host', ':hover'], ':host(:hover) .label', true],
        // BUG-10: 組合子緊貼後代不注入空格；帶空格後代保持原形
        [[':host>button', ':host', ':hover'], ':host(:hover)>button', true],
        [[':host+button', ':host', ':hover'], ':host(:hover)+button', true],
        [[':host > button', ':host', ':hover'], ':host(:hover) > button', true],
    ]

    for (const [[branch, target, modifier], expected, expectedMatched = true] of replaceRows) {
        it(`replace ${target} in ${branch}`, () => {
            const res = replaceTargetInBranch(branch, target, modifier)
            expect(res.matched).toBe(expectedMatched)
            expect(res.result).toBe(expected)
        })
    }

    // Issue 6: malformed inputs must not throw or loop
    const malformedInputs: string[] = [
        '@variant(filled { button {} }',
        '@when(:host([checked] { button {}',
        'button { shape: var(--_shape',
        'div { color: "unclosed string',
        '{{{{}}}}',
    ]

    for (const input of malformedInputs) {
        it(`malformed: ${input}`, () => {
            expect(() => compileAtRulesSheet({}, input)).not.toThrow()
        })
    }

    // Issue 18: rewriteStateVariables unit tests
    describe('rewriteStateVariables — exact replacement contract', () => {
        const schema = defineSchema(['small', 'large'] as const)
        const def = createStyleDefinition(schema)({
            'size': ['12px', '16px'],
            'padding': ['4px', '8px'],
            'color': '#ffffff',
            'size-offset': '2px'
        })
        const meta = extractStateTokenMetadata(def)

        it('rewrites state tokens for specified state', () => {
            const input = 'height: var(--_size); padding: var(--_padding);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('height: var(--_small-size); padding: var(--_small-padding);')
        })

        it('preserves fallback values inside var()', () => {
            const input = 'height: var(--_size, 10px); color: var(--_color, red);'
            const result = rewriteStateVariables(input, ['large'], meta)
            expect(result).toBe('height: var(--_large-size, 10px); color: var(--_color, red);')
        })

        it('does not corrupt invariant tokens or tokens with prefix substrings', () => {
            const input = 'color: var(--_color); offset: var(--_size-offset);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('color: var(--_color); offset: var(--_size-offset);')
        })

        it('handles mathematical and nested function expressions', () => {
            const input = 'width: calc(var(--_size) * 2); min-height: min(var(--_size), 30px);'
            const result = rewriteStateVariables(input, ['small'], meta)
            expect(result).toBe('width: calc(var(--_small-size) * 2); min-height: min(var(--_small-size), 30px);')
        })
    })
})
