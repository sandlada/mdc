/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { filledTonalButtonStyles } from './button.style'
import { TogglableButton } from "./togglable-button"

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-filled-tonal-button": ToggleFilledTonalButton
    }
}

@customElement('mdc-toggle-filled-tonal-button')
export class ToggleFilledTonalButton extends TogglableButton {
    static override styles = filledTonalButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
