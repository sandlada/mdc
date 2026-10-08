/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createContext, mount, pipe, withProvider } from '@sandlada/document-context'
import { BREAKPOINT_OBSERVER_TOKEN, getBreakpointObserver } from './breakpoint'
import { createDrawerSession, DRAWER_SESSION_TOKEN, initialDrawerState, type DrawerState } from './drawer'
import { createThemeSession, initialThemeState, THEME_SESSION_TOKEN, type ThemeState } from './theme'

/**
 * Aggregate state owned by the single root session mounted on
 * `document.documentElement`. Each sub-session projects one slice of it.
 */
export interface MainState {
    drawer: DrawerState
    theme: ThemeState
}

export const initialMainState: MainState = {
    drawer: initialDrawerState,
    theme: initialThemeState,
}

/**
 * Root blueprint: mounted once on `documentElement`, it exposes every
 * sub-session as a scoped provider resolvable through `inject()`.
 */
export const mainBlueprint = pipe(
    createContext<MainState>(initialMainState),
    withProvider(DRAWER_SESSION_TOKEN, (session) => createDrawerSession(session)),
    withProvider(THEME_SESSION_TOKEN, (session) => createThemeSession(session)),
    withProvider(BREAKPOINT_OBSERVER_TOKEN, () => getBreakpointObserver()),
)

/**
 * Mount the root session on an element (defaults to `document.documentElement`).
 *
 * `mount()` returns the first session of an element, so all sub-sessions are
 * scoped providers of this root session instead of separate mounts.
 */
export function mountMainSession(element: HTMLElement = document.documentElement) {
    return mount(mainBlueprint)(element)
}

/** Runtime root session exposed as `document.__mainSession`. */
export type MainSession = ReturnType<typeof mountMainSession>
