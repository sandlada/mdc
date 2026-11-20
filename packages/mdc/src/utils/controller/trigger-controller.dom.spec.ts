// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { LitElement } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TriggerController, TriggerKinds } from './trigger-controller'

class TestTriggerHost extends LitElement {}
if (!customElements.get('test-trigger-host')) {
    customElements.define('test-trigger-host', TestTriggerHost)
}

describe('TriggerController', () => {
    const mounted: HTMLElement[] = []

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.remove()
        }
    })

    const mountHost = (
        kinds: TriggerKinds[],
        overrides: Partial<ConstructorParameters<typeof TriggerController>[1]> = {},
    ) => {
        const host = document.createElement('test-trigger-host') as TestTriggerHost
        const onOpen = vi.fn()
        const onToggle = vi.fn()
        const onClose = vi.fn()
        const onPressingChange = vi.fn()
        const controller = new TriggerController(host, {
            getKinds: () => kinds,
            getShowDelay: () => 0,
            getHideDelay: () => 0,
            getLongPressDelay: () => 30,
            onOpen,
            onToggle,
            onClose,
            onPressingChange,
            ...overrides,
        })
        controller.setTarget(host)
        document.body.appendChild(host)
        mounted.push(host)
        return { host, controller, onOpen, onToggle, onClose, onPressingChange }
    }

    it('handles click, hover, and focus trigger kinds', () => {
        const { host, onToggle, onOpen, onClose } = mountHost([
            TriggerKinds.Click,
            TriggerKinds.Hover,
            TriggerKinds.Focus,
        ])

        host.click()
        expect(onToggle).toHaveBeenCalledTimes(1)

        host.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        expect(onOpen).toHaveBeenCalledTimes(1)

        host.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
        expect(onClose).toHaveBeenCalledTimes(1)

        host.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
        expect(onOpen).toHaveBeenCalledTimes(2)
    })

    it('handles contextmenu, Android touch long-press, and Shift+F10 keyboard trigger', async () => {
        const { host, onOpen, onPressingChange } = mountHost([
            TriggerKinds.ContextMenu,
            TriggerKinds.LongPress,
            TriggerKinds.Keyboard,
        ])

        host.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 111,
            clientY: 222,
        }))
        expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({
            kind: TriggerKinds.ContextMenu,
            x: 111,
            y: 222,
        }))

        host.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 7,
            pointerType: 'touch',
            clientX: 30,
            clientY: 40,
        }))
        expect(onPressingChange).toHaveBeenCalledWith(true)
        await new Promise((r) => setTimeout(r, 50))
        expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({
            kind: TriggerKinds.LongPress,
            x: 30,
            y: 40,
        }))

        host.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'F10',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        }))
        expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({
            kind: TriggerKinds.Keyboard,
        }))
    })
})
