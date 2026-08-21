/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { AppBarDefinition } from '../src/component-definitions/appbar.definition'
import { AppBarAlignment, AppBarVariant } from '../src/components/appbar/appbar.interface'

describe('AppBarDefinition', () => {
    it('should define container colors and heights', () => {
        expect(AppBarDefinition['enabled-container-color']).toBeDefined()
        expect(AppBarDefinition['enabled-container-color-scrolled']).toBeDefined()
        expect(AppBarDefinition['enabled-small-container-height']).toBe('64px')
        expect(AppBarDefinition['enabled-medium-container-min-height']).toBe('112px')
        expect(AppBarDefinition['enabled-large-container-min-height']).toBe('152px')
        expect(AppBarDefinition['enabled-search-container-height']).toBe('64px')
    })

    it('should export valid variant and alignment enums', () => {
        expect(AppBarVariant.Small).toBe('small')
        expect(AppBarVariant.CenterAligned).toBe('center-aligned')
        expect(AppBarVariant.MediumFlexible).toBe('medium-flexible')
        expect(AppBarVariant.LargeFlexible).toBe('large-flexible')
        expect(AppBarVariant.Search).toBe('search')

        expect(AppBarAlignment.Start).toBe('start')
        expect(AppBarAlignment.Center).toBe('center')
    })
})
