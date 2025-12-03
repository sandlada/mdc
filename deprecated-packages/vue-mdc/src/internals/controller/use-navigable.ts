/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { nextTick, onMounted, type Component, type Ref } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
import { isServer } from '../../utils'

export interface INavigation {
    // tabDefinition: Array<INavigationItem>
    getTabElements(): Array<HTMLElement>
    getActiveTabElement(): HTMLElement | null
    setActiveTabByLabel: (label: string) => void
    setActiveTabByOrder: (order: number) => void
    setActiveTabByElement: (element: HTMLElement) => void
}

export interface INavigationItem {
    label: string
    href?: string
    disabled?: boolean
    hide?: boolean
    icon?: JSX.Element | Component
    hideInactiveLabel?: boolean
}

interface IUseNavigableOptions {
    tabs: Array<INavigationItem>
    hideInactiveLabel?: boolean
    defaultActiveTabOrder?: number
    handleChange?: (e: Event) => void
}

export const SNavigableController = Symbol('navigableController')

export interface INavigableHost extends HTMLElement {
    [SNavigableController]: INavigation
}

export function useNavigable(
    hostRef: Ref<HTMLElement | null>,
    options: IUseNavigableOptions
): INavigation {

    const getTabElements = () => {
        if (isServer() || !hostRef.value) {
            return []
        }
        const elements: Array<HTMLElement> = []
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            if ((treewalker.currentNode as HTMLElement).hasAttribute('navigation-tab')) {
                elements.push(treewalker.currentNode as HTMLElement)
            }
        }
        return elements
    }

    /**
     * ```
     * <div navigation-tab>Tab 1</div>
     * <div navigation-tab active-navigation-tab>Tab 2</div>
     * <div navigation-tab>Tab 3</div>
     * ```
     */
    const getActiveTabElement = () => {
        if (isServer() || !hostRef.value) {
            return null
        }
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            const node = treewalker.currentNode as HTMLElement
            if (node.hasAttribute('active-navigation-tab') && node.hasAttribute('navigation-tab')) {
                return node
            }
        }
        return null
    }


    const _isTab = (tabLike: HTMLElement) => {
        return tabLike.hasAttribute('navigation-tab')
    }

    const _resetTabElementAttribute = () => {
        if (!hostRef.value) {
            return
        }
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            const node = treewalker.currentNode as HTMLElement
            if (!node.hasAttribute('navigation-tab')) {
                continue
            }

            if (node.hasAttribute('active-navigation-tab')) {
                node.removeAttribute('active-navigation-tab')
            }
        }
    }

    const setActiveTabByLabel = (label: string) => {
        if (isServer() || !hostRef.value) {
            return
        }
        _resetTabElementAttribute()
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            const node = treewalker.currentNode as HTMLElement
            if (!_isTab(node)) {
                continue
            }

            if (node.hasAttribute('label') && node.getAttribute('label') === label) {
                if (_dispatchTabChangeEvent(node)) {
                    break
                }
                node.setAttribute('active-navigation-tab', ``)
                break
            }
        }
    }
    const setActiveTabByOrder = (order: number) => {
        if (isServer() || !hostRef.value) {
            return
        }
        _resetTabElementAttribute()
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            const node = treewalker.currentNode as HTMLElement
            if (!_isTab(node)) {
                continue
            }

            if (node.hasAttribute('order') && Number(node.getAttribute('order')) === order) {
                if (!_dispatchTabChangeEvent(node)) {
                    break
                }
                node.setAttribute('active-navigation-tab', ``)
                break
            }
        }
    }
    const setActiveTabByElement = (element: HTMLElement) => {
        if (isServer() || !hostRef.value) {
            return
        }
        _resetTabElementAttribute()
        const treewalker = document.createTreeWalker(hostRef.value, NodeFilter.SHOW_ELEMENT)
        while (treewalker.nextNode()) {
            const node = treewalker.currentNode as HTMLElement
            if (!_isTab(node)) {
                continue
            }

            if (node.isSameNode(element)) {
                if (!_dispatchTabChangeEvent(node)) {
                    break
                }
                node.setAttribute('active-navigation-tab', ``)
                break
            }
        }
    }

    const _handleTabClick = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        const tab = e.currentTarget as HTMLElement
        setActiveTabByElement(tab)
    }
    const _handleTabChange = (e: Event) => {
        if (isServer() || !hostRef.value) {
            return
        }
        e.stopImmediatePropagation()
        if (options.handleChange) {
            options.handleChange(e)
        }
        hostRef.value.removeEventListener('change', _handleTabChange)
    }
    const _dispatchTabChangeEvent = (element: HTMLElement) => {
        if (isServer() || !hostRef.value) {
            return
        }

        const event = new CustomEvent('change', {
            cancelable: true,
            bubbles: true,
        })
        hostRef.value.addEventListener('change', _handleTabChange)

        return element.dispatchEvent(event)
    }

    onMounted(() => {
        if (isServer()) {
            return
        }

        nextTick(() => {
            if (!hostRef.value) {
                return
            }

            const host = hostRef.value as INavigableHost

            getTabElements().forEach(tab => {
                tab.addEventListener('click', _handleTabClick)
            })

            host[SNavigableController] = ({
                getTabElements,
                getActiveTabElement,
                setActiveTabByLabel,
                setActiveTabByOrder,
                setActiveTabByElement,
            })
        })
    })

    return ({
        getTabElements,
        getActiveTabElement,
        setActiveTabByLabel,
        setActiveTabByOrder,
        setActiveTabByElement,
    })
}
