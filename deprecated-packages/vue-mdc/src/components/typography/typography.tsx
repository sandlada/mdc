/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, h, ref, toRef, type SlotsType, type VNodeRef } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { useObserveProps } from '../../utils/observe-props'
import css from './styles/typography.module.scss'
import { props, type TTypograhySlots } from './typography.definition'

export const Typography = defineComponent({
    name: `${componentNamePrefix}-typography`,
    props: props,
    slots: {} as SlotsType<TTypograhySlots>,
    setup(props, { slots }) {

        const root: VNodeRef = ref(null)

        const _variant = ref(props.variant)
        const _emphasized = ref(props.emphasized)
        const _tag = ref(props.tag)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'variant', ref: _variant, reflect: true, type: 'string', },
                { attribute: 'emphasized', ref: _emphasized, reflect: true, type: 'boolean', },
                // { attribute: 'tag', ref: _tag, reflect: true, type: 'string', },
            ],
        })

        useObserveProps([
            { id: 'variant', property: toRef(props, 'variant'), callback: (value) => { _variant.value = value }, },
            { id: 'emphasized', property: toRef(props, 'emphasized'), callback: (value) => { _emphasized.value = value }, },
            // { id: 'tag', property: toRef(props, 'tag'), callback: (value) => { _tag.value = value }, },
        ])

        return () => h(props.tag, {
            'data-component': 'typography',
            ref: root,
            class: [css.typography, css[props.variant], props.emphasized && css.emphasized],
        },
            slots.default ? slots.default() : '',
        )
    },
    inheritAttrs: true,
})
