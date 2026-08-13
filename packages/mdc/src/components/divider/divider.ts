/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { DividerStyles } from './divider.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-divider": Divider
    }
}

@customElement('mdc-divider')
export class Divider extends LitElement {

    static override shadowRootOptions: ShadowRootInit = { mode: 'open', delegatesFocus: false }

    static override styles = DividerStyles

    @property({ type: Boolean, reflect: true })
    public inset = false

    @property({ type: Boolean, reflect: true, attribute: 'inset-start' })
    public insetStart = false

    @property({ type: Boolean, reflect: true, attribute: 'inset-end' })
    public insetEnd = false

    public constructor() {
        super()
        if(isServer) return
        if (!this.getAttribute('role')) this.setAttribute('role', 'separator')
        if (!this.getAttribute('aria-orientation')) this.setAttribute('aria-orientation', 'horizontal')
        if (!this.getAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true')
        if (!this.getAttribute('aria-label')) this.setAttribute('aria-label', 'Divider')
    }

}
