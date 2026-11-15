/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCChip } from './chip'
import { MDCChipSet } from './chip-set'

describe('MDCChip', () => {
    it('instantiates with defaults', () => {
        const chip = new MDCChip()
        expect(chip.variant).toBe('assist')
        expect(chip.selected).toBe(false)
        expect(chip.disabled).toBe(false)
        expect(chip.softDisabled).toBe(false)
        expect(chip.alwaysFocusable).toBe(false)
        expect(chip.elevated).toBe(false)
        expect(chip.href).toBe('')
        expect(chip.target).toBe('')
        expect(chip.label).toBe('')
        expect(chip.ariaLabelRemove).toBe('')
        expect(chip.removeOnly).toBe(false)
        expect(chip.chipTabIndex).toBe(0)
        expect(chip.hasIcon).toBe(false)
        expect(chip.hasAvatar).toBe(false)
        expect(chip.hasTrailingIcon).toBe(false)
        expect(chip.hasSelectedIcon).toBe(false)
        expect(chip.hasLabel).toBe(false)
        expect((chip as any).getRole()).toBe('button')
    })

    it('role becomes link when href is set', () => {
        const chip = new MDCChip()
        chip.href = 'https://example.com'
        expect((chip as any).getRole()).toBe('link')
        expect(chip.target).toBe('')
    })
})

describe('MDCChipSet', () => {
    it('instantiates with defaults', () => {
        const set = new MDCChipSet()
        expect(set.singleSelect).toBe(false)
        expect(set.chips).toEqual([])
    })
})