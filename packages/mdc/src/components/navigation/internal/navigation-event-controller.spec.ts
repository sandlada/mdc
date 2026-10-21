/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, afterEach } from 'vitest'
import type { ReactiveController } from 'lit'
import { GlobalNavigationStateStore } from '../../../utils/navigation/navigation-state-store'
import { NavigationEventController, type INavigationEventHost } from './navigation-event-controller'

class FakeHost extends EventTarget {
    public navigationScope = 'global'
    private readonly controllers: Partial<ReactiveController>[] = []

    public addController(controller: ReactiveController): void {
        this.controllers.push(controller)
    }

    public removeController(): void {}

    public requestUpdate(): void {}

    public get updateComplete(): Promise<boolean> {
        return Promise.resolve(true)
    }

    public connect(): void {
        for (const controller of this.controllers) controller.hostConnected?.()
    }

    public disconnect(): void {
        for (const controller of this.controllers) controller.hostDisconnected?.()
    }

    public update(): void {
        for (const controller of this.controllers) controller.hostUpdated?.()
    }
}

interface IRecordedEvent {
    type: string
    detail: readonly [string, string | undefined]
}

let scopeCounter = 0
const uniqueScope = () => `event-controller-scope-${++scopeCounter}`

const hosts: FakeHost[] = []

function createHost(scope: string): { host: FakeHost, events: IRecordedEvent[] } {
    const host = new FakeHost()
    host.navigationScope = scope
    new NavigationEventController(host as unknown as INavigationEventHost)

    const events: IRecordedEvent[] = []
    for (const type of ['input', 'change']) {
        host.addEventListener(type, (event) => {
            events.push({
                type,
                detail: (event as CustomEvent<IRecordedEvent['detail']>).detail,
            })
        })
    }

    host.connect()
    host.update()
    hosts.push(host)
    return { host, events }
}

afterEach(() => {
    for (const host of hosts.splice(0)) host.disconnect()
})

describe('NavigationEventController', () => {
    it('does not dispatch anything before any activation', () => {
        const { events } = createHost(uniqueScope())
        expect(events).toEqual([])
    })

    it('dispatches input and change with [newValue, undefined] for the first activation', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })

        expect(events).toEqual([
            { type: 'input', detail: ['/home', undefined] },
            { type: 'change', detail: ['/home', undefined] },
        ])
    })

    it('dispatches input before change with [newValue, oldValue] when the value changes', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })
        events.length = 0
        GlobalNavigationStateStore.setActive(scope, '/search', { source: 'user', trigger: 'keyboard' })

        expect(events).toEqual([
            { type: 'input', detail: ['/search', '/home'] },
            { type: 'change', detail: ['/search', '/home'] },
        ])
    })

    it('dispatches only input when the same value is activated again', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })
        events.length = 0
        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })

        expect(events).toEqual([
            { type: 'input', detail: ['/home', '/home'] },
        ])
    })

    it('dispatches input and change for programmatic activation', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/settings', { source: 'external', trigger: 'programmatic' })

        expect(events).toEqual([
            { type: 'input', detail: ['/settings', undefined] },
            { type: 'change', detail: ['/settings', undefined] },
        ])
    })

    it('dispatches only input for programmatic activation of the current value', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/settings', { source: 'external', trigger: 'programmatic' })
        events.length = 0
        GlobalNavigationStateStore.setActive(scope, '/settings', { source: 'external', trigger: 'programmatic' })

        expect(events).toEqual([
            { type: 'input', detail: ['/settings', '/settings'] },
        ])
    })

    it('dispatches events for activations that originate from another container in the same scope', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/inbox', {
            source: 'user',
            trigger: 'pointer',
            originId: 'tab-in-another-container',
        })

        expect(events).toEqual([
            { type: 'input', detail: ['/inbox', undefined] },
            { type: 'change', detail: ['/inbox', undefined] },
        ])
    })

    it('does not dispatch when the active value is cleared', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })
        events.length = 0
        GlobalNavigationStateStore.setActive(scope, null, { source: 'external', trigger: 'programmatic' })

        expect(events).toEqual([])
    })

    it('ignores activations in other scopes', () => {
        const scope = uniqueScope()
        const { events } = createHost(scope)

        GlobalNavigationStateStore.setActive(uniqueScope(), '/home', { source: 'user', trigger: 'pointer' })

        expect(events).toEqual([])
    })

    it('dispatches on every host that shares the scope, each on its own element', () => {
        const scope = uniqueScope()
        const first = createHost(scope)
        const second = createHost(scope)

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })

        expect(first.events).toHaveLength(2)
        expect(second.events).toHaveLength(2)
    })

    it('follows the new scope after navigationScope changes', () => {
        const oldScope = uniqueScope()
        const newScope = uniqueScope()
        const { host, events } = createHost(oldScope)

        host.navigationScope = newScope
        host.update()

        GlobalNavigationStateStore.setActive(oldScope, '/home', { source: 'user', trigger: 'pointer' })
        expect(events).toEqual([])

        GlobalNavigationStateStore.setActive(newScope, '/home', { source: 'user', trigger: 'pointer' })
        expect(events).toEqual([
            { type: 'input', detail: ['/home', undefined] },
            { type: 'change', detail: ['/home', undefined] },
        ])
    })

    it('dispatches composed events so they cross shadow boundaries', () => {
        const scope = uniqueScope()
        const { host } = createHost(scope)
        const composedFlags: boolean[] = []
        for (const type of ['input', 'change']) {
            host.addEventListener(type, (event) => {
                composedFlags.push(event.composed)
            })
        }

        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })

        expect(composedFlags).toEqual([true, true])
    })

    it('stops dispatching after disconnect and resumes after reconnect', () => {
        const scope = uniqueScope()
        const { host, events } = createHost(scope)

        host.disconnect()
        GlobalNavigationStateStore.setActive(scope, '/home', { source: 'user', trigger: 'pointer' })
        expect(events).toEqual([])

        host.connect()
        GlobalNavigationStateStore.setActive(scope, '/search', { source: 'user', trigger: 'pointer' })
        expect(events).toEqual([
            { type: 'input', detail: ['/search', '/home'] },
            { type: 'change', detail: ['/search', '/home'] },
        ])
    })
})
