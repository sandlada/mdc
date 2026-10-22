/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    mirrorLegacyMenuSubmenuPlacement,
    resolveLegacySubmenuKeyAction,
    type LegacyMenuSubmenuFocusableChild,
    type LegacyMenuSubmenuNested,
} from './base-legacy-menu-submenu'
import { MDCLegacyMenuSubmenu } from '../legacy-menu-submenu'

vi.mock('@floating-ui/dom', () => ({
    autoUpdate: (...args: unknown[]) => {
        const globals = globalThis as unknown as { __legacyMenuSubmenuAutoUpdateArgs?: unknown[]; __legacyMenuSubmenuAutoUpdateCalls?: number }
        globals.__legacyMenuSubmenuAutoUpdateArgs = args
        globals.__legacyMenuSubmenuAutoUpdateCalls = (globals.__legacyMenuSubmenuAutoUpdateCalls ?? 0) + 1
        return () => {
            ;(globalThis as unknown as { __legacyMenuSubmenuAutoUpdateCleaned?: boolean }).__legacyMenuSubmenuAutoUpdateCleaned = true
        }
    },
    computePosition: async (...args: unknown[]) => {
        const globals = globalThis as unknown as { __legacyMenuSubmenuComputePositionArgs?: unknown[]; __legacyMenuSubmenuComputePositionCalls?: number }
        globals.__legacyMenuSubmenuComputePositionArgs = args
        globals.__legacyMenuSubmenuComputePositionCalls = (globals.__legacyMenuSubmenuComputePositionCalls ?? 0) + 1
        return { x: 7, y: 9 }
    },
    offset: (value: unknown) => ({ name: 'offset', options: value }),
    flip: () => ({ name: 'flip' }),
    shift: (value: unknown) => ({ name: 'shift', options: value }),
}))

const stubItem = (focus: () => void, disabled = false): LegacyMenuSubmenuFocusableChild => ({
    isInteractive: true,
    isDisabled: disabled,
    disabled,
    focus,
})

class TestLegacyMenuSubmenu extends MDCLegacyMenuSubmenu {
    public focusCalls = 0
    public animateCalls: Array<'open' | 'close'> = []
    public stubItems: LegacyMenuSubmenuFocusableChild[] | undefined
    public stubSubmenus: LegacyMenuSubmenuNested[] | undefined
    public stubAnchor: HTMLElement | undefined
    public stubSurface: HTMLElement | undefined

    public override focus(): void {
        this.focusCalls++
    }

    protected override getNestedFocusableItems(): LegacyMenuSubmenuFocusableChild[] {
        return this.stubItems ?? super.getNestedFocusableItems()
    }

    protected override getNestedSubmenus(): LegacyMenuSubmenuNested[] {
        return this.stubSubmenus ?? super.getNestedSubmenus()
    }

    protected override getAnchorElement(): HTMLElement | null {
        return this.stubAnchor ?? super.getAnchorElement()
    }

    protected override getSurfaceElement(): HTMLElement | null {
        return this.stubSurface ?? super.getSurfaceElement()
    }

    protected override async animateSurface(mode: 'open' | 'close'): Promise<void> {
        this.animateCalls.push(mode)
    }

    public middlewareNames(): string[] {
        return this.createPositionMiddleware().map((entry) => entry.name)
    }

    public renderClassState(): Record<string, boolean> {
        return this.getRenderClasses()
    }

    public ariaExpandedState(): string {
        return this.getTriggerAriaExpanded()
    }

    public sendKey(key: string, path: EventTarget[] = []): { preventDefault: () => void, stopPropagation: () => void } {
        const preventDefault = vi.fn()
        const stopPropagation = vi.fn()
        const event = {
            key,
            preventDefault,
            stopPropagation,
            composedPath: (): EventTarget[] => path,
        } as unknown as KeyboardEvent
        this.handleHostKeydown(event)
        return { preventDefault, stopPropagation }
    }
}

const flush = async (): Promise<void> => {
    await Promise.resolve()
    await Promise.resolve()
}

type LegacySubmenuPositionGlobals = {
    autoUpdateArgs?: unknown[]
    autoUpdateCalls: number
    computePositionArgs?: unknown[]
    computePositionCalls: number
    cleaned: boolean
}

const readLegacySubmenuPositionGlobals = (): LegacySubmenuPositionGlobals => {
    const globals = globalThis as unknown as {
        __legacyMenuSubmenuAutoUpdateArgs?: unknown[]
        __legacyMenuSubmenuAutoUpdateCalls?: number
        __legacyMenuSubmenuComputePositionArgs?: unknown[]
        __legacyMenuSubmenuComputePositionCalls?: number
        __legacyMenuSubmenuAutoUpdateCleaned?: boolean
    }
    return {
        autoUpdateArgs: globals.__legacyMenuSubmenuAutoUpdateArgs,
        autoUpdateCalls: globals.__legacyMenuSubmenuAutoUpdateCalls ?? 0,
        computePositionArgs: globals.__legacyMenuSubmenuComputePositionArgs,
        computePositionCalls: globals.__legacyMenuSubmenuComputePositionCalls ?? 0,
        cleaned: globals.__legacyMenuSubmenuAutoUpdateCleaned ?? false,
    }
}

const resetLegacySubmenuPositionGlobals = (): void => {
    const globals = globalThis as unknown as Record<string, unknown>
    delete globals['__legacyMenuSubmenuAutoUpdateArgs']
    delete globals['__legacyMenuSubmenuAutoUpdateCalls']
    delete globals['__legacyMenuSubmenuComputePositionArgs']
    delete globals['__legacyMenuSubmenuComputePositionCalls']
    delete globals['__legacyMenuSubmenuAutoUpdateCleaned']
}

const stubSurface = (): { style: { setProperty: ReturnType<typeof vi.fn>, removeProperty: ReturnType<typeof vi.fn> } } => ({
    style: { setProperty: vi.fn(), removeProperty: vi.fn() },
})

describe('MDCLegacyMenuSubmenu cascade', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('has the spec-TODO delay defaults and right-start placement', () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.open).toBe(false)
        expect(submenu.quick).toBe(false)
        expect(submenu.openDelay).toBe(120)
        expect(submenu.closeDelay).toBe(220)
        expect(submenu.placement).toBe('right-start')
        expect(submenu.disabled).toBe(false)
        expect(submenu.getEffectivePlacement()).toBe('right-start')
    })

    it('opens after the hover-intent open delay and emits submenu-opened', () => {
        const submenu = new TestLegacyMenuSubmenu()
        const opened: Event[] = []
        submenu.addEventListener('submenu-opened', (event) => {
            opened.push(event)
        })
        submenu.scheduleOpen()
        expect(submenu.open).toBe(false)
        vi.advanceTimersByTime(119)
        expect(submenu.open).toBe(false)
        vi.advanceTimersByTime(1)
        expect(submenu.open).toBe(true)
        expect(opened.length).toBe(1)
        expect(opened[0].bubbles).toBe(true)
        expect(opened[0].composed).toBe(true)
    })

    it('cancels a pending open when the pointer leaves first', () => {
        const submenu = new TestLegacyMenuSubmenu()
        const opened: Event[] = []
        submenu.addEventListener('submenu-opened', (event) => {
            opened.push(event)
        })
        submenu.scheduleOpen()
        vi.advanceTimersByTime(60)
        submenu.scheduleClose()
        vi.advanceTimersByTime(1000)
        expect(submenu.open).toBe(false)
        expect(opened.length).toBe(0)
    })

    it('closes after the hover-intent close delay and emits submenu-closed', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        const closed: Event[] = []
        submenu.addEventListener('submenu-closed', (event) => {
            closed.push(event)
        })
        await submenu.show()
        submenu.scheduleClose()
        vi.advanceTimersByTime(219)
        expect(submenu.open).toBe(true)
        vi.advanceTimersByTime(1)
        expect(submenu.open).toBe(false)
        expect(closed.length).toBe(1)
    })

    it('cancels a pending close when the pointer re-enters', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        submenu.scheduleClose()
        vi.advanceTimersByTime(100)
        submenu.scheduleOpen()
        vi.advanceTimersByTime(1000)
        expect(submenu.open).toBe(true)
    })

    it('blocks hover, programmatic, and keyboard expansion while disabled', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        submenu.disabled = true
        submenu.scheduleOpen()
        vi.advanceTimersByTime(1000)
        expect(submenu.open).toBe(false)
        await submenu.show()
        expect(submenu.open).toBe(false)
        const { preventDefault } = submenu.sendKey('ArrowRight')
        expect(submenu.open).toBe(false)
        expect(preventDefault).not.toHaveBeenCalled()
    })

    it('opens on ArrowRight and focuses the first enabled nested item', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        const focused: string[] = []
        submenu.stubItems = [
            stubItem(() => { focused.push('first') }, true),
            stubItem(() => { focused.push('second') }),
        ]
        const { preventDefault } = submenu.sendKey('ArrowRight')
        expect(preventDefault).toHaveBeenCalled()
        expect(submenu.open).toBe(true)
        await flush()
        expect(focused).toEqual(['second'])
    })

    it('opens on Enter', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        submenu.stubItems = [stubItem(() => { })]
        submenu.sendKey('Enter')
        expect(submenu.open).toBe(true)
        await flush()
    })

    it('closes on ArrowLeft and refocuses the trigger', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        const { preventDefault, stopPropagation } = submenu.sendKey('ArrowLeft')
        expect(preventDefault).toHaveBeenCalled()
        expect(stopPropagation).toHaveBeenCalled()
        expect(submenu.open).toBe(false)
        await flush()
        expect(submenu.focusCalls).toBe(1)
    })

    it('closes on Escape', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        submenu.sendKey('Escape')
        expect(submenu.open).toBe(false)
        await flush()
        expect(submenu.focusCalls).toBe(1)
    })

    it('lets an open nested descendant handle Escape first (hierarchy)', async () => {
        const outer = new TestLegacyMenuSubmenu()
        const inner = new TestLegacyMenuSubmenu()
        await outer.show()
        await inner.show()
        const { stopPropagation } = outer.sendKey('Escape', [inner, outer])
        expect(outer.open).toBe(true)
        expect(stopPropagation).not.toHaveBeenCalled()
        const innerResult = inner.sendKey('Escape', [inner])
        expect(inner.open).toBe(false)
        expect(innerResult.stopPropagation).toHaveBeenCalled()
    })

    it('cascades hide through three nested levels with no depth cap', async () => {
        const first = new TestLegacyMenuSubmenu()
        const second = new TestLegacyMenuSubmenu()
        const third = new TestLegacyMenuSubmenu()
        first.stubSubmenus = [second]
        second.stubSubmenus = [third]
        await first.show()
        await second.show()
        await third.show()
        await first.hide()
        expect(first.open).toBe(false)
        expect(second.open).toBe(false)
        expect(third.open).toBe(false)
    })

    it('syncs aria-expanded with the open state', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.ariaExpandedState()).toBe('false')
        await submenu.show()
        expect(submenu.ariaExpandedState()).toBe('true')
        await submenu.hide()
        expect(submenu.ariaExpandedState()).toBe('false')
    })
})

describe('resolveLegacySubmenuKeyAction', () => {
    it('opens on Right/Enter and closes on Left/Escape in LTR', () => {
        expect(resolveLegacySubmenuKeyAction('ArrowRight', { open: false, disabled: false, isRtl: false })).toBe('open')
        expect(resolveLegacySubmenuKeyAction('Enter', { open: false, disabled: false, isRtl: false })).toBe('open')
        expect(resolveLegacySubmenuKeyAction('ArrowLeft', { open: true, disabled: false, isRtl: false })).toBe('close')
        expect(resolveLegacySubmenuKeyAction('Escape', { open: true, disabled: false, isRtl: false })).toBe('close')
        expect(resolveLegacySubmenuKeyAction('ArrowRight', { open: true, disabled: false, isRtl: false })).toBe(null)
        expect(resolveLegacySubmenuKeyAction('ArrowLeft', { open: false, disabled: false, isRtl: false })).toBe(null)
        expect(resolveLegacySubmenuKeyAction('ArrowDown', { open: false, disabled: false, isRtl: false })).toBe(null)
    })

    it('mirrors the open/close keys in RTL', () => {
        expect(resolveLegacySubmenuKeyAction('ArrowLeft', { open: false, disabled: false, isRtl: true })).toBe('open')
        expect(resolveLegacySubmenuKeyAction('ArrowRight', { open: true, disabled: false, isRtl: true })).toBe('close')
    })

    it('returns null for every key while disabled', () => {
        expect(resolveLegacySubmenuKeyAction('ArrowRight', { open: false, disabled: true, isRtl: false })).toBe(null)
        expect(resolveLegacySubmenuKeyAction('Enter', { open: false, disabled: true, isRtl: false })).toBe(null)
        expect(resolveLegacySubmenuKeyAction('Escape', { open: true, disabled: true, isRtl: false })).toBe(null)
    })
})

describe('mirrorLegacyMenuSubmenuPlacement', () => {
    it('mirrors right/left placements and keeps vertical ones', () => {
        expect(mirrorLegacyMenuSubmenuPlacement('right-start')).toBe('left-start')
        expect(mirrorLegacyMenuSubmenuPlacement('right-end')).toBe('left-end')
        expect(mirrorLegacyMenuSubmenuPlacement('right')).toBe('left')
        expect(mirrorLegacyMenuSubmenuPlacement('left-start')).toBe('right-start')
        expect(mirrorLegacyMenuSubmenuPlacement('bottom-start')).toBe('bottom-start')
        expect(mirrorLegacyMenuSubmenuPlacement('top')).toBe('top')
    })
})

describe('MDCLegacyMenuSubmenu positioning (floating-ui)', () => {
    it('exposes the offset/flip/shift middleware chain', () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.middlewareNames()).toEqual(['offset', 'flip', 'shift'])
    })

    it('tracks the trigger with autoUpdate and positions via computePosition', async () => {
        resetLegacySubmenuPositionGlobals()
        const submenu = new TestLegacyMenuSubmenu()
        const anchor = {}
        const surface = stubSurface()
        submenu.stubAnchor = anchor as unknown as HTMLElement
        submenu.stubSurface = surface as unknown as HTMLElement
        submenu.placement = 'right-start'
        await submenu.show()
        const globals = readLegacySubmenuPositionGlobals()
        expect(globals.autoUpdateCalls).toBe(1)
        expect(globals.autoUpdateArgs?.[0]).toBe(anchor)
        expect(globals.autoUpdateArgs?.[1]).toBe(surface)
        const update = globals.autoUpdateArgs?.[2] as () => void
        update()
        await flush()
        const afterUpdate = readLegacySubmenuPositionGlobals()
        expect(afterUpdate.computePositionCalls).toBe(1)
        expect(afterUpdate.computePositionArgs?.[0]).toBe(anchor)
        expect(afterUpdate.computePositionArgs?.[1]).toBe(surface)
        expect(afterUpdate.computePositionArgs?.[2]).toMatchObject({ strategy: 'fixed', placement: 'right-start' })
        const middleware = (afterUpdate.computePositionArgs?.[2] as { middleware: Array<{ name: string }> }).middleware
        expect(middleware.map((entry) => entry.name)).toEqual(['offset', 'flip', 'shift'])
        expect(surface.style.setProperty).toHaveBeenCalledWith('left', '7px')
        expect(surface.style.setProperty).toHaveBeenCalledWith('top', '9px')
    })

    it('updatePosition is a no-op without a trigger or surface', async () => {
        resetLegacySubmenuPositionGlobals()
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.updatePosition()
        expect(readLegacySubmenuPositionGlobals().computePositionCalls).toBe(0)
    })

    it('stops position tracking on hide', async () => {
        resetLegacySubmenuPositionGlobals()
        const submenu = new TestLegacyMenuSubmenu()
        const surface = stubSurface()
        submenu.stubAnchor = {} as unknown as HTMLElement
        submenu.stubSurface = surface as unknown as HTMLElement
        await submenu.show()
        expect(readLegacySubmenuPositionGlobals().autoUpdateCalls).toBe(1)
        await submenu.hide()
        expect(readLegacySubmenuPositionGlobals().cleaned).toBe(true)
        expect(surface.style.removeProperty).toHaveBeenCalledWith('left')
        expect(surface.style.removeProperty).toHaveBeenCalledWith('right')
        expect(surface.style.removeProperty).toHaveBeenCalledWith('top')
    })

    it('recomputes open nested submenu positions after the surface inline-size transition settles', () => {
        const submenu = new TestLegacyMenuSubmenu()
        const surface = {}
        submenu.stubSurface = surface as unknown as HTMLElement
        const openChild: LegacyMenuSubmenuNested = { open: true, hide: vi.fn(), reposition: vi.fn() }
        const closedChild: LegacyMenuSubmenuNested = { open: false, hide: vi.fn(), reposition: vi.fn() }
        submenu.stubSubmenus = [openChild, closedChild]
        submenu.open = true
        const handler = (submenu as unknown as { handleSurfaceTransitionEnd(e: TransitionEvent): void })
            .handleSurfaceTransitionEnd

        const transition = (target: unknown, propertyName: string): TransitionEvent =>
            ({ target, propertyName }) as unknown as TransitionEvent

        handler(transition(surface, 'inline-size'))
        expect(openChild.reposition).toHaveBeenCalledTimes(1)
        expect(closedChild.reposition).not.toHaveBeenCalled()

        handler(transition(surface, 'opacity'))
        handler(transition({}, 'inline-size'))
        expect(openChild.reposition).toHaveBeenCalledTimes(1)

        submenu.open = false
        handler(transition(surface, 'inline-size'))
        expect(openChild.reposition).toHaveBeenCalledTimes(1)
    })

    it('keeps the floating position until the close animation settles', async () => {
        resetLegacySubmenuPositionGlobals()
        const submenu = new TestLegacyMenuSubmenu()
        const surface = stubSurface()
        submenu.stubAnchor = {} as unknown as HTMLElement
        submenu.stubSurface = surface as unknown as HTMLElement
        await submenu.show()

        let release = (): void => {}
        submenu['animateSurface'] = () => new Promise<void>((resolve) => { release = resolve })
        surface.style.removeProperty.mockClear()

        const hidePromise = submenu.hide()
        await flush()
        expect(submenu.open).toBe(false)
        expect(readLegacySubmenuPositionGlobals().cleaned).toBe(false)
        expect(surface.style.removeProperty).not.toHaveBeenCalled()

        release()
        await hidePromise
        expect(readLegacySubmenuPositionGlobals().cleaned).toBe(true)
        expect(surface.style.removeProperty).toHaveBeenCalledWith('left')
    })
})

describe('MDCLegacyMenuSubmenu quick (animation skip)', () => {
    it('reflects quick in the surface classes so the .quick CSS is live', () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.renderClassState()['nested-surface']).toBe(true)
        expect(submenu.renderClassState()['quick']).toBe(false)
        submenu.quick = true
        expect(submenu.renderClassState()['quick']).toBe(true)
    })

    it('runs the open/close animation hooks on show/hide unless quick', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        expect(submenu.animateCalls).toEqual(['open'])
        await submenu.hide()
        expect(submenu.animateCalls).toEqual(['open', 'close'])
    })

    it('skips the animation hooks when quick but still opens and closes', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        submenu.quick = true
        await submenu.show()
        expect(submenu.open).toBe(true)
        await submenu.hide()
        expect(submenu.open).toBe(false)
        expect(submenu.animateCalls).toEqual([])
    })

    it('still opens via keyboard with quick and focuses the first item', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        submenu.quick = true
        const focused: string[] = []
        submenu.stubItems = [stubItem(() => { focused.push('first') })]
        submenu.sendKey('Enter')
        expect(submenu.open).toBe(true)
        await flush()
        expect(focused).toEqual(['first'])
        expect(submenu.animateCalls).toEqual([])
    })
})

describe('MDCLegacyMenuSubmenu enterprise features & nested navigation', () => {
    it('close() aliases hide()', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        expect(submenu.open).toBe(true)
        await submenu.close()
        expect(submenu.open).toBe(false)
    })

    it('toggle() opens a closed submenu and closes an open submenu', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.open).toBe(false)
        await submenu.toggle()
        expect(submenu.open).toBe(true)
        await submenu.toggle()
        expect(submenu.open).toBe(false)
    })

    it('toggle() is blocked when submenu is disabled', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        submenu.disabled = true
        await submenu.toggle()
        expect(submenu.open).toBe(false)
    })

    it('ArrowRight stops propagation when opening', () => {
        const submenu = new TestLegacyMenuSubmenu()
        const { stopPropagation, preventDefault } = submenu.sendKey('ArrowRight')
        expect(preventDefault).toHaveBeenCalled()
        expect(stopPropagation).toHaveBeenCalled()
        expect(submenu.open).toBe(true)
    })

    it('navigates nested items with ArrowDown, ArrowUp, Home, End, and typeahead', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()

        const focused: string[] = []
        const item1 = Object.assign(stubItem(() => focused.push('item1')), {
            textContent: 'Alpha',
            listTabIndex: 0,
            matches: (selector: string) => selector === ':focus-within' && focused[focused.length - 1] === 'item1',
        })
        const item2 = Object.assign(stubItem(() => focused.push('item2')), {
            textContent: 'Beta',
            listTabIndex: -1,
            matches: (selector: string) => selector === ':focus-within' && focused[focused.length - 1] === 'item2',
        })
        const item3 = Object.assign(stubItem(() => focused.push('item3')), {
            textContent: 'Gamma',
            listTabIndex: -1,
            matches: (selector: string) => selector === ':focus-within' && focused[focused.length - 1] === 'item3',
        })

        submenu.stubItems = [item1, item2, item3]
        focused.push('item1')

        const sendNestedKey = (target: unknown, key: string): { preventDefault: () => void, stopPropagation: () => void } => {
            const preventDefault = vi.fn()
            const stopPropagation = vi.fn()
            const event = {
                key,
                target,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                preventDefault,
                stopPropagation,
                composedPath: (): EventTarget[] => [target as EventTarget, submenu],
            } as unknown as KeyboardEvent
            ;(submenu as unknown as { handleHostKeydown(e: KeyboardEvent): void }).handleHostKeydown(event)
            return { preventDefault, stopPropagation }
        }

        // ArrowDown moves from item1 to item2
        const down1 = sendNestedKey(item1, 'ArrowDown')
        expect(down1.preventDefault).toHaveBeenCalled()
        expect(down1.stopPropagation).toHaveBeenCalled()
        expect(focused[focused.length - 1]).toBe('item2')
        expect(item2.listTabIndex).toBe(0)
        expect(item1.listTabIndex).toBe(-1)

        // ArrowDown moves from item2 to item3
        sendNestedKey(item2, 'ArrowDown')
        expect(focused[focused.length - 1]).toBe('item3')

        // ArrowDown wraps from item3 back to item1
        sendNestedKey(item3, 'ArrowDown')
        expect(focused[focused.length - 1]).toBe('item1')

        // ArrowUp wraps from item1 to item3
        sendNestedKey(item1, 'ArrowUp')
        expect(focused[focused.length - 1]).toBe('item3')

        // Home moves to item1
        sendNestedKey(item3, 'Home')
        expect(focused[focused.length - 1]).toBe('item1')

        // End moves to item3
        sendNestedKey(item1, 'End')
        expect(focused[focused.length - 1]).toBe('item3')

        // Typeahead matches 'b' for Beta (item2)
        sendNestedKey(item3, 'b')
        expect(focused[focused.length - 1]).toBe('item2')
    })

    it('resolves Space key to open in resolveLegacySubmenuKeyAction', () => {
        expect(resolveLegacySubmenuKeyAction(' ', { open: false, disabled: false, isRtl: false })).toBe('open')
        expect(resolveLegacySubmenuKeyAction(' ', { open: true, disabled: false, isRtl: false })).toBe(null)
        expect(resolveLegacySubmenuKeyAction(' ', { open: false, disabled: true, isRtl: false })).toBe(null)
    })

    it('opens submenu when Space key is pressed on trigger', () => {
        const submenu = new TestLegacyMenuSubmenu()
        const { stopPropagation, preventDefault } = submenu.sendKey(' ')
        expect(preventDefault).toHaveBeenCalled()
        expect(stopPropagation).toHaveBeenCalled()
        expect(submenu.open).toBe(true)
    })

    it('supports listTabIndex property and reposition method', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        expect(submenu.listTabIndex).toBe(-1)
        submenu.listTabIndex = 0
        expect(submenu.listTabIndex).toBe(0)

        await expect(submenu.reposition()).resolves.toBeUndefined()
    })

    it('re-opens immediately if scheduleOpen is called while isHiding is true', async () => {
        const submenu = new TestLegacyMenuSubmenu()
        await submenu.show()
        expect(submenu.open).toBe(true)

        const resolvers: Array<() => void> = []
        submenu['animateSurface'] = () => new Promise((resolve) => { resolvers.push(resolve) })

        const hidePromise = submenu.hide()
        expect(submenu['isHiding']).toBe(true)

        // User pointer re-enters during hide animation
        submenu.scheduleOpen()
        expect(submenu.open).toBe(true)
        expect(submenu['isHiding']).toBe(false)

        resolvers.forEach((r) => r())
        await hidePromise
        expect(submenu.open).toBe(true)
    })

})


