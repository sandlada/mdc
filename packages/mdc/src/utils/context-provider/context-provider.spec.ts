/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const Load = async () => {
    vi.resetModules()
    return import('./context-provider')
}

const Read = (mod: Awaited<ReturnType<typeof Load>>) => {
    let value: unknown
    const consumer = document.createElement('div')
    document.body.appendChild(consumer)
    const event = new Event('context-request', { bubbles: true, composed: true })
    Object.assign(event, {
        context: mod.GlobalMDCContext,
        contextTarget: consumer,
        callback: (v: unknown) => (value = v),
        subscribe: false,
    })
    consumer.dispatchEvent(event)
    return value as Record<string, Record<string, boolean>> | undefined
}

describe('GlobalMDCContextProvider', () => {
    beforeEach(() => vi.resetModules())

    it('uses a well-known global symbol for the context key', async () => {
        const mod = await Load()
        expect(mod.GlobalMDCContext).toBe(Symbol.for('mdc-global-context'))
    })

    it('setConfig before attach throws', async () => {
        const { GlobalMDCContextProvider } = await Load()
        expect(() => GlobalMDCContextProvider.setConfig({})).toThrow('not attached')
    })

    it('attach provides defaults with empty sections', async () => {
        const mod = await Load()
        mod.GlobalMDCContextProvider.attach()
        expect(Read(mod)).toEqual({ ripple: {}, focusRing: {}, elevation: {} })
    })

    it('attach applies initial config', async () => {
        const mod = await Load()
        mod.GlobalMDCContextProvider.attach({ ripple: { disabled: true } })
        expect(Read(mod)!.ripple).toEqual({ disabled: true })
    })

    it('second attach is ignored', async () => {
        const mod = await Load()
        mod.GlobalMDCContextProvider.attach({ ripple: { disabled: true } })
        mod.GlobalMDCContextProvider.attach({ ripple: { disabled: false } })
        expect(Read(mod)!.ripple.disabled).toBe(true)
    })

    it('setConfig merges per-section and keeps other keys', async () => {
        const mod = await Load()
        const p = mod.GlobalMDCContextProvider
        p.attach({ ripple: { disabled: true, disablePressStateLayer: true } })
        p.setConfig({ ripple: { disabled: false }, focusRing: { disabled: true } })
        expect(Read(mod)).toEqual({
            ripple: { disabled: false, disablePressStateLayer: true },
            focusRing: { disabled: true },
            elevation: {},
        })
    })

    it('successive setConfig calls accumulate', async () => {
        const mod = await Load()
        const p = mod.GlobalMDCContextProvider
        p.attach()
        p.setConfig({ elevation: { disabled: true } })
        p.setConfig({ ripple: { disabled: true } })
        const v = Read(mod)!
        expect(v.elevation.disabled).toBe(true)
        expect(v.ripple.disabled).toBe(true)
    })
})
