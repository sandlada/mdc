/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `@sandlada/styles/rolldown` — build-time stylesheet compiler for
 * `*.style.ts` files. Register **before** any CSS-minifying plugin:
 *
 * ```js
 * import { mdcStyles } from '@sandlada/styles/rolldown'
 * import template from 'rollup-plugin-html-literals'
 *
 * export default defineConfig({
 *     // ...
 *     plugins: [mdcStyles(), template()],
 * })
 * ```
 *
 * Files opt in per `css` literal with the `/* @mdc-style *\/` marker (see
 * `./markers`). Unmarked files pass through untouched, so the runtime
 * `createStyleSheet` remains the compiler for everything else. Compiled
 * files carry `/* @mdc-compiled *\/` and are skipped on re-entry, which
 * keeps the transform idempotent across watch rebuilds.
 *
 * Node-only: this entry pulls `rolldown` and `node:vm` and must never be
 * imported from browser code or the `lit` adapter.
 */

import { COMPILED_MARKER, hasCompiledMarker, hasMarker, STYLE_MARKER } from './markers'
import { compileMarkedFile } from './compile-marked'

export { COMPILED_MARKER, STYLE_MARKER }
export { extractMarkedCssLiterals, hasCompiledMarker, hasMarker } from './markers'
export { compileMarkedFile } from './compile-marked'
export type { MarkedFileInput, MarkedFileOutput } from './compile-marked'
export { loadDefinition } from './definition-loader'

export interface MdcStylesOptions {
    readonly marker?: string
    readonly compiledMarker?: string
}

export interface MdcStylesPlugin {
    readonly name: string
    readonly enforce: 'pre'
    readonly transform: (code: string, id: string) => Promise<{ code: string; map: null } | null>
}

const isStyleFile = (id: string): boolean =>
    id.endsWith('.style.ts') || id.endsWith('.styles.ts')

export const mdcStyles = (
    options?: MdcStylesOptions,
    deps?: Parameters<typeof compileMarkedFile>[0],
): MdcStylesPlugin => {
    const marker = options?.marker ?? STYLE_MARKER
    const compiledMarker = options?.compiledMarker ?? COMPILED_MARKER
    const isMarked = hasMarker(marker)
    const isCompiled = hasCompiledMarker(compiledMarker)
    const compile = compileMarkedFile(deps)
    return {
        name: 'mdc-styles',
        enforce: 'pre',
        transform: async (code: string, id: string) => {
            if (!isStyleFile(id)) return null
            if (!isMarked(code) || isCompiled(code)) return null
            const result = await compile({ id, code, marker })
            if (!result.changed) return null
            return { code: result.code, map: null }
        },
    }
}
