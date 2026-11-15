/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'
import { MDCButtonGroup } from './button-group'
import {
    ButtonGroupSelectionEvent,
    ButtonGroupInteractionEvent,
    ButtonGroupVariants,
    ButtonGroupSizes,
    ButtonGroupShapes,
    ButtonGroupOrientations,
    ButtonGroupSelectionModes,
} from './button-group.interface'
import {
    ConnectedButtonGroupDefinition,
    StandardButtonGroupDefinition,
} from './button-group.definition'

interface ButtonGroupInternals {
    items: HTMLElement[]
    getRenderClasses(): Record<string, boolean>
    getAriaRole(): string
    render(): { strings: TemplateStringsArray; values: unknown[] }
    handleClick(e: MouseEvent): void
    handleKeyDown(e: KeyboardEvent): void
    updateRovingTabindex(): void
}

function createMockItem(value: string, disabled = false): HTMLElement {
    const attrs = new Map<string, string>()
    if (disabled) attrs.set('disabled', '')
    const el = {
        value,
        disabled,
        tabIndex: -1,
        focus: vi.fn(),
        hasAttribute: (k: string) => attrs.has(k),
        getAttribute: (k: string) => attrs.get(k) ?? null,
        setAttribute: (k: string, v: string) => { attrs.set(k, v) },
        removeAttribute: (k: string) => { attrs.delete(k) },
    }
    return el as unknown as HTMLElement
}

describe('MDCButtonGroup', () => {
    it('instantiates with defaults', () => {
        const group = new MDCButtonGroup()
        expect(group.variant).toBe('connected')
        expect(group.selectionMode).toBe('none')
        expect(group.selectionRequired).toBe(false)
        expect(group.size).toBe('small')
        expect(group.shape).toBe('round')
        expect(group.orientation).toBe('horizontal')
        expect(group.disableMorph).toBe(false)
        expect(group.expandOnActive).toBe(false)
        expect(group.disabled).toBe(false)
    })

    it('exports standard M3 Expressive option constants', () => {
        expect(ButtonGroupVariants).toEqual(['connected', 'standard'])
        expect(ButtonGroupSelectionModes).toEqual(['none', 'single', 'multiple'])
        expect(ButtonGroupSizes).toEqual(['extra-small', 'small', 'medium', 'large', 'extra-large'])
        expect(ButtonGroupShapes).toEqual(['round', 'square'])
        expect(ButtonGroupOrientations).toEqual(['horizontal', 'vertical'])
    })

    it('defines M3 Expressive spacing and shape tokens', () => {
        expect(StandardButtonGroupDefinition['enabled-extra-small-space-between']).toBe('18px')
        expect(StandardButtonGroupDefinition['enabled-small-space-between']).toBe('12px')
        expect(StandardButtonGroupDefinition['enabled-medium-space-between']).toBe('8px')
        expect(ConnectedButtonGroupDefinition['enabled-space-between']).toBe('2px')
        expect(ConnectedButtonGroupDefinition['enabled-extra-small-min-width']).toBe('48px')
        expect(ConnectedButtonGroupDefinition['enabled-small-min-width']).toBe('48px')
        expect(ConnectedButtonGroupDefinition['enabled-large-inner-shape-start-start']).toBe('16px')
        expect(ConnectedButtonGroupDefinition['enabled-extra-large-inner-shape-start-start']).toBe('20px')
    })

    it('exposes a container in render output with proper ARIA role', () => {
        const group = new MDCButtonGroup()
        const internals = group as unknown as ButtonGroupInternals
        const html = Array.from(internals.render().strings).join('')
        expect(html).toContain('<div')
        expect(html).toContain('role=')
        expect(internals.getAriaRole()).toBe('group')

        group.selectionMode = 'single'
        expect(internals.getAriaRole()).toBe('radiogroup')
    })

    it('computes render classes from properties', () => {
        const group = new MDCButtonGroup()
        group.variant = 'standard'
        group.size = 'large'
        group.shape = 'square'
        group.orientation = 'vertical'
        group.expandOnActive = true
        group.disableMorph = true
        group.disabled = true

        const classes = (group as unknown as ButtonGroupInternals).getRenderClasses()
        expect(classes).toEqual({
            'container': true,
            'standard': true,
            'large': true,
            'square': true,
            'vertical': true,
            'disable-morph': true,
            'expand-on-active': true,
            'disabled': true,
        })
    })

    it('enforces single-selection mode and selection-required', () => {
        const group = new MDCButtonGroup()
        group.selectionMode = 'single'
        const items = [createMockItem('a'), createMockItem('b'), createMockItem('c')]
        const internals = group as unknown as ButtonGroupInternals
        internals.items = items

        const events: unknown[] = []
        group.addEventListener(ButtonGroupSelectionEvent, (e) => events.push((e as CustomEvent).detail))

        group.setIndexSelected(0, true)
        expect(group.getSelectedIndexes()).toEqual([0])
        expect(events).toHaveLength(1)

        group.setIndexSelected(1, true)
        expect(group.getSelectedIndexes()).toEqual([1])
        expect(items[0].hasAttribute('selected')).toBe(false)
        expect(events).toHaveLength(2)

        // With selectionRequired=false, deselecting works
        group.setIndexSelected(1, false)
        expect(group.getSelectedIndexes()).toEqual([])

        // With selectionRequired=true, deselecting is blocked
        group.selectionRequired = true
        group.setIndexSelected(2, true)
        expect(group.getSelectedIndexes()).toEqual([2])
        group.setIndexSelected(2, false)
        expect(group.getSelectedIndexes()).toEqual([2])
    })

    it('enforces multiple-selection mode and disabled items', () => {
        const group = new MDCButtonGroup()
        group.selectionMode = 'multiple'
        const items = [createMockItem('a'), createMockItem('b'), createMockItem('c', true)]
        const internals = group as unknown as ButtonGroupInternals
        internals.items = items

        group.setIndexSelected(0, true)
        group.toggleIndexSelected(1)
        group.setIndexSelected(2, true)
        expect(group.getSelectedIndexes()).toEqual([0, 1])

        group.toggleIndexSelected(0)
        expect(group.getSelectedIndexes()).toEqual([1])
    })

    it('dispatches interaction event in none selection mode', () => {
        const group = new MDCButtonGroup()
        group.selectionMode = 'none'
        const items = [createMockItem('a'), createMockItem('b')]
        const internals = group as unknown as ButtonGroupInternals
        internals.items = items

        let interactedIndex = -1
        group.addEventListener(ButtonGroupInteractionEvent, (e) => {
            interactedIndex = (e as CustomEvent).detail.index
        })

        internals.handleClick({ target: items[1], composedPath: () => [items[1]] } as unknown as MouseEvent)
        expect(interactedIndex).toBe(1)
    })

    it('uses roving tabindex and arrow-key navigation across none and single selection modes', () => {
        const group = new MDCButtonGroup()
        group.orientation = 'horizontal'
        const items = [createMockItem('a'), createMockItem('b'), createMockItem('c')]
        const internals = group as unknown as ButtonGroupInternals
        internals.items = items
        internals.updateRovingTabindex()

        // In 'none' mode, only one item is in the Tab order (tabIndex = 0) and others are -1
        expect(items[0].tabIndex).toBe(0)
        expect(items[1].tabIndex).toBe(-1)
        expect(items[2].tabIndex).toBe(-1)

        internals.handleKeyDown({
            key: 'ArrowRight',
            target: items[0],
            composedPath: () => [items[0]],
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent)
        expect(items[1].focus).toHaveBeenCalled()
        expect(items[1].tabIndex).toBe(0)
        expect(items[0].tabIndex).toBe(-1)

        // In 'single' mode, roving tabindex follows the selected/focused item and arrow keys update it
        group.selectionMode = 'single'
        internals.updateRovingTabindex()
        expect(items[0].tabIndex).toBe(0)
        expect(items[1].tabIndex).toBe(-1)
        expect(items[2].tabIndex).toBe(-1)

        internals.handleKeyDown({
            key: 'ArrowRight',
            target: items[0],
            composedPath: () => [items[0]],
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent)
        expect(items[1].tabIndex).toBe(0)
        expect(items[0].tabIndex).toBe(-1)
        expect(items[1].focus).toHaveBeenCalledTimes(2)

        internals.handleKeyDown({
            key: 'End',
            target: items[1],
            composedPath: () => [items[1]],
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent)
        expect(items[2].tabIndex).toBe(0)
        expect(items[1].tabIndex).toBe(-1)

        internals.handleKeyDown({
            key: 'Home',
            target: items[2],
            composedPath: () => [items[2]],
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent)
        expect(items[0].tabIndex).toBe(0)
        expect(items[2].tabIndex).toBe(-1)
    })
})
