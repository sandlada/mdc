/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing } from 'lit'
import { property, queryAssignedElements, state } from 'lit/decorators.js'
import "../elevation/elevation"
import "../focus-ring/focus-ring"
import "../ripple/ripple"

/**
 * Supports inserting icon and label buttons.
 *
 * There are two implementations:
 * - non-toggle button
 * - toggle button
 *
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
 * ```html
 * <mdc-filled-button size="medium"></mdc-filled-button>
 * <mdc-toggle-filled-button size="medium"></mdc-toggle-filled-button>
 * ```
 *
 * Each button is available in 2 shapes:
 * - round (default)
 * - square
 *
 * ```html
 * <mdc-filled-button shape="round"></mdc-filled-button>
 * <mdc-toggle-filled-button shape="square"></mdc-toggle-filled-button>
 * ```
 *
 * @see
 * When passing in a tag, make sure your tag is an HTMLElement and not a text node:
 *
 * ```html
 * <mdc-filled-tonal-button>
 *     <span>Delete</span>
 * </mdc-filled-tonal-button>
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
    protected readonly assignedIcons!: Array<HTMLElement>

    @queryAssignedElements({ slot: '', flatten: true })
    protected readonly assignedDefault!: Array<HTMLElement>

    @property({ type: Boolean, attribute: 'trailing-icon' })
    public trailingIcon = false

    @property({ type: String, reflect: true })
    public size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' = 'small'

    @property({ type: String, reflect: true })
    public shape: 'round' | 'square' = 'round'

    @state()
    protected hasIcon: boolean = false

    @state()
    protected hasLabel: boolean = false

    protected renderOutline?(): unknown
    protected renderElevation?(): unknown
    protected renderButton?(): unknown

    protected renderContent() {
        return html`
            <span class="touch"></span>
            ${this.trailingIcon ? nothing : this.renderIcon()}

            <span class="label">
                <slot @slotchange=${this.handleDefaultSlotChange}></slot>
            </span>

            ${this.trailingIcon ? this.renderIcon() : nothing}
        `
    }

    protected renderIcon() {
        return html`
            <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
        `
    }

    protected handleIconSlotChange() {
        this.hasIcon = this.assignedIcons.length > 0
    }

    protected handleDefaultSlotChange() {
        this.hasLabel = this.assignedDefault.length > 0
    }

}
