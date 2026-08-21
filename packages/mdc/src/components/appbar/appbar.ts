/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 and MD3 Expressive App Bar component.
 *
 * App bars display navigation, actions, and text at the top of a screen.
 * They contain a headline/title, optional subtitle, navigation icon, and actions.
 *
 * @example
 * ```html
 * <!-- Small App Bar -->
 * <mdc-appbar headline="Page Title">
 *   <mdc-icon-button slot="leading"><mdc-icon>arrow_back</mdc-icon></mdc-icon-button>
 *   <mdc-icon-button slot="trailing"><mdc-icon>search</mdc-icon></mdc-icon-button>
 *   <mdc-icon-button slot="trailing"><mdc-icon>more_vert</mdc-icon></mdc-icon-button>
 * </mdc-appbar>
 *
 * <!-- Medium Flexible App Bar with Subtitle -->
 * <mdc-appbar variant="medium-flexible" headline="Daily activities" subtitle="Record new fitness goals">
 *   <mdc-icon-button slot="leading"><mdc-icon>arrow_back</mdc-icon></mdc-icon-button>
 *   <mdc-icon-button slot="trailing"><mdc-icon>add</mdc-icon></mdc-icon-button>
 * </mdc-appbar>
 *
 * <!-- Search App Bar -->
 * <mdc-appbar variant="search" headline="Search product">
 *   <mdc-icon-button slot="leading"><mdc-icon>menu</mdc-icon></mdc-icon-button>
 *   <mdc-icon-button slot="trailing"><mdc-icon>account_circle</mdc-icon></mdc-icon-button>
 * </mdc-appbar>
 * ```
 */
import { customElement } from 'lit/decorators.js'
import type { CSSResultGroup } from 'lit'
import { BaseAppBar } from './internal/base-appbar'
import { AppBarStyles } from './appbar.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-appbar': MDCAppBar
    }
}

/**
 * @version
 * Material Design 3 & Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/app-bars/specs
 */
@customElement('mdc-appbar')
export class MDCAppBar extends BaseAppBar {
    public static override styles: CSSResultGroup = AppBarStyles
}
