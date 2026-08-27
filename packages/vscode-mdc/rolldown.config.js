import { defineConfig } from 'rolldown'

export default defineConfig([
    {
        input: 'src/extension.ts',
        output: {
            file: 'dist/extension.cjs',
            format: 'cjs',
            sourcemap: true,
        },
        external: ['vscode', 'typescript', 'rolldown', 'lit'],
        platform: 'node',
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.cjs',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/index.js',
                format: 'esm',
                sourcemap: true,
            },
        ],
        external: ['vscode', 'typescript', 'rolldown', 'lit'],
        platform: 'node',
    },
])
