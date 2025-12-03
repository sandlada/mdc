/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { props, type TSplitButtonGroupSlots } from './split-button-group.definition'
import css from './styles/split-button.module.scss'

export const SplitButtonGroup = defineComponent({
    name: `${componentNamePrefix}-split-button-group`,
    props: props,
    slots: {} as SlotsType<TSplitButtonGroupSlots>,
    emits: [],
    setup(props, { slots }) {

        return () => (
            <div class={css['button-group']}>
                {slots.default && slots.default()}
            </div>
        )
    },
    inheritAttrs: true,
})
