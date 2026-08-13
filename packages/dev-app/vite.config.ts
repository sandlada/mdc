import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const srcRoot = fileURLToPath(new URL('../mdc/src', import.meta.url))

// Collect every components/*/index.html + the root index.html for Vite MPA mode.
function collectHtmlInputs(devAppRoot: string): Record<string, string> {
    const inputs: Record<string, string> = { main: join(devAppRoot, 'index.html') }
    const compsDir = join(devAppRoot, 'components')
    for (const name of readdirSync(compsDir)) {
        const file = join(compsDir, name, 'index.html')
        inputs[`components/${name}/index`] = file
    }
    return inputs
}

export default defineConfig(({ command }) => ({
    resolve: {
        alias: [
            { find: '@sandlada/mdc/all', replacement: `${srcRoot}/all.ts` },
            { find: '@sandlada/mdc/definitions', replacement: `${srcRoot}/definitions.ts` },
            { find: '@sandlada/mdc/utils', replacement: `${srcRoot}/utils.ts` },
            { find: /^@sandlada\/mdc\/(.*)/, replacement: `${srcRoot}/$1` },
        ],
    },
    build: command === 'build' ? {
        rollupOptions: {
            input: collectHtmlInputs(fileURLToPath(new URL('.', import.meta.url))),
        },
    } : undefined,
}))