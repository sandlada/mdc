/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-tabs`.
 *
 * The bar owns selection: a single active tab at a time (roving `tabindex`),
 * an ARIA `tablist` role, arrow-key navigation and a cancelable `change` event
 * that fires before the selection is committed. Each tab is asked to animate
 * its indicator (via the {@link ANIMATE_INDICATOR} symbol) from the previous
 * tab's position, so the active indicator slides smoothly between tabs.
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements } from 'lit/decorators.js'
import { BaseTab, ANIMATE_INDICATOR } from './base-tab'
import type { ITabs } from '../tabs.interface'

/** Roving-tabindex selector — matches any element marked as an `mdc-tab`. */
const TAB_SELECTOR = '[mdc-tab]'

function isTab(element: EventTarget | null): element is BaseTab {
    return !!element && element instanceof BaseTab
}

// NOTE: `mixinElementInternals` is intentionally NOT used here — the tab bar
// has no form / `ElementInternals` needs; it is a plain `tablist` container.
export abstract class BaseTabs extends LitElement implements ITabs {

    /** The index of the active tab. */
    @property({ type: Number, reflect: true, attribute: 'active-tab-index' })
    public activeTabIndex = 0

    /** If `true` (default), arrow keys immediately activate the focused tab. */
    @property({ type: Boolean, reflect: true, attribute: 'auto-activate' })
    public autoActivate = true

    @query('.tabs')
    protected readonly tabsElement!: HTMLElement | null

    @queryAssignedElements({ selector: TAB_SELECTOR, flatten: true })
    private readonly assignedTabs!: BaseTab[]

    private tabs: BaseTab[] = []

    public constructor() {
        super()
        if (isServer) return
        this.addEventListener('keydown', this.handleKeydown)
    }

    /** The currently selected tab. */
    public get activeTab(): BaseTab | null {
        const { activeTabIndex, tabs } = this
        const activeTab = tabs[activeTabIndex]
        if (activeTab) {
            return activeTab
        }
        // Fall back to the first tab when the index is out of range.
        return tabs[0] ?? null
    }

    protected override render(): TemplateResult {
        return html`
            <div class="tabs" role="tablist">
                <slot @slotchange=${this.handleSlotChange} @click=${this.handleTabClick}></slot>
            </div>
            <div class="divider" part="divider"></div>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('activeTabIndex')) {
            const { activeTabIndex, tabs } = this
            if (tabs.length && activeTabIndex >= 0 && activeTabIndex < tabs.length) {
                this.activateTab(tabs[activeTabIndex], false)
            }
        }
    }

    private readonly handleTabClick = (event: Event): void => {
        // `await 0` lets click listeners (ripple, disabled guard) a chance to
        // call `preventDefault()` before the selection is committed.
        void this.activateTabAfterMicrotask(event.target)
    }

    private async activateTabAfterMicrotask(target: EventTarget | null): Promise<void> {
        await 0
        if (!isTab(target) || target.active) {
            return
        }
        this.activateTab(target, true)
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented || !isTab(event.target)) {
            return
        }
        const { key, ctrlKey, metaKey } = event
        const start = this.tabs.findIndex((tab) => tab.active)
        let next = NaN
        if (key === 'Home') {
            next = 0
        } else if (key === 'End') {
            next = this.tabs.length - 1
        } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
            const dir = key === 'ArrowLeft' ? -1 : 1
            const offset = this.isRtl() ? -dir : dir
            next = start + offset
        }
        if (isNaN(next)) {
            return
        }
        event.preventDefault()
        const target = this.tabs[next % this.tabs.length]
        if (ctrlKey || metaKey || this.autoActivate) {
            this.activateTab(target, true)
        } else {
            target.focus()
        }
    }

    private isRtl(): boolean {
        return this.matches(':dir(rtl)') || getComputedStyle(this).direction === 'rtl'
    }

    private readonly handleSlotChange = (): void => {
        // Query for assigned elements, as a tab may be slotted from a wrapper.
        this.tabs = this.assignedTabs
        const { activeTabIndex, activeTab } = this
        for (const [index, tab] of this.tabs.entries()) {
            tab.index = index
            tab.tabIndex = index === activeTabIndex ? 0 : -1
            if (tab === activeTab) {
                tab.active = true
            } else {
                tab.active = false
            }
        }
        if (activeTab === null && this.tabs[0]) {
            // No active tab yet — select the first one so the indicator shows.
            this.activateTab(this.tabs[0], false)
        }
    }

    /**
     * Selects `tab`, animating the indicator from the previously active tab.
     *
     * Dispatches a cancelable `change` event first; if a listener cancels it,
     * the previous selection is restored.
     */
    public async activateTab(tab: BaseTab, userInitiated: boolean): Promise<void> {
        const previousTab = this.activeTab
        if (!tab || tab === previousTab) {
            return
        }
        // Because `change` is cancelable, only commit after the event is not
        // canceled. The new tab is optimistically marked active so that
        // `activeTab` reflects the pending state during the dispatch.
        tab.active = true
        const accepted = this.dispatchEvent(
            new Event('change', { bubbles: true, composed: true, cancelable: true })
        )
        if (!accepted) {
            // Selection canceled — revert to the previous state.
            tab.active = false
            if (previousTab) {
                previousTab.active = true
            }
            return
        }
        if (previousTab) {
            previousTab.active = false
        }
        this.activeTabIndex = tab.index

        // Roving tabindex — the newly active tab receives the focus slot.
        for (const [index, candidate] of this.tabs.entries()) {
            candidate.tabIndex = index === tab.index ? 0 : -1
        }

        // Animate the indicator from the previous tab's position.
        tab[ANIMATE_INDICATOR](previousTab)

        if (userInitiated) {
            await this.scrollToTab(tab)
        }
    }

    /**
     * Scrolls the given tab (defaults to the active tab) into view within the
     * tab bar. Resolves once the native smooth scroll has been requested.
     */
    public async scrollToTab(tabToScrollTo: BaseTab | null = this.activeTab): Promise<void> {
        const { tabsElement } = this
        if (!tabToScrollTo || !tabsElement) {
            return
        }
        const { offsetLeft, offsetWidth } = tabToScrollTo
        const { scrollLeft, clientWidth, scrollWidth } = tabsElement
        const maxScroll = scrollWidth - clientWidth
        const targetScroll = Math.max(
            0,
            Math.min(offsetLeft - (clientWidth - offsetWidth) / 2, maxScroll)
        )
        if (targetScroll !== scrollLeft) {
            tabsElement.scrollTo({ left: targetScroll, behavior: 'smooth' })
        }
    }
}
