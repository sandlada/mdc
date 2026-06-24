/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

export abstract class BaseMDCToolbar extends LitElement {

    @property({ type: String })
    public color: 'standard' | 'vibrant' = 'standard'

    @property({ type: String })
    public direction: 'vertical' | 'horizonal' = 'horizonal'

    @state()
    protected hasFab: boolean = false

    protected handleFabSlotChange(e: Event) {
        this.hasFab = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.color]: true,
            [this.direction]: true,
            'has-fab': this.hasFab,
        })
    }

    protected renderFabSlot() {
        return html`
            <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
        `
    }

    protected renderBackground() {
        return html`<span class="background" aria-hidden="true"></span>`
    }

    protected renderContent() {
        return html`
            <div class="content">
                <slot></slot>
            </div>
        `
    }

    protected override render(): TemplateResult {
        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${this.renderContent()}
                ${this.renderBackground()}
            </div>
        `
    }
}
