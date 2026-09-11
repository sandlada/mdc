/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Vendor runtime-only dependencies into packages/vscode-mdc/node_modules
 * as REAL directories (not npm-workspace hoisted symlinks).
 *
 * Why: npm workspaces hoist `lit` / `rolldown` to the repo-root
 * node_modules. `vsce` records dependencies by realpath, so those files
 * escape the extension folder (`../../node_modules/...`) and packaging
 * fails with `invalid relative path`. A local real copy keeps every
 * realpath inside the extension dir; combined with
 * `vsce package --no-dependencies` the vsix stays self-contained.
 *
 * Only `vscodeRuntimeDependencies` (not devDependencies) are vendored.
 * `vscode` is host-provided and node builtins need no vendoring.
 *
 * NOTE: these MUST stay out of `dependencies`. `vsce` collects files by
 * running `npm list --production`, which in an npm workspace returns the
 * repo root, a self symlink, and every resolved dep dir. Any entry in
 * `dependencies` would resolve twice (once via the self symlink that
 * already covers all local files, once via its own dir) and `vsce` aborts
 * on the resulting duplicates; hoisted (non-vendored) entries resolve
 * outside the extension folder and abort with `invalid relative path`.
 * The custom field keeps npm/vsce out of the way while `vendor-deps`
 * materializes real (non-symlink) copies for both F5 runs and the vsix.
 */

import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(__dirname, '..')
const requireFromPkg = createRequire(path.join(pkgDir, 'package.json'))

const manifest = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
const topLevel = Object.keys(manifest.vscodeRuntimeDependencies ?? {}).filter((name) => name !== 'vscode')

/** Resolve the real on-disk dir of an installed package, or null. */
function resolveRealDir(name) {
    const manifestPath = findManifestPath(name)
    return manifestPath ? path.dirname(manifestPath) : null
}

/**
 * Locate `<pkg>/package.json` on disk. `require.resolve('<pkg>/package.json')`
 * fails for packages whose `exports` map hides that subpath (e.g. `lit`),
 * so fall back to resolving the entry point and walking up.
 */
function findManifestPath(name) {
    try {
        return realpathSync(requireFromPkg.resolve(`${name}/package.json`))
    } catch {
        // fall through to entry-point ascent
    }
    let entry
    try {
        entry = realpathSync(requireFromPkg.resolve(name))
    } catch {
        return null
    }
    let dir = path.dirname(entry)
    while (true) {
        const candidate = path.join(dir, 'package.json')
        try {
            const sub = JSON.parse(readFileSync(candidate, 'utf8'))
            if (sub.name === name) return candidate
        } catch {
            // keep ascending
        }
        const parent = path.dirname(dir)
        if (parent === dir) return null
        dir = parent
    }
}

const seen = new Map()
const queue = [...topLevel]
while (queue.length > 0) {
    const name = queue.pop()
    if (seen.has(name) || name.startsWith('@types/')) continue
    const dir = resolveRealDir(name)
    if (!dir) {
        console.warn(`[vendor-deps] skip ${name}: not resolvable`)
        continue
    }
    seen.set(name, dir)
    const sub = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
    for (const next of Object.keys(sub.dependencies ?? {})) queue.push(next)
    for (const next of Object.keys(sub.optionalDependencies ?? {})) {
        if (resolveRealDir(next)) queue.push(next)
    }
}

const targetRoot = path.join(pkgDir, 'node_modules')
for (const [name, from] of seen) {
    const to = path.join(targetRoot, ...name.split('/'))
    if (from === to || from.startsWith(to + path.sep)) {
        // Already inside the extension dir (arrived as a nested copy of
        // another vendored package). Nothing to do.
        console.log(`[vendor-deps] ${name} already vendored, skip`)
        continue
    }
    rmSync(to, { recursive: true, force: true })
    mkdirSync(to, { recursive: true })
    cpSync(from, to, { recursive: true, dereference: false })
    console.log(`[vendor-deps] ${name} <- ${from}`)
}

console.log(`[vendor-deps] vendored ${seen.size} packages into ${targetRoot}`)
