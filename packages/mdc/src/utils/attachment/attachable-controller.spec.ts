/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    AttachableController,
    type IAttachableControllerHost,
} from './attachable-controller'

const ValidIds = [
    'save-button',
    'ext-btn-1',
    '_id',
    'btn-1',
    '1abc',
    ':r0:',
    '.class',
    '#foo',
    'foo:bar',
    '',
] as const

const InvalidIds = [
    'a b',
    'a\tb',
    'a\nb',
    'a\rb',
    'a\fb',
] as const

interface FakeHost {
    host: IAttachableControllerHost
    controller: AttachableController
    attributes: Map<string, string>
    parent: HTMLElement
}

const createHost = (
    attributes: Record<string, string> = {},
    root: object = {},
): FakeHost => {
    const map = new Map(Object.entries(attributes))
    const parent = {} as HTMLElement
    const host = {
        isConnected: true,
        parentElement: parent,
        addController: () => {},
        getAttribute: (name: string) => map.get(name) ?? null,
        hasAttribute: (name: string) => map.has(name),
        setAttribute: (name: string, value: string) => {
            map.set(name, value)
        },
        removeAttribute: (name: string) => {
            map.delete(name)
        },
        getRootNode: () => root,
    } as unknown as IAttachableControllerHost

    const controller = new AttachableController(host, () => {})

    return { host, controller, attributes: map, parent }
}

describe('AttachableController `for` IDREF', () => {
    it.each(ValidIds)('accepts valid HTML id %j', (id) => {
        const { controller, attributes } = createHost()

        expect(() => {
            controller.htmlFor = id
        }).not.toThrow()
        expect(attributes.get('for')).toBe(id)
    })

    it.each(InvalidIds)('rejects id with ASCII whitespace %j', (id) => {
        const { controller, attributes } = createHost()

        expect(() => {
            controller.htmlFor = id
        }).toThrow(/Invalid "for" id .*HTML IDs must not contain ASCII whitespace/)
        expect(attributes.has('for')).toBe(false)
    })

    it('resolves React-style and dot-prefixed ids by exact id match', () => {
        const reactElement = {} as HTMLElement
        const classElement = {} as HTMLElement
        const ids: Record<string, HTMLElement> = {
            ':r0:': reactElement,
            '.class': classElement,
        }
        const lookups: string[] = []
        const root = {
            getElementById: (id: string) => {
                lookups.push(id)
                return ids[id] ?? null
            },
        }

        const react = createHost({ for: ':r0:' }, root)
        expect(react.controller.control).toBe(reactElement)

        const dotted = createHost({ for: '.class' }, root)
        expect(dotted.controller.control).toBe(classElement)

        expect(lookups).toEqual([':r0:', '.class'])
    })

    it('returns null when a valid id has no matching element', () => {
        const root = {
            getElementById: () => null,
        }
        const { controller } = createHost({ for: 'missing' }, root)

        expect(controller.control).toBeNull()
    })

    it('returns null for the empty detached state', () => {
        const root = {
            getElementById: () => {
                throw new Error('should not be called')
            },
        }
        const { controller } = createHost({ for: '' }, root)

        expect(controller.control).toBeNull()
    })

    it('validates ids set directly through the attribute (markup path)', () => {
        const { controller } = createHost({ for: 'a b' })

        expect(() => controller.control).toThrow(
            /Invalid "for" id .*HTML IDs must not contain ASCII whitespace/
        )
    })

    it('returns null when the host is disconnected', () => {
        const root = {
            getElementById: () => {
                throw new Error('should not be called')
            },
        }
        const { host, controller } = createHost({ for: ':r0:' }, root)
        const mutableHost = host as { isConnected: boolean }
        mutableHost.isConnected = false

        expect(controller.control).toBeNull()
    })

    it('falls back to the parent element when no for attribute is present', () => {
        const { controller, parent } = createHost()

        expect(controller.control).toBe(parent)
    })
})
