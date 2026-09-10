import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rolldown'
import { mdcStyles } from '@sandlada/styles/adapters/rolldown'
import template from 'rollup-plugin-html-literals'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Build-time WIP exclusions. NOTE: intentionally not mirrored with the
 * tsconfig exclude list (which additionally skips dock-layout /
 * draggable-modal / popup-controller from .d.ts emit) — those directories
 * still ship .js and must compile cleanly. Paths use the OS separator so
 * they match the relative paths returned by Node's fs APIs.
 */
const WIP_DIRS = [
    'button-group',
    'wave',
    'toolbar',
]
const WIP_SUFFIX = '-old'

/**
 * Recursively enumerate every shippable .ts file under `src/`, skipping WIP
 * directories, WIP-suffixed directories and test files (*.spec.ts /
 * *.test.ts / *fakes.ts — they import vitest / node:test and must never
 * become build entries under the browser platform). Returns an entry map compatible with
 * rolldown's `input` option:
 * `{ 'components/ripple/ripple': 'src/components/ripple/ripple.ts', ... }`.
 *
 * Rolldown@1 does not support glob patterns in `input` natively, so we expand
 * the auto-discovery pattern here using Node's built-in fs APIs. This keeps the
 * entry list auto-generated — no manual `input` entries to maintain.
 */
function collectEntries(srcDir) {
    /** @type {Record<string, string>} */
    const entries = {}

    /** @param {string} dir */
    function walk(dir) {
        for (const name of readdirSync(dir)) {
            const full = join(dir, name)
            const st = statSync(full)
            if (st.isDirectory()) {
                if (WIP_DIRS.includes(name) || name.endsWith(WIP_SUFFIX)) continue
                walk(full)
            } else if (name.endsWith('.ts')) {
                if (name.endsWith('.spec.ts') || name.endsWith('.test.ts') || name.endsWith('fakes.ts')) continue
                const rel = relative(srcDir, full).split(sep).join('/')
                const key = rel.replace(/\.ts$/, '')
                entries[key] = `src/${rel}`
            }
        }
    }

    walk(srcDir)
    return entries
}

const srcDir = join(__dirname, 'src')
const input = collectEntries(srcDir)

export default defineConfig({
    input,
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
    plugins: [
        // mdcStyles must run before template(): it compiles marked `css`
        // literals (@state / nesting) into standard CSS. Requires
        // `@sandlada/styles` built first (root `npm run build` orders
        // styles before mdc).
        mdcStyles(),
        // CSS minification is intentionally disabled: shipped CSS is produced
        // at runtime by createStyleSheet (already minimal base+deltas) and
        // wrapped in unsafeCSS(), which this plugin skips anyway. Minifying
        // source-level `css` literals has zero download benefit and crashes
        // clean-css on custom syntax (@state / nesting / @layer lists).
        template({
            options: {
                shouldMinifyCSS: () => false,
            },
        }),
    ],
})
