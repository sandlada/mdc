/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { IconButton } from './icon-button'
import { filledTonalIconButtonStyle } from './icon-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-filled-tonal-icon-button": FilledTonalIconButton
    }
}

@customElement('mdc-filled-tonal-icon-button')
export class FilledTonalIconButton extends IconButton {
    static override styles = filledTonalIconButtonStyle
}
