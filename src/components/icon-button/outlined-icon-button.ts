/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { IconButton } from './icon-button'
import { outlinedIconButtonStyle } from './icon-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-outlined-icon-button": OutlinedIconButton
    }
}

@customElement('mdc-outlined-icon-button')
export class OutlinedIconButton extends IconButton {
    static override styles = outlinedIconButtonStyle

    protected override renderOutline(): unknown {
        return html`
            <span aria-hidden="true" class="outline"></span>
        `
    }
}
