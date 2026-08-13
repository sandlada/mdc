// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import template from "rollup-plugin-html-literals"
import { getComponentModuleInputEntries } from './get-build-input-option.js'

/** @type {import('rollup').RollupOptions} */
export default defineConfig({
    input: {
        ...getComponentModuleInputEntries(),
    },
    output: {
        dir: 'build',
        format: 'esm',
    },
    plugins: [
        template(),
        nodeResolve(),
        terser({
            ecma: 2022,
            module: true,
            warnings: true,
        }),
        // template(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
    ],
});
