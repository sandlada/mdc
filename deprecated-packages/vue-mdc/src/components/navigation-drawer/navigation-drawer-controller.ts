/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { ENavigationDrawerState } from './navigation-state'
import css from './styles/navigation-drawer.module.scss'

export const SNavigationDrawerController = Symbol("navigationDrawerController")

export interface INavigationDrawerControllerHost extends HTMLElement {
    [SNavigationDrawerController]: INavigationDrawerController
}

export interface INavigationDrawerIndicatorControllerHost extends HTMLButtonElement {

}

export interface INavigationDrawerController {
    show: () => void
    close: () => void
    state: ENavigationDrawerState
    indicatorElements: Array<INavigationDrawerIndicatorControllerHost>
    activeIndicatorElement: INavigationDrawerIndicatorControllerHost | undefined
    setActiveIndicatorByLabel: (label: string) => void
    setActiveIndicatorByOrder: (order: number) => void
    setActiveIndicatorByElement: (element: HTMLElement) => void
}

export class NavigationDrawerController implements INavigationDrawerController {

    constructor(
        private _host: INavigationDrawerControllerHost,
        public show: () => void,
        public close: () => void,
    ) {
        _host[SNavigationDrawerController] = this
    }

    public get host() {
        return this._host
    }

    public get state() {
        const attrValue = this.host.getAttribute('state')!
        const key = attrValue.at(0)?.toUpperCase() + attrValue.slice(1)
        return ENavigationDrawerState[key as keyof typeof ENavigationDrawerState]
    }

    private get dialogElement() {
        return this.host.querySelector(`.${css.dialog}`)
    }
    private get containerElement() {
        return this.host.querySelector(`.${css.container}`)
    }
    private get scrollerElement() {
        return this.host.querySelector(`.${css.scroller}`)
    }
    private get contentWrapperElement() {
        return this.host.querySelector(`.${css['content-wrapper']}`)
    }
    private get contentElement() {
        return this.host.querySelector(`.${css.content}`)
    }

    public get indicatorElements(): Array<INavigationDrawerIndicatorControllerHost> {
        if (!this.contentElement) {
            return []
        }
        return Array.from(this.contentElement.querySelectorAll(`.${css['navigation-drawer-indicator-component-styles']}[data-component="navigation-drawer-indicator"]`)) as Array<INavigationDrawerIndicatorControllerHost>
    }

    public get activeIndicatorElement(): INavigationDrawerIndicatorControllerHost | undefined {
        const indicators = this.indicatorElements
        const targetIndex = indicators.findIndex((element) => element.classList.contains(`${css.active}`))
        return indicators.at(targetIndex)
    }

    public setActiveIndicatorByLabel(label: string) {
        const target = this.indicatorElements.filter(e => label === e.getAttribute('data-label'))

        if (target.length > 1) {
            console.warn(`The target parameter label [${label}] is found, but there are multiple NavigationDrawerIndicators with the same label value in the NavigationDrawer component. Please make sure to assign unique (different label values) labels when using the NavigationDrawerIndicator component.`)
        } else if (target.length === 0) {
            console.warn(`Unable to find a NavigationDrawerIndicator with the specified label value [${label}]. Please make sure that the label value can match a NavigationDrawerIndicator.`)
        } else {
            this.indicatorElements.forEach(element => element.classList.remove(`${css.active}`))
            target[0].classList.add(`${css.active}`)
        }
    }

    public setActiveIndicatorByOrder(order: number) {
        const indicators = this.indicatorElements
        if (order >= indicators.length) {
            console.error(`The value range of order [${order}] exceeds the number of indicator elements [${indicators.length}].`)
        }
        indicators.forEach(element => element.classList.remove(`${css.active}`))
        this.indicatorElements.at(order)?.classList.add(`${css.active}`)
    }

    public setActiveIndicatorByElement(element: HTMLElement) {
        if (!element.classList.contains(`${css['navigation-drawer-indicator-component-styles']}`) && element.getAttribute('data-component') !== 'navigation-drawer-indicator') {
            console.error(`The parameter element [${element}] is not a valid NavigationDrawerIndicator component HTMLElement.`)
        } else {
            this.indicatorElements.forEach(element => element.classList.remove(`${css.active}`))
            element.classList.add(`${css.active}`)
        }
    }
}
