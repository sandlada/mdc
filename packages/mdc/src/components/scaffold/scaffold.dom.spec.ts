// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './scaffold'
import type { MDCScaffold } from './scaffold'
import type { IMDCScaffoldLayoutChangeDetail } from './scaffold.interface'

describe('mdc-scaffold (DOM)', () => {
    it('mounts without Lit change-in-update warnings', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        try {
            const el = await fixture<MDCScaffold>(html`
                <mdc-scaffold>
                    <div slot="appbar">Bar</div>
                    <div>Body</div>
                    <div slot="fab">Fab</div>
                    <div slot="navigation-bar">Nav</div>
                </mdc-scaffold>
            `)
            await el.updateComplete
            const litChangeWarnings = warnSpy.mock.calls.filter((args) =>
                String(args[0]).includes('scheduled an update'),
            )
            expect(litChangeWarnings).toHaveLength(0)
        } finally {
            warnSpy.mockRestore()
        }
    })

    it('detects slotted appbar, fab, navigation-bar and snackbar-host', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold>
                <div slot="appbar">Bar</div>
                <div>Body</div>
                <div slot="fab">Fab</div>
                <div slot="navigation-bar">Nav</div>
                <div slot="snackbar-host">Snack</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        el.refreshLayout()
        await el.updateComplete
        expect(el.hasAppbar).toBe(true)
        expect(el.hasFab).toBe(true)
        expect(el.hasBottomBar).toBe(true)
        expect(el.hasSnackbarHost).toBe(true)
        expect(el.hasRail).toBe(false)
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('has-appbar')).toBe(true)
        expect(container?.classList.contains('has-fab')).toBe(true)
        expect(container?.classList.contains('has-bottom-bar')).toBe(true)
        expect(container?.classList.contains('fab-end')).toBe(true)
        expect(container?.classList.contains('padding-mode-inset')).toBe(true)
    })

    it('switches navigation-bar and rail adaptively while preserving docked bottom-bar', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold layout-mode="compact">
                <div slot="rail">Rail</div>
                <div slot="navigation-bar">Nav</div>
                <div slot="bottom-bar">Player</div>
                <div>Body</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        el.refreshLayout()
        await el.updateComplete

        expect(el.effectiveNavigationType).toBe('navigation-bar')
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('has-rail')).toBe(false)
        expect(container?.classList.contains('has-navigation-bar')).toBe(true)
        expect(container?.classList.contains('has-bottom-bar')).toBe(true)

        el.layoutMode = 'medium'
        await el.updateComplete
        expect(el.effectiveNavigationType).toBe('navigation-rail')
        expect(container?.classList.contains('has-rail')).toBe(true)
        expect(container?.classList.contains('has-navigation-bar')).toBe(false)
        // Non-navigation docked bottom-bar stays visible alongside rail
        expect(container?.classList.contains('has-bottom-bar')).toBe(true)
    })

    it('allows disabling adaptive switching with adaptive-navigation="off"', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold layout-mode="compact" adaptive-navigation="off">
                <div slot="rail">Rail</div>
                <div slot="navigation-bar">Nav</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('has-rail')).toBe(true)
        expect(container?.classList.contains('has-navigation-bar')).toBe(true)
    })

    it('wires appbar and bottom-bar scrollTarget to body-area in body mode and reclaims on switch/removal', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold>
                <div slot="appbar" id="bar">Bar</div>
                <div slot="bottom-bar" id="bottom">Bottom</div>
                <div>Body</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        const bar = el.querySelector('#bar') as unknown as Record<string, unknown>
        const bottom = el.querySelector('#bottom') as unknown as Record<string, unknown>
        bar['scrollTarget'] = null
        bottom['scrollTarget'] = null
        el.refreshLayout()
        await el.updateComplete
        const body = el.shadowRoot?.querySelector('.body-area')
        expect(bar['scrollTarget']).toBe(body)
        expect(bottom['scrollTarget']).toBe(body)

        el.scrollMode = 'window'
        await el.updateComplete
        expect(bar['scrollTarget']).toBe(window)
        expect(bottom['scrollTarget']).toBe(window)

        el.scrollMode = 'body'
        await el.updateComplete
        expect(bar['scrollTarget']).toBe(body)
        expect(bottom['scrollTarget']).toBe(body)

        // Removing appbar from slot reclaims auto-assigned scrollTarget
        ;(bar as unknown as HTMLElement).remove()
        el.refreshLayout()
        await el.updateComplete
        expect(bar['scrollTarget']).toBe(null)
    })

    it('leaves an explicit user scrollTarget alone', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold>
                <div slot="appbar" id="bar">Bar</div>
                <div>Body</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        const custom = document.createElement('div')
        const bar = el.querySelector('#bar') as unknown as Record<string, unknown>
        bar['scrollTarget'] = custom
        el.refreshLayout()
        await el.updateComplete
        expect(bar['scrollTarget']).toBe(custom)
    })

    it('maps end-overlay fab position to overlay class inside content-overlay', async () => {
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold fab-position="end-overlay">
                <div slot="fab">Fab</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        el.refreshLayout()
        await el.updateComplete
        expect(el.hasFab).toBe(true)
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('fab-end-overlay')).toBe(true)
        expect(container?.classList.contains('fab-overlay')).toBe(true)
        expect(el.shadowRoot?.querySelector('.content-overlay .fab-area')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.content-overlay .snackbar-host-area')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.content-overlay .bottom-sheet-area')).not.toBeNull()
    })

    it('emits scaffold-layout-change and switches content-padding-mode classes', async () => {
        const events: IMDCScaffoldLayoutChangeDetail[] = []
        const el = await fixture<MDCScaffold>(html`
            <mdc-scaffold
                layout-mode="expanded"
                content-padding-mode="manual"
                @scaffold-layout-change=${(e: CustomEvent<IMDCScaffoldLayoutChangeDetail>) => {
                    events.push(e.detail)
                }}
            >
                <div>Body</div>
            </mdc-scaffold>
        `)
        await el.updateComplete
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('padding-mode-manual')).toBe(true)
        expect(events.length).toBeGreaterThan(0)
        expect(events.at(-1)?.layoutMode).toBe('expanded')
        expect(el.style.getPropertyValue('--mdc-scaffold-inner-padding-top')).toBe('0px')
    })

    it('uses non-aside wrappers to avoid unlabeled landmark clutter while keeping main', async () => {
        const el = await fixture<MDCScaffold>(html`<mdc-scaffold></mdc-scaffold>`)
        await el.updateComplete
        expect(el.shadowRoot?.querySelectorAll('aside').length).toBe(0)
        expect(el.shadowRoot?.querySelector('main.body-area')).not.toBeNull()
    })
})
