/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * check-spec-versions: read-only spec version checker.
 *
 * This script NEVER writes or modifies any file. It only checks and reports,
 * classifying each spec as 匹配 (match) or 漂移 (drift):
 *   匹配 : spec carries a valid `@version YYYY.M.D` AND its paired tests pass.
 *   漂移 : spec misses `@version`, or its paired tests fail.
 *
 * Version bumps must be designated manually by the user; neither this script
 * nor any agent may rewrite `@version` lines.
 *
 * Exit code is non-zero when any drift exists.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const resolveVitestBin = (startDir) => {
    let dir = startDir
    while (true) {
        const candidate = join(dir, 'node_modules', 'vitest', 'vitest.mjs')
        if (existsSync(candidate)) return candidate
        const parent = dirname(dir)
        if (parent === dir) return null
        dir = parent
    }
}

const vitestBin = resolveVitestBin(packageRoot)

const SPECS = [
    'src/triggers/map-variant-triggers.spec.ts',
    'src/compiler/at-rules/transform-state.spec.ts',
    'src/compiler/at-rules/transform-variant.spec.ts',
    'src/compiler/at-rules/transform-when.spec.ts',
    'src/compiler/at-rules/hoist-helpers.spec.ts',
    'src/compiler/at-rules/at-rules-integration.spec.ts',
    'src/compiler/at-rules/at-rules-sheet.spec.ts',
    'src/compiler/at-rules-compiler.spec.ts',
]

const VERSION_RE = /@version\s+(\d+\.\d+\.\d+)/

const readVersion = (relPath) => {
    const text = readFileSync(join(packageRoot, relPath), 'utf8')
    return text.match(VERSION_RE)?.[1] ?? null
}

const testsPass = (relPath) => {
    try {
        execFileSync(process.execPath, [vitestBin, 'run', relPath, '--reporter=dot'], {
            cwd: packageRoot,
            stdio: 'pipe',
        })
        return true
    } catch {
        return false
    }
}

if (vitestBin === null) {
    console.error('vitest not found in any parent node_modules; run npm install first.')
    process.exit(2)
}

const rows = SPECS.map((spec) => {
    const version = readVersion(spec)
    const passed = testsPass(spec)
    const verdict = version !== null && passed ? '匹配' : '漂移'
    return { spec, version: version ?? '缺失', tests: passed ? '通過' : '失敗', verdict }
})

const width = Math.max(...rows.map((row) => row.spec.length))
for (const row of rows) {
    console.log(`${row.spec.padEnd(width)}  版本 ${row.version.padEnd(10)}  測試 ${row.tests}  結論 ${row.verdict}`)
}

const driftCount = rows.filter((row) => row.verdict === '漂移').length
console.log(`\n共 ${rows.length} 份 spec：匹配 ${rows.length - driftCount}，漂移 ${driftCount}。`)
process.exit(driftCount > 0 ? 1 : 0)
