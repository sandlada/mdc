/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Bottom App Bar component.
 *
 * Web equivalent of Android Jetpack Compose Material 3 `BottomAppBar`.
 *
 * @example
 * ```html
 * <mdc-bottom-appbar>
 *   <mdc-icon-button aria-label="Check"><mdc-icon>check</mdc-icon></mdc-icon-button>
 *   <mdc-icon-button aria-label="Edit"><mdc-icon>edit</mdc-icon></mdc-icon-button>
 *   <mdc-fab slot="fab" open variant="tonal-secondary">
 *     <mdc-icon slot="icon">add</mdc-icon>
 *   </mdc-fab>
 * </mdc-bottom-appbar>
 * ```
 */
import type { CSSResultGroup } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../elevation/elevation'
import { BottomAppBarStyles } from './bottom-appbar.style'
import { BaseBottomAppBar } from './internal/base-bottom-appbar'

export * from './bottom-appbar.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-bottom-appbar': MDCBottomAppBar
    }
}

/**
 * @element mdc-bottom-appbar
 *
 * Material Design 3 Bottom App Bar.
 *
 * @slot - Up to 4 leading action icon buttons (`<mdc-icon-button>`).
 * @slot fab - Optional trailing embedded Floating Action Button (`<mdc-fab>`).
 *
 * @fires bottom-appbar-visibility-change - Fired when `hidden` changes via `exit-always` scroll behavior or `show()`/`hide()`.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-app-bar/overview
 * https://m3.material.io/components/bottom-app-bar/specs
 */
@customElement('mdc-bottom-appbar')
export class MDCBottomAppBar extends BaseBottomAppBar {
    public static override styles: CSSResultGroup = BottomAppBarStyles
}
