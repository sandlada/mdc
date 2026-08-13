/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Vite's import.meta.glob with `?raw` produces namespace imports where each
// value is `{ default: '<raw text>' }`. Normalize to plain strings so consumers
// can pass them straight to `unsafeHTML()` / `<template>.innerHTML`.
const rawModules = import.meta.glob('../../mdc/src/components/*/demo/*.demo.html', {
    query: '?raw',
    eager: true,
}) as Record<string, string | { default: string }>

const rawDemos: Record<string, string> = {}
for (const [key, value] of Object.entries(rawModules)) {
    rawDemos[key] = typeof value === 'string' ? value : value.default
}

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