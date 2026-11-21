/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface IExpansionGroupItem extends HTMLElement {
    expanded: boolean
    disabled: boolean
    focusHeader?: () => void
}

export interface IExpansionGroupHost<T extends IExpansionGroupItem = IExpansionGroupItem>
    extends ReactiveControllerHost, HTMLElement {
    mode: 'multiple' | 'single'
    collapsible: boolean
    getExpansionItems(): T[]
    isItemHeaderFocused?(item: T, event: KeyboardEvent): boolean
    onExpansionGroupChange?(detail: {
        expandedIndices: number[]
        expandedItems: T[]
        changedItem: T
        expanded: boolean
    }): void
}

export interface IExpansionGroupControllerOptions {
    toggleEvent: string
}

/**
 * Reusable Lit `ReactiveController` for coordinating a group of expandable
 * items (single/multiple mode, `collapsible` guard, and Arrow/Home/End
 * keyboard navigation across enabled item headers).
 */
export class ExpansionGroupController<T extends IExpansionGroupItem = IExpansionGroupItem>
    implements ReactiveController {
    private readonly host: IExpansionGroupHost<T>
    private readonly options: IExpansionGroupControllerOptions
    private connection = 0

    public constructor(host: IExpansionGroupHost<T>, options: IExpansionGroupControllerOptions) {
        this.host = host
        this.options = options
        host.addController(this)
    }

    public hostConnected(): void {
        this.host.addEventListener(this.options.toggleEvent, this.onItemToggle)
        this.host.addEventListener('keydown', this.onKeyDown)
    }

    public hostDisconnected(): void {
        ++this.connection
        this.host.removeEventListener(this.options.toggleEvent, this.onItemToggle)
        this.host.removeEventListener('keydown', this.onKeyDown)
    }

    public get items(): T[] {
        return this.host.getExpansionItems()
    }

    public get expandedItems(): T[] {
        return this.items.filter(item => item.expanded)
    }

    public expandAll(): void {
        if (this.host.mode !== 'multiple') return
        for (const item of this.items) {
            if (!item.disabled && !item.expanded) {
                item.expanded = true
            }
        }
    }

    public collapseAll(): void {
        const keepFirstOpen = this.host.mode === 'single' && !this.host.collapsible
        let keptOne = false
        for (const item of this.items) {
            if (item.disabled) continue
            if (keepFirstOpen && item.expanded && !keptOne) {
                keptOne = true
                continue
            }
            if (item.expanded) {
                item.expanded = false
            }
        }
    }

    public expandAt(index: number): void {
        const item = this.items[index]
        if (!item || item.disabled) return
        if (this.host.mode === 'single') {
            this.collapseOtherItems(item)
        }
        item.expanded = true
    }

    public collapseAt(index: number): void {
        const item = this.items[index]
        if (!item || item.disabled) return
        if (this.host.mode === 'single' && !this.host.collapsible && item.expanded) {
            const otherExpanded = this.items.some(p => p !== item && p.expanded)
            if (!otherExpanded) return
        }
        item.expanded = false
    }

    public toggleAt(index: number): void {
        const item = this.items[index]
        if (!item || item.disabled) return
        if (item.expanded) {
            this.collapseAt(index)
        } else {
            this.expandAt(index)
        }
    }

    public enforceSingleExpanded(): void {
        if (this.host.mode !== 'single') return
        let foundExpanded = false
        for (const item of this.items) {
            if (item.expanded) {
                if (!foundExpanded) {
                    foundExpanded = true
                } else {
                    item.expanded = false
                }
            }
        }
    }

    private collapseOtherItems(activeItem: T): void {
        for (const item of this.items) {
            if (item !== activeItem && item.expanded) {
                item.expanded = false
            }
        }
    }

    private readonly onItemToggle = (event: Event): void => {
        const customEvent = event as CustomEvent<{ expanded: boolean }>
        const items = this.items
        const target = customEvent.target as T | null
        if (!target || !items.includes(target)) return

        const nextExpanded = customEvent.detail.expanded

        if (this.host.mode === 'single' && !this.host.collapsible && !nextExpanded) {
            const otherExpanded = items.some(item => item !== target && item.expanded)
            if (!otherExpanded) {
                customEvent.preventDefault()
                return
            }
        }

        if (this.host.mode === 'single' && nextExpanded) {
            this.collapseOtherItems(target)
        }

        const connection = this.connection
        queueMicrotask(() => {
            if (connection !== this.connection || customEvent.defaultPrevented) return
            const currentItems = this.items
            const expandedIndices: number[] = []
            const expandedItems: T[] = []
            currentItems.forEach((item, idx) => {
                if (item.expanded) {
                    expandedIndices.push(idx)
                    expandedItems.push(item)
                }
            })
            this.host.onExpansionGroupChange?.({
                expandedIndices,
                expandedItems,
                changedItem: target,
                expanded   : target.expanded,
            })
        })
    }

    private readonly onKeyDown = (event: KeyboardEvent): void => {
        const key = event.key
        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') {
            return
        }

        const items = this.items
        const path = event.composedPath()
        const activeItem = items.find(item => {
            if (item !== event.target && !path.includes(item)) return false
            return this.host.isItemHeaderFocused ? this.host.isItemHeaderFocused(item, event) : true
        })
        if (!activeItem) return

        const enabledItems = items.filter(item => !item.disabled)
        if (enabledItems.length === 0) return

        const currentIndex = enabledItems.indexOf(activeItem)
        if (currentIndex === -1) return

        let targetIndex = currentIndex
        if (key === 'ArrowDown') {
            targetIndex = (currentIndex + 1) % enabledItems.length
        } else if (key === 'ArrowUp') {
            targetIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
        } else if (key === 'Home') {
            targetIndex = 0
        } else if (key === 'End') {
            targetIndex = enabledItems.length - 1
        }

        event.preventDefault()
        const targetItem = enabledItems[targetIndex]
        if (targetItem?.focusHeader) {
            targetItem.focusHeader()
        } else {
            targetItem?.focus()
        }
    }
}
