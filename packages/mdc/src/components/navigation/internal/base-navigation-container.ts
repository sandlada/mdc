/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Shared container logic for navigation components. The container propagates
 * `navigation-scope` to slotted tabs and exposes imperative scope-level APIs.
 *
 * @example
 * ```ts
 * @customElement('mdc-navigation-bar')
 * export class NavigationBar extends BaseNavigationContainer {}
 *
 * const bar = document.querySelector('mdc-navigation-bar')
 * bar?.setActive('/home')
 * ```
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import {
    GlobalNavigationStateStore,
    type NavigationEventTrigger,
} from '../../../utils/navigation/navigation-state-store'
import { NavigationEventController } from './navigation-event-controller'

interface INavigationTabScopeTarget extends HTMLElement {
    navigationScope: string
}

const NAVIGATION_TAB_SELECTOR = 'mdc-navigation-tab'
const NAVIGATION_CONTAINER_SELECTOR = 'mdc-navigation-bar, mdc-navigation-rail, mdc-navigation-drawer'

export abstract class BaseNavigationContainer extends LitElement {

    @property({ type: String, reflect: true, attribute: 'navigation-scope' })
    public navigationScope = 'global'

    protected readonly navigationEventController = new NavigationEventController(this)

    /**
     * Scope last inherited into each managed tab. A tab whose scope diverges
     * from the recorded value has opted out with its own scope.
     */
    private readonly inheritedTabScopes = new WeakMap<INavigationTabScopeTarget, string>()

    private mutationObserver: MutationObserver | null = null

    /** Current active navigation value in this container scope. */
    public get activeValue(): string | null {
        return GlobalNavigationStateStore.getActive(this.normalizeScope(this.navigationScope))
    }

    /**
     * Imperatively activates a value in this container scope.
     * Tabs in other containers with the same scope and value will sync.
     */
    public setActive(value: string, trigger: NavigationEventTrigger = 'programmatic'): void {
        GlobalNavigationStateStore.setActive(this.normalizeScope(this.navigationScope), value, {
            source: 'external',
            trigger,
        })
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return

        this.syncTabsScope()
        this.mutationObserver = new MutationObserver(this.handleTabsMutation)
        this.mutationObserver.observe(this, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['navigation-scope'],
        })
    }

    public override disconnectedCallback(): void {
        this.mutationObserver?.disconnect()
        this.mutationObserver = null
        super.disconnectedCallback()
    }

    protected override firstUpdated(_changedProperties?: PropertyValues): void {
        super.firstUpdated(_changedProperties as PropertyValues)
        this.syncTabsScope()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('navigationScope')) {
            this.syncTabsScope()
        }
    }

    protected override render(): TemplateResult {
        return html`
            ${this.renderSlot()}
        `
    }

    protected renderSlot() {
        return html`
            <slot @slotchange=${this.handleSlotChange}></slot>
        `
    }

    private readonly handleSlotChange = () => {
        this.syncTabsScope()
    }

    // Tabs may be added inside a slotted wrapper after the first render. Those
    // insertions never reach the container's `slotchange`, so observe the
    // light DOM subtree to pick them up. Scope attributes are observed as well
    // so clearing an explicit tab scope restores inheritance.
    private readonly handleTabsMutation = (records: MutationRecord[]): void => {
        if (records.some((record) =>
            this.isTabScopeMutation(record) || this.addedNavigationTabs(record.addedNodes),
        )) {
            this.syncTabsScope()
        }
    }

    private isTabScopeMutation(record: MutationRecord): boolean {
        return record.type === 'attributes'
            && record.target instanceof Element
            && record.target.matches(NAVIGATION_TAB_SELECTOR)
    }

    private addedNavigationTabs(nodes: NodeList): boolean {
        for (const node of nodes) {
            if (!(node instanceof Element)) continue
            if (node.matches(NAVIGATION_TAB_SELECTOR) || node.querySelector(NAVIGATION_TAB_SELECTOR) !== null) {
                return true
            }
        }
        return false
    }

    // Inherit scope to tabs that did not explicitly set their own scope.
    private syncTabsScope(): void {
        const navigationScope = this.normalizeScope(this.navigationScope)

        for (const tab of this.tabs) {
            const inheritedScope = this.inheritedTabScopes.get(tab)
            const tabScope = tab.navigationScope?.trim() ?? ''

            if (inheritedScope === undefined) {
                // A non-empty tab scope set before the container saw the tab
                // is an explicit override.
                if (tabScope.length > 0) {
                    continue
                }
            } else if (tabScope.length > 0 && tabScope !== inheritedScope) {
                // The tab scope changed after inheritance, so stop managing it.
                this.inheritedTabScopes.delete(tab)
                continue
            }

            if (tabScope !== navigationScope) {
                tab.navigationScope = navigationScope
            }
            this.inheritedTabScopes.set(tab, navigationScope)
        }
    }

    // Tabs may sit inside slotted wrappers such as `mdc-navigation-rail-section`,
    // so collect light-DOM descendants and skip tabs owned by a nested container.
    private get tabs(): INavigationTabScopeTarget[] {
        return Array.from(this.querySelectorAll<INavigationTabScopeTarget>(NAVIGATION_TAB_SELECTOR))
            .filter((tab) => tab.parentElement?.closest(NAVIGATION_CONTAINER_SELECTOR) === this)
    }

    private normalizeScope(scope: string): string {
        const normalizedScope = scope.trim()
        return normalizedScope.length > 0 ? normalizedScope : 'global'
    }
}
