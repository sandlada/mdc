import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'

export interface IMixinFocusRingOptions {
    focusRingControl : HTMLElement | null
    focusRingHtmlFor : string | null
    focusRingInward: boolean
    focusRingShapeInherit: boolean
    disableFocusRing : boolean
    renderFocusRing(): TemplateResult
}

export function mixinFocusRingOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinFocusRingOptions> {
    abstract class WithFocusRing extends base implements IMixinFocusRingOptions {

        declare disabled?: boolean

        @property({ attribute: 'focus-ring-shape-inherit', type: Boolean, reflect: true })
        public focusRingShapeInherit: boolean = true

        @property({ attribute: 'focus-ring-inward', type: Boolean, reflect: true })
        public focusRingInward: boolean = false

        @property({ attribute: 'disable-focus-ring', reflect: true, type: Boolean })
        public disableFocusRing: boolean = false

        @state()
        public focusRingControl: HTMLElement | null = null

        @state()
        public focusRingHtmlFor: string | null = null

        public renderFocusRing(): TemplateResult {
            return html`
                ${this.disableFocusRing || this.disabled ? nothing : html`
                    <mdc-focus-ring
                        part="focus-ring"
                        ?inward=${this.focusRingInward}
                        ?shape-inherit=${this.focusRingShapeInherit}
                        .control=${this.focusRingControl}
                        .htmlFor=${this.focusRingHtmlFor}
                    ></mdc-focus-ring>
                `}
            `
        }
    }

    return WithFocusRing
}
