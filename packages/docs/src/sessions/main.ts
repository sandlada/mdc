/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createContext, mount, pipe, withProvider } from '@sandlada/document-context'
import { BreakpointObserverToken, getBreakpointObserver } from './breakpoint'
import { createDrawerSession, DrawerSessionToken, InitialDrawerState, type DrawerState } from './drawer'
import { createThemeSession, InitialThemeState, ThemeSessionToken, type ThemeState } from './theme'

/**
 * Aggregate state owned by the single root session mounted on
 * `document.documentElement`. Each sub-session projects one slice of it.
 */
export interface MainState {
    drawer: DrawerState
    theme: ThemeState
}

export const InitialMainState: MainState = {
    drawer: InitialDrawerState,
    theme: InitialThemeState,
}

/**
 * Root blueprint: mounted once on `documentElement`, it exposes every
 * sub-session as a scoped provider resolvable through `inject()`.
 */
export const MainBlueprint = pipe(
    createContext<MainState>(InitialMainState),
    withProvider(DrawerSessionToken, (session) => createDrawerSession(session)),
    withProvider(ThemeSessionToken, (session) => createThemeSession(session)),
    withProvider(BreakpointObserverToken, () => getBreakpointObserver()),
)

/**
 * Mount the root session on an element (defaults to `document.documentElement`).
 *
 * `mount()` returns the first session of an element, so all sub-sessions are
 * scoped providers of this root session instead of separate mounts.
 */
export function mountMainSession(element: HTMLElement = document.documentElement) {
    return mount(MainBlueprint)(element)
}

/** Runtime root session exposed as `document.__mainSession`. */
export type MainSession = ReturnType<typeof mountMainSession>
