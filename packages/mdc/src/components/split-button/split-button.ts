/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-split-button` element — a two-segment control made of an
 * independent leading button and trailing button.
 */
import { customElement } from 'lit/decorators.js'
import { BaseSplitButton } from './internal/base-split-button'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-split-button': SplitButton
    }
}

/**
 * @element mdc-split-button
 *
 * A two-segment control that presents a primary action (the leading button)
 * next to a related-action trigger (the trailing button), sharing one
 * container, height and corner radius. The two buttons are independent: each
 * owns its own ripple, focus ring, elevation and disabled state.
 *
 * Available in 4 variants: `filled` (default), `filled-tonal`, `elevated`,
 * `outlined`.
 *
 * Available in 5 sizes: `extra-small`, `small` (default), `medium`, `large`,
 * `extra-large`.
 *
 * ```html
 * <mdc-split-button variant="filled-tonal" size="medium">
 *     Save
 *     <mdc-icon slot="trailing-icon" name="arrow_drop_down"></mdc-icon>
 * </mdc-split-button>
 * ```
 *
 * When the trailing button opens a menu, set `expanded` to morph it into its
 * expanded shape:
 *
 * ```html
 * <mdc-split-button expanded>
 *     Save
 *     <mdc-icon slot="trailing-icon" name="arrow_drop_down"></mdc-icon>
 * </mdc-split-button>
 * ```
 *
 * @slot — The leading button label.
 * @slot icon — Optional leading button icon.
 * @slot trailing-icon — The trailing button graphic (typically a chevron).
 * @slot trailing-label — Optional trailing button label.
 *
 * @fires leading-button-interaction — Dispatched when the leading button is
 *     activated.
 * @fires trailing-button-interaction — Dispatched when the trailing button is
 *     activated.
 *
 * @cssproperty --mdc-split-button-enabled-container-color
 * @cssproperty --mdc-split-button-enabled-label-color
 * @cssproperty --mdc-split-button-enabled-icon-color
 * @cssproperty --mdc-split-button-enabled-container-elevation
 * @cssproperty --mdc-split-button-{size}-container-height
 * @cssproperty --mdc-split-button-{size}-leading-button-inline-leading-padding-space
 * @cssproperty --mdc-split-button-{size}-trailing-button-inline-trailing-padding-space
 * @cssproperty --mdc-split-button-{size}-trailing-icon-size
 * ...
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/split-button/overview
 * https://developer.android.com/reference/kotlin/androidx/compose/material3/SplitButton
 */
@customElement('mdc-split-button')
export class SplitButton extends BaseSplitButton {
    static override styles = BaseSplitButton.styles
}
