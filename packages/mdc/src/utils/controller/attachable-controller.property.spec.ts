/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
    AttachableController,
    type IAttachableControllerHost,
} from './attachable-controller'

interface FakeHost {
    host: IAttachableControllerHost
    controller: AttachableController
    attributes: Map<string, string>
    changes: Array<[HTMLElement | null, HTMLElement | null]>
    parent: HTMLElement
}

const createHost = (): FakeHost => {
    const attributes = new Map<string, string>()
    const parent = {} as HTMLElement
    const changes: Array<[HTMLElement | null, HTMLElement | null]> = []
    const host = {
        isConnected: true,
        parentElement: parent,
        addController: () => {},
        getAttribute: (name: string) => attributes.get(name) ?? null,
        hasAttribute: (name: string) => attributes.has(name),
        setAttribute: (name: string, value: string) => {
            attributes.set(name, value)
        },
        removeAttribute: (name: string) => {
            attributes.delete(name)
        },
        getRootNode: () => ({ getElementById: () => null }),
    } as unknown as IAttachableControllerHost

    const controller = new AttachableController(host, (previous, next) => {
        changes.push([previous, next])
    })

    return { host, controller, attributes, changes, parent }
}

const Whitespace = /[\t\n\f\r ]/

const validId = fc.string().map((id) => id.replace(/[\t\n\f\r ]/g, '_'))

describe('AttachableController properties', () => {
    it('accepts exactly the ids without ASCII whitespace', () => {
        fc.assert(
            fc.property(fc.string(), (id) => {
                const { controller, attributes } = createHost()
                const accepted = id === '' || !Whitespace.test(id)

                if (accepted) {
                    expect(() => {
                        controller.htmlFor = id
                    }).not.toThrow()
                    expect(attributes.get('for')).toBe(id)
                    return
                }

                expect(() => {
                    controller.htmlFor = id
                }).toThrow(/HTML IDs must not contain ASCII whitespace/)
                expect(attributes.has('for')).toBe(false)
            }),
        )
    })

    it('clears the attribute when htmlFor is null', () => {
        fc.assert(
            fc.property(validId, (id) => {
                const { controller, attributes } = createHost()
                controller.htmlFor = id

                controller.htmlFor = null

                expect(attributes.has('for')).toBe(false)
                expect(controller.htmlFor).toBeNull()
            }),
        )
    })

    it('attaches a control once and removes the for attribute', () => {
        fc.assert(
            fc.property(fc.string(), (id) => {
                const control = { id } as HTMLElement
                const { controller, attributes, changes } = createHost()

                controller.attach(control)

                expect(controller.control).toBe(control)
                expect(attributes.has('for')).toBe(false)
                expect(changes).toEqual([[null, control]])

                controller.attach(control)

                expect(controller.control).toBe(control)
                expect(changes).toEqual([[null, control]])
            }),
        )
    })

    it('detaches to null and records the empty for attribute', () => {
        fc.assert(
            fc.property(fc.string(), (id) => {
                const control = { id } as HTMLElement
                const { controller, attributes, changes } = createHost()

                controller.attach(control)
                controller.detach()

                expect(controller.control).toBeNull()
                expect(attributes.get('for')).toBe('')
                expect(changes).toEqual([
                    [null, control],
                    [control, null],
                ])

                controller.detach()

                expect(controller.control).toBeNull()
                expect(attributes.get('for')).toBe('')
            }),
        )
    })

    it('treats the control setter as attach/detach', () => {
        fc.assert(
            fc.property(fc.string(), (id) => {
                const control = { id } as HTMLElement
                const { controller, attributes, changes } = createHost()

                controller.control = control

                expect(controller.control).toBe(control)
                expect(attributes.has('for')).toBe(false)
                expect(changes).toEqual([[null, control]])

                controller.control = null

                expect(controller.control).toBeNull()
                expect(attributes.get('for')).toBe('')
                expect(changes).toEqual([
                    [null, control],
                    [control, null],
                ])
            }),
        )
    })

    it('falls back to the parent element without a for attribute', () => {
        fc.assert(
            fc.property(fc.string(), () => {
                const { controller, parent } = createHost()

                expect(controller.control).toBe(parent)
            }),
        )
    })
})
