/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../elevation/mixin-elevation-options'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { cardStyles } from './card.style'

@customElement('mdc-card')
export class MDCCard extends composeMixin(
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions
)(LitElement) {

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

    @query('.container')
    private readonly rootElement!: HTMLElement | null

    public override focus() {
        this.rootElement?.focus()
    }
    public override blur() {
        this.rootElement?.blur()
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
    protected renderContent()    {
        return html`
            <div class="content">
                <slot></slot>
            </div>
        `
    }

    protected override render(): TemplateResult {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                ${this.renderBackground()}
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${this.variant === 'elevated' ? this.renderElevation() : nothing}
                ${this.renderContent()}
            </button>
        `
    }
}
