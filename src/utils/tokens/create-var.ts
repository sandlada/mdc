/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Before:
 *      createVar(['--color', '--palette-red-5'], '#000')
 *
 * After:
 *      var(--color, var(--palette-red-5, #000))
 */
export function createVar(vars: string[], value: string) {
    return vars.reduce((p, c) => p + `var(${c}, `, '') + value + ')'.repeat(vars.length)
}
