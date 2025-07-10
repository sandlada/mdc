/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { Button } from './button'
import { filledButtonStyles } from './button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-filled-button": FilledButton
    }
}

@customElement('mdc-filled-button')
export class FilledButton extends Button {
    static override styles = filledButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
