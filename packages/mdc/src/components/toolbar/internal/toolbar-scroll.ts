/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ToolbarScrollBehavior } from '../toolbar.interface'

export interface IToolbarScrollBinding {
    cleanup(): void
}

/**
 * Attach scroll-driven `exit-always` visibility listener to `scrollTarget`.
 * Returns a cleanup handle, or `null` when `scrollBehavior` is `'pinned'` or no target resolves.
 */
export const attachToolbarScrollTarget = (
    host: HTMLElement,
    scrollBehavior: ToolbarScrollBehavior,
    scrollTarget: HTMLElement | Window | string | null,
    onCollapsedChange: (collapsed: boolean) => void,
): IToolbarScrollBinding | null => {
    if (typeof document === 'undefined' || scrollBehavior !== ToolbarScrollBehavior.ExitAlways) {
        return null
    }

    let target: HTMLElement | Window | null = null
    if (typeof scrollTarget === 'string') {
        if (scrollTarget === 'window') {
            target = typeof window !== 'undefined' ? window : null
        } else if (scrollTarget.length > 0) {
            const root = typeof host.getRootNode === 'function'
                ? (host.getRootNode() as Document | ShadowRoot)
                : null
            target = root?.querySelector?.(scrollTarget) ??
                document.querySelector(scrollTarget)
        }
    } else if (
        (typeof HTMLElement !== 'undefined' && scrollTarget instanceof HTMLElement) ||
        (typeof window !== 'undefined' && scrollTarget === window) ||
        (scrollTarget !== null && typeof scrollTarget === 'object' && 'addEventListener' in scrollTarget)
    ) {
        target = scrollTarget as HTMLElement | Window
    }

    if (!target) return null

    const readScrollTop = (): number => {
        if (typeof window !== 'undefined' && target === window) {
            return window.scrollY || document.documentElement.scrollTop || 0
        }
        if ('scrollTop' in target) {
            return (target as HTMLElement).scrollTop || 0
        }
        return 0
    }

    let lastScrollTop = readScrollTop()
    const handler = (): void => {
        const scrollTop = readScrollTop()
        const delta = scrollTop - lastScrollTop
        if (scrollTop <= 0) {
            onCollapsedChange(false)
        } else if (delta > 4) {
            onCollapsedChange(true)
        } else if (delta < -4) {
            onCollapsedChange(false)
        }
        lastScrollTop = scrollTop
    }

    target.addEventListener('scroll', handler, { passive: true })
    return {
        cleanup: () => {
            target.removeEventListener('scroll', handler)
        },
    }
}
