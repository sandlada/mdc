/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { props, type TIconSlots } from './icon.definition'
import css from './styles/icon.module.scss'

export const Icon = defineComponent({
    name: `${componentNamePrefix}-icon`,
    props: props,
    slots: {} as SlotsType<TIconSlots>,
    render() {
        return (
            <span data-component="icon" class={[css.icon, css[this.variant]]}>
                {this.$slots.default && this.$slots.default()}
            </span>
        )
    },
    inheritAttrs: true,
})
