// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { fixture, oneEvent } from '../../utils/testing/fixture'
import './index'
import type { MDCSkeleton } from './skeleton'
import type { MDCSkeletonGroup } from './skeleton-group'

describe('mdc-skeleton (DOM)', () => {
    it('renders standalone text shimmer placeholder by default', async () => {
        const el = await fixture<MDCSkeleton>(html`<mdc-skeleton></mdc-skeleton>`)
        expect(el.variant).toBe('text')
        expect(el.animation).toBe('shimmer')
        expect(el.size).toBe('medium')
        expect(el.lines).toBe(1)
        expect(el.hasSlottedContent).toBe(false)
        expect(el.isLoading).toBe(true)

        const root = el.shadowRoot?.querySelector('#root')
        expect(root?.classList.contains('variant-text')).toBe(true)
        expect(root?.classList.contains('animation-shimmer')).toBe(true)
        expect(root?.classList.contains('size-medium')).toBe(true)
        expect(root?.classList.contains('loading')).toBe(true)
        expect(el.shadowRoot?.querySelectorAll('.line')).toHaveLength(1)
    })

    it('renders multiple text lines and applies last-line-width to the final line', async () => {
        const el = await fixture<MDCSkeleton>(
            html`<mdc-skeleton variant="text" lines="3" last-line-width="40%"></mdc-skeleton>`
        )
        const lines = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('.line') ?? [])
        expect(lines).toHaveLength(3)
        expect(lines[0].style.width).toBe('')
        expect(lines[1].style.width).toBe('')
        expect(lines[2].style.width).toBe('40%')
    })

    it('applies default line-last class when last-line-width is omitted on multi-line text', async () => {
        const el = await fixture<MDCSkeleton>(
            html`<mdc-skeleton variant="text" lines="2"></mdc-skeleton>`
        )
        const lines = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('.line') ?? [])
        expect(lines).toHaveLength(2)
        expect(lines[0].classList.contains('line-last')).toBe(false)
        expect(lines[1].classList.contains('line-last')).toBe(true)
    })

    it('renders non-text variants with custom dimensions and aspect-ratio', async () => {
        const el = await fixture<MDCSkeleton>(
            html`<mdc-skeleton variant="rounded" width="320px" height="180px" aspect-ratio="16 / 9" animation="pulse" size="large"></mdc-skeleton>`
        )
        const root = el.shadowRoot?.querySelector('#root')
        expect(root?.classList.contains('variant-rounded')).toBe(true)
        expect(root?.classList.contains('animation-pulse')).toBe(true)
        expect(root?.classList.contains('size-large')).toBe(true)

        const shape = el.shadowRoot?.querySelector<HTMLElement>('.shape')
        expect(shape?.style.width).toBe('320px')
        expect(shape?.style.height).toBe('180px')
        expect(shape?.style.aspectRatio).toBe('16 / 9')
    })

    it('supports zero-CLS wrapper mode with inert content while loading and dispatches skeleton-loaded on reveal', async () => {
        const el = await fixture<MDCSkeleton>(html`
            <mdc-skeleton loading variant="rounded">
                <div class="real-card">Hello</div>
            </mdc-skeleton>
        `)
        expect(el.hasSlottedContent).toBe(true)
        expect(el.isLoading).toBe(true)

        const content = el.shadowRoot?.querySelector<HTMLElement>('.content')
        const overlay = el.shadowRoot?.querySelector<HTMLElement>('.overlay')
        expect(content?.hasAttribute('inert')).toBe(true)
        expect(content?.getAttribute('aria-hidden')).toBe('true')
        expect(overlay?.hidden).toBe(false)

        const loadedPromise = oneEvent(el, 'skeleton-loaded')
        el.loading = false
        await loadedPromise
        await el.updateComplete

        expect(el.isLoading).toBe(false)
        expect(content?.hasAttribute('inert')).toBe(false)
        expect(content?.hasAttribute('aria-hidden')).toBe(false)
        expect(overlay?.hidden).toBe(true)
    })

    it('renders wrapped content immediately when loading is not set', async () => {
        const el = await fixture<MDCSkeleton>(html`
            <mdc-skeleton variant="rounded">
                <p>Already loaded</p>
            </mdc-skeleton>
        `)
        expect(el.hasSlottedContent).toBe(true)
        expect(el.isLoading).toBe(false)
        expect(el.shadowRoot?.querySelector<HTMLElement>('.overlay')?.hidden).toBe(true)
        expect(el.shadowRoot?.querySelector<HTMLElement>('.content')?.hasAttribute('inert')).toBe(false)
    })

    it('sets role="status" and aria-busy when label is provided, and decorative aria-hidden otherwise', async () => {
        const decorative = await fixture<MDCSkeleton>(html`<mdc-skeleton></mdc-skeleton>`)
        const decRoot = decorative.shadowRoot?.querySelector('#root')
        expect(decRoot?.hasAttribute('role')).toBe(false)
        expect(decorative.shadowRoot?.querySelector('.lines')?.getAttribute('aria-hidden')).toBe('true')

        const announced = await fixture<MDCSkeleton>(html`<mdc-skeleton label="Loading article"></mdc-skeleton>`)
        const annRoot = announced.shadowRoot?.querySelector('#root')
        expect(annRoot?.getAttribute('role')).toBe('status')
        expect(annRoot?.getAttribute('aria-busy')).toBe('true')
        expect(annRoot?.getAttribute('aria-label')).toBe('Loading article')
    })
})

describe('mdc-skeleton-group (DOM)', () => {
    it('propagates loading, animation, and size to descendants while respecting local overrides', async () => {
        const group = await fixture<MDCSkeletonGroup>(html`
            <mdc-skeleton-group loading animation="pulse" size="large" label="Loading profile">
                <mdc-skeleton class="inherited" variant="circular"></mdc-skeleton>
                <mdc-skeleton class="overridden" variant="text" animation="none" size="small"></mdc-skeleton>
                <mdc-skeleton class="wrapped" variant="rounded"><span>Loaded!</span></mdc-skeleton>
            </mdc-skeleton-group>
        `)

        const groupRoot = group.shadowRoot?.querySelector('.group')
        expect(groupRoot?.getAttribute('role')).toBe('status')
        expect(groupRoot?.getAttribute('aria-busy')).toBe('true')
        expect(groupRoot?.getAttribute('aria-label')).toBe('Loading profile')

        const inherited = group.querySelector<MDCSkeleton>('.inherited')!
        const overridden = group.querySelector<MDCSkeleton>('.overridden')!
        const wrapped = group.querySelector<MDCSkeleton>('.wrapped')!

        await Promise.all([inherited.updateComplete, overridden.updateComplete, wrapped.updateComplete])

        expect(inherited.isLoading).toBe(true)
        expect(inherited.shadowRoot?.querySelector('#root')?.classList.contains('animation-pulse')).toBe(true)
        expect(inherited.shadowRoot?.querySelector('#root')?.classList.contains('size-large')).toBe(true)

        expect(overridden.shadowRoot?.querySelector('#root')?.classList.contains('animation-none')).toBe(true)
        expect(overridden.shadowRoot?.querySelector('#root')?.classList.contains('size-small')).toBe(true)

        expect(wrapped.isLoading).toBe(true)
        expect(wrapped.shadowRoot?.querySelector<HTMLElement>('.overlay')?.hidden).toBe(false)

        const onGroupLoaded = vi.fn()
        group.addEventListener('skeleton-group-loaded', onGroupLoaded)
        group.loading = false
        await group.updateComplete
        await Promise.all([inherited.updateComplete, overridden.updateComplete, wrapped.updateComplete])

        expect(onGroupLoaded).toHaveBeenCalledTimes(1)
        expect(groupRoot?.hasAttribute('role')).toBe(false)
        expect(groupRoot?.hasAttribute('aria-busy')).toBe(false)
        expect(wrapped.isLoading).toBe(false)
        expect(wrapped.shadowRoot?.querySelector<HTMLElement>('.overlay')?.hidden).toBe(true)
        expect(inherited.isLoading).toBe(false)
        expect(inherited.classList.contains('standalone-idle')).toBe(true)
    })
})
