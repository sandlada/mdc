import { html, nothing, type LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'
import type { MDCFocusRing } from './focus-ring'

export interface IMixinFocusRingAttributes {
    focusRingInward: boolean
    focusRingShapeInherit: boolean
    disableFocusRing : boolean
}

export interface IMixinFocusRing extends IMixinFocusRingAttributes {
    focusRingControl : HTMLElement | null
    focusRingHtmlFor : string | null
    focusRingElement: MDCFocusRing | null
    renderFocusRing(): TemplateResult
}

export function mixinFocusRingOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinFocusRing> {
    abstract class WithFocusRing extends base implements IMixinFocusRing {

        declare disabled?: boolean

        @property({ attribute: 'focus-ring-shape-inherit', type: Boolean, reflect: true })
        public focusRingShapeInherit: boolean = true

        @property({ attribute: 'focus-ring-inward', type: Boolean, reflect: true })
        public focusRingInward: boolean = false

        @property({ attribute: 'disable-focus-ring', reflect: true, type: Boolean })
        public disableFocusRing: boolean = false

        @query('#focus-ring-part')
        public focusRingElement!: MDCFocusRing | null

        public get focusRingHtmlFor(): string | null {
            return null
        }
        public get focusRingControl(): HTMLElement | null {
            return null
        }
        public set focusRingControl(value: HTMLElement | null) {
            this._currentFocusRingControl = value
        }

        private _currentFocusRingHtmlFor: string | null = null
        private _currentFocusRingControl: HTMLElement | null = null

        protected override updated(_changedProperties: PropertyValues): void {
            super.updated(_changedProperties)

            if(this.focusRingElement) {
               if(this._currentFocusRingControl !== this.focusRingControl) {
                    this.focusRingElement.control = this.focusRingControl
                    this._currentFocusRingControl = this.focusRingControl
                }
                if(this._currentFocusRingHtmlFor !== this.focusRingControl) {
                    this.focusRingElement.htmlFor = this.focusRingHtmlFor
                    this._currentFocusRingHtmlFor = this.focusRingHtmlFor
                }
            }
        }

        public renderFocusRing(): TemplateResult {
            return html`
                ${this.disableFocusRing || this.disabled ? nothing : html`
                    <mdc-focus-ring
                        part="focus-ring"
                        id="focus-ring-part"
                        ?inward=${this.focusRingInward}
                        ?shape-inherit=${this.focusRingShapeInherit}
                    ></mdc-focus-ring>
                `}
            `
        }
    }

    return WithFocusRing
}
