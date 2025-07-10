/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from "lit/decorators.js"
import { Button } from './button'
import { textButtonStyles } from './button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-text-button": TextButton
    }
}

@customElement('mdc-text-button')
export class TextButton extends Button {
    static override styles = textButtonStyles

}
