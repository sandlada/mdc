/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { MDCDockedToolbarStyles } from './internal/docked-toolbar.styles'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-docked-toolbar": MDCDockedToolbar
    }
}

class BaseMDCDockedToolbar extends LitElement {

    @property()
    public type: 'standard' | 'vibrant' = 'standard'

    @state()
    protected hasFab: boolean = false

    protected handleFabSlotChange(e: Event) {
        this.hasFab = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            'standard': this.type === 'standard',
            'vibrant': this.type === 'vibrant',
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
            <slot></slot>
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

@customElement('mdc-docked-toolbar')
export class MDCDockedToolbar extends BaseMDCDockedToolbar {

    public static override styles = [
        MDCDockedToolbarStyles,
    ]

    protected override render(): TemplateResult {
        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${this.renderContent()}
                ${this.renderBackground()}
            </div>
        `
    }

}
