/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { CreateValidator, GetValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { CheckboxValidator } from '../../utils/behaviors/validators/checkbox-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { OpacityTransitionController } from '../../utils/motion'
import { dispatchActivationClick, isActivationClick } from '../../utils/event/form-label-activation'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { GetFormState, GetFormValue, mixinFormAssociated } from '../../utils/form'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import type { ISwitch } from './switch.interface'
import { SwitchStyles } from './switch.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-switch": MDCSwitch
    }
}

const KeyboardVisualKeys = new Set(['Tab', ' ', 'Enter'])
const KeyboardPressKeys = new Set([' ', 'Enter'])
const PointerModalityEvents = ['pointerdown', 'mousedown', 'touchstart'] as const

let KeyboardInteractionMode = false
let KeyboardModalityTrackingInstalled = false

function installKeyboardModalityTracking() {
    if (isServer || KeyboardModalityTrackingInstalled) return
    KeyboardModalityTrackingInstalled = true
    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return
        KeyboardInteractionMode = true
    }, true)
    for (const eventName of PointerModalityEvents) {
        document.addEventListener(eventName, () => {
            KeyboardInteractionMode = false
        }, true)
    }
}

/**
 *
 * Classes:
 *
 *
 * @version "Material Design 3"
 *
 * @link
 * https://m3.material.io/components/switch/overview
 */
@customElement('mdc-switch')
export class MDCSwitch extends composeMixin(
    mixinDelegatesAria,
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

    @query('.handle')
    private readonly handleElement!: HTMLElement

    private readonly opacityController = new OpacityTransitionController(this, {
        target: () => this.handleElement,
        duration: 250,
    })

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
        this.addEventListener('click', this.handleClick.bind(this))
        installKeyboardModalityTracking()
        this.addEventListener('focusin', this.handleFocusIn.bind(this))
        this.addEventListener('focusout', this.handleFocusOut.bind(this))
        this.addEventListener('keydown', this.handleVisualKeyDown.bind(this))
        this.addEventListener('pointerenter', this.handlePointerEnter.bind(this))
        this.addEventListener('pointerleave', this.handlePointerLeave.bind(this))
    }

    protected getRenderClasses() {
        return {
            'selected': this.selected,
            'unselected': !this.selected,
            'disabled': this.disabled,
            'show-unselected-icon': this.showUnselectedIcon,
        }
    }

    protected override render(): unknown {
        const classes = classMap(this.getRenderClasses())

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
        const { ariaLabel, ariaInvalid } = this as AriaMixinStrict
        return html`
            <input
                id="input"
                class="touch input"
                .checked=${this.selected}
                type="checkbox"
                role="switch"
                .disabled=${this.disabled}
                .required=${this.required}
                aria-label=${ariaLabel || nothing}
                aria-invalid=${ariaInvalid || nothing}
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
        if (this.disabled || !KeyboardVisualKeys.has(event.key)) return
        KeyboardInteractionMode = true
        this.queueKeyboardVisualSync(KeyboardPressKeys.has(event.key))
    }

    private shouldShowKeyboardVisuals() {
        return KeyboardInteractionMode || (this.inputElement?.matches(':focus-visible') ?? false)
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
            ring.close()
        }

        const ripple = this.rippleElement
        if (ripple?.focused) {
            ripple.focused = false
        }
    }

    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties)
        const { ariaLabel } = this as AriaMixinStrict
        const labels = this.labels
        this.inputElement.ariaLabelledByElements = !ariaLabel && labels?.length
            ? Array.from(labels).filter((label): label is Element => label instanceof Element)
            : null
        if (this.disabled) {
            this.clearKeyboardVisuals()

            if (this.rippleElement) {
                this.rippleElement.hovered = false
                this.rippleElement.focused = false
                this.rippleElement.pressed = false
            }
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

    override [GetFormValue]() {
        return this.selected ? this.value : null
    }

    override [GetFormState]() {
        return String(this.selected)
    }

    override formResetCallback() {
        this.selected = this.hasAttribute('default-selected')
    }

    override formStateRestoreCallback(state: string) {
        this.selected = state === 'true'
    }

    override [CreateValidator]() {
        return new CheckboxValidator(() => ({
            checked: this.selected,
            required: this.required,
        }))
    }

    override [GetValidityAnchor]() {
        return this.inputElement
    }
}
