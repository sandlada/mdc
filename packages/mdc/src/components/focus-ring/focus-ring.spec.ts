/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { LitElement } from 'lit'
import { MDCFocusRing } from './focus-ring'
import { mixinFocusRingOptions } from './focus-ring-options.mixin'

import { composeMixin } from '../../utils/compose-mixin/compose-mixin'

describe('MDCFocusRing', () => {
    it('has persistent property defaulting to false', () => {
        const ring = new MDCFocusRing()
        expect(ring.persistent).toBe(false)
    })

    it('allows setting persistent property', () => {
        const ring = new MDCFocusRing()
        ring.persistent = true
        expect(ring.persistent).toBe(true)
    })

    it('resets focused state on close() allowing CSS discrete transition to handle exit', () => {
        const ring = new MDCFocusRing()
        ring.focused = true
        expect(ring.focused).toBe(true)
        ring.close()
        expect(ring.focused).toBe(false)
    })

    it('re-triggers animation without errors when focused is set to true on an already-focused ring', () => {
        const ring = new MDCFocusRing()
        ring.focused = true
        expect(ring.focused).toBe(true)
        // Set focused again - should trigger restartAnimation safely
        ring.focused = true
        expect(ring.focused).toBe(true)
    })



    it('resets focused when disabled is set', () => {
        const ring = new MDCFocusRing()
        ring.focused = true
        ring.disabled = true
        expect(ring.focused).toBe(false)
    })

    it('has inward, shapeInherit and animationDisabled default properties', () => {
        const ring = new MDCFocusRing()
        expect(ring.inward).toBe(false)
        expect(ring.shapeInherit).toBe(true)
        expect(ring.animationDisabled).toBe(false)

        ring.inward = true
        ring.shapeInherit = false
        ring.animationDisabled = true

        expect(ring.inward).toBe(true)
        expect(ring.shapeInherit).toBe(false)
        expect(ring.animationDisabled).toBe(true)
    })

    it('allows attaching and detaching an external control', () => {
        const ring = new MDCFocusRing()
        const mockControl = {
            addEventListener: () => {},
            removeEventListener: () => {},
            matches: () => false,
        } as unknown as HTMLElement

        ring.attach(mockControl)
        expect(ring.control).toBe(mockControl)

        ring.detach()
        expect(ring.control).toBe(null)
    })

})




describe('mixinFocusRingOptions', () => {
    class TestHost extends composeMixin(
        mixinFocusRingOptions
    )(LitElement) {}



    it('provides focusRingPersistent defaulting to false', () => {
        const host = new TestHost()
        expect(host.focusRingPersistent).toBe(false)
    })

    it('allows updating focusRingPersistent property', () => {
        const host = new TestHost()
        host.focusRingPersistent = true
        expect(host.focusRingPersistent).toBe(true)
    })

    it('renders focus-ring template with persistent and animation-disabled property bindings', () => {
        const host = new TestHost()
        host.focusRingPersistent = true
        host.focusRingAnimationDisabled = true
        host.focusRingInward = true
        const template = host.renderFocusRing()
        expect(template).toBeDefined()
        expect(template.strings.join('')).toContain('mdc-focus-ring')
    })
})

