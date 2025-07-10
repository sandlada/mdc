import { html, LitElement, nothing } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import "../elevation/elevation"
import "../focus-ring/focus-ring"
import "../ripple/ripple"

/**
 * Supports inserting icon and label buttons.
 *
 * There are two implementations:
 * - button
 * - toggle button
 *
 * @example
 * ```html
 * <mdc-filled-button></mdc-filled-button>
 * <mdc-toggle-filled-button></mdc-toggle-filled-button>
 * ```
 *
 * Each button is available in 5 sizes:
 * - extra-small
 * - small (default)
 * - medium
 * - large
 * - extra-large
 *
 * @example
 * ```html
 * <mdc-filled-button size="medium"></mdc-filled-button>
 * <mdc-toggle-filled-button size="medium"></mdc-toggle-filled-button>
 * ```
 *
 * Each button is available in 2 shapes:
 * - round (default)
 * - square
 *
 * @example
 * ```html
 * <mdc-filled-button shape="round"></mdc-filled-button>
 * <mdc-toggle-filled-button shape="square"></mdc-toggle-filled-button>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 */
export abstract class BaseButton extends LitElement {

    @queryAssignedElements({ slot: 'icon', flatten: true })
    protected readonly assignedIcons!: HTMLElement[]

    @property({ type: Boolean, attribute: 'trailing-icon' })
    public trailingIcon = false

    @property({ type: String, reflect: true })
    public size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' = 'small'

    @property({ type: String, reflect: true })
    public shape: 'round' | 'square' = 'round'

    protected renderOutline?(): unknown
    protected renderElevation?(): unknown
    protected renderButton?(): unknown

    protected renderContent() {
        return html`
            <span class="touch"></span>
            ${this.trailingIcon ? nothing : this.renderIcon()}

            <span class="label">
                <slot></slot>
            </span>

            ${this.trailingIcon ? this.renderIcon() : nothing}
        `
    }

    protected renderIcon() {
        return html`
            <slot name="icon"></slot>
        `
    }
}
