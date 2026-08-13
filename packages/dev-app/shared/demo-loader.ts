/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Vite's import.meta.glob collects all *.demo.html files at build/dev time
// as raw strings. Keys are paths relative to this file (so we resolve them
// back from the consumer's perspective).
const rawDemos = import.meta.glob('../../mdc/src/components/*/demo/*.demo.html', {
    query: '?raw',
    eager: true,
}) as Record<string, string>

/**
 * Get the raw HTML content of a per-component demo snippet.
 *
 * @param componentName kebab-case component folder (e.g. 'button')
 * @param demoFile demo file name (e.g. 'button.variant.demo.html')
 */
export function getDemo(componentName: string, demoFile: string): string {
    const key = `../../mdc/src/components/${componentName}/demo/${demoFile}`
    return rawDemos[key] ?? ''
}

/**
 * List all demo files for a given component (sorted alphabetically).
 */
export function listDemos(componentName: string): string[] {
    const prefix = `../../mdc/src/components/${componentName}/demo/`
    return Object.keys(rawDemos)
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length))
        .sort()
}