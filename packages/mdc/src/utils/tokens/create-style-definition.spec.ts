/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import {
    createStyleDefinition,
    normalizeStateTokenKey,
    FORWARDED_TOKEN_META,
} from './create-style-definition'

describe('createStyleDefinition & Normalizer', () => {
    describe('normalizeStateTokenKey', () => {
        it('normalizes single-state eternal token', () => {
            const res = normalizeStateTokenKey('container-height')
            expect(res.baseKey).toBe('container-height')
            expect(res.states).toEqual([])
            expect(res.canonicalKey).toBe('container-height')
            expect(res.isLegacyHyphen).toBe(false)
        })

        it('normalizes modern colon state token', () => {
            const res = normalizeStateTokenKey('hover:container-color')
            expect(res.baseKey).toBe('container-color')
            expect(res.states).toEqual(['hover'])
            expect(res.canonicalKey).toBe('hover:container-color')
            expect(res.isLegacyHyphen).toBe(false)
        })

        it('normalizes compound multi-level colon state token', () => {
            const res = normalizeStateTokenKey('checked:hover:container-color')
            expect(res.baseKey).toBe('container-color')
            expect(res.states).toEqual(['checked', 'hover'])
            expect(res.canonicalKey).toBe('checked:hover:container-color')
            expect(res.isLegacyHyphen).toBe(false)
        })

        it('normalizes legacy hyphen prefixed state tokens', () => {
            expect(normalizeStateTokenKey('enabled-container-color')).toEqual({
                baseKey: 'container-color',
                states: ['enabled'],
                canonicalKey: 'container-color',
                isLegacyHyphen: true,
            })

            expect(normalizeStateTokenKey('hovered-container-color')).toEqual({
                baseKey: 'container-color',
                states: ['hover'],
                canonicalKey: 'hover:container-color',
                isLegacyHyphen: true,
            })

            expect(normalizeStateTokenKey('pressed-container-color')).toEqual({
                baseKey: 'container-color',
                states: ['active'],
                canonicalKey: 'active:container-color',
                isLegacyHyphen: true,
            })

            expect(normalizeStateTokenKey('focused-container-color')).toEqual({
                baseKey: 'container-color',
                states: ['focus'],
                canonicalKey: 'focus:container-color',
                isLegacyHyphen: true,
            })

            expect(normalizeStateTokenKey('disabled-container-color')).toEqual({
                baseKey: 'container-color',
                states: ['disabled'],
                canonicalKey: 'disabled:container-color',
                isLegacyHyphen: true,
            })
        })
    })

    describe('createStyleDefinition creation', () => {
        it('creates single-state eternal token records with zero invalid states', () => {
            const def = createStyleDefinition({
                'container-height': '40px',
                'container-shape': '8px',
                'label-font': 'Roboto, sans-serif',
            })

            expect(def).toEqual({
                'container-height': '40px',
                'container-shape': '8px',
                'label-font': 'Roboto, sans-serif',
            })

            // Must NOT contain any unwanted interaction states
            expect(def).not.toHaveProperty('hovered-container-height')
            expect(def).not.toHaveProperty('hover:container-height')
            expect(def).not.toHaveProperty('enabled-container-height')
        })

        it('supports flat arbitrary colon-prefixed state keys', () => {
            const def = createStyleDefinition({
                'container-height': '40px',
                'container-color': '#primary',
                'hover:container-color': '#hover',
                'active:container-color': '#active',
                'checked:container-color': '#checked',
                'checked:hover:container-color': '#checked-hover',
                'dragged:opacity': '0.5',
            })

            expect(def).toEqual({
                'container-height': '40px',
                'container-color': '#primary',
                'hover:container-color': '#hover',
                'active:container-color': '#active',
                'checked:container-color': '#checked',
                'checked:hover:container-color': '#checked-hover',
                'dragged:opacity': '0.5',
            })
        })

        it('supports nested state records', () => {
            const def = createStyleDefinition({
                'container-height': '40px',
                'container-color': {
                    '': '#primary',
                    'hover': '#hover',
                    'active': '#active',
                    'checked:hover': '#checked-hover',
                    'dragged': '#dragged',
                },
            })

            expect(def).toEqual({
                'container-height': '40px',
                'container-color': '#primary',
                'hover:container-color': '#hover',
                'active:container-color': '#active',
                'checked:hover:container-color': '#checked-hover',
                'dragged:container-color': '#dragged',
            })
        })

        it('supports legacy 5-state tuples for full backward compatibility', () => {
            const def = createStyleDefinition({
                'container-color': ['#e', '#h', '#p', '#f', '#d'],
            })

            expect(def).toEqual({
                'enabled-container-color': '#e',
                'hovered-container-color': '#h',
                'pressed-container-color': '#p',
                'focused-container-color': '#f',
                'disabled-container-color': '#d',
            })
        })

        it('resolves objects implementing ToCSSVariable()', () => {
            const mockToken = {
                ToCSSVariable: () => 'var(--md-sys-color-primary)',
            }

            const def = createStyleDefinition({
                'container-color': mockToken,
                'hover:container-color': mockToken,
            })

            expect(def).toEqual({
                'container-color': 'var(--md-sys-color-primary)',
                'hover:container-color': 'var(--md-sys-color-primary)',
            })
        })
    })
})
