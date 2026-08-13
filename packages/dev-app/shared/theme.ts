/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { GlobalMDCContextProvider } from '@sandlada/mdc/context-provider'

GlobalMDCContextProvider.attach()
GlobalMDCContextProvider.setConfig({
    focusRing: {},
    ripple: {
        disableHoverStateLayer: false,
        disableFocusStateLayer: false,
    },
    elevation: {
        disabled: false,
    },
})

export {}