/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation bar container with scope propagation and variant styles.
 *
 * For imperative show/close and scroll-driven auto-show/hide, attach an
 * {@link EdgeSlideController} from `src/utils/controller/edge-slide-controller.ts`.
 *
 * @example
 * ```html
 * <mdc-navigation-bar
 *   navigation-scope="main-nav"
 *   variant="horizontal"
 * >
 *   <mdc-navigation-tab name="bar-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="bar-tabs" value="/search">Search</mdc-navigation-tab>
 * </mdc-navigation-bar>
 * ```
 */
import { customElement, property } from 'lit/decorators.js'
import { BaseNavigationBar } from './internal/base-navigation-bar'
import { html, type CSSResultGroup, type PropertyValues, type TemplateResult } from 'lit'
import { type INavigationBar, NavigationBarVariant } from './navigation-bar.interface'
import { NavigationBarStyles } from './navigation-bar.style'
import { classMap } from 'lit/directives/class-map.js'
import type { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'

/**
 * @version "Material Design 3"
 *
 * @link
 * https://m3.material.io/components/navigation-bar/overview
 */
@customElement('mdc-navigation-bar')
export class MDCNavigationBar extends BaseNavigationBar implements INavigationBar {

    static override styles?: CSSResultGroup | undefined = NavigationBarStyles

    @property({ type: String, reflect: true, attribute: 'variant' })
    public variant: NavigationBarVariant = NavigationBarVariant.Horizontal

    protected override firstUpdated(): void {
        super.firstUpdated()
        this.syncTabVariants()

        this.shadowRoot?.querySelector('slot')?.addEventListener('slotchange', () => {
            this.syncTabVariants()
        })
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('variant')) {
            this.syncTabVariants()
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${this.renderSlot()}
                ${this.renderBackground()}
            </div>
        `
    }

    private getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true
        })
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background"></div>
        `
    }

    private syncTabVariants(): void {
        const targetVariant = this.computeTargetVariant()
        const tabs = this.querySelectorAll<HTMLElement>('mdc-navigation-tab')
        for (const tab of tabs) {
            (tab as any).variant = targetVariant
        }
    }

    private computeTargetVariant(): NavigationTabVariant {
        switch (this.variant) {
            case 'vertical':
                return 'bar-vertical'
            case 'horizontal':
                return 'bar-horizontal'
            case 'vertical-xr':
                return 'bar-xr-vertical'
        }
    }

}
