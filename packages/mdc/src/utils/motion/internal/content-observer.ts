/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * A single watch source: a getter function returning a value (or tuple) to
 * compare across updates, or a property name on the host element.
 */
export type WatchSource<THost extends object = object> =
    | (() => unknown)
    | (keyof THost & string)
    | (string & {})

/**
 * Watch configuration accepted by motion controllers: a single {@link WatchSource}
 * or an array of mixed sources.
 */
export type WatchInput<THost extends object = object> =
    | WatchSource<THost>
    | readonly WatchSource<THost>[]

export const evaluateWatch = <THost extends object>(
    host: THost,
    watch: WatchInput<THost>,
): unknown => {
    const evalOne = (source: WatchSource<THost>): unknown =>
        typeof source === 'function'
            ? source()
            : (host as Record<string, unknown>)[source]
    return Array.isArray(watch) ? watch.map(evalOne) : evalOne(watch as WatchSource<THost>)
}

export const hasWatchedValueChanged = (prev: unknown, next: unknown): boolean => {
    if (Array.isArray(prev) && Array.isArray(next)) {
        if (prev.length !== next.length) return true
        for (let i = 0; i < prev.length; i++) {
            if (hasWatchedValueChanged(prev[i], next[i])) return true
        }
        return false
    }
    return !Object.is(prev, next)
}

const readNodeContent = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? ''
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        if (el.localName === 'slot') {
            const slot = el as HTMLSlotElement
            const assigned = slot.assignedNodes({ flatten: true })
            const source = assigned.length > 0 ? assigned : Array.from(slot.childNodes)
            let result = ''
            for (const child of source) {
                result += readNodeContent(child)
            }
            return result
        }
        if (el.localName === 'svg') {
            return el.outerHTML
        }
        let result = ''
        for (const child of el.childNodes) {
            result += readNodeContent(child)
        }
        return result
    }
    return ''
}

export const readTargetContent = (target: HTMLElement): string => readNodeContent(target)
