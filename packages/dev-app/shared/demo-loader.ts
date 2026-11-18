/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { DemoFiles, DemoLoaders, type ComponentDemosModule } from 'virtual:mdc-demo-loaders'

const DemoCache = new Map<string, ComponentDemosModule>()
const InFlight = new Map<string, Promise<ComponentDemosModule>>()

const EmptyModule: ComponentDemosModule = { demos: {}, tags: [] }

/**
 * Load all demo snippets and their referenced `mdc-*` tags for a component in
 * a single virtual module request, with in-memory caching across SPA navigations.
 */
export function loadDemos(componentName: string): Promise<ComponentDemosModule> {
    const cached = DemoCache.get(componentName)
    if (cached !== undefined) {
        return Promise.resolve(cached)
    }

    const pending = InFlight.get(componentName)
    if (pending !== undefined) {
        return pending
    }

    const loader = DemoLoaders[componentName]
    if (loader === undefined) {
        return Promise.resolve(EmptyModule)
    }

    const request = loader()
        .then((mod) => {
            DemoCache.set(componentName, mod)
            return mod
        })
        .finally(() => {
            InFlight.delete(componentName)
        })

    InFlight.set(componentName, request)
    return request
}

/**
 * Get the cached raw HTML content of a per-component demo snippet.
 *
 * Returns an empty string until {@link loadDemos} has resolved the component.
 */
export function getDemo(componentName: string, demoFile: string): string {
    return DemoCache.get(componentName)?.demos[demoFile] ?? ''
}

/**
 * List all `*.demo.html` files discovered for a given component folder.
 */
export function listDemos(componentName: string): string[] {
    return DemoFiles[componentName] ?? []
}
