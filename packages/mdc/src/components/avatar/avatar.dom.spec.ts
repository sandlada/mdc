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
import type { MDCAvatar } from './avatar'
import type { MDCAvatarGroup } from './avatar-group'

describe('mdc-avatar (DOM)', () => {
    it('renders default properties and fallback icon when empty', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar></mdc-avatar>`)
        expect(el.size).toBe('medium')
        expect(el.shape).toBe('round')
        expect(el.variant).toBe('tonal')
        const container = el.shadowRoot?.querySelector('#container')
        expect(container?.tagName).toBe('DIV')
        expect(container?.getAttribute('role')).toBe('img')
        expect(el.shadowRoot?.querySelector('mdc-icon')?.getAttribute('name')).toBe('person')
    })

    it('renders initials extracted from name or explicit initials', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar name="Kai Orion"></mdc-avatar>`)
        expect(el.resolvedInitials).toBe('KO')
        expect(el.shadowRoot?.querySelector('.initials')?.textContent).toBe('KO')

        el.initials = 'VIP'
        await el.updateComplete
        expect(el.resolvedInitials).toBe('VIP')
        expect(el.shadowRoot?.querySelector('.initials')?.textContent).toBe('VIP')
    })

    it('applies deterministic auto-color palette class when auto-color is enabled', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar name="Alice" auto-color></mdc-avatar>`)
        expect(el.paletteIndex).not.toBeNull()
        const container = el.shadowRoot?.querySelector('#container')
        expect(container?.classList.contains(`palette-${el.paletteIndex}`)).toBe(true)
    })

    it('falls back to initials/icon and emits avatar-error when image fails', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar src="https://example.invalid/404.png" name="Kai Orion"></mdc-avatar>`)
        const img = el.shadowRoot?.querySelector('img')
        expect(img).not.toBeNull()

        const errorPromise = oneEvent(el, 'avatar-error')
        img?.dispatchEvent(new Event('error'))
        await errorPromise
        await el.updateComplete

        expect(el.shadowRoot?.querySelector('img')).toBeNull()
        expect(el.shadowRoot?.querySelector('.initials')?.textContent).toBe('KO')
    })

    it('renders interactive button and emits avatar-click when clickable', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar clickable name="Kai"></mdc-avatar>`)
        const button = el.shadowRoot?.querySelector('button#container')
        expect(button).not.toBeNull()

        const onClick = vi.fn()
        el.addEventListener('avatar-click', onClick)
        button?.click()
        expect(onClick).toHaveBeenCalledTimes(1)

        el.disabled = true
        await el.updateComplete
        button?.click()
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders anchor root when href is provided', async () => {
        const el = await fixture<MDCAvatar>(html`<mdc-avatar href="https://example.com" target="_blank" name="Kai"></mdc-avatar>`)
        const anchor = el.shadowRoot?.querySelector('a#container')
        expect(anchor).not.toBeNull()
        expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
    })
})

describe('mdc-avatar-group (DOM)', () => {
    it('propagates size and shape and collapses overflow beyond max', async () => {
        const group = await fixture<MDCAvatarGroup>(html`
            <mdc-avatar-group size="small" shape="square" max="2">
                <mdc-avatar name="Alice"></mdc-avatar>
                <mdc-avatar name="Bob"></mdc-avatar>
                <mdc-avatar name="Charlie"></mdc-avatar>
                <mdc-avatar name="Dana"></mdc-avatar>
            </mdc-avatar-group>
        `)

        const all = group.getAvatars()
        expect(all).toHaveLength(4)
        expect(group.getVisibleAvatars()).toHaveLength(2)
        expect(group.getOverflowAvatars()).toHaveLength(2)

        expect(all[0].size).toBe('small')
        expect(all[0].shape).toBe('square')
        expect(all[0].hasAttribute('data-group-first')).toBe(true)
        expect(all[1].hasAttribute('data-group-last')).toBe(true)
        expect(all[2].hasAttribute('data-group-hidden')).toBe(true)
        expect(all[3].hasAttribute('data-group-hidden')).toBe(true)

        const overflowEl = group.shadowRoot?.querySelector('.overflow-indicator')
        expect(overflowEl?.textContent?.trim()).toBe('+2')
    })

    it('dispatches avatar-group-overflow-click when overflow-clickable is enabled', async () => {
        const group = await fixture<MDCAvatarGroup>(html`
            <mdc-avatar-group max="1" overflow-clickable>
                <mdc-avatar name="Alice"></mdc-avatar>
                <mdc-avatar name="Bob"></mdc-avatar>
                <mdc-avatar name="Charlie"></mdc-avatar>
            </mdc-avatar-group>
        `)

        const btn = group.shadowRoot?.querySelector('button.overflow-indicator') as HTMLButtonElement | null
        expect(btn).not.toBeNull()

        const eventPromise = oneEvent<CustomEvent>(group, 'avatar-group-overflow-click')
        btn?.click()
        const evt = await eventPromise
        expect(evt.detail.overflowCount).toBe(2)
        expect(evt.detail.hiddenAvatars).toHaveLength(2)
    })
})
