import { type LitElement } from 'lit'
import type { MixinBase, MixinReturn } from './mixin'

export interface IConnectedPromiseResolve {
    isConnectedPromiseResolve: () => void
    isConnectedPromise: Promise<void>
}

export function mixinConnectedPromiseResolve<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, IConnectedPromiseResolve> {
    abstract class ConnectedPromiseResolve extends base implements IConnectedPromiseResolve {
        public isConnectedPromiseResolve!: () => void
        public isConnectedPromise = this.getIsConnectedPromise()

        protected getIsConnectedPromise() {
            return new Promise<void>((resolve) => {
                this.isConnectedPromiseResolve = resolve
            })
        }

        public override connectedCallback() {
            super.connectedCallback()
            this.isConnectedPromiseResolve()
        }

        public override disconnectedCallback() {
            super.disconnectedCallback()
            this.isConnectedPromise = this.getIsConnectedPromise()
        }
    }

    return ConnectedPromiseResolve
}
