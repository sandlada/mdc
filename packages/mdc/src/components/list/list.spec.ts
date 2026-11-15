/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { describe, it, expect, vi } from 'vitest'
import { Color } from '../../utils/color'
import { MDCList } from './list'
import { MDCListItem } from './list-item'
import { ListDefinition, ListItemDefinition } from './list.definition'
import {
    ListItemExpandChangeEvent,
    ListItemRequestActivationEvent,
    ListSelectionChangeEvent,
} from './list.interface'

interface ListInternals {
    assignedElements: HTMLElement[]
    syncChildren(): void
    updateTabIndices(): void
    handleRequestActivation(event: Event): void
    handleExpandChange(): void
    handleKeydown(event: KeyboardEvent): void
    render(): { strings: TemplateStringsArray; values: unknown[] }
}

interface ListItemInternals {
    listDisabled: boolean
    cachedChildItems: MDCListItem[]
    willUpdate(changedProperties: Map<string, unknown>): void
    handleActivation(event: Event): void
    getRenderClasses(): Record<string, boolean>
    render(): { strings: TemplateStringsArray; values: unknown[] }
}

const createStubElement = (tagName: string) => ({
    matches: (selector: string) => selector === tagName,
}) as unknown as HTMLElement

describe('ListDefinition & ListItemDefinition', () => {
    it('defines MD3 Expressive list and list-item tokens', () => {
        expect(ListDefinition['enabled-segmented-gap']).toBe('2px')
        expect(ListDefinition['enabled-standard-gap']).toBe('0px')

        expect(ListItemDefinition['one-line-container-height']).toBe('56px')
        expect(ListItemDefinition['two-line-container-height']).toBe('72px')
        expect(ListItemDefinition['three-line-container-height']).toBe('88px')

        expect(ListItemDefinition['enabled-container-padding-block-start']).toBe('10px')
        expect(ListItemDefinition['enabled-container-padding-block-end']).toBe('10px')
        expect(ListItemDefinition['enabled-container-padding-inline-start']).toBe('16px')
        expect(ListItemDefinition['enabled-container-padding-inline-end']).toBe('16px')
        expect(ListItemDefinition['enabled-between-space']).toBe('12px')

        expect(ListItemDefinition['enabled-segmented-first-container-shape-start-start']).toBe(Shape.Large)
        expect(ListItemDefinition['enabled-segmented-first-container-shape-end-start']).toBe(Shape.ExtraSmall)
        expect(ListItemDefinition['enabled-segmented-middle-container-shape-start-start']).toBe(Shape.ExtraSmall)
        expect(ListItemDefinition['enabled-segmented-last-container-shape-end-end']).toBe(Shape.Large)
        expect(ListItemDefinition['hovered-container-shape-start-start']).toBe(Shape.Medium)
        expect(ListItemDefinition['focused-container-shape-start-start']).toBe(Shape.Large)
        expect(ListItemDefinition['pressed-container-shape-start-start']).toBe(Shape.Large)
        expect(ListItemDefinition['enabled-selected-container-shape-start-start']).toBe(Shape.Large)

        expect(ListItemDefinition['enabled-overline-color']).toBe(Color.OnSurfaceVariant)
        expect(ListItemDefinition['enabled-segmented-container-color']).toBe(Color.Surface)
        expect(ListItemDefinition['enabled-container-color-selected']).toBe(Color.SecondaryContainer)
    })
})

describe('MDCList & MDCListItem', () => {
    const setupList = (elements: HTMLElement[], options: {
        variant?: 'standard' | 'segmented'
        selectionMode?: 'none' | 'single' | 'multiple'
        selectionRequired?: boolean
        disabled?: boolean
    } = {}) => {
        const list = new MDCList()
        if (options.variant) list.variant = options.variant
        if (options.selectionMode) list.selectionMode = options.selectionMode
        if (options.selectionRequired !== undefined) list.selectionRequired = options.selectionRequired
        if (options.disabled !== undefined) list.disabled = options.disabled
        const internals = list as unknown as ListInternals
        Object.defineProperty(list, 'assignedElements', {
            value: elements,
            configurable: true,
        })
        internals.syncChildren()
        internals.updateTabIndices()
        return { list, internals }
    }

    const createListItem = (type: 'text' | 'button' | 'link' = 'button') => {
        const item = new MDCListItem()
        item.type = type
        item.matches = ((selector: string) => selector === 'mdc-list-item') as unknown as typeof item.matches
        item.focus = vi.fn()
        return item
    }

    it('instantiates with MD3 defaults', () => {
        const list = new MDCList()
        expect(list.items).toEqual([])
        expect(list.variant).toBe('standard')
        expect(list.selectionMode).toBe('none')
        expect(list.selectionRequired).toBe(false)
        expect(list.disabled).toBe(false)

        const item = new MDCListItem()
        expect(item.type).toBe('text')
        expect(item.disabled).toBe(false)
        expect(item.href).toBe('')
        expect(item.target).toBe('')
        expect(item.selected).toBe(false)
        expect(item.variant).toBe('standard')
        expect(item.position).toBe('single')
        expect(item.listTabIndex).toBe(0)
        expect(item.isInteractive).toBe(false)
        expect(item.isDisabled).toBe(false)
    })

    it('coerces type to link when href is set and link items are never disabled', () => {
        const item = new MDCListItem()
        item.type = 'button'
        item.disabled = true
        item.href = 'https://example.com'
        ;(item as unknown as ListItemInternals).willUpdate(new Map())
        expect(item.type).toBe('link')
        expect(item.isDisabled).toBe(false)
    })

    it('assigns segmented positions across contiguous runs split by non-item elements', () => {
        const i1 = createListItem()
        const i2 = createListItem()
        const i3 = createListItem()
        const divider = createStubElement('mdc-divider')
        const i4 = createListItem()

        const { list } = setupList([i1, i2, i3, divider, i4], { variant: 'segmented' })

        expect(list.items.map((i) => i.position)).toEqual(['first', 'middle', 'last', 'single'])
        expect(list.items.every((i) => i.variant === 'segmented')).toBe(true)
    })

    it('manages single selection, selectionRequired, and emits list-selection-change', () => {
        const i0 = createListItem()
        const i1 = createListItem()
        const i2 = createListItem()
        const { list, internals } = setupList([i0, i1, i2], { selectionMode: 'single' })

        const events: unknown[] = []
        list.dispatchEvent = ((e: Event) => {
            if (e.type === ListSelectionChangeEvent) {
                events.push((e as CustomEvent).detail)
            }
            return true
        }) as typeof list.dispatchEvent

        const activate = (item: MDCListItem) => {
            internals.handleRequestActivation(new CustomEvent(ListItemRequestActivationEvent, {
                detail: { item },
            }))
        }

        activate(i0)
        expect(i0.selected).toBe(true)
        expect(list.selectedIndexes).toEqual([0])
        expect(events).toHaveLength(1)

        activate(i1)
        expect(i0.selected).toBe(false)
        expect(i1.selected).toBe(true)
        expect(list.selectedIndexes).toEqual([1])

        // Deselect when selectionRequired is false
        activate(i1)
        expect(i1.selected).toBe(false)
        expect(list.selectedIndexes).toEqual([])

        // Prevent deselect when selectionRequired is true
        list.selectionRequired = true
        activate(i2)
        const countBefore = events.length
        activate(i2)
        expect(i2.selected).toBe(true)
        expect(events.length).toBe(countBefore)
    })

    it('manages multiple selection', () => {
        const i0 = createListItem()
        const i1 = createListItem()
        const { list, internals } = setupList([i0, i1], { selectionMode: 'multiple' })
        list.dispatchEvent = vi.fn(() => true)

        internals.handleRequestActivation(new CustomEvent(ListItemRequestActivationEvent, { detail: { item: i0 } }))
        internals.handleRequestActivation(new CustomEvent(ListItemRequestActivationEvent, { detail: { item: i1 } }))
        expect(list.selectedIndexes).toEqual([0, 1])

        internals.handleRequestActivation(new CustomEvent(ListItemRequestActivationEvent, { detail: { item: i0 } }))
        expect(list.selectedIndexes).toEqual([1])
    })

    it('propagates list disabled state and skips non-interactive/disabled items in roving tabindex', () => {
        const textItem = createListItem('text')
        const disabledItem = createListItem('button')
        disabledItem.disabled = true
        const active1 = createListItem('button')
        const active2 = createListItem('button')

        const { list, internals } = setupList([textItem, disabledItem, active1, active2])

        expect(textItem.listTabIndex).toBe(-1)
        expect(disabledItem.listTabIndex).toBe(-1)
        expect(active1.listTabIndex).toBe(0)
        expect(active2.listTabIndex).toBe(-1)

        list.disabled = true
        internals.syncChildren()
        internals.updateTabIndices()
        expect(active1.isDisabled).toBe(true)
        expect(active2.isDisabled).toBe(true)
        expect(active1.listTabIndex).toBe(-1)
        expect(active2.listTabIndex).toBe(-1)
    })

    it('renders listbox/option ARIA roles when selectionMode is not none', () => {
        const list = new MDCList()
        list.selectionMode = 'multiple'
        const listTpl = (list as unknown as ListInternals).render()
        expect(listTpl.values).toContain('listbox')
        expect(listTpl.values).toContain('true')

        const item = createListItem('button')
        item.selectionMode = 'single'
        item.selected = true
        const itemTpl = (item as unknown as ListItemInternals).render()
        const rowTpl = itemTpl.values[0] as { values: unknown[] }
        expect(rowTpl.values).toContain('option')
        expect(rowTpl.values).toContain('true')
    })

    it('expands/collapses children, updates segmented positions, and preserves child selection', () => {
        expect(ListItemDefinition['expand-indicator-width']).toBe('32px')
        expect(ListItemDefinition['expand-indicator-height']).toBe('40px')
        expect(ListItemDefinition['enabled-expand-indicator-container-color-expanded']).toBe(Color.SurfaceContainer)

        const parent = createListItem('button')
        parent.expandable = true
        const child1 = createListItem('button')
        const child2 = createListItem('button')
        child2.selected = true
        const child3 = createListItem('button')
        ;(parent as unknown as ListItemInternals).cachedChildItems = [child1, child2, child3]

        const { list, internals } = setupList([parent], {
            variant: 'segmented',
            selectionMode: 'single',
        })

        // Collapsed: only parent is in visible items and has 'single' position
        expect(list.items).toEqual([parent])
        expect(parent.position).toBe('single')
        expect(child1.listTabIndex).toBe(-1)

        // Toggle expand via handleActivation
        const expandEvents: unknown[] = []
        parent.dispatchEvent = ((e: Event) => {
            if (e.type === ListItemExpandChangeEvent) {
                expandEvents.push((e as CustomEvent).detail)
                internals.handleExpandChange()
            } else if (e.type === ListItemRequestActivationEvent) {
                internals.handleRequestActivation(e)
            }
            return true
        }) as typeof parent.dispatchEvent

        ;(parent as unknown as ListItemInternals).handleActivation(new Event('click'))
        expect(parent.expanded).toBe(true)
        expect(expandEvents).toHaveLength(1)
        expect(list.items).toEqual([parent, child1, child2, child3])
        expect(list.items.map((i) => i.position)).toEqual(['first', 'middle', 'middle', 'last'])
        // Expanding parent does not clear child2's selection
        expect(child2.selected).toBe(true)
        expect(parent.selected).toBe(false)

        // Collapse again
        ;(parent as unknown as ListItemInternals).handleActivation(new Event('click'))
        expect(parent.expanded).toBe(false)
        expect(list.items).toEqual([parent])
        expect(parent.position).toBe('single')
    })
})
