/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Single source of truth for the docs site's component list, derived live from
// the dev-app page folders via import.meta.glob. Vite 8 re-transforms this
// module whenever a matching page folder is added/removed in dev, so the
// sidebar and landing grid stay in sync without restarting the server.
//
// Each page's `<mdc-docs-page component="..." title="...">` tag declares the
// component name and its curated display label — parse them here rather than
// duplicating the list.
const pageModules = import.meta.glob('../components/*/index.html', {
    query: '?raw',
    eager: true,
    import: 'default',
}) as Record<string, string>

export interface ComponentEntry {
    name: string
    label: string
    href: string
}

function titleCase(name: string): string {
    return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function attr(tag: string, re: RegExp): string | undefined {
    return re.exec(tag)?.[1]
}

export const components: ComponentEntry[] = Object.keys(pageModules)
    .sort()
    .map((key) => {
        const folder = /\/components\/([^/]+)\/index\.html$/.exec(key)?.[1] ?? ''
        const tag = /<\s*mdc-docs-page\b([^>]*)>/.exec(pageModules[key])?.[1] ?? ''
        const name = attr(tag, /component="([^"]*)"/) ?? folder
        const label = attr(tag, /title="([^"]*)"/) ?? titleCase(folder)
        return { name, label, href: `/components/${name}/` }
    })
