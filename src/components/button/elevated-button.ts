/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { Button } from './button'
import { elevatedButtonStyles } from './button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-elevated-button": ElevatedButton
    }
}

@customElement('mdc-elevated-button')
export class ElevatedButton extends Button {
    static override styles = elevatedButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
