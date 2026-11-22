/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-tabs`.
 *
 * The bar owns selection: a single active tab at a time (roving `tabindex`),
 * an ARIA `tablist` role, arrow-key navigation (skipping disabled tabs) and a
 * cancelable `change` event that fires before the selection is committed.
 * Each tab is asked to animate its indicator (via {@link AnimateIndicator})
 * from the previous tab's position, so the active indicator slides smoothly
 * between tabs.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { BaseTab, AnimateIndicator } from './base-tab'
import { TabsMode, type IMDCTabs } from '../tabs.interface'
import type { TabVariant } from '../tab.interface'

/** Roving-tabindex selector — matches any element marked as an `mdc-tab`. */
const TabSelector = '[mdc-tab]'

function isTab(element: EventTarget | null): element is BaseTab {
    return !!element && element instanceof BaseTab
}

function isTabFocusable(tab: BaseTab): boolean {
    return !tab.disabled || tab.alwaysFocusable
}

// NOTE: `mixinElementInternals` is intentionally NOT used here — the tab bar
// has no form / `ElementInternals` needs; it is a plain `tablist` container.
export abstract class BaseTabs extends LitElement implements IMDCTabs {
    /** The index of the active tab. */
    @property({ type: Number, reflect: true, attribute: 'active-tab-index' })
    public activeTabIndex = 0

    /** If `true` (default), arrow keys immediately activate the focused tab. */
    @property({ type: Boolean, reflect: true, attribute: 'auto-activate' })
    public autoActivate = true

    /** Layout mode (`fixed` | `scrollable`). Defaults to `fixed`. */
    @property({ type: String, reflect: true })
    public mode: TabsMode = TabsMode.Fixed

    /** Optional bar-level variant propagated to child `mdc-tab` elements that omit `variant`. */
    @property({ type: String, reflect: true })
    public variant?: TabVariant

    /** Hides the trailing divider below the tab bar. */
    @property({ type: Boolean, reflect: true, attribute: 'no-divider' })
    public noDivider = false

    /** Accessible name (`aria-label`) forwarded to the `tablist` element. */
    @property({ type: String })
    public label = ''

    @query('.tabs')
    protected readonly tabsElement!: HTMLElement | null

    @queryAssignedElements({ selector: TabSelector, flatten: true })
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
        const candidate = tabs[activeTabIndex]
        if (candidate && !candidate.disabled) {
            return candidate
        }
        return tabs.find((tab) => !tab.disabled) ?? null
    }

    protected getTabsClasses() {
        return {
            'scrollable': this.mode === TabsMode.Scrollable,
            'fixed'     : this.mode === TabsMode.Fixed,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div
                class="tabs ${classMap(this.getTabsClasses())}"
                part="tabs"
                role="tablist"
                aria-label=${this.label || nothing}
            >
                <slot @slotchange=${this.handleSlotChange} @click=${this.handleTabClick}></slot>
            </div>
            <div class="divider" part="divider"></div>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('variant') && this.variant !== undefined) {
            this.syncChildVariants()
        }
        if (changedProperties.has('activeTabIndex')) {
            const { activeTabIndex, tabs } = this
            const target = tabs[activeTabIndex]
            if (target && !target.disabled) {
                void this.activateTab(target, false)
            }
        }
    }

    private syncChildVariants(): void {
        if (this.variant === undefined) return
        for (const tab of this.tabs) {
            if (!tab.hasAttribute('variant')) {
                tab.variant = this.variant
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
        if (!isTab(target) || target.disabled || target.active) {
            return
        }
        void this.activateTab(target, true)
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented || !isTab(event.target)) {
            return
        }
        const len = this.tabs.length
        if (len === 0) return

        const { key, ctrlKey, metaKey } = event
        const focusedIndex = this.tabs.indexOf(event.target)
        const start = focusedIndex >= 0 ? focusedIndex : this.tabs.findIndex((tab) => tab.active)

        let target: BaseTab | null = null
        if (key === 'Home') {
            target = this.findNextFocusableTab(0, 1)
        } else if (key === 'End') {
            target = this.findNextFocusableTab(len - 1, -1)
        } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
            const dir = key === 'ArrowLeft' ? -1 : 1
            const offset = this.isRtl() ? -dir : dir
            const next = (((start + offset) % len) + len) % len
            target = this.findNextFocusableTab(next, offset)
        }

        if (!target) {
            return
        }

        event.preventDefault()
        if (!target.disabled && (ctrlKey || metaKey || this.autoActivate)) {
            void this.activateTab(target, true)
            target.focus()
        } else {
            this.updateRovingTabindex(target)
            target.focus()
        }
    }

    private findNextFocusableTab(startIndex: number, step: number): BaseTab | null {
        const len = this.tabs.length
        for (let i = 0; i < len; i++) {
            const idx = (((startIndex + i * step) % len) + len) % len
            const candidate = this.tabs[idx]
            if (isTabFocusable(candidate)) {
                return candidate
            }
        }
        return null
    }

    private updateRovingTabindex(focusedTab: BaseTab): void {
        for (const tab of this.tabs) {
            tab.tabIndex = tab === focusedTab ? 0 : -1
        }
    }

    private isRtl(): boolean {
        return this.matches(':dir(rtl)') || getComputedStyle(this).direction === 'rtl'
    }

    private readonly handleSlotChange = (): void => {
        // Query for assigned elements, as a tab may be slotted from a wrapper.
        this.tabs = this.assignedTabs
        this.syncChildVariants()

        const { activeTab } = this
        for (const [index, tab] of this.tabs.entries()) {
            tab.index = index
            const isActive = tab === activeTab
            tab.active = isActive
            tab.tabIndex = isActive && isTabFocusable(tab) ? 0 : -1
        }
        if (activeTab && this.activeTabIndex !== activeTab.index) {
            this.activeTabIndex = activeTab.index
        }
    }

    /**
     * Selects `tab`, animating the indicator from the previously active tab.
     *
     * Dispatches a cancelable `change` event first; if a listener cancels it,
     * the previous selection is restored.
     */
    public async activateTab(tab: BaseTab, userInitiated: boolean): Promise<void> {
        const previousTab = this.tabs.find((candidate) => candidate.active) ?? null
        if (!tab || tab.disabled || tab === previousTab) {
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
        this.updateRovingTabindex(tab)

        // Animate the indicator from the previous tab's position.
        tab[AnimateIndicator](previousTab)

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
        const maxScroll = Math.max(0, scrollWidth - clientWidth)
        const targetScroll = Math.max(
            0,
            Math.min(offsetLeft - (clientWidth - offsetWidth) / 2, maxScroll)
        )
        if (targetScroll !== scrollLeft) {
            tabsElement.scrollTo({ left: targetScroll, behavior: 'smooth' })
        }
    }
}
