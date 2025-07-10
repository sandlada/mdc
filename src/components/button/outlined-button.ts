/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { Button } from './button'
import { outlinedButtonStyles } from './button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-outlined-button": OutlinedButton
    }
}

@customElement('mdc-outlined-button')
export class OutlinedButton extends Button {
    static override styles = outlinedButtonStyles

    protected override renderOutline(): unknown {
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }
}
