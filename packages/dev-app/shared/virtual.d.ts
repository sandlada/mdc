/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

declare module 'virtual:mdc-manifest' {
    export interface ComponentEntry {
        name: string
        label: string
        href: string
        subtitle: string
        demoFiles: string
        custom: boolean
    }
    export const Components: ComponentEntry[]
}

declare module 'virtual:mdc-demo-loaders' {
    export interface ComponentDemosModule {
        demos: Record<string, string>
        tags: string[]
    }
    export const DemoFiles: Record<string, string[]>
    export const DemoLoaders: Record<string, () => Promise<ComponentDemosModule>>
}
