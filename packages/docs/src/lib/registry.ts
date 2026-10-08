/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { marked } from 'marked'

// Live registries derived from the library source. Vite re-transforms these
// modules when a matching file is added/removed, so new demos and components
// show up without editing anything here.
const readmeModules = import.meta.glob('../../../mdc/src/components/*/README.md', {
    query: '?raw',
    eager: true,
    import: 'default',
}) as Record<string, string>

const demoModules = import.meta.glob('../../../mdc/src/components/*/demo/*.demo.html', {
    query: '?raw',
    eager: true,
    import: 'default',
}) as Record<string, string>

const COMPONENT_DEMO_RE = /\/components\/([^/]+)\/demo\/([^/]+)$/
const COMPONENT_README_RE = /\/components\/([^/]+)\/README\.md$/

export interface ComponentEntry {
    /** kebab-case folder name, e.g. `button`. */
    name: string
    /** human-readable label, e.g. `Button`. */
    label: string
    /** rendered README HTML (empty when the component has no README). */
    readmeHtml: string
}

const demosByComponent = new Map<string, Record<string, string>>()
for (const [key, html] of Object.entries(demoModules)) {
    const match = COMPONENT_DEMO_RE.exec(key)
    if (!match) continue
    const component = match[1]
    const file = match[2]
    let bucket = demosByComponent.get(component)
    if (!bucket) {
        bucket = {}
        demosByComponent.set(component, bucket)
    }
    bucket[file] = html
}

const readmesByComponent = new Map<string, string>()
for (const [key, markdown] of Object.entries(readmeModules)) {
    const name = COMPONENT_README_RE.exec(key)?.[1]
    if (name) readmesByComponent.set(name, markdown)
}

function titleCase(value: string): string {
    return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/** `badge.interval.demo.html` -> `Interval`. */
export function demoLabel(file: string): string {
    const base = file.replace(/\.demo\.html$/, '').replace(/^[^.]+\./, '')
    return base
        .split(/[.-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function renderMarkdown(markdown: string): string {
    // Drop the leading `# Title` heading - the page already renders the title.
    const body = markdown.replace(/^#\s+.*\r?\n/, '')
    return marked.parse(body, { async: false }) as string
}

export const BASE_COMPONENT_ORDER = [
    'divider',
    'elevation',
    'focus-ring',
    'ripple',
    'badge',
    'icon',
    'typography',
] as const

const allComponents: ComponentEntry[] = [...demosByComponent.keys()]
    .sort()
    .map((name) => {
        const markdown = readmesByComponent.get(name) ?? ''
        return {
            name,
            label: titleCase(name),
            readmeHtml: markdown ? renderMarkdown(markdown) : '',
        }
    })

const byName = new Map(allComponents.map((entry) => [entry.name, entry]))
const baseSet = new Set<string>(BASE_COMPONENT_ORDER)

export const components = allComponents

export const baseComponents = BASE_COMPONENT_ORDER
    .map((name) => byName.get(name))
    .filter((entry): entry is ComponentEntry => entry !== undefined)

export const regularComponents = allComponents.filter((entry) => !baseSet.has(entry.name))

export function getComponent(name: string): ComponentEntry | undefined {
    return byName.get(name)
}

export function listDemos(component: string): string[] {
    const bucket = demosByComponent.get(component)
    return bucket ? Object.keys(bucket).sort() : []
}

export function getDemo(component: string, file: string): string {
    return demosByComponent.get(component)?.[file] ?? ''
}
