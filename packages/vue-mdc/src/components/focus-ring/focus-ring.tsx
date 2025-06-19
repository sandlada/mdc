/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Sandlada & Kai Orion]
 *
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { FocusRingController } from './focus-ring-controller'
import { props, type TFocusRingSlot } from './focus-ring.definition'
import css from './styles/focus-ring.module.scss'

export const FocusRing = defineComponent({
    name: `${componentNamePrefix}-focus-ring`,
    props: props,
    slots: {} as SlotsType<TFocusRingSlot>,
    emits: [],
    setup(props) {
        const root = ref<HTMLElement | null>(null)
        const focusRingController = ref<null | FocusRingController>(null)

        const _for = ref(props.for)
        const _inward = ref(props.inward)
        const _shapeInherit = ref(props.shapeInherit)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'for', ref: _for, reflect: true, type: 'string' },
                { attribute: 'inward', ref: _inward, reflect: true, type: 'boolean' },
                { attribute: 'shape-inherit', ref: _shapeInherit, reflect: true, type: 'boolean' },
            ],
            tick: 'before'
        })

        focusRingController.value = new FocusRingController(root)

        return () => (
            <div
                class={css['focus-ring']}
                aria-hidden="true"
                data-component="focus-ring"
                ref={root}
            ></div>

        )
    },
    inheritAttrs: true,
})
