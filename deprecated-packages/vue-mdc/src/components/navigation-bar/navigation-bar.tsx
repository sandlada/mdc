/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { useNavigable } from '../../internals/controller/use-navigable'
import { renderNavigationDestination } from '../../internals/navigation/render-navigation-destination'
import { Elevation } from '../elevation'
import { NavigationTab } from '../navigation-tab'
import { NavigationBarRippleStyle, props, type TNavigationBarSlots } from './navigation-bar.definition'
import css from './styles/navigation-bar.module.scss'

const NavigationBar = defineComponent({
    name: `${componentNamePrefix}-navigation-bar`,
    slots: {} as SlotsType<TNavigationBarSlots>,
    props: props,
    emits: [
        'change'
    ],
    setup(props, { slots, emit }) {
        const root = ref<HTMLElement | null>(null)

        const _rippleStyle = ref(props.rippleStyle)

        const handleChange = (e: Event) => {
            emit('change', e)
        }

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'ripple-style', ref: _rippleStyle, reflect: true, type: 'string' },
            ],
            tick: 'after'
        })

        useNavigable(root, {
            tabs: [],
            handleChange,
        })

        return () => {
            renderNavigationDestination({
                component: NavigationTab,
                container: root,
                tabs: props.tabs,
                props: (tabConfig) => ({
                    hideInactiveLabel: typeof tabConfig.hideInactiveLabel === 'undefined' ? props.hideInactiveLabel : tabConfig.hideInactiveLabel,
                    label: tabConfig.label ?? 'Unnamed Tab',
                })
            })

            return (
                <div
                    data-component="navigation-bar"
                    class={[css['navigation-bar'], _rippleStyle.value === NavigationBarRippleStyle.Unbounded && css['ripple-unbounded']]}
                    ref={root}
                >
                    {slots.default && slots.default()}

                    <Elevation></Elevation>
                </div>
            )
        }
    },
    inheritAttrs: true,
})

export {
    NavigationBar
}
