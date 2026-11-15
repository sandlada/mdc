/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { marked } from 'marked'

// Live registries derived from the library source. Vite re-transforms these
// modules when a matching file is added/removed, so new demos and components
// show up without editing anything here.
const ReadmeModules = import.meta.glob('../../../mdc/src/components/*/README.md', {
    query: '?raw',
    eager: true,
    import: 'default',
}) as Record<string, string>

const DemoModules = import.meta.glob('../../../mdc/src/components/*/demo/*.demo.html', {
    query: '?raw',
    eager: true,
    import: 'default',
}) as Record<string, string>

const ComponentDemoRe = /\/components\/([^/]+)\/demo\/([^/]+)$/
const ComponentReadmeRe = /\/components\/([^/]+)\/README\.md$/

export interface ComponentEntry {
    /** kebab-case folder name, e.g. `button`. */
    name: string
    /** human-readable label, e.g. `Button`. */
    label: string
    /** rendered README HTML (empty when the component has no README). */
    readmeHtml: string
}

const DemosByComponent = new Map<string, Record<string, string>>()
for (const [key, html] of Object.entries(DemoModules)) {
    const match = ComponentDemoRe.exec(key)
    if (!match) continue
    const component = match[1]
    const file = match[2]
    let bucket = DemosByComponent.get(component)
    if (!bucket) {
        bucket = {}
        DemosByComponent.set(component, bucket)
    }
    bucket[file] = html
}

const ReadmesByComponent = new Map<string, string>()
for (const [key, markdown] of Object.entries(ReadmeModules)) {
    const name = ComponentReadmeRe.exec(key)?.[1]
    if (name) ReadmesByComponent.set(name, markdown)
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

export const BaseComponentOrder = [
    'divider',
    'elevation',
    'focus-ring',
    'ripple',
    'badge',
    'icon',
    'typography',
] as const

const AllComponents: ComponentEntry[] = [...DemosByComponent.keys()]
    .sort()
    .map((name) => {
        const markdown = ReadmesByComponent.get(name) ?? ''
        return {
            name,
            label: titleCase(name),
            readmeHtml: markdown ? renderMarkdown(markdown) : '',
        }
    })

const ByName = new Map(AllComponents.map((entry) => [entry.name, entry]))
const BaseSet = new Set<string>(BaseComponentOrder)

export const Components = AllComponents

export const BaseComponents = BaseComponentOrder
    .map((name) => ByName.get(name))
    .filter((entry): entry is ComponentEntry => entry !== undefined)

export const RegularComponents = AllComponents.filter((entry) => !BaseSet.has(entry.name))

export function getComponent(name: string): ComponentEntry | undefined {
    return ByName.get(name)
}

export function listDemos(component: string): string[] {
    const bucket = DemosByComponent.get(component)
    return bucket ? Object.keys(bucket).sort() : []
}

export function getDemo(component: string, file: string): string {
    return DemosByComponent.get(component)?.[file] ?? ''
}
