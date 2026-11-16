/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ContextConsumer } from '@lit/context'
import { isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { GlobalMDCContext, type GlobalMDCContextFocusRingConfig } from '../../utils/context-provider'
import { AttachableController } from '../../utils/controller/attachable-controller'
import type { IFocusRing } from './focus-ring.interface'
import { FocusRingStyle } from './focus-ring.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-focus-ring": MDCFocusRing
    }
}

const ReplayAttribute = 'data-replay'

const getDeepActiveElement = (): Element | null => {
    if (typeof document === 'undefined') return null

    let active: Element | null = document.activeElement

    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }

    return active
}

/**
 * The parent element of the focus ring used to provide perspective focus
 * must be positioned (for example, `position: relative`). The ring follows
 * focus on the control itself or any descendant in its flat tree.
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
    private _focusDriven: boolean = false

    private readonly globalMDCContextConsumer = new ContextConsumer(this, {
        context: GlobalMDCContext,
        subscribe: true,
    })

    /** Draws the ring inside the control instead of around it. */
    @property({ type: Boolean, reflect: true })
    public inward = false

    /** Inherits the control's corner radii instead of using the ring's own shape. */
    @property({ type: Boolean, reflect: true, attribute: 'shape-inherit' })
    public shapeInherit = true

    /** Disables the grow replay and CSS transitions. */
    @property({ type: Boolean, reflect: true, attribute: 'animation-disabled' })
    public animationDisabled = false

    /** Keeps the ring visible even when the attached control is not focused. */
    @property({ type: Boolean, reflect: true })
    public persistent = false


    /** Ignores global focus-ring configuration and uses local properties only. */
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

    /**
     * Effective disabled state. Setting it explicitly creates a local override
     * that takes precedence over the global focus-ring configuration.
     */
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

        if (value) {
            this.focused = false
        }

        if (oldValue !== value || !oldConfigured) {
            this.requestUpdate('disabled', oldValue)
        }
    }


    /**
     * Whether the ring is shown. Setting it to `true` while already focused
     * replays the grow animation.
     */
    @property({ type: Boolean, reflect: false, noAccessor: true })
    public get focused() { return this.hasAttribute('focused') }
    public set focused(value: boolean) {
        if (!value) {
            this._focusDriven = false
        }

        if (value) {
            if (this.disabled) {
                this.removeAttribute('focused')
                return
            }
            const wasFocused = this.hasAttribute('focused')
            this.setAttribute('focused', '')
            if (wasFocused) {
                this.restartAnimation()
            }
            return
        }
        this.removeAttribute('focused')
    }

    private openFromFocus(): void {
        this._focusDriven = true
        this.focused = true
    }

    private closeFromFocus(): void {
        this._focusDriven = false
        this.focused = false
    }

    private restartAnimation(): void {
        if (isServer || !this.isConnected || this.animationDisabled) return
        if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
            return
        }

        this.toggleAttribute(ReplayAttribute, true)
        // Trigger a layout reflow so the animation name is flushed to none
        // before it is restored, which restarts the CSS animation from zero.
        void this.offsetHeight
        this.toggleAttribute(ReplayAttribute, false)
    }

    override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return

        this.setAttribute('aria-hidden', 'true')
        this.setAttribute('role', 'presentation')
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

        if (this.isFocusVisible(next)) {
            this.openFromFocus()
        } else if (this._focusDriven) {
            this.closeFromFocus()
        }
    }

    private isFocusVisible(control: HTMLElement | null): boolean {
        if (!control?.isConnected) return false
        if (control.matches(':focus-visible')) return true

        const shadowActive = control.shadowRoot?.activeElement
        if (shadowActive?.matches?.(':focus-visible')) return true

        const active = getDeepActiveElement()
        if (!active) return false

        const isInside = control === active
            || control.contains(active)
            || control.matches(':focus-within')

        return isInside && active.matches(':focus-visible')
    }

    private handleEvent(e: Event) {
        if (this.disabled) return

        switch (e.type) {
            case 'focusin':
                if (this.isFocusVisible(this.control)) {
                    this.openFromFocus()
                }
                break
            case 'focusout':
            case 'pointerdown':
                this.scheduleFocusStateSync()
                break
            default:
                break
        }
    }

    private scheduleFocusStateSync(): void {
        queueMicrotask(() => {
            if (this.disabled) return
            if (!this.isFocusVisible(this.control)) {
                this.closeFromFocus()
            }
        })
    }

    /**
     * Resets focus visuals. Entrance and exit transitions are handled
     * natively by CSS `@starting-style` and `transition-behavior: allow-discrete`.
     */
    public close(): void {
        this.focused = false
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
