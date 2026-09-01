/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { hostTrigger } from './host-trigger'

describe('hostTrigger', () => {
    it('creates a host trigger with attribute modifier', () => {
        const trigger = hostTrigger('[selected]')

        expect(trigger.name).toBe('selected')
        expect(trigger.target).toBe('host')
        expect(trigger.modifier).toBe('[selected]')
        expect(typeof trigger.resolve).toBe('function')
    })

    it('infers clean trigger names by stripping brackets, colons, and dots', () => {
        expect(hostTrigger('[checked]').name).toBe('checked')
        expect(hostTrigger(':disabled').name).toBe('disabled')
        expect(hostTrigger('.active').name).toBe('active')
        expect(hostTrigger('[data-theme="dark"]').name).toBe('data-theme="dark"')
    })

    it('preserves explicitly provided trigger name over inferred name', () => {
        const trigger = hostTrigger('[data-active="true"]', 'active')

        expect(trigger.name).toBe('active')
        expect(trigger.modifier).toBe('[data-active="true"]')
        expect(trigger.target).toBe('host')
    })

    it('resolves consistently to host target across diverse anchor contexts', () => {
        const trigger = hostTrigger('[selected]')

        const hostCtx = {
            anchor: ':host',
            isHostAnchor: true
        }
        const containerCtx = {
            anchor: '.container',
            isHostAnchor: false
        }
        const complexCtx = {
            anchor: '.button > span.label',
            isHostAnchor: false,
            whenCondition: ':host([variant="elevated"])'
        }

        expect(trigger.resolve?.(hostCtx)).toEqual({
            target: 'host',
            modifier: '[selected]'
        })

        expect(trigger.resolve?.(containerCtx)).toEqual({
            target: 'host',
            modifier: '[selected]'
        })

        expect(trigger.resolve?.(complexCtx)).toEqual({
            target: 'host',
            modifier: '[selected]'
        })
    })

    it('returns frozen immutable trigger descriptors and resolved objects', () => {
        const trigger = hostTrigger('[disabled]')
        expect(Object.isFrozen(trigger)).toBe(true)

        const resolved = trigger.resolve?.({ anchor: ':host', isHostAnchor: true })
        expect(Object.isFrozen(resolved)).toBe(true)
    })
})
