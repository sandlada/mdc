import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rolldown'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Recursively enumerate every shippable .ts file under `src/`.
 * Skips test files (*.spec.ts / *.test.ts) and test-support helpers
 * (*fakes.ts, imported only by specs) — they must never become build
 * entries (they import vitest / node:test while the browser bundle targets
 * the DOM and ships no test runner).
 *
 * Naming convention: test-only helpers must end with `fakes.ts` (e.g.
 * `spec-fakes.ts`, `foo.fakes.ts`) so this single rule keeps them out of
 * every bundle without a manual denylist.
 *
 * Returns an entry map compatible with rolldown's `input` option:
 * `{ 'compiler/index': 'src/compiler/index.ts', ... }`.
 */
function collectEntries(srcDir, excludeDirs = [], keyPrefix = '') {
    /** @type {Record<string, string>} */
    const entries = {}

    /** @param {string} dir */
    function walk(dir) {
        for (const name of readdirSync(dir)) {
            const full = join(dir, name)
            const st = statSync(full)
            if (st.isDirectory()) {
                if (excludeDirs.includes(name)) continue
                walk(full)
            } else if (name.endsWith('.ts')) {
                if (name.endsWith('.spec.ts') || name.endsWith('.test.ts') || name.endsWith('fakes.ts')) continue
                const rel = relative(srcDir, full).split(sep).join('/')
                const key = keyPrefix + rel.replace(/\.ts$/, '')
                entries[key] = `src/${keyPrefix}${rel}`
            }
        }
    }

    walk(srcDir)
    return entries
}

const srcDir = join(__dirname, 'src')
const browserInput = collectEntries(srcDir, ['rolldown'])
const nodeInput = collectEntries(join(srcDir, 'adapters', 'rolldown'), [], 'adapters/rolldown/')

export default defineConfig([
    {
        input: browserInput,
        output: {
            dir: 'build',
            format: 'esm',
            entryFileNames: '[name].js',
            minify: false,
            sourcemap: true,
            preserveModules: true,
        },
        platform: 'browser',
        tsconfig: './tsconfig.json',
        // The only runtime surface is the `lit` adapter (peer): bundling it
        // would bake browser-conditioned copies under build/node_modules/,
        // which then shadow real resolution for downstream bundlers and Node
        // consumers (stale copies crashed vitest with
        // `HTMLElement is not defined`). Bare `from 'lit'` lets each
        // environment resolve its own single copy — exactly like source
        // imports do. Everything else in src/ is dependency-free pure logic
        // (specs alone use `@sandlada/mdk`, provided as a devDependency).
        external: ['lit', /^lit\/.*/, /^@lit\//],
    },
    {
        // NOTE: preserveModules MUST stay off here. The node entries share
        // modules (compiler, triggers, ...) with the browser bundle above and
        // write into the same `build/` dir: per-module files from this bundle
        // would overwrite the browser chunks with treeshaken variants missing
        // exports (e.g. `triggers/tables.js` lost `withState`). Bundling
        // shared code into hashed chunks keeps entry paths (`rolldown/*.js`)
        // stable without collisions.
        input: nodeInput,
        output: {
            dir: 'build',
            format: 'esm',
            entryFileNames: '[name].js',
            chunkFileNames: 'adapters/rolldown/chunk-[hash].js',
            minify: false,
            sourcemap: true,
            preserveModules: false,
        },
        platform: 'node',
        tsconfig: './tsconfig.json',
        external: ['rolldown', 'node:vm', 'node:path', 'node:module', 'node:url'],
    },
])
