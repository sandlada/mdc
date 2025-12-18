/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { typographyStyles } from './internal/typography.styles'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-typography": MDCTypography
    }
}

type TypographyVariant =
    'display-large'    |
    'display-medium'   |
    'display-small'    |
    'headline-large'   |
    'headline-medium'  |
    'headline-small'   |
    'title-large'      |
    'title-medium'     |
    'title-small'      |
    'body-large'       |
    'body-medium'      |
    'body-small'       |
    'label-large'      |
    'label-medium'     |
    'label-small'

export interface IMDCTypographyAttributes {
    emphasized: boolean
    variant   : TypographyVariant
}

/**
 * Used to display text.
 *
 * Provides 5 series:
 * - display
 * - headline
 * - title
 * - body
 * - label
 *
 * Each series provides 3 sizes:
 * - small
 * - medium
 * - large
 *
 * In the M3 Expressive update, a new emphasized option was added.
 * Enabling emphasized will make the font bold.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/styles/typography/overview
 */
@customElement('mdc-typography')
export class MDCTypography extends LitElement implements IMDCTypographyAttributes {

    static override styles = typographyStyles

    @property({ type: Boolean, reflect: true })
    public emphasized: boolean = false

    @property({ type: String, reflect: true })
    public variant: TypographyVariant = 'body-medium'

    protected override render(): unknown {
        return html`
            <slot></slot>
        `
    }

    protected override updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        if (changedProperties.has('variant')) {
            this.updateSemantics();
        }
    }

    private updateSemantics() {
        this.removeAttribute('role')
        this.removeAttribute('aria-level')

        if (this.variant.startsWith('display') || this.variant.startsWith('headline')) {
            this.setAttribute('role', 'heading')

            let level = '2'
            if (this.variant === 'display-large') level = '1'
            else if (this.variant === 'display-medium') level = '1'
            else if (this.variant === 'display-small') level = '2'
            else if (this.variant === 'headline-large') level = '2'
            else if (this.variant === 'headline-medium') level = '3'
            else if (this.variant === 'headline-small') level = '4'

            this.setAttribute('aria-level', level)
        }
    }
}
