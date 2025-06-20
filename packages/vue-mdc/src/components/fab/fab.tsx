/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { computed, defineComponent, ref, type SlotsType } from "vue"
import { componentNamePrefix } from "../../internals/component-name-prefix/component-name-prefix"
import { Elevation } from "../elevation/elevation"
import { FocusRing } from "../focus-ring"
import { Ripple } from "../ripple/ripple"
import { props, type TFabSlots } from './fab.definition'
import css from "./styles/fab.module.scss"

export const Fab = defineComponent({
    name: `${componentNamePrefix}-fab`,
    props: props,
    slots: {} as SlotsType<TFabSlots>,
    setup(props, { slots }) {
        const root = ref<HTMLElement | null>(null)

        /**
         * Props
         */
        const _size = ref(props.size)
        const _label = ref<string | null>(props.label)
        const _appearance = ref(props.appearance)
        const _lowered = ref(props.lowered)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'label', ref: _label, reflect: true, type: 'string', },
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string', },
                { attribute: 'lowered', ref: _lowered, reflect: true, type: 'boolean', },
            ]
        })

        /**
         * Computed
         */
        const isExtended = computed(() => _label.value !== null && _label.value !== '' && _label.value.length !== 0)

        return () => {
            const renderIcon = (
                <span class={css.icon}>
                    {slots.default && slots.default()}
                </span>
            )

            const renderLabel = <span class={css.label}>{_label.value}</span>

            return (
                <button
                    data-component="fab"
                    class={[
                        css.fab,
                        isExtended.value && css.extended,
                        css[_size.value],
                        css[_appearance.value],
                        _lowered.value && css.lowered,
                        slots.default && css['has-icon']
                    ]}
                    ref={root}
                >
                    <Ripple></Ripple>
                    <Elevation></Elevation>
                    <FocusRing shapeInherit={false}></FocusRing>

                    <span class={css["touch-target"]}></span>

                    {renderIcon}
                    {isExtended.value && renderLabel}
                </button>
            )
        }
    },
    inheritAttrs: true,
})
