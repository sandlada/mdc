/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, type LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { ContextConsumer } from '@lit/context'
import { GlobalMDCContext, type GlobalMDCContextElevationConfig } from '../../context-provider'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'

export interface IMixinElevationAttributes {
    ignoreGlobalConfig: boolean
    disableElevation: boolean
}

export interface IMixinElevationOptions extends IMixinElevationAttributes {
    renderElevation(): TemplateResult
}

export function mixinElevationOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinElevationOptions> {
    abstract class WithElevationOptions extends base implements IMixinElevationOptions {
        declare disabled?: boolean

        private _ignoreGlobalConfig: boolean = false
        private _disableElevation: boolean = false
        private _disableElevationConfigured: boolean = false
        private _elevationAttributeSyncSource: 'property' | null = null

        private readonly globalMDCContextConsumer = new ContextConsumer(this, {
            context: GlobalMDCContext,
            subscribe: true,
        })

        @property({ attribute: 'ignore-global-config', type: Boolean, reflect: true, noAccessor: true })
        public get ignoreGlobalConfig() {
            return this._ignoreGlobalConfig
        }
        public set ignoreGlobalConfig(value: boolean) {
            const oldValue = this._ignoreGlobalConfig

            if (oldValue === value) return

            this._ignoreGlobalConfig = value

            this._elevationAttributeSyncSource = 'property'
            this.toggleAttribute('ignore-global-config', value)
            this._elevationAttributeSyncSource = null

            this.requestUpdate('ignoreGlobalConfig', oldValue)
        }

        @property({ attribute: 'disable-elevation', type: Boolean, noAccessor: true })
        public get disableElevation() {
            return this.effectiveDisableElevation
        }
        public set disableElevation(value: boolean) {
            if (this._elevationAttributeSyncSource) {
                return
            }

            const oldValue = this._disableElevation
            const oldConfigured = this._disableElevationConfigured

            this._disableElevation = value
            this._disableElevationConfigured = true

            this._elevationAttributeSyncSource = 'property'
            this.toggleAttribute('disable-elevation', value)
            this._elevationAttributeSyncSource = null

            if (oldValue !== value || !oldConfigured) {
                this.requestUpdate('disableElevation', oldValue)
            }
        }

        private get useLocalConfig(): boolean {
            return this._ignoreGlobalConfig || this._disableElevationConfigured
        }

        private get effectiveDisableElevation(): boolean {
            if (this.useLocalConfig) {
                return this._disableElevation
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

        private syncDisableElevationAttribute() {
            const effectiveDisableElevation = this.effectiveDisableElevation

            if (this.hasAttribute('disable-elevation') === effectiveDisableElevation) return

            this._elevationAttributeSyncSource = 'property'
            this.toggleAttribute('disable-elevation', effectiveDisableElevation)
            this._elevationAttributeSyncSource = null
        }

        override attributeChangedCallback(name: string, old: string | null, value: string | null) {
            if (name === 'ignore-global-config') {
                if (this._elevationAttributeSyncSource) return

                const oldValue = this._ignoreGlobalConfig
                this._ignoreGlobalConfig = value !== null
                this.requestUpdate('ignoreGlobalConfig', oldValue)
                return
            }

            if (name === 'disable-elevation') {
                if (this._elevationAttributeSyncSource) return

                const oldValue = this._disableElevation
                this._disableElevation = value !== null
                this._disableElevationConfigured = true
                this.requestUpdate('disableElevation', oldValue)
                return
            }

            super.attributeChangedCallback(name, old, value)
        }

        public renderElevation(): TemplateResult {
            const disabled = this.disableElevation || (this.disabled ?? false)

            if (this.useLocalConfig) {
                return html`
                    <mdc-elevation
                        part="elevation"
                        ignore-global-config
                        .disabled=${disabled}
                    ></mdc-elevation>
                `
            }

            if (disabled) {
                return html`
                    <mdc-elevation
                        part="elevation"
                        .disabled=${disabled}
                    ></mdc-elevation>
                `
            }

            return html`<mdc-elevation part="elevation"></mdc-elevation>`
        }

        protected override updated(_changedProperties: PropertyValues) {
            super.updated(_changedProperties)
            this.syncDisableElevationAttribute()
        }

    }

    return WithElevationOptions
}
