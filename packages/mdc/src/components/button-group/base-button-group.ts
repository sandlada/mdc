/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'

export abstract class BaseButtonGroup extends LitElement {
    


    protected override render(): TemplateResult {
        return html`
            <div class="container">
                ${this.renderButtons()}
            </div>
        `
    }

    protected renderButtons() {
        return html`
            <slot></slot>
        `
    }
}
