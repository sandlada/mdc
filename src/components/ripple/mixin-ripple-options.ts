import { html, type LitElement, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'

export interface IMixinRippleOptions {
    disableRipple               : boolean
    disableRippleHoverStateLayer: boolean
    disableRippleFocusStateLayer: boolean
    disableRipplePressStateLayer: boolean
    rippleHtmlFor               : string | null
    rippleControl               : HTMLElement | null
    renderRipple()              : TemplateResult
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

        @state()
        public rippleHtmlFor: string | null = null

        @state()
        public rippleControl: HTMLElement | null = null

        public renderRipple(): TemplateResult {
            return html`
                <mdc-ripple
                    part="ripple"
                    id="ripple-part"
                    ?disabled=${this.disableRipple || this.disabled}
                    ?disable-hover-state-layer=${this.disableRippleHoverStateLayer}
                    ?disable-focus-state-layer=${this.disableRippleFocusStateLayer}
                    ?disable-press-state-layer=${this.disableRipplePressStateLayer}
                    .control=${(this.rippleControl)}
                    .htmlFor=${(this.rippleHtmlFor)}
                ></mdc-ripple>`
        }
    }

    return WithRippleOptions
}
