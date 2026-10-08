/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

/** Icon styles shipped by `@material-design-icons/svg`. */
export type IconStyle = 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone'

const require = createRequire(import.meta.url)
const iconRoot = dirname(require.resolve('@material-design-icons/svg/package.json'))

const NAME_PATTERN = /^[a-z0-9_]+$/
const cache = new Map<string, string>()

/**
 * Read a raw SVG icon from `@material-design-icons/svg`.
 *
 * Server-only (reads from disk): use it in `.astro` frontmatter and inject the
 * result into `<mdc-icon>` with `set:html`. Icons are loaded lazily and cached,
 * so only the ones actually used are read.
 *
 * @param name  lowercase snake_case icon name, e.g. `notifications` / `menu`.
 * @param style one of `filled | outlined | round | sharp | two-tone`.
 */
export function getIcon(name: string, style: IconStyle = 'outlined'): string {
    if (!NAME_PATTERN.test(name)) {
        throw new Error(`Invalid icon name "${name}": expected lowercase snake_case (e.g. "notifications")`)
    }

    const key = `${style}/${name}`
    const cached = cache.get(key)
    if (cached !== undefined) {
        return cached
    }

    let svg: string
    try {
        svg = readFileSync(join(iconRoot, style, `${name}.svg`), 'utf8')
    } catch {
        throw new Error(`Unknown icon "${name}" for style "${style}"`)
    }

    cache.set(key, svg)
    return svg
}
