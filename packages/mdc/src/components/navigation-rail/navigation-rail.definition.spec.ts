/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { stringifyTokens } from '../../utils/style'
import { NavigationRailDefinition } from './navigation-rail.definition'

const VARIANTS = ['collapsed', 'expanded-docked', 'expanded-floating', 'xr'] as const

type Variant = typeof VARIANTS[number]

/**
 * Reads the variant record of a token.
 */
const variantsOf = (token: string): Record<Variant, unknown> => {
    const value = (NavigationRailDefinition as Record<string, any>)[token]
    if (value === null || typeof value !== 'object') {
        throw new Error(`[navigation-rail] Token "${token}" is not a variant record.`)
    }
    return value as Record<Variant, unknown>
}

/**
 * Whether a token holds one value per variant.
 */
const isVariantRecord = (value: unknown): boolean => (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).every((key) => (VARIANTS as readonly string[]).includes(key))
)

/**
 * Reads the MDK token key (e.g. `--md-sys-shape-corner-large`) of a value.
 */
const keyOf = (value: unknown): string => (value as { Key: string }).Key

describe('mdc-navigation-rail definition', () => {
    it('defines every variant dependent token for all four variants', () => {
        for (const [token, value] of Object.entries(NavigationRailDefinition)) {
            if (!isVariantRecord(value)) {
                continue
            }
            expect(Object.keys(value).sort(), token).toEqual([...VARIANTS].sort())
        }
    })

    it('separates the variant dependent tokens from the shared ones', () => {
        const variantTokens = Object.keys(NavigationRailDefinition)
            .filter((token) => isVariantRecord((NavigationRailDefinition as Record<string, any>)[token]))
            .sort()
        const sharedTokens = Object.keys(NavigationRailDefinition)
            .filter((token) => !isVariantRecord((NavigationRailDefinition as Record<string, any>)[token]))
            .sort()

        expect(variantTokens).toEqual([
            'container-block-leading-space',
            'container-block-trailing-space',
            'container-color',
            'container-elevation',
            'container-inline-leading-space',
            'container-inline-trailing-space',
            'container-item-gap',
            'container-shape-end-end',
            'container-shape-end-start',
            'container-shape-start-end',
            'container-shape-start-start',
            'container-width',
            'menu-and-fab-block-leading-space',
            'menu-and-fab-block-trailing-space',
            'menu-and-fab-inline-leading-space',
            'menu-and-fab-inline-trailing-space',
            'menu-and-fab-item-gap',
            'segments-block-leading-space',
            'segments-block-trailing-space',
            'segments-inline-leading-space',
            'segments-inline-trailing-space',
            'segments-item-gap',
        ])
        expect(sharedTokens).toEqual([
            'container-shadow-color',
            'divider-color',
            'scrim-color',
            'scrim-opacity',
        ])
    })

    it('keeps the variant independent tokens static', () => {
        const shared = NavigationRailDefinition as Record<string, any>
        expect(keyOf(shared['divider-color'])).toBe('--md-sys-color-outline-variant')
        expect(keyOf(shared['scrim-color'])).toBe('--md-sys-color-scrim')
        expect(shared['scrim-opacity']).toBe('0.38')
        expect(keyOf(shared['container-shadow-color'])).toBe('--md-sys-color-shadow')
    })

    it('sizes the container per variant', () => {
        expect(variantsOf('container-width')).toEqual({
            'collapsed'       : '80px',
            'expanded-docked' : '220px',
            'expanded-floating': '220px',
            'xr'              : '96px',
        })
    })

    it('paints the container per variant', () => {
        const color = variantsOf('container-color')
        expect(color['collapsed']).toBe('transparent')
        expect(color['expanded-docked']).toBe('transparent')
        expect(color['xr']).toBe('transparent')
        expect(keyOf(color['expanded-floating'])).toBe('--md-sys-color-surface-container')

        const elevation = variantsOf('container-elevation')
        expect(keyOf(elevation['collapsed'])).toBe('--md-sys-elevation-level-0')
        expect(keyOf(elevation['expanded-docked'])).toBe('--md-sys-elevation-level-0')
        expect(keyOf(elevation['expanded-floating'])).toBe('--md-sys-elevation-level-2')
        expect(keyOf(elevation['xr'])).toBe('--md-sys-elevation-level-0')
    })

    it('rounds the container per variant', () => {
        for (const corner of ['start-start', 'start-end', 'end-start', 'end-end']) {
            const shape = variantsOf(`container-shape-${corner}`)
            expect(keyOf(shape['collapsed'])).toBe('--md-sys-shape-corner-none')
            expect(keyOf(shape['expanded-docked'])).toBe('--md-sys-shape-corner-none')
            expect(keyOf(shape['expanded-floating'])).toBe('--md-sys-shape-corner-large')
            expect(keyOf(shape['xr'])).toBe('--md-sys-shape-corner-extra-extra-large')
        }
    })

    it('spaces the container per variant', () => {
        const leading = variantsOf('container-inline-leading-space')
        expect(keyOf(leading['collapsed'])).toBe('--md-sys-measurement-space0')
        expect(keyOf(leading['expanded-docked'])).toBe('--md-sys-measurement-space150')
        expect(keyOf(leading['expanded-floating'])).toBe('--md-sys-measurement-space150')
        expect(keyOf(leading['xr'])).toBe('--md-sys-measurement-space0')

        const trailing = variantsOf('container-inline-trailing-space')
        expect(keyOf(trailing['collapsed'])).toBe('--md-sys-measurement-space0')
        expect(keyOf(trailing['expanded-docked'])).toBe('--md-sys-measurement-space150')
        expect(keyOf(trailing['expanded-floating'])).toBe('--md-sys-measurement-space150')
        expect(keyOf(trailing['xr'])).toBe('--md-sys-measurement-space0')
    })

    it('gaps the segments per variant', () => {
        const gap = variantsOf('segments-item-gap')
        expect(keyOf(gap['collapsed'])).toBe('--md-sys-measurement-space150')
        expect(keyOf(gap['expanded-docked'])).toBe('--md-sys-measurement-space50')
        expect(keyOf(gap['expanded-floating'])).toBe('--md-sys-measurement-space50')
        expect(keyOf(gap['xr'])).toBe('--md-sys-measurement-space150')
    })

    it('exposes a private and a public token per variant', () => {
        const css = String(stringifyTokens('--mdc-navigation-rail')(NavigationRailDefinition))
        const widths: Record<Variant, string> = {
            'collapsed'       : '80px',
            'expanded-docked' : '220px',
            'expanded-floating': '220px',
            'xr'              : '96px',
        }
        for (const variant of VARIANTS) {
            expect(css).toContain(
                `--_${variant}-container-width: var(--mdc-navigation-rail-${variant}-container-width, ${widths[variant]});`
            )
        }
    })
})
