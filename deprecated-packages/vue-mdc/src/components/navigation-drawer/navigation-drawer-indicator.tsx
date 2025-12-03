/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type PropType, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple'
import css from './styles/navigation-drawer.module.scss'

const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
)

export const NavigationDrawerIndicator = defineComponent({
    name: `${componentNamePrefix}-navigation-drawer-indicator`,
    props: {
        defaultActive: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        label: {
            type: String as PropType<string>,
            default: 'Unnamed Label',
        }
    },
    slots: {} as SlotsType<{
        default?: void
        icon?: void
    }>,
    emits: [
        'request-route'
    ],
    mounted() {
        if (isServer()) {
            return
        }

        const root = this.$el as HTMLElement

        root.addEventListener('click', this.handleClick)
    },
    methods: {
        handleClick() {
            const root = this.$el as HTMLElement
            const event = new CustomEvent('request-route', {
                bubbles: true,
                cancelable: false,
                detail: {
                    element: this.$el
                }
            })
            root.dispatchEvent(event)
            this.$emit('request-route', event)
        }
    },
    render() {
        return (
            <button
                data-component="navigation-drawer-indicator"
                data-label={this.label}
                class={[css['navigation-drawer-indicator-component-styles'], this.defaultActive && css.active]}

            >
                {this.$slots.icon ? this.$slots.icon() : defaultIcon}
                <span class={css.label}>
                    {this.label}
                </span>
                <Ripple></Ripple>
                <FocusRing></FocusRing>
            </button>
        )
    }
})
