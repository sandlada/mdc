/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { BaseMenuItem } from './base-menu-item'

class TestMenuItem extends BaseMenuItem {}

const makeItem = (): TestMenuItem => new TestMenuItem()

const willUpdate = (item: TestMenuItem): void => {
    ;(item as unknown as { willUpdate(m: Map<unknown, unknown>): void }).willUpdate(new Map())
}

const activate = (item: TestMenuItem): { prevented: boolean } => {
    const event = new Event('click', { bubbles: true, cancelable: true })
    ;(item as unknown as { handleActivation(e: Event): void }).handleActivation(event)
    return { prevented: event.defaultPrevented }
}

const pressKey = (item: TestMenuItem, target: 'keydown' | 'keyup', key: string): { prevented: boolean } => {
    let prevented = false
    const event = { key, preventDefault: (): void => { prevented = true } } as unknown as KeyboardEvent
    ;(item as unknown as Record<string, (e: KeyboardEvent) => void>)[target === 'keydown' ? 'handleKeydown' : 'handleKeyup'](event)
    return { prevented }
}

const renderValues = (item: TestMenuItem): unknown[] => {
    const result = (item as unknown as { render(): { values: unknown[] } }).render()
    return result.values
}

const listen = (item: TestMenuItem): { request: Event[]; activated: Event[] } => {
    const request: Event[] = []
    const activated: Event[] = []
    item.addEventListener('request-activation', (e) => request.push(e))
    item.addEventListener('item-activated', (e) => activated.push(e))
    return { request, activated }
}

describe('BaseMenuItem defaults', () => {
    it('has button tri-state defaults with roving tabindex support', () => {
        const item = makeItem()
        expect(item.type).toBe('button')
        expect(item.disabled).toBe(false)
        expect(item.href).toBe('')
        expect(item.target).toBe('')
        expect(item.selected).toBe(false)
        expect(item.checkable).toBe(false)
        expect(item.radio).toBe(false)
        expect(item.value).toBe('')
        expect(item.shortcut).toBe(null)
        expect(item.badge).toBe(null)
        expect(item.listTabIndex).toBe(0)
        expect(item.variant).toBe('standard')
        expect(item.isInteractive).toBe(true)
        expect(item.isDisabled).toBe(false)
        expect(item.itemRole).toBe('menuitem')
    })

    it('exposes text as non-interactive', () => {
        const item = makeItem()
        item.type = 'text'
        expect(item.isInteractive).toBe(false)
    })
})

describe('BaseMenuItem disabled semantics (links never disabled)', () => {
    it('button with disabled is disabled', () => {
        const item = makeItem()
        item.disabled = true
        expect(item.isDisabled).toBe(true)
    })

    it('link with disabled is never disabled', () => {
        const item = makeItem()
        item.type = 'link'
        item.href = 'https://example.com'
        item.disabled = true
        willUpdate(item)
        expect(item.type).toBe('link')
        expect(item.isDisabled).toBe(false)
    })
})

describe('BaseMenuItem href forces link', () => {
    it('forces type to link when href is set', () => {
        const item = makeItem()
        item.type = 'button'
        item.href = 'https://example.com'
        willUpdate(item)
        expect(item.type).toBe('link')
    })

    it('keeps an explicit link type', () => {
        const item = makeItem()
        item.type = 'link'
        item.href = 'https://example.com'
        willUpdate(item)
        expect(item.type).toBe('link')
    })
})

describe('BaseMenuItem illegal inputs throw', () => {
    it('throws on unsupported type', () => {
        const item = makeItem()
        item.type = 'invalid' as unknown as typeof item.type
        expect(() => willUpdate(item)).toThrowError(/Unsupported type/)
    })

    it('throws on unsupported variant', () => {
        const item = makeItem()
        item.variant = 'invalid' as unknown as typeof item.variant
        expect(() => willUpdate(item)).toThrowError(/Unsupported variant/)
    })
})

describe('BaseMenuItem roles (checkable / radio)', () => {
    it('maps checkable to menuitemcheckbox', () => {
        const item = makeItem()
        item.checkable = true
        expect(item.itemRole).toBe('menuitemcheckbox')
    })

    it('maps radio to menuitemradio', () => {
        const item = makeItem()
        item.radio = true
        expect(item.itemRole).toBe('menuitemradio')
    })

    it('renders aria-checked for checkable selection', () => {
        const item = makeItem()
        item.checkable = true
        item.selected = true
        const values = renderValues(item)
        expect(values).toContain('menuitemcheckbox')
        expect(values).toContain('true')
    })

    it('renders aria-checked false for unselected radio', () => {
        const item = makeItem()
        item.radio = true
        item.selected = false
        const values = renderValues(item)
        expect(values).toContain('menuitemradio')
        expect(values).toContain('false')
    })

    it('renders aria-selected for plain selection', () => {
        const item = makeItem()
        item.selected = true
        const values = renderValues(item)
        expect(values).toContain('menuitem')
        expect(values).toContain('true')
    })

    it('renders aria-disabled when disabled', () => {
        const item = makeItem()
        item.disabled = true
        const values = renderValues(item)
        expect(values).toContain('true')
    })

    it('renders aria-keyshortcuts from shortcut', () => {
        const item = makeItem()
        item.shortcut = 'Control+K'
        const values = renderValues(item)
        expect(values).toContain('Control+K')
    })

    it('carries listTabIndex into the interactive tabindex', () => {
        const item = makeItem()
        item.listTabIndex = 7
        expect(renderValues(item)).toContain(7)
        item.disabled = true
        const blocked = renderValues(item)
        expect(blocked).not.toContain(7)
        expect(blocked).toContain(-1)
    })
})

describe('BaseMenuItem activation events', () => {
    it('dispatches composed request-activation + item-activated on click', () => {
        const item = makeItem()
        const { request, activated } = listen(item)
        const { prevented } = activate(item)
        expect(prevented).toBe(false)
        expect(request).toHaveLength(1)
        expect(activated).toHaveLength(1)
        expect((request[0] as CustomEvent).detail.item).toBe(item)
        expect((activated[0] as CustomEvent).detail.item).toBe(item)
        expect(request[0].bubbles).toBe(true)
        expect(request[0].composed).toBe(true)
        expect(activated[0].bubbles).toBe(true)
        expect(activated[0].composed).toBe(true)
    })

    it('emits the selection value with item-activated (legacy parity)', () => {
        const item = makeItem()
        item.value = 'save'
        const { request, activated } = listen(item)
        const { prevented } = activate(item)
        expect(prevented).toBe(false)
        expect(request).toHaveLength(1)
        expect(activated).toHaveLength(1)
        expect((request[0] as CustomEvent).detail.item).toBe(item)
        expect((activated[0] as CustomEvent).detail.item).toBe(item)
        expect((activated[0] as CustomEvent).detail.value).toBe('save')
        expect('value' in ((request[0] as CustomEvent).detail as Record<string, unknown>)).toBe(false)
    })

    it('blocks activation when disabled', () => {
        const item = makeItem()
        item.disabled = true
        const { request, activated } = listen(item)
        const { prevented } = activate(item)
        expect(prevented).toBe(true)
        expect(request).toHaveLength(0)
        expect(activated).toHaveLength(0)
    })

    it('never blocks links for disabled (links are never disabled)', () => {
        const item = makeItem()
        item.href = 'https://example.com'
        item.disabled = true
        willUpdate(item)
        const { request, activated } = listen(item)
        const { prevented } = activate(item)
        expect(prevented).toBe(false)
        expect(request).toHaveLength(1)
        expect(activated).toHaveLength(1)
    })

    it('ignores activation for text items', () => {
        const item = makeItem()
        item.type = 'text'
        const { request, activated } = listen(item)
        activate(item)
        expect(request).toHaveLength(0)
        expect(activated).toHaveLength(0)
    })
})

describe('BaseMenuItem keyboard Enter / Space', () => {
    it('activates a button on Enter keydown', () => {
        const item = makeItem()
        const { request, activated } = listen(item)
        const { prevented } = pressKey(item, 'keydown', 'Enter')
        expect(prevented).toBe(true)
        expect(request).toHaveLength(1)
        expect(activated).toHaveLength(1)
    })

    it('activates a button on Space keyup', () => {
        const item = makeItem()
        const { request, activated } = listen(item)
        const down = pressKey(item, 'keydown', ' ')
        expect(down.prevented).toBe(true)
        expect(request).toHaveLength(0)
        const up = pressKey(item, 'keyup', ' ')
        expect(up.prevented).toBe(true)
        expect(request).toHaveLength(1)
        expect(activated).toHaveLength(1)
    })

    it('blocks keyboard activation when disabled', () => {
        const item = makeItem()
        item.disabled = true
        const { request, activated } = listen(item)
        pressKey(item, 'keydown', 'Enter')
        pressKey(item, 'keyup', ' ')
        expect(request).toHaveLength(0)
        expect(activated).toHaveLength(0)
    })

    it('leaves links to native Enter-to-click (no double dispatch)', () => {
        const item = makeItem()
        item.href = 'https://example.com'
        willUpdate(item)
        const { request, activated } = listen(item)
        pressKey(item, 'keydown', 'Enter')
        pressKey(item, 'keyup', ' ')
        expect(request).toHaveLength(0)
        expect(activated).toHaveLength(0)
    })

    it('ignores keyboard for text items', () => {
        const item = makeItem()
        item.type = 'text'
        const { request, activated } = listen(item)
        pressKey(item, 'keydown', 'Enter')
        pressKey(item, 'keyup', ' ')
        expect(request).toHaveLength(0)
        expect(activated).toHaveLength(0)
    })
})

describe('BaseMenuItem value / badge', () => {
    it('keeps value and badge properties', () => {
        const item = makeItem()
        item.value = 'save'
        item.badge = 3
        expect(item.value).toBe('save')
        expect(item.badge).toBe(3)
    })

    it('reflects state in host and render classes', () => {
        const item = makeItem()
        item.selected = true
        const host = (item as unknown as { getHostClasses(): Record<string, boolean> }).getHostClasses()
        const render = (item as unknown as { getRenderClasses(): Record<string, boolean> }).getRenderClasses()
        expect(host['selected']).toBe(true)
        expect(render['selected']).toBe(true)
        expect(render['container']).toBe(true)
    })
})
