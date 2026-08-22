/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Navigation Drawer container.
 *
 * Supports three variants:
 * - **Modal** (`variant="modal"`): Floating overlay above content with a scrim backdrop (default).
 * - **Standard** (`variant="standard"`): In-flow collapsible drawer sharing screen space with content.
 * - **Permanent** (`variant="permanent"`): Persistent fixed drawer always visible in flow.
 *
 * @example
 * ```html
 * <!-- Modal navigation drawer -->
 * <mdc-navigation-drawer id="drawer" variant="modal" headline="Mail">
 *   <mdc-navigation-tab name="drawer-tabs" value="/inbox" checked label="Inbox">
 *     <mdc-icon slot="inactive-icon">inbox</mdc-icon>
 *     <mdc-icon slot="active-icon" filled>inbox</mdc-icon>
 *   </mdc-navigation-tab>
 *   <mdc-navigation-tab name="drawer-tabs" value="/outbox" label="Outbox">
 *     <mdc-icon slot="inactive-icon">send</mdc-icon>
 *     <mdc-icon slot="active-icon" filled>send</mdc-icon>
 *   </mdc-navigation-tab>
 * </mdc-navigation-drawer>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/navigation-drawer/overview
 * https://m3.material.io/components/navigation-drawer/specs
 */
import { customElement } from 'lit/decorators.js'
import '../elevation/elevation'
import '../divider/divider'
import { BaseNavigationDrawer } from './internal/base-navigation-drawer'
import { NavigationDrawerStyles } from './navigation-drawer.style'

export * from './navigation-drawer.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-drawer': NavigationDrawer
    }
}

/**
 * Material Design 3 Navigation Drawer.
 *
 * @version "Material Design 3"
 */
@customElement('mdc-navigation-drawer')
export class NavigationDrawer extends BaseNavigationDrawer {
    public static override styles = NavigationDrawerStyles
}
