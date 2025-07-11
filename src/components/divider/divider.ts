/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { DividerStyles } from './divider.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-divider": Divider
    }
}

@customElement('mdc-divider')
export class Divider extends LitElement {

    static override styles = DividerStyles

    @property({ type: Boolean, reflect: true })
    public inset = false

    @property({ type: Boolean, reflect: true, attribute: 'inset-start' })
    public insetStart = false

    @property({ type: Boolean, reflect: true, attribute: 'inset-end' })
    public insetEnd = false

}
