/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { cardStyles } from './card.style'

@customElement('mdc-card')
export class MDCCard extends mixinRippleOptions(LitElement) {

    static override styles = cardStyles

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property({ type: Boolean })
    public horizonal: boolean = false

    @property({ type: String })
    public variant: 'filled' | 'outlined' | 'elevated' = 'filled'

    public constructor() {
        super()
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            'stacked': !this.horizonal,
            'horizonal': this.horizonal,
        })
    }

    protected renderBackground() { return html`<span class="background" aria-hidden="true"></span>` }
    protected renderOutline()    { return html`<span class="outline" aria-hidden="true"></span>` }
    protected renderElevation()  { return html`<mdc-elevation></mdc-elevation>` }
    protected renderFocusRing()  { return html`<mdc-focus-ring></mdc-focus-ring>` }
    protected renderContent()    {
        return html`
            <div class="content">
                <slot></slot>
            </div>
        `
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                ${this.renderBackground()}
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${this.variant === 'elevated' ? this.renderElevation() : nothing}
                ${this.renderContent()}
            </div>
        `
    }
}
