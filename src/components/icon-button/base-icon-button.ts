import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import "../focus-ring/focus-ring"
import "../ripple/ripple"

/**
 * The icon-button component only supports inserting one icon.
 *
 * Icon-button provides 2 modes:
 * - normal button
 * - toggle button
 *
 * It is available:
 * - mdc-filled-icon-button
 * - mdc-filled-tonal-icon-button
 * - mdc-outlined-icon-button
 * - mdc-standard-icon-button
 * - mdc-toggle-filled-icon-button
 * - mdc-toggle-filled-tonal-icon-button
 * - mdc-toggle-outlined-icon-button
 * - mdc-toggle-standard-icon-button
 *
 * It is available in 5 sizes:
 * - extra-small
 * - small
 * - medium
 * - large
 * - extra-large
 *
 * It is available in 3 widths:
 * - narrow
 * - default (default)
 * - wide
 *
 * It is available in 2 shapes:
 * - round (default)
 * - square
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
export abstract class BaseIconButton extends mixinDelegatesAria(mixinElementInternals(LitElement)) {

    public declare disabled: boolean
    protected declare buttonElement: HTMLElement | null

    @property({ type: String, reflect: true })
    public size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' = 'small'

    @property({ type: String, reflect: true })
    public width: 'narrow' | 'default' | 'wide' = 'default'

    @property({ type: String, reflect: true })
    public shape: 'round' | 'square' = 'round'

    protected renderButton?(): unknown
    protected renderOutline?(): unknown
    protected renderIcon?(): unknown

    protected renderBackground(): unknown {
        return html`
            <span aria-hidden="true" class="background"></span>
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
}
