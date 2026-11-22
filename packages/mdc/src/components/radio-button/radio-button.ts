/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { CreateValidator, GetValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { Internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/selection'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { GetFormState, GetFormValue, mixinFormAssociated } from '../../utils/form'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import { RadioButtonStyle } from './radio-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-radio-button": RadioButton
    }
}

const KeyboardVisualKeys = new Set(['Tab', ' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])
const KeyboardPressKeys = new Set([' ', 'Enter'])
const PointerModalityEvents = ['pointerdown', 'mousedown', 'touchstart'] as const

let KeyboardInteractionMode = false
let KeyboardModalityTrackingInstalled = false

function installKeyboardModalityTracking() {
    if (isServer || KeyboardModalityTrackingInstalled) return

    KeyboardModalityTrackingInstalled = true

    document.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
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

    static override styles = RadioButtonStyle

    declare disabled: boolean
    declare name: string

    public readonly type: 'checkbox' | 'radio' = 'radio'

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
            KeyboardInteractionMode = true
            this.queueKeyboardVisualSync(true)
        }
    })

    public override get focusRingControl(): HTMLElement { return this! }
    public override get rippleControl(): HTMLElement { return this! }

    constructor() {
        super()
        if (!isServer) {
            installKeyboardModalityTracking()
            this[Internals].role = 'radio'
            this.tabIndex = 0
            this.addEventListener('focusin', this.handleFocusIn)
            this.addEventListener('focusout', this.handleFocusOut)
            this.addEventListener('keydown', this.handleVisualKeyDown)
        }
    }

    protected override updated(_changedProperties: PropertyValues): void {
        super.updated(_changedProperties)
        this[Internals].ariaChecked = String(this.checked)
        this[Internals].ariaDisabled = String(this.disabled)
        this[Internals].ariaRequired = String(this.required)
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

                <svg class="icon" viewBox="0 0 20 20" aria-hidden="true">
                    <circle class="outer" cx="10" cy="10" r="9" />
                    <circle class="inner" cx="10" cy="10" r="9" />
                </svg>

                <span
                    class="touch-target"
                    aria-hidden="true"
                    @click=${this.handleClick}
                ></span>
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
        if (this.disabled || !KeyboardVisualKeys.has(event.key)) return

        KeyboardInteractionMode = true
        this.queueKeyboardVisualSync(KeyboardPressKeys.has(event.key))
    }

    private shouldShowKeyboardVisuals() {
        return KeyboardInteractionMode || this.matches(':focus-visible')
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
            this.focusRingElement.close()
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

    public override [CreateValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                return [this] as [RadioButton]
            }
            return this.selectionController.controls as [RadioButton, ...RadioButton[]]
        })
    }

    public override [GetValidityAnchor]() {
        return this
    }

    public override [GetFormValue]() {
        return this.checked ? this.value : null
    }

    public override [GetFormState]() {
        return String(this.checked)
    }

    public override formResetCallback() {
        this.checked = this.hasAttribute('default-checked')
    }

    public override formStateRestoreCallback(state: string) {
        this.checked = state === 'true'
    }


}
