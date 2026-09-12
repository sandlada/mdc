/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Demo entrypoint: compiles `style.ts` through the runtime compiler and
 * writes the resulting standard CSS to `demo/output/demo.css`.
 *
 * Run with `npm run demo -w @sandlada/styles` (builds first so the
 * `@sandlada/styles` self-reference resolves to fresh output).
 * Plain Node suffices: this file and its imports use erasable syntax
 * only, and the core compiler is DOM-free.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// NOTE: explicit `.ts` suffixes below are required for direct `node`
// execution (ESM has no extension probing). `demo/` is never bundled,
// so the repo-wide no-suffix convention does not apply here.
import { DemoStyles } from './style.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'output')
mkdirSync(outDir, { recursive: true })

const css = DemoStyles.cssText
const outPath = join(outDir, 'demo.css')
writeFileSync(outPath, `${css}\n`)

const lines = css.split('\n').length
console.log(`demo css written to ${outPath} (${lines} lines, ${css.length} chars)`)
