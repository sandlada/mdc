/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { styles } from './icon.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-icon": Icon
    }
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
 * The following code example shows an icon delete
 * modified by the external class style `.material-symbols-outlined`.
 * You must set `style="font-size: unset;"` to make the mdc-icon icon size display normally.
 *
 * @example
 * ```html
 * <mdc-filled-tonal-button size="extra-large">
 *     Filled Button with Icon
 *     <mdc-icon slot="icon">
 *         <span class="material-symbols-outlined" style="font-size: unset;">
 *             delete
 *         </span>
 *     </mdc-icon>
 *  </mdc-filled-tonal-button>
 * ```
 * @version
 * Material Design
 *
 * @link
 * https://m3.material.io/styles/icons/overview
 */
@customElement('mdc-icon')
export class Icon extends mixinDelegatesAria(LitElement) {

    static override styles = styles

    protected override render() {
        return html`
            <slot></slot>
        `
    }

    override connectedCallback() {
        super.connectedCallback()
        const { ariaHidden } = this as AriaMixinStrict
        if (ariaHidden === 'false') {
            this.removeAttribute('aria-hidden')
            return
        }
        this.setAttribute('aria-hidden', 'true')
    }

}
