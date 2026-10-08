/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { ISession } from '@sandlada/document-context'
import { createSubSession, type ISubSession } from './sub-session'

/** Token used to `inject()` the theme sub-session. */
export const THEME_SESSION_TOKEN = 'theme:session'

/** localStorage key reserved for the persisted theme preference. */
export const THEME_STORAGE_KEY = 'theme'

/** Reactive state slice owned by the theme sub-session. */
export interface ThemeState {
    isDark: boolean
}

export const initialThemeState: ThemeState = { isDark: false }

/** Runtime theme sub-session exposed as the `theme:session` service. */
export type ThemeSession = ISubSession<ThemeState>

/** Bind the theme sub-session to the root session's `theme` slice. */
export function createThemeSession(session: ISession<any, any>): ThemeSession {
    return createSubSession<{ theme: ThemeState }, ThemeState>(session, {
        read: (state) => state.theme,
        write: (state, next) => ({ theme: { ...state.theme, ...next } }),
    })
}
