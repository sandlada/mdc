/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { standardIconButtonStyle } from './icon-button.style'
import { TogglableIconButton } from './togglable-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-standard-icon-button": ToggleStandardIconButton
    }
}

@customElement('mdc-toggle-standard-icon-button')
export class ToggleStandardIconButton extends TogglableIconButton {
    static override styles = standardIconButtonStyle
}
