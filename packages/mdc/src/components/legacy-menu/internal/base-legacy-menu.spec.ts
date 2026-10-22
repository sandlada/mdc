/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'
import { BaseLegacyMenu } from './base-legacy-menu'
import type { IMDCLegacyMenuItem } from '../legacy-menu.interface'

vi.mock('@floating-ui/dom', () => ({
    autoUpdate: (...args: unknown[]) => {
        const globals = globalThis as unknown as { __legacyMenuAutoUpdateArgs?: unknown[]; __legacyMenuAutoUpdateCalls?: number }
        globals.__legacyMenuAutoUpdateArgs = args
        globals.__legacyMenuAutoUpdateCalls = (globals.__legacyMenuAutoUpdateCalls ?? 0) + 1
        return () => {
            ;(globalThis as unknown as { __legacyMenuAutoUpdateCleaned?: boolean }).__legacyMenuAutoUpdateCleaned = true
        }
    },
    computePosition: async (...args: unknown[]) => {
        const globals = globalThis as unknown as { __legacyMenuComputePositionArgs?: unknown[]; __legacyMenuComputePositionCalls?: number }
        globals.__legacyMenuComputePositionArgs = args
        globals.__legacyMenuComputePositionCalls = (globals.__legacyMenuComputePositionCalls ?? 0) + 1
        return { x: 7, y: 9 }
    },
    offset: (value: unknown) => ({ name: 'offset', options: value }),
    flip: () => ({ name: 'flip' }),
    shift: (value: unknown) => ({ name: 'shift', options: value }),
}))

class TestLegacyMenu extends BaseLegacyMenu {}

type MockLegacyMenuItem = {
    isInteractive: boolean
    isDisabled: boolean
    listTabIndex: number
    textContent: string
    checkable: boolean
    radio: boolean
    selected: boolean
    keepOpen?: boolean
    focus: ReturnType<typeof vi.fn>
    matches: (selector: string) => boolean
}

const makeMenu = (): TestLegacyMenu => new TestLegacyMenu()

const makeItem = (overrides: Partial<MockLegacyMenuItem> = {}): MockLegacyMenuItem => ({
    isInteractive: true,
    isDisabled: false,
    listTabIndex: -1,
    textContent: '',
    checkable: false,
    radio: false,
    selected: false,
    focus: vi.fn(),
    matches: () => false,
    ...overrides,
})

const setItems = (menu: TestLegacyMenu, items: MockLegacyMenuItem[]): void => {
    ;(menu as unknown as { cachedItems: IMDCLegacyMenuItem[] }).cachedItems =
        items as unknown as IMDCLegacyMenuItem[]
    // Emulate live :focus-within: focusing a mock moves the focused state,
    // so the roving-tabindex sync after focus() promotes the right item.
    items.forEach((item, index) => {
        const spied = vi.fn(() => focusOnly(items, index))
        item.focus = spied
    })
}

const focusOnly = (items: MockLegacyMenuItem[], index: number): void => {
    items.forEach((item, i) => {
        item.matches = (): boolean => i === index
    })
}

const pressKey = (
    menu: TestLegacyMenu,
    target: MockLegacyMenuItem,
    key: string,
    extra: Record<string, unknown> = {},
): { prevented: boolean } => {
    let prevented = false
    const event = {
        key,
        target,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: (): void => { prevented = true },
        ...extra,
    } as unknown as KeyboardEvent
    ;(menu as unknown as { handleKeydown(e: KeyboardEvent): void })['handleKeydown'](event)
    return { prevented }
}

const typeahead = (menu: TestLegacyMenu, char: string): void => {
    ;(menu as unknown as { handleTypeahead(c: string): void })['handleTypeahead'](char)
}

const updateTabIndices = (menu: TestLegacyMenu): void => {
    ;(menu as unknown as { updateTabIndices(): void })['updateTabIndices']()
}

const patchAnchor = (menu: TestLegacyMenu, anchor: { focus: ReturnType<typeof vi.fn> }): void => {
    ;(menu as unknown as { getAnchorElement: () => unknown })['getAnchorElement'] = () => anchor
}

const patchSurface = (menu: TestLegacyMenu, surface: unknown): void => {
    ;(menu as unknown as { getSurfaceElement: () => unknown })['getSurfaceElement'] = () => surface
}

const patchRtl = (menu: TestLegacyMenu, rtl: boolean): void => {
    ;(menu as unknown as { isRtlContext: () => boolean })['isRtlContext'] = () => rtl
}

const listen = (menu: TestLegacyMenu): Record<'showing' | 'hiding' | 'opened' | 'closed' | 'select', Event[]> => {
    const showing: Event[] = []
    const hiding: Event[] = []
    const opened: Event[] = []
    const closed: Event[] = []
    const select: Event[] = []
    menu.addEventListener('showing', (e) => showing.push(e))
    menu.addEventListener('hiding', (e) => hiding.push(e))
    menu.addEventListener('opened', (e) => opened.push(e))
    menu.addEventListener('closed', (e) => closed.push(e))
    menu.addEventListener('select', (e) => select.push(e))
    return { showing, hiding, opened, closed, select }
}

const flush = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 0))
}

type PositionGlobals = {
    autoUpdateArgs?: unknown[]
    autoUpdateCalls: number
    computePositionArgs?: unknown[]
    computePositionCalls: number
}

const readPositionGlobals = (): PositionGlobals => {
    const globals = globalThis as unknown as {
        __legacyMenuAutoUpdateArgs?: unknown[]
        __legacyMenuAutoUpdateCalls?: number
        __legacyMenuComputePositionArgs?: unknown[]
        __legacyMenuComputePositionCalls?: number
    }
    return {
        autoUpdateArgs: globals.__legacyMenuAutoUpdateArgs,
        autoUpdateCalls: globals.__legacyMenuAutoUpdateCalls ?? 0,
        computePositionArgs: globals.__legacyMenuComputePositionArgs,
        computePositionCalls: globals.__legacyMenuComputePositionCalls ?? 0,
    }
}

const resetPositionGlobals = (): void => {
    const globals = globalThis as unknown as Record<string, unknown>
    delete globals['__legacyMenuAutoUpdateArgs']
    delete globals['__legacyMenuAutoUpdateCalls']
    delete globals['__legacyMenuComputePositionArgs']
    delete globals['__legacyMenuComputePositionCalls']
}

const fireItemActivated = (menu: TestLegacyMenu, item: MockLegacyMenuItem): void => {
    const event = new CustomEvent('item-activated', {
        detail: { item },
        bubbles: true,
        composed: true,
    })
    ;(menu as unknown as { handleItemActivated(e: Event): void })['handleItemActivated'](event)
}

const fireRequestActivation = (menu: TestLegacyMenu, item: MockLegacyMenuItem): void => {
    const event = new CustomEvent('request-activation', {
        detail: { item },
        bubbles: true,
        composed: true,
    })
    ;(menu as unknown as { handleRequestActivation(e: Event): void })['handleRequestActivation'](event)
}

const fireOutsidePointerdown = (menu: TestLegacyMenu, inside: boolean): void => {
    const target = inside ? menu : {}
    const event = { composedPath: (): unknown[] => [target] } as unknown as Event
    ;(menu as unknown as { handleDocumentPointerdown(e: Event): void })['handleDocumentPointerdown'](event)
}

describe('BaseLegacyMenu defaults', () => {
    it('has closed baseline defaults with bottom-start placement', () => {
        const menu = makeMenu()
        expect(menu.open).toBe(false)
        expect(menu.quick).toBe(false)
        expect(menu.placement).toBe('bottom-start')
        expect(menu.colorStyle).toBe('standard')
        expect(menu.layout).toBe('standard')
        expect(menu.label).toBe(null)
        expect(menu.items).toEqual([])
    })

    it('renders role=menu with the aria-label', () => {
        const menu = makeMenu()
        menu.label = 'Actions'
        const rendered = (menu as unknown as { render(): { strings: unknown; values: unknown[] } }).render()
        expect(Array.from(rendered.strings as unknown as string[]).join('')).toContain('role="menu"')
        expect(rendered.values).toContain('Actions')
    })

    it('throws on non-standard color-style and layout', () => {
        const menu = makeMenu()
        menu.colorStyle = 'vibrant' as unknown as typeof menu.colorStyle
        expect(() => (menu as unknown as { willUpdate(m: Map<unknown, unknown>): void }).willUpdate(new Map())).toThrowError(/color-style/)
        const grouped = makeMenu()
        grouped.layout = 'grouped' as unknown as typeof grouped.layout
        expect(() => (grouped as unknown as { willUpdate(m: Map<unknown, unknown>): void }).willUpdate(new Map())).toThrowError(/layout/)
    })
})

describe('BaseLegacyMenu open/close events', () => {
    it('show dispatches showing then opened and sets open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        expect(menu.open).toBe(true)
        expect(events.showing).toHaveLength(1)
        expect(events.opened).toHaveLength(1)
        expect(events.showing[0].cancelable).toBe(true)
    })

    it('show is a no-op when already open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        await menu.show()
        expect(events.showing).toHaveLength(1)
        expect(events.opened).toHaveLength(1)
    })

    it('canceling showing keeps the menu closed', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        menu.addEventListener('showing', (e) => e.preventDefault())
        await menu.show()
        expect(menu.open).toBe(false)
        expect(events.opened).toHaveLength(0)
    })

    it('hide dispatches hiding then closed and clears open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        await menu.hide()
        expect(menu.open).toBe(false)
        expect(events.hiding).toHaveLength(1)
        expect(events.closed).toHaveLength(1)
    })

    it('hide is a no-op when already closed', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.hide()
        expect(events.hiding).toHaveLength(0)
        expect(events.closed).toHaveLength(0)
    })

    it('canceling hiding keeps the menu open with no closed event', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        menu.addEventListener('hiding', (e) => e.preventDefault())
        await menu.hide()
        expect(menu.open).toBe(true)
        expect(events.hiding).toHaveLength(1)
        expect(events.closed).toHaveLength(0)
    })

    it('initializes roving tabindex on show', async () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem(), makeItem()]
        setItems(menu, items)
        await menu.show()
        expect(items[0].listTabIndex).toBe(0)
        expect(items[1].listTabIndex).toBe(-1)
        expect(items[2].listTabIndex).toBe(-1)
    })
})

describe('BaseLegacyMenu quick and reduced motion', () => {
    it('quick skips the animation hook', async () => {
        const menu = makeMenu()
        const animate = vi.fn(async () => undefined)
        ;(menu as unknown as { animateSurface: (...args: unknown[]) => Promise<void> })['animateSurface'] = animate
        menu.quick = true
        await menu.show()
        expect(animate).not.toHaveBeenCalled()
        await menu.hide()
        expect(animate).not.toHaveBeenCalled()
    })

    it('animates when neither quick nor reduced motion applies', async () => {
        const menu = makeMenu()
        const animate = vi.fn(async () => undefined)
        ;(menu as unknown as { animateSurface: (...args: unknown[]) => Promise<void> })['animateSurface'] = animate
        await menu.show()
        expect(animate).toHaveBeenCalledTimes(1)
        await menu.hide()
        expect(animate).toHaveBeenCalledTimes(2)
    })

    it('prefers-reduced-motion skips the animation hook at logic level', async () => {
        const menu = makeMenu()
        const animate = vi.fn(async () => undefined)
        ;(menu as unknown as { animateSurface: (...args: unknown[]) => Promise<void> })['animateSurface'] = animate
        ;(menu as unknown as { prefersReducedMotion: () => boolean })['prefersReducedMotion'] = () => true
        await menu.show()
        expect(animate).not.toHaveBeenCalled()
        await menu.hide()
        expect(animate).not.toHaveBeenCalled()
    })
})

describe('BaseLegacyMenu item motion delays', () => {
    type StyledItem = MockLegacyMenuItem & { style: { setProperty: ReturnType<typeof vi.fn> } }

    const makeStyledItem = (): StyledItem => ({
        ...makeItem(),
        style: { setProperty: vi.fn() },
    })

    const applyDelays = (menu: TestLegacyMenu): void => {
        ;(menu as unknown as { syncItemMotionDelays(): void }).syncItemMotionDelays()
    }

    const delayFor = (item: StyledItem, property: string): number => {
        const call = item.style.setProperty.mock.calls.find(([name]) => name === property)
        return Number.parseFloat(String(call?.[1] ?? 'NaN'))
    }

    it('staggers downward menus from top to bottom on open and bottom to top on close', () => {
        const menu = makeMenu()
        const items = [makeStyledItem(), makeStyledItem(), makeStyledItem()]
        menu.placement = 'bottom-start'
        setItems(menu, items)

        applyDelays(menu)

        expect(delayFor(items[0], '--_menu-item-open-delay')).toBeCloseTo(0)
        expect(delayFor(items[1], '--_menu-item-open-delay')).toBeCloseTo(250 / 3)
        expect(delayFor(items[2], '--_menu-item-open-delay')).toBeCloseTo(500 / 3)
        expect(delayFor(items[0], '--_menu-item-close-delay')).toBeCloseTo(50 + 100 / 3)
        expect(delayFor(items[1], '--_menu-item-close-delay')).toBeCloseTo(50 + 50 / 3)
        expect(delayFor(items[2], '--_menu-item-close-delay')).toBeCloseTo(50)
    })

    it('reverses both orders for upward placements', () => {
        const menu = makeMenu()
        const items = [makeStyledItem(), makeStyledItem(), makeStyledItem()]
        menu.placement = 'top'
        setItems(menu, items)

        applyDelays(menu)

        expect(delayFor(items[0], '--_menu-item-open-delay')).toBeCloseTo(500 / 3)
        expect(delayFor(items[1], '--_menu-item-open-delay')).toBeCloseTo(250 / 3)
        expect(delayFor(items[2], '--_menu-item-open-delay')).toBeCloseTo(0)
        expect(delayFor(items[0], '--_menu-item-close-delay')).toBeCloseTo(50)
        expect(delayFor(items[1], '--_menu-item-close-delay')).toBeCloseTo(50 + 50 / 3)
        expect(delayFor(items[2], '--_menu-item-close-delay')).toBeCloseTo(50 + 100 / 3)
    })
})

describe('BaseLegacyMenu outside dismiss and Escape', () => {
    it('outside pointerdown closes the menu', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        fireOutsidePointerdown(menu, false)
        await flush()
        expect(menu.open).toBe(false)
        expect(events.closed).toHaveLength(1)
    })

    it('inside pointerdown keeps the menu open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        fireOutsidePointerdown(menu, true)
        await flush()
        expect(menu.open).toBe(true)
        expect(events.closed).toHaveLength(0)
    })

    it('Escape closes the menu and returns focus to the anchor', async () => {
        const menu = makeMenu()
        const anchor = { focus: vi.fn() }
        patchAnchor(menu, anchor)
        const events = listen(menu)
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        await menu.show()
        const { prevented } = pressKey(menu, items[0], 'Escape')
        expect(prevented).toBe(true)
        await flush()
        expect(menu.open).toBe(false)
        expect(events.closed).toHaveLength(1)
        expect(anchor.focus).toHaveBeenCalledTimes(1)
    })

    it('Escape while closed does nothing', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        const items = [makeItem()]
        setItems(menu, items)
        const { prevented } = pressKey(menu, items[0], 'Escape')
        expect(prevented).toBe(false)
        expect(events.closed).toHaveLength(0)
    })
})

describe('BaseLegacyMenu Arrow/Home/End navigation', () => {
    it('ArrowDown moves to the next item and promotes tabindex', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 0)
        const { prevented } = pressKey(menu, items[0], 'ArrowDown')
        expect(prevented).toBe(true)
        expect(items[1].focus).toHaveBeenCalledTimes(1)
        expect(items[1].listTabIndex).toBe(0)
        expect(items[0].listTabIndex).toBe(-1)
    })

    it('ArrowDown wraps from the last item to the first', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowDown')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
    })

    it('ArrowUp wraps from the first item to the last', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 0)
        pressKey(menu, items[0], 'ArrowUp')
        expect(items[1].focus).toHaveBeenCalledTimes(1)
    })

    it('navigation skips disabled and non-interactive items', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem({ isDisabled: true }), makeItem({ isInteractive: false }), makeItem()]
        setItems(menu, items)
        focusOnly(items, 0)
        pressKey(menu, items[0], 'ArrowDown')
        expect(items[3].focus).toHaveBeenCalledTimes(1)
        expect(items[3].listTabIndex).toBe(0)
    })

    it('Home focuses the first focusable item and End the last', () => {
        const menu = makeMenu()
        const items = [makeItem({ isDisabled: true }), makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 2)
        pressKey(menu, items[2], 'Home')
        expect(items[1].focus).toHaveBeenCalledTimes(1)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'End')
        expect(items[2].focus).toHaveBeenCalledTimes(1)
    })

    it('ArrowLeft/Right follow the LTR idiom and mirror in RTL', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowLeft')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowRight')
        expect(items[2].focus).toHaveBeenCalledTimes(1)
        patchRtl(menu, true)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowLeft')
        expect(items[2].focus).toHaveBeenCalledTimes(2)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowRight')
        expect(items[0].focus).toHaveBeenCalledTimes(2)
    })

    it('activateNextItem/activatePreviousItem wrap with focus', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 1)
        menu.activateNextItem()
        expect(items[0].focus).toHaveBeenCalledTimes(1)
        focusOnly(items, 0)
        menu.activatePreviousItem()
        expect(items[1].focus).toHaveBeenCalledTimes(1)
    })

    it('ignores keys from targets outside the menu and non-navigation keys', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        const outside = pressKey(menu, makeItem(), 'ArrowDown')
        expect(outside.prevented).toBe(false)
        focusOnly(items, 0)
        const other = pressKey(menu, items[0], 'Enter')
        expect(other.prevented).toBe(false)
        expect(items[1].focus).not.toHaveBeenCalled()
    })
})

describe('BaseLegacyMenu typeahead', () => {
    it('focuses the first match and accumulates a buffer', () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: 'Apple' }), makeItem({ textContent: 'Apricot' })]
        setItems(menu, items)
        typeahead(menu, 'a')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
        typeahead(menu, 'p')
        expect(items[0].focus).toHaveBeenCalledTimes(2)
    })

    it('falls back to the last character when the buffer matches nothing', () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: 'Apple' }), makeItem({ textContent: 'Banana' })]
        setItems(menu, items)
        typeahead(menu, 'a')
        typeahead(menu, 'b')
        expect(items[1].focus).toHaveBeenCalledTimes(1)
    })

    it('skips disabled items and matches case-insensitively', () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: 'Avocado', isDisabled: true }), makeItem({ textContent: 'Apple' })]
        setItems(menu, items)
        typeahead(menu, 'A')
        expect(items[1].focus).toHaveBeenCalledTimes(1)
    })

    it('routes printable keys through keydown and ignores Space', () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: 'Apple' }), makeItem({ textContent: 'Banana' })]
        setItems(menu, items)
        const typed = pressKey(menu, items[0], 'b')
        expect(typed.prevented).toBe(true)
        expect(items[1].focus).toHaveBeenCalledTimes(1)
        const spaced = pressKey(menu, items[0], ' ')
        expect(spaced.prevented).toBe(false)
    })
})

describe('BaseLegacyMenu positioning (floating-ui)', () => {
    it('exposes the offset/flip/shift middleware chain', () => {
        const menu = makeMenu()
        const middleware = (menu as unknown as { createPositionMiddleware(): Array<{ name: string }> }).createPositionMiddleware()
        expect(middleware.map((entry) => entry.name)).toEqual(['offset', 'flip', 'shift'])
    })

    it('tracks the anchor with autoUpdate and positions via computePosition', async () => {
        resetPositionGlobals()
        const menu = makeMenu()
        const anchor = {}
        const style = { setProperty: vi.fn(), removeProperty: vi.fn() }
        const surface = { style }
        patchAnchor(menu, anchor as unknown as { focus: ReturnType<typeof vi.fn> })
        patchSurface(menu, surface)
        menu.placement = 'top'
        await menu.show()
        const globals = readPositionGlobals()
        expect(globals.autoUpdateCalls).toBe(1)
        expect(globals.autoUpdateArgs?.[0]).toBe(anchor)
        expect(globals.autoUpdateArgs?.[1]).toBe(surface)
        const update = globals.autoUpdateArgs?.[2] as () => void
        update()
        await flush()
        const afterUpdate = readPositionGlobals()
        expect(afterUpdate.computePositionCalls).toBe(1)
        expect(afterUpdate.computePositionArgs?.[0]).toBe(anchor)
        expect(afterUpdate.computePositionArgs?.[1]).toBe(surface)
        expect(afterUpdate.computePositionArgs?.[2]).toMatchObject({ strategy: 'fixed', placement: 'top' })
        const middleware = (afterUpdate.computePositionArgs?.[2] as { middleware: Array<{ name: string }> }).middleware
        expect(middleware.map((entry) => entry.name)).toEqual(['offset', 'flip', 'shift'])
        expect(style.setProperty).toHaveBeenCalledWith('left', '7px')
        expect(style.setProperty).toHaveBeenCalledWith('top', '9px')
    })

    it('anchors upward placements to the block-end edge', () => {
        const menu = makeMenu()
        const isBlockEndAnchored = (menu as unknown as { isBlockEndAnchored(placement: string | undefined): boolean })
            .isBlockEndAnchored

        expect(isBlockEndAnchored('top')).toBe(true)
        expect(isBlockEndAnchored('top-start')).toBe(true)
        expect(isBlockEndAnchored('left-end')).toBe(true)
        expect(isBlockEndAnchored('right-end')).toBe(true)
        expect(isBlockEndAnchored('bottom-end')).toBe(false)
        expect(isBlockEndAnchored('right-start')).toBe(false)
        expect(isBlockEndAnchored(undefined)).toBe(false)
    })

    it('updatePosition is a no-op without an anchor or surface', async () => {
        resetPositionGlobals()
        const menu = makeMenu()
        await menu.updatePosition()
        expect(readPositionGlobals().computePositionCalls).toBe(0)
    })

    it('keeps the anchored position until the close animation settles', async () => {
        resetPositionGlobals()
        const menu = makeMenu()
        const style = { setProperty: vi.fn(), removeProperty: vi.fn() }
        const surface = { style }
        patchAnchor(menu, { focus: vi.fn() })
        patchSurface(menu, surface)
        await menu.show()

        let release = (): void => {}
        const animation = new Promise<void>((resolve) => { release = resolve })
        ;(menu as unknown as { animateSurface: () => Promise<void> })['animateSurface'] = () => animation
        style.removeProperty.mockClear()

        const hidePromise = menu.hide()
        await flush()
        expect(menu.open).toBe(false)
        expect(style.removeProperty).not.toHaveBeenCalled()

        release()
        await hidePromise
        expect(style.removeProperty).toHaveBeenCalledWith('position')
        expect(style.removeProperty).toHaveBeenCalledWith('left')
        expect(style.removeProperty).toHaveBeenCalledWith('right')
        expect(style.removeProperty).toHaveBeenCalledWith('top')
        expect(style.removeProperty).toHaveBeenCalledWith('bottom')
    })

    it('clears open before the close animation hook so the transition starts from the anchored state', async () => {
        const menu = makeMenu()
        await menu.show()

        let openDuringAnimation: boolean | null = null
        ;(menu as unknown as { animateSurface: () => Promise<void> })['animateSurface'] = async () => {
            openDuringAnimation = menu.open
        }

        await menu.hide()
        expect(openDuringAnimation).toBe(false)
    })

    it('recomputes open submenu positions after the surface height transition settles', () => {
        const menu = makeMenu()
        const surface = {}
        patchSurface(menu, surface)
        const openSubmenu = { open: true, hide: vi.fn(), reposition: vi.fn() }
        const closedSubmenu = { open: false, hide: vi.fn(), reposition: vi.fn() }
        ;(menu as unknown as { querySelectorAll: () => unknown[] }).querySelectorAll = () =>
            [openSubmenu, closedSubmenu]
        menu.open = true
        const handler = (menu as unknown as { handleSurfaceTransitionEnd(e: TransitionEvent): void })
            .handleSurfaceTransitionEnd

        const transition = (target: unknown, propertyName: string): TransitionEvent =>
            ({ target, propertyName }) as unknown as TransitionEvent

        handler(transition(surface, 'height'))
        expect(openSubmenu.reposition).toHaveBeenCalledTimes(1)
        expect(closedSubmenu.reposition).not.toHaveBeenCalled()

        // Non-height transitions (opacity / display / item fades) do not move
        // the trigger row and must not cause extra positioning work.
        handler(transition(surface, 'opacity'))
        expect(openSubmenu.reposition).toHaveBeenCalledTimes(1)

        // A bubbled transition from a descendant is not the surface's own.
        handler(transition({}, 'height'))
        expect(openSubmenu.reposition).toHaveBeenCalledTimes(1)

        // Closing menus keep the last anchored positions until hide settles.
        menu.open = false
        handler(transition(surface, 'height'))
        expect(openSubmenu.reposition).toHaveBeenCalledTimes(1)
    })
})

describe('BaseLegacyMenu select policy (events only)', () => {
    it('request-activation promotes the item to the roving slot', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        updateTabIndices(menu)
        fireRequestActivation(menu, items[1])
        expect(items[1].focus).toHaveBeenCalledTimes(1)
        expect(items[1].listTabIndex).toBe(0)
        expect(items[0].listTabIndex).toBe(-1)
    })

    it('ignores request-activation for unknown items', () => {
        const menu = makeMenu()
        const items = [makeItem()]
        setItems(menu, items)
        fireRequestActivation(menu, makeItem())
        expect(items[0].focus).not.toHaveBeenCalled()
    })

    it('plain item activation selects and closes', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        const items = [makeItem()]
        setItems(menu, items)
        await menu.show()
        fireItemActivated(menu, items[0])
        expect(events.select).toHaveLength(1)
        expect((events.select[0] as CustomEvent).detail.item).toBe(items[0])
        await flush()
        expect(menu.open).toBe(false)
        expect(events.closed).toHaveLength(1)
    })

    it('checkable and radio activations select but keep the menu open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        const checkable = [makeItem({ checkable: true })]
        setItems(menu, checkable)
        await menu.show()
        fireItemActivated(menu, checkable[0])
        expect(events.select).toHaveLength(1)
        await flush()
        expect(menu.open).toBe(true)
        expect(events.closed).toHaveLength(0)
        const radio = [makeItem({ radio: true })]
        setItems(menu, radio)
        fireItemActivated(menu, radio[0])
        expect(events.select).toHaveLength(2)
        await flush()
        expect(menu.open).toBe(true)
        expect(events.closed).toHaveLength(0)
    })
})

describe('BaseLegacyMenu nested roving (F1)', () => {
    const makeSubmenuTrigger = (overrides: Record<string, unknown> = {}): MockLegacyMenuItem => ({
        focus: vi.fn(),
        matches: () => false,
        textContent: 'More',
        ...{ disabled: false, label: 'More' },
        ...overrides,
    } as unknown as MockLegacyMenuItem)

    it('ArrowDown reaches an enabled submenu trigger in order', () => {
        const menu = makeMenu()
        const item = makeItem({ textContent: 'First' })
        const submenu = makeSubmenuTrigger()
        const last = makeItem({ textContent: 'Last' })
        const members = [item, submenu, last]
        setItems(menu, members)
        focusOnly(members, 0)
        pressKey(menu, item, 'ArrowDown')
        expect(submenu.focus).toHaveBeenCalledTimes(1)
        pressKey(menu, submenu, 'ArrowDown')
        expect(last.focus).toHaveBeenCalledTimes(1)
    })

    it('navigation skips a disabled submenu trigger', () => {
        const menu = makeMenu()
        const item = makeItem({ textContent: 'First' })
        const submenu = makeSubmenuTrigger({ disabled: true })
        const last = makeItem({ textContent: 'Last' })
        const members = [item, submenu, last]
        setItems(menu, members)
        focusOnly(members, 0)
        pressKey(menu, item, 'ArrowDown')
        expect(submenu.focus).not.toHaveBeenCalled()
        expect(last.focus).toHaveBeenCalledTimes(1)
    })

    it('keeps a single tab-stop via listTabIndex gating for submenu triggers', () => {
        const menu = makeMenu()
        const item = makeItem()
        const submenu = makeSubmenuTrigger()
        const members = [item, submenu]
        setItems(menu, members)
        updateTabIndices(menu)
        expect(item.listTabIndex).toBe(0)
        expect('listTabIndex' in submenu).toBe(false)
        fireRequestActivation(menu, submenu)
        expect(submenu.focus).toHaveBeenCalledTimes(1)
        expect(item.listTabIndex).toBe(-1)
        expect('listTabIndex' in submenu).toBe(false)
    })

    it('typeahead matches a submenu trigger label', () => {
        const menu = makeMenu()
        const item = makeItem({ textContent: 'Apple' })
        const submenu = makeSubmenuTrigger({ label: 'Mango sides', textContent: '' })
        setItems(menu, [item, submenu])
        typeahead(menu, 'm')
        expect(submenu.focus).toHaveBeenCalledTimes(1)
    })
})

describe('BaseLegacyMenu Escape hierarchy (F2)', () => {
    it('ignores Escape from an open submenu descendant', async () => {
        const menu = makeMenu()
        menu.quick = true
        const events = listen(menu)
        const items = [makeItem()]
        setItems(menu, items)
        await menu.show()
        const openDescendant = { tagName: 'MDC-LEGACY-MENU-SUBMENU', open: true }
        let prevented = false
        const event = {
            key: 'Escape',
            target: items[0],
            preventDefault: (): void => { prevented = true },
            composedPath: (): unknown[] => [items[0], openDescendant, menu],
        } as unknown as KeyboardEvent
        ;(menu as unknown as { handleDocumentKeydown(e: KeyboardEvent): void })['handleDocumentKeydown'](event)
        ;(menu as unknown as { handleKeydown(e: KeyboardEvent): void })['handleKeydown'](event)
        await flush()
        expect(prevented).toBe(false)
        expect(menu.open).toBe(true)
        expect(events.hiding).toHaveLength(0)
        expect(events.closed).toHaveLength(0)
    })

    it('closes on Escape when no open descendant is in the path', async () => {
        const menu = makeMenu()
        menu.quick = true
        const events = listen(menu)
        const items = [makeItem()]
        setItems(menu, items)
        await menu.show()
        const closedDescendant = { tagName: 'MDC-LEGACY-MENU-SUBMENU', open: false }
        let prevented = false
        const event = {
            key: 'Escape',
            target: items[0],
            preventDefault: (): void => { prevented = true },
            composedPath: (): unknown[] => [items[0], closedDescendant, menu],
        } as unknown as KeyboardEvent
        ;(menu as unknown as { handleDocumentKeydown(e: KeyboardEvent): void })['handleDocumentKeydown'](event)
        await flush()
        expect(prevented).toBe(true)
        expect(menu.open).toBe(false)
        expect(events.closed).toHaveLength(1)
    })
})

describe('BaseLegacyMenu Escape double-hiding (F8)', () => {
    it('a single Escape across document+host handlers dispatches hiding exactly once', async () => {
        const menu = makeMenu()
        menu.quick = true
        const anchor = { focus: vi.fn() }
        patchAnchor(menu, anchor)
        const events = listen(menu)
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        await menu.show()
        let prevented = false
        const event = {
            key: 'Escape',
            target: items[0],
            preventDefault: (): void => { prevented = true },
            composedPath: (): unknown[] => [items[0], menu],
        } as unknown as KeyboardEvent
        ;(menu as unknown as { handleDocumentKeydown(e: KeyboardEvent): void })['handleDocumentKeydown'](event)
        ;(menu as unknown as { handleKeydown(e: KeyboardEvent): void })['handleKeydown'](event)
        await flush()
        expect(prevented).toBe(true)
        expect(events.hiding).toHaveLength(1)
        expect(events.closed).toHaveLength(1)
        expect(menu.open).toBe(false)
    })
})

describe('BaseLegacyMenu enterprise features & parity', () => {
    it('close() aliases hide()', async () => {
        const menu = makeMenu()
        await menu.show()
        expect(menu.open).toBe(true)
        await menu.close()
        expect(menu.open).toBe(false)
    })

    it('toggle() opens a closed menu and closes an open menu', async () => {
        const menu = makeMenu()
        expect(menu.open).toBe(false)
        await menu.toggle()
        expect(menu.open).toBe(true)
        await menu.toggle()
        expect(menu.open).toBe(false)
    })

    it('toggle() re-opens menu if currently hiding', async () => {
        const menu = makeMenu()
        menu.open = true
        ;(menu as unknown as { isHiding: boolean }).isHiding = true
        await menu.toggle()
        expect(menu.open).toBe(true)
        expect((menu as unknown as { isHiding: boolean }).isHiding).toBe(false)
    })

    it('resolves anchor via anchorElement or anchor id', () => {
        const menu = makeMenu()
        const element = { focus: vi.fn(), contains: () => false } as unknown as HTMLElement
        menu.anchorElement = element
        const resolved = (menu as unknown as { getAnchorElement(): HTMLElement | null }).getAnchorElement()
        expect(resolved).toBe(element)

        menu.anchorElement = null
        menu.anchor = 'my-anchor'
        const fakeRoot = {
            getElementById: (id: string) => (id === 'my-anchor' ? element : null),
        }
        menu.getRootNode = () => fakeRoot as unknown as Node
        const resolvedById = (menu as unknown as { getAnchorElement(): HTMLElement | null }).getAnchorElement()
        expect(resolvedById).toBe(element)

        const fakeShadowRootWithoutGetElementById = {
            getElementById: () => null,
            querySelector: (sel: string) => (sel === '#my-anchor' ? element : null),
        }
        menu.getRootNode = () => fakeShadowRootWithoutGetElementById as unknown as Node
        const resolvedByQuerySelector = (menu as unknown as { getAnchorElement(): HTMLElement | null }).getAnchorElement()
        expect(resolvedByQuerySelector).toBe(element)
    })

    it('stayOpenOnOutsideClick prevents dismissal on outside pointerdown', async () => {
        const menu = makeMenu()
        menu.stayOpenOnOutsideClick = true
        await menu.show()
        fireOutsidePointerdown(menu, false)
        await flush()
        expect(menu.open).toBe(true)
    })

    it('pointerdown on the anchor element does not close the menu', async () => {
        const menu = makeMenu()
        const anchor = { focus: vi.fn(), contains: () => false } as unknown as HTMLElement
        menu.anchorElement = anchor
        await menu.show()
        const event = { composedPath: (): unknown[] => [anchor] } as unknown as Event
        ;(menu as unknown as { handleDocumentPointerdown(e: Event): void }).handleDocumentPointerdown(event)
        await flush()
        expect(menu.open).toBe(true)
    })

    it('stayOpenOnFocusout controls focusout dismissal', async () => {
        const menu = makeMenu()
        await menu.show()

        // With stayOpenOnFocusout = false, moving focus to an outside element closes menu
        const outsideEl = { contains: () => false } as unknown as HTMLElement
        const focusoutEvent = { relatedTarget: outsideEl } as unknown as FocusEvent
        ;(menu as unknown as { handleFocusout(e: FocusEvent): void }).handleFocusout(focusoutEvent)
        await flush()
        expect(menu.open).toBe(false)

        // With stayOpenOnFocusout = true, it stays open
        await menu.show()
        menu.stayOpenOnFocusout = true
        ;(menu as unknown as { handleFocusout(e: FocusEvent): void }).handleFocusout(focusoutEvent)
        await flush()
        expect(menu.open).toBe(true)
    })

    it('skipRestoreFocus prevents returning focus to anchor or previous element', async () => {
        const menu = makeMenu()
        const anchor = { focus: vi.fn() }
        patchAnchor(menu, anchor)
        menu.skipRestoreFocus = true
        await menu.show()
        await menu.hide()
        expect(anchor.focus).not.toHaveBeenCalled()
    })

    it('defaultFocus supports first-item, last-item, and root', async () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: '1' }), makeItem({ textContent: '2' }), makeItem({ textContent: '3' })]
        setItems(menu, items)

        // first-item
        menu.defaultFocus = 'first-item'
        await menu.show()
        expect(items[0].focus).toHaveBeenCalled()
        await menu.hide()

        // last-item
        menu.defaultFocus = 'last-item'
        await menu.show()
        expect(items[2].focus).toHaveBeenCalled()
        expect(items[2].listTabIndex).toBe(0)
        expect(items[0].listTabIndex).toBe(-1)
        await menu.hide()

        // root
        const surface = { focus: vi.fn() }
        patchSurface(menu, surface)
        menu.defaultFocus = 'root'
        await menu.show()
        expect(surface.focus).toHaveBeenCalled()
    })

    it('hasOverflow reflects in host and render classes', () => {
        const menu = makeMenu()
        expect((menu as unknown as { getHostClasses(): Record<string, boolean> }).getHostClasses()['has-overflow']).toBe(false)
        menu.hasOverflow = true
        expect((menu as unknown as { getHostClasses(): Record<string, boolean> }).getHostClasses()['has-overflow']).toBe(true)
        expect((menu as unknown as { getRenderClasses(): Record<string, boolean> }).getRenderClasses()['has-overflow']).toBe(true)
    })

    it('createPositionMiddleware respects xOffset, yOffset, and flip settings', () => {
        const menu = makeMenu()
        menu.xOffset = 15
        menu.yOffset = 25
        menu.noHorizontalFlip = true
        menu.noVerticalFlip = true

        const middleware = (menu as unknown as { createPositionMiddleware(): Array<{ name: string; options?: unknown }> }).createPositionMiddleware()
        const offsetEntry = middleware.find((m) => m.name === 'offset')
        expect(offsetEntry?.options).toEqual({
            mainAxis: 6 + 25,
            crossAxis: 15,
        })
    })

    it('closes open descendant submenus when hiding', async () => {
        const menu = makeMenu()
        const sub1 = { open: true, hide: vi.fn(async () => undefined) }
        const sub2 = { open: false, hide: vi.fn(async () => undefined) }
        menu.querySelectorAll = ((selector: string) => {
            if (selector === 'mdc-legacy-menu-submenu') {
                return [sub1, sub2] as unknown as NodeListOf<Element>
            }
            return [] as unknown as NodeListOf<Element>
        }) as unknown as typeof menu.querySelectorAll

        await menu.show()
        await menu.hide()
        expect(sub1.hide).toHaveBeenCalledTimes(1)
        expect(sub2.hide).not.toHaveBeenCalled()
    })

    it('waits for open submenus to close before the surface close starts', async () => {
        const menu = makeMenu()
        let release = (): void => {}
        const submenuClose = new Promise<void>((resolve) => { release = resolve })
        const sub = { open: true, hide: vi.fn(() => submenuClose) }
        menu.querySelectorAll = ((selector: string) => {
            if (selector === 'mdc-legacy-menu-submenu') {
                return [sub] as unknown as NodeListOf<Element>
            }
            return [] as unknown as NodeListOf<Element>
        }) as unknown as typeof menu.querySelectorAll

        await menu.show()
        const hidePromise = menu.hide()
        await flush()
        // The menu surface must not start transforming while a fixed nested
        // surface is still visible, or it becomes scrollable overflow.
        expect(menu.open).toBe(true)
        expect(sub.hide).toHaveBeenCalledTimes(1)

        release()
        await hidePromise
        expect(menu.open).toBe(false)
    })

    it('closes sibling submenus when submenu-opened is dispatched', () => {
        const menu = makeMenu()
        const targetSubmenu = { contains: () => false } as unknown as HTMLElement
        const siblingSubmenu = {
            open: true,
            hide: vi.fn(async () => undefined),
            contains: () => false,
        }

        menu.querySelectorAll = ((selector: string) => {
            if (selector === 'mdc-legacy-menu-submenu') {
                return [targetSubmenu, siblingSubmenu] as unknown as NodeListOf<Element>
            }
            return [] as unknown as NodeListOf<Element>
        }) as unknown as typeof menu.querySelectorAll

        const event = { target: targetSubmenu } as unknown as Event
        ;(menu as unknown as { handleSubmenuOpened(e: Event): void }).handleSubmenuOpened(event)
        expect(siblingSubmenu.hide).toHaveBeenCalledTimes(1)
    })

    it('unselects sibling radio items in same container on activation', () => {
        const menu = makeMenu()
        const radio1 = makeItem({ radio: true, selected: true })
        const radio2 = makeItem({ radio: true, selected: false })
        const container = {
            querySelectorAll: () => [radio1, radio2],
        } as unknown as HTMLElement
        ;(radio2 as unknown as { closest: () => HTMLElement }).closest = () => container

        fireItemActivated(menu, radio2)
        expect(radio1.selected).toBe(false)
    })

    it('item with keepOpen preserves menu open state', async () => {
        const menu = makeMenu()
        await menu.show()
        const item = makeItem({ keepOpen: true } as unknown as Partial<MockLegacyMenuItem>)
        fireItemActivated(menu, item)
        await flush()
        expect(menu.open).toBe(true)
    })

    it('cancels pending hide when show is called during animation', async () => {
        const menu = makeMenu()
        await menu.show()
        expect(menu.open).toBe(true)

        const resolvers: Array<() => void> = []
        ;(menu as unknown as { animateSurface: () => Promise<void> }).animateSurface = () =>
            new Promise((resolve) => { resolvers.push(resolve) })

        // Start hide
        const hidePromise = menu.hide()
        // While hiding is in flight, call show
        const showPromise = menu.show()

        resolvers.forEach((r) => r())
        await hidePromise
        await showPromise

        expect(menu.open).toBe(true)
    })

    it('supports reposition alias to updatePosition', async () => {
        const menu = makeMenu()
        await expect(menu.reposition()).resolves.toBeUndefined()
    })

    it('isolates radio unselection by name within the same container', () => {
        const menu = makeMenu()
        const radioGroupA1 = makeItem({ radio: true, selected: true })
        ;(radioGroupA1 as unknown as { name: string }).name = 'groupA'
        const radioGroupA2 = makeItem({ radio: true, selected: false })
        ;(radioGroupA2 as unknown as { name: string }).name = 'groupA'
        const radioGroupB = makeItem({ radio: true, selected: true })
        ;(radioGroupB as unknown as { name: string }).name = 'groupB'

        const container = {
            querySelectorAll: () => [radioGroupA1, radioGroupA2, radioGroupB],
        } as unknown as HTMLElement
        ;(radioGroupA2 as unknown as { closest: () => HTMLElement }).closest = () => container

        fireItemActivated(menu, radioGroupA2)
        expect(radioGroupA1.selected).toBe(false)
        expect(radioGroupB.selected).toBe(true)
    })

    it('prioritizes typeaheadText over label and textContent', () => {
        const menu = makeMenu()
        const item1 = makeItem({ textContent: 'Copy' })
        ;(item1 as unknown as { typeaheadText: string }).typeaheadText = 'duplicate'
        const item2 = makeItem({ textContent: 'Cut' })
        ;(item2 as unknown as { label: string }).label = 'Snip'

        const getLabel = (item: MockLegacyMenuItem): string =>
            (menu as unknown as { getItemLabel(i: unknown): string }).getItemLabel(item)

        expect(getLabel(item1)).toBe('duplicate')
        expect(getLabel(item2)).toBe('snip')
    })

    it('falls back to document.getElementById when getRootNode does not find anchor', () => {
        const menu = makeMenu()
        menu.anchor = 'external-anchor-id'
        const docAnchor = { id: 'external-anchor-id' } as unknown as HTMLElement
        const prevDoc = (globalThis as unknown as { document?: unknown }).document
        try {
            ;(globalThis as unknown as { document?: unknown }).document = {
                getElementById: (id: string) => id === 'external-anchor-id' ? docAnchor : null,
            }
            const resolved = (menu as unknown as { getAnchorElement(): HTMLElement | null }).getAnchorElement()
            expect(resolved).toBe(docAnchor)
        } finally {
            if (prevDoc === undefined) {
                delete (globalThis as unknown as { document?: unknown }).document
            } else {
                ;(globalThis as unknown as { document?: unknown }).document = prevDoc
            }
        }
    })


    it('triggers repositioning when position-affecting props change while open', async () => {
        const menu = makeMenu()
        await menu.show()
        const syncSpy = vi.spyOn(menu as unknown as { syncOpenSideEffects: (force?: boolean) => void }, 'syncOpenSideEffects')

        menu.xOffset = 42
        ;(menu as unknown as { updated: (changed: Map<unknown, unknown>) => void }).updated(new Map([['xOffset', 0]]))

        expect(syncSpy).toHaveBeenCalledWith(true)
    })
})


