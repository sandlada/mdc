/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 and MD3 Expressive Scaffold layout component.
 *
 * Web equivalent of Android Jetpack Compose Material 3 `Scaffold`
 * (`topBar`, `bottomBar`, `snackbarHost`, `floatingActionButton`,
 * `floatingActionButtonPosition`, `containerColor`, `contentColor`,
 * `contentWindowInsets`, `content: (PaddingValues) -> Unit`) combined with
 * `NavigationSuiteScaffold` width & height window-size-class behaviour.
 *
 * @example
 * ```html
 * <!-- Adaptive Full-Height Rail / NavigationBar Layout (MD3 Standard) -->
 * <mdc-scaffold>
 *   <mdc-navigation-rail slot="rail">
 *     <!-- Rail tabs -->
 *   </mdc-navigation-rail>
 *
 *   <mdc-navigation-bar slot="navigation-bar">
 *     <!-- Compact bottom navigation tabs -->
 *   </mdc-navigation-bar>
 *
 *   <mdc-appbar slot="appbar" headline="Dashboard"></mdc-appbar>
 *
 *   <div class="content">
 *     <!-- Main page contents -->
 *   </div>
 *
 *   <mdc-fab slot="fab" icon="add" label="Create"></mdc-fab>
 *   <mdc-snackbar-host slot="snackbar-host"></mdc-snackbar-host>
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
 * @slot bottom-bar - Persistent Bottom Bar / Docked Toolbar (<mdc-docked-toolbar>).
 * @slot navigation-bar - Adaptive Bottom Navigation Bar (<mdc-navigation-bar>).
 * @slot bottom-sheet - Bottom Sheet (<mdc-bottom-sheet>).
 * @slot fab - Floating Action Button (<mdc-fab>).
 * @slot snackbar-host - Snackbar Host (<mdc-snackbar-host>).
 *
 * @fires scaffold-layout-change - Fired when effective layout mode, height mode, navigation type, or inner padding changes.
 *
 * @cssprop --mdc-scaffold-inner-padding-top - Computed top inner padding (px).
 * @cssprop --mdc-scaffold-inner-padding-bottom - Computed bottom inner padding (px).
 * @cssprop --mdc-scaffold-inner-padding-start - Computed inline-start inner padding (px).
 * @cssprop --mdc-scaffold-inner-padding-end - Computed inline-end inner padding (px).
 *
 * @version
 * Material Design 3 & Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/foundations/layout/canonical-layouts/overview
 * https://developer.android.com/reference/kotlin/androidx/compose/material3/Scaffold
 */
@customElement('mdc-scaffold')
export class MDCScaffold extends BaseScaffold {
    public static override styles: CSSResultGroup = ScaffoldStyles
}
