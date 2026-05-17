/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ContextProvider, createContext } from '@lit/context'

export interface GlobalMDCContextRippleConfig {
    disabled               : boolean
    disableHoverStateLayer : boolean
    disableFocusStateLayer : boolean
    disablePressStateLayer : boolean
}

export interface GlobalMDCContextFocusRingConfig {
    disabled: boolean
}

export interface GlobalMDCContextElevationConfig {
    disabled: boolean
}

export interface GlobalMDCContextConfig {
    enableRipple    : boolean
    enableFocusRing : boolean
    enableElevation : boolean
    ripple          : Partial<GlobalMDCContextRippleConfig>
    focusRing       : Partial<GlobalMDCContextFocusRingConfig>
    elevation       : Partial<GlobalMDCContextElevationConfig>
}

export const GlobalMDCContext = createContext<GlobalMDCContextConfig>(
    Symbol.for('mdc-global-context')
)

class _GlobalMDCContextProvider {
    private constructor() {}

    private static _Instance: _GlobalMDCContextProvider | null = null
    public static get Instance() {
        if(!this._Instance) this._Instance = new _GlobalMDCContextProvider()
        return this._Instance
    }

    private provider: ContextProvider<typeof GlobalMDCContext> | null = null
    private currentConfig: GlobalMDCContextConfig = {
        enableRipple: true,
        enableFocusRing: true,
        enableElevation: true,
        ripple: {},
        focusRing: {},
        elevation: {},
    }

    private mergeConfig(config: Partial<GlobalMDCContextConfig>): GlobalMDCContextConfig {
        return {
            ...this.currentConfig,
            ...config,
            ripple: {
                ...this.currentConfig.ripple,
                ...(config.ripple ?? {}),
            },
            focusRing: {
                ...this.currentConfig.focusRing,
                ...(config.focusRing ?? {}),
            },
            elevation: {
                ...this.currentConfig.elevation,
                ...(config.elevation ?? {}),
            },
        }
    }


    attach(initialConfig: Partial<GlobalMDCContextConfig> = {}) {
        if(this.provider) return
        this.currentConfig = this.mergeConfig(initialConfig)
        this.provider = new ContextProvider(document.documentElement, {
            initialValue: this.currentConfig,
            context: GlobalMDCContext,
        })
    }

    setConfig(config: Partial<GlobalMDCContextConfig>) {
        if(!this.provider) throw new Error('GlobalMDCContextProvider is not attached yet. Call attach() first.')
        this.currentConfig = this.mergeConfig(config)
        this.provider.setValue(this.currentConfig)
    }

}

export const GlobalMDCContextProvider = _GlobalMDCContextProvider.Instance
