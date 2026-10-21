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
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import {
    GlobalNavigationStateStore,
    type NavigationEventTrigger,
} from '../../../utils/navigation/navigation-state-store'
import { NavigationEventController } from './navigation-event-controller'

interface INavigationTabScopeTarget extends HTMLElement {
    navigationScope: string
}

const NAVIGATION_CONTAINER_SELECTOR = 'mdc-navigation-bar, mdc-navigation-rail, mdc-navigation-drawer'

export abstract class BaseNavigationContainer extends LitElement {

    @property({ type: String, reflect: true, attribute: 'navigation-scope' })
    public navigationScope = 'global'

    protected readonly navigationEventController = new NavigationEventController(this)

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

    // Inherit scope to tabs that did not explicitly set their own scope.
    private syncTabsScope(): void {
        const navigationScope = this.normalizeScope(this.navigationScope)

        for (const tab of this.tabs) {
            if (tab.hasAttribute('navigation-scope')) {
                continue
            }
            tab.navigationScope = navigationScope
        }
    }

    // Tabs may sit inside slotted wrappers such as `mdc-navigation-rail-section`,
    // so collect light-DOM descendants and skip tabs owned by a nested container.
    private get tabs(): INavigationTabScopeTarget[] {
        return Array.from(this.querySelectorAll<INavigationTabScopeTarget>('mdc-navigation-tab'))
            .filter((tab) => tab.parentElement?.closest(NAVIGATION_CONTAINER_SELECTOR) === this)
    }

    private normalizeScope(scope: string): string {
        const normalizedScope = scope.trim()
        return normalizedScope.length > 0 ? normalizedScope : 'global'
    }
}
