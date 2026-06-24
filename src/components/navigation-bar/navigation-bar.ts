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
 *   variant="horizonal"
 * >
 *   <mdc-navigation-tab name="bar-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="bar-tabs" value="/search">Search</mdc-navigation-tab>
 * </mdc-navigation-bar>
 * ```
 */
import { customElement, property } from 'lit/decorators.js'
import { BaseNavigationBar } from './internal/base-navigation-bar'
import { html, type CSSResultGroup, type TemplateResult } from 'lit'
import type { INavigationBar, Direction } from './navigation-bar.interface'
import { NavigationBarStyles } from './navigation-bar.style'
import { classMap } from 'lit/directives/class-map.js'

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
    public variant: Direction = 'horizonal'

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
