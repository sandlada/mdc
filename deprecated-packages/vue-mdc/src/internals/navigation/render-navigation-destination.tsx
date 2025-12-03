/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { type Component, type Ref, createVNode, render } from 'vue'
import { Fragment } from 'vue/jsx-runtime'
import { isServer } from '../../utils/is-server'
import type { INavigationItem } from '../controller/use-navigable'

const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(var(--md-navigation-destination-icon-color, --md-sys-color-on-surface, #000))" > <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /> </svg>
)

interface IRenderNavigationDestinationOptions {
    tabs: Array<INavigationItem>,
    component: Component
    container: Ref<HTMLElement | null>,
    props(tabConfig: INavigationItem): Partial<INavigationItem>
}

export function renderNavigationDestination(options: IRenderNavigationDestinationOptions) {

    const { container, props, tabs, component } = options

    if (isServer() || !container.value) {
        return
    }

    const components = tabs.map(tabConfig => {
        const iconSlot = (typeof tabConfig.icon === 'undefined' || tabConfig.icon === null) ? defaultIcon : createVNode(tabConfig.icon)

        return createVNode(component, { ...props(tabConfig) }, {
            default: () => iconSlot,
        })
    })

    const parent = createVNode(Fragment, null, components)

    render(parent, container.value!)
}
