/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, onMounted, ref, type SlotsType } from 'vue'
import { SAttachableController, type IAttachableHost } from '../../internals'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import { props, type TNavigationRailTabSlots } from './navigation-rail-tab.definition'
import css from './styles/navigation-rail-tab.module.scss'

export const NavigationRailTab = defineComponent({
    name: `${componentNamePrefix}-navigation-rail-tab`,
    props: props,
    slots: {} as SlotsType<TNavigationRailTabSlots>,
    emits: [
        'tab-click',
        'change',
    ],
    setup(props, { slots, emit }) {
        const root = ref<HTMLElement | null>(null)

        const _hideInactiveLabel = ref(props.hideInactiveLabel)
        const _label = ref(props.label)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'hide-inactive-label', ref: _hideInactiveLabel, reflect: true, type: 'boolean' },
                { attribute: 'label', ref: _label, reflect: true, type: 'string' },
            ],
        })

        onMounted(() => {
            if (isServer() || !root.value) {
                return
            }
            const ripple = root.value.querySelector('&>span>.ripple')! as IAttachableHost;
            (ripple[SAttachableController]).attach(root.value)
        })

        return () => (
            <button
                data-component="navigation-rail-tab"
                navigation-tab
                class={[css['navigation-rail-tab']]}
                role='tab'
                ref={root}
            >

                <FocusRing inward shapeInherit={false}></FocusRing>
                <span aria-hidden="true" class={[css["icon-content"]]}>
                    <Ripple class="ripple"></Ripple>

                    <span class={css["active-indicator"]}>
                    </span>
                    <span class={css["icon"]}>
                        {slots['inactive-icon'] ? slots['inactive-icon']() : (slots.default && slots.default())}
                    </span>
                    <span class={[css["icon"], css["icon--active"]]}>
                        {slots['active-icon'] ? slots['active-icon']() : (slots.default && slots.default())}
                    </span>
                    {/* ${this.renderBadge()} */}
                </span>

                {(typeof _label.value.length !== 'undefined' || _label.value !== null) && (
                    <span class={css['label']}>
                        {_label.value}
                    </span>
                )}

            </button>)
    },
})
