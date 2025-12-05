/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { styles } from './icon.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-icon": MDCIcon
    }
}

export interface IMDCIconAttributes {
    name       ?: string
    filled      : boolean
    weight      : number
    grade       : number
    opticalSize : number
}

/**
 * mdc-icon sets the size and font by default.
 *
 * If you use an external font, the global style of the external font
 * will override the style of `@layer` mdc.icon.base.
 *
 * Because the priority of `@layer` style is lower than that of global style,
 * you need to manually cancel the font size of the external style
 * to make the font style of mdc-icon take effect.
 *
 * The following code example shows an icon send
 * modified.
 * You must set `style="font-size: 18px"` to change the mdc-icon icon size.
 *
 * @example
 * ```html
 * <mdc-button>
 *     <span>Filled Button with Icon</span>
 *     <mdc-icon slot="icon" name="send" style="font-size: 14px;"></mdc-icon>
 * </mdc-button>
 * ```
 * @version
 * Material Design 3 - MaterialSymbols Supported
 *
 * @link
 * https://m3.material.io/styles/icons/overview
 */
@customElement('mdc-icon')
export class MDCIcon extends composeMixin(mixinDelegatesAria)(LitElement) implements IMDCIconAttributes {

    static override styles = styles

    /**
     * The name of the icon (ligature text).
     * Recommended over slot content for dynamic icons.
     */
    @property({ type: String })
    public name?: string

    /**
     * Material Symbols: Fill axis (0 or 1).
     */
    @property({ type: Boolean, reflect: true })
    public filled: boolean = false

    /**
     * Material Symbols: Weight axis (100-700).
     * Default is 400.
     */
    @property({ type: Number, reflect: true })
    public weight: number = 400

    /**
     * Material Symbols: Grade axis (-25, 0, 200).
     * Granular weight adjustments.
     */
    @property({ type: Number, reflect: true })
    public grade: number = 0

    /**
     * Material Symbols: Optical Size axis (20-48).
     * Adjusts stroke thickness based on icon size.
     */
    @property({ type: Number, attribute: 'optical-size', reflect: true })
    public opticalSize: number = 24

    protected override render() {
        const fontSettings = `'FILL' ${this.filled ? 1 : 0}, 'wght' ${this.weight}, 'GRAD' ${this.grade}, 'opsz' ${this.opticalSize}`;

        const style = {
            'font-variation-settings': fontSettings
        }

        return html`
            <span class="icon-container" style="${styleMap(style)}">
                ${this.name ? this.name : html`<slot></slot>`}
            </span>
        `
    }

    override connectedCallback() {
        super.connectedCallback()
        this.updateAriaState()
    }

    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties)
        // If aria attributes change dynamically (e.g. user sets label later), re-evaluate
        if (changedProperties.has('ariaLabel') || changedProperties.has('ariaLabelledBy')) {
            this.updateAriaState()
        }
    }

    /**
     * Intelligently manages aria-hidden.
     * Default to hidden (decorative), but reveal if labeled (semantic).
     */
    private updateAriaState() {
        const hasLabel = this.hasAttribute('aria-label') || this.hasAttribute('aria-labelledby')
        const explicitHidden = this.getAttribute('aria-hidden')

        // If user explicitly set aria-hidden="false", respect it
        if (explicitHidden === 'false') {
            return
        }

        if (hasLabel) {
            // It has semantic meaning, ensure it is NOT hidden
            this.removeAttribute('aria-hidden')
        } else {
            // It is decorative, ensure it IS hidden
            this.setAttribute('aria-hidden', 'true')
        }
    }

}
