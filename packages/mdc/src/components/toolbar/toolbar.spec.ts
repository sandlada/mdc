/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { Shape } from '@sandlada/mdk'
import {
    MDCDockedToolbar,
    MDCFloatingToolbar,
    MDCDockedToolbarAction,
    DockedToolbarDefinition,
    FloatingToolbarDefinition,
    ToolbarVariants,
    ToolbarOrientations,
    ToolbarExpandedChangeEvent,
} from './index'

interface FloatingToolbarInternals {
    getWrapperClasses(): Record<string, boolean>
    getContainerClasses(): Record<string, boolean>
    render(): { strings: TemplateStringsArray; values: unknown[] }
}

interface DockedToolbarInternals {
    getRenderClasses(): Record<string, boolean>
    render(): { strings: TemplateStringsArray; values: unknown[] }
}

describe('MDCDockedToolbar', () => {
    it('initializes with default properties', () => {
        const el = new MDCDockedToolbar()
        expect(el.variant).toBe('standard')
        expect(el.alignment).toBe('space-between')
    })

    it('renders a role="toolbar" horizontal container', () => {
        const el = new MDCDockedToolbar()
        const internals = el as unknown as DockedToolbarInternals
        const html = Array.from(internals.render().strings).join('')
        expect(html).toContain('role="toolbar"')
        expect(html).toContain('aria-orientation="horizontal"')
        expect(internals.getRenderClasses()).toEqual({
            'container': true,
            'standard': true,
            'align-space-between': true,
            'is-hidden': false,
        })
    })

    it('defines M3 Expressive docked toolbar tokens with 64px height and 0px square corners', () => {
        expect(DockedToolbarDefinition['container-height']).toBe('64px')
        expect(DockedToolbarDefinition['container-padding-inline-start']).toBe('16px')
        expect(DockedToolbarDefinition['enabled-container-shape-start-start']).toBe(Shape.None)
    })
})

describe('MDCFloatingToolbar', () => {
    it('initializes with default properties', () => {
        const el = new MDCFloatingToolbar()
        expect(el.variant).toBe('standard')
        expect(el.orientation).toBe('horizontal')
        expect(el.expanded).toBe(true)
        expect(el.fabPosition).toBe('end')
    })

    it('exports standard M3 Expressive option constants', () => {
        expect(ToolbarVariants).toEqual(['standard', 'vibrant'])
        expect(ToolbarOrientations).toEqual(['horizontal', 'vertical'])
    })

    it('defines M3 Expressive floating toolbar tokens with pill shape and level 3 elevation', () => {
        expect(FloatingToolbarDefinition['container-height']).toBe('64px')
        expect(FloatingToolbarDefinition['container-width']).toBe('64px')
        expect(FloatingToolbarDefinition['space-between-actions']).toBe('4px')
        expect(FloatingToolbarDefinition['fab-gap']).toBe('8px')
        expect(FloatingToolbarDefinition['enabled-container-elevation']).toBe('3')
        expect(FloatingToolbarDefinition['enabled-container-shape-start-start']).toBe(Shape.Full)
    })

    it('computes wrapper and container classes from properties', () => {
        const el = new MDCFloatingToolbar()
        el.variant = 'vibrant'
        el.orientation = 'vertical'
        el.expanded = false
        el.fabPosition = 'start'

        const internals = el as unknown as FloatingToolbarInternals
        expect(internals.getWrapperClasses()).toEqual({
            'wrapper': true,
            'is-hidden': false,
            'vertical': true,
            'expanded': false,
            'collapsed': true,
            'has-fab': false,
            'fab-start': true,
        })
        expect(internals.getContainerClasses()).toEqual({
            'container': true,
            'vibrant': true,
        })
    })

    it('expands, collapses, toggles, and emits toolbar-expanded-change', () => {
        const el = new MDCFloatingToolbar()
        const handler = vi.fn()
        el.addEventListener(ToolbarExpandedChangeEvent, (e) => {
            handler((e as CustomEvent).detail.expanded)
        })

        el.collapse()
        expect(el.expanded).toBe(false)
        expect(handler).toHaveBeenLastCalledWith(false)

        // Calling collapse again is a no-op
        el.collapse()
        expect(handler).toHaveBeenCalledTimes(1)

        el.expand()
        expect(el.expanded).toBe(true)
        expect(handler).toHaveBeenLastCalledWith(true)

        el.toggle()
        expect(el.expanded).toBe(false)
        expect(handler).toHaveBeenCalledTimes(3)
    })
})

describe('MDCDockedToolbarAction', () => {
    it('initializes with default properties', () => {
        const el = new MDCDockedToolbarAction()
        expect(el.variant).toBe('standard')
        expect(el.selected).toBe(false)
        expect(el.disabled).toBe(false)
        expect(el.label).toBe('')
    })

    it('allows updating properties', () => {
        const el = new MDCDockedToolbarAction()
        el.variant = 'vibrant'
        el.selected = true
        el.label = 'Edit'
        expect(el.variant).toBe('vibrant')
        expect(el.selected).toBe(true)
        expect(el.label).toBe('Edit')
    })

    it('defaults scrollBehavior to pinned and supports show/hide/toggleVisibility', () => {
        const docked = new MDCDockedToolbar()
        expect(docked.scrollBehavior).toBe('pinned')
        expect(docked.collapsed).toBe(false)
        docked.hide()
        expect(docked.collapsed).toBe(true)
        docked.show()
        expect(docked.collapsed).toBe(false)
        docked.toggle()
        expect(docked.collapsed).toBe(true)

        const floating = new MDCFloatingToolbar()
        expect(floating.scrollBehavior).toBe('pinned')
        expect(floating.collapsed).toBe(false)
        floating.hide()
        expect(floating.collapsed).toBe(true)
        floating.show()
        expect(floating.collapsed).toBe(false)
        floating.toggleVisibility()
        expect(floating.collapsed).toBe(true)
    })
})
