/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
interface IContentChanges {
    readonly pending: boolean
    unsubscribe(): void
}

interface IHostChanges {
    readonly callbacks: Set<() => void>
    readonly observer: MutationObserver
    frame: number | null
}

const HostChanges = new WeakMap<Element, IHostChanges>()

const observe = (host: Element): IHostChanges => {
    const changes: IHostChanges = {
        callbacks: new Set(),
        observer: new MutationObserver(() => {
            if (changes.frame !== null) return
            changes.frame = requestAnimationFrame(() => {
                changes.frame = null
                changes.callbacks.forEach((callback) => callback())
            })
        }),
        frame: null,
    }
    changes.observer.observe(host, { childList: true, subtree: true, characterData: true })
    HostChanges.set(host, changes)
    return changes
}

export const subscribeToContentChanges = (callback: () => void) => (host: Element): IContentChanges => {
    const changes = HostChanges.get(host) ?? observe(host)
    changes.callbacks.add(callback)

    return {
        get pending(): boolean {
            return changes.frame !== null
        },
        unsubscribe(): void {
            if (!changes.callbacks.delete(callback) || changes.callbacks.size > 0) return
            changes.observer.disconnect()
            if (changes.frame !== null) cancelAnimationFrame(changes.frame)
            changes.frame = null
            HostChanges.delete(host)
        },
    }
}

export type { IContentChanges }
