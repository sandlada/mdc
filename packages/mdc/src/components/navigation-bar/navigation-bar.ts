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
import { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'

const BAR_TAB_VARIANTS = {
    horizontal: NavigationTabVariant.BarHorizontal,
    vertical: NavigationTabVariant.BarVertical,
    'vertical-xr': NavigationTabVariant.BarXRVertical,
} as const satisfies Record<NavigationBarVariant, NavigationTabVariant>

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-bar': MDCNavigationBar
    }
}

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

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!(this.variant in BAR_TAB_VARIANTS)) {
            throw new Error(`[mdc-navigation-bar] Unsupported variant "${String(this.variant)}". Navigation bars support only "horizontal" | "vertical" | "vertical-xr".`)
        }
    }

    protected override resolveTabVariant(): NavigationTabVariant {
        const variant: NavigationTabVariant | undefined = BAR_TAB_VARIANTS[this.variant]
        if (variant === undefined) {
            throw new Error(`[mdc-navigation-bar] Unsupported variant "${String(this.variant)}". Navigation bars support only "horizontal" | "vertical" | "vertical-xr".`)
        }
        return variant
    }

    protected override shouldSyncTabVariants(changedProperties: PropertyValues<this>): boolean {
        return changedProperties.has('variant')
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

}
