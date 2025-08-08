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
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { iconButtonStyles } from './icon-button.style'

/**
 * The icon-button component only supports inserting one icon.
 *
 * Provides 2 components:
 * - mdc-icon-button
 * - mdc-toggle-icon-button
 *
 * It is available in variants:
 * - filled
 * - filled-tonal
 * - outlined
 * - standard
 * 
 * It is available in 5 sizes:
 * - extra-small
 * - small
 * - medium
 * - large
 * - extra-large
 *
 * It is available in 3 widths:
 * - narrow
 * - default (default)
 * - wide
 *
 * It is available in 2 shapes:
 * - round (default)
 * - square
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
export abstract class BaseIconButton extends mixinDelegatesAria(mixinElementInternals(LitElement)) {

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
            'disable-morph': this.disableMorph
        })
    }

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
                <mdc-ripple for="button" part="ripple" .disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring for="button" part="focus-ring" .disabled=${this.disabled}></mdc-focus-ring>
            </button>
        `
    }

    protected renderBackground = () => html`<span class="background" aria-hidden="true" ></span>`
    protected renderOutline = () => html`<span class="outline" aria-hidden="true"></span>`
    protected renderIcon = () => html`<slot></slot>`
    protected renderTouchTarget() { return html`<span class="touch-target" aria-hidden="true"></span>` }

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
