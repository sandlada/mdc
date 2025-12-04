import { html, type LitElement, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { MixinBase, MixinReturn } from '../../utils/behaviors/mixin'

export interface IMixinElevationOptions {
    disableElevation: boolean
    renderElevation(): TemplateResult
}

export function mixinElevationOptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IMixinElevationOptions> {
    abstract class WithElevationOptions extends base implements IMixinElevationOptions {
        @property({ attribute: 'disable-elevation', type: Boolean, reflect: true })
        public disableElevation: boolean = false

        public renderElevation() {
            const classes = classMap({
                'hidden': this.disableElevation
            })
            return html`
                <mdc-elevation part="elevation" class="${classes}"></mdc-elevation>
            `
        }

    }

    return WithElevationOptions
}
