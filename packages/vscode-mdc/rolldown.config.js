/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from 'rolldown'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolveAlias = {
    '@sandlada/mdc': path.resolve(__dirname, '../mdc/src'),
    '@sandlada/styles': path.resolve(__dirname, '../styles/src'),
}

export default defineConfig([
    {
        input: 'src/extension.ts',
        output: {
            file: 'dist/extension.cjs',
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
        },
        external: ['vscode', 'typescript', 'rolldown', 'lit'],
        platform: 'node',
        resolve: {
            alias: resolveAlias,
        },
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.cjs',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: 'dist/index.js',
                format: 'esm',
                sourcemap: true,
            },
        ],
        external: ['vscode', 'typescript', 'rolldown', 'lit'],
        platform: 'node',
        resolve: {
            alias: resolveAlias,
        },
    },
])
