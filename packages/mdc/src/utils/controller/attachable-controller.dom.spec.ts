/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import {
    AttachableController,
    type IAttachableControllerHost,
} from './attachable-controller'

// Vitest resolves lit's `node` export where `isServer` is true; force browser.
vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

class AttachableHost extends HTMLElement {
    public controllers: ReactiveController[] = []
    public addController(controller: ReactiveController) {
        this.controllers.push(controller)
    }
    public requestUpdate() {}
    public updateComplete = Promise.resolve(true)
}

customElements.define('attachable-dom-host', AttachableHost)

type Change = [HTMLElement | null, HTMLElement | null]

const flushObserver = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const createHost = (forId?: string) => {
    const host = new AttachableHost()
    if (forId !== undefined) {
        host.setAttribute('for', forId)
    }
    document.body.appendChild(host)
    const changes: Change[] = []
    const controller = new AttachableController(
        host as unknown as IAttachableControllerHost,
        (previous, next) => {
            changes.push([previous, next])
        },
    )

    return { host, controller, changes }
}

const createTarget = (id: string) => {
    const target = document.createElement('div')
    target.id = id
    document.body.appendChild(target)
    return target
}

describe('AttachableController DOM integration', () => {
    it('registers itself and falls back to the parent element', () => {
        const { host, controller } = createHost()

        expect(host.controllers).toContain(controller)
        expect(controller.control).toBe(document.body)
    })

    it('treats an empty for attribute as intentionally detached', () => {
        const { controller, changes } = createHost('')
        controller.hostConnected()

        expect(controller.control).toBeNull()
        expect(changes).toEqual([])
    })

    it('resolves a for id through the document', () => {
        const target = createTarget('document-target')
        const { controller, changes } = createHost('document-target')
        controller.hostConnected()

        expect(controller.control).toBe(target)
        expect(changes).toEqual([[null, target]])
    })

    it('returns null when the referenced id is missing', () => {
        const { controller } = createHost('missing')
        controller.hostConnected()

        expect(controller.control).toBeNull()
    })

    it('returns null while disconnected and resolves after connecting', () => {
        const target = createTarget('reconnect-target')
        const host = new AttachableHost()
        host.setAttribute('for', 'reconnect-target')
        const controller = new AttachableController(
            host as unknown as IAttachableControllerHost,
            () => {},
        )

        controller.hostConnected()
        expect(controller.control).toBeNull()

        document.body.appendChild(host)
        controller.hostConnected()
        expect(controller.control).toBe(target)
    })

    it('resolves ids inside a shadow root only through that root', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const shadow = container.attachShadow({ mode: 'open' })
        const target = document.createElement('div')
        target.id = 'shadow-target'
        shadow.appendChild(target)
        createTarget('shadow-target')

        const host = new AttachableHost()
        host.setAttribute('for', 'shadow-target')
        shadow.appendChild(host)
        const controller = new AttachableController(
            host as unknown as IAttachableControllerHost,
            () => {},
        )

        controller.hostConnected()

        expect(controller.control).toBe(target)
    })

    it('returns null when the id only exists outside the shadow root', () => {
        createTarget('outside-target')
        const container = document.createElement('div')
        document.body.appendChild(container)
        const shadow = container.attachShadow({ mode: 'open' })
        const host = new AttachableHost()
        host.setAttribute('for', 'outside-target')
        shadow.appendChild(host)
        const controller = new AttachableController(
            host as unknown as IAttachableControllerHost,
            () => {},
        )

        controller.hostConnected()

        expect(controller.control).toBeNull()
    })

    it('applies an empty for attribute through htmlFor and detaches', async () => {
        const { host, controller, changes } = createHost()
        controller.hostConnected()

        controller.htmlFor = ''

        expect(host.getAttribute('for')).toBe('')
        await flushObserver()
        expect(controller.control).toBeNull()
        expect(changes).toEqual([
            [null, document.body],
            [document.body, null],
        ])
    })

    it('attaches and detaches a control imperatively', async () => {
        const { host, controller, changes } = createHost()
        controller.hostConnected()
        const control = createTarget('attached-control')

        controller.attach(control)

        expect(controller.control).toBe(control)
        expect(host.hasAttribute('for')).toBe(false)
        expect(changes).toEqual([
            [null, document.body],
            [document.body, control],
        ])

        controller.detach()

        expect(controller.control).toBeNull()
        expect(host.getAttribute('for')).toBe('')
        expect(changes.slice(0, 3)).toEqual([
            [null, document.body],
            [document.body, control],
            [control, null],
        ])

        await flushObserver()
        expect(controller.control).toBeNull()
    })

    it('ignores a repeated attach of the same control', () => {
        const { controller, changes } = createHost()
        controller.hostConnected()
        const control = createTarget('repeated-control')

        controller.attach(control)
        controller.attach(control)

        expect(changes).toEqual([
            [null, document.body],
            [document.body, control],
        ])
    })

    it('does not notify twice when attach removes an existing for attribute', async () => {
        const first = createTarget('for-control')
        const second = createTarget('attached-control')
        const { controller, changes } = createHost('for-control')
        controller.hostConnected()

        expect(controller.control).toBe(first)

        controller.attach(second)
        await flushObserver()

        expect(controller.control).toBe(second)
        expect(changes).toEqual([
            [null, first],
            [first, second],
        ])
    })

    it('supports the control setter for attach and detach', () => {
        const { controller } = createHost()
        controller.hostConnected()
        const control = createTarget('setter-control')

        controller.control = control
        expect(controller.control).toBe(control)

        controller.control = null
        expect(controller.control).toBeNull()
    })

    it('re-resolves the control when the for attribute changes', async () => {
        const first = createTarget('first-control')
        const second = createTarget('second-control')
        const { host, controller, changes } = createHost('first-control')
        controller.hostConnected()

        expect(controller.control).toBe(first)

        host.setAttribute('for', 'second-control')
        await flushObserver()

        expect(controller.control).toBe(second)
        expect(changes).toEqual([
            [null, first],
            [first, second],
        ])
    })

    it('ignores unrelated attribute mutations', async () => {
        const target = createTarget('stable-control')
        const { host, controller, changes } = createHost('stable-control')
        controller.hostConnected()

        const before = changes.length
        host.setAttribute('data-other', '1')
        await flushObserver()

        expect(changes).toHaveLength(before)
        expect(controller.control).toBe(target)
    })

    it('clears the control on disconnection', () => {
        const { host, controller, changes } = createHost()
        controller.hostConnected()
        const control = createTarget('disconnect-control')
        controller.attach(control)

        host.remove()
        controller.hostDisconnected()

        expect(controller.control).toBeNull()
        expect(changes.at(-1)).toEqual([control, null])
    })

    it('rejects IDs with ASCII whitespace on the attribute path', () => {
        const host = new AttachableHost()
        host.setAttribute('for', 'a b')
        document.body.appendChild(host)
        const controller = new AttachableController(
            host as unknown as IAttachableControllerHost,
            () => {},
        )

        expect(() => controller.control).toThrow(
            /Invalid "for" id .*HTML IDs must not contain ASCII whitespace/,
        )
    })
})
