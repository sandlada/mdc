/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { mapStateTriggers, StateTriggerRegistry } from './map-state-triggers'

describe('mapStateTriggers & StateTriggerRegistry', () => {
    it('initializes with built-in default interaction triggers', () => {
        const registry = mapStateTriggers()

        expect(registry.has('enabled')).toBe(true)
        expect(registry.has('hover')).toBe(true)
        expect(registry.has('hovered')).toBe(true)
        expect(registry.has('focus')).toBe(true)
        expect(registry.has('focused')).toBe(true)
        expect(registry.has('focus-visible')).toBe(true)
        expect(registry.has('active')).toBe(true)
        expect(registry.has('pressed')).toBe(true)
        expect(registry.has('checked')).toBe(true)
        expect(registry.has('selected')).toBe(true)
        expect(registry.has('disabled')).toBe(true)
    })

    it('resolves built-in triggers accurately based on anchor context', () => {
        const registry = mapStateTriggers()
        const hostCtx = { anchor: ':host', isHostAnchor: true }
        const containerCtx = { anchor: '.container', isHostAnchor: false }

        // Hover resolves to self when not host, and host when host
        expect(registry.resolve('hovered', hostCtx)).toEqual({ target: 'host', modifier: ':hover' })
        expect(registry.resolve('hovered', containerCtx)).toEqual({ target: 'self', modifier: ':hover' })

        // Selected always resolves to host
        expect(registry.resolve('selected', hostCtx)).toEqual({ target: 'host', modifier: '[selected]' })
        expect(registry.resolve('selected', containerCtx)).toEqual({ target: 'host', modifier: '[selected]' })

        // Enabled resolves to empty modifier
        expect(registry.resolve('enabled', hostCtx)).toEqual({ target: 'self', modifier: '' })
        expect(registry.resolve('enabled', containerCtx)).toEqual({ target: 'self', modifier: '' })
    })

    it('overrides defaults and registers explicit string modifier mappings', () => {
        const customSelected = '[aria-selected="true"]'
        const customHover = '.is-hovered'

        const registry = mapStateTriggers({
            selected: customSelected,
            hovered: customHover
        })

        expect(registry.get('selected')).toBe(customSelected)
        expect(registry.get('hovered')).toBe(customHover)
        expect(registry.getTrigger('selected')).toBe(customSelected)

        const containerCtx = { anchor: '.container', isHostAnchor: false }
        expect(registry.resolve('selected', containerCtx)).toEqual({
            target: 'host',
            modifier: '[aria-selected="true"]'
        })
        expect(registry.resolve('hovered', containerCtx)).toEqual({
            target: 'self',
            modifier: '.is-hovered'
        })
    })

    it('automatically coerces string shorthand modifiers to appropriate triggers', () => {
        const registry = mapStateTriggers({
            enabled: '',
            checked: '[aria-checked="true"]',
            hostSelected: ':host([selected])',
            hovered: ':hover',
            dense: '.dense'
        })

        const hostCtx = { anchor: ':host', isHostAnchor: true }
        const containerCtx = { anchor: '.card', isHostAnchor: false }

        expect(registry.resolve('enabled', hostCtx)).toEqual({ target: 'self', modifier: '' })
        expect(registry.resolve('checked', containerCtx)).toEqual({ target: 'host', modifier: '[aria-checked="true"]' })
        expect(registry.resolve('hostSelected', containerCtx)).toEqual({ target: 'host', modifier: ':host([selected])' })
        expect(registry.resolve('hovered', containerCtx)).toEqual({ target: 'self', modifier: ':hover' })
        expect(registry.resolve('dense', containerCtx)).toEqual({ target: 'self', modifier: '.dense' })
    })

    it('applies heuristic fallback for unmapped custom states', () => {
        const registry = mapStateTriggers()
        const hostCtx = { anchor: ':host', isHostAnchor: true }
        const containerCtx = { anchor: '.btn', isHostAnchor: false }

        // Plain identifier: host -> [loading], container -> .loading
        expect(registry.resolve('loading', hostCtx)).toEqual({ target: 'host', modifier: '[loading]' })
        expect(registry.resolve('loading', containerCtx)).toEqual({ target: 'self', modifier: '.loading' })

        // Explicit modifier prefixes in unmapped state name
        expect(registry.resolve('[data-expanded]', containerCtx)).toEqual({ target: 'host', modifier: '[data-expanded]' })
        expect(registry.resolve(':modal', hostCtx)).toEqual({ target: 'host', modifier: ':modal' })
        expect(registry.resolve(':modal', containerCtx)).toEqual({ target: 'self', modifier: ':modal' })
        expect(registry.resolve('.active-item', hostCtx)).toEqual({ target: 'self', modifier: '.active-item' })
    })

    it('supports cloning to create independent registry instances', () => {
        const original = mapStateTriggers({
            custom: '[custom]'
        })

        const cloned = original.clone()
        expect(cloned).toBeInstanceOf(StateTriggerRegistry)
        expect(cloned.has('custom')).toBe(true)

        // Mutating cloned registry should not affect original
        cloned.register('newState', '[new-state]')
        expect(cloned.has('newState')).toBe(true)
        expect(original.has('newState')).toBe(false)
    })

    it('supports array inputs in registerAll and constructor', () => {
        const registry = new StateTriggerRegistry([
            { stateA: '[state-a]' },
            { stateB: ':hover' }
        ])

        expect(registry.has('stateA')).toBe(true)
        expect(registry.has('stateB')).toBe(true)
    })
})
