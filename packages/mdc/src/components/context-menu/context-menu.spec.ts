// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it } from 'vitest'
import { MDCContextMenu } from './context-menu'
import {
    ContextMenuClosedEvent,
    ContextMenuEntryTypes,
    ContextMenuOpenedEvent,
    ContextMenuSelectEvent,
    ContextMenuTriggerModes,
    ContextMenuTriggerSources,
    type ContextMenuEntry,
    type IMDCContextMenuLifecycleDetail,
    type IMDCContextMenuSelectDetail,
} from './context-menu.interface'
import {
    findEntryById,
    findEntryIndexByTypeahead,
    resolveNextEntryIndex,
    toggleContextMenuEntry,
} from './internal/context-menu-state'

const SampleItems: ReadonlyArray<ContextMenuEntry> = [
    { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
    { id: 'disabled', label: 'Disabled Action', disabled: true },
    { id: 'div-1', type: ContextMenuEntryTypes.Divider },
    { id: 'lbl-1', type: ContextMenuEntryTypes.Label, label: 'View' },
    { id: 'wrap', type: ContextMenuEntryTypes.Checkbox, label: 'Word Wrap', checked: false },
    { id: 'sort-name', type: ContextMenuEntryTypes.Radio, label: 'Sort by Name', checked: true, group: 'sort' },
    { id: 'sort-date', type: ContextMenuEntryTypes.Radio, label: 'Sort by Date', checked: false, group: 'sort' },
    {
        id: 'more',
        type: ContextMenuEntryTypes.Submenu,
        label: 'More',
        children: [
            { id: 'sub-opt', type: ContextMenuEntryTypes.Checkbox, label: 'Nested Check', checked: false },
        ],
    },
]

describe('ContextMenu pure state helpers', () => {
    it('navigates across interactive entries while skipping disabled, divider, and label rows', () => {
        expect(resolveNextEntryIndex('first', -1)(SampleItems)).toBe(0)
        expect(resolveNextEntryIndex('next', 0)(SampleItems)).toBe(4)
        expect(resolveNextEntryIndex('previous', 4)(SampleItems)).toBe(0)
        expect(resolveNextEntryIndex('previous', 0)(SampleItems)).toBe(7)
        expect(resolveNextEntryIndex('last', 0)(SampleItems)).toBe(7)
        expect(resolveNextEntryIndex('next', -1)([{ type: ContextMenuEntryTypes.Divider }])).toBe(-1)
    })

    it('finds interactive entries by typeahead prefix and wraps around', () => {
        expect(findEntryIndexByTypeahead('w', 0)(SampleItems)).toBe(4)
        expect(findEntryIndexByTypeahead('s', 4)(SampleItems)).toBe(5)
        expect(findEntryIndexByTypeahead('c', 5)(SampleItems)).toBe(0)
        expect(findEntryIndexByTypeahead('zzz', 0)(SampleItems)).toBe(-1)
    })

    it('immutably toggles checkboxes and enforces radio group exclusivity', () => {
        const afterCheckbox = toggleContextMenuEntry('wrap')(SampleItems)
        const wrapAfter = findEntryById('wrap')(afterCheckbox)
        expect(wrapAfter?.type).toBe(ContextMenuEntryTypes.Checkbox)
        if (wrapAfter?.type === ContextMenuEntryTypes.Checkbox) {
            expect(wrapAfter.checked).toBe(true)
        }
        // Original array remains unchanged
        const wrapBefore = findEntryById('wrap')(SampleItems)
        if (wrapBefore?.type === ContextMenuEntryTypes.Checkbox) {
            expect(wrapBefore.checked).toBe(false)
        }

        const afterRadio = toggleContextMenuEntry('sort-date')(afterCheckbox)
        const sortName = findEntryById('sort-name')(afterRadio)
        const sortDate = findEntryById('sort-date')(afterRadio)
        if (sortName?.type === ContextMenuEntryTypes.Radio && sortDate?.type === ContextMenuEntryTypes.Radio) {
            expect(sortName.checked).toBe(false)
            expect(sortDate.checked).toBe(true)
        }

        const afterNested = toggleContextMenuEntry('sub-opt')(afterRadio)
        const nested = findEntryById('sub-opt')(afterNested)
        if (nested?.type === ContextMenuEntryTypes.Checkbox) {
            expect(nested.checked).toBe(true)
        }
    })
})

describe('MDCContextMenu', () => {
    const mounted: HTMLElement[] = []

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.remove()
        }
    })

    const createMenu = async (configure?: (el: MDCContextMenu) => void): Promise<MDCContextMenu> => {
        const el = document.createElement('mdc-context-menu') as MDCContextMenu
        el.quick = true
        el.items = SampleItems
        el.innerHTML = `<div class="region">Right click or long-press here</div>`
        configure?.(el)
        document.body.appendChild(el)
        mounted.push(el)
        await el.updateComplete
        return el
    }

    it('opens at pointer coordinates on right-click (contextmenu)', async () => {
        const el = await createMenu()
        let detail: IMDCContextMenuLifecycleDetail | undefined
        el.addEventListener(ContextMenuOpenedEvent, (e) => {
            detail = (e as CustomEvent<IMDCContextMenuLifecycleDetail>).detail
        })

        const region = el.querySelector<HTMLElement>('.region')!
        region.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 180,
            clientY: 260,
        }))
        await new Promise((r) => setTimeout(r, 20))

        expect(el.open).toBe(true)
        expect(detail?.source).toBe(ContextMenuTriggerSources.ContextMenu)
        expect(detail?.x).toBe(180)
        expect(detail?.y).toBe(260)
    })

    it('opens on Android-style touch long-press and cancels when moved beyond touch slop', async () => {
        const el = await createMenu((m) => {
            m.longPressDelay = 40
        })
        let openedSource: string | undefined
        el.addEventListener(ContextMenuOpenedEvent, (e) => {
            openedSource = (e as CustomEvent<IMDCContextMenuLifecycleDetail>).detail.source
        })

        const region = el.querySelector<HTMLElement>('.region')!

        // Cancelled by touch slop movement (> 8px)
        region.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 1,
            pointerType: 'touch',
            clientX: 50,
            clientY: 50,
        }))
        expect(el.pressing).toBe(true)
        region.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true,
            pointerId: 1,
            pointerType: 'touch',
            clientX: 70,
            clientY: 50,
        }))
        expect(el.pressing).toBe(false)
        await new Promise((r) => setTimeout(r, 60))
        expect(el.open).toBe(false)

        // Successful long-press
        region.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 2,
            pointerType: 'touch',
            clientX: 90,
            clientY: 110,
        }))
        expect(el.pressing).toBe(true)
        await new Promise((r) => setTimeout(r, 70))
        expect(el.pressing).toBe(false)
        expect(el.open).toBe(true)
        expect(openedSource).toBe(ContextMenuTriggerSources.LongPress)
    })

    it('opens on Shift+F10 keyboard trigger', async () => {
        const el = await createMenu()
        let openedSource: string | undefined
        el.addEventListener(ContextMenuOpenedEvent, (e) => {
            openedSource = (e as CustomEvent<IMDCContextMenuLifecycleDetail>).detail.source
        })

        const region = el.querySelector<HTMLElement>('.region')!
        region.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'F10',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        }))
        await new Promise((r) => setTimeout(r, 20))

        expect(el.open).toBe(true)
        expect(openedSource).toBe(ContextMenuTriggerSources.Keyboard)
    })

    it('enforces global exclusivity (opening one context menu closes another)', async () => {
        const first = await createMenu()
        const second = await createMenu()

        let firstClosed = false
        first.addEventListener(ContextMenuClosedEvent, () => {
            firstClosed = true
        })

        await first.showAt(40, 40)
        expect(first.open).toBe(true)

        await second.showAt(120, 120)
        expect(second.open).toBe(true)
        expect(first.open).toBe(false)
        expect(firstClosed).toBe(true)
    })

    it('keeps menu open on checkbox/radio selection and closes on regular item selection', async () => {
        const el = await createMenu((m) => {
            m.trigger = ContextMenuTriggerModes.Manual
        })
        const selectedIds: string[] = []
        el.addEventListener(ContextMenuSelectEvent, (e) => {
            selectedIds.push((e as CustomEvent<IMDCContextMenuSelectDetail>).detail.item.id)
        })

        await el.showAt(100, 100)
        const checkboxBtn = el.shadowRoot?.querySelector<HTMLButtonElement>('[data-entry-id="wrap"]')!
        checkboxBtn.click()
        await el.updateComplete
        expect(el.open).toBe(true)
        expect(checkboxBtn.getAttribute('aria-checked')).toBe('true')

        const cutBtn = el.shadowRoot?.querySelector<HTMLButtonElement>('[data-entry-id="cut"]')!
        cutBtn.click()
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
        expect(selectedIds).toEqual(['wrap', 'cut'])
    })

    it('supports keyboard ArrowDown / ArrowRight submenu expansion and Escape dismiss', async () => {
        const el = await createMenu()
        await el.showAt(100, 100)
        const surface = el.shadowRoot?.querySelector<HTMLElement>('.surface')!

        surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
        await el.updateComplete
        surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        await el.updateComplete

        const submenu = el.shadowRoot?.querySelector('.submenu-surface')
        expect(submenu).not.toBeNull()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
    })
})
