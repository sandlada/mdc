/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import type { IPaneAnimationTiming, PaneScaffoldRole } from '../pane-scaffold.interface'

export interface PaneRectangle {
    readonly left: number
    readonly top: number
    readonly width: number
    readonly height: number
}

export interface PaneMotionBounds extends PaneRectangle {
    readonly viewport: DOMRect
}

export const paneRectanglesFromTracks = (width: number, height: number, rtl: boolean) =>
    (tracks: readonly number[], roles: readonly PaneScaffoldRole[]): Map<PaneScaffoldRole, PaneRectangle> => {
        const rectangles = new Map<PaneScaffoldRole, PaneRectangle>()
        let start = 0
        roles.forEach((role, index) => {
            const gap = tracks[2 * index]
            const paneWidth = tracks[2 * index + 1]
            start += gap
            if (paneWidth > 0) rectangles.set(role, {
                left: rtl ? width - start - paneWidth : start, top: 0, width: paneWidth, height,
            })
            start += paneWidth
        })
        return rectangles
    }

export const interpolatePaneBounds = (from: PaneRectangle, to: PaneRectangle, progress: number): string => {
    const x = (to.left - from.left) * progress
    const y = (to.top - from.top) * progress
    const scaleX = 1 + (to.width / from.width - 1) * progress
    const scaleY = 1 + (to.height / from.height - 1) * progress
    return `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`
}

export const capturePaneMotion = (root: ShadowRoot, roles: readonly PaneScaffoldRole[]) => {
    const bounds = new Map<PaneScaffoldRole, PaneMotionBounds>()
    for (const role of roles) {
        const pane = root.getElementById(`pane-${role}`)
        if (!pane || pane.hidden || pane.hasAttribute('data-preview-only') || pane.offsetWidth === 0 || pane.offsetHeight === 0) continue
        bounds.set(role, {
            left: pane.offsetLeft, top: pane.offsetTop, width: pane.offsetWidth, height: pane.offsetHeight,
            viewport: pane.getBoundingClientRect(),
        })
    }
    return bounds
}

export const animatePaneBounds = (previous: PaneMotionBounds, timing?: IPaneAnimationTiming) =>
    (pane: HTMLElement): Animation | undefined => {
        const from = previous.viewport
        const to = pane.getBoundingClientRect()
        if (!to.width || !to.height) return undefined
        const dx = from.left - to.left
        const dy = from.top - to.top
        if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(from.width - to.width), Math.abs(from.height - to.height)) < 0.5) return undefined

        return pane.animate([
            { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})` },
            { transformOrigin: 'top left', transform: 'none' },
        ], { duration: timing?.duration ?? 250, easing: timing?.easing ?? Easing.Emphasized.ToCSSValue() })
    }

export const animatePaneDeparture = (center: boolean) => (pane: HTMLElement): Animation => {
    const duration = getComputedStyle(pane).getPropertyValue('--_pane-motion-duration').trim()
    const translate = pane.style.getPropertyValue('--_pane-presence-translate')
    const start = { translate: '0px', ...(center && { clipPath: 'inset(0)' }) }
    const end = { translate, ...(center && { clipPath: 'inset(0 50%)' }) }
    return pane.animate([start, end], {
        duration: CSSNumericValue.parse(duration).to('ms').value,
        easing: Easing.Emphasized.ToCSSValue(),
        fill: 'forwards',
    })
}
