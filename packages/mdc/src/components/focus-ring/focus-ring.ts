/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ContextConsumer } from '@lit/context'
import { GlobalMDCContext, type GlobalMDCContextFocusRingConfig } from '../../context-provider'
import { AttachableController } from '../../utils/controller/attachable-controller'
import type { IFocusRing } from './focus-ring.interface'
import { FocusRingStyle } from './focus-ring.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-focus-ring": MDCFocusRing
    }
}

/**
 * The parent element of the focus ring used to provide perspective focus
 * must be set to relative and the tabindex must not be -1.
 *
 * The ring can also be attached to an external control through the `for`
 * attribute or the `attach(control)` method.
 *
 * @example
 * ```html
 * <div tabindex="0" class="my-box">
 *     <mdc-focus-ring></mdc-focus-ring>
 * </div>
 * <style>
 * .my-box {
 *     position: relative;
 *     height: 40px;
 *     width: 72px;
 *     background: red;
 *     border: none;
 *     outline: none;
 * }
 * </style>
 * ```
 *
 * @version "Material Design 3"
 * @version "Material Design 3 - Non-Standardized"
 */
@customElement('mdc-focus-ring')
export class MDCFocusRing extends LitElement implements IFocusRing {

    static override styles = FocusRingStyle

    private _ignoreGlobalConfig: boolean = false
    private _disabled: boolean = false
    private _disabledConfigured: boolean = false
    private _configAttributeSyncSource: 'property' | 'effective' | null = null
    private _lastEffectiveDisabled: boolean = false

    private readonly globalMDCContextConsumer = new ContextConsumer(this, {
        context: GlobalMDCContext,
        subscribe: true,
    })

    @property({ type: Boolean, reflect: true })
    public inward = false

    @property({ type: Boolean, reflect: true, attribute: 'shape-inherit' })
    public shapeInherit = true

    @property({ type: Boolean, reflect: true, attribute: 'animation-disabled' })
    public animationDisabled = false

    @property({ type: Boolean, attribute: 'ignore-global-config', reflect: true, noAccessor: true })
    public get ignoreGlobalConfig() {
        return this._ignoreGlobalConfig
    }
    public set ignoreGlobalConfig(value: boolean) {
        const oldValue = this._ignoreGlobalConfig

        if (oldValue === value) return

        this._ignoreGlobalConfig = value

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('ignore-global-config', value)
        this._configAttributeSyncSource = null

        this.requestUpdate('ignoreGlobalConfig', oldValue)
    }

    @property({ type: Boolean, attribute: 'disabled', noAccessor: true })
    public get disabled() {
        return this.effectiveDisabled
    }
    // Explicit local override: once set, this value takes precedence over the global context.
    public set disabled(value: boolean) {
        if (this._configAttributeSyncSource) {
            return
        }

        // Treat an explicit host value as a local override over the global context.
        const oldValue = this._disabled
        const oldConfigured = this._disabledConfigured

        this._disabled = value
        this._disabledConfigured = true

        // Keep the reflected attribute in sync without re-entering the callback loop.
        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disabled', value)
        this._configAttributeSyncSource = null

        if (oldValue !== value || !oldConfigured) {
            this.requestUpdate('disabled', oldValue)
        }
    }

    @property({ type: Boolean, reflect: false, noAccessor: true })
    public get focused() { return this.hasAttribute('focused') }
    public set focused(value: boolean) {
        if (value) {
            if (this.disabled) {
                this.clearTimer()
                this.removeAttribute('closing')
                this.removeAttribute('focused')
                return
            }

            this.clearTimer()
            this.removeAttribute('closing')
            this.setAttribute('focused', '')
            return
        }
        this.removeAttribute('focused')
        this.removeAttribute('closing')
        this.clearTimer()
    }

    public constructor() {
        super()
        if (isServer) return
        this.ariaHidden = 'true'
        this.role = 'presentation'
        this.tabIndex = -1
    }

    private get effectiveDisabled(): boolean {
        // Local configuration wins; otherwise inherit the global default.
        if (this._ignoreGlobalConfig || this._disabledConfigured) {
            return this._disabled
        }

        return this.globalFocusRingConfig.disabled
    }

    private get globalFocusRingConfig(): GlobalMDCContextFocusRingConfig {
        const context = this.globalMDCContextConsumer.value
        const focusRing = context?.focusRing

        return {
            disabled: focusRing?.disabled ?? false,
        }
    }

    private syncDisabledAttribute() {
        const effectiveDisabled = this.effectiveDisabled

        if (this.hasAttribute('disabled') === effectiveDisabled) return

        this._configAttributeSyncSource = 'effective'
        this.toggleAttribute('disabled', effectiveDisabled)
        this._configAttributeSyncSource = null
    }

    override attributeChangedCallback(name: string, old: string | null, value: string | null) {
        if (name === 'disabled') {
            if (this._configAttributeSyncSource) return

            const oldValue = this._disabled
            this._disabled = value !== null
            this._disabledConfigured = true
            this.requestUpdate('disabled', oldValue)
            return
        }

        if (name === 'ignore-global-config') {
            if (this._configAttributeSyncSource) return

            const oldValue = this._ignoreGlobalConfig
            this._ignoreGlobalConfig = value !== null
            this.requestUpdate('ignoreGlobalConfig', oldValue)
            return
        }

        super.attributeChangedCallback(name, old, value)
    }

    private readonly attachableController = new AttachableController(this, this.onControlChange.bind(this))
    private static readonly FocusRingEvents = [
        'focusin',
        'focusout',
        'pointerdown',
    ] as const
    private readonly boundHandleEvent = (e: Event) => this.handleEvent(e)
    private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
        if (isServer) return
        for (const event of MDCFocusRing.FocusRingEvents) {
            prev?.removeEventListener(event, this.boundHandleEvent)
            next?.addEventListener(event, this.boundHandleEvent)
        }
    }

    private timer: null | ReturnType<typeof setTimeout> = null
    private clearTimer() {
        if (!this.timer) return
        clearTimeout(this.timer)
        this.timer = null
    }

    private handleEvent(e: Event) {
        if (this.disabled) return
        const duration = parseFloat(getComputedStyle(this).getPropertyValue('--_duration')) || 0

        this.clearTimer()

        switch (e.type) {
            case 'focusin': {
                const isVisible = this.control?.matches(':focus-visible') ?? false
                if (isVisible) {
                    this.removeAttribute('closing')
                    this.focused = true
                }
                break
            }
            case 'focusout':
            case 'pointerdown':
                if(!this.hasAttribute('focused')) return
                this.setAttribute('closing', '')
                this.timer = setTimeout(() => {
                    this.focused = false
                }, duration * 0.5)
                break
            default:
                break
        }
    }

    protected override updated(_changedProperties: PropertyValues<this>): void {
        super.updated(_changedProperties)
        this.syncDisabledAttribute()
        const effectiveDisabled = this.effectiveDisabled
        if (effectiveDisabled !== this._lastEffectiveDisabled) {
            if (effectiveDisabled) {
                this.focused = false
            }

            this._lastEffectiveDisabled = effectiveDisabled
        }
    }

    public get htmlFor() {
        return this.attachableController.htmlFor
    }
    public set htmlFor(htmlFor: string | null) {
        this.attachableController.htmlFor = htmlFor
    }

    public get control() {
        return this.attachableController.control
    }
    public set control(control: HTMLElement | null) {
        this.attachableController.control = control
    }

    public attach(control: HTMLElement) {
        this.attachableController.attach(control)
    }
    public detach() {
        this.attachableController.detach()
    }

}
