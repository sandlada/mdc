/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    mirrorMenuSubmenuPlacement,
    resolveSubmenuKeyAction,
    type MenuSubmenuFocusableChild,
} from './base-menu-submenu'
import { MDCMenuSubmenu } from '../menu-submenu'
import type { IMDCMenuSubmenu } from '../menu.interface'

vi.mock('@floating-ui/dom', () => ({
    autoUpdate: (...args: unknown[]) => {
        const globals = globalThis as unknown as { __menuSubmenuAutoUpdateArgs?: unknown[]; __menuSubmenuAutoUpdateCalls?: number }
        globals.__menuSubmenuAutoUpdateArgs = args
        globals.__menuSubmenuAutoUpdateCalls = (globals.__menuSubmenuAutoUpdateCalls ?? 0) + 1
        return () => {
            ;(globalThis as unknown as { __menuSubmenuAutoUpdateCleaned?: boolean }).__menuSubmenuAutoUpdateCleaned = true
        }
    },
    computePosition: async (...args: unknown[]) => {
        const globals = globalThis as unknown as { __menuSubmenuComputePositionArgs?: unknown[]; __menuSubmenuComputePositionCalls?: number }
        globals.__menuSubmenuComputePositionArgs = args
        globals.__menuSubmenuComputePositionCalls = (globals.__menuSubmenuComputePositionCalls ?? 0) + 1
        return { x: 7, y: 9 }
    },
    offset: (value: unknown) => ({ name: 'offset', options: value }),
    flip: () => ({ name: 'flip' }),
    shift: (value: unknown) => ({ name: 'shift', options: value }),
}))

const stubItem = (focus: () => void, disabled = false): MenuSubmenuFocusableChild => ({
    isInteractive: true,
    isDisabled: disabled,
    disabled,
    focus,
})

class TestMenuSubmenu extends MDCMenuSubmenu {
    public focusCalls = 0
    public animateCalls: Array<'open' | 'close'> = []
    public stubItems: MenuSubmenuFocusableChild[] | undefined
    public stubSubmenus: IMDCMenuSubmenu[] | undefined
    public stubAnchor: HTMLElement | undefined
    public stubSurface: HTMLElement | undefined

    public override focus(): void {
        this.focusCalls++
    }

    protected override getNestedFocusableItems(): MenuSubmenuFocusableChild[] {
        return this.stubItems ?? super.getNestedFocusableItems()
    }

    protected override getNestedSubmenus(): IMDCMenuSubmenu[] {
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

type SubmenuPositionGlobals = {
    autoUpdateArgs?: unknown[]
    autoUpdateCalls: number
    computePositionArgs?: unknown[]
    computePositionCalls: number
    cleaned: boolean
}

const readSubmenuPositionGlobals = (): SubmenuPositionGlobals => {
    const globals = globalThis as unknown as {
        __menuSubmenuAutoUpdateArgs?: unknown[]
        __menuSubmenuAutoUpdateCalls?: number
        __menuSubmenuComputePositionArgs?: unknown[]
        __menuSubmenuComputePositionCalls?: number
        __menuSubmenuAutoUpdateCleaned?: boolean
    }
    return {
        autoUpdateArgs: globals.__menuSubmenuAutoUpdateArgs,
        autoUpdateCalls: globals.__menuSubmenuAutoUpdateCalls ?? 0,
        computePositionArgs: globals.__menuSubmenuComputePositionArgs,
        computePositionCalls: globals.__menuSubmenuComputePositionCalls ?? 0,
        cleaned: globals.__menuSubmenuAutoUpdateCleaned ?? false,
    }
}

const resetSubmenuPositionGlobals = (): void => {
    const globals = globalThis as unknown as Record<string, unknown>
    delete globals['__menuSubmenuAutoUpdateArgs']
    delete globals['__menuSubmenuAutoUpdateCalls']
    delete globals['__menuSubmenuComputePositionArgs']
    delete globals['__menuSubmenuComputePositionCalls']
    delete globals['__menuSubmenuAutoUpdateCleaned']
}

const stubSurface = (): { style: { setProperty: ReturnType<typeof vi.fn>, removeProperty: ReturnType<typeof vi.fn> } } => ({
    style: { setProperty: vi.fn(), removeProperty: vi.fn() },
})

describe('MDCMenuSubmenu cascade', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('has the spec-TODO delay defaults and right-start placement', () => {
        const submenu = new TestMenuSubmenu()
        expect(submenu.open).toBe(false)
        expect(submenu.quick).toBe(false)
        expect(submenu.openDelay).toBe(120)
        expect(submenu.closeDelay).toBe(220)
        expect(submenu.placement).toBe('right-start')
        expect(submenu.disabled).toBe(false)
        expect(submenu.getEffectivePlacement()).toBe('right-start')
    })

    it('opens after the hover-intent open delay and emits submenu-opened', () => {
        const submenu = new TestMenuSubmenu()
        const opened: CustomEvent[] = []
        submenu.addEventListener('submenu-opened', (event) => {
            opened.push(event as CustomEvent)
        })
        submenu.scheduleOpen()
        expect(submenu.open).toBe(false)
        vi.advanceTimersByTime(119)
        expect(submenu.open).toBe(false)
        vi.advanceTimersByTime(1)
        expect(submenu.open).toBe(true)
        expect(opened.length).toBe(1)
        expect((opened[0].detail as { submenu: unknown }).submenu).toBe(submenu)
        expect(opened[0].bubbles).toBe(true)
        expect(opened[0].composed).toBe(true)
    })

    it('cancels a pending open when the pointer leaves first', () => {
        const submenu = new TestMenuSubmenu()
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
        const submenu = new TestMenuSubmenu()
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
        const submenu = new TestMenuSubmenu()
        await submenu.show()
        submenu.scheduleClose()
        vi.advanceTimersByTime(100)
        submenu.scheduleOpen()
        vi.advanceTimersByTime(1000)
        expect(submenu.open).toBe(true)
    })

    it('blocks hover, programmatic, and keyboard expansion while disabled', async () => {
        const submenu = new TestMenuSubmenu()
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
        const submenu = new TestMenuSubmenu()
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
        const submenu = new TestMenuSubmenu()
        submenu.stubItems = [stubItem(() => { })]
        submenu.sendKey('Enter')
        expect(submenu.open).toBe(true)
        await flush()
    })

    it('closes on ArrowLeft and refocuses the trigger', async () => {
        const submenu = new TestMenuSubmenu()
        await submenu.show()
        const { preventDefault, stopPropagation } = submenu.sendKey('ArrowLeft')
        expect(preventDefault).toHaveBeenCalled()
        expect(stopPropagation).toHaveBeenCalled()
        expect(submenu.open).toBe(false)
        await flush()
        expect(submenu.focusCalls).toBe(1)
    })

    it('closes on Escape', async () => {
        const submenu = new TestMenuSubmenu()
        await submenu.show()
        submenu.sendKey('Escape')
        expect(submenu.open).toBe(false)
        await flush()
        expect(submenu.focusCalls).toBe(1)
    })

    it('lets an open nested descendant handle Escape first (hierarchy)', async () => {
        const outer = new TestMenuSubmenu()
        const inner = new TestMenuSubmenu()
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
        const first = new TestMenuSubmenu()
        const second = new TestMenuSubmenu()
        const third = new TestMenuSubmenu()
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
        const submenu = new TestMenuSubmenu()
        expect(submenu.ariaExpandedState()).toBe('false')
        await submenu.show()
        expect(submenu.ariaExpandedState()).toBe('true')
        await submenu.hide()
        expect(submenu.ariaExpandedState()).toBe('false')
    })
})

describe('resolveSubmenuKeyAction', () => {
    it('opens on Right/Enter and closes on Left/Escape in LTR', () => {
        expect(resolveSubmenuKeyAction('ArrowRight', { open: false, disabled: false, isRtl: false })).toBe('open')
        expect(resolveSubmenuKeyAction('Enter', { open: false, disabled: false, isRtl: false })).toBe('open')
        expect(resolveSubmenuKeyAction('ArrowLeft', { open: true, disabled: false, isRtl: false })).toBe('close')
        expect(resolveSubmenuKeyAction('Escape', { open: true, disabled: false, isRtl: false })).toBe('close')
        expect(resolveSubmenuKeyAction('ArrowRight', { open: true, disabled: false, isRtl: false })).toBe(null)
        expect(resolveSubmenuKeyAction('ArrowLeft', { open: false, disabled: false, isRtl: false })).toBe(null)
        expect(resolveSubmenuKeyAction('ArrowDown', { open: false, disabled: false, isRtl: false })).toBe(null)
    })

    it('mirrors the open/close keys in RTL', () => {
        expect(resolveSubmenuKeyAction('ArrowLeft', { open: false, disabled: false, isRtl: true })).toBe('open')
        expect(resolveSubmenuKeyAction('ArrowRight', { open: true, disabled: false, isRtl: true })).toBe('close')
    })

    it('returns null for every key while disabled', () => {
        expect(resolveSubmenuKeyAction('ArrowRight', { open: false, disabled: true, isRtl: false })).toBe(null)
        expect(resolveSubmenuKeyAction('Enter', { open: false, disabled: true, isRtl: false })).toBe(null)
        expect(resolveSubmenuKeyAction('Escape', { open: true, disabled: true, isRtl: false })).toBe(null)
    })
})

describe('mirrorMenuSubmenuPlacement', () => {
    it('mirrors right/left placements and keeps vertical ones', () => {
        expect(mirrorMenuSubmenuPlacement('right-start')).toBe('left-start')
        expect(mirrorMenuSubmenuPlacement('right-end')).toBe('left-end')
        expect(mirrorMenuSubmenuPlacement('right')).toBe('left')
        expect(mirrorMenuSubmenuPlacement('left-start')).toBe('right-start')
        expect(mirrorMenuSubmenuPlacement('bottom-start')).toBe('bottom-start')
        expect(mirrorMenuSubmenuPlacement('top')).toBe('top')
    })
})

describe('MDCMenuSubmenu positioning (floating-ui)', () => {
    it('exposes the offset/flip/shift middleware chain', () => {
        const submenu = new TestMenuSubmenu()
        expect(submenu.middlewareNames()).toEqual(['offset', 'flip', 'shift'])
    })

    it('tracks the trigger with autoUpdate and positions via computePosition', async () => {
        resetSubmenuPositionGlobals()
        const submenu = new TestMenuSubmenu()
        const anchor = {}
        const surface = stubSurface()
        submenu.stubAnchor = anchor as unknown as HTMLElement
        submenu.stubSurface = surface as unknown as HTMLElement
        submenu.placement = 'right-start'
        await submenu.show()
        const globals = readSubmenuPositionGlobals()
        expect(globals.autoUpdateCalls).toBe(1)
        expect(globals.autoUpdateArgs?.[0]).toBe(anchor)
        expect(globals.autoUpdateArgs?.[1]).toBe(surface)
        const update = globals.autoUpdateArgs?.[2] as () => void
        update()
        await flush()
        const afterUpdate = readSubmenuPositionGlobals()
        expect(afterUpdate.computePositionCalls).toBe(1)
        expect(afterUpdate.computePositionArgs?.[0]).toBe(anchor)
        expect(afterUpdate.computePositionArgs?.[1]).toBe(surface)
        expect(afterUpdate.computePositionArgs?.[2]).toMatchObject({ placement: 'right-start' })
        const middleware = (afterUpdate.computePositionArgs?.[2] as { middleware: Array<{ name: string }> }).middleware
        expect(middleware.map((entry) => entry.name)).toEqual(['offset', 'flip', 'shift'])
        expect(surface.style.setProperty).toHaveBeenCalledWith('left', '7px')
        expect(surface.style.setProperty).toHaveBeenCalledWith('top', '9px')
    })

    it('updatePosition is a no-op without a trigger or surface', async () => {
        resetSubmenuPositionGlobals()
        const submenu = new TestMenuSubmenu()
        await submenu.updatePosition()
        expect(readSubmenuPositionGlobals().computePositionCalls).toBe(0)
    })

    it('stops position tracking on hide and keeps the inline position styles', async () => {
        resetSubmenuPositionGlobals()
        const submenu = new TestMenuSubmenu()
        const surface = stubSurface()
        submenu.stubAnchor = {} as unknown as HTMLElement
        submenu.stubSurface = surface as unknown as HTMLElement
        await submenu.show()
        expect(readSubmenuPositionGlobals().autoUpdateCalls).toBe(1)
        await submenu.hide()
        expect(readSubmenuPositionGlobals().cleaned).toBe(true)
        // The inline styles must survive the close fade (`allow-discrete`
        // keeps the surface rendered until the transition ends); pulling
        // them mid-fade drops the surface back into flow and jumps width.
        expect(surface.style.removeProperty).not.toHaveBeenCalledWith('position')
        expect(surface.style.removeProperty).not.toHaveBeenCalledWith('left')
        expect(surface.style.removeProperty).not.toHaveBeenCalledWith('top')
    })
})

describe('MDCMenuSubmenu quick (animation skip)', () => {
    it('reflects quick in the surface classes so the .quick CSS is live', () => {
        const submenu = new TestMenuSubmenu()
        expect(submenu.renderClassState()['surface']).toBe(true)
        expect(submenu.renderClassState()['quick']).toBe(false)
        submenu.quick = true
        expect(submenu.renderClassState()['quick']).toBe(true)
    })

    it('runs the open/close animation hooks on show/hide unless quick', async () => {
        const submenu = new TestMenuSubmenu()
        await submenu.show()
        expect(submenu.animateCalls).toEqual(['open'])
        await submenu.hide()
        expect(submenu.animateCalls).toEqual(['open', 'close'])
    })

    it('skips the animation hooks when quick but still opens and closes', async () => {
        const submenu = new TestMenuSubmenu()
        submenu.quick = true
        await submenu.show()
        expect(submenu.open).toBe(true)
        await submenu.hide()
        expect(submenu.open).toBe(false)
        expect(submenu.animateCalls).toEqual([])
    })

    it('still opens via keyboard with quick and focuses the first item', async () => {
        const submenu = new TestMenuSubmenu()
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
