/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { readDirectLabel, type IDirectLabelNode } from './read-direct-label'

const TextNodeType = 3
const ElementNodeType = 1

function text(textContent: string | null): IDirectLabelNode {
    return { nodeType: TextNodeType, textContent }
}

function element(textContent: string | null): IDirectLabelNode {
    return { nodeType: ElementNodeType, textContent }
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
