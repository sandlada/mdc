import { defineConfig } from 'rolldown'
import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import template from 'rollup-plugin-html-literals'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Mirror the 9 tsconfig exclude directories. Paths use the OS separator so
 * they match the relative paths returned by Node's fs APIs.
 */
const WIP_DIRS = [
    'button-group',
    'wave',
    'toolbar',
]
const WIP_SUFFIX = '-old'

/**
 * Recursively enumerate every .ts file under `src/`, skipping WIP directories
 * and WIP-suffixed directories. Returns an entry map compatible with rolldown's
 * `input` option: `{ 'components/ripple/ripple': 'src/components/ripple/ripple.ts', ... }`.
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
        minify: true,
        sourcemap: true,
        preserveModules: true,
    },
    platform: 'browser',
    tsconfig: './tsconfig.json',
    plugins: [
        template(),
    ],
})
