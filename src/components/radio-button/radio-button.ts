/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { radioButtonStyle } from './radio-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-radio-button": RadioButton
    }
}

const KEYBOARD_VISUAL_KEYS = new Set(['Tab', ' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])
const KEYBOARD_PRESS_KEYS = new Set([' ', 'Enter'])
const POINTER_MODALITY_EVENTS = ['pointerdown', 'mousedown', 'touchstart'] as const

let keyboardInteractionMode = false
let keyboardModalityTrackingInstalled = false

function installKeyboardModalityTracking() {
    if (isServer || keyboardModalityTrackingInstalled) return

    keyboardModalityTrackingInstalled = true

    document.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
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
 * @form
 * - default-checked
 * - checked
 * - disabled
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/radio-button/specs
 *
 */
@customElement('mdc-radio-button')
export class RadioButton extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinFocusRingOptions,
    mixinRippleOptions,
)(LitElement) {
    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: false
    }

    static override styles = radioButtonStyle

    declare disabled: boolean
    declare name: string

    public type: 'checkbox' | 'radio' = 'radio'

    @property({ type: String })
    public value: 'on' | (string & {}) = 'on'

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: Boolean, reflect: true })
    public checked: boolean = false

    protected readonly selectionController = new SelectionController(this, {
        canCancel: false,
        dispatchNavigationClick: true,
        getFocusableElement: (host) => {
            return host
        },
        onAfterNavigate: (next) => {
            if (next !== this) return
            keyboardInteractionMode = true
            this.queueKeyboardVisualSync(true)
        }
    })

    public override get focusRingControl(): HTMLElement { return this! }
    public override get rippleControl(): HTMLElement { return this! }

    constructor() {
        super()
        this.addController(this.selectionController)
        if (!isServer) {
            installKeyboardModalityTracking()
            this[internals].role = 'radio'
            this.tabIndex = 0
            this.addEventListener('focusin', this.handleFocusIn)
            this.addEventListener('focusout', this.handleFocusOut)
            this.addEventListener('keydown', this.handleVisualKeyDown)
        }
    }

    protected override updated(_changedProperties: PropertyValues): void {
        super.updated(_changedProperties)
        this[internals].ariaChecked = String(this.checked)
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            'selected': this.checked,
            'unselected': !this.checked,
        })
    }

    protected override render(): unknown {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                ${this.renderRipple()}
                ${this.renderFocusRing()}

                <svg class="icon" viewBox="0 0 20 20">
                    <circle class="outer" cx="10" cy="10" r="9" />
                    <circle class="inner" cx="10" cy="10" r="9" />
                </svg>

                <input
                    class="touch-target"
                    role="button"
                    type="radio"
                    tabindex="-1"
                    .checked=${this.checked}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    aria-checked=${this.checked}
                    aria-disabled=${this.disabled}
                    aria-required=${this.required}
                    @click=${this.handleClick}
                />
            </div>
        `
    }

    private readonly handleFocusIn = () => {
        if (!this.shouldShowKeyboardVisuals()) return

        this.queueKeyboardVisualSync(false)
    }

    private readonly handleFocusOut = () => {
        queueMicrotask(() => {
            if (this.matches(':focus')) return

            this.clearKeyboardVisuals()
        })
    }

    private readonly handleVisualKeyDown = (event: KeyboardEvent) => {
        if (this.disabled || !KEYBOARD_VISUAL_KEYS.has(event.key)) return

        keyboardInteractionMode = true
        this.queueKeyboardVisualSync(KEYBOARD_PRESS_KEYS.has(event.key))
    }

    private shouldShowKeyboardVisuals() {
        return keyboardInteractionMode || this.matches(':focus-visible')
    }

    private queueKeyboardVisualSync(pressRipple: boolean) {
        queueMicrotask(() => {
            if (!this.isConnected || this.disabled || !this.matches(':focus')) return
            if (!this.shouldShowKeyboardVisuals()) return

            if (this.focusRingElement && !this.focusRingElement.focused) {
                this.focusRingElement.focused = true
            }

            if (this.rippleElement && !this.rippleElement.focused) {
                this.rippleElement.focused = true
            }

            if (pressRipple && this.rippleElement && !this.rippleElement.pressed) {
                this.rippleElement.action.handleClick()
            }
        })
    }

    private clearKeyboardVisuals() {
        if (this.focusRingElement?.focused) {
            this.focusRingElement.focused = false
        }

        if (this.rippleElement?.focused) {
            this.rippleElement.focused = false
        }
    }

    private async handleClick(event: Event) {
        if (this.disabled) return
        await 0;
        if (event.defaultPrevented) return
        if (isActivationClick(event)) this.focus()
        // input/change events are dispatched by SelectionController.toggleSelection()
        // which fires via the host's composed click listener.
    }

    public override [createValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                return [this] as [RadioButton]
            }
            return this.selectionController.controls as [RadioButton, ...RadioButton[]]
        })
    }

    public override [getValidityAnchor]() {
        return this
    }

    public override [getFormValue]() {
        return this.checked ? this.value : null
    }

    public override [getFormState]() {
        return String(this.checked)
    }

    public override formResetCallback() {
        this.checked = this.hasAttribute('default-checked')
    }

    public override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }


}
