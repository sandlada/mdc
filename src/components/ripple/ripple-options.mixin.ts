/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, type LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'
import type { MDCRipple } from './ripple'

export interface IMixinRippleAttributes {
    ignoreGlobalConfig             : boolean
    disableRipple               : boolean
    disableRippleHoverStateLayer: boolean
    disableRippleFocusStateLayer: boolean
    disableRipplePressStateLayer: boolean
}

export interface IMixinRippleOptions {
    rippleElement : MDCRipple | null
    rippleHtmlFor : string | null
    rippleControl : HTMLElement | null
    renderRipple(): TemplateResult
}

export function mixinRippleOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinRippleOptions & IMixinRippleAttributes> {
    abstract class WithRippleOptions extends base implements IMixinRippleOptions, IMixinRippleAttributes {
        declare disabled?: boolean

        private _ignoreGlobalConfig: boolean = false
        private _disableRipple: boolean = false
        private _disableRippleHoverStateLayer: boolean = false
        private _disableRippleFocusStateLayer: boolean = false
        private _disableRipplePressStateLayer: boolean = false
        private _rippleConfigConfigured: boolean = false
        private _rippleAttributeSyncSource: 'property' | null = null

        @property({ type: Boolean, reflect: true, attribute: 'ignore-global-config', noAccessor: true })
        public get ignoreGlobalConfig() {
            return this._ignoreGlobalConfig
        }
        public set ignoreGlobalConfig(value: boolean) {
            const oldValue = this._ignoreGlobalConfig

            if (oldValue === value) return

            this._ignoreGlobalConfig = value

            this._rippleAttributeSyncSource = 'property'
            this.toggleAttribute('ignore-global-config', value)
            if (this._rippleAttributeSyncSource) {
                this._rippleAttributeSyncSource = null
            }

            this.requestUpdate('ignoreGlobalConfig', oldValue)
        }

        @property({ type: Boolean, reflect: true, attribute: 'disable-ripple', noAccessor: true })
        public get disableRipple() {
            return this._disableRipple
        }
        public set disableRipple(value: boolean) {
            if (this._rippleAttributeSyncSource) {
                return
            }

            const oldValue = this._disableRipple

            this._disableRipple = value
            this._rippleConfigConfigured = true

            this._rippleAttributeSyncSource = 'property'
            this.toggleAttribute('disable-ripple', value)
            this._rippleAttributeSyncSource = null

            this.requestUpdate('disableRipple', oldValue)
        }

        @property({ type: Boolean, reflect: true, attribute: 'disable-ripple-hover-state-layer', noAccessor: true })
        public get disableRippleHoverStateLayer() {
            return this._disableRippleHoverStateLayer
        }
        public set disableRippleHoverStateLayer(value: boolean) {
            if (this._rippleAttributeSyncSource) {
                return
            }

            const oldValue = this._disableRippleHoverStateLayer

            this._disableRippleHoverStateLayer = value
            this._rippleConfigConfigured = true

            this._rippleAttributeSyncSource = 'property'
            this.toggleAttribute('disable-ripple-hover-state-layer', value)
            this._rippleAttributeSyncSource = null

            this.requestUpdate('disableRippleHoverStateLayer', oldValue)
        }

        @property({ type: Boolean, reflect: true, attribute: 'disable-ripple-focus-state-layer', noAccessor: true })
        public get disableRippleFocusStateLayer() {
            return this._disableRippleFocusStateLayer
        }
        public set disableRippleFocusStateLayer(value: boolean) {
            if (this._rippleAttributeSyncSource) {
                return
            }

            const oldValue = this._disableRippleFocusStateLayer

            this._disableRippleFocusStateLayer = value
            this._rippleConfigConfigured = true

            this._rippleAttributeSyncSource = 'property'
            this.toggleAttribute('disable-ripple-focus-state-layer', value)
            this._rippleAttributeSyncSource = null

            this.requestUpdate('disableRippleFocusStateLayer', oldValue)
        }

        @property({ type: Boolean, reflect: true, attribute: 'disable-ripple-press-state-layer', noAccessor: true })
        public get disableRipplePressStateLayer() {
            return this._disableRipplePressStateLayer
        }
        public set disableRipplePressStateLayer(value: boolean) {
            if (this._rippleAttributeSyncSource) {
                return
            }

            const oldValue = this._disableRipplePressStateLayer

            this._disableRipplePressStateLayer = value
            this._rippleConfigConfigured = true

            this._rippleAttributeSyncSource = 'property'
            this.toggleAttribute('disable-ripple-press-state-layer', value)
            this._rippleAttributeSyncSource = null

            this.requestUpdate('disableRipplePressStateLayer', oldValue)
        }

        @query('#ripple-part')
        public rippleElement!: MDCRipple | null

        private get useLocalConfig(): boolean {
            return this._ignoreGlobalConfig || this._rippleConfigConfigured
        }

        public get rippleHtmlFor(): string | null {
            return this.rippleElement?.htmlFor ?? null
        }
        public get rippleControl(): HTMLElement | null {
            return this.rippleElement?.control ?? null
        }

        protected override updated(_changedProperties: PropertyValues): void {
            super.updated(_changedProperties)

            if(this.rippleElement) {
                if(this.rippleElement.control !== this.rippleControl) {
                    this.rippleElement.control = this.rippleControl
                }
                if(this.rippleElement.htmlFor !== this.rippleHtmlFor) {
                    this.rippleElement.htmlFor = this.rippleHtmlFor
                }
            }
        }

        public renderRipple(): TemplateResult {
            if (!this.useLocalConfig) {
                return html`
                    <mdc-ripple
                        part="ripple"
                        id="ripple-part"
                    ></mdc-ripple>
                `
            }

            return html`
                <mdc-ripple
                    part="ripple"
                    id="ripple-part"
                    ignore-global-config
                    .disabled=${this.disableRipple}
                    .disableHoverStateLayer=${this.disableRippleHoverStateLayer}
                    .disableFocusStateLayer=${this.disableRippleFocusStateLayer}
                    .disablePressStateLayer=${this.disableRipplePressStateLayer}
                ></mdc-ripple>
            `
        }
    }

    return WithRippleOptions
}
