import { defineConfig } from 'rolldown'
import template from 'rollup-plugin-html-literals'

export default defineConfig({
    input: {
        'components/ripple/ripple': 'src/components/ripple/ripple.ts',
        'components/ripple/ripple-options.mixin': 'src/components/ripple/ripple-options.mixin.ts',
        'components/focus-ring/focus-ring': 'src/components/focus-ring/focus-ring.ts',
        'components/focus-ring/focus-ring-options.mixin': 'src/components/focus-ring/focus-ring-options.mixin.ts',
    },
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
