/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ISelectionControllerHost } from '../selection-controller'

export type FocusDirection = 'previous' | 'next' | 'first' | 'last'
type GetFocusable = (control: ISelectionControllerHost) => HTMLElement

export const findNextFocusableControl = (direction: FocusDirection) => (current: ISelectionControllerHost) =>
    (controls: readonly ISelectionControllerHost[]): ISelectionControllerHost | undefined => {
        const currentIndex = controls.indexOf(current)
        const count = controls.length
        let index: number
        let step: number
        switch (direction) {
            case 'first':
                index = 0
                step = 1
                break
            case 'last':
                index = count - 1
                step = -1
                break
            case 'next':
                index = (currentIndex + 1) % count
                step = 1
                break
            case 'previous':
                index = (currentIndex - 1 + count) % count
                step = -1
                break
        }

        for (let visited = 0; visited < count; visited++) {
            const candidate = controls[index]
            if (candidate && !candidate.disabled) return candidate === current ? undefined : candidate
            index = (index + step + count) % count
        }
    }

export const syncRovingTabStops = (getFocusable: GetFocusable) => (root: Document | ShadowRoot) =>
    (controls: readonly ISelectionControllerHost[]): void => {
        if (controls.length <= 1) return
        let focused: ISelectionControllerHost | undefined
        for (let active = root.activeElement; active; active = active.shadowRoot?.activeElement ?? null) {
            focused = controls.find((control) => active === control || active === getFocusable(control))
            if (focused) break
        }
        const tabStop = focused ?? controls.find((control) => control.checked && !control.disabled)
            ?? controls.find((control) => !control.disabled)

        for (const control of controls) {
            const element = getFocusable(control)
            const tabIndex = control === tabStop ? 0 : -1
            if (element && element.tabIndex !== tabIndex) element.tabIndex = tabIndex
        }
    }

export const focusSelectionControl = (getFocusable: GetFocusable) => (control: ISelectionControllerHost): void => {
    const element = getFocusable(control)
    // Promote the destination before focus so the browser can apply :focus-visible.
    if (element.tabIndex < 0) element.tabIndex = 0
    element.focus()
}
