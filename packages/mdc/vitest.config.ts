/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        server: {
            deps: {
                inline: [/@sandlada\/.*/],
            },
        },
    },
    resolve: {
        alias: {
            // Tests resolve workspace styles to source (not build/): identical
            // module graph to pre-split relative imports, no rebuild needed,
            // and no browser-conditioned bundles in the node environment.
            '@sandlada/styles': path.resolve(__dirname, '../styles/src'),
        },
    },
})
