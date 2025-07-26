/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'

/**
 * Fab components provide an icon.
 *
 * @see
 * The fab component is the simplest button. Do not use the fab component in the form.
 *
 * Available in 6 variants:
 * - variant="primary"
 * - variant="secondary"
 * - variant="tertiary"
 * - variant="tonal-primary"
 * - variant="tonal-secondary" (default)
 * - variant="tonal-tertiary"
 *
 * The fab component is available in 3 sizes:
 * - size="small" (default)
 * - size="medium"
 * - size="large"
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/floating-action-button/overview
 */
export abstract class BaseFab extends LitElement {

    @query('.button')
    private buttonElement!: HTMLElement | null

    @property({ type: String, reflect: true })
    public variant: 'primary' | 'secondary' | 'tertiary' | 'tonal-primary' | 'tonal-secondary' | 'tonal-tertiary' = 'tonal-secondary'

    @property({ type: String })
    public size: 'small' | 'medium' | 'large' = 'small'

    @state()
    private hasIcon: boolean = false

    protected getRenderClasses() {
        return ({
            [this.variant]: true,
            [this.size]: true,
            'has-icon': this.hasIcon,
        })
    }

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render(): unknown {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                <mdc-ripple part="ripple"></mdc-ripple>
                <mdc-focus-ring part="focus-ring"></mdc-focus-ring>
                <mdc-elevation part="elevation"></mdc-elevation>

                ${this.renderIcon()}
            </button>
        `
    }

    protected renderIcon() {
        return html`
            <span class="icon">
                <slot name="icon" .aria-hidden=${this.ariaLabel} @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    private handleClick(e: Event) {
        if(!isActivationClick(e) || !this.buttonElement) {
            return
        }
        dispatchActivationClick(this.buttonElement)
    }

    private handleIconSlotChange(e: Event) {
        this.hasIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
}
