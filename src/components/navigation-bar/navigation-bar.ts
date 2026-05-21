/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation bar container.
 *
 * @example
 * ```html
 * <mdc-navigation-bar navigation-scope="main-nav">
 *   <mdc-navigation-tab name="bar-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="bar-tabs" value="/search">Search</mdc-navigation-tab>
 * </mdc-navigation-bar>
 * ```
 */
import { customElement, property } from 'lit/decorators.js'
import { BaseNavigationContainer } from '../navigation/internal/base-navigation-container'
import { html, type CSSResultGroup, type TemplateResult } from 'lit'
import type { Direction, INavigationBar } from './navigation-bar.interface'
import { NavigationBarStyles } from './navigation-bar.style'
import { classMap } from 'lit/directives/class-map.js'

/**
 * @version "Material Design 3"
 *
 * @link
 * https://m3.material.io/components/navigation-bar/overview
 */
@customElement('mdc-navigation-bar')
export class MDCNavigationBar extends BaseNavigationContainer implements INavigationBar {

    static override styles?: CSSResultGroup | undefined = NavigationBarStyles

    @property({ type: String, reflect: true })
    public direction: Direction = 'vertical'

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
            [this.direction]: true,
        })
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background"></div>
        `
    }

}
