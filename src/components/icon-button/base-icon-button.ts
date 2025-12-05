/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { iconButtonStyles } from './icon-button.style'

/**
 * The icon-button component only supports inserting one icon.
 *
 * @implements
 * - mdc-icon-button
 * - mdc-toggle-icon-button
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
export abstract class BaseMDCIconButton extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) {

    static override styles = iconButtonStyles

    public abstract disabled: boolean

    @property({ type: String })
    public variant: 'filled' | 'filled-tonal' | 'outlined' | 'standard' = 'standard'

    @property({ type: String })
    public size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' = 'small'

    @property({ type: String })
    public width: 'narrow' | 'default' | 'wide' = 'default'

    @property({ type: String })
    public shape: 'round' | 'square' = 'round'

    /**
     * When a button is clicked,
     * the rounded corners of the button will change in size.
     * Enable this flag to disable the change in rounded corners.
     */
    @property({ type: Boolean, attribute: 'disable-morph' })
    public disableMorph: boolean = false

    @query('#button')
    protected readonly buttonElement!: HTMLElement | null

    public override focus() {
        this.buttonElement?.focus()
    }
    public override blur() {
        this.buttonElement?.blur()
    }

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            [this.size]: true,
            [this.width]: true,
            [this.shape]: true,
            'disabled': this.disabled,
            'disable-morph': this.disableMorph,
        })
    }

    public override focusRingHtmlFor: string | null = 'button'
    public override rippleHtmlFor: string | null = 'button'

    protected override render(): TemplateResult {
        const { ariaHasPopup, ariaExpanded, ariaLabel } = this as AriaMixinStrict
        return html`
            <button
                class="${classMap(this.getRenderClasses())}"
                id="button"
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled}
                aria-label=${ariaLabel || nothing}
                aria-haspopup=${ariaHasPopup! || nothing}
                aria-expanded=${ariaExpanded! || nothing}
            >
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${this.renderIcon()}
                ${this.renderBackground()}
                ${this.renderTouchTarget()}
                ${this.renderRipple()}
                ${this.renderFocusRing()}
            </button>
        `
    }

    protected renderBackground() {
        return html`<span class="background" aria-hidden="true" ></span>`
    }
    protected renderOutline() {
        return html`<span class="outline" aria-hidden="true"></span>`
    }
    protected renderIcon() {
        return html`
            <slot></slot>
        `
    }
    protected renderTouchTarget() {
        return html`<span class="touch-target" aria-hidden="true"></span>`
    }

    protected async handleClick(e: MouseEvent) {
        if (this.disabled) {
            e.stopImmediatePropagation()
            e.preventDefault()
            return
        }
        if(!isActivationClick(e) || !this.buttonElement) {
            return
        }
        await 0
        this.focus()
        dispatchActivationClick(this.buttonElement)
    }

}
