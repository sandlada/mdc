/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { SwitchStyles } from './switch.style'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import type { ISwitch } from './switch.interface'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-switch": MDCSwitch
    }
}

const KEYBOARD_VISUAL_KEYS = new Set(['Tab', ' ', 'Enter'])
const KEYBOARD_PRESS_KEYS = new Set([' ', 'Enter'])
const POINTER_MODALITY_EVENTS = ['pointerdown', 'mousedown', 'touchstart'] as const

let keyboardInteractionMode = false
let keyboardModalityTrackingInstalled = false

function installKeyboardModalityTracking() {
    if (isServer || keyboardModalityTrackingInstalled) return
    keyboardModalityTrackingInstalled = true
    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return
        keyboardInteractionMode = true
    }, true)
    for (const eventName of POINTER_MODALITY_EVENTS) {
        document.addEventListener(eventName, () => {
            keyboardInteractionMode = false
        }, true)
    }
}

/**
 *
 *
 *
 * @version "Material Design 3"
 *
 * @link
 * https://m3.material.io/components/switch/overview
 */
@customElement('mdc-switch')
export class MDCSwitch extends composeMixin(
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements ISwitch {

    static override styles = SwitchStyles

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: String })
    public value: string = 'on'

    @property({ type: Boolean, attribute: 'hide-selected-icon' })
    public hideSelectedIcon: boolean = false

    @property({ type: Boolean, attribute: 'show-unselected-icon' })
    public showUnselectedIcon: boolean = false

    @query('#input')
    private readonly inputElement!: HTMLInputElement

    public override get focusRingControl(): HTMLElement | null {
        return this.inputElement ?? null
    }

    override focus() {
        this.inputElement?.focus()
    }
    override blur() {
        this.inputElement?.blur()
    }

    constructor() {
        super()
        if (isServer) {
            return
        }
        this.setAttribute('role', 'switch')

        this.addEventListener('click', this.handleClick.bind(this))
        installKeyboardModalityTracking()
        this.addEventListener('focusin', this.handleFocusIn.bind(this))
        this.addEventListener('focusout', this.handleFocusOut.bind(this))
        this.addEventListener('keydown', this.handleVisualKeyDown.bind(this))
        this.addEventListener('pointerenter', this.handlePointerEnter.bind(this))
        this.addEventListener('pointerleave', this.handlePointerLeave.bind(this))
        // Use local config so the switch's ripple and focus-ring are never
        // silently disabled by a global context that disables state layers.
        this.focusRingDisabled = false
        this.disableRippleHoverStateLayer = false
    }

    protected override render(): unknown {
        const classes = classMap({
            'selected': this.selected,
            'unselected': !this.selected,
            'disabled': this.disabled,
            'show-unselected-icon': this.showUnselectedIcon,
        })

        return html`
            <div class="${classes} switch">
                ${this.renderInput()}

                <span class="outline" aria-hidden="true"></span>

                <span class="handle-container">
                    ${this.renderRipple()}
                    <span class="handle">
                        ${this.hideSelectedIcon ? nothing : this.renderSelectedIcon()}
                        ${this.showUnselectedIcon ? this.renderUnselectedIcon() : nothing}
                    </span>
                </span>

                <span class="track" aria-hidden="true"></span>

                ${this.renderFocusRing()}
            </div>
        `
    }

    protected renderInput() {
        return html`
            <input
                id="input"
                class="touch input"
                .checked=${this.selected}
                type="checkbox"
                .disabled=${this.disabled}
                .required=${this.required}
                tabindex="0"
                aria-hidden="true"
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    private renderSelectedIcon() {
        return html`
            <slot class="icon icon-selected" name="icon-selected">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9.55 18.2 3.65 12.3 5.275 10.675 9.55 14.95 18.725 5.775 20.35 7.4Z" />
                </svg>
            </slot>
        `
    }

    private renderUnselectedIcon() {
        return html`
            <slot class="icon icon-unselected" name="icon-unselected">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.4 19.2 4.8 17.6 10.4 12 4.8 6.4 6.4 4.8 12 10.4 17.6 4.8 19.2 6.4 13.6 12 19.2 17.6 17.6 19.2 12 13.6Z" />
                </svg>
            </slot>
        `
    }

    private handlePointerEnter() {
        if (this.disabled) return
        const ripple = this.rippleElement
        if (ripple) ripple.hovered = true
    }

    private handlePointerLeave() {
        const ripple = this.rippleElement
        if (ripple) ripple.hovered = false
    }

    private handleFocusIn() {
        if (!this.shouldShowKeyboardVisuals()) return
        this.queueKeyboardVisualSync(false)
    }

    private handleFocusOut() {
        queueMicrotask(() => {
            if (this.matches(':focus')) return
            this.clearKeyboardVisuals()
        })
    }

    private handleVisualKeyDown(event: KeyboardEvent) {
        if (this.disabled || !KEYBOARD_VISUAL_KEYS.has(event.key)) return
        keyboardInteractionMode = true
        this.queueKeyboardVisualSync(KEYBOARD_PRESS_KEYS.has(event.key))
    }

    private shouldShowKeyboardVisuals() {
        return keyboardInteractionMode || (this.inputElement?.matches(':focus-visible') ?? false)
    }

    private queueKeyboardVisualSync(pressRipple: boolean) {
        queueMicrotask(() => {
            if (!this.isConnected || this.disabled) return
            if (!this.shouldShowKeyboardVisuals()) return

            const ring = this.focusRingElement
            if (ring && !ring.focused) {
                ring.focused = true
            }

            const ripple = this.rippleElement
            if (ripple && !ripple.focused) {
                ripple.focused = true
            }

            if (pressRipple && ripple && !ripple.pressed) {
                ripple.action.handleClick()
            }
        })
    }

    private clearKeyboardVisuals() {
        const ring = this.focusRingElement
        if (ring?.focused) {
            ring.focused = false
        }

        const ripple = this.rippleElement
        if (ripple?.focused) {
            ripple.focused = false
        }
    }

    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties)
        this.setAttribute('aria-checked', String(this.selected))
        this.setAttribute('aria-disabled', String(this.disabled))
        this.setAttribute('aria-required', String(this.required))
        // Keep the ripple's disabled state in sync with the switch's disabled state.
        if (this.rippleElement) {
            this.rippleElement.disabled = this.disabled
        }
    }

    private handleInput(e: InputEvent) {
        const input = e.target as HTMLInputElement
        this.selected = input.checked
    }

    private handleChange(e: Event) {
        redispatchEvent(this, e)
    }

    private handleClick(e: MouseEvent) {
        if (!isActivationClick(e) || !this.inputElement) {
            return
        }
        this.focus()
        dispatchActivationClick(this.inputElement)
    }

    override[getFormValue]() {
        return this.selected ? this.value : null
    }

    override[getFormState]() {
        return String(this.selected)
    }

    override formResetCallback() {
        this.selected = this.hasAttribute('default-selected')
    }

    override formStateRestoreCallback(state: string) {
        this.selected = state === 'true'
    }

    override[createValidator]() {
        return new CheckboxValidator(() => ({
            checked: this.selected,
            required: this.required,
        }))
    }

    override[getValidityAnchor]() {
        return this.inputElement
    }
}
