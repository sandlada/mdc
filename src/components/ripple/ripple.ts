/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { ContextConsumer } from '@lit/context'
import { GlobalMDCContext, type GlobalMDCContextRippleConfig } from '../../context-provider'
import { AttachableController } from '../../utils/controller/attachable-controller'
import { RippleAction } from './ripple-action'
import { styles } from './ripple.style'
import type { IRipple } from './ripple.interface'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-ripple": MDCRipple
    }
}

/**
 * Ripple is not a concept that is explicitly categorized as a component.
 *
 * The parent element of the focus ring used to provide perspective focus
 * must be set to relative.
 *
 * Ripple is often used for interactive buttons.
 * It provides a `hovered-state-layer`, a `focused-state-layer` and a `pressed-state-layer` when the user interacts.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-ripple')
export class MDCRipple extends LitElement implements IRipple {

    static override styles = styles

    private _ignoreGlobalConfig: boolean = false
    private _hasLocalConfig: boolean = false
    private _disabled: boolean = false
    private _disableHoverStateLayer: boolean = false
    private _disableFocusStateLayer: boolean = false
    private _disablePressStateLayer: boolean = false
    private _configAttributeSyncSource: 'property' | 'effective' | null = null
    private _lastEffectiveDisabled: boolean = false

    private readonly globalMDCContextConsumer = new ContextConsumer(this, {
        context: GlobalMDCContext,
        subscribe: true,
    })

    @query('.ripple')
    protected readonly rippleElement!: HTMLElement | null
    @query('.hover-state-layer')
    protected readonly _hoverStateLayerElement!: HTMLElement
    @query('.focus-state-layer')
    protected readonly _focusStateLayerElement!: HTMLElement
    @query('.press-state-layer')
    protected readonly _pressStateLayerElement!: HTMLElement

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

    @property({ type: Boolean, attribute: 'disable-hover-state-layer', reflect: true, noAccessor: true })
    public get disableHoverStateLayer() {
        return this.effectiveDisableHoverStateLayer
    }
    public set disableHoverStateLayer(value: boolean) {
        if (this._configAttributeSyncSource) {
            return
        }

        const oldValue = this._disableHoverStateLayer

        this._disableHoverStateLayer = value
        this._hasLocalConfig = true

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disable-hover-state-layer', value)
        this._configAttributeSyncSource = null

        this.requestUpdate('disableHoverStateLayer', oldValue)
    }

    @property({ type: Boolean, attribute: 'disable-focus-state-layer', reflect: true, noAccessor: true })
    public get disableFocusStateLayer() {
        return this.effectiveDisableFocusStateLayer
    }
    public set disableFocusStateLayer(value: boolean) {
        if (this._configAttributeSyncSource) {
            return
        }

        const oldValue = this._disableFocusStateLayer

        this._disableFocusStateLayer = value
        this._hasLocalConfig = true

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disable-focus-state-layer', value)
        this._configAttributeSyncSource = null

        this.requestUpdate('disableFocusStateLayer', oldValue)
    }

    @property({ type: Boolean, attribute: 'disable-press-state-layer', reflect: true, noAccessor: true })
    public get disablePressStateLayer() {
        return this.effectiveDisablePressStateLayer
    }
    public set disablePressStateLayer(value: boolean) {
        if (this._configAttributeSyncSource) {
            return
        }

        const oldValue = this._disablePressStateLayer

        this._disablePressStateLayer = value
        this._hasLocalConfig = true

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disable-press-state-layer', value)
        this._configAttributeSyncSource = null

        this.requestUpdate('disablePressStateLayer', oldValue)
    }

    @property({ type: Boolean, attribute: 'disabled', reflect: true, noAccessor: true })
    public get disabled() {
        return this.effectiveDisabled
    }
    public set disabled(value: boolean) {
        const oldValue = this._disabled

        if (this._configAttributeSyncSource) {
            return
        }

        this._disabled = value
        this._hasLocalConfig = true

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disabled', value)
        this._configAttributeSyncSource = null

        this.requestUpdate('disabled', oldValue)
    }

    public readonly action = new RippleAction(this)
    private readonly attachableController = new AttachableController(this, this.action.onControlChange.bind(this.action))

    private get useLocalConfig(): boolean {
        return this._ignoreGlobalConfig || this._hasLocalConfig
    }

    private get globalRippleConfig(): GlobalMDCContextRippleConfig {
        const context = this.globalMDCContextConsumer.value
        const ripple = context?.ripple

        return {
            disabled: ripple?.disabled ?? false,
            disableHoverStateLayer: ripple?.disableHoverStateLayer ?? false,
            disableFocusStateLayer: ripple?.disableFocusStateLayer ?? false,
            disablePressStateLayer: ripple?.disablePressStateLayer ?? false,
        }
    }

    private get effectiveDisabled(): boolean {
        return this.useLocalConfig ? this._disabled : this.globalRippleConfig.disabled
    }

    private get effectiveDisableHoverStateLayer(): boolean {
        return this.useLocalConfig ? this._disableHoverStateLayer : this.globalRippleConfig.disableHoverStateLayer
    }

    private get effectiveDisableFocusStateLayer(): boolean {
        return this.useLocalConfig ? this._disableFocusStateLayer : this.globalRippleConfig.disableFocusStateLayer
    }

    private get effectiveDisablePressStateLayer(): boolean {
        return this.useLocalConfig ? this._disablePressStateLayer : this.globalRippleConfig.disablePressStateLayer
    }

    private syncConfigAttributes() {
        const syncBooleanAttribute = (attributeName: string, value: boolean) => {
            if (this.hasAttribute(attributeName) === value) return

            this._configAttributeSyncSource = 'effective'
            this.toggleAttribute(attributeName, value)
            this._configAttributeSyncSource = null
        }

        syncBooleanAttribute('disabled', this.effectiveDisabled)
        syncBooleanAttribute('disable-hover-state-layer', this.effectiveDisableHoverStateLayer)
        syncBooleanAttribute('disable-focus-state-layer', this.effectiveDisableFocusStateLayer)
        syncBooleanAttribute('disable-press-state-layer', this.effectiveDisablePressStateLayer)
    }

    protected override render() {
        return html`
            <span aria-hidden="true" aria-disabled=${this.disabled} class="ripple">
                <span class="hover-state-layer" aria-hidden="true"></span>
                <span class="focus-state-layer" aria-hidden="true"></span>
                <span class="press-state-layer" aria-hidden="true"></span>
            </span>
        `
    }

    public get hoverStateLayerElement() {
        return this._hoverStateLayerElement
    }
    public get focusStateLayerElement() {
        return this._focusStateLayerElement
    }
    public get pressStateLayerElement() {
        return this._pressStateLayerElement
    }

    public get hovered() {
        return this.hasAttribute('hovered')
    }
    public set hovered(hovered: boolean) {
        this.toggleAttribute('hovered', hovered)
    }
    public get focused() {
        return this.hasAttribute('focused')
    }
    public set focused(focused: boolean) {
        this.toggleAttribute('focused', focused)
    }
    public get pressed() {
        return this.hasAttribute('pressed')
    }
    public set pressed(pressed: boolean) {
        this.toggleAttribute('pressed', pressed)
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

    protected override updated(_changedProperties: PropertyValues<this>): void {
        super.updated(_changedProperties)
        this.syncConfigAttributes()

        const effectiveDisabled = this.effectiveDisabled
        if (effectiveDisabled !== this._lastEffectiveDisabled) {
            if (effectiveDisabled) {
                this.hovered = false
                this.focused = false
                this.pressed = false
            }

            this._lastEffectiveDisabled = effectiveDisabled
        }
    }
}
