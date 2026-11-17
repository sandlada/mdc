/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { generateUUID } from './generate-uuid'

describe('generateUUID', () => {
    it('generates a valid v4-formatted UUID string', () => {
        const uuid = generateUUID()
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('generates unique values across consecutive calls', () => {
        const set = new Set(Array.from({ length: 50 }, () => generateUUID()))
        expect(set.size).toBe(50)
    })
})
