/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCSnackbar } from './snackbar'
import { MDCSnackbarHost } from './snackbar-host'
import { SnackbarService } from './snackbar-service'

describe('MDCSnackbar', () => {
    it('instantiates with defaults', () => {
        const snackbar = new MDCSnackbar()
        expect(snackbar.open).toBe(false)
        expect(snackbar.duration).toBe('short')
        expect(snackbar.animationMode).toBe('slide')
        expect(snackbar.multiline).toBe(false)
        expect(snackbar.actionOnNewLine).toBe(false)
        expect(snackbar.swipeToDismiss).toBe(true)
        expect(snackbar.variant).toBe('inverse-surface')
        expect(snackbar.hasAction).toBe(false)
        expect(snackbar.hasCloseIcon).toBe(false)
        expect(snackbar.hasIcon).toBe(false)
    })

    it('allows updating properties', () => {
        const snackbar = new MDCSnackbar()
        snackbar.open = true
        snackbar.duration = 'long'
        snackbar.animationMode = 'fade'
        snackbar.multiline = true
        snackbar.actionOnNewLine = true
        snackbar.swipeToDismiss = false
        snackbar.hasCloseIcon = true
        snackbar.variant = 'error'
        expect(snackbar.open).toBe(true)
        expect(snackbar.duration).toBe('long')
        expect(snackbar.animationMode).toBe('fade')
        expect(snackbar.multiline).toBe(true)
        expect(snackbar.actionOnNewLine).toBe(true)
        expect(snackbar.swipeToDismiss).toBe(false)
        expect(snackbar.hasCloseIcon).toBe(true)
        expect(snackbar.variant).toBe('error')
    })
})

describe('MDCSnackbarHost', () => {
    it('instantiates with defaults', () => {
        const host = new MDCSnackbarHost()
        expect(host.placement).toBe('bottom-center')
        expect(host.scoped).toBe(false)
        expect(host.maxVisible).toBe(1)
    })

    it('allows updating properties', () => {
        const host = new MDCSnackbarHost()
        host.placement = 'top-center'
        host.scoped = true
        host.maxVisible = 3
        expect(host.placement).toBe('top-center')
        expect(host.scoped).toBe(true)
        expect(host.maxVisible).toBe(3)
    })
})

describe('SnackbarService', () => {
    it('is available as a singleton', () => {
        expect(SnackbarService).toBeDefined()
        expect(typeof SnackbarService.show).toBe('function')
        expect(typeof SnackbarService.dismissCurrent).toBe('function')
        expect(typeof SnackbarService.clearQueue).toBe('function')
        expect(typeof SnackbarService.getHost).toBe('function')
    })
})
