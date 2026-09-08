/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * 真實 sheet 層規格（compileStateSheet + 真實 definition / tables）：
 *   覆蓋聲明內容層（var 重寫 / expanders / a11y 巨集 / 發射規則），與
 *   at-rules-integration.spec.ts（fake 殼交織層）互補。上游真實實現變更時，
 *   只有本檔變紅。雙隊斷言相同：精確相等（數組以單空格連接），不看 warn。
 */

import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from '../../create-style-definition'
import { defineSchema } from '../../define-schema'
import { emptyTables, withState, withVariant } from '../../triggers'
import { flow } from '../../pipe'
import { compileStateSheet } from '../compile-state-sheet'

type MappingRow = ReadonlyArray<readonly [input: string, expected: string | readonly string[]]>

function canonical(css: string | readonly string[]): string {
    // 數組以單空格連接：對應編譯器 `join(' ')` 的殼分隔語義；換行僅統一 \r\n，不折疊中間空白。
    const text = typeof css === 'string' ? css : css.join(' ')
    return text.replace(/\r\n/g, '\n').trim()
}

describe('sheet: a11y + expanders', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
    })
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

    /**
     * I5: @state + A11y 巨集
     *   - 媒體查詢巨集保持原生 CSS 巢狀，並隨 state 狀態維度共同展開
     * I6: @variant + A11y 巨集
     *   - 變體外殼包裹媒體查詢巨集
     * I7: @state + Property Expanders (shape / padding)
     *   - 狀態展開與屬性巨集展開正交協同
     */
    const greenMapping: MappingRow = [
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

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { tables: SizeVariantTables })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

describe('token-rewrite', () => {
    const SizeSchema = defineSchema(['small', 'medium', 'large'] as const)
    const SizeDef = createStyleDefinition(SizeSchema)({
        'size': [12, 14, 16],
        'color': [null, 'red', 'blue'],
        'width': {
            small: `120px`,
            medium: `130px`,
            large: `140px`
        }
    })
    const SizeTriggers = withState({
        'small': '.small',
        'medium': '.medium',
        'large': '.large'
    })(emptyTables)

    /**
     * @state 体内的 `var(--_…)` 声明按状态重写（需真实 meta，归集成层）。
     */
    const greenMapping: MappingRow = [
        ['@state(button) button { color: var(--_color); }', [
            'button.medium { color: var(--_medium-color); }',
            'button.large { color: var(--_large-color); }'
        ]],
        ['@state(button) button { width: var(--_width); }', [
            'button.small { width: var(--_small-width); }',
            'button.medium { width: var(--_medium-width); }',
            'button.large { width: var(--_large-width); }'
        ]],
        ['@state(button) button { color: var(--_color); width: var(--_width); }', [
            'button.small { width: var(--_small-width); }',
            'button.medium { color: var(--_medium-color); width: var(--_medium-width); }',
            'button.large { color: var(--_large-color); width: var(--_large-width); }'
        ]]
    ]

    for (const [input, expected] of greenMapping) {
        it(`green: ${input}`, () => {
            const output = compileStateSheet(SizeDef, input, { tables: SizeTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})

describe('empty-emission', () => {
    const SmlSchema = defineSchema(['s', 'm', 'l'] as const)
    const NullBaseDef = createStyleDefinition(SmlSchema)({
        'size': [null, '12px', '14px']
    })
    const NullBaseTriggers = withState({
        's': '.s',
        'm': '.m',
        'l': '.l'
    })(emptyTables)
    const StaticDef = createStyleDefinition(SmlSchema)({
        'color': '#6750a4'
    })

    /**
     * 发射规则（需真实 meta，归集成层）：空 body 且该 state 无定义者不发射；
     * 有内容恒发射；纯静态 def 全量发射。
     */
    const greenMapping: MappingRow = [
        ['@state(.btn) .btn {}', ['.btn.m {}', '.btn.l {}']],
        ['.container { @state(.btn) .btn {} }', '.container { .btn.m {} .btn.l {} }'],
        ['@state(.btn) .btn { width: var(--_size); }', ['.btn.m { width: var(--_m-size); }', '.btn.l { width: var(--_l-size); }']]
    ]

    it('green: empty body + null base emits only defined states', () => {
        const output = compileStateSheet(NullBaseDef, '@state(.btn) .btn {}', { tables: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m {}', '.btn.l {}']))
    })

    it('green: nested empty body respects outer shell', () => {
        const output = compileStateSheet(NullBaseDef, '.container { @state(.btn) .btn {} }', { tables: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical('.container { .btn.m {} .btn.l {} }'))
    })

    it('green: filtered-empty body is not emitted', () => {
        const output = compileStateSheet(NullBaseDef, '@state(.btn) .btn { width: var(--_size); }', { tables: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m { width: var(--_m-size); }', '.btn.l { width: var(--_l-size); }']))
    })

    it('green: static-only def still emits all shells', () => {
        const output = compileStateSheet(StaticDef, '@state(.btn) .btn {}', { tables: NullBaseTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.s {}', '.btn.m {}', '.btn.l {}']))
    })

    it('green: combo members without definition are not emitted', () => {
        const ComboNullSchema = defineSchema([['m', 'l'], ['enabled', 'disabled']] as const)
        const ComboNullDef = createStyleDefinition(ComboNullSchema)({
            'size': { 'm': '12px' },
            'opacity': { 'enabled': '1', 'disabled': '0.38' }
        })
        const ComboNullTriggers = withState({
            'm': '.m',
            'l': '.l',
            'enabled': '',
            'disabled': '[disabled]'
        })(emptyTables)
        const output = compileStateSheet(ComboNullDef, '@state(.btn) .btn {}', { tables: ComboNullTriggers })
        expect(canonical(output)).toBe(canonical(['.btn.m {}', '.btn.m[disabled] {}']))
    })

    it('green: host split shell without definition is not emitted', () => {
        const HostNullSchema = defineSchema(['enabled', 'disabled'] as const)
        const HostNullDef = createStyleDefinition(HostNullSchema)({
            'opacity': ['1', null]
        })
        const HostNullTriggers = withState({
            'enabled': '',
            'disabled': '[disabled]'
        })(emptyTables)
        const output = compileStateSheet(HostNullDef, ':host { @state(button) button {} }', { tables: HostNullTriggers })
        expect(canonical(output)).toBe(canonical(':host { button {} }'))
    })

    for (const [input, expected] of greenMapping) {
        it(`green-table: ${input}`, () => {
            const output = compileStateSheet(NullBaseDef, input, { tables: NullBaseTriggers })
            expect(canonical(output)).toBe(canonical(expected))
        })
    }
})
