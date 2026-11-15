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

const NodeRequire = createRequire(import.meta.url)
const IconRoot = dirname(NodeRequire.resolve('@material-design-icons/svg/package.json'))

const NamePattern = /^[a-z0-9_]+$/
const Cache = new Map<string, string>()

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
    if (!NamePattern.test(name)) {
        throw new Error(`Invalid icon name "${name}": expected lowercase snake_case (e.g. "notifications")`)
    }

    const key = `${style}/${name}`
    const cached = Cache.get(key)
    if (cached !== undefined) {
        return cached
    }

    let svg: string
    try {
        svg = readFileSync(join(IconRoot, style, `${name}.svg`), 'utf8')
    } catch {
        throw new Error(`Unknown icon "${name}" for style "${style}"`)
    }

    Cache.set(key, svg)
    return svg
}
