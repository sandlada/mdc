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
import { FabSize, props, type TFabSlots } from './fab.definition'
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
        const _variant = ref(props.variant)
        const _lowered = ref(props.lowered)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'label', ref: _label, reflect: true, type: 'string', },
                { attribute: 'variant', ref: _variant, reflect: true, type: 'string', },
                { attribute: 'lowered', ref: _lowered, reflect: true, type: 'boolean', },
            ]
        })

        /**
         * Computed
         */
        const isMediumSize = computed(() => _size.value === FabSize.Medium)
        const isExtended = computed(() => _label.value !== null && _label.value.length !== 0)

        return () => {
            if (isExtended.value && !isMediumSize.value) {
                console.warn(
                    `The label and icon can only be set at the same time when the size is medium. If the size attribute of your fab component is not medium, please remove the label attribute.`
                )
            }

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
                        isExtended.value && isMediumSize.value && css.extended,
                        css[_size.value],
                        css[_variant.value],
                        _lowered.value && css.lowered,
                    ]}
                    ref={root}
                >
                    <Ripple></Ripple>
                    <Elevation></Elevation>
                    <FocusRing shapeInherit={false}></FocusRing>

                    <span class={css["touch-target"]}></span>

                    {renderIcon}
                    {isExtended.value && isMediumSize.value && renderLabel}
                </button>
            )
        }
    },
    inheritAttrs: true,
})
