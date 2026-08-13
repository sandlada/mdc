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
import { property, query } from 'lit/decorators.js'
import {
    GlobalNavigationStateStore,
    type NavigationEventTrigger,
} from '../../../utils/navigation/navigation-state-store'

interface INavigationTabScopeTarget extends HTMLElement {
    navigationScope: string
}

export abstract class BaseNavigationContainer extends LitElement {

    @property({ type: String, reflect: true, attribute: 'navigation-scope' })
    public navigationScope = 'global'

    @query('slot')
    private readonly slotElement!: HTMLSlotElement | null

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

    protected override firstUpdated(): void {
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

    private get tabs(): INavigationTabScopeTarget[] {
        if (!this.slotElement) return []

        return this.slotElement
            .assignedElements({ flatten: true })
            .filter((element) => element.tagName === 'MDC-NAVIGATION-TAB') as INavigationTabScopeTarget[]
    }

    private normalizeScope(scope: string): string {
        const normalizedScope = scope.trim()
        return normalizedScope.length > 0 ? normalizedScope : 'global'
    }
}
