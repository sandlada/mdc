/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ComponentsDir = resolve(import.meta.dirname, '../../components')
const AllowedZIndexValues = new Set(['-1', '0', '1'])

const collectFiles = (dir: string, predicate: (name: string) => boolean): string[] => {
    const results: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
            results.push(...collectFiles(fullPath, predicate))
        } else if (predicate(entry.name)) {
            results.push(fullPath)
        }
    }
    return results
}

describe('z-index constraint ([-1, 0, 1])', () => {
    it('allows only -1, 0, 1 (or var(--_*)) in all component style files', () => {
        const styleFiles = collectFiles(
            ComponentsDir,
            (name) => name.endsWith('.style.ts') || name.endsWith('.styles.ts'),
        )
        expect(styleFiles.length).toBeGreaterThan(0)

        const violations: string[] = []
        const zIndexPattern = /\bz-index\s*:\s*([^;\n}]+)/g

        for (const file of styleFiles) {
            const content = readFileSync(file, 'utf-8')
            for (const match of content.matchAll(zIndexPattern)) {
                const rawValue = match[1].trim()
                if (rawValue.startsWith('var(--_')) {
                    continue
                }
                if (!AllowedZIndexValues.has(rawValue)) {
                    violations.push(`${relative(ComponentsDir, file)}: z-index: ${rawValue}`)
                }
            }
        }

        expect(violations).toEqual([])
    })

    it('allows only -1, 0, 1 for z-index tokens in all component definition files', () => {
        const definitionFiles = collectFiles(
            ComponentsDir,
            (name) => name.endsWith('.definition.ts'),
        )
        expect(definitionFiles.length).toBeGreaterThan(0)

        const violations: string[] = []
        const tokenPattern = /['"][^'"]*z-index[^'"]*['"]\s*:\s*[`'"]([^`'"]+)[`'"]/g

        for (const file of definitionFiles) {
            const content = readFileSync(file, 'utf-8')
            for (const match of content.matchAll(tokenPattern)) {
                const rawValue = match[1].trim()
                if (!AllowedZIndexValues.has(rawValue)) {
                    violations.push(`${relative(ComponentsDir, file)}: ${match[0]}`)
                }
            }
        }

        expect(violations).toEqual([])
    })
})
