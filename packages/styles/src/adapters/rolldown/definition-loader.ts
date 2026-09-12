/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Node-only definition loader for the pre-build plugin. Bundles a single
 * definition module with rolldown (`platform: 'node'`, framework externals)
 * and evaluates it in a `node:vm` sandbox, returning the live definition
 * object. This mirrors the `rolldown` + VM genuine-CSS path proven in
  * `vscode-mdc` (`compiler-engine.ts`), so `${...}` interpolations,
 * `flow(...)` tables and token helpers resolve exactly as they do at
 * runtime instead of via fragile static analysis.
 *
 * This module must never be imported from browser code: it pulls `rolldown`
 * and `node:vm`. It ships exclusively through the `@sandlada/styles/rolldown`
 * subpath, which the package manifest constrains to Node.
 */

import { rolldown } from 'rolldown'
import * as vm from 'node:vm'
import * as path from 'node:path'
import { createRequire } from 'node:module'

export interface DefinitionLoadResult {
    readonly definition: Record<string, unknown>
}

/**
 * Bundle `entryPath` (an absolute `.ts` definition file) and return the
 * named export `exportName` evaluated as live objects.
 *
 * Fail-fast: any bundling, evaluation or missing-export error throws with
 * the file context attached. The plugin must never silently pass an
 * uncompiled stylesheet downstream to the CSS minifier.
 */
export const loadDefinition = (exportName: string) => async (entryPath: string): Promise<DefinitionLoadResult> => {
    const absPath = path.isAbsolute(entryPath) ? entryPath : path.resolve(process.cwd(), entryPath)
    let code = ''
    try {
        const bundle = await rolldown({
            input: absPath,
            platform: 'node',
            external: ['lit', /^@sandlada\//, /^node:/],
        })
        const { output } = await bundle.generate({ format: 'cjs' })
        code = output[0]?.code || ''
        await bundle.close()
    } catch (error) {
        throw new Error(`[mdc-styles] failed to bundle definition ${exportName} from ${absPath}: ${String(error)}`)
    }
    if (!code) {
        throw new Error(`[mdc-styles] empty bundle for definition ${exportName} from ${absPath}`)
    }

    const modExports: Record<string, unknown> = {}
    const sandbox = {
        module: { exports: modExports },
        exports: modExports,
        require: (id: string) => {
            try {
                return createRequire(absPath)(id)
            } catch (error) {
                throw new Error(`[mdc-styles] cannot resolve ${id} while loading ${exportName}: ${String(error)}`)
            }
        },
        console,
    }
    try {
        vm.createContext(sandbox)
        vm.runInContext(code, sandbox)
    } catch (error) {
        throw new Error(`[mdc-styles] failed to evaluate definition ${exportName} from ${absPath}: ${String(error)}`)
    }

    const definition = (sandbox.module.exports as Record<string, unknown>)[exportName]
    if (!definition || typeof definition !== 'object') {
        throw new Error(`[mdc-styles] export ${exportName} not found in ${absPath}`)
    }
    return { definition: definition as Record<string, unknown> }
}
