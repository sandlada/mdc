// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it } from 'vitest'
import './pull-to-refresh'
import type { MDCPullToRefresh } from './pull-to-refresh'

describe('mdc-pull-to-refresh (DOM)', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders expressive loading indicator by default and circular when configured', async () => {
        document.body.innerHTML = `
            <mdc-pull-to-refresh></mdc-pull-to-refresh>
            <mdc-pull-to-refresh indicator="circular"></mdc-pull-to-refresh>
        `
        const [expressive, circular] = Array.from(
            document.querySelectorAll('mdc-pull-to-refresh')
        ) as MDCPullToRefresh[]
        await expressive.updateComplete
        await circular.updateComplete

        expect(expressive.shadowRoot?.querySelector('mdc-loading-indicator')).not.toBeNull()
        expect(circular.shadowRoot?.querySelector('mdc-progress-indicator')).not.toBeNull()
    })

    it('triggers refresh on downward pointer drag past threshold and completes cleanly', async () => {
        document.body.innerHTML = `
            <mdc-pull-to-refresh threshold="60" drag-multiplier="0.5">
                <div>Content</div>
            </mdc-pull-to-refresh>
        `
        const el = document.querySelector('mdc-pull-to-refresh') as MDCPullToRefresh
        await el.updateComplete

        const content = el.shadowRoot?.querySelector('.content') as HTMLElement
        const states: string[] = []
        let refreshCount = 0

        el.addEventListener('pull-state-change', (e: Event) => {
            states.push((e as CustomEvent).detail.state)
        })
        el.addEventListener('refresh', () => {
            refreshCount++
        })

        content.dispatchEvent(new PointerEvent('pointerdown', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 100,
            clientY: 0,
            bubbles: true,
        }))
        content.dispatchEvent(new PointerEvent('pointermove', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 100,
            clientY: 60,
            bubbles: true,
        }))
        expect(el.pullState).toBe('pulling')
        expect(el.progress).toBe(0.5)

        content.dispatchEvent(new PointerEvent('pointermove', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 100,
            clientY: 140,
            bubbles: true,
        }))
        expect(el.pullState).toBe('ready')
        expect(el.progress).toBe(1)

        content.dispatchEvent(new PointerEvent('pointerup', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 100,
            clientY: 140,
            bubbles: true,
        }))
        await el.updateComplete

        expect(el.refreshing).toBe(true)
        expect(el.pullState).toBe('refreshing')
        expect(refreshCount).toBe(1)
        expect(states).toEqual(['pulling', 'ready', 'refreshing'])

        el.complete()
        await el.updateComplete
        expect(el.refreshing).toBe(false)
        expect(el.pullState).toBe('idle')
        expect(el.pullDistance).toBe(0)
    })

    it('does not trigger refresh when released before threshold', async () => {
        document.body.innerHTML = `<mdc-pull-to-refresh threshold="80"></mdc-pull-to-refresh>`
        const el = document.querySelector('mdc-pull-to-refresh') as MDCPullToRefresh
        await el.updateComplete

        const content = el.shadowRoot?.querySelector('.content') as HTMLElement
        let refreshed = false
        el.addEventListener('refresh', () => {
            refreshed = true
        })

        content.dispatchEvent(new PointerEvent('pointerdown', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 50,
            clientY: 0,
        }))
        content.dispatchEvent(new PointerEvent('pointermove', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 50,
            clientY: 60,
        }))
        content.dispatchEvent(new PointerEvent('pointerup', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 50,
            clientY: 60,
        }))
        await el.updateComplete

        expect(refreshed).toBe(false)
        expect(el.refreshing).toBe(false)
        expect(el.pullState).toBe('idle')
    })

    it('ignores horizontal swipe gestures', async () => {
        document.body.innerHTML = `<mdc-pull-to-refresh></mdc-pull-to-refresh>`
        const el = document.querySelector('mdc-pull-to-refresh') as MDCPullToRefresh
        await el.updateComplete

        const content = el.shadowRoot?.querySelector('.content') as HTMLElement
        content.dispatchEvent(new PointerEvent('pointerdown', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 0,
            clientY: 0,
        }))
        content.dispatchEvent(new PointerEvent('pointermove', {
            pointerId: 1,
            pointerType: 'touch',
            clientX: 40,
            clientY: 5,
        }))

        expect(el.pullState).toBe('idle')
        expect(el.pullDistance).toBe(0)
    })

    it('supports programmatic triggerRefresh() and push mode transform', async () => {
        document.body.innerHTML = `<mdc-pull-to-refresh mode="push" threshold="100"></mdc-pull-to-refresh>`
        const el = document.querySelector('mdc-pull-to-refresh') as MDCPullToRefresh
        await el.updateComplete

        let refreshed = false
        el.addEventListener('refresh', () => {
            refreshed = true
        })

        el.triggerRefresh()
        await el.updateComplete

        expect(refreshed).toBe(true)
        expect(el.refreshing).toBe(true)
        const content = el.shadowRoot?.querySelector('.content') as HTMLElement
        expect(content.style.transform).toContain('translate3d(0, 70px, 0)')
    })
})
