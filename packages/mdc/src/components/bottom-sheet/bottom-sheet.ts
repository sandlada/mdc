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
 *  - standard: co-exists with main UI, no scrim, `surface` background
 *  - modal: blocks interaction via a scrim, `surface-container-low` background
 *
 * Default variant is `modal`. The modal variant supports two detents
 * (`peek`, `full`). A drag handle is rendered at the top of the panel —
 * pointer-down on it initiates a swipe-to-dismiss gesture (can be disabled
 * via `draggable="false"`). Set `hide-drag-handle` to hide the visual
 * bar while keeping swipe-to-dismiss functional.
 *
 * The element renders only the drag handle and the content slot. Headlines,
 * close buttons, and action bars are intentionally NOT provided — developers
 * compose those inside the default slot.
 *
 * @slot - Body content. The developer composes everything (titles, action
 *         buttons, dividers, etc.) inside this slot.
 *
 * @example
 * ```html
 * <mdc-bottom-sheet variant="modal" detent="peek">
 *     <h2>Filters</h2>
 *     <p>Filter content</p>
 *     <mdc-button onclick="this.closest('mdc-bottom-sheet').close()">
 *         <span>Apply</span>
 *     </mdc-button>
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
