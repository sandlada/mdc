/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, type LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'
import type { MDCFocusRing } from './focus-ring'

export interface IMixinFocusRingAttributes {
    ignoreGlobalConfig        : boolean
    focusRingInward           : boolean
    focusRingShapeInherit     : boolean
    focusRingDisabled         : boolean
    focusRingAnimationDisabled: boolean
    focusRingFocused          : boolean
}

export interface IMixinFocusRing extends IMixinFocusRingAttributes {
    focusRingControl : HTMLElement | null
    focusRingHtmlFor : string | null
    focusRingElement : MDCFocusRing | null
    renderFocusRing(): TemplateResult
}

export function mixinFocusRingOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinFocusRing> {
    abstract class WithFocusRing extends base implements IMixinFocusRing {

        declare disabled?: boolean

        private _ignoreGlobalConfig: boolean = false
        private _focusRingDisabled: boolean = false
        private _focusRingDisabledConfigured: boolean = false
        private _focusRingAttributeSyncSource: 'property' | null = null

        @property({ type: Boolean, reflect: true, attribute: 'ignore-global-config', noAccessor: true })
        public get ignoreGlobalConfig() {
            return this._ignoreGlobalConfig
        }
        public set ignoreGlobalConfig(value: boolean) {
            const oldValue = this._ignoreGlobalConfig

            if (oldValue === value) return

            this._ignoreGlobalConfig = value

            this._focusRingAttributeSyncSource = 'property'
            this.toggleAttribute('ignore-global-config', value)
            this._focusRingAttributeSyncSource = null

            this.requestUpdate('ignoreGlobalConfig', oldValue)
        }

        @property({ type: Boolean, reflect: true, attribute: 'focus-ring-shape-inherit' })
        public focusRingShapeInherit: boolean = true

        @property({ type: Boolean, reflect: true, attribute: 'focus-ring-inward' })
        public focusRingInward: boolean = false

        // Only sync this flag to the child ring when it has been explicitly set.
        @property({ type: Boolean, attribute: 'focus-ring-disabled', noAccessor: true })
        public get focusRingDisabled() {
            return this._focusRingDisabled
        }
        public set focusRingDisabled(value: boolean) {
            if (this._focusRingAttributeSyncSource) {
                return
            }

            const oldValue = this._focusRingDisabled
            const oldConfigured = this._focusRingDisabledConfigured

            this._focusRingDisabled = value
            this._focusRingDisabledConfigured = true

            this._focusRingAttributeSyncSource = 'property'
            this.toggleAttribute('focus-ring-disabled', value)
            this._focusRingAttributeSyncSource = null

            if (oldValue !== value || !oldConfigured) {
                this.requestUpdate('focusRingDisabled', oldValue)
            }
        }

        @property({ type: Boolean, reflect: true, attribute: 'focus-ring-animation-disabled' })
        public focusRingAnimationDisabled: boolean = false

        @property({ type: Boolean, reflect: true, attribute: 'focus-ring-focused'})
        public focusRingFocused: boolean = false

        @query('#focus-ring-part')
        public focusRingElement!: MDCFocusRing | null

        public get focusRingHtmlFor(): string | null {
            return this.focusRingElement?.htmlFor ?? null
        }
        public get focusRingControl(): HTMLElement | null {
            return this.focusRingElement?.control ?? null
        }

        private get useLocalConfig(): boolean {
            return this._ignoreGlobalConfig || this._focusRingDisabledConfigured
        }

        override attributeChangedCallback(name: string, old: string | null, value: string | null) {
            if (name === 'ignore-global-config') {
                if (this._focusRingAttributeSyncSource) {
                    return
                }

                const oldValue = this._ignoreGlobalConfig
                this._ignoreGlobalConfig = value !== null
                this.requestUpdate('ignoreGlobalConfig', oldValue)
                return
            }

            if (name === 'focus-ring-disabled') {
                if (this._focusRingAttributeSyncSource) {
                    return
                }

                const oldValue = this._focusRingDisabled
                this._focusRingDisabled = value !== null
                this._focusRingDisabledConfigured = true
                this.requestUpdate('focusRingDisabled', oldValue)
                return
            }

            super.attributeChangedCallback(name, old, value)
        }

        protected override updated(_changedProperties: PropertyValues): void {
            super.updated(_changedProperties)

            if(this.focusRingElement) {
               if(this.focusRingElement.control !== this.focusRingControl) {
                    this.focusRingElement.control = this.focusRingControl
                }
                if(this.focusRingElement.htmlFor !== this.focusRingHtmlFor) {
                    this.focusRingElement.htmlFor = this.focusRingHtmlFor
                }
                if(this.useLocalConfig && this.focusRingElement.disabled !== this.focusRingDisabled) {
                    this.focusRingElement.disabled = this.focusRingDisabled
                }
                if(this.focusRingElement.animationDisabled !== this.focusRingAnimationDisabled) {
                    this.focusRingElement.animationDisabled = this.focusRingAnimationDisabled
                }
                if(this.focusRingElement.focused !== this.focusRingFocused) {
                    this.focusRingElement.focused = this.focusRingFocused
                }
            }
        }

        public renderFocusRing(): TemplateResult {
            if (!this.useLocalConfig) {
                return html`
                    <mdc-focus-ring
                        part="focus-ring"
                        id="focus-ring-part"
                        ?inward=${this.focusRingInward}
                        ?shape-inherit=${this.focusRingShapeInherit}
                    ></mdc-focus-ring>
                `
            }

            return html`
                <mdc-focus-ring
                    part="focus-ring"
                    id="focus-ring-part"
                    ignore-global-config
                    .disabled=${this.focusRingDisabled}
                    ?inward=${this.focusRingInward}
                    ?shape-inherit=${this.focusRingShapeInherit}
                ></mdc-focus-ring>
            `
        }
    }

    return WithFocusRing
}
