/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { SelectOptionDefinitions } from './select-option.definition'
import { SelectOptionStyles } from './select-option.style'
import { MDCSelectOption } from './select-option'
import { SelectDefinitions } from './select.definition'
import { SelectStyles } from './select.style'
import { MDCSelect } from './select'

describe('MDCSelect', () => {
    it('instantiates with defaults', () => {
        const select = new MDCSelect()
        expect(select.variant).toBe('filled')
        expect(select.value).toBe('')
        expect(select.selectedIndex).toBe(-1)
        expect(select.name).toBe('')
        expect(select.label).toBe('')
        expect(select.placeholder).toBe('')
        expect(select.supportingText).toBe('')
        expect(select.errorText).toBe('')
        expect(select.error).toBe(false)
        expect(select.prefixText).toBe('')
        expect(select.suffixText).toBe('')
        expect(select.disabled).toBe(false)
        expect(select.required).toBe(false)
        expect(select.noAsterisk).toBe(false)
        expect(select.open).toBe(false)
        expect(select.quick).toBe(false)
        expect(select.floatingLabelBehavior).toBe('auto')
        expect(select.alignEnd).toBe(false)
        expect(select.clampMenuWidth).toBe(false)
        expect(select.menuPlacement).toBe('bottom-start')
        expect(select.menuColorStyle).toBe('standard')
        expect(select.typeaheadDelay).toBe(500)
        expect(select.autoValidate).toBe(false)
    })

    it('participates in form association', () => {
        expect((MDCSelect as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
    })

    it('throws on unsupported variant, menuPlacement, or menuColorStyle', () => {
        const select = new MDCSelect()
        ;(select as unknown as { variant: string }).variant = 'invalid'
        expect(() => (select as unknown as { willUpdate(p: Map<string, unknown>): void }).willUpdate(new Map())).toThrow()

        const select2 = new MDCSelect()
        ;(select2 as unknown as { menuPlacement: string }).menuPlacement = 'left'
        expect(() => (select2 as unknown as { willUpdate(p: Map<string, unknown>): void }).willUpdate(new Map())).toThrow()

        const select3 = new MDCSelect()
        ;(select3 as unknown as { menuColorStyle: string }).menuColorStyle = 'neon'
        expect(() => (select3 as unknown as { willUpdate(p: Map<string, unknown>): void }).willUpdate(new Map())).toThrow()
    })

    it('enforces z-index constraint [-1, 0, 1] in SelectStyles and SelectOptionStyles', () => {
        const allCss = [...SelectStyles, ...SelectOptionStyles].map((s) => s.cssText).join('\n')
        const matches = [...allCss.matchAll(/z-index\s*:\s*([^;]+);/g)]
        for (const match of matches) {
            const val = match[1].trim()
            expect(['-1', '0', '1']).toContain(val)
        }
    })

    it('uses leading instead of line-height in token definitions', () => {
        for (const def of [SelectDefinitions.Standard, SelectDefinitions.Vibrant, SelectOptionDefinitions.Standard, SelectOptionDefinitions.Vibrant]) {
            for (const key of Object.keys(def)) {
                expect(key.endsWith('line-height')).toBe(false)
            }
        }
    })
})

describe('MDCSelectOption', () => {
    it('instantiates with defaults', () => {
        const option = new MDCSelectOption()
        expect(option.value).toBe('')
        expect(option.disabled).toBe(false)
        expect(option.selected).toBe(false)
        expect(option.displayText).toBe('')
        expect(option.supportingText).toBe('')
        expect(option.active).toBe(false)
        expect(option.variant).toBe('standard')
    })

    it('throws on unsupported variant', () => {
        const option = new MDCSelectOption()
        ;(option as unknown as { variant: string }).variant = 'invalid'
        expect(() => (option as unknown as { willUpdate(p: Map<string, unknown>): void }).willUpdate(new Map())).toThrow()
    })
})
