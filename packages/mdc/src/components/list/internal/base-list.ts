/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-list` — the container that owns roving tabindex
 * and keyboard navigation across its `mdc-list-item` children.
 *
 * Items are self-managing views: each item renders its own native root and
 * reports activation through the composed `request-activation` event. The list
 * keeps exactly one interactive item in the tab order (roving tabindex),
 * navigates with Arrow keys / Home / End, and exposes
 * `activateNextItem()` / `activatePreviousItem()` for external callers.
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { queryAssignedElements } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    LIST_ITEM_REQUEST_ACTIVATION_EVENT,
    LIST_ITEM_SELECTOR,
    type IList,
    type IListItem,
    type IListItemRequestActivationEventDetail,
} from '../list.interface'
import { ListStyles } from './list.style'

export abstract class BaseList extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IList {

    static override styles = ListStyles

    @queryAssignedElements({ selector: LIST_ITEM_SELECTOR, flatten: true })
    private readonly assignedItems!: IListItem[]

    private cachedItems: IListItem[] = []

    public get items(): IListItem[] {
        return this.cachedItems
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener(LIST_ITEM_REQUEST_ACTIVATION_EVENT, this.handleRequestActivation)
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="container"
                role="list"
                aria-label=${ariaLabel || nothing}
                @focusin=${this.handleFocusIn}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `
    }

    private readonly handleSlotChange = (): void => {
        this.cachedItems = this.assignedItems
        this.updateTabIndices()
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleRequestActivation = (event: Event): void => {
        const item = (event as CustomEvent<IListItemRequestActivationEventDetail>).detail.item
        // Promote the activating item to the roving tabindex slot.
        item.focus()
        this.updateTabIndices()
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        const items = this.cachedItems
        if (items.length < 2 || !items.includes(event.target as IListItem)) {
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
        let nextItem: IListItem | undefined

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
                // ArrowLeft moves backwards in LTR, forwards in RTL.
                delta = isRtl ? 1 : -1
            } else {
                // ArrowRight moves forwards in LTR, backwards in RTL.
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

    /** Walk from the focused item (or an edge when none is focused) by `delta`. */
    private activateRelativeItem(delta: 1 | -1): IListItem | undefined {
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
    private findNextFocusableItem(startIndex: number, step: 1 | -1): IListItem | undefined {
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
