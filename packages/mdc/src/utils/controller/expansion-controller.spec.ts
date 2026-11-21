// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    ExpansionController,
    ExpansionGroupController,
    type IExpansionGroupHost,
    type IExpansionGroupItem,
    type IExpansionHost,
} from './expansion-controller'

class MockExpansionHost extends HTMLElement implements IExpansionHost {
    public expanded = false
    public disabled = false
    public quick = true
    public controllers: ReactiveController[] = []
    public updateComplete = Promise.resolve(true)

    public addController(controller: ReactiveController): void {
        this.controllers.push(controller)
    }
    public removeController(controller: ReactiveController): void {
        const idx = this.controllers.indexOf(controller)
        if (idx >= 0) this.controllers.splice(idx, 1)
    }
    public requestUpdate(): void {}
    public triggerUpdate(): void {
        for (const c of this.controllers) {
            c.hostUpdate?.()
        }
    }
}
customElements.define('mock-expansion-host', MockExpansionHost)

class MockGroupItem extends HTMLElement implements IExpansionGroupItem {
    public expanded = false
    public disabled = false
    public focusHeader = vi.fn()
}
customElements.define('mock-group-item', MockGroupItem)

class MockGroupHost extends HTMLElement implements IExpansionGroupHost<MockGroupItem> {
    public mode: 'multiple' | 'single' = 'single'
    public collapsible = true
    public controllers: ReactiveController[] = []
    public updateComplete = Promise.resolve(true)
    public changes: Array<{ expandedIndices: number[]; expanded: boolean }> = []

    public addController(controller: ReactiveController): void {
        this.controllers.push(controller)
    }
    public removeController(controller: ReactiveController): void {
        const idx = this.controllers.indexOf(controller)
        if (idx >= 0) this.controllers.splice(idx, 1)
    }
    public requestUpdate(): void {}
    public getExpansionItems(): MockGroupItem[] {
        return Array.from(this.querySelectorAll('mock-group-item'))
    }
    public onExpansionGroupChange(detail: {
        expandedIndices: number[]
        expandedItems: MockGroupItem[]
        changedItem: MockGroupItem
        expanded: boolean
    }): void {
        this.changes.push({ expandedIndices: detail.expandedIndices, expanded: detail.expanded })
    }
    public connectedCallback(): void {
        for (const c of this.controllers) c.hostConnected?.()
    }
    public disconnectedCallback(): void {
        for (const c of this.controllers) c.hostDisconnected?.()
    }
}
customElements.define('mock-group-host', MockGroupHost)

describe('ExpansionController & ExpansionGroupController', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('dispatches cancelable toggleEvent and lifecycle events on state change', async () => {
        const host = new MockExpansionHost()
        const collapseEl = document.createElement('div')
        const controller = new ExpansionController(host, {
            getCollapseElement: () => collapseEl,
            toggleEvent       : 'test-toggle',
            expandingEvent    : 'test-expanding',
            expandedEvent     : 'test-expanded',
            collapsingEvent   : 'test-collapsing',
            collapsedEvent    : 'test-collapsed',
        })

        const events: string[] = []
        host.addEventListener('test-expanding', () => events.push('expanding'))
        host.addEventListener('test-expanded', () => events.push('expanded'))
        host.addEventListener('test-collapsing', () => events.push('collapsing'))
        host.addEventListener('test-collapsed', () => events.push('collapsed'))

        expect(controller.requestToggle()).toBe(true)
        expect(host.expanded).toBe(true)
        host.triggerUpdate()
        expect(events).toEqual(['expanding', 'expanded'])

        await controller.collapse()
        host.triggerUpdate()
        expect(host.expanded).toBe(false)
        expect(events).toEqual(['expanding', 'expanded', 'collapsing', 'collapsed'])

        host.addEventListener('test-toggle', e => e.preventDefault(), { once: true })
        expect(controller.requestToggle()).toBe(false)
        expect(host.expanded).toBe(false)
    })

    it('coordinates single mode and collapsible guard in ExpansionGroupController', async () => {
        const group = new MockGroupHost()
        const controller = new ExpansionGroupController(group, { toggleEvent: 'item-toggle' })
        const a = new MockGroupItem()
        const b = new MockGroupItem()
        a.expanded = true
        group.append(a, b)
        document.body.appendChild(group)

        // Expand b -> collapses a
        const ev1 = new CustomEvent('item-toggle', { bubbles: true, cancelable: true, detail: { expanded: true } })
        b.dispatchEvent(ev1)
        b.expanded = true
        await Promise.resolve()

        expect(a.expanded).toBe(false)
        expect(b.expanded).toBe(true)
        expect(group.changes.at(-1)?.expandedIndices).toEqual([1])

        // collapsible = false -> prevents collapsing b
        group.collapsible = false
        const ev2 = new CustomEvent('item-toggle', { bubbles: true, cancelable: true, detail: { expanded: false } })
        const allowed = b.dispatchEvent(ev2)
        expect(allowed).toBe(false)

        controller.expandAt(0)
        expect(a.expanded).toBe(true)
        expect(b.expanded).toBe(false)
    })
})
