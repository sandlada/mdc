/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Queries interactive focusable items assigned to a toolbar's slots.
 */
export function getToolbarInteractiveItems(host: HTMLElement): HTMLElement[] {
    const items: HTMLElement[] = []
    for (const child of Array.from(host.children)) {
        if (!(child instanceof HTMLElement)) continue
        const slot = child.getAttribute('slot')
        if (slot && slot !== 'leading' && slot !== 'trailing') continue
        if (child.hasAttribute('hidden') || child.matches('mdc-divider, [role="separator"]')) continue
        items.push(child)
    }
    return items
}

function isItemDisabled(item: HTMLElement): boolean {
    const el = item as HTMLElement & { disabled?: boolean }
    return Boolean(el.disabled || item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true')
}

/**
 * Synchronizes roving tabindex across toolbar items so the first enabled item
 * (or currently focused item) is reachable via Tab.
 */
export function updateToolbarRovingTabindex(items: HTMLElement[]): void {
    const enabled = items.filter((item) => !isItemDisabled(item))
    if (enabled.length === 0) return
    const current = enabled.find((item) => item.tabIndex === 0) ?? enabled[0]
    for (const item of items) {
        item.tabIndex = item === current ? 0 : -1
    }
}

/**
 * Handles ArrowLeft/ArrowRight (horizontal) or ArrowUp/ArrowDown (vertical),
 * plus Home/End keyboard navigation inside a `role="toolbar"` container.
 */
export function handleToolbarKeyDown(
    e: KeyboardEvent,
    host: HTMLElement,
    orientation: 'horizontal' | 'vertical',
): void {
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

    if (![prevKey, nextKey, 'Home', 'End'].includes(e.key)) return

    const enabled = getToolbarInteractiveItems(host).filter((item) => !isItemDisabled(item))
    if (enabled.length === 0) return

    const path = e.composedPath?.() ?? []
    const currentIndex = enabled.findIndex((item) => path.includes(item) || item === e.target)
    if (currentIndex < 0) return

    e.preventDefault()

    let nextItem: HTMLElement | undefined
    switch (e.key) {
        case prevKey:
            nextItem = enabled[(currentIndex - 1 + enabled.length) % enabled.length]
            break
        case nextKey:
            nextItem = enabled[(currentIndex + 1) % enabled.length]
            break
        case 'Home':
            nextItem = enabled[0]
            break
        case 'End':
            nextItem = enabled[enabled.length - 1]
            break
    }

    if (nextItem) {
        for (const item of enabled) {
            item.tabIndex = item === nextItem ? 0 : -1
        }
        if (nextItem.shadowRoot && !nextItem.shadowRoot.delegatesFocus) {
            const inner = nextItem.shadowRoot.querySelector<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            )
            if (inner) {
                inner.focus()
                return
            }
        }
        nextItem.focus()
    }
}
