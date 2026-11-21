/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ISelectionControllerHost } from '../selection-controller'
import type { FocusDirection } from './roving-focus'

const SelectionFeedbackEvents = new WeakSet<Event>()

export const dispatchSelectionFeedback = (composed: boolean) => (target: HTMLElement): void => {
    const event = new MouseEvent('click', { bubbles: true, composed })
    SelectionFeedbackEvents.add(event)
    try {
        target.dispatchEvent(event)
    } finally {
        SelectionFeedbackEvents.delete(event)
    }
}

const getFocusDirection = (key: string): FocusDirection | undefined => {
    switch (key) {
        case 'ArrowUp':
        case 'ArrowLeft': return 'previous'
        case 'ArrowDown':
        case 'ArrowRight': return 'next'
        case 'Home': return 'first'
        case 'End': return 'last'
    }
}

interface ISelectionInteraction {
    activate(): void
    focus(pointerDown: boolean): void
    navigate(direction: FocusDirection, event: KeyboardEvent): void
}

export const listenForSelection = (actions: ISelectionInteraction) => (host: ISelectionControllerHost): (() => void) => {
    const controller = new AbortController()
    const { signal } = controller
    let pointerDown = false

    host.addEventListener('keydown', (event) => {
        if (host.disabled) return
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            actions.activate()
            dispatchSelectionFeedback(false)(host)
            return
        }

        const direction = getFocusDirection(event.key)
        if (direction) actions.navigate(direction, event)
    }, { signal })

    host.addEventListener('click', (event) => {
        if (host.disabled) {
            event.preventDefault()
        } else if (!SelectionFeedbackEvents.has(event)) {
            actions.activate()
        }
    }, { signal })

    host.addEventListener('focus', () => actions.focus(pointerDown), { signal })
    host.addEventListener('pointerdown', () => { pointerDown = true }, { signal })
    const releasePointer = () => { pointerDown = false }
    host.addEventListener('pointerup', releasePointer, { signal })
    host.addEventListener('pointercancel', releasePointer, { signal })

    return () => controller.abort()
}
