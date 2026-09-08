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
        include: ['tests/**/*.spec.ts'],
        server: {
            deps: {
                inline: [/@sandlada\/.*/],
            },
        },
    },
    resolve: {
        alias: {
            '@sandlada/mdc': path.resolve(__dirname, '../mdc/src'),
        },
    },
})
