/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer } from 'lit'
import type { MDCSnackbarHost } from './snackbar-host'
import type { SnackbarResult, SnackbarShowOptions } from './snackbar-host.interface'

class _SnackbarService {
    private defaultHost: MDCSnackbarHost | null = null

    /**
     * Finds the nearest active `<mdc-snackbar-host>` in document or creates one and appends to `document.body`.
     */
    public getHost(): MDCSnackbarHost | null {
        if (isServer) return null

        const existing = document.querySelector('mdc-snackbar-host')
        if (existing) {
            return existing as MDCSnackbarHost
        }

        if (!this.defaultHost) {
            this.defaultHost = document.createElement('mdc-snackbar-host')
            document.body.appendChild(this.defaultHost)
        }

        return this.defaultHost
    }

    /**
     * Shows a snackbar globally using the default or nearest host.
     */
    public async show(options: SnackbarShowOptions | string): Promise<SnackbarResult> {
        const host = this.getHost()
        if (!host) {
            return 'dismiss'
        }
        return host.show(options)
    }

    /**
     * Dismisses the current snackbar globally.
     */
    public dismissCurrent(reason?: SnackbarResult): void {
        this.getHost()?.dismissCurrent(reason)
    }

    /**
     * Clears all queued snackbars globally.
     */
    public clearQueue(): void {
        this.getHost()?.clearQueue()
    }
}

export const SnackbarService = new _SnackbarService()
