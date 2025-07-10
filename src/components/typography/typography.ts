/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { typographyStyles } from './typography.styles'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-typography": Typography
    }
}

type TypographyVariant =
    'display-large' |
    'display-medium' |
    'display-small' |
    'headline-large' |
    'headline-medium' |
    'headline-small' |
    'title-large' |
    'title-medium' |
    'title-small' |
    'body-large' |
    'body-medium' |
    'body-small' |
    'label-large' |
    'label-medium' |
    'label-small'

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
export class Typography extends LitElement {

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
}
