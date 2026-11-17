/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Vite's `import.meta.glob` without `eager` keeps every demo as a lazy chunk:
// the initial page only loads the demos it renders instead of all ~400 raw
// demo snippets. `import: 'default'` normalizes each loader to the raw string.
const DemoModules = import.meta.glob('../../mdc/src/components/*/demo/*.demo.html', {
    query: '?raw',
    import: 'default',
}) as Record<string, () => Promise<string>>

const DemoKeys = Object.keys(DemoModules)
const DemoCache = new Map<string, string>()
const InFlight = new Map<string, Promise<string>>()

const keyOf = (componentName: string, demoFile: string): string =>
    `../../mdc/src/components/${componentName}/demo/${demoFile}`

const loadOne = (key: string): Promise<string> => {
    const cached = DemoCache.get(key)
    if (cached !== undefined) {
        return Promise.resolve(cached)
    }

    const pending = InFlight.get(key)
    if (pending !== undefined) {
        return pending
    }

    const loader = DemoModules[key]
    if (loader === undefined) {
        return Promise.resolve('')
    }

    const request = loader()
        .then((content) => {
            DemoCache.set(key, content)
            return content
        })
        .finally(() => {
            InFlight.delete(key)
        })

    InFlight.set(key, request)
    return request
}

/**
 * Load the raw HTML content of the requested demo snippets.
 *
 * Loaded snippets are cached, so repeated navigation between component pages
 * does not re-download them.
 *
 * @param componentName kebab-case component folder (e.g. 'button')
 * @param demoFiles demo file names (e.g. ['button.variant.demo.html'])
 */
export async function loadDemos(
    componentName: string,
    demoFiles: readonly string[],
): Promise<void> {
    await Promise.all(demoFiles.map((file) => loadOne(keyOf(componentName, file))))
}

/**
 * Get the cached raw HTML content of a per-component demo snippet.
 *
 * Returns an empty string until {@link loadDemos} has resolved the snippet.
 *
 * @param componentName kebab-case component folder (e.g. 'button')
 * @param demoFile demo file name (e.g. 'button.variant.demo.html')
 */
export function getDemo(componentName: string, demoFile: string): string {
    return DemoCache.get(keyOf(componentName, demoFile)) ?? ''
}

/**
 * List all demo files for a given component (sorted alphabetically).
 */
export function listDemos(componentName: string): string[] {
    const prefix = `../../mdc/src/components/${componentName}/demo/`
    return DemoKeys
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length))
        .sort()
}
