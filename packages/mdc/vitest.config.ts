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
            include: ['src/utils/**/*.ts', 'src/components/**/*.ts'],
            exclude: [
                'src/**/*.spec.ts',
                'src/**/*.test.ts',
                'src/**/*fakes.ts',
                'src/**/index.ts',
                'src/**/demo/**',
                'src/**/*.style.ts',
                'src/**/*.interface.ts',
                'src/**/*.definition.ts',
                'src/utils/testing/**',
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
