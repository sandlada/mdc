/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface IExpansionHost extends ReactiveControllerHost, HTMLElement {
    expanded: boolean
    disabled?: boolean
    quick?: boolean
}

export interface IExpansionControllerOptions {
    /** Returns the collapsible container element whose transition is observed. */
    getCollapseElement: () => HTMLElement | null
    /** CSS property name to match on `transitionend`. Defaults to `'grid-template-rows'`. */
    transitionProperty?: string
    /** Fallback timeout (ms) when `transitionend` does not fire. Defaults to `350`. */
    fallbackMs?: number
    /** Event name dispatched (cancelable) before user-initiated toggle. */
    toggleEvent?: string
    /** Event name dispatched when expand transition starts. */
    expandingEvent?: string
    /** Event name dispatched when expand transition finishes. */
    expandedEvent?: string
    /** Event name dispatched when collapse transition starts. */
    collapsingEvent?: string
    /** Event name dispatched when collapse transition finishes. */
    collapsedEvent?: string
}

/**
 * Reusable Lit `ReactiveController` that manages expand/collapse state
 * transitions, cancelable toggle events, `prefers-reduced-motion` / `quick`
 * immediate completion, and `transitionend` + fallback timer cleanup.
 *
 * Designed for shared use across Accordion / ExpansionPanel, List, Menu, and
 * other collapsible disclosure components.
 */
export class ExpansionController implements ReactiveController {
    private readonly host: IExpansionHost
    private readonly options: IExpansionControllerOptions
    private pendingState: 'expanding' | 'collapsing' | null = null
    private fallbackTimer: ReturnType<typeof setTimeout> | null = null
    private lastExpanded: boolean

    public constructor(host: IExpansionHost, options: IExpansionControllerOptions) {
        this.host = host
        this.options = options
        this.lastExpanded = host.expanded
        host.addController(this)
    }

    public hostConnected(): void {
        this.lastExpanded = this.host.expanded
    }

    public hostDisconnected(): void {
        this.clearFallbackTimer()
        this.pendingState = null
    }

    public hostUpdate(): void {
        if (this.host.expanded === this.lastExpanded) {
            return
        }
        const nextExpanded = this.host.expanded
        this.lastExpanded = nextExpanded
        if (nextExpanded) {
            this.startTransition('expanding')
        } else {
            this.startTransition('collapsing')
        }
    }

    /**
     * Requests a user-initiated toggle. Dispatches `toggleEvent` (cancelable)
     * if configured; updates `host.expanded` unless prevented.
     */
    public requestToggle(nextExpanded: boolean = !this.host.expanded): boolean {
        if (this.host.disabled) {
            return false
        }
        if (this.options.toggleEvent) {
            const event = new CustomEvent(this.options.toggleEvent, {
                bubbles   : true,
                composed  : true,
                cancelable: true,
                detail    : { expanded: nextExpanded },
            })
            if (!this.host.dispatchEvent(event)) {
                return false
            }
        }
        this.host.expanded = nextExpanded
        return true
    }

    public async expand(): Promise<void> {
        if (this.host.expanded) return
        this.host.expanded = true
        await this.host.updateComplete
    }

    public async collapse(): Promise<void> {
        if (!this.host.expanded) return
        this.host.expanded = false
        await this.host.updateComplete
    }

    public async toggle(): Promise<void> {
        this.host.expanded = !this.host.expanded
        await this.host.updateComplete
    }

    /**
     * Bind to `@transitionend` on the collapsible container element.
     */
    public readonly handleTransitionEnd = (event: TransitionEvent): void => {
        const collapseEl = this.options.getCollapseElement()
        const prop = this.options.transitionProperty ?? 'grid-template-rows'
        if (!collapseEl || event.target !== collapseEl || event.propertyName !== prop) {
            return
        }
        if (this.pendingState === 'expanding' && this.host.expanded) {
            this.finishTransition('expanding')
        } else if (this.pendingState === 'collapsing' && !this.host.expanded) {
            this.finishTransition('collapsing')
        }
    }

    public isMotionReduced(): boolean {
        return Boolean(this.host.quick) || Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    }

    private startTransition(state: 'expanding' | 'collapsing'): void {
        this.clearFallbackTimer()
        this.pendingState = state

        const startEvent = state === 'expanding' ? this.options.expandingEvent : this.options.collapsingEvent
        if (startEvent) {
            this.host.dispatchEvent(new CustomEvent(startEvent, { bubbles: true, composed: true }))
        }

        const collapseEl = this.options.getCollapseElement()
        if (this.isMotionReduced() || !collapseEl) {
            this.finishTransition(state)
            return
        }

        const fallbackMs = this.options.fallbackMs ?? 350
        this.fallbackTimer = setTimeout(() => {
            if (this.pendingState === state) {
                this.finishTransition(state)
            }
        }, fallbackMs)
    }

    private finishTransition(state: 'expanding' | 'collapsing'): void {
        this.clearFallbackTimer()
        this.pendingState = null
        const endEvent = state === 'expanding' ? this.options.expandedEvent : this.options.collapsedEvent
        if (endEvent) {
            this.host.dispatchEvent(new CustomEvent(endEvent, { bubbles: true, composed: true }))
        }
    }

    private clearFallbackTimer(): void {
        if (this.fallbackTimer !== null) {
            clearTimeout(this.fallbackTimer)
            this.fallbackTimer = null
        }
    }
}

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

        queueMicrotask(() => {
            if (customEvent.defaultPrevented) return
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
