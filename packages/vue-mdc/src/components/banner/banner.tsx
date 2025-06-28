/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { Elevation } from '../elevation'
import { props, type TBannerSlots } from './banner.definition'
import css from './styles/banner.module.scss'

export const Banner = defineComponent({
    name: `${componentNamePrefix}-banner`,
    props: props,
    slots: {} as SlotsType<TBannerSlots>,
    emits: [],
    setup(props, { slots }) {
        const root = ref<HTMLElement | null>(null)

        const _appearance = ref(props.appearance)
        const _line = ref(props.line)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string' },
                { attribute: 'line', ref: _line, reflect: true, type: 'string' },
            ],
        })

        return () => {

            return (
                <div data-component="banner" ref={root} class={[css.banner, css.desktop, css[_line.value], css[_appearance.value]]}>
                    <span class={css.icon}>
                        {slots.icon && slots.icon()}
                    </span>

                    <span class={css['supporting-text']}>
                        {slots.default && slots.default()}
                    </span>

                    <span class={css.actions}>
                        {slots.actions && slots.actions()}
                    </span>

                    <Elevation></Elevation>
                </div>
            )
        }
    }
})
