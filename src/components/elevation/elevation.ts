/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { styles } from './elevation.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-elevation": Elevation
    }
}

/**
 * Elevation is not a concept that is explicitly categorized as a component.
 *
 * It represents the shadow of an object and is usually used to express the level at which an object is located.
 *
 * @example
 * ```html
 * <button class="button">
 *   <mdc-elevation></mdc-elevation>
 * </button>
 * <style>
 * .button {
 *   position: relative;
 *    --mdc-elevation-level: 3;
 * }
 * .button:hover {
 *    --mdc-elevation-level: 4;
 * }
 * .button:active {
 *    --mdc-elevation-level: 2;
 * }
 * </style>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/styles/elevation/overview
 */
@customElement('mdc-elevation')
export class Elevation extends LitElement {

    static override styles = styles

    protected override render() {
        return html`
            <span aria-hidden="true" class="elevation"></span>
        `
    }

}
