/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement, property } from 'lit/decorators.js'
import { BaseNavigationTab, type TNavigationDirection } from './base-navigation-tab'
import { navigationBarTabStyle } from './navigation-tab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-navigation-bar-tab": NavigationBarTab
    }
}

/**
 * 
 * @version
 * Material Design 3 - Expressive
 * 
 * @link
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=58016-36959&t=Lo93bap9LHFqZ0Q1-0
 */
@customElement('mdc-navigation-bar-tab')
export class NavigationBarTab extends BaseNavigationTab {

    static override styles = navigationBarTabStyle

    @property({ type: String })
    public direction: TNavigationDirection = 'vertical'
    
    @property({ type: Boolean, reflect: true })
    public xr: boolean = false

    protected override getRenderClasses() {
        return ({
            'has-label': this.hasLabel,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
            'has-badge': this.hasBadge,
            'active': this.active,
            'inactive': !this.active,
            'vertical': this.direction === 'vertical',
            'horizonal': this.direction !== 'vertical',
        })
    }

}
