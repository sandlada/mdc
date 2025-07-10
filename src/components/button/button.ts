/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing } from "lit"
import { property, query } from 'lit/decorators.js'
import { classMap } from "lit/directives/class-map.js"
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { setupFormSubmitter, type FormSubmitter, type FormSubmitterType } from '../../utils/controller/form-submitter'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { BaseButton } from './base-button'

/**
 * The buttons are available in 5 variations:
 * - mdc-elevated-button
 * - mdc-filled-button
 * - mdc-filled-tonal-button
 * - mdc-outlined-button
 * - mdc-text-button
 *
 * The normal Button class does not implement the function of the anchor element.
 * Because you only need to wrap the Button component with <a></a>.
 *
 * @see
 * Note:
 * Please set the tabindex of the a element that wraps the button component to -1.
 * ```html
 * <a tabindex="-1" href="#a">
 *      <mdc-elevated-button shape="square">
 *          Link Button
 *     </mdc-elevated-button>
 * </a>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 */
export abstract class Button extends mixinDelegatesAria(mixinElementInternals(BaseButton)) implements FormSubmitter {

    static readonly formAssociated = true
    static {
        setupFormSubmitter(Button)
    }

    public get name() {
        return this.getAttribute('name') ?? '';
    }
    public set name(name: string) {
        this.setAttribute('name', name);
    }

    public get form() {
        return this[internals].form
    }

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String })
    public type: FormSubmitterType = 'submit'

    @property()
    public value: string = ''

    @query('.button')
    protected readonly buttonElement!: HTMLElement | null

    public override focus() {
        this.buttonElement?.focus()
    }

    public override blur() {
        this.buttonElement?.blur()
    }

    constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render() {
        const classes = classMap({
            'trailing-icon': this.trailingIcon,
            'disabled': this.disabled,
            [this.size]: true,
            [this.shape]: true,
        })
        return html`
            <div class="surface ${classes}">
                ${this.renderButton()}
                ${this.renderOutline?.()}
                ${this.renderElevation?.()}
                <span class="background"></span>
                <mdc-ripple for="button" part="ripple" ?disabled=${this.disabled}></mdc-ripple>
                <mdc-focus-ring for="button" part="focus-ring"></mdc-focus-ring>
            </div>
        `
    }

    protected override renderButton() {
        return html`
            <button
                class="button"
                id="button"
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled}
                aria-label=${this.ariaLabel || nothing}
                aria-haspopup=${this.ariaHasPopup as "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" || nothing}
                aria-expanded=${this.ariaExpanded as "true" | "false" | "undefined" || nothing}
            >
                ${this.renderContent()}
            </button>
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
