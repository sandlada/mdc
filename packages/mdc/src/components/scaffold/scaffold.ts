/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 and MD3 Expressive Scaffold layout component.
 *
 * Provides a canonical screen layout coordinating App Bar, Navigation Rail (Start/End),
 * Navigation Drawer (Start/End), Body content, Bottom Bar, Bottom Sheet, FAB, and Snackbar Host.
 *
 * @example
 * ```html
 * <!-- Adaptive Full-Height Rail Layout (MD3 Standard) -->
 * <mdc-scaffold>
 *   <mdc-navigation-rail slot="rail">
 *     <!-- Rail tabs -->
 *   </mdc-navigation-rail>
 *
 *   <mdc-appbar slot="appbar" headline="Dashboard"></mdc-appbar>
 *
 *   <div class="content">
 *     <!-- Main page contents -->
 *   </div>
 *
 *   <mdc-fab slot="fab" icon="add" label="Create"></mdc-fab>
 * </mdc-scaffold>
 * ```
 */
import { customElement } from 'lit/decorators.js'
import type { CSSResultGroup } from 'lit'
import { BaseScaffold } from './internal/base-scaffold'
import { ScaffoldStyles } from './scaffold.style'

export * from './scaffold.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-scaffold': MDCScaffold
    }
}

/**
 * @element mdc-scaffold
 *
 * Material Design 3 adaptive screen scaffold.
 *
 * @slot - The primary body content area.
 * @slot appbar - Top App Bar (<mdc-appbar>).
 * @slot rail / start-rail - Primary Navigation Rail on the start side (<mdc-navigation-rail>).
 * @slot drawer / start-drawer - Primary Navigation Drawer (<mdc-navigation-drawer>).
 * @slot end-rail / trailing-rail - Secondary/Inspector Rail on the end side.
 * @slot end-drawer / side-sheet - Secondary Drawer / Side Sheet on the end side (<mdc-side-sheet>).
 * @slot bottom-bar / navigation-bar - Bottom Navigation Bar (<mdc-navigation-bar>).
 * @slot bottom-sheet - Bottom Sheet (<mdc-bottom-sheet>).
 * @slot fab - Floating Action Button (<mdc-fab>).
 * @slot snackbar-host - Snackbar Host (<mdc-snackbar-host>).
 *
 * @version
 * Material Design 3 & Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/foundations/layout/canonical-layouts/overview
 */
@customElement('mdc-scaffold')
export class MDCScaffold extends BaseScaffold {
    public static override styles: CSSResultGroup = ScaffoldStyles
}
