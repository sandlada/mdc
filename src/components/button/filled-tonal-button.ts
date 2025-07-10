/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { Button } from './button'
import { filledTonalButtonStyles } from './button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-filled-tonal-button": FilledTonalButton
    }
}

@customElement('mdc-filled-tonal-button')
export class FilledTonalButton extends Button {
    static override styles = filledTonalButtonStyles

    protected override renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }
}
