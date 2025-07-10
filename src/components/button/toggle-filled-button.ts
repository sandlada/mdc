/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { filledButtonStyles } from './button.style'
import { TogglableButton } from "./togglable-button"

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-filled-button": ToggleFilledButton
    }
}

@customElement('mdc-toggle-filled-button')
export class ToggleFilledButton extends TogglableButton {
    static override styles = filledButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
