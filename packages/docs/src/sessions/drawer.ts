/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { ISession } from '@sandlada/document-context'
import { createSubSession, type ISubSession } from './sub-session'

/** Token used to `inject()` the drawer sub-session. */
export const DRAWER_SESSION_TOKEN = 'drawer:session'

/** Reactive state slice owned by the drawer sub-session. */
export interface DrawerState {
    isOpen: boolean
    isModal: boolean
    iSQuick: boolean
}

export const initialDrawerState: DrawerState = { isOpen: true, isModal: false, iSQuick: true }

/** Runtime drawer sub-session exposed as the `drawer:session` service. */
export type DrawerSession = ISubSession<DrawerState>

/** Bind the drawer sub-session to the root session's `drawer` slice. */
export function createDrawerSession(session: ISession<any, any>): DrawerSession {
    return createSubSession<{ drawer: DrawerState }, DrawerState>(session, {
        read: (state) => state.drawer,
        write: (state, next) => ({ drawer: { ...state.drawer, ...next } }),
    })
}
