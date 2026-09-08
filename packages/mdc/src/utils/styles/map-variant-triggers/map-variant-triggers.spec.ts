/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * mapVariantTriggers 规格：对称 mapStateTriggers，映射变体名到完整挂载选择器。
 * 无内置默认、无启发式回退；未映射一律 resolve 为 undefined（编译层严格丢弃 [D]）。
 */

import { describe, it, expect } from 'vitest'
import { mapVariantTriggers, VariantTriggerRegistry } from './map-variant-triggers'

describe('mapVariantTriggers & VariantTriggerRegistry', () => {
    it('empty registry has no mappings and resolves to undefined', () => {
        const registry = mapVariantTriggers()

        expect(registry).toBeInstanceOf(VariantTriggerRegistry)
        expect(registry.has('fill')).toBe(false)
        expect(registry.get('fill')).toBeUndefined()
        expect(registry.getTrigger('fill')).toBeUndefined()
        expect(registry.resolve('fill')).toBeUndefined()
        expect(registry.resolveTrigger('fill')).toBeUndefined()
    })

    it('returns full mount selectors verbatim for container, host-class and host-attribute mounts', () => {
        const registry = mapVariantTriggers({
            'fill': '.container.fill',
            'tonal': ':host(.tonal)',
            'outlined': ':host([variant="outlined"])'
        })

        expect(registry.get('fill')).toBe('.container.fill')
        expect(registry.get('tonal')).toBe(':host(.tonal)')
        expect(registry.get('outlined')).toBe(':host([variant="outlined"])')
        expect(registry.getTrigger('tonal')).toBe(':host(.tonal)')
        expect(registry.resolve('fill')).toBe('.container.fill')
        expect(registry.resolveTrigger('tonal')).toBe(':host(.tonal)')
        expect(registry.resolve('outlined')).toBe(':host([variant="outlined"])')
    })

    it('overrides previous mappings with last write winning and trims surrounding whitespace', () => {
        const registry = mapVariantTriggers({
            'tonal': ':host(.tonal)'
        })

        expect(registry.resolve('tonal')).toBe(':host(.tonal)')

        registry.register('tonal', '  :host(.tonal-v2)  ')
        expect(registry.get('tonal')).toBe(':host(.tonal-v2)')
        expect(registry.resolve('tonal')).toBe(':host(.tonal-v2)')
    })

    it('resolves unmapped names to undefined without default fallback or heuristics', () => {
        const registry = mapVariantTriggers({
            'fill': '.container.fill'
        })

        // 无 :host([variant]) 默认回退
        expect(registry.resolve('tonal')).toBeUndefined()
        // 无启发式：即使名字本身形如选择器也不透传
        expect(registry.resolve('.container.fill')).toBeUndefined()
        expect(registry.resolve(':host(.tonal)')).toBeUndefined()
        expect(registry.resolve('[variant="outlined"]')).toBeUndefined()
    })

    it('supports cloning to create independent registry instances', () => {
        const original = mapVariantTriggers({
            'fill': '.container.fill'
        })

        const cloned = original.clone()
        expect(cloned).toBeInstanceOf(VariantTriggerRegistry)
        expect(cloned.has('fill')).toBe(true)

        // Mutating cloned registry should not affect original
        cloned.register('tonal', ':host(.tonal)')
        expect(cloned.has('tonal')).toBe(true)
        expect(original.has('tonal')).toBe(false)
    })

    it('supports array inputs in registerAll and constructor', () => {
        const registry = new VariantTriggerRegistry([
            { 'fill': '.container.fill' },
            { 'tonal': ':host(.tonal)' }
        ])

        expect(registry.has('fill')).toBe(true)
        expect(registry.has('tonal')).toBe(true)
        expect(registry.resolve('fill')).toBe('.container.fill')
        expect(registry.resolve('tonal')).toBe(':host(.tonal)')
    })

    it('is reachable from both the deep barrel and the styles barrel with identical symbols', async () => {
        const deep = await import('./map-variant-triggers')
        const styles = await import('../index')

        expect(styles.mapVariantTriggers).toBe(deep.mapVariantTriggers)
        expect(styles.VariantTriggerRegistry).toBe(deep.VariantTriggerRegistry)
    })
})
