/**
 * @version 2026.9.9
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `expandDeclaration` BUG-09 規格：純字面 >4 值運行時 `throw`（動態串豁免）；
 * px 字面 5 值在類型層不可表示（`@ts-expect-error` 由 `tsc --noEmit` 驗證，
 * 內層閉包永不執行，故 vitest 不受影響）。
 */

import { describe, expect, it } from 'vitest'
import { expandDeclaration } from './expand-declaration'

describe('expandDeclaration arity (BUG-09)', () => {
    it('pure-literal 1-4 px values expand normally', () => {
        expect(expandDeclaration('padding', '8px')).toBe('padding: 8px;')
        expect(expandDeclaration('padding', '8px 16px 24px 32px')).toBe(
            'padding-inline-start: 32px; padding-inline-end: 16px; padding-block-start: 8px; padding-block-end: 24px;'
        )
        expect(expandDeclaration('shape', '1px 2px 3px 4px')).toBe(
            'border-start-start-radius: 1px; border-start-end-radius: 2px; border-end-end-radius: 3px; border-end-start-radius: 4px;'
        )
        expect(expandDeclaration('margin', '0')).toBe('margin: 0;')
    })

    it('pure-literal >4 values throw at runtime', () => {
        // @ts-expect-error: 5 px values collapse to never; runtime throw asserted below
        expect(() => expandDeclaration('padding', '8px 16px 24px 32px 40px')).toThrow()
        // @ts-expect-error: 5 zeros collapse to never; runtime throw asserted below
        expect(() => expandDeclaration('margin', '0 0 0 0 0')).toThrow()
        // @ts-expect-error: 5 px values collapse to never; runtime throw asserted below
        expect(() => expandDeclaration('shape', '1px 2px 3px 4px 5px')).toThrow()
    })

    it('dynamic strings are exempt from arity checks', () => {
        expect(expandDeclaration('padding', 'var(--x) 2px 3px 4px 5px')).toBe(
            'padding: var(--x) 2px 3px 4px 5px;'
        )
        expect(expandDeclaration('padding', 'calc(1px + 1px) 2px 3px 4px 5px')).toBe(
            'padding: calc(1px + 1px) 2px 3px 4px 5px;'
        )
    })

    it('pure-literal 5-value px lists are unrepresentable at compile time', () => {
        const check = (): void => {
            // @ts-expect-error: 5 px values collapse to never (BUG-09 type gate)
            expandDeclaration('padding', '8px 16px 24px 32px 40px')
            // @ts-expect-error: 5 zeros collapse to never (BUG-09 type gate)
            expandDeclaration('margin', '0 0 0 0 0')
        }
        expect(check).toBeDefined()
    })
})
