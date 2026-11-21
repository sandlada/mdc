/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
type ScrollAction = 'show' | 'close'
type ScrollAxis = 'height' | 'width'

interface IScrollPosition {
    readonly offset: number
    readonly max: number
}

const ScrollThreshold = 4

const isWindow = (target: Element | Window): target is Window => (target as Window).window === target

export const getEdgeScrollIntent = (baseline: number) => ({ offset, max }: IScrollPosition): ScrollAction | null => {
    if (offset <= 0 || max <= 0) return 'show'
    const delta = offset - baseline
    if (Math.abs(delta) < ScrollThreshold) return null
    return delta > 0 ? 'close' : 'show'
}

const readScrollPosition = (axis: ScrollAxis) => (target: Element | Window): IScrollPosition => {
    if (!isWindow(target)) {
        return axis === 'height'
            ? { offset: target.scrollTop, max: target.scrollHeight - target.clientHeight }
            : { offset: target.scrollLeft, max: target.scrollWidth - target.clientWidth }
    }
    const root = target.document.documentElement
    return axis === 'height'
        ? { offset: target.scrollY ?? root.scrollTop, max: root.scrollHeight - target.innerHeight }
        : { offset: target.scrollX ?? root.scrollLeft, max: root.scrollWidth - target.innerWidth }
}

export const resolveEdgeScrollTarget = (id: string) => (host: HTMLElement): Element | Window | null => {
    const targetId = id.trim()
    if (!targetId) return host.ownerDocument.defaultView
    const root = host.getRootNode() as Document | ShadowRoot
    return root.getElementById(targetId)
}

export const watchEdgeScroll = (onAction: (action: ScrollAction) => void) =>
    (axis: ScrollAxis) => (target: Element | Window): (() => void) => {
        const read = readScrollPosition(axis)
        let baseline = read(target).offset
        let lastAction: ScrollAction | null = null
        let frame: number | null = null

        const onScroll = () => {
            if (frame !== null) return
            frame = requestAnimationFrame(() => {
                frame = null
                const position = read(target)
                const action = getEdgeScrollIntent(baseline)(position)
                if (!action) return
                baseline = position.offset
                if (lastAction === action) return
                lastAction = action
                onAction(action)
            })
        }
        target.addEventListener('scroll', onScroll, { passive: true })

        return () => {
            target.removeEventListener('scroll', onScroll)
            if (frame !== null) cancelAnimationFrame(frame)
        }
    }
