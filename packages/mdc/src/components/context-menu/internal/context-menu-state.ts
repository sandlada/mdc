/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure, framework-agnostic state & data operations for Context Menu.
 * Uses Data-Last / Currying style per project conventions.
 */
import {
    ContextMenuEntryTypes,
    type ContextMenuEntry,
    type ContextMenuInteractiveEntry,
} from '../context-menu.interface'

/**
 * Type guard checking whether an entry is interactive (focusable / activatable).
 */
export const isInteractiveEntry = (entry: ContextMenuEntry): entry is ContextMenuInteractiveEntry => {
    if (entry.type === ContextMenuEntryTypes.Divider || entry.type === ContextMenuEntryTypes.Label) {
        return false
    }
    return !entry.disabled
}

/**
 * Returns all enabled interactive entries in top-level order.
 */
export const getInteractiveEntries = (entries: ReadonlyArray<ContextMenuEntry>): ContextMenuInteractiveEntry[] =>
    entries.filter(isInteractiveEntry)

/**
 * Resolves the next focusable index in `entries` given a navigation direction.
 * Wraps around at boundaries. Returns `-1` when no interactive entries exist.
 */
export const resolveNextEntryIndex = (
    direction: 'next' | 'previous' | 'first' | 'last',
    currentIndex: number,
) => (entries: ReadonlyArray<ContextMenuEntry>): number => {
    const interactiveIndices: number[] = []
    for (let i = 0; i < entries.length; i++) {
        if (isInteractiveEntry(entries[i])) {
            interactiveIndices.push(i)
        }
    }
    if (interactiveIndices.length === 0) return -1
    if (direction === 'first') return interactiveIndices[0]
    if (direction === 'last') return interactiveIndices[interactiveIndices.length - 1]

    const pos = interactiveIndices.indexOf(currentIndex)
    if (pos === -1) {
        return direction === 'next'
            ? interactiveIndices[0]
            : interactiveIndices[interactiveIndices.length - 1]
    }
    const delta = direction === 'next' ? 1 : -1
    const nextPos = (pos + delta + interactiveIndices.length) % interactiveIndices.length
    return interactiveIndices[nextPos]
}

/**
 * Finds the next enabled interactive entry matching a typeahead prefix,
 * starting after `startIndex` and wrapping around. Returns `-1` if none matches.
 */
export const findEntryIndexByTypeahead = (
    query: string,
    startIndex: number,
) => (entries: ReadonlyArray<ContextMenuEntry>): number => {
    const normalized = query.trim().toLowerCase()
    if (!normalized || entries.length === 0) return -1

    for (let offset = 1; offset <= entries.length; offset++) {
        const index = (startIndex + offset + entries.length) % entries.length
        const entry = entries[index]
        if (isInteractiveEntry(entry) && entry.label.toLowerCase().startsWith(normalized)) {
            return index
        }
    }
    return -1
}

/**
 * Recursively finds an interactive entry by its `id`.
 */
export const findEntryById = (id: string) => (
    entries: ReadonlyArray<ContextMenuEntry>,
): ContextMenuInteractiveEntry | null => {
    for (const entry of entries) {
        if (entry.type === ContextMenuEntryTypes.Divider || entry.type === ContextMenuEntryTypes.Label) {
            continue
        }
        if (entry.id === id) {
            return entry
        }
        if (entry.type === ContextMenuEntryTypes.Submenu) {
            const nested = findEntryById(id)(entry.children)
            if (nested) return nested
        }
    }
    return null
}

/**
 * Immutably updates checkbox or radio entries when an item with `targetId` is activated.
 * - Checkbox: toggles `checked`.
 * - Radio: sets `checked = true` on target and `checked = false` on other radios in the same `group`.
 * - Other types: returns entries unchanged.
 */
export const toggleContextMenuEntry = (targetId: string) => (
    entries: ReadonlyArray<ContextMenuEntry>,
): ReadonlyArray<ContextMenuEntry> => {
    const target = findEntryById(targetId)(entries)
    if (!target) return entries

    if (target.type === ContextMenuEntryTypes.Checkbox) {
        return mapEntriesRecursive((entry) => {
            if (entry.type === ContextMenuEntryTypes.Checkbox && entry.id === targetId) {
                return { ...entry, checked: !entry.checked }
            }
            return entry
        })(entries)
    }

    if (target.type === ContextMenuEntryTypes.Radio) {
        const targetGroup = target.group ?? ''
        return mapEntriesRecursive((entry) => {
            if (entry.type === ContextMenuEntryTypes.Radio && (entry.group ?? '') === targetGroup) {
                return { ...entry, checked: entry.id === targetId }
            }
            return entry
        })(entries)
    }

    return entries
}

const mapEntriesRecursive = (
    mapper: (entry: ContextMenuEntry) => ContextMenuEntry,
) => (entries: ReadonlyArray<ContextMenuEntry>): ReadonlyArray<ContextMenuEntry> =>
    entries.map((entry) => {
        if (entry.type === ContextMenuEntryTypes.Submenu) {
            const updatedChildren = mapEntriesRecursive(mapper)(entry.children)
            return mapper({ ...entry, children: updatedChildren })
        }
        return mapper(entry)
    })

/**
 * Computes anchor coordinates `(x, y)` for keyboard-triggered context menus
 * (`Shift+F10` / `ContextMenu` key) from a target element's bounding rect.
 */
export const resolveKeyboardTriggerCoordinates = (rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): {
    x: number
    y: number
} => ({
    x: Math.round(rect.left + rect.width / 2),
    y: Math.round(rect.top + rect.height / 2),
})
