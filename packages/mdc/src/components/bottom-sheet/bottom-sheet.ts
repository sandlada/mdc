/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseBottomSheet } from './internal/base-bottom-sheet'
import { bottomSheetStyles } from './bottom-sheet.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-bottom-sheet': BottomSheet
    }
}

/**
 * Material Design 3 Bottom Sheet.
 *
 * A horizontally-spanning panel anchored to the bottom edge of the viewport.
 * Two variants:
 *  - standard: co-exists with main UI, no scrim, `surface` background. Supports
 *    3 display stages (closed, peek [header only], full [header + content]) and
 *    single-step drag transitions.
 *  - modal: blocks interaction via a scrim, `surface-container-low` background,
 *    focus trap, dismissible via Esc or scrim tap. Supports 3 display stages
 *    (closed, peek [header only], full [header + content]) and single-step drag transitions.
 *
 * Default variant is `modal`.
 *
 * @slot header - Upper slot. Rendered in both `peek` and `full` states. Ideal for
 *                compact titles, action bars, search fields, or mini-players.
 * @slot - Body / lower content slot. Rendered only in `full` state; hidden in `peek` state.
 *
 * @example
 * ```html
 * <mdc-bottom-sheet variant="standard" detent="peek">
 *     <div slot="header" style="display: flex; justify-content: space-between;">
 *         <span>Selected 3 photos</span>
 *         <mdc-button variant="text">Share</mdc-button>
 *     </div>
 *     <div class="details">
 *         <h3>Photo Details</h3>
 *         <p>Location, date, and EXIF information...</p>
 *     </div>
 * </mdc-bottom-sheet>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-sheets/overview
 */
@customElement('mdc-bottom-sheet')
export class BottomSheet extends BaseBottomSheet {
    public static override styles = bottomSheetStyles
}
