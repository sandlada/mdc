/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { BaseAppBar } from './internal/base-appbar'
import { MDCAppBar } from './appbar'
import {
    AppBarAlignment,
    AppBarScrollBehavior,
    AppBarVariant,
} from './appbar.interface'

class TestAppBar extends BaseAppBar {
    public getClasses() {
        return this.getRenderClasses()
    }

    public triggerSearchBoxClick(event: Event) {
        this.handleSearchBoxClick(event)
    }

    public triggerSearchBoxKeydown(event: KeyboardEvent) {
        this.handleSearchBoxKeydown(event)
    }

    public initScrollTarget() {
        this.setupScrollTarget()
    }

    public destroyScrollTarget() {
        this.cleanupScrollTarget()
    }

    public runWillUpdate(changed: Map<string, unknown>) {
        this.willUpdate(changed as never)
    }

    public runUpdated(changed: Map<string, unknown>) {
        this.updated(changed as never)
    }

    public runUpdateCycle(changed: Map<string, unknown>) {
        this.willUpdate(changed as never)
        this.updated(changed as never)
    }
}

describe('BaseAppBar', () => {
    it('has correct default properties', () => {
        const appbar = new TestAppBar()
        expect(appbar.variant).toBe(AppBarVariant.Small)
        expect(appbar.alignment).toBe(AppBarAlignment.Start)
        expect(appbar.scrollBehavior).toBe(AppBarScrollBehavior.Pinned)
        expect(appbar.headline).toBe('')
        expect(appbar.subtitle).toBe('')
        expect(appbar.scrolled).toBe(false)
        expect(appbar.collapsed).toBe(false)
        expect(appbar.scrollTarget).toBe(null)
        expect(appbar.for).toBe('')
        expect(appbar.ignoreGlobalConfig).toBe(false)
        expect(appbar.disableElevation).toBe(false)
        expect(appbar.disableRipple).toBe(false)
    })

    it('allows updating every property', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.Search
        appbar.alignment = AppBarAlignment.Center
        appbar.scrollBehavior = AppBarScrollBehavior.Collapse
        appbar.headline = 'Title'
        appbar.subtitle = 'Subtitle'
        appbar.scrolled = true
        appbar.collapsed = true
        appbar.scrollTarget = 'window'
        appbar.for = 'search-view-1'
        appbar.ignoreGlobalConfig = true
        appbar.disableElevation = true
        appbar.disableRipple = true

        expect(appbar.variant).toBe(AppBarVariant.Search)
        expect(appbar.alignment).toBe(AppBarAlignment.Center)
        expect(appbar.scrollBehavior).toBe(AppBarScrollBehavior.Collapse)
        expect(appbar.headline).toBe('Title')
        expect(appbar.subtitle).toBe('Subtitle')
        expect(appbar.scrolled).toBe(true)
        expect(appbar.collapsed).toBe(true)
        expect(appbar.scrollTarget).toBe('window')
        expect(appbar.for).toBe('search-view-1')
        expect(appbar.ignoreGlobalConfig).toBe(true)
        expect(appbar.disableElevation).toBe(true)
        expect(appbar.disableRipple).toBe(true)
    })

    it('normalizes variants and computes render classes', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.CenterAligned
        expect(appbar.getClasses()).toMatchObject({
            container: true,
            small    : true,
            centered : true,
        })

        appbar.variant = AppBarVariant.Medium
        appbar.collapsed = true
        expect(appbar.getClasses()).toMatchObject({
            'medium-flexible': true,
            collapsed        : true,
        })

        appbar.variant = AppBarVariant.Large
        expect(appbar.getClasses()).toMatchObject({
            'large-flexible': true,
            collapsed       : true,
        })
    })

    it('tracks scrollTarget and collapses flexible variants when scrollBehavior is collapse', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.MediumFlexible
        appbar.scrollBehavior = AppBarScrollBehavior.Collapse

        const listeners = new Map<string, EventListener>()
        const mockScroller = {
            scrollTop: 0,
            addEventListener(type: string, fn: EventListener) {
                listeners.set(type, fn)
            },
            removeEventListener(type: string) {
                listeners.delete(type)
            },
        }

        const events: Array<{ scrolled: boolean; collapsed: boolean; progress: number }> = []
        appbar.addEventListener('scroll-state-change', (e) => {
            events.push((e as CustomEvent<{ scrolled: boolean; collapsed: boolean; progress: number }>).detail)
        })

        const scrubAnims: Array<{ currentTime: number | null; pause: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> }> = []
        const makeAnim = () => {
            const anim = { currentTime: 0 as number | null, pause: vi.fn(), cancel: vi.fn() }
            scrubAnims.push(anim)
            return anim
        }
        const hostStyleMap = new Map<string, string>()
        Object.defineProperty(appbar, 'style', {
            value: {
                setProperty     : (k: string, v: string) => hostStyleMap.set(k, v),
                removeProperty  : (k: string) => hostStyleMap.delete(k),
                getPropertyValue: (k: string) => hostStyleMap.get(k) ?? '',
            },
            configurable: true,
        })
        Object.defineProperty(appbar, 'containerElement', {
            value: { getBoundingClientRect: () => ({ height: 112 }), animate: makeAnim },
            configurable: true,
        })
        Object.defineProperty(appbar, 'topRowElement', {
            value: { animate: makeAnim },
            configurable: true,
        })
        Object.defineProperty(appbar, 'flexibleContentElement', {
            value: { animate: makeAnim },
            configurable: true,
        })
        Object.defineProperty(appbar, 'collapsedTitleElement', {
            value: { animate: makeAnim },
            configurable: true,
        })

        appbar.scrollTarget = mockScroller as unknown as HTMLElement
        appbar.initScrollTarget()

        expect(appbar.scrolled).toBe(false)
        expect(appbar.collapsed).toBe(false)

        mockScroller.scrollTop = 24
        listeners.get('scroll')?.(new Event('scroll'))
        expect(appbar.scrolled).toBe(true)
        expect(appbar.collapsed).toBe(false)
        expect(scrubAnims.length).toBe(4)
        expect(scrubAnims[0].pause).toHaveBeenCalledTimes(1)
        expect(scrubAnims[0].currentTime).toBe(500)
        expect(appbar.style.getPropertyValue('--_expanded-height')).toBe('112px')

        mockScroller.scrollTop = 60
        listeners.get('scroll')?.(new Event('scroll'))
        expect(appbar.scrolled).toBe(true)
        expect(appbar.collapsed).toBe(true)
        expect(scrubAnims[0].currentTime).toBe(1000)
        expect(appbar.style.getPropertyValue('--_expanded-height')).toBe('112px')
        expect(events).toEqual([
            { scrolled: false, collapsed: false, progress: 0 },
            { scrolled: true, collapsed: false, progress: 0.5 },
            { scrolled: true, collapsed: true, progress: 1 },
        ])

        appbar.destroyScrollTarget()
        expect(listeners.size).toBe(0)
        expect(scrubAnims[0].cancel).toHaveBeenCalledTimes(1)
        expect(appbar.style.getPropertyValue('--_expanded-height')).toBe('')
    })

    it('dispatches search-click and calls linked search-view show()', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.Search
        appbar.for = 'my-search-view'

        const showMock = vi.fn()
        ;(appbar as unknown as { getRootNode: () => unknown }).getRootNode = () => ({
            getElementById: (id: string) => (id === 'my-search-view' ? { show: showMock } : null),
        })

        const clickHandler = vi.fn()
        appbar.addEventListener('search-click', clickHandler)

        const box = { closest: () => null } as unknown as HTMLElement
        appbar.triggerSearchBoxClick({ target: box, currentTarget: box } as unknown as Event)

        expect(clickHandler).toHaveBeenCalledTimes(1)
        expect(showMock).toHaveBeenCalledTimes(1)
    })

    it('ignores search-box click when target is an inner button', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.Search

        const clickHandler = vi.fn()
        appbar.addEventListener('search-click', clickHandler)

        const innerButton = {} as HTMLElement
        const box = {} as HTMLElement
        const target = { closest: () => innerButton } as unknown as HTMLElement
        appbar.triggerSearchBoxClick({ target, currentTarget: box } as unknown as Event)

        expect(clickHandler).not.toHaveBeenCalled()
    })

    it('activates search-box on Enter or Space keydown', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.Search

        const clickHandler = vi.fn()
        appbar.addEventListener('search-click', clickHandler)

        const box = { closest: () => null } as unknown as HTMLElement
        const event = {
            key           : 'Enter',
            target        : box,
            currentTarget : box,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent

        appbar.triggerSearchBoxKeydown(event)
        expect(event.preventDefault).toHaveBeenCalledTimes(1)
        expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it('runs WAAPI transitions on state changes when motion is enabled', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.MediumFlexible

        const containerAnimate = vi.fn(() => ({
            cancel          : vi.fn(),
            addEventListener: vi.fn(),
        }))
        const collapsedTitleAnimate = vi.fn(() => ({
            cancel          : vi.fn(),
            addEventListener: vi.fn(),
        }))

        let containerHeight = 112
        Object.defineProperty(appbar, 'containerElement', {
            value       : {
                getBoundingClientRect: () => ({ height: containerHeight }),
                animate              : containerAnimate,
            },
            configurable: true,
        })
        Object.defineProperty(appbar, 'collapsedTitleElement', {
            value       : {
                getBoundingClientRect: () => ({ left: 56, top: 18 }),
                animate              : collapsedTitleAnimate,
            },
            configurable: true,
        })
        Object.defineProperty(appbar, 'headlineElement', {
            value       : {
                getBoundingClientRect: () => ({ left: 16, top: 64 }),
                animate              : vi.fn(),
            },
            configurable: true,
        })

        // Initial render establishes baseline without animating
        appbar.runUpdateCycle(new Map())
        expect(containerAnimate).not.toHaveBeenCalled()

        // Collapse transition
        appbar.runWillUpdate(new Map([['collapsed', false]]))
        appbar.collapsed = true
        containerHeight = 64
        appbar.runUpdated(new Map([['collapsed', false]]))

        expect(containerAnimate).toHaveBeenCalledTimes(1)
        expect(collapsedTitleAnimate).toHaveBeenCalledTimes(1)
    })
})

describe('MDCAppBar', () => {
    it('has correct default properties', () => {
        const appbar = new MDCAppBar()
        expect(appbar.variant).toBe(AppBarVariant.Small)
        expect(appbar.alignment).toBe(AppBarAlignment.Start)
        expect(appbar.scrollBehavior).toBe(AppBarScrollBehavior.Pinned)
        expect(appbar.headline).toBe('')
        expect(appbar.subtitle).toBe('')
        expect(appbar.scrolled).toBe(false)
        expect(appbar.collapsed).toBe(false)
        expect(appbar.scrollTarget).toBe(null)
        expect(appbar.for).toBe('')
    })
})
