/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
    GlobalNavigationStateStore,
    type NavigationScopeMutation,
} from '../../../utils/navigation/navigation-state-store'
import type { IMDCNavigationValueChangeDetail } from '../navigation.interface'

export interface INavigationEventHost extends ReactiveControllerHost, HTMLElement {
    readonly navigationScope: string
}

/**
 * Dispatches `input` and `change` for a navigation container.
 *
 * Subscribes to the navigation scope of the host, so every activation in that
 * scope is observed regardless of its origin (pointer, keyboard, cross-container
 * sync, or `setActive()`).
 */
export class NavigationEventController implements ReactiveController {
    private readonly host: INavigationEventHost
    private subscribedScope: string | null = null
    private unsubscribe: (() => void) | null = null

    constructor(host: INavigationEventHost) {
        this.host = host
        host.addController(this)
    }

    public hostConnected(): void {
        this.subscribe()
    }

    public hostUpdated(): void {
        if (this.host.navigationScope !== this.subscribedScope) {
            this.subscribe()
        }
    }

    public hostDisconnected(): void {
        this.unsubscribeScope()
    }

    private subscribe(): void {
        this.unsubscribeScope()
        this.subscribedScope = this.host.navigationScope
        this.unsubscribe = GlobalNavigationStateStore.subscribe(this.subscribedScope, this.handleMutation)
    }

    private unsubscribeScope(): void {
        this.unsubscribe?.()
        this.unsubscribe = null
        this.subscribedScope = null
    }

    private readonly handleMutation = (mutation: NavigationScopeMutation): void => {
        if (mutation.activeValue === null) return

        const detail: IMDCNavigationValueChangeDetail = [
            mutation.activeValue,
            mutation.previousValue ?? undefined,
        ]

        this.host.dispatchEvent(new CustomEvent<IMDCNavigationValueChangeDetail>('input', { bubbles: true, composed: true, detail }))

        if (mutation.changed) {
            this.host.dispatchEvent(new CustomEvent<IMDCNavigationValueChangeDetail>('change', { bubbles: true, composed: true, detail }))
        }
    }
}
