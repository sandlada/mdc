/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { type ReactiveController } from 'lit'


export interface ISingleSelectionElement extends HTMLElement {
    active: boolean
}

export class NavigationTabSingleSelectionController implements ReactiveController {
    get controls(): [ISingleSelectionElement, ...ISingleSelectionElement[]] {
        const name = this.host.getAttribute('name')
        if (!name || !this.root || !this.host.isConnected) {
            return [this.host]
        }

        return Array.from(
            this.root.querySelectorAll<ISingleSelectionElement>(`[name="${name}"]`),
        ) as unknown as [ISingleSelectionElement, ...ISingleSelectionElement[]]
    }

    private focused = false
    private root: ParentNode | null = null
    private readonly host: ISingleSelectionElement

    constructor(host: ISingleSelectionElement) {
        this.host = host
    }

    hostConnected() {
        this.root = this.host.getRootNode() as ParentNode
        this.host.addEventListener('keydown', this.handleKeyDown)
        this.host.addEventListener('focusin', this.handleFocusIn)
        this.host.addEventListener('focusout', this.handleFocusOut)
        if (this.host.active) {
            // Uncheck other siblings when attached if already checked. This mimics
            // native <input type="radio"> behavior.
            this.uncheckSiblings()
        }

        // Update for the newly added host.
        this.updateTabIndices()
    }

    hostDisconnected() {
        this.host.removeEventListener('keydown', this.handleKeyDown)
        this.host.removeEventListener('focusin', this.handleFocusIn)
        this.host.removeEventListener('focusout', this.handleFocusOut)
        // Update for siblings that are still connected.
        this.updateTabIndices()
        this.root = null
    }

        /**
     * Should be called whenever the host's `checked` property changes
     * synchronously.
     */
    handleCheckedChange() {
        if (!this.host.active) {
            return
        }

        this.uncheckSiblings()
        this.updateTabIndices()
    }

    private readonly handleFocusIn = () => {
        this.focused = true
        this.updateTabIndices()
    };

    private readonly handleFocusOut = () => {
        this.focused = false
        this.updateTabIndices()
    };

    private uncheckSiblings() {
        for (const sibling of this.controls) {
            if (sibling !== this.host) {
                sibling.active = false
            }
        }
    }

    /**
     * Updates the `tabindex` of the host and its siblings.
     */
    private updateTabIndices() {
        // There are three tabindex states for a group of elements:
        // 1. If any are checked, that element is focusable.
        const siblings = this.controls
        const checkedSibling = siblings.find((sibling) => sibling.active)
        // 2. If an element is focused, the others are no longer focusable.
        if (checkedSibling || this.focused) {
            const focusable = checkedSibling || this.host
            focusable.tabIndex = 0

            for (const sibling of siblings) {
                if (sibling !== focusable) {
                    sibling.tabIndex = -1
                }
            }
            return
        }

        // 3. If none are checked or focused, all are focusable.
        for (const sibling of siblings) {
            sibling.tabIndex = 0
        }
    }

    /**
     * Handles arrow key events from the host. Using the arrow keys will
     * select and check the next or previous sibling with the host's
     * `name` attribute.
     */
    private readonly handleKeyDown = (event: KeyboardEvent) => {
        const isDown = event.key === 'ArrowDown'
        const isUp = event.key === 'ArrowUp'
        const isLeft = event.key === 'ArrowLeft'
        const isRight = event.key === 'ArrowRight'
        // Ignore non-arrow keys
        if (!isLeft && !isRight && !isDown && !isUp) {
            return
        }

        // Don't try to select another sibling if there aren't any.
        const siblings = this.controls
        if (!siblings.length) {
            return
        }

        // Prevent default interactions on the element for arrow keys,
        // since this controller will introduce new behavior.
        event.preventDefault()

        // Check if moving forwards or backwards
        const isRtl = getComputedStyle(this.host).direction === 'rtl'
        const forwards = isRtl ? isLeft || isDown : isRight || isDown

        const hostIndex = siblings.indexOf(this.host)
        let nextIndex = forwards ? hostIndex + 1 : hostIndex - 1
        // Search for the next sibling that is not disabled to select.
        // If we return to the host index, there is nothing to select.
        while (nextIndex !== hostIndex) {
            if (nextIndex >= siblings.length) {
                // Return to start if moving past the last item.
                nextIndex = 0
            } else if (nextIndex < 0) {
                // Go to end if moving before the first item.
                nextIndex = siblings.length - 1
            }

            // Check if the next sibling is disabled. If so,
            // move the index and continue searching.
            const nextSibling = siblings[nextIndex]
            if (nextSibling.hasAttribute('disabled')) {
                if (forwards) {
                    nextIndex++
                } else {
                    nextIndex--
                }

                continue
            }

            // Uncheck and remove focusability from other siblings.
            for (const sibling of siblings) {
                if (sibling !== nextSibling) {
                    // sibling.active = false
                    sibling.tabIndex = -1
                    sibling.blur()
                }
            }

            // The next sibling should be checked, focused and dispatch a change event
            // nextSibling.active = true
            nextSibling.tabIndex = 0
            nextSibling.focus()
            // Fire a change event since the change is triggered by a user action.
            // This matches native <input type="radio"> behavior.
            // nextSibling.dispatchEvent(new Event('change', { bubbles: true }))

            break
        }
    };
}
