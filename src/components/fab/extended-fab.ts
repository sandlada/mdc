/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import "../elevation/elevation"
import "../focus-ring/focus-ring"
import "../ripple/ripple"
import { Fab } from './fab'

/**
 * Extended Fab components provide an icon and an label (label is optional).
 *
 * @see
 * The fab component is the simplest button. Do not use the fab component in the form.
 *
 * Available in 6 variants:
 * - mdc-extended-primary-fab
 * - mdc-extended-secondary-fab
 * - mdc-extended-tertiary-fab
 * - mdc-extended-tonal-primary-fab
 * - mdc-extended-tonal-secondary-fab
 * - mdc-extended-tonal-tertiary-fab
 *
 * The mdc-extended-*-fab component is available in 3 sizes:
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
export class ExtendedFab extends Fab {

    @property({ type: String })
    public label: string = ''

    protected override render(): unknown {
        const classes = classMap({
            'extended': true,
            [this.size]: true,
            'button': true,
        })

        return html`
            <button class="${classes}">
                <mdc-ripple part="ripple"></mdc-ripple>
                <mdc-focus-ring part="focus-ring"></mdc-focus-ring>
                <mdc-elevation part="elevation"></mdc-elevation>

                ${this.renderIcon()}
                ${this.label ? this.renderLabel() : nothing}
            </button>
        `
    }

    protected override renderIcon() {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <slot class="icon" .aria-hidden=${ariaLabel || this.label}></slot>
        `
    }

    protected renderLabel() {
        return html`
            <span class="label">${this.label}</span>
        `
    }

}
