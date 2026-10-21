/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { readDirectLabel, type IDirectLabelNode } from './read-direct-label'

const TEXT_NODE_TYPE = 3
const ELEMENT_NODE_TYPE = 1

function text(textContent: string | null): IDirectLabelNode {
    return { nodeType: TEXT_NODE_TYPE, textContent }
}

function element(textContent: string | null): IDirectLabelNode {
    return { nodeType: ELEMENT_NODE_TYPE, textContent }
}

describe('readDirectLabel', () => {
    it('reads direct text nodes', () => {
        expect(readDirectLabel([text('Home')])).toBe('Home')
    })

    it('joins multiple direct text nodes', () => {
        expect(readDirectLabel([text('Set'), text('tings')])).toBe('Settings')
    })

    it('ignores text nested inside child elements', () => {
        expect(readDirectLabel([element('settings')])).toBe('')
    })

    it('keeps only direct text when child elements also carry text', () => {
        expect(readDirectLabel([text('Home'), element('settings')])).toBe('Home')
        expect(readDirectLabel([element('settings'), text('Home')])).toBe('Home')
    })

    it('returns an empty string for whitespace-only direct text', () => {
        expect(readDirectLabel([text('  \n\t ')])).toBe('')
    })

    it('treats a null text content as empty', () => {
        expect(readDirectLabel([text(null)])).toBe('')
    })

    it('returns an empty string when there are no children', () => {
        expect(readDirectLabel([])).toBe('')
    })
})
