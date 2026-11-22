// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './pane-scaffold'
import { resolvePaneScaffoldScene } from './pane-scaffold.scene'
import { calculatePaneScaffoldDirective, panePostureFromViewportSegments } from './index'
import type { IPaneSceneEntry } from './pane-scaffold.interface'

let resize: ResizeObserverCallback

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
        constructor(callback: ResizeObserverCallback) { resize = callback }
        observe() {}
        disconnect() {}
    })
})

afterEach(() => {
    document.body.replaceChildren()
    vi.unstubAllGlobals()
})

const mount = (pattern = 'list-detail') => {
    const scaffold = document.createElement('mdc-pane-scaffold')
    scaffold.setAttribute('pattern', pattern)
    scaffold.innerHTML = '<button slot="list">Inbox</button><input slot="detail"><div slot="extra">Attachments</div><div slot="main">Main</div><div slot="supporting">Tools</div>'
    document.body.append(scaffold)
    return scaffold
}

const setSize = (width: number, height = 400) => resize(
    [{ contentBoxSize: [{ inlineSize: width, blockSize: height }] }] as ResizeObserverEntry[],
    {} as ResizeObserver,
)
const setWidth = (width: number) => setSize(width)

const visibleSlots = (scaffold: ReturnType<typeof mount>) =>
    [...scaffold.shadowRoot!.querySelectorAll<HTMLSlotElement>('[part~="pane"] > slot')]
        .filter(slot => !slot.closest('[hidden]'))
        .map(slot => slot.name)

describe('mdc-pane-scaffold', () => {
    it.each([
        [600, 0.10],
        [900, 0.15],
        [1200, 0.20],
    ])('maps the AndroidX back gesture curve at a %ipx container width', async (width, limit) => {
        const scaffold = mount()
        setWidth(width)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete

        // At Bézier parameter 0.75, the AndroidX curve has x = 0.4359375 and y = 0.8578125.
        scaffold.seekBackGesture(0.4359375, 'pop-latest')
        await scaffold.updateComplete
        expect(scaffold.backPreview?.progress).toBeCloseTo(0.8578125 * limit, 5)
        expect(scaffold.backPreview?.target.destination.pane).toBe('list')
        scaffold.seekBackGesture(1, 'pop-latest')
        await scaffold.updateComplete
        expect(scaffold.backPreview?.progress).toBe(limit)
        expect(scaffold.currentDestination.contentKey).toBe('A')
        expect(() => scaffold.seekBackGesture(1.01)).toThrow(Error)
        scaffold.seekBackGesture(0)
        await scaffold.updateComplete
        expect(scaffold.backPreview).toBeUndefined()
        scaffold.seekBack(1, 'pop-latest')
        await scaffold.updateComplete
        expect(scaffold.backPreview?.progress).toBe(1)
    })

    it('reports same-pane back preview progress and clears the preview on resize or commit', async () => {
        const scaffold = mount()
        setWidth(1000)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'B')
        await scaffold.updateComplete
        const previews: unknown[] = []
        scaffold.addEventListener('pane-back-preview-change', event => {
            previews.push((event as CustomEvent).detail)
            expect(event.bubbles).toBe(true)
            expect(event.composed).toBe(true)
        })
        const preview = (progress: number) => ({
            progress, target: { destination: { pane: 'detail', contentKey: 'A' } },
        })

        scaffold.seekBack(0.25, 'pop-until-content-change')
        await scaffold.updateComplete
        expect(previews).toMatchObject([preview(0.25)])
        scaffold.seekBack(0.75, 'pop-until-content-change')
        await scaffold.updateComplete
        expect(previews).toMatchObject([preview(0.25), preview(0.75)])
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'B' })

        setWidth(990)
        await scaffold.updateComplete
        expect(previews).toHaveLength(3)
        expect(previews[2]).toBeNull()

        scaffold.seekBack(1, 'pop-until-content-change')
        await scaffold.updateComplete
        scaffold.goBack()
        await scaffold.updateComplete
        expect(previews).toHaveLength(5)
        expect(previews[3]).toMatchObject(preview(1))
        expect(previews[4]).toBeNull()
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
    })

    it('continues a back preview to its target before committing through the regular navigation path', async () => {
        let next: FrameRequestCallback | undefined
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 1 })
        vi.stubGlobal('cancelAnimationFrame', () => { next = undefined })
        const scaffold = mount()
        setWidth(600)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        scaffold.seekBack(0.25)
        await scaffold.updateComplete

        const committed = scaffold.commitBackPreview(200)
        next!(100)
        next!(175)
        await scaffold.updateComplete
        expect(scaffold.backPreview?.progress).toBeCloseTo(0.625)
        expect(scaffold.currentDestination.pane).toBe('detail')
        expect(changed).not.toHaveBeenCalled()
        next!(250)
        await committed
        expect(scaffold.backPreview).toBeUndefined()
        expect(scaffold.currentDestination.pane).toBe('list')
        expect(changed).toHaveBeenCalledTimes(1)
        expect(changed.mock.lastCall?.[0].detail.reason).toBe('back')
    })

    it('animates a cancelled back preview to zero without changing the destination or focus', async () => {
        let next: FrameRequestCallback | undefined
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 1 })
        vi.stubGlobal('cancelAnimationFrame', () => { next = undefined })
        const scaffold = mount()
        setWidth(600)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const input = scaffold.querySelector<HTMLInputElement>('[slot=detail]')!
        input.focus()
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        const previewChanged = vi.fn()
        scaffold.addEventListener('pane-back-preview-change', previewChanged)

        scaffold.seekBack(0.75)
        await scaffold.updateComplete
        const cancelled = scaffold.cancelBackPreview(200)
        next!(100)
        next!(175)
        await scaffold.updateComplete
        expect(scaffold.backPreview?.progress).toBeCloseTo(0.375)
        expect(previewChanged.mock.lastCall?.[0].detail.progress).toBeCloseTo(0.375)
        next!(250)
        await cancelled
        expect(scaffold.backPreview).toBeUndefined()
        expect(previewChanged.mock.lastCall?.[0].detail).toBeNull()
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
        expect(scaffold.canGoBack).toBe(true)
        expect(changed).not.toHaveBeenCalled()
        expect(document.activeElement).toBe(input)
    })

    it('slots custom divider visuals without changing the separator semantics or keyboard sizing', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        const visual = document.createElement('span')
        visual.slot = 'list-divider'
        visual.textContent = 'Grip'
        scaffold.append(visual)
        setWidth(840)
        await scaffold.updateComplete
        const separator = scaffold.shadowRoot!.querySelector<HTMLElement>('[role=separator]')!
        const slot = separator.querySelector('slot')!
        expect(slot.assignedElements()).toEqual([visual])
        expect(separator.getAttribute('aria-controls')).toBe('pane-list')
        expect(separator.getAttribute('aria-label')).toBe('Resize list pane')
        expect(slot.closest('[inert]')).not.toBeNull()
        separator.focus()
        separator.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        await scaffold.updateComplete
        expect(separator.getAttribute('aria-valuenow')).toBe('376')
        visual.remove()
        expect(slot.assignedElements()).toEqual([])
        expect(slot.querySelector('[part=resize-grip]')).not.toBeNull()
        expect(scaffold.shadowRoot!.activeElement).toBe(separator)
    })

    it('calculates Material pane counts, dense medium layout, and tabletop reflow from the same window data', () => {
        expect(calculatePaneScaffoldDirective({ width: 839, height: 900 })).toMatchObject({
            maxHorizontalPartitions: 1, horizontalPartitionSpacerSize: 0, maxVerticalPartitions: 2,
        })
        expect(calculatePaneScaffoldDirective({ width: 839, height: 900 }, { twoPanesOnMediumWidth: true })).toMatchObject({
            maxHorizontalPartitions: 2, horizontalPartitionSpacerSize: 24, maxVerticalPartitions: 1, verticalPartitionSpacerSize: 0,
        })
        expect(calculatePaneScaffoldDirective({ width: 1200, height: 600, posture: { isTabletop: true } })).toMatchObject({
            maxHorizontalPartitions: 3, maxVerticalPartitions: 2, verticalPartitionSpacerSize: 24,
            defaultPanePreferredWidth: 412,
        })
    })

    it('scales undersized preferred panes proportionally with a Material directive', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        const preferredWidths = { list: 150, detail: 800 }
        scaffold.layoutDirective = { preferredWidths }
        setWidth(900)
        await scaffold.updateComplete
        const separator = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(separator.getAttribute('aria-valuenow')).toBe('240')
        scaffold.layoutDirective = { ...calculatePaneScaffoldDirective({ width: 900, height: 400 }), preferredWidths }
        await scaffold.updateComplete
        expect(separator.getAttribute('aria-valuenow')).toBe('138')

        scaffold.layoutDirective = {
            ...calculatePaneScaffoldDirective({ width: 1200, height: 400 }),
            excludedBounds: [{ left: 300, right: 340, top: 0, bottom: 400 }],
            preferredWidths: { detail: 100, extra: 800 },
        }
        setWidth(1200)
        await scaffold.updateComplete
        const tracks = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!.style.getPropertyValue('--_pane-tracks')
            .split(' ').map(Number.parseFloat)
        expect(tracks.slice(0, 3)).toEqual([0, 300, 40])
        expect(tracks[3]).toBeCloseTo(836 / 9)
        expect(tracks[4]).toBe(24)
        expect(tracks[5]).toBeCloseTo(836 * 8 / 9)

        scaffold.layoutDirective = {
            ...calculatePaneScaffoldDirective({ width: 1200, height: 400 }),
            preferredWidths: { list: { proportion: 0 } },
        }
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.getElementById('pane-list')!.inert).toBe(true)
        const collapsedHandle = scaffold.shadowRoot!.querySelector('[aria-controls=pane-list]')!
        expect(collapsedHandle.getAttribute('aria-valuemin')).toBe('0')
        collapsedHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.getElementById('pane-list')!.inert).toBe(false)
        expect(collapsedHandle.getAttribute('aria-valuenow')).toBe('16')
    })

    it('projects viewport segments into a nested scaffold and applies hinge policies', async () => {
        const box = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom })
        const posture = panePostureFromViewportSegments(box(100, 40, 1000, 440))([
            box(0, 0, 500, 700), box(540, 0, 1100, 700),
        ])
        const window = { width: 900, height: 400, posture }
        const directive = calculatePaneScaffoldDirective(window)
        expect(directive.excludedBounds).toEqual([box(400, 0, 440, 400)])
        expect(calculatePaneScaffoldDirective(window, { verticalHingePolicy: 'never-avoid' }).excludedBounds).toEqual([])
        const seamless = panePostureFromViewportSegments(box(100, 40, 1000, 440))([
            box(0, 0, 520, 700), box(520, 0, 1100, 700),
        ])
        expect(calculatePaneScaffoldDirective({ ...window, posture: seamless }, { verticalHingePolicy: 'avoid-occluding' }).excludedBounds).toEqual([])
        expect(calculatePaneScaffoldDirective({ ...window, posture: seamless }).excludedBounds).toEqual([box(420, 0, 420, 400)])
        const tabletop = panePostureFromViewportSegments(box(100, 40, 1000, 440))([
            box(0, 0, 1100, 320), box(0, 340, 1100, 700),
        ])
        expect(tabletop.isTabletop).toBe(true)

        const scaffold = mount()
        scaffold.layoutDirective = directive
        setSize(900, 400)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!.style.getPropertyValue('--_pane-tracks'))
            .toBe('0px 400px 40px 460px 0px')
    })

    it('places tabletop panes on either side of the physical horizontal hinge', async () => {
        const posture = panePostureFromViewportSegments({ left: 80, top: 40, right: 820, bottom: 640 })([
            { left: 0, top: 0, right: 1000, bottom: 300 },
            { left: 0, top: 340, right: 1000, bottom: 900 },
        ])
        const directive = calculatePaneScaffoldDirective({ width: 740, height: 600, posture })
        expect(directive.horizontalExcludedBounds).toEqual([{ left: 0, top: 260, right: 740, bottom: 300 }])
        const scaffold = mount('supporting-pane')
        scaffold.layoutDirective = directive
        setSize(740, 600)
        await scaffold.updateComplete
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        expect(visibleSlots(scaffold)).toEqual(['main', 'supporting'])
        expect(grid.style.getPropertyValue('--_pane-rows')).toBe('0px 260px 40px 300px 0px')
        scaffold.adaptStrategies = { supporting: { type: 'hide' } }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main'])
        expect(grid.style.getPropertyValue('--_pane-rows')).toBe('300px 300px 0px 0px 0px')
    })

    it('uses the configured horizontal partitions for single-pane adaptation even when tracks must be clamped', async () => {
        const scaffold = mount('supporting-pane')
        const adaptStrategies = { extra: { type: 'levitate', onlyIfSinglePane: true } } as const
        const multiPane = { maxHorizontalPartitions: 2, maxVerticalPartitions: 2 } as const
        scaffold.adaptStrategies = adaptStrategies
        scaffold.layoutDirective = multiPane
        setSize(24, 900)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main'])
        scaffold.navigateTo('extra', 'A')
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue).toMatchObject({ expandedPanes: ['extra'], levitatedPane: undefined })

        const scene = resolvePaneScaffoldScene({
            width: 24, height: 900, layoutDirective: multiPane, adaptStrategies, shouldHandleSinglePaneLayout: true,
        })([
            { key: 'main', pane: { pattern: 'supporting-pane', sceneKey: 'editor', role: 'main' } },
            { key: 'A', pane: { pattern: 'supporting-pane', sceneKey: 'editor', role: 'extra' } },
        ])
        expect(scene!.value).toMatchObject({ expandedPanes: ['extra'], levitatedPane: undefined })

        scaffold.layoutDirective = { maxHorizontalPartitions: 1, maxVerticalPartitions: 2 }
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue).toMatchObject({
            destination: { pane: 'extra', contentKey: 'A' }, expandedPanes: ['main'],
            reflowedPane: { pane: 'supporting', reflowUnder: 'main' }, levitatedPane: 'extra',
        })
    })

    it('renders an application-controlled value independently of history and container breakpoints', async () => {
        const scaffold = mount()
        setWidth(540)
        await scaffold.updateComplete
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        scaffold.scaffoldValue = {
            destination: { pane: 'detail', contentKey: 'external' },
            expandedPanes: ['list', 'detail'],
        }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'external' })
        expect(scaffold.canGoBack).toBe(false)
        expect(() => scaffold.navigateTo('extra')).toThrow(Error)
        expect(changed.mock.lastCall?.[0].detail).toEqual({
            destination: { pane: 'detail', contentKey: 'external' }, reason: 'controlled',
        })
        setWidth(1200)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        scaffold.adaptStrategies = { extra: { type: 'levitate', scrim: true } }
        scaffold.scaffoldValue = { ...scaffold.scaffoldValue, expandedPanes: ['detail'], levitatedPane: 'extra' }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['detail', 'extra'])
        expect(scaffold.shadowRoot!.querySelector('[part~="levitated-pane"]')?.id).toBe('pane-extra')
        expect(scaffold.shadowRoot!.activeElement?.id).toBe('pane-extra')
        const dismiss = vi.fn()
        scaffold.addEventListener('pane-dismiss-request', dismiss)
        scaffold.shadowRoot!.getElementById('pane-extra')!.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape', bubbles: true, composed: true,
        }))
        expect(dismiss.mock.lastCall?.[0].detail).toEqual({ pane: 'extra' })
        expect(visibleSlots(scaffold)).toEqual(['detail', 'extra'])
        scaffold.scaffoldValue = undefined
        scaffold.adaptStrategies = {}
        await scaffold.updateComplete
        expect(scaffold.currentDestination.pane).toBe('list')
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail', 'extra'])
    })

    it('validates controlled pane roles and filters missing slot content', async () => {
        const scaffold = mount('supporting-pane')
        setWidth(540)
        await scaffold.updateComplete
        const value = {
            destination: { pane: 'main', contentKey: undefined },
            expandedPanes: ['main'],
            reflowedPane: { pane: 'supporting', reflowUnder: 'main' },
            levitatedPane: 'supporting',
        } as const
        expect(() => { scaffold.scaffoldValue = value }).toThrow('Invalid controlled pane arrangement')
        scaffold.scaffoldValue = { ...value, levitatedPane: undefined }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main', 'supporting'])
        const supporting = scaffold.querySelector('[slot=supporting]')!
        supporting.remove()
        await Promise.resolve()
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main'])
    })

    it('seeks a controlled transition while preserving focus and snaps to the target on request', async () => {
        const scaffold = mount()
        scaffold.animatePanes = true
        const start = { destination: { pane: 'list', contentKey: undefined }, expandedPanes: ['list'] } as const
        const target = { destination: { pane: 'detail', contentKey: 'A' }, expandedPanes: ['detail'] } as const
        scaffold.scaffoldValue = start
        setWidth(540)
        await scaffold.updateComplete
        const list = scaffold.querySelector<HTMLButtonElement>('[slot=list]')!
        const detail = scaffold.shadowRoot!.getElementById('pane-detail')!
        list.focus()
        scaffold.seekScaffoldValue(0.4, target)
        await scaffold.updateComplete
        expect(scaffold.scaffoldTransition).toEqual({ progress: 0.4, target })
        expect(scaffold.currentDestination).toEqual(start.destination)
        expect(scaffold.backPreview).toBeUndefined()
        expect(detail.hidden).toBe(false)
        expect(detail.inert).toBe(true)
        expect(detail.style.opacity).toBe('0.4')
        expect(document.activeElement).toBe(list)
        scaffold.seekScaffoldValue(0, target)
        await scaffold.updateComplete
        expect(detail.hidden).toBe(true)
        scaffold.seekScaffoldValue(1, target)
        await scaffold.updateComplete
        expect(scaffold.currentDestination).toEqual(start.destination)
        scaffold.snapToScaffoldValue(target)
        await scaffold.updateComplete
        expect(scaffold.scaffoldTransition).toBeUndefined()
        expect(scaffold.currentScaffoldValue.destination).toEqual(target.destination)
        expect(detail.inert).toBe(false)
        expect(visibleSlots(scaffold)).toEqual(['detail'])
        expect(document.activeElement).toBe(scaffold.querySelector('[slot=detail]'))
    })

    it.each([
        { outcome: 'commits after the remaining duration', resize: false },
        { outcome: 'cancels when the container resizes', resize: true },
    ])('continues a sought controlled transition and $outcome', async ({ resize }) => {
        let next: FrameRequestCallback | undefined
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 1 })
        vi.stubGlobal('cancelAnimationFrame', () => { next = undefined })
        const scaffold = mount()
        const initial = { destination: { pane: 'list', contentKey: undefined }, expandedPanes: ['list'] } as const
        const target = { destination: { pane: 'detail', contentKey: 'A' }, expandedPanes: ['detail'] } as const
        scaffold.scaffoldValue = initial
        setWidth(540)
        await scaffold.updateComplete
        scaffold.seekScaffoldValue(0.5, target)
        const finished = vi.fn()
        const animation = scaffold.animateToScaffoldValue(target, 200).then(finished)
        next!(1000)
        next!(1050)
        await scaffold.updateComplete
        expect(scaffold.scaffoldTransition?.progress).toBe(0.75)
        expect(scaffold.currentDestination).toEqual(initial.destination)
        expect(finished).not.toHaveBeenCalled()
        if (resize) {
            setWidth(900)
            await animation
            await scaffold.updateComplete
            expect(next).toBeUndefined()
            expect(scaffold.scaffoldTransition).toBeUndefined()
            expect(scaffold.currentDestination).toEqual(initial.destination)
            return
        }
        next!(1100)
        await animation
        expect(finished).toHaveBeenCalledOnce()
        expect(scaffold.scaffoldTransition).toBeUndefined()
        expect(scaffold.currentDestination).toEqual(target.destination)
    })

    it('slides single panes in opposite directions and expands a pane between retained panes', async () => {
        const scaffold = mount()
        scaffold.animatePanes = true
        const apply = async (expandedPanes: readonly ('list' | 'detail' | 'extra')[]) => {
            scaffold.scaffoldValue = { expandedPanes, destination: { pane: expandedPanes[0], contentKey: undefined } }
            await scaffold.updateComplete
        }
        setWidth(540)
        await apply(['list'])
        const motion = (role: string) => scaffold.shadowRoot!.getElementById(`pane-${role}`)!.getAttribute('data-pane-motion')
        await apply(['detail'])
        expect(motion('list')).toBe('start')
        expect(motion('detail')).toBe('end')
        await apply(['list'])
        expect(motion('detail')).toBe('end')
        expect(motion('list')).toBe('start')
        setWidth(1200)
        await apply(['list', 'extra'])
        await apply(['list', 'detail', 'extra'])
        expect(motion('detail')).toBe('center')
        expect(motion('list')).toBeNull()
        expect(motion('extra')).toBeNull()
    })

    it('uses role animation for entry and the outgoing route animation for exit', async () => {
        vi.stubGlobal('CSSNumericValue', { parse: () => ({ to: () => ({ value: 250 }) }) })
        const list = { key: 'inbox', pane: { pattern: 'list-detail', sceneKey: 'mail', role: 'list' } } as const
        const detail = {
            key: 'A',
            pane: {
                pattern: 'list-detail', sceneKey: 'mail', role: 'detail',
                animation: { exit: { keyframes: [{ opacity: 1 }, { opacity: 0.3 }], duration: 320 } },
            },
        } as const
        const resolve = resolvePaneScaffoldScene({ width: 540, height: 400, shouldHandleSinglePaneLayout: true })
        const scaffold = mount()
        scaffold.animatePanes = true
        scaffold.paneAnimations = {
            detail: { enter: { keyframes: [{ opacity: 0.4 }, { opacity: 1 }], duration: 160 } },
        }
        setWidth(540)
        scaffold.applyScene(resolve([list])!)
        await scaffold.updateComplete
        const root = scaffold.shadowRoot!
        const pane = root.getElementById('pane-detail')!
        const enter = { cancel: vi.fn(), finished: Promise.withResolvers<void>().promise }
        const exit = Promise.withResolvers<void>()
        const animate = vi.fn(() => ({ cancel: vi.fn(), finished: exit.promise })).mockReturnValueOnce(enter)
        pane.animate = animate as unknown as typeof pane.animate
        for (const element of [pane, root.getElementById('pane-list')!]) {
            Object.defineProperties(element, { offsetWidth: { value: 540 }, offsetHeight: { value: 400 } })
        }
        scaffold.applyScene(resolve([list, detail])!)
        await scaffold.updateComplete
        expect(animate).toHaveBeenLastCalledWith([{ opacity: 0.4 }, { opacity: 1 }], expect.objectContaining({ duration: 160 }))
        expect(pane.hidden).toBe(false)

        scaffold.applyScene(resolve([list])!)
        await scaffold.updateComplete
        expect(enter.cancel).toHaveBeenCalledTimes(1)
        expect(animate).toHaveBeenLastCalledWith([{ opacity: 1 }, { opacity: 0.3 }], expect.objectContaining({ duration: 320 }))
        expect(pane.hidden).toBe(true)
        expect(pane.hasAttribute('inert')).toBe(true)
        exit.resolve()
        await exit.promise
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list'])
    })

    it('cancels an active pane transition when reduced motion is enabled', async () => {
        const preference = Object.assign(new EventTarget(), { matches: false })
        const query = vi.spyOn(window, 'matchMedia').mockReturnValue(preference as MediaQueryList)
        try {
            const scaffold = mount()
            scaffold.animatePanes = true
            scaffold.paneAnimations = { detail: { enter: { keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 300 } } }
            setWidth(540)
            await scaffold.updateComplete
            const cancel = vi.fn()
            const detail = scaffold.shadowRoot!.getElementById('pane-detail')!
            const animate = vi.fn(() => ({ cancel, finished: Promise.withResolvers<void>().promise }))
            detail.animate = animate as unknown as typeof detail.animate
            scaffold.navigateTo('detail', 'A')
            await scaffold.updateComplete
            expect(animate).toHaveBeenCalledTimes(1)

            preference.matches = true
            preference.dispatchEvent(new Event('change'))
            await scaffold.updateComplete
            expect(cancel).toHaveBeenCalledTimes(1)
            scaffold.navigateTo('list')
            await scaffold.updateComplete
            scaffold.navigateTo('detail', 'B')
            await scaffold.updateComplete
            expect(animate).toHaveBeenCalledTimes(1)
            expect(visibleSlots(scaffold)).toEqual(['detail'])
        } finally {
            query.mockRestore()
        }
    })

    it('projects a router stack into a scene and asks its owner to apply back navigation', async () => {
        const route = (key: string, role: 'list' | 'detail', sceneKey = 'mail'): IPaneSceneEntry => ({
            key, pane: { pattern: 'list-detail', role, sceneKey, preferredWidth: role === 'list' ? 290 : undefined },
        })
        const parent = { key: 'home' }
        const list = route('inbox', 'list')
        const first = route('A', 'detail')
        const second = route('B', 'detail')
        const routes = [parent, list, first, second]
        expect(resolvePaneScaffoldScene({ width: 560, height: 600 })(routes)).toBeUndefined()
        const resolve = resolvePaneScaffoldScene({
            width: 900, height: 600, backNavigationBehavior: 'pop-until-content-change',
        })
        const scene = resolve(routes)!
        expect(scene.paneEntries.detail).toBe(second)
        expect(scene.directive.preferredWidths?.list).toBe(290)
        expect(scene.previousEntries).toEqual([parent, list, first])

        const scaffold = mount()
        setSize(900, 600)
        const back = vi.fn()
        scaffold.addEventListener('pane-scene-back-request', back)
        scaffold.applyScene(scene)
        await scaffold.updateComplete
        expect(scaffold.currentDestination.contentKey).toBe('B')
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        scaffold.goBack()
        expect(back.mock.lastCall?.[0].detail.previousEntries).toEqual([parent, list, first])
        expect(scaffold.currentDestination.contentKey).toBe('B')
        scaffold.applyScene(resolve(scene.previousEntries)!)
        await scaffold.updateComplete
        expect(scaffold.currentDestination.contentKey).toBe('A')
    })

    it('uses the previous route preferred width in the back preview without applying the route', async () => {
        const mail = (key: string, preferredWidth?: number): IPaneSceneEntry => ({
            key, pane: { pattern: 'list-detail', role: 'list', sceneKey: 'mail', preferredWidth },
        })
        const routes: IPaneSceneEntry[] = [
            mail('inbox-A', 280),
            { key: 'message', pane: { pattern: 'list-detail', role: 'detail', sceneKey: 'mail' } },
            mail('inbox-B', 420),
        ]
        const resolve = resolvePaneScaffoldScene({
            width: 900, height: 400, backNavigationBehavior: 'pop-latest',
        })
        const scaffold = mount()
        setSize(900, 400)
        const scene = resolve(routes)!
        scaffold.applyScene(scene)
        await scaffold.updateComplete
        const list = scaffold.shadowRoot!.getElementById('pane-list')!
        Object.defineProperties(list, {
            offsetLeft: { value: 0 }, offsetTop: { value: 0 },
            offsetWidth: { value: 420 }, offsetHeight: { value: 400 },
        })
        scaffold.seekBack(1)
        await scaffold.updateComplete
        expect(list.style.getPropertyValue('--_preview-transform')).toBe('translate(0px, 0px) scale(0.6666666666666666, 1)')
        expect(scaffold.currentDestination.contentKey).toBe('inbox-B')
        scaffold.seekBack(0)
        await scaffold.updateComplete
        expect(list.style.getPropertyValue('--_preview-transform')).toBe('')
        scaffold.applyScene(resolve(scene.previousEntries)!)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('.grid')?.getAttribute('style')).toContain('280px 24px 596px')
    })

    it('uses the previous route preferred height for a reflowed pane preview', async () => {
        const tool = (key: string, preferredHeight: number): IPaneSceneEntry => ({
            key, pane: { pattern: 'supporting-pane', role: 'supporting', sceneKey: 'editor', preferredHeight },
        })
        const routes: IPaneSceneEntry[] = [
            { key: 'editor', pane: { pattern: 'supporting-pane', role: 'main', sceneKey: 'editor' } },
            tool('tool-A', 140),
            tool('tool-B', 220),
        ]
        const resolve = resolvePaneScaffoldScene({
            width: 540, height: 600, backNavigationBehavior: 'pop-latest',
            layoutDirective: { maxVerticalPartitions: 2 },
            adaptStrategies: { supporting: { type: 'reflow', reflowUnder: 'main' } },
        })
        const scaffold = mount('supporting-pane')
        setSize(540, 600)
        const scene = resolve(routes)!
        scaffold.applyScene(scene)
        await scaffold.updateComplete
        const toolPane = scaffold.shadowRoot!.getElementById('pane-supporting')!
        Object.defineProperties(toolPane, {
            offsetLeft: { value: 0 }, offsetTop: { value: 380 },
            offsetWidth: { value: 540 }, offsetHeight: { value: 220 },
        })
        scaffold.seekBack(1)
        await scaffold.updateComplete
        expect(toolPane.style.getPropertyValue('--_preview-transform')).toBe('translate(0px, 80px) scale(1, 0.6363636363636364)')
        expect(scaffold.currentDestination.contentKey).toBe('tool-B')
        scaffold.applyScene(resolve(scene.previousEntries)!)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('.grid')?.getAttribute('style')).toContain('436px 24px 140px')
    })

    it('keeps focus in a still-visible pane when a router reapplies the same destination after resizing', async () => {
        const routes = [
            { key: 'inbox', pane: { pattern: 'list-detail', role: 'list', sceneKey: 'mail' } },
            { key: 'A', pane: { pattern: 'list-detail', role: 'detail', sceneKey: 'mail' } },
        ] as const
        const scaffold = mount()
        setWidth(1000)
        scaffold.applyScene(resolvePaneScaffoldScene({ width: 1000, height: 400 })(routes)!)
        await scaffold.updateComplete
        const list = scaffold.querySelector<HTMLButtonElement>('[slot=list]')!
        list.focus()
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        setWidth(950)
        scaffold.applyScene(resolvePaneScaffoldScene({ width: 950, height: 400 })(routes)!)
        await scaffold.updateComplete
        expect(document.activeElement).toBe(list)
        expect(changed).not.toHaveBeenCalled()
    })

    it('returns to the previous pane in supporting scenes even when both panes stay visible', async () => {
        const route = (key: string, role: 'main' | 'supporting'): IPaneSceneEntry => ({
            key, pane: { pattern: 'supporting-pane', role, sceneKey: 'editor' },
        })
        const routes = [route('document', 'main'), route('comments', 'supporting'), route('edit-A', 'main'), route('edit-B', 'main')]
        const options = { width: 900, height: 600 }
        const resolve = resolvePaneScaffoldScene(options)
        const scene = resolve(routes)!
        expect(scene.backNavigationBehavior).toBe('pop-until-current-destination-change')
        expect(scene.previousEntries).toEqual(routes.slice(0, 2))
        expect(scene.value.expandedPanes).toEqual(['main', 'supporting'])
        expect(resolvePaneScaffoldScene({ ...options, backNavigationBehavior: 'pop-latest' })(routes)!.previousEntries)
            .toEqual(routes.slice(0, 3))

        const scaffold = mount('supporting-pane')
        setSize(900, 600)
        scaffold.applyScene(scene)
        await scaffold.updateComplete
        const back = vi.fn()
        scaffold.addEventListener('pane-scene-back-request', back)
        scaffold.seekBack(0.5)
        await scaffold.updateComplete
        expect(scaffold.backPreview?.target.destination).toEqual({ pane: 'supporting', contentKey: 'comments' })
        scaffold.goBack()
        expect(back.mock.lastCall?.[0].detail.previousEntries).toEqual(routes.slice(0, 2))
        scaffold.applyScene(resolve(scene.previousEntries)!)
        await scaffold.updateComplete
        expect(scaffold.currentDestination).toEqual({ pane: 'supporting', contentKey: 'comments' })
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['main', 'supporting'])
    })

    it('uses each list route’s detail placeholder during scene resolution and back preview', async () => {
        const list = (key: string, hasDetailPlaceholder: boolean): IPaneSceneEntry => ({
            key, pane: { pattern: 'list-detail', role: 'list', sceneKey: 'mail', hasDetailPlaceholder },
        })
        const inbox = list('inbox', true)
        const archive = list('archive', false)
        const resolve = resolvePaneScaffoldScene({ width: 900, height: 600, shouldHandleSinglePaneLayout: true })
        expect(resolve([inbox])?.detailPlaceholder).toBe(true)
        const scene = resolve([inbox, archive])!
        expect(scene.detailPlaceholder).toBe(false)
        expect(scene.value.expandedPanes).toEqual(['list'])
        expect(scene.previousEntries).toEqual([inbox])
        expect(resolvePaneScaffoldScene({ width: 900, height: 600, hasDetailPlaceholder: true })([archive])).toBeUndefined()

        const scaffold = mount()
        setSize(900, 600)
        scaffold.applyScene(scene)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list'])
        scaffold.seekBack(0.5)
        await scaffold.updateComplete
        expect(scaffold.backPreview?.target).toMatchObject({
            destination: { pane: 'list', contentKey: 'inbox' }, expandedPanes: ['list', 'detail'],
        })
        scaffold.applyScene(resolve(scene.previousEntries)!)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
    })

    it('yields to other scenes on back and uses an optional detail placeholder', async () => {
        const list = { key: 'inbox', pane: { pattern: 'list-detail', sceneKey: 'mail', role: 'list' } } as const
        const preferences = { key: 'preferences', pane: { pattern: 'list-detail', sceneKey: 'settings', role: 'list' } } as const
        const message = { key: 'A', pane: { pattern: 'list-detail', sceneKey: 'mail', role: 'detail' } } as const
        const resolve = resolvePaneScaffoldScene({ width: 900, height: 600, hasDetailPlaceholder: true })
        const empty = resolve([list])!
        expect(empty.detailPlaceholder).toBe(true)
        expect(empty.value.expandedPanes).toEqual(['list', 'detail'])
        const scene = resolve([list, preferences, message])!
        expect(scene.paneEntries.list).toBe(list)
        expect(scene.previousEntries).toEqual([list, preferences])
        expect(scene.previousSceneIndex).toBeUndefined()
        expect(resolve([list, { key: 'outside' }])).toBeUndefined()

        const scaffold = mount()
        setSize(900, 600)
        scaffold.applyScene(resolve([list, message])!)
        await scaffold.updateComplete
        expect(scaffold.canPreviewBack()).toBe(false)
        expect(scaffold.canGoBack).toBe(false)

        const byContent = resolvePaneScaffoldScene({
            width: 900, height: 600, hasDetailPlaceholder: true, backNavigationBehavior: 'pop-until-content-change',
        })
        scaffold.applyScene(byContent([list, message])!)
        await scaffold.updateComplete
        expect(scaffold.canPreviewBack()).toBe(true)

        scaffold.applyScene(scene)
        await scaffold.updateComplete
        expect(scaffold.canGoBack).toBe(true)
        expect(scaffold.canPreviewBack()).toBe(false)
        const back = vi.fn()
        scaffold.addEventListener('pane-scene-back-request', back)
        scaffold.goBack()
        expect(back.mock.lastCall?.[0].detail.previousEntries).toEqual([list, preferences])
    })
    it('applies a split set before measurement to the first adjustable pane pair, including after restore', async () => {
        const scaffold = mount()
        scaffold.setFirstPaneWidth(410)
        const saved = JSON.parse(JSON.stringify(scaffold.saveState()))
        const restored = mount()
        restored.resizable = true
        restored.restoreState(saved)
        setWidth(600)
        await restored.updateComplete
        expect(restored.isPaneExpansionUnspecified()).toBe(false)
        expect(visibleSlots(restored)).toEqual(['list'])
        setWidth(1000)
        await restored.updateComplete
        expect(restored.shadowRoot!.querySelector('[role=separator]')!.getAttribute('aria-valuenow')).toBe('410')
    })

    it('can update and clear a shared split while the scaffold is narrow', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionStateKey = 'mail'
        setWidth(600)
        await scaffold.updateComplete
        scaffold.setFirstPaneProportion(0.5)
        setWidth(1000)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('[role=separator]')!.getAttribute('aria-valuenow')).toBe('488')
        setWidth(600)
        await scaffold.updateComplete
        scaffold.clearPaneExpansion()
        expect(scaffold.isPaneExpansionUnspecified()).toBe(true)
        setWidth(1000)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('[role=separator]')!.getAttribute('aria-valuenow')).toBe('360')
    })

    it('keeps the two-pane split when the same roles are reordered and restores legacy ordered snapshots', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        setSize(1000, 500)
        await scaffold.updateComplete
        scaffold.setFirstPaneWidth(430)
        await scaffold.updateComplete
        scaffold.layoutDirective = { paneOrder: ['detail', 'list', 'extra'] }
        await scaffold.updateComplete
        const firstWidth = () => scaffold.shadowRoot!.querySelector('[role=separator]')?.getAttribute('aria-valuenow')
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['detail', 'list'])
        expect(firstWidth()).toBe('430')

        const oldSplit = { type: 'offset-from-start', value: 460 }
        const legacy = { ...scaffold.saveState(), expansions: [['list-detail:detail,list', oldSplit]] }
        scaffold.restoreState(legacy)
        await scaffold.updateComplete
        expect(firstWidth()).toBe('460')
        scaffold.layoutDirective = undefined
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['list', 'detail'])
        expect(firstWidth()).toBe('460')
        expect(scaffold.saveState().expansions).toEqual([['list-detail:list,detail', oldSplit]])

        scaffold.restoreState({
            ...legacy,
            proportions: [['list-detail:detail,list', [0.5, 0.5]]],
            expansions: [...legacy.expansions, ['list-detail:list,detail', { type: 'offset-from-start', value: 420 }]],
        })
        await scaffold.updateComplete
        expect(firstWidth()).toBe('420')
        expect(scaffold.saveState().proportions).toEqual([])
    })

    it('uses the requested inline order without changing destination or recreating panes', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        setSize(1000, 500)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const detail = scaffold.shadowRoot!.querySelector<HTMLElement>('#pane-detail')
        scaffold.layoutDirective = { paneOrder: ['detail', 'list', 'extra'] }
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['detail', 'list'])
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
        expect(scaffold.shadowRoot!.querySelector('#pane-detail')).toBe(detail)
        expect(detail!.style.gridColumn).toBe('1')
        const splitter = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(splitter.getAttribute('aria-controls')).toBe('pane-detail')
        splitter.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
        const snapshot = scaffold.saveState()
        expect(() => scaffold.restoreState(snapshot)).not.toThrow()
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('736')
    })

    it('reflows a supporting pane below the main pane by default when a second row is available', async () => {
        const scaffold = mount('supporting-pane')
        setSize(560, 900)
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.reflowedPane).toEqual({ pane: 'supporting', reflowUnder: 'main' })
        scaffold.adaptStrategies = { supporting: { type: 'hide' } }
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.reflowedPane).toBeUndefined()
    })
    it('round-trips destination history, a split anchor, and a floating size into a new scaffold', async () => {
        const configure = (scaffold: ReturnType<typeof mount>) => {
            scaffold.resizable = true
            scaffold.setAttribute('back-navigation-behavior', 'pop-until-content-change')
            scaffold.expansionAnchors = [{ id: 'list', type: 'offset-from-start', value: 300 }]
            scaffold.adaptStrategies = { extra: { type: 'levitate', resize: { dockedEdge: 'inline-end', minSize: 100, maxSize: 460 } } }
        }
        const original = mount()
        configure(original)
        setSize(900, 400)
        await original.updateComplete
        original.snapToExpansionAnchor('list')
        original.navigateTo('detail', 'A')
        original.navigateTo('detail', 'B')
        original.navigateTo('extra', 'B')
        await original.updateComplete
        original.shadowRoot!.querySelector('[part=levitated-resize-handle]')!
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
        const state = JSON.parse(JSON.stringify(original.saveState()))

        const restored = mount()
        configure(restored)
        const changed = vi.fn()
        restored.addEventListener('pane-change', changed)
        restored.restoreState(state)
        setSize(1000, 400)
        await restored.updateComplete
        expect(changed.mock.lastCall?.[0].detail.reason).toBe('restore')
        expect(restored.currentDestination).toEqual({ pane: 'extra', contentKey: 'B' })
        expect(restored.currentExpansionAnchor).toBe('list')
        expect(restored.shadowRoot!.querySelector('[part=levitated-resize-handle]')!.getAttribute('aria-valuenow')).toBe('460')
        restored.goBack('pop-latest')
        expect(restored.currentDestination).toEqual({ pane: 'detail', contentKey: 'B' })
        restored.goBack('pop-until-content-change')
        expect(restored.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
        expect(() => restored.restoreState({ ...state, version: 2 })).toThrow(Error)
        expect(restored.currentDestination.contentKey).toBe('A')
    })

    it('restores manually resized proportions in a differently sized scaffold', async () => {
        const original = mount()
        original.resizable = true
        setSize(840, 400)
        await original.updateComplete
        original.shadowRoot!.querySelector('[role=separator]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
        const snapshot = original.saveState()
        const restored = mount()
        restored.resizable = true
        restored.restoreState(snapshot)
        setSize(1044, 400)
        await restored.updateComplete
        expect(restored.shadowRoot!.querySelector('[role=separator]')!.getAttribute('aria-valuenow')).toBe('720')
    })
    it('resolves preferred proportions against the whole container before applying pane spacers', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.layoutDirective = {
            excludedBounds: [{ left: 800, right: 840, top: 0, bottom: 500 }],
            preferredWidths: { list: { proportion: 0.25 }, detail: 260 },
        }
        setSize(1240, 500)
        await scaffold.updateComplete
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('0px 310px 24px 466px 40px 400px 0px')

        scaffold.layoutDirective = { preferredWidths: { list: { proportion: 0.35 } } }
        setSize(900, 500)
        await scaffold.updateComplete
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('315px 24px 561px')
        setSize(1000, 500)
        await scaffold.updateComplete
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('350px 24px 626px')
    })

    it('resolves height proportions for both reflowed and floating panes', async () => {
        const scaffold = mount('supporting-pane')
        scaffold.adaptStrategies = {
            supporting: { type: 'reflow', reflowUnder: 'main' },
            extra: { type: 'levitate' },
        }
        scaffold.layoutDirective = { maxVerticalPartitions: 2, preferredHeights: {
            supporting: { proportion: 0.25 }, extra: { proportion: 0.6 },
        } }
        setSize(560, 400)
        await scaffold.updateComplete
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        expect(grid.style.getPropertyValue('--_pane-rows')).toBe('276px 24px 100px')
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const extra = scaffold.shadowRoot!.querySelector<HTMLElement>('#pane-extra')!
        expect(extra.style.getPropertyValue('--_levitated-block-size')).toBe('240px')
        setSize(560, 500)
        await scaffold.updateComplete
        expect(extra.style.getPropertyValue('--_levitated-block-size')).toBe('300px')
    })
    it('levitates the current destination only with one horizontal partition when configured', async () => {
        const scaffold = mount()
        scaffold.adaptStrategies = { detail: { type: 'levitate', onlyIfSinglePane: true } }
        setSize(560, 500)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.levitatedPane).toBe('detail')
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['list'])
        setSize(840, 500)
        await scaffold.updateComplete
        expect(scaffold.currentScaffoldValue.levitatedPane).toBeUndefined()
        expect(scaffold.currentScaffoldValue.expandedPanes).toEqual(['list', 'detail'])
        expect(scaffold.currentDestination.contentKey).toBe('A')
    })

    it('applies per-pane edge bounds without adding margins to interior gaps', async () => {
        const scaffold = mount()
        scaffold.layoutDirective = {
            paneMargins: { list: { inlineStart: 20, inlineEnd: 20, blockStart: 12 } },
            paneInsets: { list: { inlineStart: 36, blockStart: 8 } },
        }
        setSize(840, 500)
        await scaffold.updateComplete
        const list = scaffold.shadowRoot!.querySelector<HTMLElement>('#pane-list')!
        expect(list.style.getPropertyValue('--_pane-margin-inline-start')).toBe('36px')
        expect(list.style.getPropertyValue('--_pane-margin-inline-end')).toBe('0px')
        expect(list.style.getPropertyValue('--_pane-margin-block-start')).toBe('12px')
    })
    it('keeps outgoing content in the DOM and reports only the active layout with motion enabled', async () => {
        const scaffold = mount()
        scaffold.setAttribute('animate-panes', '')
        const changed = vi.fn()
        scaffold.addEventListener('pane-layout-change', changed)
        setWidth(560)
        await scaffold.updateComplete
        const list = scaffold.querySelector('[slot=list]')!
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        expect(scaffold.animatePanes).toBe(true)
        expect(scaffold.shadowRoot!.querySelector('#pane-list')!.hasAttribute('inert')).toBe(true)
        expect(changed.mock.lastCall?.[0].detail.visiblePanes).toEqual(['detail'])
        expect(scaffold.querySelector('[slot=list]')).toBe(list)
    })
    it('accepts programmatic physical drag deltas and shares the resulting size with the handle', async () => {
        const scaffold = mount()
        scaffold.adaptStrategies = {
            extra: { type: 'levitate', resize: { dockedEdge: 'block-end', minSize: 100, maxSize: 400 } },
        }
        scaffold.layoutDirective = { preferredHeights: { extra: 220 } }
        setSize(600, 360)
        await scaffold.updateComplete
        scaffold.dragFloatingPaneBy(-100)
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const handle = scaffold.shadowRoot!.querySelector<HTMLElement>('[part=levitated-resize-handle]')!
        const size = () => handle.getAttribute('aria-valuenow')
        expect(size()).toBe('220')
        scaffold.dragFloatingPaneBy(-30)
        scaffold.dragFloatingPaneBy(-20)
        await scaffold.updateComplete
        expect(size()).toBe('270')
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
        await scaffold.updateComplete
        expect(size()).toBe('286')
        scaffold.dragFloatingPaneBy(1000)
        await scaffold.updateComplete
        expect(size()).toBe('100')
        scaffold.dragFloatingPaneBy(-1000)
        await scaffold.updateComplete
        expect(size()).toBe('360')
        expect(() => scaffold.dragFloatingPaneBy(Number.NaN)).toThrow(Error)
    })

    it('animates handle activation and applies incoming drag deltas to the moving size', async () => {
        let next: FrameRequestCallback | undefined
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 1 })
        vi.stubGlobal('cancelAnimationFrame', () => { next = undefined })
        const preference = Object.assign(new EventTarget(), { matches: false })
        vi.stubGlobal('matchMedia', () => preference)
        const scaffold = mount()
        scaffold.animatePanes = true
        scaffold.adaptStrategies = {
            extra: { type: 'levitate', resize: { dockedEdge: 'block-end', minSize: 100, maxSize: 400 } },
        }
        scaffold.layoutDirective = { preferredHeights: { extra: 220 } }
        setSize(600, 360)
        await scaffold.updateComplete
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const handle = scaffold.shadowRoot!.querySelector<HTMLElement>('[part=levitated-resize-handle]')!
        const size = () => Number(handle.getAttribute('aria-valuenow'))
        const activate = () => handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        activate()
        await scaffold.updateComplete
        expect(size()).toBe(220)
        next!(0)
        next!(50)
        await scaffold.updateComplete
        const during = size()
        expect(during).toBeGreaterThan(220)
        expect(during).toBeLessThan(360)
        scaffold.dragFloatingPaneBy(20)
        await scaffold.updateComplete
        expect(size()).toBe(during - 20)
        expect(next).toBeUndefined()

        activate()
        next!(100)
        next!(900)
        await scaffold.updateComplete
        expect(size()).toBe(360)

        activate()
        preference.matches = true
        preference.dispatchEvent(new Event('change'))
        await scaffold.updateComplete
        expect(size()).toBe(100)
        expect(next).toBeUndefined()
        activate()
        await scaffold.updateComplete
        expect(size()).toBe(during - 20)
        expect(next).toBeUndefined()
    })

    it('continues the size cycle from the maximum reached by dragging', async () => {
        const scaffold = mount()
        scaffold.adaptStrategies = {
            extra: { type: 'levitate', resize: { dockedEdge: 'block-end', minSize: 100, maxSize: 400 } },
        }
        scaffold.layoutDirective = { preferredHeights: { extra: 220 } }
        setSize(600, 360)
        await scaffold.updateComplete
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const handle = scaffold.shadowRoot!.querySelector<HTMLElement>('[part=levitated-resize-handle]')!

        scaffold.dragFloatingPaneBy(-200)
        await scaffold.updateComplete
        expect(handle.getAttribute('aria-valuenow')).toBe('360')
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await scaffold.updateComplete
        expect(handle.getAttribute('aria-valuenow')).toBe('100')
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await scaffold.updateComplete
        expect(handle.getAttribute('aria-valuenow')).toBe('360')
    })

    it('cycles a docked floating pane through sizes and remembers its partial size', async () => {
        const scaffold = mount()
        const visual = document.createElement('span')
        visual.slot = 'extra-floating-handle'
        scaffold.append(visual)
        scaffold.adaptStrategies = {
            extra: { type: 'levitate', resize: { dockedEdge: 'block-end', minSize: 100, maxSize: 400 } },
        }
        scaffold.layoutDirective = { preferredHeights: { extra: 220 } }
        setSize(600, 360)
        await scaffold.updateComplete
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const handle = scaffold.shadowRoot!.querySelector<HTMLElement>('[part=levitated-resize-handle]')!
        expect(handle.querySelector('slot')?.assignedElements()).toEqual([visual])
        const key = (value: string) => handle.dispatchEvent(new KeyboardEvent('keydown', { key: value }))
        expect(handle.getAttribute('aria-orientation')).toBe('horizontal')
        expect(handle.getAttribute('aria-valuenow')).toBe('220')
        for (const expected of ['360', '100', '220']) {
            key('Enter')
            await scaffold.updateComplete
            expect(handle.getAttribute('aria-valuenow')).toBe(expected)
        }
        key('ArrowUp')
        await scaffold.updateComplete
        expect(handle.getAttribute('aria-valuenow')).toBe('236')
        scaffold.goBack()
        await scaffold.updateComplete
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('[part=levitated-resize-handle]')!.getAttribute('aria-valuenow')).toBe('236')
    })
    it('projects the active floating pane’s scrim and dismisses it when the scrim is clicked', async () => {
        const scaffold = mount()
        const visual = document.createElement('button')
        visual.slot = 'extra-scrim'
        scaffold.append(visual)
        scaffold.adaptStrategies = { extra: { type: 'levitate', scrim: true } }
        setSize(1000, 500)
        await scaffold.updateComplete
        const root = scaffold.shadowRoot!
        expect(root.querySelector('[part=pane-scrim]')).toBeNull()

        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const scrim = root.querySelector<HTMLElement>('[part=pane-scrim]')!
        const slot = scrim.querySelector('slot')!
        expect(slot.assignedElements()).toEqual([visual])
        expect(slot.closest('[inert]')).not.toBeNull()

        visual.remove()
        expect(slot.assignedElements()).toEqual([])
        scrim.click()
        await scaffold.updateComplete
        expect(scaffold.currentDestination.pane).toBe('list')
        expect(root.querySelector('[part=pane-scrim]')).toBeNull()
    })

    it('reports when a scrim blocks still-visible panes and when they become interactive again', async () => {
        const scaffold = mount()
        scaffold.adaptStrategies = { extra: { type: 'levitate', scrim: true } }
        setWidth(1000)
        await scaffold.updateComplete
        expect(scaffold.isPaneInteractable('list')).toBe(true)
        expect(scaffold.isPaneInteractable('extra')).toBe(false)

        const changed = vi.fn()
        scaffold.addEventListener('pane-layout-change', changed)
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        expect(scaffold.isPaneInteractable('list')).toBe(false)
        expect(scaffold.isPaneInteractable('detail')).toBe(false)
        expect(scaffold.isPaneInteractable('extra')).toBe(true)
        expect(changed.mock.lastCall?.[0].detail).toMatchObject({
            visiblePanes: ['list', 'detail', 'extra'], interactablePanes: ['extra'],
        })

        scaffold.adaptStrategies = { extra: { type: 'levitate', scrim: false } }
        await scaffold.updateComplete
        expect(scaffold.isPaneInteractable('list')).toBe(true)
        expect(changed).toHaveBeenCalledTimes(2)
        expect(changed.mock.lastCall?.[0].detail).toMatchObject({
            visiblePanes: ['list', 'detail', 'extra'], interactablePanes: ['list', 'detail', 'extra'],
        })
    })

    it('levitates the active destination without consuming a partition and closes it with Escape', async () => {
        const scaffold = mount()
        scaffold.adaptStrategies = { extra: { type: 'levitate', alignment: 'block-end-inline-end', scrim: true, label: 'Attachments' } }
        const changed = vi.fn()
        scaffold.addEventListener('pane-layout-change', changed)
        setSize(1200, 500)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        const list = scaffold.querySelector<HTMLButtonElement>('[slot=list]')!
        list.focus()
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        const root = scaffold.shadowRoot!
        const dialog = root.querySelector<HTMLElement>('[role=dialog]')!
        expect(dialog.getAttribute('aria-label')).toBe('Attachments')
        expect(dialog.getAttribute('aria-modal')).toBe('true')
        expect(root.activeElement).toBe(dialog)
        expect(root.querySelector('#pane-list')!.hasAttribute('inert')).toBe(true)
        expect(changed.mock.lastCall?.[0].detail.levitatedPane).toBe('extra')
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await scaffold.updateComplete
        expect(scaffold.currentDestination.pane).toBe('list')
        expect(root.querySelector('[role=dialog]')).toBeNull()
        expect(document.activeElement).toBe(list)
    })
    it('uses AndroidX physical partition order for equal hinges and extra regions in RTL', async () => {
        const scaffold = mount()
        scaffold.dir = 'rtl'
        scaffold.layoutDirective = { excludedBounds: [{ left: 580, right: 620, top: 0, bottom: 500 }] }
        setSize(1200, 500)
        await scaffold.updateComplete
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('0px 580px 40px 278px 24px 278px 0px')
        expect(grid.style.getPropertyValue('--_pane-tracks-rtl')).toBe('0px 278px 24px 278px 40px 580px 0px')

        scaffold.layoutDirective = { excludedBounds: [
            { left: 200, right: 240, top: 0, bottom: 500 },
            { left: 700, right: 750, top: 0, bottom: 500 },
        ] }
        setSize(1100, 500)
        await scaffold.updateComplete
        expect(grid.style.getPropertyValue('--_pane-tracks-rtl')).toBe('400px 460px 40px 200px 0px')
    })

    it('places panes on either side of an exclusion and keeps the divider fixed', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.layoutDirective = { excludedBounds: [{ left: 400, right: 440, top: 0, bottom: 500 }] }
        setSize(1000, 500)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        const root = scaffold.shadowRoot!
        expect(root.querySelector('[role=separator]')).toBeNull()
        const grid = root.querySelector<HTMLElement>('.grid')!
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('0px 400px 40px 560px 0px')
        expect(grid.style.getPropertyValue('--_pane-tracks-rtl')).toBe('0px 560px 40px 400px 0px')

        setSize(1240, 500)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail', 'extra'])
        expect(grid.style.getPropertyValue('--_pane-tracks')).toBe('0px 400px 40px 388px 24px 388px 0px')

        scaffold.layoutDirective = { excludedBounds: [{ left: 0, right: 1240, top: 0, bottom: 500 }] }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual([])
        scaffold.layoutDirective = undefined
        await scaffold.updateComplete
        expect(root.querySelector('[role=separator]')).toBeTruthy()
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail', 'extra'])
    })
    it('reflows the configured pane under its anchor in a tall single-column layout', async () => {
        const scaffold = mount('supporting-pane')
        scaffold.adaptStrategies = { supporting: { type: 'reflow', reflowUnder: 'main' } }
        scaffold.layoutDirective = { verticalPartitionSpacerSize: 32, preferredHeights: { supporting: 260 } }
        const changed = vi.fn()
        scaffold.addEventListener('pane-layout-change', changed)
        setSize(560, 899)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main'])

        setSize(560, 900)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['main', 'supporting'])
        expect(changed.mock.lastCall?.[0].detail.reflowedPane).toEqual({ pane: 'supporting', reflowUnder: 'main' })
        expect(scaffold.shadowRoot!.querySelector<HTMLElement>('[part~="pane-supporting"]')!.dataset.reflowed).toBe('')
        scaffold.navigateTo('supporting')
        expect(scaffold.canGoBack).toBe(false)

        setSize(840, 900)
        await scaffold.updateComplete
        expect(changed.mock.lastCall?.[0].detail.reflowedPane).toBeUndefined()
        expect(visibleSlots(scaffold)).toEqual(['main', 'supporting'])
    })
    it('uses container breakpoints and keeps the destination visible', async () => {
        const scaffold = mount()
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list'])
        for (const [width, slots] of [
            [839, ['list']],
            [840, ['list', 'detail']],
            [1199, ['list', 'detail']],
            [1200, ['list', 'detail', 'extra']],
        ] as const) {
            setWidth(width)
            await scaffold.updateComplete
            expect(visibleSlots(scaffold)).toEqual(slots)
        }
        setWidth(1199)
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'extra'])
        scaffold.ignoreDestinationHistory = true
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['detail', 'extra'])
        scaffold.ignoreDestinationHistory = false
        scaffold.goBack()
        scaffold.navigateTo('detail', 'A')
        scaffold.navigateTo('extra')
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['detail', 'extra'])
        scaffold.querySelector('[slot=extra]')!.remove()
        await vi.waitFor(() => expect(scaffold.currentDestination.pane).toBe('detail'))
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
    })

    it('restores content and focus by history entry', async () => {
        const scaffold = mount()
        scaffold.setAttribute('back-navigation-behavior', 'pop-until-content-change')
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        await scaffold.updateComplete
        const list = scaffold.querySelector('button')!
        list.focus()
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const input = scaffold.querySelector('input')!
        input.focus()
        input.value = 'draft'
        input.blur()
        scaffold.navigateTo('detail', 'B')
        scaffold.navigateTo('detail', 'B')
        await scaffold.updateComplete
        scaffold.goBack()
        await scaffold.updateComplete
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
        expect(document.activeElement).toBe(input)
        expect(input.value).toBe('draft')
        scaffold.goBack()
        await scaffold.updateComplete
        expect(document.activeElement).toBe(list)
        expect(scaffold.canGoBack).toBe(false)
        expect(changed).toHaveBeenCalledTimes(4)
        expect(() => scaffold.goBack()).toThrow(Error)
    })

    it('defaults to the last layout change and recalculates the back target after resizing', async () => {
        const scaffold = mount()
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        scaffold.navigateTo('detail', 'B')
        expect(scaffold.canGoBack).toBe(true)
        setWidth(1200)
        await scaffold.updateComplete
        expect(scaffold.canGoBack).toBe(false)
        setWidth(500)
        await scaffold.updateComplete
        expect(scaffold.canGoBack).toBe(true)
        scaffold.goBack()
        expect(scaffold.currentDestination.pane).toBe('list')
    })

    it('peeks at the previous destination and adapted layout without moving focus or consuming history', async () => {
        const scaffold = mount()
        const changed = vi.fn()
        scaffold.addEventListener('pane-change', changed)
        setWidth(560)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        scaffold.navigateTo('detail', 'B')
        await scaffold.updateComplete
        const active = scaffold.shadowRoot!.activeElement ?? document.activeElement
        expect(scaffold.peekPreviousScaffoldValue()).toMatchObject({
            destination: { pane: 'list' }, expandedPanes: ['list'],
        })
        expect(scaffold.peekPreviousScaffoldValue('pop-until-content-change')).toMatchObject({
            destination: { pane: 'detail', contentKey: 'A' }, expandedPanes: ['detail'],
        })
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'B' })
        expect(scaffold.shadowRoot!.activeElement ?? document.activeElement).toBe(active)
        expect(changed).toHaveBeenCalledTimes(2)
    })

    it('seeks, cancels, and commits a back preview while preview content stays inert', async () => {
        const scaffold = mount()
        setSize(560, 500)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const root = scaffold.shadowRoot!
        const list = root.querySelector<HTMLElement>('#pane-list')!
        const committed = vi.fn()
        scaffold.addEventListener('pane-change', committed)
        scaffold.seekBack(0.65)
        await scaffold.updateComplete
        expect(scaffold.backPreview?.target.destination.pane).toBe('list')
        expect(list.hidden).toBe(false)
        expect(list.hasAttribute('inert')).toBe(true)
        expect(scaffold.isPaneInteractable('list')).toBe(false)
        expect(scaffold.isPaneInteractable('detail')).toBe(true)
        expect(scaffold.currentDestination.contentKey).toBe('A')
        expect(committed).not.toHaveBeenCalled()
        scaffold.seekBack(0)
        await scaffold.updateComplete
        expect(scaffold.backPreview).toBeUndefined()
        expect(list.hidden).toBe(true)
        scaffold.seekBack(1)
        expect(scaffold.currentDestination.contentKey).toBe('A')
        scaffold.goBack()
        await scaffold.updateComplete
        expect(scaffold.backPreview).toBeUndefined()
        expect(list.hasAttribute('inert')).toBe(false)
        expect(committed).toHaveBeenCalledTimes(1)
    })

    it('can skip content changes in the same role or pop just the last entry', async () => {
        const scaffold = mount()
        await scaffold.updateComplete
        setWidth(1200)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        scaffold.navigateTo('detail', 'B')
        scaffold.goBack('pop-latest')
        expect(scaffold.currentDestination).toEqual({ pane: 'detail', contentKey: 'A' })
        scaffold.goBack('pop-until-current-destination-change')
        expect(scaffold.currentDestination.pane).toBe('list')
    })

    it('preserves each layout’s widths across resize and supports RTL keys', async () => {
        const scaffold = mount('supporting-pane')
        scaffold.setAttribute('resizable', '')
        scaffold.style.direction = 'rtl'
        await scaffold.updateComplete
        setWidth(1200)
        await scaffold.updateComplete
        const splitter = () => scaffold.shadowRoot!.querySelector('[role=separator]')!
        const initial = Number(splitter().getAttribute('aria-valuenow'))
        splitter().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
        await scaffold.updateComplete
        const adjusted = Number(splitter().getAttribute('aria-valuenow'))
        expect(adjusted).toBeGreaterThan(initial)
        setWidth(500)
        await scaffold.updateComplete
        expect(splitter()).toBeNull()
        setWidth(1200)
        await scaffold.updateComplete
        expect(Number(splitter().getAttribute('aria-valuenow'))).toBe(adjusted)
    })

    it('reserves inter-pane space and exposes a separator only when resizing is enabled', async () => {
        const scaffold = mount()
        await scaffold.updateComplete
        setWidth(840)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('[role=separator]')).toBeNull()
        scaffold.setAttribute('resizable', '')
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(splitter.getAttribute('aria-valuenow')).toBe('360')
        splitter.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('576')
    })

    it('uses the directive for partition count, preferred widths, spacing and back targets', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.layoutDirective = {
            maxHorizontalPartitions: 2,
            horizontalPartitionSpacerSize: 40,
            defaultPanePreferredWidth: 320,
            preferredWidths: { list: 280 },
        }
        setWidth(760)
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['list', 'detail'])
        const splitter = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(splitter.getAttribute('aria-valuenow')).toBe('280')
        expect(splitter.getAttribute('aria-valuemax')).toBe('480')
        scaffold.navigateTo('detail', 'A')
        expect(scaffold.canGoBack).toBe(false)

        scaffold.layoutDirective = { maxHorizontalPartitions: 1 }
        await scaffold.updateComplete
        expect(visibleSlots(scaffold)).toEqual(['detail'])
        expect(scaffold.canGoBack).toBe(true)
    })

    it('fits an overridden partition count into a narrow container', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.layoutDirective = { maxHorizontalPartitions: 2, horizontalPartitionSpacerSize: 40 }
        setWidth(360)
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(splitter.getAttribute('aria-valuemin')).toBe('160')
        expect(splitter.getAttribute('aria-valuenow')).toBe('160')
        expect(splitter.getAttribute('aria-valuemax')).toBe('160')
    })

    it('collapses either pane at an endpoint and can reopen it with the same handle', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionAnchors = [
            { id: 'detail-only', type: 'proportion', value: 0 },
            { id: 'list-only', type: 'proportion', value: 1 },
        ]
        setWidth(840)
        await scaffold.updateComplete
        const root = scaffold.shadowRoot!
        const splitter = root.querySelector<HTMLElement>('[role=separator]')!
        const list = scaffold.querySelector<HTMLButtonElement>('[slot=list]')!
        list.focus()
        scaffold.snapToExpansionAnchor('detail-only')
        await scaffold.updateComplete
        expect(root.querySelector('#pane-list')!.hasAttribute('inert')).toBe(true)
        expect(root.activeElement).toBe(splitter)
        expect(splitter.getAttribute('aria-valuenow')).toBe('0')
        splitter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        await scaffold.updateComplete
        expect(root.querySelector('#pane-list')!.hasAttribute('inert')).toBe(false)
        expect(splitter.getAttribute('aria-valuenow')).toBe('240')
        scaffold.setFirstPaneProportion(1)
        await scaffold.updateComplete
        expect(root.querySelector('#pane-detail')!.hasAttribute('inert')).toBe(true)
        expect(splitter.getAttribute('aria-valuenow')).toBe('816')
        expect(scaffold.currentDestination.pane).toBe('list')
        expect(scaffold.querySelector('[slot=list]')).toBe(list)
    })

    it('retains an explicit split beneath dragging and anchoring across a saved-state round trip', async () => {
        vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: true }))
        const configure = (scaffold: ReturnType<typeof mount>) => {
            scaffold.resizable = true
            scaffold.expansionAnchors = [{ id: 'wide', type: 'offset-from-start', value: 500 }]
        }
        const scaffold = mount()
        configure(scaffold)
        setWidth(1000)
        await scaffold.updateComplete
        expect(scaffold.isPaneExpansionUnspecified()).toBe(true)
        scaffold.setFirstPaneWidth(400)
        await scaffold.updateComplete
        expect(scaffold.isPaneExpansionUnspecified()).toBe(false)
        scaffold.dragPaneExpansionBy(30)
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.querySelector('[role=separator]')!.getAttribute('aria-valuenow')).toBe('430')
        const requested = { type: 'offset-from-start', value: 400 }
        expect(scaffold.saveState().expansions).toContainEqual(['list-detail:list,detail', requested])
        scaffold.settlePaneExpansion()
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBe('wide')
        const anchored = JSON.parse(JSON.stringify(scaffold.saveState()))
        expect(anchored.expansions).toContainEqual(['list-detail:list,detail', { anchor: 'wide', requested }])

        const restored = mount()
        configure(restored)
        setWidth(1000)
        restored.restoreState(anchored)
        await restored.updateComplete
        expect(restored.currentExpansionAnchor).toBe('wide')
        restored.expansionAnchors = []
        await restored.updateComplete
        const separator = restored.shadowRoot!.querySelector('[role=separator]')!
        expect(separator.getAttribute('aria-valuenow')).toBe('400')
        restored.clearPaneExpansion()
        await restored.updateComplete
        expect(restored.isPaneExpansionUnspecified()).toBe(true)
        expect(separator.getAttribute('aria-valuenow')).toBe('360')
    })

    it('lets a custom drag source resize the active split and settle with the built-in anchors', async () => {
        vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: true }))
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionAnchors = [
            { id: 'narrow', type: 'offset-from-start', value: 300 },
            { id: 'wide', type: 'offset-from-start', value: 500 },
        ]
        const consume = vi.fn((delta: number) => delta / 2)
        scaffold.consumeDragDelta = consume
        setWidth(1000)
        await scaffold.updateComplete
        const separator = scaffold.shadowRoot!.querySelector('[role=separator]')!
        expect(separator.getAttribute('aria-valuenow')).toBe('360')
        scaffold.dragPaneExpansionBy(160)
        await scaffold.updateComplete
        expect(consume).toHaveBeenCalledWith(160)
        expect(separator.getAttribute('aria-valuenow')).toBe('440')
        expect(scaffold.currentExpansionAnchor).toBeUndefined()
        scaffold.settlePaneExpansion()
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBe('wide')
        expect(separator.getAttribute('aria-valuenow')).toBe('500')
        expect(() => scaffold.dragPaneExpansionBy(Infinity)).toThrow(Error)
        setWidth(600)
        await scaffold.updateComplete
        expect(() => scaffold.dragPaneExpansionBy(10)).toThrow(Error)
    })

    it('cycles expansion anchors and resolves absolute and relative positions again after resize', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionAnchors = [
            { id: 'list', type: 'offset-from-start', value: 300 },
            { id: 'equal', type: 'proportion', value: 0.5 },
            { id: 'detail', type: 'offset-from-end', value: 300 },
        ]
        setWidth(840)
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector('[role=separator]')!
        splitter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBe('equal')
        expect(splitter.getAttribute('aria-valuenow')).toBe('408')
        scaffold.snapToExpansionAnchor('detail')
        setWidth(960)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('636')
        expect(() => scaffold.snapToExpansionAnchor('unknown')).toThrow(Error)
        scaffold.setFirstPaneWidth(420)
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBeUndefined()
        expect(splitter.getAttribute('aria-valuenow')).toBe('420')
        scaffold.setFirstPaneProportion(0.5)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('468')
        scaffold.clearPaneExpansion()
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBeUndefined()
        expect(splitter.getAttribute('aria-valuenow')).toBe('360')
    })

    it('applies the initial anchor on the first eligible layout and falls back to it when a saved anchor is removed', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        const initial = { id: 'equal', type: 'proportion', value: 0.5 } as const
        scaffold.expansionAnchors = [initial, { id: 'wide', type: 'offset-from-start', value: 520 }]
        scaffold.initialExpansionAnchor = 'equal'
        setWidth(540)
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBeUndefined()
        setWidth(840)
        await scaffold.updateComplete
        const width = () => scaffold.shadowRoot!.querySelector('[role=separator]')?.getAttribute('aria-valuenow')
        expect(width()).toBe('408')
        expect(scaffold.currentExpansionAnchor).toBe('equal')
        scaffold.snapToExpansionAnchor('wide')
        await scaffold.updateComplete
        expect(width()).toBe('520')
        scaffold.expansionAnchors = [initial]
        await scaffold.updateComplete
        expect(width()).toBe('408')
        expect(scaffold.currentExpansionAnchor).toBe('equal')
    })

    it('shares a split across pane combinations, isolates other keys, and restores both from JSON', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionStateKey = 'mail:reading'
        setWidth(840)
        await scaffold.updateComplete
        scaffold.setFirstPaneWidth(440)
        await scaffold.updateComplete
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        scaffold.navigateTo('extra', 'A')
        await scaffold.updateComplete
        const width = (element: typeof scaffold) => element.shadowRoot!.querySelector('[role=separator]')?.getAttribute('aria-valuenow')
        expect(visibleSlots(scaffold)).toEqual(['detail', 'extra'])
        expect(width(scaffold)).toBe('440')
        scaffold.expansionStateKey = 'mail:composition'
        await scaffold.updateComplete
        scaffold.setFirstPaneWidth(392)
        await scaffold.updateComplete
        scaffold.shadowRoot!.querySelector('[role=separator]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        await scaffold.updateComplete

        const restored = mount()
        restored.resizable = true
        restored.expansionStateKey = 'mail:reading'
        restored.restoreState(JSON.parse(JSON.stringify(scaffold.saveState())))
        setWidth(840)
        await restored.updateComplete
        expect(visibleSlots(restored)).toEqual(['detail', 'extra'])
        expect(width(restored)).toBe('440')
        restored.expansionStateKey = 'mail:composition'
        await restored.updateComplete
        expect(width(restored)).toBe('408')
        restored.expansionStateKey = 'mail:reading'
        await restored.updateComplete
        expect(width(restored)).toBe('440')
    })

    it('animates to an expansion anchor and resolves when the divider spring finishes', async () => {
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionAnchors = [{ id: 'wide', type: 'offset-from-start', value: 460 }]
        setWidth(840)
        await scaffold.updateComplete
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        const completion = Promise.withResolvers<void>()
        const effect = { finished: completion.promise, cancel: vi.fn() }
        const animate = vi.fn(() => effect)
        grid.animate = animate as unknown as typeof grid.animate
        const finished = vi.fn()
        const animation = scaffold.animateToExpansionAnchor('wide', 500).then(finished)
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBe('wide')
        expect(animate.mock.calls).toHaveLength(1)
        expect(finished).not.toHaveBeenCalled()
        completion.resolve()
        await animation
        expect(finished).toHaveBeenCalledOnce()
        expect(grid.querySelector('[role=separator]')?.getAttribute('aria-valuenow')).toBe('460')
    })

    it('applies the requested anchor without animating when reduced motion is enabled', async () => {
        const preference = Object.assign(new EventTarget(), { matches: true })
        const query = vi.spyOn(window, 'matchMedia').mockReturnValue(preference as MediaQueryList)
        try {
            const scaffold = mount()
            scaffold.resizable = true
            scaffold.expansionAnchors = [{ id: 'wide', type: 'offset-from-start', value: 460 }]
            setWidth(840)
            await scaffold.updateComplete
            const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
            const animate = vi.spyOn(grid, 'animate')
            await scaffold.animateToExpansionAnchor('wide', 500)
            expect(animate).not.toHaveBeenCalled()
            expect(scaffold.currentExpansionAnchor).toBe('wide')
            expect(grid.querySelector('[role=separator]')?.getAttribute('aria-valuenow')).toBe('460')
        } finally {
            query.mockRestore()
        }
    })

    it.each([
        { direction: 'ltr', moveAt: 10, releaseAt: 20, expected: 'wide', width: '460' },
        { direction: 'ltr', moveAt: 150, releaseAt: 160, expected: 'narrow', width: '300' },
        { direction: 'ltr', moveAt: 10, releaseAt: 180, expected: 'narrow', width: '300' },
        { direction: 'rtl', moveAt: 10, releaseAt: 20, expected: 'wide', width: '460' },
        { direction: 'ltr', moveAt: 10, releaseAt: 20, expected: 'narrow', width: '300', noMomentum: true },
        { direction: 'ltr', moveAt: 10, releaseAt: 20, expected: 'wide', width: '460', customPath: true },
    ])('settles a $direction drag released at $releaseAt ms after movement at $moveAt ms to $expected', async ({
        direction, moveAt, releaseAt, expected, width, noMomentum, customPath,
    }) => {
        const scaffold = mount()
        scaffold.style.direction = direction
        scaffold.resizable = true
        if (noMomentum) scaffold.expansionFling = ({ position }) => ({ position, velocity: 0 })
        if (customPath) {
            scaffold.expansionFling = ({ startPosition }) => ({
                position: 540, velocity: 0,
                trajectory: { duration: 200, positionAt: elapsed => startPosition + (540 - startPosition) * (elapsed / 200) ** 2 },
            })
        }
        scaffold.expansionAnchors = [
            { id: 'narrow', type: 'offset-from-start', value: 300 },
            { id: 'wide', type: 'offset-from-start', value: 460 },
        ]
        setWidth(840)
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector<HTMLElement>('[role=separator]')!
        splitter.setPointerCapture = () => {}
        splitter.hasPointerCapture = () => false
        const dispatch = (type: string, clientX: number, timeStamp: number) => {
            const event = new PointerEvent(type, { pointerId: 1, button: 0, isPrimary: true, clientX })
            Object.defineProperty(event, 'timeStamp', { value: timeStamp })
            splitter.dispatchEvent(event)
        }
        const start = 400
        const release = start + (direction === 'rtl' ? -12 : 12)
        dispatch('pointerdown', start, 0)
        dispatch('pointermove', release, moveAt)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('372')
        const grid = scaffold.shadowRoot!.querySelector<HTMLElement>('.grid')!
        const animate = vi.spyOn(grid, 'animate')
        dispatch('pointerup', release, releaseAt)
        await scaffold.updateComplete
        expect(scaffold.currentExpansionAnchor).toBe(expected)
        expect(splitter.getAttribute('aria-valuenow')).toBe(width)
        if (expected === 'wide') {
            const [keyframes, options] = animate.mock.calls[0]
            const frames = keyframes as Keyframe[]
            const positions = frames.map(frame => Number.parseFloat(String(frame.gridTemplateColumns)))
            expect(positions[0]).toBe(372)
            expect(Math.max(...positions)).toBeGreaterThan(510)
            expect(positions.at(-1)).toBe(460)
            if (customPath) {
                const duration = Number((options as KeyframeAnimationOptions).duration)
                const widthAt = (time: number) => positions[frames.findIndex(frame => Math.abs(frame.offset! * duration - time) < 0.01)]
                expect(widthAt(100)).toBeCloseTo(414)
                expect(widthAt(200)).toBe(540)
            }
        }
    })

    it.each(['ltr', 'rtl'])('shares %s pointer deltas and passes only the remainder into the release', async direction => {
        const scaffold = mount()
        scaffold.style.direction = direction
        scaffold.resizable = true
        scaffold.expansionAnchors = [{ id: 'wide', type: 'offset-from-start', value: 460 }]
        const consume = vi.fn<(delta: number) => number>().mockReturnValue(0)
        const release = vi.fn(() => ({ position: 460, velocity: 0 }))
        scaffold.consumeDragDelta = consume
        scaffold.expansionFling = release
        setWidth(840)
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector<HTMLElement>('[role=separator]')!
        splitter.setPointerCapture = () => {}
        splitter.hasPointerCapture = () => false
        const dispatch = (type: string, distance: number, timeStamp: number) => {
            const clientX = 400 + (direction === 'rtl' ? -distance : distance)
            const event = new PointerEvent(type, { pointerId: 1, button: 0, isPrimary: true, clientX })
            Object.defineProperty(event, 'timeStamp', { value: timeStamp })
            splitter.dispatchEvent(event)
        }
        dispatch('pointerdown', 0, 0)
        dispatch('pointermove', 20, 10)
        dispatch('pointerup', 20, 20)
        await scaffold.updateComplete
        expect(consume).toHaveBeenCalledExactlyOnceWith(20)
        expect(release).not.toHaveBeenCalled()
        expect(scaffold.currentExpansionAnchor).toBeUndefined()
        expect(splitter.getAttribute('aria-valuenow')).toBe('360')
        consume.mockClear().mockReturnValueOnce(0).mockImplementation(delta => delta / 2)

        dispatch('pointerdown', 0, 0)
        dispatch('pointermove', 20, 10)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('360')
        dispatch('pointermove', 40, 20)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('370')
        dispatch('pointerup', 50, 30)
        await scaffold.updateComplete
        expect(consume.mock.calls).toEqual([[20], [20], [10]])
        expect(release).toHaveBeenCalledWith(expect.objectContaining({ position: 375, startPosition: 375, velocity: 500 }))
        expect(scaffold.currentExpansionAnchor).toBe('wide')
    })

    it.each([
        { outcome: 'settles at an anchor from the actual width', interrupt: false },
        { outcome: 'stops when the width is set directly', interrupt: true },
    ])('shares inertia frame by frame and $outcome', async ({ interrupt }) => {
        const frames = new Map<number, FrameRequestCallback>()
        let serial = 0
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            frames.set(++serial, callback)
            return serial
        })
        vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames.delete(id) })
        const tick = (time: number) => {
            const pending = [...frames.values()]
            frames.clear()
            pending.forEach(callback => callback(time))
        }
        const scaffold = mount()
        scaffold.resizable = true
        scaffold.expansionAnchors = [
            { id: 'near', type: 'offset-from-start', value: 400 },
            { id: 'far', type: 'offset-from-start', value: 520 },
        ]
        scaffold.consumeDragDelta = vi.fn((delta: number) => delta / 4).mockImplementationOnce(delta => delta)
        scaffold.expansionFling = ({ startPosition }) => ({
            position: startPosition + 160, velocity: 0,
            trajectory: { duration: 100, positionAt: elapsed => startPosition + 1.6 * elapsed },
        })
        setWidth(840)
        await scaffold.updateComplete
        const splitter = scaffold.shadowRoot!.querySelector<HTMLElement>('[role=separator]')!
        splitter.setPointerCapture = () => {}
        splitter.hasPointerCapture = () => false
        const dispatch = (type: string, clientX: number, timeStamp: number) => {
            const event = new PointerEvent(type, { pointerId: 1, button: 0, isPrimary: true, clientX })
            Object.defineProperty(event, 'timeStamp', { value: timeStamp })
            splitter.dispatchEvent(event)
        }
        dispatch('pointerdown', 400, 0)
        dispatch('pointermove', 412, 10)
        await scaffold.updateComplete
        dispatch('pointerup', 412, 20)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('372')
        expect(scaffold.consumeDragDelta).toHaveBeenCalledTimes(1)
        tick(0)
        tick(50)
        await scaffold.updateComplete
        expect(splitter.getAttribute('aria-valuenow')).toBe('392')
        expect(scaffold.consumeDragDelta).toHaveBeenLastCalledWith(80)
        if (interrupt) {
            scaffold.setFirstPaneWidth(430)
            await scaffold.updateComplete
            tick(100)
            await scaffold.updateComplete
            expect(scaffold.consumeDragDelta).toHaveBeenCalledTimes(2)
            expect(scaffold.currentExpansionAnchor).toBeUndefined()
            expect(splitter.getAttribute('aria-valuenow')).toBe('430')
            expect(frames.size).toBe(0)
            return
        }
        tick(100)
        await scaffold.updateComplete
        expect(scaffold.consumeDragDelta).toHaveBeenCalledTimes(3)
        expect(scaffold.currentExpansionAnchor).toBe('near')
        expect(splitter.getAttribute('aria-valuenow')).toBe('400')
        expect(frames.size).toBe(0)
    })

    it('falls back to the pane when the saved focus target disappears', async () => {
        const scaffold = mount()
        scaffold.setAttribute('back-navigation-behavior', 'pop-until-content-change')
        scaffold.querySelector('[slot=extra]')!.remove()
        await scaffold.updateComplete
        expect(() => scaffold.navigateTo('extra')).toThrow(Error)
        scaffold.navigateTo('detail', 'A')
        await scaffold.updateComplete
        const detail = scaffold.querySelector('input')!
        detail.focus()
        scaffold.navigateTo('detail', 'B')
        const replacement = document.createElement('button')
        replacement.slot = 'detail'
        detail.replaceWith(replacement)
        scaffold.goBack()
        await scaffold.updateComplete
        expect(scaffold.shadowRoot!.activeElement?.id).toBe('pane-detail')

        scaffold.pattern = 'supporting-pane'
        await scaffold.updateComplete
        expect(scaffold.currentDestination).toEqual({ pane: 'main', contentKey: undefined })
        expect(scaffold.canGoBack).toBe(false)
        expect(visibleSlots(scaffold)).toEqual(['main'])
    })
})
