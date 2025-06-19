/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import css from './styles/typography.module.scss'
import { props, type TTypograhySlots } from './typography.definition'

export const Typography = defineComponent({
    name: `${componentNamePrefix}-typography`,
    props: props,
    slots: {} as SlotsType<TTypograhySlots>,
    render() {
        return (
            <span data-component="typography" class={[css.typography, css[this.variant]]}>
                {this.$slots.default && this.$slots.default()}
            </span>
        )
    },
    inheritAttrs: true,
})
