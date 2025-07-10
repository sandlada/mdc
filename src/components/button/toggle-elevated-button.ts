/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { elevatedButtonStyles } from './button.style'
import { TogglableButton } from './togglable-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-elevated-button": ToggleElevatedButton
    }
}

@customElement('mdc-toggle-elevated-button')
export class ToggleElevatedButton extends TogglableButton {
    static override styles = elevatedButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
