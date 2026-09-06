/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { css, unsafeCSS } from 'lit'
import { sheetOf } from '../css-like'
import { toLit, toLitAll } from './to-lit'

describe('lit adapter', () => {
    it('converts MDCStyleSheet to a Lit CSSResult preserving cssText', () => {
        const result = toLit(sheetOf(':host { color: red; }'))
        expect(result.cssText).toBe(':host { color: red; }')
    })

    it('converts raw strings', () => {
        expect(toLit('a').cssText).toBe('a')
        expect(toLitAll([sheetOf('a'), 'b']).map((r) => r.cssText)).toEqual(['a', 'b'])
    })

    it('accepts Lit css results as core input via cssText duck-typing', () => {
        const litCss = css`margin: 0;`
        expect(typeof litCss.cssText).toBe('string')
        expect(sheetOf(litCss.cssText).cssText).toContain('margin: 0;')
    })

    it('MDCStyleSheet interpolates inside lit css templates', () => {
        const tokens = sheetOf('--_color: red;')
        const host = css`:host {${unsafeCSS(tokens.cssText)};}`
        expect(host.cssText).toContain('--_color: red;')
    })
})
