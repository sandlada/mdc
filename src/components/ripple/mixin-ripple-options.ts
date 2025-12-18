import { html, type LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'
import type { MDCRipple } from './ripple'

export interface IMixinRippleAttributes {
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

export function mixinRippleOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinRippleOptions> {
    abstract class WithRippleOptions extends base implements IMixinRippleOptions {
        declare disabled?: boolean

        @property({ type: Boolean, attribute: 'disable-ripple' })
        public disableRipple: boolean = false

        @property({ type: Boolean, attribute: 'disable-ripple-hover-state-layer' })
        public disableRippleHoverStateLayer: boolean = false

        @property({ type: Boolean, attribute: 'disable-ripple-focus-state-layer' })
        public disableRippleFocusStateLayer: boolean = false

        @property({ type: Boolean, attribute: 'disable-ripple-press-state-layer' })
        public disableRipplePressStateLayer: boolean = false

        @query('#ripple-part')
        public rippleElement!: MDCRipple | null

        public get rippleHtmlFor(): string | null {
            return null
        }
        public get rippleControl(): HTMLElement | null {
            return null
        }

        private _currentRippleHtmlFor: string | null = null
        private _currentRippleControl: HTMLElement | null = null

        protected override updated(_changedProperties: PropertyValues): void {
            super.updated(_changedProperties)

            if(this.rippleElement) {
                if(this._currentRippleControl !== this.rippleControl) {
                    this.rippleElement.control = this.rippleControl
                    this._currentRippleControl = this.rippleControl
                }
                if(this._currentRippleHtmlFor !== this.rippleControl) {
                    this.rippleElement.htmlFor = this.rippleHtmlFor
                    this._currentRippleHtmlFor = this.rippleHtmlFor
                }
            }
        }

        public renderRipple(): TemplateResult {
            return html`
                <mdc-ripple
                    part="ripple"
                    id="ripple-part"
                    ?disabled=${this.disableRipple || this.disabled}
                    ?disable-hover-state-layer=${this.disableRippleHoverStateLayer}
                    ?disable-focus-state-layer=${this.disableRippleFocusStateLayer}
                    ?disable-press-state-layer=${this.disableRipplePressStateLayer}
                ></mdc-ripple>`
        }
    }

    return WithRippleOptions
}
