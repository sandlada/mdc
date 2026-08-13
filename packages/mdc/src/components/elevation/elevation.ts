/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ContextConsumer } from '@lit/context'
import { GlobalMDCContext, type GlobalMDCContextElevationConfig } from '../../context-provider'
import { styles } from './elevation.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-elevation": Elevation
    }
}

/**
 * Elevation is not a concept that is explicitly categorized as a component.
 *
 * It represents the shadow of an object and is usually used to express the level at which an object is located.
 *
 * @example
 * ```html
 * <button class="button">
 *   <mdc-elevation></mdc-elevation>
 * </button>
 * <style>
 * .button {
 *   position: relative;
 *    --mdc-elevation-level: 3;
 * }
 * .button:hover {
 *    --mdc-elevation-level: 4;
 * }
 * .button:active {
 *    --mdc-elevation-level: 2;
 * }
 * </style>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/styles/elevation/overview
 */
@customElement('mdc-elevation')
export class Elevation extends LitElement {

    static override styles = styles

    private _ignoreGlobalConfig: boolean = false
    private _disabled: boolean = false
    private _disabledConfigured: boolean = false
    private _configAttributeSyncSource: 'property' | 'effective' | null = null

    private readonly globalMDCContextConsumer = new ContextConsumer(this, {
        context: GlobalMDCContext,
        subscribe: true,
    })

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
    public set disabled(value: boolean) {
        if (this._configAttributeSyncSource) {
            return
        }

        const oldValue = this._disabled
        const oldConfigured = this._disabledConfigured

        this._disabled = value
        this._disabledConfigured = true

        this._configAttributeSyncSource = 'property'
        this.toggleAttribute('disabled', value)
        this._configAttributeSyncSource = null

        if (oldValue !== value || !oldConfigured) {
            this.requestUpdate('disabled', oldValue)
        }
    }

    private get effectiveDisabled(): boolean {
        if (this._ignoreGlobalConfig || this._disabledConfigured) {
            return this._disabled
        }

        return this.globalElevationConfig.disabled
    }

    private get globalElevationConfig(): GlobalMDCContextElevationConfig {
        const context = this.globalMDCContextConsumer.value
        const elevation = context?.elevation

        return {
            disabled: elevation?.disabled ?? false,
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

    protected override render() {
        return html`
            <span aria-hidden="true" class="elevation"></span>
        `
    }

    protected override updated(_changedProperties: PropertyValues<this>) {
        super.updated(_changedProperties)
        this.syncDisabledAttribute()
    }

}
