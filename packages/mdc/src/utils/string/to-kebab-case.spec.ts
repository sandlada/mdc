/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { toKebabCase } from './to-kebab-case'

describe('toKebabCase', () => {
    it('converts PascalCase and camelCase to kebab-case', () => {
        expect(toKebabCase('OnPrimary')).toBe('on-primary')
        expect(toKebabCase('surfaceContainerHigh')).toBe('surface-container-high')
        expect(toKebabCase('primary')).toBe('primary')
    })

    it('handles empty string', () => {
        expect(toKebabCase('')).toBe('')
    })
})
