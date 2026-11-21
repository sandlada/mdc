/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCBanner } from './banner'
import {
    BannerDefinition,
    ErrorContainerBannerDefinition,
    InverseSurfaceBannerDefinition,
    PrimaryContainerBannerDefinition,
    SecondaryContainerBannerDefinition,
    SurfaceBannerDefinition,
    SurfaceContainerBannerDefinition,
    TertiaryContainerBannerDefinition,
} from './banner.definition'
import { BannerLayout, BannerVariant } from './banner.interface'

describe('MDCBanner', () => {
    it('instantiates with defaults', () => {
        const banner = new MDCBanner()
        expect(banner.open).toBe(true)
        expect(banner.variant).toBe(BannerVariant.Surface)
        expect(banner.layout).toBe(BannerLayout.Auto)
        expect(banner.headline).toBe('')
        expect(banner.supportingText).toBe('')
        expect(banner.icon).toBe('')
        expect(banner.iconContainer).toBe(false)
        expect(banner.primaryAction).toBe('')
        expect(banner.secondaryAction).toBe('')
        expect(banner.noDivider).toBe(false)
        expect(banner.dismissOnAction).toBe(false)
        expect(banner.quick).toBe(false)
    })

    it('allows updating properties', () => {
        const banner = new MDCBanner()
        banner.open = false
        banner.variant = BannerVariant.ErrorContainer
        banner.layout = BannerLayout.Stacked
        banner.headline = 'Offline'
        banner.supportingText = 'Check your connection.'
        banner.icon = 'wifi_off'
        banner.iconContainer = true
        banner.primaryAction = 'Retry'
        banner.secondaryAction = 'Dismiss'
        banner.noDivider = true
        banner.dismissOnAction = true
        banner.quick = true

        expect(banner.open).toBe(false)
        expect(banner.variant).toBe('error-container')
        expect(banner.layout).toBe('stacked')
        expect(banner.headline).toBe('Offline')
        expect(banner.supportingText).toBe('Check your connection.')
        expect(banner.icon).toBe('wifi_off')
        expect(banner.iconContainer).toBe(true)
        expect(banner.primaryAction).toBe('Retry')
        expect(banner.secondaryAction).toBe('Dismiss')
        expect(banner.noDivider).toBe(true)
        expect(banner.dismissOnAction).toBe(true)
        expect(banner.quick).toBe(true)
    })
})

describe('BannerDefinition', () => {
    it('exports all variant definitions with required tokens', () => {
        const definitions = [
            BannerDefinition,
            SurfaceBannerDefinition,
            SurfaceContainerBannerDefinition,
            PrimaryContainerBannerDefinition,
            SecondaryContainerBannerDefinition,
            TertiaryContainerBannerDefinition,
            ErrorContainerBannerDefinition,
            InverseSurfaceBannerDefinition,
        ]

        for (const def of definitions) {
            expect(def['enabled-container-color']).toBeDefined()
            expect(def['enabled-supporting-text-color']).toBeDefined()
            expect(def['enabled-action-text-color']).toBeDefined()
            expect(def['enabled-divider-color']).toBeDefined()
            expect(def['headline-leading']).toBeDefined()
            expect(def['supporting-text-leading']).toBeDefined()
            expect(def['action-leading']).toBeDefined()
            expect(def['container-padding-inline-start']).toBe('16px')
            expect(def['container-shape-start-start']).toBeDefined()
        }
    })
})
