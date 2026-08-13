import type { LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import type { MixinBase, MixinReturn } from '../behaviors/mixin'

export type TMixinXROptions = {
    xr: boolean
    getRenderClasses(): ({xr: boolean}) & {[e: string]: any}
}

export function mixinXROptions<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, TMixinXROptions> {
    abstract class WithXROptions extends base implements TMixinXROptions {
        @property({ type: Boolean, attribute: 'xr', reflect: true, })
        public xr: boolean = false

        public getRenderClasses() {
            return ({
                'xr': this.xr,
            })
        }
    }

    return WithXROptions
}
