/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import "../elevation/elevation"
import "../focus-ring/focus-ring"
import "../ripple/ripple"

/**
 * Normal Fab components only provide an icon. To provide an label, use extended-fab.
 *
 * @see
 * The fab component is the simplest button. Do not use the fab component in the form.
 *
 * Available in 6 variants:
 * - mdc-primary-fab
 * - mdc-secondary-fab
 * - mdc-tertiary-fab
 * - mdc-tonal-primary-fab
 * - mdc-tonal-secondary-fab
 * - mdc-tonal-tertiary-fab
 *
 * The mdc-*-fab component is available in 3 sizes:
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
export class Fab extends mixinDelegatesAria(LitElement) {

    @property({ type: String })
    public size: 'small' | 'medium' | 'large' = 'small'

    @query('.button')
    private buttonElement!: HTMLElement | null

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render(): unknown {
        const classes = classMap({
            [this.size]: true,
            'button': true,
        })

        return html`
            <button class="${classes}">
                <mdc-ripple part="ripple"></mdc-ripple>
                <mdc-focus-ring part="focus-ring"></mdc-focus-ring>
                <mdc-elevation part="elevation"></mdc-elevation>

                ${this.renderIcon()}
            </button>
        `
    }

    protected renderIcon() {
        return html`
            <slot class="icon" .aria-hidden=${this.ariaLabel}></slot>
        `
    }

    private handleClick(e: Event) {
        if(!isActivationClick(e) || !this.buttonElement) {
            return
        }
        dispatchActivationClick(this.buttonElement)
    }

}
