/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'
import { BaseMenu } from './base-menu'
import { StandardMenuGroupDefinition } from '../menu-group.definition'
import { MenuStyles } from '../menu.style'
import type { IMDCMenuItem } from '../menu.interface'

vi.mock('@floating-ui/dom', () => ({
    autoUpdate: (...args: unknown[]) => {
        const globals = globalThis as unknown as { __menuAutoUpdateArgs?: unknown[]; __menuAutoUpdateCalls?: number }
        globals.__menuAutoUpdateArgs = args
        globals.__menuAutoUpdateCalls = (globals.__menuAutoUpdateCalls ?? 0) + 1
        return () => {
            ;(globalThis as unknown as { __menuAutoUpdateCleaned?: boolean }).__menuAutoUpdateCleaned = true
        }
    },
    computePosition: async (...args: unknown[]) => {
        const globals = globalThis as unknown as { __menuComputePositionArgs?: unknown[]; __menuComputePositionCalls?: number }
        globals.__menuComputePositionArgs = args
        globals.__menuComputePositionCalls = (globals.__menuComputePositionCalls ?? 0) + 1
        return { x: 7, y: 9 }
    },
    offset: (value: unknown) => ({ name: 'offset', options: value }),
    flip: () => ({ name: 'flip' }),
    shift: (value: unknown) => ({ name: 'shift', options: value }),
}))

class TestMenu extends BaseMenu {}

type MockMenuItem = {
    isInteractive: boolean
    isDisabled: boolean
    listTabIndex: number
    textContent: string
    checkable: boolean
    radio: boolean
    focus: ReturnType<typeof vi.fn>
    matches: (selector: string) => boolean
}

const makeMenu = (): TestMenu => new TestMenu()

const makeItem = (overrides: Partial<MockMenuItem> = {}): MockMenuItem => ({
    isInteractive: true,
    isDisabled: false,
    listTabIndex: -1,
    textContent: '',
    checkable: false,
    radio: false,
    focus: vi.fn(),
    matches: () => false,
    ...overrides,
})

const setItems = (menu: TestMenu, items: MockMenuItem[]): void => {
    ;(menu as unknown as { cachedItems: IMDCMenuItem[] }).cachedItems =
        items as unknown as IMDCMenuItem[]
    // Emulate live :focus-within: focusing a mock moves the focused state,
    // so the roving-tabindex sync after focus() promotes the right item.
    items.forEach((item, index) => {
        const spied = vi.fn(() => focusOnly(items, index))
        item.focus = spied
    })
}

const focusOnly = (items: MockMenuItem[], index: number): void => {
    items.forEach((item, i) => {
        item.matches = (): boolean => i === index
    })
}

const pressKey = (
    menu: TestMenu,
    target: MockMenuItem,
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

const typeahead = (menu: TestMenu, char: string): void => {
    ;(menu as unknown as { handleTypeahead(c: string): void })['handleTypeahead'](char)
}

const updateTabIndices = (menu: TestMenu): void => {
    ;(menu as unknown as { updateTabIndices(): void })['updateTabIndices']()
}

const patchAnchor = (menu: TestMenu, anchor: { focus: ReturnType<typeof vi.fn> }): void => {
    ;(menu as unknown as { getAnchorElement: () => unknown })['getAnchorElement'] = () => anchor
}

const patchSurface = (menu: TestMenu, surface: unknown): void => {
    ;(menu as unknown as { getSurfaceElement: () => unknown })['getSurfaceElement'] = () => surface
}

const patchRtl = (menu: TestMenu, rtl: boolean): void => {
    ;(menu as unknown as { isRtlContext: () => boolean })['isRtlContext'] = () => rtl
}

const listen = (menu: TestMenu): Record<'showing' | 'hiding' | 'opened' | 'closed' | 'select', Event[]> => {
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
        __menuAutoUpdateArgs?: unknown[]
        __menuAutoUpdateCalls?: number
        __menuComputePositionArgs?: unknown[]
        __menuComputePositionCalls?: number
    }
    return {
        autoUpdateArgs: globals.__menuAutoUpdateArgs,
        autoUpdateCalls: globals.__menuAutoUpdateCalls ?? 0,
        computePositionArgs: globals.__menuComputePositionArgs,
        computePositionCalls: globals.__menuComputePositionCalls ?? 0,
    }
}

const resetPositionGlobals = (): void => {
    const globals = globalThis as unknown as Record<string, unknown>
    delete globals['__menuAutoUpdateArgs']
    delete globals['__menuAutoUpdateCalls']
    delete globals['__menuComputePositionArgs']
    delete globals['__menuComputePositionCalls']
}

const fireItemActivated = (menu: TestMenu, item: MockMenuItem): void => {
    const event = new CustomEvent('item-activated', {
        detail: { item },
        bubbles: true,
        composed: true,
    })
    ;(menu as unknown as { handleItemActivated(e: Event): void })['handleItemActivated'](event)
}

const fireRequestActivation = (menu: TestMenu, item: MockMenuItem): void => {
    const event = new CustomEvent('request-activation', {
        detail: { item },
        bubbles: true,
        composed: true,
    })
    ;(menu as unknown as { handleRequestActivation(e: Event): void })['handleRequestActivation'](event)
}

const fireOutsidePointerdown = (menu: TestMenu, inside: boolean): void => {
    const target = inside ? menu : {}
    const event = { composedPath: (): unknown[] => [target] } as unknown as Event
    ;(menu as unknown as { handleDocumentPointerdown(e: Event): void })['handleDocumentPointerdown'](event)
}

describe('BaseMenu defaults', () => {
    it('has closed defaults with bottom-start placement', () => {
        const menu = makeMenu()
        expect(menu.open).toBe(false)
        expect(menu.quick).toBe(false)
        expect(menu.placement).toBe('bottom-start')
        expect(menu.variant).toBe('standard')
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

    it('throws on unsupported variant and layout', () => {
        const menu = makeMenu()
        menu.variant = 'invalid' as unknown as typeof menu.variant
        expect(() => (menu as unknown as { willUpdate(m: Map<unknown, unknown>): void }).willUpdate(new Map())).toThrowError(/Unsupported variant/)
    })
})

describe('BaseMenu open/close events', () => {
    it('show dispatches showing then opened and sets open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        await menu.show()
        expect(menu.open).toBe(true)
        expect(events.showing).toHaveLength(1)
        expect(events.opened).toHaveLength(1)
        expect((events.opened[0] as CustomEvent).detail.menu).toBe(menu)
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

describe('BaseMenu quick and reduced motion', () => {
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

describe('BaseMenu outside dismiss and Escape', () => {
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

describe('BaseMenu Arrow/Home/End navigation', () => {
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

    it('ArrowDown starts at the first focusable item when nothing is focused', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        pressKey(menu, items[1], 'ArrowDown')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
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

    it('ArrowLeft/Right follow the LTR idiom', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowLeft')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowRight')
        expect(items[2].focus).toHaveBeenCalledTimes(1)
    })

    it('ArrowLeft/Right mirror in RTL', () => {
        const menu = makeMenu()
        patchRtl(menu, true)
        const items = [makeItem(), makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowLeft')
        expect(items[2].focus).toHaveBeenCalledTimes(1)
        focusOnly(items, 1)
        pressKey(menu, items[1], 'ArrowRight')
        expect(items[0].focus).toHaveBeenCalledTimes(1)
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

    it('ignores keys from targets outside the menu', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        const { prevented } = pressKey(menu, makeItem(), 'ArrowDown')
        expect(prevented).toBe(false)
        expect(items[0].focus).not.toHaveBeenCalled()
    })

    it('ignores non-navigation keys like Enter', () => {
        const menu = makeMenu()
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        focusOnly(items, 0)
        const { prevented } = pressKey(menu, items[0], 'Enter')
        expect(prevented).toBe(false)
        expect(items[1].focus).not.toHaveBeenCalled()
    })
})

describe('BaseMenu typeahead', () => {
    it('focuses the first match for a single character', () => {
        const menu = makeMenu()
        const items = [makeItem({ textContent: 'Apple' }), makeItem({ textContent: 'Banana' })]
        setItems(menu, items)
        typeahead(menu, 'b')
        expect(items[1].focus).toHaveBeenCalledTimes(1)
        expect(items[1].listTabIndex).toBe(0)
    })

    it('accumulates a buffer across keystrokes', () => {
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

describe('BaseMenu positioning (floating-ui)', () => {
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
        expect(afterUpdate.computePositionArgs?.[2]).toMatchObject({ placement: 'top' })
        const middleware = (afterUpdate.computePositionArgs?.[2] as { middleware: Array<{ name: string }> }).middleware
        expect(middleware.map((entry) => entry.name)).toEqual(['offset', 'flip', 'shift'])
        expect(style.setProperty).toHaveBeenCalledWith('left', '7px')
        expect(style.setProperty).toHaveBeenCalledWith('top', '9px')
    })

    it('updatePosition is a no-op without an anchor or surface', async () => {
        resetPositionGlobals()
        const menu = makeMenu()
        await menu.updatePosition()
        expect(readPositionGlobals().computePositionCalls).toBe(0)
    })
})

describe('BaseMenu select policy (events only)', () => {
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

    it('checkable activation selects but keeps the menu open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        const items = [makeItem({ checkable: true })]
        setItems(menu, items)
        await menu.show()
        fireItemActivated(menu, items[0])
        expect(events.select).toHaveLength(1)
        await flush()
        expect(menu.open).toBe(true)
        expect(events.closed).toHaveLength(0)
    })

    it('radio activation selects but keeps the menu open', async () => {
        const menu = makeMenu()
        const events = listen(menu)
        const items = [makeItem({ radio: true })]
        setItems(menu, items)
        await menu.show()
        fireItemActivated(menu, items[0])
        expect(events.select).toHaveLength(1)
        await flush()
        expect(menu.open).toBe(true)
        expect(events.closed).toHaveLength(0)
    })
})

describe('BaseMenu nested roving (F1)', () => {
    const makeSubmenuTrigger = (overrides: Record<string, unknown> = {}): MockMenuItem => ({
        focus: vi.fn(),
        matches: () => false,
        textContent: 'More',
        ...{ disabled: false, label: 'More' },
        ...overrides,
    } as unknown as MockMenuItem)

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

describe('BaseMenu Escape hierarchy (F2)', () => {
    it('ignores Escape from an open submenu descendant', async () => {
        const menu = makeMenu()
        menu.quick = true
        const events = listen(menu)
        const items = [makeItem()]
        setItems(menu, items)
        await menu.show()
        const openDescendant = { tagName: 'MDC-MENU-SUBMENU', open: true }
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
        const closedDescendant = { tagName: 'MDC-MENU-SUBMENU', open: false }
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

describe('BaseMenu Escape double-hiding (F8)', () => {
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

describe('BaseMenu expressive grouped, radio, variant & submenu cascade', () => {
    it('collects items inside mdc-menu-group and sets has-groups render class', () => {
        const menu = makeMenu()
        const item1 = { tagName: 'MDC-MENU-ITEM', isInteractive: true, isDisabled: false, listTabIndex: -1, variant: 'standard' }
        const item2 = { tagName: 'MDC-MENU-ITEM', isInteractive: true, isDisabled: false, listTabIndex: -1, variant: 'standard' }
        const group = { tagName: 'MDC-MENU-GROUP', variant: 'standard', children: [item1, item2] }
        Object.defineProperty(menu, 'defaultSlotElements', { get: () => [group], configurable: true })
        menu.variant = 'vibrant'
        ;(menu as unknown as { handleSlotChange(): void })['handleSlotChange']()
        expect(menu.items).toHaveLength(2)
        expect(menu.items[0]).toBe(item1)
        expect(menu.items[1]).toBe(item2)
        expect(group.variant).toBe('vibrant')
        expect((menu as unknown as { getRenderClasses(): Record<string, boolean> }).getRenderClasses()['has-groups']).toBe(true)
    })

    it('deselects sibling radio items when a radio item is activated', async () => {
        const menu = makeMenu()
        const r1 = { ...makeItem({ radio: true }), selected: true }
        const r2 = { ...makeItem({ radio: true }), selected: true }
        const c1 = { ...makeItem({ checkable: true }), selected: true }
        setItems(menu, [r1, r2, c1])
        await menu.show()
        fireItemActivated(menu, r2)
        expect(r2.selected).toBe(true)
        expect(r1.selected).toBe(false)
        expect(c1.selected).toBe(true)
        expect(menu.open).toBe(true)
    })

    it('closes open mdc-menu-submenu descendants on hide', async () => {
        const menu = makeMenu()
        menu.quick = true
        const submenuHide = vi.fn(async () => undefined)
        const submenu = {
            tagName: 'MDC-MENU-SUBMENU',
            open: true,
            hide: submenuHide,
            focus: vi.fn(),
            matches: () => false,
        }
        setItems(menu, [submenu as unknown as MockMenuItem])
        await menu.show()
        await menu.hide()
        expect(submenuHide).toHaveBeenCalledTimes(1)
    })

    it('deselects sibling radios within the same scope even without reflected [radio] attribute', () => {
        const menu = makeMenu()
        const group = {
            querySelectorAll: (selector: string) => {
                expect(selector).toBe('mdc-menu-item')
                return [itemA, itemB, nonRadio]
            },
        }
        const makeScopedRadio = (selected: boolean) => {
            const item = {
                radio: true,
                checkable: false,
                selected,
                closest: () => group,
            }
            return item
        }
        const itemA = makeScopedRadio(true)
        const itemB = makeScopedRadio(false)
        const nonRadio = { radio: false, selected: true, closest: () => group }

        itemB.selected = true
        fireItemActivated(menu, itemB as unknown as MockMenuItem)

        expect(itemA.selected).toBe(false)
        expect(itemB.selected).toBe(true)
        expect(nonRadio.selected).toBe(true)
    })

    it('preserves initial colorStyle="vibrant" when variant is still at default', () => {
        const menu = makeMenu()
        menu.colorStyle = 'vibrant'
        ;(menu as unknown as { willUpdate(m: Map<unknown, unknown>): void }).willUpdate(
            new Map<unknown, unknown>([['variant', undefined], ['colorStyle', undefined]]),
        )
        expect(menu.variant).toBe('vibrant')
        expect(menu.colorStyle).toBe('vibrant')
    })

    it('moves focus from trigger into items on ArrowDown when open', async () => {
        const menu = makeMenu()
        menu.quick = true
        const items = [makeItem(), makeItem()]
        setItems(menu, items)
        const anchor = { focus: vi.fn(), contains: () => false }
        patchAnchor(menu, anchor)
        await menu.show()
        const keydown = (menu as unknown as { handleKeydown(e: KeyboardEvent): void }).handleKeydown
        keydown({
            key: 'ArrowDown',
            target: anchor,
            ctrlKey: false,
            metaKey: false,
            altKey: false,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent)
        expect(items[0].focus).toHaveBeenCalledTimes(1)
    })

    it('defines outer container shape tokens on StandardMenuGroupDefinition', () => {
        expect(StandardMenuGroupDefinition['enabled-outer-container-shape-start-start']).toBe('16px')
        expect(StandardMenuGroupDefinition['enabled-outer-container-shape-start-end']).toBe('16px')
        expect(StandardMenuGroupDefinition['enabled-outer-container-shape-end-end']).toBe('16px')
        expect(StandardMenuGroupDefinition['enabled-outer-container-shape-end-start']).toBe('16px')
    })

    it('positions the floating menu container absolutely over content', () => {
        const cssText = MenuStyles.map((s) => s.cssText).join('\n')
        expect(cssText).toMatch(/\.container\s*\{[^}]*position:\s*absolute/)
    })
})
