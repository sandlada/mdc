/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isOutsideComposedPath } from '../overlay-boundary'
import { OverlayDismissReasons } from '../overlay-types'

interface IOverlayDismissal {
    getBoundaries(): ReadonlyArray<EventTarget | null | undefined>
    isActiveLeaf(): boolean
    closeOnScroll(): boolean
    dismiss(reason: OverlayDismissReasons): void
}

export const listenForOverlayDismissal = (options: IOverlayDismissal) => (view: Window): (() => void) => {
    const controller = new AbortController()
    const { signal } = controller
    view.addEventListener('pointerdown', (event) => {
        if (isOutsideComposedPath(event.composedPath(), options.getBoundaries())) {
            options.dismiss(OverlayDismissReasons.OutsideClick)
        }
    }, { capture: true, signal })

    view.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && options.isActiveLeaf()) {
            event.stopImmediatePropagation()
            options.dismiss(OverlayDismissReasons.Escape)
        }
    }, { capture: true, signal })

    if (options.closeOnScroll()) {
        view.addEventListener('scroll', () => {
            if (options.closeOnScroll()) options.dismiss(OverlayDismissReasons.Scroll)
        }, { capture: true, passive: true, signal })
    }

    return () => controller.abort()
}
