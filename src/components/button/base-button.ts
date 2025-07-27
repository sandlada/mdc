/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'

/**
 * Supports inserting icon and label buttons.
 *
 * There are two implementations:
 * - mdc-button
 * - mdc-toggle-button
 * 
 * Available in 5 variants:
 * - filled (default)
 * - filled-tonal
 * - elevated
 * - outlined
 * - text
 *
 * ```html
 * <mdc-button variant="filled-tonal"></mdc-button>
 * <mdc-toggle-button variant="filled-tonal"></mdc-toggle-button>
 * ```
 *
 * Available in 5 sizes:
 * - extra-small
 * - small (default)
 * - medium
 * - large
 * - extra-large
 * 
 * ```html
 * <mdc-button size="medium"></mdc-button>
 * <mdc-toggle-button size="medium"></mdc-toggle-button>
 * ```
 *
 * Each button is available in 2 shapes:
 * - round (default)
 * - square
 *
 * ```html
 * <mdc-button shape="round"></mdc-button>
 * <mdc-toggle-button shape="square"></mdc-toggle-button>
 * ```
 *
 * @see
 * When passing in a tag, make sure your tag is an HTMLElement and not a text node:
 *
 * ```html
 * <mdc-button>
 *     <span>Delete</span>
 *     <mdc-icon slot="icon">delete</mdc-icon>
 * </mdc-button>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=57994-696&t=kLfic7eA8vKtkiiO-0
 */
export abstract class BaseButton extends mixinDelegatesAria(mixinElementInternals(LitElement)) {

    @property({ type: String, reflect: true, })
    public variant: 'filled' | 'filled-tonal' | 'elevated' | 'outlined' | 'text' = 'filled'

    @property({ type: String, reflect: true })
    public size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' = 'small'

    @property({ type: Boolean, attribute: 'trailing-icon' })
    public trailingIcon = false

    @property({ type: String })
    public shape: 'round' | 'square' = 'round'

    public abstract disabled: boolean

    @property({ type: Boolean, attribute: 'disable-morph' })
    public disableMorph: boolean = false
    
    @state()
    protected hasIcon: boolean = false
    @state()
    protected hasLabel: boolean = false

    @query('.container')
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
            [this.shape]: true,
            [this.size]: true,
            'has-icon': this.hasIcon,
            'has-label': this.hasLabel,
            'disable-morph': this.disableMorph,
            'disabled': this.disabled,
        })
    }

    protected override render(): TemplateResult {
        const { ariaHasPopup, ariaExpanded, ariaLabel } = this as AriaMixinStrict
        return html`
            <button 
                class="${classMap(this.getRenderClasses())}"
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled}
                aria-label=${ariaLabel || nothing}
                aria-haspopup=${ariaHasPopup || nothing}
                aria-expanded=${ariaExpanded || nothing}
            >
                ${this.variant === 'outlined' ? this.renderOutline() : nothing}
                ${['elevated', 'filled', 'filled-tonal'].includes(this.variant) ? this.renderElevation() : nothing}
                ${this.renderContent()}
                ${this.renderTouchTarget()}
                ${this.renderBackground()}
                <mdc-ripple part="ripple" ?disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring part="focus-ring"></mdc-focus-ring>
            </button>
        `
    }

    protected renderBackground() {
        return html`
            <span class="background" aria-hidden="true"></span>
        `
    }

    protected renderElevation(): unknown {
        return html`
            <mdc-elevation></mdc-elevation>
        `
    }

    protected renderOutline(): unknown {
        return html`
            <span class="outline" aria-hidden="true"></span>
        `
    }

    protected renderContent() {
        return html`
            ${this.trailingIcon ? nothing : this.renderIcon()}
            ${this.renderLabel()}
            ${this.trailingIcon ? this.renderIcon() : nothing}
        `
    }

    protected renderIcon() {
        return html`
            <span class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    protected renderLabel() {
        return html`
            <span class="label">
                <slot @slotchange=${this.handleLabelSlotChange}></slot>
            </span>
        `
    }

    protected renderTouchTarget() {
        return html`
            <span class="touch-target" aria-hidden="true"></span>        
        `
    }

    protected handleClick(e: MouseEvent) {
        if (this.disabled) {
            e.stopImmediatePropagation()
            e.preventDefault()
            return
        }
        if(!isActivationClick(e) || !this.buttonElement) {
            return
        }
        this.focus()
        dispatchActivationClick(this.buttonElement)
    }

    private handleIconSlotChange(e: Event) {
        this.hasIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleLabelSlotChange(e: Event) {
        this.hasLabel = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

}
