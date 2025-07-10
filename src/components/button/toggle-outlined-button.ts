/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { outlinedButtonStyles } from './button.style'
import { TogglableButton } from "./togglable-button"

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-outlined-button": ToggleOutlinedButton
    }
}

@customElement('mdc-toggle-outlined-button')
export class ToggleOutlinedButton extends TogglableButton {
    static override styles = outlinedButtonStyles

    protected override renderOutline(): unknown {
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }
}
