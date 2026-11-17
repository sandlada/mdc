/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        setupFiles: ['src/utils/testing/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text-summary', 'text', 'json-summary'],
            include: ['src/utils/**/*.ts'],
            exclude: [
                'src/utils/**/*.spec.ts',
                'src/utils/testing/**',
                'src/utils/**/index.ts',
            ],
            thresholds: {
                'src/utils/**': {
                    lines: 90,
                    branches: 85,
                },
            },
        },
    },
})
