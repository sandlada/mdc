/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import css from './styles/navigation-drawer.module.scss'

export const NavigationDrawerHeadline = defineComponent({
    name: `${componentNamePrefix}-navigation-drawer-headline`,
    slots: {} as SlotsType<{
        default?: void
    }>,
    emits: [],
    render() {
        return (
            <span
                data-component="navigation-drawer-headline"
                class={css['navigation-drawer-headline-component-styles']}
            >
                {this.$slots.default && this.$slots.default()}
            </span>
        )
    }
})
