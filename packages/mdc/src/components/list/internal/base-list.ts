/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-list` — the container that owns roving tabindex,
 * keyboard navigation, segmented position assignment (including expandable items),
 * and selection management across its `mdc-list-item` children.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    ListItemExpandChangeEvent,
    ListItemRequestActivationEvent,
    ListItemSelector,
    ListSelectionChangeEvent,
    type IMDCList,
    type IMDCListItem,
    type IMDCListItemRequestActivationEventDetail,
    type IMDCListSelectionChangeDetail,
    type ListItemPosition,
    type ListSelectionMode,
    type ListVariant,
} from '../list.interface'
import { ListStyles } from '../list.style'
import { ListItemChildrenChangeEvent, type BaseListItem } from './base-list-item'

export abstract class BaseList extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCList {

    static override styles = ListStyles

    /** Visual variant: `'standard'` or `'segmented'`. */
    @property({ type: String, reflect: true })
    public variant: ListVariant = 'standard'

    /** Selection model: `'none'`, `'single'`, or `'multiple'`. */
    @property({ type: String, reflect: true, attribute: 'selection-mode' })
    public selectionMode: ListSelectionMode = 'none'

    /** When true in single-selection mode, prevents deselecting the active item. */
    @property({ type: Boolean, reflect: true, attribute: 'selection-required' })
    public selectionRequired = false

    /** Disables all interactive items in the list. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    @queryAssignedElements({ flatten: true })
    private readonly assignedElements!: HTMLElement[]

    private cachedItems: IMDCListItem[] = []

    public get items(): IMDCListItem[] {
        return this.cachedItems
    }

    public get selectedItems(): IMDCListItem[] {
        return this.cachedItems.filter((item) => item.selected)
    }

    public get selectedIndexes(): number[] {
        const indexes: number[] = []
        this.cachedItems.forEach((item, index) => {
            if (item.selected) {
                indexes.push(index)
            }
        })
        return indexes
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener(ListItemRequestActivationEvent, this.handleRequestActivation)
        this.addEventListener(ListItemExpandChangeEvent, this.handleExpandChange)
        this.addEventListener(ListItemChildrenChangeEvent, this.handleExpandChange)
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (
            changedProperties.has('variant') ||
            changedProperties.has('selectionMode') ||
            changedProperties.has('disabled')
        ) {
            this.syncChildren()
            this.updateTabIndices()
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const isListbox = this.selectionMode !== 'none'
        return html`
            <div
                class="container"
                role=${isListbox ? 'listbox' : 'list'}
                aria-multiselectable=${this.selectionMode === 'multiple' ? 'true' : nothing}
                aria-label=${ariaLabel || nothing}
                @focusin=${this.handleFocusIn}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `
    }

    private readonly handleSlotChange = (): void => {
        this.syncChildren()
        this.updateTabIndices()
    }

    private readonly handleExpandChange = (): void => {
        this.syncChildren()
        this.updateTabIndices()
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleRequestActivation = (event: Event): void => {
        const item = (event as CustomEvent<IMDCListItemRequestActivationEventDetail>).detail.item
        item.focus()
        this.updateTabIndices()

        if (this.selectionMode === 'none' || item.isDisabled || item.isExpandable) {
            return
        }

        const index = this.cachedItems.indexOf(item)
        if (index === -1) {
            return
        }

        let changed = false
        if (this.selectionMode === 'single') {
            if (item.selected) {
                if (!this.selectionRequired) {
                    item.selected = false
                    changed = true
                }
            } else {
                for (const other of this.cachedItems) {
                    if (other !== item && other.selected) {
                        other.selected = false
                    }
                }
                item.selected = true
                changed = true
            }
        } else if (this.selectionMode === 'multiple') {
            item.selected = !item.selected
            changed = true
        }

        if (changed) {
            this.dispatchEvent(new CustomEvent<IMDCListSelectionChangeDetail>(
                ListSelectionChangeEvent,
                {
                    detail: {
                        item,
                        selected: item.selected,
                        index,
                        selectedItems: this.selectedItems,
                        selectedIndexes: this.selectedIndexes,
                    },
                    bubbles: true,
                    composed: true,
                }
            ))
        }
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        const items = this.cachedItems
        if (items.length < 2 || !items.includes(event.target as IMDCListItem)) {
            return
        }

        const isUp = event.key === 'ArrowUp'
        const isDown = event.key === 'ArrowDown'
        const isLeft = event.key === 'ArrowLeft'
        const isRight = event.key === 'ArrowRight'
        const isHome = event.key === 'Home'
        const isEnd = event.key === 'End'
        if (!isUp && !isDown && !isLeft && !isRight && !isHome && !isEnd) {
            return
        }
        event.preventDefault()

        const isRtl = getComputedStyle(this).direction === 'rtl'
        let nextItem: IMDCListItem | undefined

        if (isHome || isEnd) {
            nextItem = this.findNextFocusableItem(
                isHome ? 0 : items.length - 1,
                isHome ? 1 : -1,
            )
        } else {
            let delta: 1 | -1 = 1
            if (isUp) {
                delta = -1
            } else if (isDown) {
                delta = 1
            } else if (isLeft) {
                delta = isRtl ? 1 : -1
            } else {
                delta = isRtl ? -1 : 1
            }
            nextItem = this.activateRelativeItem(delta)
        }

        if (nextItem) {
            nextItem.focus()
            this.updateTabIndices()
        }
    }

    /** Focuses the next focusable item (wrap-around). */
    public activateNextItem(): void {
        const target = this.activateRelativeItem(1)
        if (target) {
            target.focus()
            this.updateTabIndices()
        }
    }

    /** Focuses the previous focusable item (wrap-around). */
    public activatePreviousItem(): void {
        const target = this.activateRelativeItem(-1)
        if (target) {
            target.focus()
            this.updateTabIndices()
        }
    }

    /**
     * Collects visible `mdc-list-item` children (including expanded `childItems`)
     * and assigns contiguous segmented positions (`single`, `first`, `middle`, `last`)
     * plus synced `variant`, `selectionMode`, and `listDisabled` state. Non-item
     * elements (such as `mdc-divider`) split contiguous segmented runs.
     */
    private syncChildren(): void {
        const elements = this.assignedElements ?? []
        const allVisibleItems: IMDCListItem[] = []
        const runs: IMDCListItem[][] = []
        let currentRun: IMDCListItem[] = []

        for (const el of elements) {
            if (el.matches(ListItemSelector)) {
                const item = el as IMDCListItem
                const baseItem = item as unknown as BaseListItem
                baseItem.listManaged = true
                baseItem.listDisabled = this.disabled
                allVisibleItems.push(item)
                currentRun.push(item)

                const children = item.childItems ?? []
                const parentDisabled = this.disabled || item.isDisabled
                for (const child of children) {
                    const baseChild = child as unknown as BaseListItem
                    baseChild.listManaged = true
                    child.variant = this.variant
                    child.selectionMode = this.selectionMode
                    baseChild.listDisabled = parentDisabled
                    if (item.isExpandable && item.expanded) {
                        allVisibleItems.push(child)
                        currentRun.push(child)
                    } else {
                        child.listTabIndex = -1
                    }
                }
            } else if (currentRun.length > 0) {
                runs.push(currentRun)
                currentRun = []
            }
        }
        if (currentRun.length > 0) {
            runs.push(currentRun)
        }

        this.cachedItems = allVisibleItems

        for (const run of runs) {
            const len = run.length
            run.forEach((item, index) => {
                let position: ListItemPosition = 'middle'
                if (len === 1) {
                    position = 'single'
                } else if (index === 0) {
                    position = 'first'
                } else if (index === len - 1) {
                    position = 'last'
                }
                item.variant = this.variant
                item.position = position
                item.selectionMode = this.selectionMode
            })
        }
    }

    /** Walk from the focused item (or an edge when none is focused) by `delta`. */
    private activateRelativeItem(delta: 1 | -1): IMDCListItem | undefined {
        const items = this.cachedItems
        if (items.length === 0) {
            return undefined
        }
        const focusedIndex = items.findIndex((item) => item.matches(':focus-within'))
        const startIndex = focusedIndex === -1
            ? (delta > 0 ? 0 : items.length - 1)
            : focusedIndex + delta
        return this.findNextFocusableItem(startIndex, delta > 0 ? 1 : -1)
    }

    /** Walk from `startIndex` in `step` direction (wrapping) for a focusable item. */
    private findNextFocusableItem(startIndex: number, step: 1 | -1): IMDCListItem | undefined {
        const items = this.cachedItems
        for (let i = 0; i < items.length; i++) {
            let index = startIndex + i * step
            index = ((index % items.length) + items.length) % items.length
            const item = items[index]
            if (item.isInteractive && !item.isDisabled) {
                return item
            }
        }
        return undefined
    }

    private updateTabIndices(): void {
        const items = this.cachedItems
        if (items.length === 0) {
            return
        }

        const focusedItem = items.find((item) => item.matches(':focus-within'))
        const focusedIsFocusable = focusedItem !== undefined &&
            focusedItem.isInteractive && !focusedItem.isDisabled
        const firstFocusable = items.find((item) => item.isInteractive && !item.isDisabled)
        const itemToFocus = focusedIsFocusable ? focusedItem : firstFocusable

        for (const item of items) {
            item.listTabIndex = item === itemToFocus ? 0 : -1
        }
    }
}
