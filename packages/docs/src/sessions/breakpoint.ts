/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createBreakpointObserver, DEFAULT_WIDTH_BREAKPOINTS } from '@sandlada/breakpoint'
import type { BreakpointObserverInstance } from '@sandlada/breakpoint'

/** Token used to `inject()` the breakpoint observer service. */
export const BREAKPOINT_OBSERVER_TOKEN = 'breakpoint:observer'

let observer: BreakpointObserverInstance | undefined

/**
 * Lazily create the single width breakpoint observer for the document root and
 * mirror the active breakpoints onto `documentElement` as empty attributes.
 *
 * The instance is cached for the lifetime of the module; it is shared by every
 * consumer that injects `breakpoint:observer` from the root session.
 */
export function getBreakpointObserver(): BreakpointObserverInstance {
    if (observer) return observer

    observer = createBreakpointObserver({
        element: document.documentElement,
        widthBreakpoints: DEFAULT_WIDTH_BREAKPOINTS,
        dimension: 'width',
    })

    observer.activeWidthBreakpoints$.subscribe((state) => {
        Object.keys(DEFAULT_WIDTH_BREAKPOINTS).forEach((name) => document.documentElement.removeAttribute(name))
        state.forEach((attr) => document.documentElement.setAttribute(attr, ``))
    })

    return observer
}
