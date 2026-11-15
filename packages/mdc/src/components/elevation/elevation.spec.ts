/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { LitElement } from 'lit'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { Elevation } from './elevation'
import { mixinElevationOptions } from './elevation-options.mixin'

describe('Elevation', () => {
    it('has correct default properties', () => {
        const elevation = new Elevation()
        expect(elevation.ignoreGlobalConfig).toBe(false)
        expect(elevation.disabled).toBe(false)
    })

    it('allows updating ignoreGlobalConfig', () => {
        const elevation = new Elevation()
        elevation.ignoreGlobalConfig = true
        expect(elevation.ignoreGlobalConfig).toBe(true)
    })

    it('allows updating disabled', () => {
        const elevation = new Elevation()
        elevation.disabled = true
        expect(elevation.disabled).toBe(true)
    })
})

describe('mixinElevationOptions', () => {
    class TestHost extends composeMixin(
        mixinElevationOptions
    )(LitElement) {}

    it('provides default properties', () => {
        const host = new TestHost()
        expect(host.ignoreGlobalConfig).toBe(false)
        expect(host.disableElevation).toBe(false)
    })

    it('allows updating properties', () => {
        const host = new TestHost()
        host.ignoreGlobalConfig = true
        host.disableElevation = true
        expect(host.ignoreGlobalConfig).toBe(true)
        expect(host.disableElevation).toBe(true)
    })

    it('renders elevation template', () => {
        const host = new TestHost()
        const template = host.renderElevation()
        expect(template).toBeDefined()
        expect(template.strings.join('')).toContain('mdc-elevation')
    })
})