/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Shared playground cases for `utils/styles`.
 *
 * Mission AI   = `mustContain` / `mustNotContain` (machine contract, enforced by `npm test`).
 * Mission HUMAN = `about` + `input` + `build()` printed output (reading material, never asserted).
 */

import type { CSSResult } from 'lit'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'
import { stringifyTokens } from '../stringify-tokens'
import { compileStateSheet } from '../state-sheet-compiler'
import { createStyleSheet } from '../create-style-sheet'
import { mapStateTriggers } from '../map-state-triggers'
import { defineVariantTokens } from '../define-variant-tokens'
import { overrideTokens } from '../override-tokens'
import { forwardTokens } from '../forward-tokens'
import { FocusRingDefinition } from '../../../component-definitions/focus-ring.definition'
import { FocusRingStyle } from '../../../components/focus-ring/focus-ring.style'
import { FabVariants } from '../../../component-definitions/fab.definition'

export interface PlaygroundCase {
    readonly name: string
    readonly about: string
    readonly input: string
    readonly build: () => string
    readonly mustContain: readonly string[]
    readonly mustNotContain: readonly string[]
}

const cssTextOf = (value: CSSResult | string): string =>
    typeof value === 'string' ? value : (value.cssText ?? '')

const schemaTopologyCase: PlaygroundCase = {
    name: 'schema-topology',
    about: 'defineSchema 推導 states / dimensions / count 與組合合法性',
    input: `defineSchema(['enabled', 'hovered', 'pressed', 'disabled']) + defineSchema([[selected, unselected], [small, large]])`,
    build: () => {
        const flat = defineSchema(['enabled', 'hovered', 'pressed', 'disabled'] as const)
        const orthogonal = defineSchema([
            ['selected', 'unselected'],
            ['small', 'large']
        ] as const)
        return [
            `flat.states=${JSON.stringify(flat.states)}`,
            `flat.dimensions=${JSON.stringify(flat.dimensions)}`,
            `flat.count=${flat.count}`,
            `flat.isValidCombination(['hovered'])=${flat.isValidCombination(['hovered'])}`,
            `flat.isValidCombination(['hovered', 'pressed'])=${flat.isValidCombination(['hovered', 'pressed'])}`,
            `orthogonal.states=${JSON.stringify(orthogonal.states)}`,
            `orthogonal.count=${orthogonal.count}`,
            `orthogonal.validCombinations[0]=${JSON.stringify(orthogonal.validCombinations[0])}`
        ].join('\n')
    },
    mustContain: [
        'flat.count=4',
        'isValidCombination([\'hovered\'])=true',
        'isValidCombination([\'hovered\', \'pressed\'])=false',
        'orthogonal.count=4'
    ],
    mustNotContain: []
}

const scalarVsTupleCase: PlaygroundCase = {
    name: 'scalar-vs-tuple',
    about: '純量無前綴（單一變數），tuple 按 schema 順序展開為每 state 一個變數',
    input: `schema [enabled, disabled] + { 'size': ['12px', '14px'], 'label-size': '16px' }`,
    build: () => {
        const Schema = defineSchema(['enabled', 'disabled'] as const)
        const Def = createStyleDefinition(Schema)({
            'size': ['12px', '14px'],
            'label-size': '16px'
        })
        return cssTextOf(stringifyTokens('--mdc-demo')(Def))
    },
    mustContain: [
        '--_enabled-size: var(--mdc-demo-enabled-size, 12px);',
        '--_disabled-size: var(--mdc-demo-disabled-size, 14px);',
        '--_label-size: var(--mdc-demo-label-size, 16px);'
    ],
    mustNotContain: ['--_enabled-label-size']
}

const sheetBaseDeltaCase: PlaygroundCase = {
    name: 'sheet-base-delta',
    about: '@anchor 無前綴引用改寫為 base 變數，值不同才生成 :host([disabled]) 差分規則',
    input: `@anchor .box { width: var(--_size); height: var(--_label-size); }`,
    build: () => {
        const Schema = defineSchema(['enabled', 'disabled'] as const)
        const Def = createStyleDefinition(Schema)({
            'size': ['12px', '14px'],
            'label-size': '16px'
        })
        return compileStateSheet(Def, `
            @anchor .box {
                width: var(--_size);
                height: var(--_label-size);
            }
        `)
    },
    mustContain: [
        '.box {',
        'width: var(--_enabled-size);',
        'height: var(--_label-size);',
        ':host([disabled]) .box {',
        'width: var(--_disabled-size);'
    ],
    mustNotContain: ['height: var(--_disabled-label-size);']
}

const triggersCase: PlaygroundCase = {
    name: 'triggers',
    about: 'mapStateTriggers 自定義映射：hovered→:hover，disabled→[disabled]',
    input: `mapStateTriggers({ enabled: '', hovered: ':hover', disabled: '[disabled]' })`,
    build: () => {
        const Schema = defineSchema(['enabled', 'hovered', 'disabled'] as const)
        const Def = createStyleDefinition(Schema)({
            'container-color': ['#6750a4', '#7f67be', '#e0e0e0']
        })
        const triggers = mapStateTriggers({
            'enabled': '',
            'hovered': ':hover',
            'disabled': '[disabled]'
        })
        return cssTextOf(createStyleSheet({ registry: triggers })(Def)`
            @anchor .btn {
                background-color: var(--_container-color);
            }
        `)
    },
    mustContain: [
        'background-color: var(--_enabled-container-color);',
        '.btn:hover {',
        'background-color: var(--_hovered-container-color);',
        ':host([disabled]) .btn {',
        'background-color: var(--_disabled-container-color);'
    ],
    mustNotContain: []
}

const variantsCase: PlaygroundCase = {
    name: 'variants',
    about: 'defineVariantTokens 批量注入多變體 + @variant 條件樣式',
    input: `variants { elevated, outlined } + @variant(elevated) { border: none; }`,
    build: () => {
        const Schema = defineSchema(['enabled', 'selected'] as const)
        const CardVariants = {
            elevated: createStyleDefinition(Schema)({
                'container-color': ['#ffffff', '#eeeeee'],
                'container-shape': '12px'
            }),
            outlined: createStyleDefinition(Schema)({
                'container-color': ['#ffffff', '#dddddd'],
                'container-shape': '4px'
            })
        } as const
        const injected = cssTextOf(defineVariantTokens({ prefix: '--mdc-card' })(CardVariants))
        const sheet = cssTextOf(createStyleSheet(CardVariants)`
            @anchor .box {
                background-color: var(--_container-color);
                border-radius: var(--_container-shape);
                @variant(elevated) {
                    border: none;
                }
            }
        `)
        return injected + '\n\n' + sheet
    },
    mustContain: [
        ':host([variant="elevated"]) {',
        ':host([variant="outlined"]) {',
        '--_container-shape: var(--mdc-card-container-shape, 12px);',
        ':host([variant="elevated"]) .box {',
        'border: none;'
    ],
    mustNotContain: ['--___brand']
}

const bridgesCase: PlaygroundCase = {
    name: 'bridges',
    about: 'overrideTokens 直寫子元件橋接 + forwardTokens 把子 def 轉發進父 def',
    input: `overrideTokens('--mdc-icon')({ 'enabled-size': 'var(--_small-icon-size)' }) + forwardTokens(Child, { targetPrefix: '--mdc-icon', name: 'icon', ... })`,
    build: () => {
        const ChildSchema = defineSchema(['enabled', 'selected'] as const)
        const ChildDefinition = createStyleDefinition(ChildSchema)({
            'color': ['#ffffff', '#000000'],
            'size': '18px'
        })
        const ParentDefinition = createStyleDefinition(ChildSchema)({
            'container-color': ['#6750a4', '#e8def8'],
            ...forwardTokens(ChildDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#ffffff', '#1d192b'],
                    'size': '18px'
                }
            })
        })
        const bridge = cssTextOf(overrideTokens({
            prefix: '--mdc-icon',
            selector: 'button.small .icon'
        })({
            'enabled-size': 'var(--_small-icon-size)'
        })())
        const parentTokens = cssTextOf(stringifyTokens('--mdc-parent')(ParentDefinition))
        return bridge + '\n\n' + parentTokens
    },
    mustContain: [
        'button.small .icon {',
        '--mdc-icon-enabled-size: var(--_small-icon-size);',
        '--mdc-parent-enabled-icon-color',
        '--mdc-icon-color: var(--_enabled-icon-color);'
    ],
    mustNotContain: []
}

const realWorldCase: PlaygroundCase = {
    name: 'real-world',
    about: '真實定義與樣式：FocusRing token 注入 + FocusRingStyle 全文掃描 + FabVariants 規模',
    input: `FocusRingDefinition / FocusRingStyle / FabVariants（生產代碼原樣）`,
    build: () => {
        const injected = cssTextOf(stringifyTokens('--mdc-focus-ring')(FocusRingDefinition))
        const fullStyle = FocusRingStyle
            .map((entry) => cssTextOf(entry as CSSResult))
            .join('\n')
        const fabTokenCounts = Object.entries(FabVariants)
            .map(([variant, def]) => `${variant}=${Object.keys(def.tokens).length}`)
            .join(', ')
        return [
            '--- focus-ring injection ---',
            injected,
            '--- fab variant token counts ---',
            fabTokenCounts,
            '--- focus-ring style excerpt (:host([focused]) rules) ---',
            ...fullStyle
                .split('\n')
                .filter((line) => line.includes(':host([focused])') || line.includes(':host([persistent])'))
                .slice(0, 8)
        ].join('\n')
    },
    mustContain: [
        '--_duration: var(--mdc-focus-ring-duration',
        '--_shape-start-start: var(--mdc-focus-ring-shape-start-start',
        ':host([focused]) {',
        'primary=22'
    ],
    mustNotContain: [
        '--___brand',
        '[focused][focused]',
        '([persistent]) :host'
    ]
}

const stateAtRuleCase: PlaygroundCase = {
    name: 'state-at-rule',
    about: '新範式 @state 展開多狀態選擇器，並將 multi-state token 變數改寫為對應狀態前綴',
    input: `@state(.container) .container { height: var(--_container-size); padding-block-start: var(--_container-padding-block-start); }`,
    build: () => {
        const Schema = defineSchema(['small', 'large'] as const)
        const Def = createStyleDefinition(Schema)({
            'container-size': ['6px', '16px'],
            'container-padding-block-start': ['2px', '4px'],
            'container-color': '#b3261e'
        })
        const triggers = mapStateTriggers({
            'small': '.small',
            'large': '.large'
        })
        return cssTextOf(createStyleSheet({ registry: triggers })(Def)`
            @state(.container) .container {
                height: var(--_container-size);
                padding-block-start: var(--_container-padding-block-start);
                background-color: var(--_container-color);
            }
        `)
    },
    mustContain: [
        '.container.small {',
        'height: var(--_small-container-size);',
        'padding-block-start: var(--_small-container-padding-block-start);',
        '.container.large {',
        'height: var(--_large-container-size);',
        'padding-block-start: var(--_large-container-padding-block-start);',
        'background-color: var(--_container-color);'
    ],
    mustNotContain: [
        'height: var(--_container-size);',
        'padding-block-start: var(--_container-padding-block-start);',
        '--_small-container-color'
    ]
}

export const cases: readonly PlaygroundCase[] = [
    schemaTopologyCase,
    scalarVsTupleCase,
    sheetBaseDeltaCase,
    triggersCase,
    variantsCase,
    bridgesCase,
    realWorldCase,
    stateAtRuleCase
]

