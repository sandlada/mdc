/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { MixinBase, MixinReturn } from '../behaviors/mixin'

type AnyMixin = (base: MixinBase<any>) => MixinReturn<any, any>
type ExtractMixinInstanceType<T extends AnyMixin> = InstanceType<ReturnType<T>>

type IntersectTuple<T extends any[]> = T extends [infer First, ...infer Rest] ? First & IntersectTuple<Rest> : {}
type ExtractMixinInstanceTypes<T extends any[]> = { [K in keyof T]: ExtractMixinInstanceType<T[K]> }

type ComposedClass<Base extends MixinBase, Mixins extends any[]> =
    Omit<Base, 'prototype'> &
    {
        new(...args: ConstructorParameters<Base>):
            InstanceType<Base> & IntersectTuple<ExtractMixinInstanceTypes<Mixins>>
    }

export function composeMixin<T extends AnyMixin[]>(...mixins: T) {
    return function <Base extends MixinBase>(baseClass: Base): ComposedClass<Base, T> {
        const composed = mixins.reduce((acc, mixin) => mixin(acc), baseClass as any)
        return composed
    }
}
