/// <reference types="astro/client" />

import type { BreakpointObserverInstance } from '@sandlada/breakpoint'
import type { DrawerSession, MainSession, ThemeSession } from './sessions'

declare global {

    interface Document {
        /**
         * Root session mounted on `document.documentElement` by the "Init
         * Sessions" script in `src/layouts/Site.astro`. It owns the aggregate
         * state and provides every sub-session.
         *
         * Resolve sub-sessions with `inject()` instead of separate globals:
         *
         * @example
         * ```ts
         * import { inject } from '@sandlada/document-context'
         *
         * const drawer = inject('drawer:session')(document.documentElement)
         * drawer.update((state) => ({ isOpen: !state.isOpen }))
         * ```
         */
        __mainSession: MainSession
    }

}

declare module '@sandlada/document-context' {
    interface ServiceRegistry {
        'breakpoint:observer': BreakpointObserverInstance
        'drawer:session': DrawerSession
        'theme:session': ThemeSession
    }
}
