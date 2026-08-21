/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import {
    type CardShape,
    type CardVariant,
    type ICard,
} from './card.interface'
import { cardStyles } from './card.style'

export * from './card.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-card': MDCCard
    }
}

/**
 * @element mdc-card
 *
 * Material Design 3 Card component.
 *
 * Cards contain content and actions about a single subject.
 * Supports 3 variants: `filled` (default), `elevated`, and `outlined`.
 * Supports `interactive` mode (with ripple and focus ring) or static container mode.
 * Supports `horizontal` or `stacked` (vertical, default) layout.
 * Supports `shape="round"` (12px radius) or `shape="square"`.
 *
 * @slot - Default slot for card content.
 *
 * @cssproperty --mdc-card-enabled-container-color
 * @cssproperty --mdc-card-container-shape-start-start
 * @cssproperty --mdc-card-container-shape-start-end
 * @cssproperty --mdc-card-container-shape-end-start
 * @cssproperty --mdc-card-container-shape-end-end
 * @cssproperty --mdc-card-container-padding-inline-start
 * @cssproperty --mdc-card-container-padding-inline-end
 * @cssproperty --mdc-card-container-padding-block-start
 * @cssproperty --mdc-card-container-padding-block-end
 * @cssproperty --mdc-card-enabled-container-elevation
 * @cssproperty --mdc-card-enabled-container-shadow-color
 * @cssproperty --mdc-card-enabled-outline-color
 * @cssproperty --mdc-card-outline-width
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/cards/overview
 * https://m3.material.io/components/cards/specs
 * https://m3.material.io/components/cards/guidelines
 */
@customElement('mdc-card')
export class MDCCard extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions
)(LitElement) implements ICard {

    static override styles = cardStyles

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property({ type: String, reflect: true })
    public variant: CardVariant = 'filled'

    @property({ type: Boolean, reflect: true })
    public interactive: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: Boolean, reflect: true })
    public horizontal: boolean = false

    @property({ type: String, reflect: true })
    public shape: CardShape = 'round'

    @property({ type: String, reflect: true })
    public href: string = ''

    @property({ type: String, reflect: true })
    public target: string = ''

    @property({ type: Number })
    public cardTabIndex: number = 0

    @query('.container')
    protected readonly rootElement!: HTMLElement | null

    public get isInteractive(): boolean {
        return this.interactive || Boolean(this.href)
    }

    public override get rippleControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }

    public override get focusRingControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }

    public constructor() {
        super()
    }

    public override focus() {
        this.rootElement?.focus()
    }

    public override blur() {
        this.rootElement?.blur()
    }

    public override click() {
        this.rootElement?.click()
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            [this.shape]: true,
            'interactive': this.isInteractive,
            'stacked': !this.horizontal,
            'horizontal': this.horizontal,
            'disabled': this.disabled,
        })
    }

    protected renderBackground(): TemplateResult {
        return html`<span class="background" aria-hidden="true"></span>`
    }

    protected renderOutline(): TemplateResult {
        return html`<span class="outline" aria-hidden="true"></span>`
    }

    protected renderContent(): TemplateResult {
        return html`
            <div class="content">
                <slot></slot>
            </div>
        `
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const tabIndex = this.disabled ? -1 : this.cardTabIndex
        const content = html`
            ${this.renderBackground()}
            ${this.variant === 'outlined' ? this.renderOutline() : nothing}
            ${this.renderElevation()}
            ${this.isInteractive ? this.renderRipple() : nothing}
            ${this.isInteractive ? this.renderFocusRing() : nothing}
            ${this.renderContent()}
        `

        if (this.href) {
            return html`
                <a
                    class="${classMap(this.getRenderClasses())}"
                    href=${this.href}
                    target=${this.target || nothing}
                    aria-label=${ariaLabel || nothing}
                    aria-disabled=${this.disabled ? 'true' : nothing}
                    tabindex=${tabIndex}
                    @click=${this.handleClick}
                >
                    ${content}
                </a>
            `
        }

        if (this.interactive) {
            return html`
                <button
                    type="button"
                    class="${classMap(this.getRenderClasses())}"
                    ?disabled=${this.disabled}
                    aria-label=${ariaLabel || nothing}
                    aria-disabled=${this.disabled ? 'true' : nothing}
                    tabindex=${tabIndex}
                    @click=${this.handleClick}
                >
                    ${content}
                </button>
            `
        }

        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                aria-label=${ariaLabel || nothing}
            >
                ${content}
            </div>
        `
    }

    private handleClick(e: MouseEvent): void {
        if (this.disabled) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }
}
