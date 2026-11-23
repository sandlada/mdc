/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createBreakpointObserver, DEFAULT_WIDTH_BREAKPOINTS } from '@sandlada/breakpoint'
import type { BreakpointObserverInstance } from '@sandlada/breakpoint'

/** Token used to `inject()` the breakpoint observer service. */
export const BreakpointObserverToken = 'breakpoint:observer'

let Observer: BreakpointObserverInstance | undefined
let ActiveBreakpoints: string[] = []

/**
 * Re-apply the latest width breakpoint attributes onto `documentElement`.
 * Used after Astro `ClientRouter` swaps root attributes.
 */
export function syncBreakpointAttributes(): void {
    Object.keys(DEFAULT_WIDTH_BREAKPOINTS).forEach((name) => document.documentElement.removeAttribute(name))
    ActiveBreakpoints.forEach((attr) => document.documentElement.setAttribute(attr, ``))
}

/**
 * Lazily create the single width breakpoint observer for the document root and
 * mirror the active breakpoints onto `documentElement` as empty attributes.
 *
 * The instance is cached for the lifetime of the module; it is shared by every
 * consumer that injects `breakpoint:observer` from the root session.
 */
export function getBreakpointObserver(): BreakpointObserverInstance {
    if (Observer) return Observer

    Observer = createBreakpointObserver({
        element: document.documentElement,
        widthBreakpoints: DEFAULT_WIDTH_BREAKPOINTS,
        dimension: 'width',
    })

    Observer.activeWidthBreakpoints$.subscribe((state) => {
        ActiveBreakpoints = [...state]
        syncBreakpointAttributes()
    })

    return Observer
}
