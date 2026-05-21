/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation drawer container.
 *
 * @example
 * ```html
 * <mdc-navigation-drawer navigation-scope="main-nav">
 *   <mdc-navigation-tab name="drawer-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="drawer-tabs" value="/library">Library</mdc-navigation-tab>
 * </mdc-navigation-drawer>
 * ```
 */
import { customElement } from 'lit/decorators.js'
import { BaseNavigationContainer } from '../navigation/internal/base-navigation-container'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-drawer': NavigationDrawer
    }
}

@customElement('mdc-navigation-drawer')
export class NavigationDrawer extends BaseNavigationContainer {}
