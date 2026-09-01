/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { selfTrigger } from './self-trigger'

describe('selfTrigger', () => {
    it('creates a self trigger with pseudo-class modifier', () => {
        const trigger = selfTrigger(':hover')

        expect(trigger.name).toBe('hover')
        expect(trigger.target).toBe('self')
        expect(trigger.modifier).toBe(':hover')
        expect(typeof trigger.resolve).toBe('function')
    })

    it('infers clean trigger names by stripping colons and dots', () => {
        expect(selfTrigger(':hover').name).toBe('hover')
        expect(selfTrigger(':active').name).toBe('active')
        expect(selfTrigger(':focus-visible').name).toBe('focus-visible')
        expect(selfTrigger('.is-pressed').name).toBe('is-pressed')
    })

    it('preserves explicitly provided trigger name over inferred name', () => {
        const trigger = selfTrigger(':active', 'pressed')

        expect(trigger.name).toBe('pressed')
        expect(trigger.modifier).toBe(':active')
        expect(trigger.target).toBe('self')
    })

    it('pivots to target host when anchor is host element', () => {
        const trigger = selfTrigger(':hover')

        const hostCtx = {
            anchor: ':host',
            isHostAnchor: true
        }

        expect(trigger.resolve?.(hostCtx)).toEqual({
            target: 'host',
            modifier: ':hover'
        })
    })

    it('retains target self when anchor is an internal descendant element', () => {
        const trigger = selfTrigger(':hover')

        const containerCtx = {
            anchor: '.container',
            isHostAnchor: false
        }
        const innerElementCtx = {
            anchor: '.button > .ripple',
            isHostAnchor: false
        }

        expect(trigger.resolve?.(containerCtx)).toEqual({
            target: 'self',
            modifier: ':hover'
        })

        expect(trigger.resolve?.(innerElementCtx)).toEqual({
            target: 'self',
            modifier: ':hover'
        })
    })

    it('returns frozen immutable trigger descriptors and resolved objects', () => {
        const trigger = selfTrigger(':focus')
        expect(Object.isFrozen(trigger)).toBe(true)

        const resolved = trigger.resolve?.({ anchor: '.container', isHostAnchor: false })
        expect(Object.isFrozen(resolved)).toBe(true)
    })
})
