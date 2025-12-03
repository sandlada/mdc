/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple'
import css from './styles/rich-tooltip.module.scss'

export const ActionLabel = defineComponent({
    name: `${componentNamePrefix}-rich-tooltip-action-label`,
    emits: [],
    slots: {} as SlotsType<{
        default?: void
    }>,
    props: {
    },
    setup(props, { slots }) {

        return () => (
            <a class={css['action-label']} tabindex={0} role='button'>
                {slots.default && slots.default()}

                <Ripple></Ripple>
                <FocusRing shapeInherit={false}></FocusRing>
            </a>
        )
    },
})
