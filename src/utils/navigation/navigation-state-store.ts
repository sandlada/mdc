/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Scope-based navigation state store used to synchronize navigation tabs
 * across containers such as bar, rail, and drawer.
 *
 * @example
 * ```ts
 * import { GlobalNavigationStateStore } from '@sandlada/mdc/utils'
 *
 * const unsubscribe = GlobalNavigationStateStore.subscribe('main-nav', (mutation) => {
 *   console.log(mutation.activeValue, mutation.source, mutation.trigger)
 * })
 *
 * GlobalNavigationStateStore.setActive('main-nav', '/home', {
 *   source: 'user',
 *   trigger: 'pointer',
 * })
 *
 * unsubscribe()
 * ```
 */

export type NavigationEventSource = 'user' | 'external'

export type NavigationEventTrigger = 'pointer' | 'keyboard' | 'programmatic'

export interface NavigationSetActiveOptions {
    source?: NavigationEventSource
    trigger?: NavigationEventTrigger
    originId?: string | null
}

export interface NavigationScopeMutation {
    scope: string
    activeValue: string | null
    previousValue: string | null
    changed: boolean
    source: NavigationEventSource
    trigger: NavigationEventTrigger
    originId: string | null
    mutationId: number
}

export type NavigationScopeListener = (mutation: NavigationScopeMutation) => void

interface NavigationScopeRecord {
    activeValue: string | null
    previousValue: string | null
    listeners: Set<NavigationScopeListener>
}

export class NavigationStateStore {
    private constructor() {}

    private static _Instance: NavigationStateStore | null = null

    public static get Instance() {
        if (!this._Instance) this._Instance = new NavigationStateStore()
        return this._Instance
    }

    private mutationCounter = 0

    private readonly scopes = new Map<string, NavigationScopeRecord>()

    /** Returns the current active value for a given scope. */
    public getActive(scope: string): string | null {
        return this.getOrCreateScope(this.normalizeScope(scope)).activeValue
    }

    /**
     * Subscribes to all mutations within a scope and returns an unsubscribe
     * callback.
     */
    public subscribe(scope: string, listener: NavigationScopeListener): () => void {
        const normalizedScope = this.normalizeScope(scope)
        const scopeRecord = this.getOrCreateScope(normalizedScope)

        scopeRecord.listeners.add(listener)

        return () => {
            const currentScope = this.scopes.get(normalizedScope)
            if (!currentScope) return

            currentScope.listeners.delete(listener)

            if (
                currentScope.listeners.size === 0
                && currentScope.activeValue === null
                && currentScope.previousValue === null
            ) {
                this.scopes.delete(normalizedScope)
            }
        }
    }

    public setActive(
        scope: string,
        value: string | null,
        options: NavigationSetActiveOptions = {},
    ): NavigationScopeMutation {
        const normalizedScope = this.normalizeScope(scope)
        const scopeRecord = this.getOrCreateScope(normalizedScope)
        const previousValue = scopeRecord.activeValue
        const changed = previousValue !== value

        if (changed) {
            scopeRecord.previousValue = previousValue
            scopeRecord.activeValue = value
        }

        this.mutationCounter += 1

        const mutation: NavigationScopeMutation = {
            scope: normalizedScope,
            activeValue: scopeRecord.activeValue,
            previousValue,
            changed,
            source: options.source ?? 'external',
            trigger: options.trigger ?? 'programmatic',
            originId: options.originId ?? null,
            mutationId: this.mutationCounter,
        }

        const listeners = Array.from(scopeRecord.listeners)
        for (const listener of listeners) {
            listener(mutation)
        }

        return mutation
    }

    /** Removes all state and listeners for a scope. */
    public clearScope(scope: string): void {
        this.scopes.delete(this.normalizeScope(scope))
    }

    private normalizeScope(scope: string): string {
        const normalizedScope = scope.trim()
        return normalizedScope.length > 0 ? normalizedScope : 'global'
    }

    private getOrCreateScope(scope: string): NavigationScopeRecord {
        let record = this.scopes.get(scope)

        if (!record) {
            record = {
                activeValue: null,
                previousValue: null,
                listeners: new Set(),
            }
            this.scopes.set(scope, record)
        }

        return record
    }
}

export const GlobalNavigationStateStore = NavigationStateStore.Instance
