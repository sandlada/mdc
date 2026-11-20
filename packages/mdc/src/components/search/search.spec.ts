/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { MDCSearchBar } from './search-bar'
import { MDCSearchView } from './search-view'
import { SearchBarAlignment, SearchViewVariant } from './search.interface'
import { SearchBarDefinition, SearchViewDefinition } from './search.definition'

describe('MDCSearchBar', () => {
    it('instantiates with defaults', () => {
        const bar = new MDCSearchBar()
        expect(bar.supportingText).toBe('Type here to search')
        expect(bar.alignment).toBe(SearchBarAlignment.Start)
        expect(bar.hideLeadingIcon).toBe(false)
        expect(bar.hideAvatar).toBe(false)
        expect(bar.value).toBe('')
        expect(bar.for).toBe('')
        expect(bar.disabled).toBe(false)
        expect(bar.searchView).toBeNull()
    })

    it('exposes a search root in render output', () => {
        const bar = new MDCSearchBar()
        const rendered = (bar as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('role="search"')
    })

    it('allows toggling key properties', () => {
        const bar = new MDCSearchBar()
        bar.supportingText = 'Find'
        bar.alignment = SearchBarAlignment.Center
        bar.hideAvatar = true
        bar.value = 'query'
        bar.disabled = true
        expect(bar.supportingText).toBe('Find')
        expect(bar.alignment).toBe(SearchBarAlignment.Center)
        expect(bar.hideAvatar).toBe(true)
        expect(bar.value).toBe('query')
        expect(bar.disabled).toBe(true)
        expect((bar as unknown as { getRenderClasses(): Record<string, boolean> }).getRenderClasses()['is-centered']).toBe(true)
    })

    it('opens linked SearchView when container is clicked outside action slots', () => {
        const bar = new MDCSearchBar()
        const view = new MDCSearchView()
        const showSpy = vi.spyOn(view, 'show').mockImplementation(() => {
            view.open = true
        })

        view.setupWithSearchBar(bar)
        expect(bar.searchView).toBe(view)
        expect(view.searchBar).toBe(bar)

        const handleContainerClick = (bar as unknown as {
            handleContainerClick(e: { target: { closest: (s: string) => Element | null } }): void
        }).handleContainerClick.bind(bar)

        // Clicking trailing-icon / avatar / custom slotted leading-icon should not open SearchView
        handleContainerClick({ target: { closest: (s: string) => (s.includes('.default-leading-icon') ? null : ({}) as Element) } })
        expect(showSpy).not.toHaveBeenCalled()

        // Clicking the default non-interactive leading search icon opens SearchView
        handleContainerClick({ target: { closest: () => ({}) as Element } })
        expect(showSpy).toHaveBeenCalledTimes(1)

        // Clicking the bar/input area opens SearchView
        handleContainerClick({ target: { closest: () => null } })
        expect(showSpy).toHaveBeenCalledTimes(2)
    })

    it('auto-links a nested MDCSearchView in the default slot', () => {
        const bar = new MDCSearchBar()
        const view = new MDCSearchView()
        ;(bar as unknown as {
            handleDefaultSlotChange(e: { target: { assignedElements: () => Element[] } }): void
        }).handleDefaultSlotChange({
            target: { assignedElements: () => [view] },
        })
        expect(bar.searchView).toBe(view)
        expect(view.searchBar).toBe(bar)
    })
})

describe('MDCSearchView', () => {
    it('instantiates with MD3 defaults', () => {
        const view = new MDCSearchView()
        expect(view.open).toBe(false)
        expect(view.variant).toBe(SearchViewVariant.Fullscreen)
        expect(view.supportingText).toBe('Search')
        expect(view.value).toBe('')
        expect(view.for).toBe('')
        expect(view.quick).toBe(false)
        expect(view.searchBar).toBeNull()
    })

    it('toggles open via show() and close()', () => {
        const view = new MDCSearchView()
        view.show()
        expect(view.open).toBe(true)
        view.close()
        expect(view.open).toBe(false)
    })

    it('coordinates value and open state bidirectionally with SearchBar via setupWithSearchBar', () => {
        const bar = new MDCSearchBar()
        const view = new MDCSearchView()
        view.value = 'material'

        view.setupWithSearchBar(bar)
        expect(bar.value).toBe('material')
        expect(bar.searchView).toBe(view)
        expect(view.searchBar).toBe(bar)

        // Clearing SearchView syncs back to SearchBar and emits clear + input
        const events: string[] = []
        view.dispatchEvent = ((e: Event) => {
            events.push(e.type)
            return true
        }) as typeof view.dispatchEvent

        ;(view as unknown as { handleClearClick(): void }).handleClearClick()
        expect(view.value).toBe('')
        expect(bar.value).toBe('')
        expect(events).toEqual(['input', 'clear'])

        // Unlinking clears both sides
        view.setupWithSearchBar(null)
        expect(view.searchBar).toBeNull()
        expect(bar.searchView).toBeNull()
    })

    it('defines MD3 style tokens for both SearchBar and SearchView', () => {
        expect(SearchBarDefinition['enabled-container-height']).toBe('56px')
        expect(SearchBarDefinition['enabled-supporting-text-leading']).toBeDefined()
        expect(SearchViewDefinition['enabled-header-height']).toBe('72px')
        expect(SearchViewDefinition['enabled-docked-header-height']).toBe('56px')
        expect(SearchViewDefinition['enabled-docked-min-width']).toBe('360px')
        expect(SearchViewDefinition['enabled-docked-max-width']).toBe('720px')
    })
})
