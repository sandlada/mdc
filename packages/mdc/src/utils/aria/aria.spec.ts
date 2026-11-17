/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { AriaAttributes, AriaProperties, ariaPropertyToAttribute, isARIAAttribute } from './aria'

// Independently derived from WAI-ARIA 1.2 / ARIAMixin (not from the implementation).
const Expected: Record<string, string> = {
    ariaAtomic: 'aria-atomic',
    ariaAutoComplete: 'aria-autocomplete',
    ariaBrailleLabel: 'aria-braillelabel',
    ariaBrailleRoleDescription: 'aria-brailleroledescription',
    ariaBusy: 'aria-busy',
    ariaChecked: 'aria-checked',
    ariaColCount: 'aria-colcount',
    ariaColIndex: 'aria-colindex',
    ariaColIndexText: 'aria-colindextext',
    ariaColSpan: 'aria-colspan',
    ariaCurrent: 'aria-current',
    ariaDescription: 'aria-description',
    ariaDisabled: 'aria-disabled',
    ariaExpanded: 'aria-expanded',
    ariaHasPopup: 'aria-haspopup',
    ariaHidden: 'aria-hidden',
    ariaInvalid: 'aria-invalid',
    ariaKeyShortcuts: 'aria-keyshortcuts',
    ariaLabel: 'aria-label',
    ariaLevel: 'aria-level',
    ariaLive: 'aria-live',
    ariaModal: 'aria-modal',
    ariaMultiLine: 'aria-multiline',
    ariaMultiSelectable: 'aria-multiselectable',
    ariaOrientation: 'aria-orientation',
    ariaPlaceholder: 'aria-placeholder',
    ariaPosInSet: 'aria-posinset',
    ariaPressed: 'aria-pressed',
    ariaReadOnly: 'aria-readonly',
    ariaRelevant: 'aria-relevant',
    ariaRequired: 'aria-required',
    ariaRoleDescription: 'aria-roledescription',
    ariaRowCount: 'aria-rowcount',
    ariaRowIndex: 'aria-rowindex',
    ariaRowIndexText: 'aria-rowindextext',
    ariaRowSpan: 'aria-rowspan',
    ariaSelected: 'aria-selected',
    ariaSetSize: 'aria-setsize',
    ariaSort: 'aria-sort',
    ariaValueMax: 'aria-valuemax',
    ariaValueMin: 'aria-valuemin',
    ariaValueNow: 'aria-valuenow',
    ariaValueText: 'aria-valuetext',
    role: 'role',
}

describe('aria', () => {
    it('AriaProperties covers exactly the expected properties', () => {
        expect([...AriaProperties].sort()).toEqual(Object.keys(Expected).sort())
    })

    it.each(Object.entries(Expected))('%s -> %s', (prop, attr) => {
        expect(ariaPropertyToAttribute(prop as never)).toBe(attr)
    })

    it('AriaAttributes has one attribute per property (no collisions)', () => {
        expect(AriaAttributes.size).toBe(AriaProperties.size)
        expect([...AriaAttributes].sort()).toEqual(Object.values(Expected).sort())
    })

    it('isARIAAttribute accepts known attributes', () => {
        for (const attr of Object.values(Expected)) expect(isARIAAttribute(attr)).toBe(true)
    })

    it('isARIAAttribute rejects unknown, wrong-case and property-form names', () => {
        for (const bad of ['', 'aria-', 'aria-foo', 'ARIA-LABEL', 'ariaLabel', 'data-aria-label', 'tabindex']) {
            expect(isARIAAttribute(bad)).toBe(false)
        }
    })
})
