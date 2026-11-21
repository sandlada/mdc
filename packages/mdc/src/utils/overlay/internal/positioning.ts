/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    arrow as arrowMiddleware,
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
    type Middleware,
    type VirtualElement,
} from '@floating-ui/dom'
import type { IOverlayControllerOptions } from '../overlay-types'
import { getDirectionFromPlacement } from './geometry'

const ViewportShiftPadding = 8
const ArrowEdgePadding = 8
const OppositeSide = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

export class OverlayPositioning {
    private surface: HTMLElement | null = null
    private reference: Element | VirtualElement | null = null
    private cleanupAutoUpdate: (() => void) | null = null
    private revision = 0

    private readonly options: IOverlayControllerOptions

    public constructor(options: IOverlayControllerOptions) {
        this.options = options
    }

    public matches(surface: HTMLElement | null, reference: Element | VirtualElement | null): boolean {
        return this.surface === surface && this.reference === reference
    }

    public stop(): void {
        ++this.revision
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
        this.surface = null
        this.reference = null
    }

    public async update(
        surface: HTMLElement | null,
        reference: Element | VirtualElement | null,
        track: boolean,
    ): Promise<void> {
        if (!surface || !reference) {
            this.stop()
            return
        }
        if (!this.matches(surface, reference)) {
            this.stop()
            this.surface = surface
            this.reference = reference
            if (track) {
                // The immediate update is awaited below. The subscription handles later changes.
                let initial = true
                this.cleanupAutoUpdate = autoUpdate(reference, surface, () => {
                    if (initial) {
                        initial = false
                        return
                    }
                    void this.position(surface, reference)
                })
            }
        }
        await this.position(surface, reference)
    }

    private async position(surface: HTMLElement, reference: Element | VirtualElement): Promise<void> {
        if (!this.matches(surface, reference)) return
        const revision = ++this.revision
        const arrow = this.options.getArrowElement?.()
        const middleware: Middleware[] = [offset(this.options.getOffset())]
        if (!this.options.getDisableFlip?.()) middleware.push(flip())
        middleware.push(shift({ padding: ViewportShiftPadding }))
        if (arrow) middleware.push(arrowMiddleware({ element: arrow, padding: ArrowEdgePadding }))

        const result = await computePosition(reference, surface, {
            strategy: 'fixed',
            placement: this.options.getPlacement(),
            middleware,
        })

        if (
            revision !== this.revision
            || !surface.isConnected
            || surface !== this.options.getSurfaceElement()
            || ('nodeType' in reference && reference !== this.options.getAnchorElement())
        ) return

        const { placement } = result
        surface.style.position = 'fixed'
        surface.style.left = `${Math.round(result.x)}px`
        surface.style.top = `${Math.round(result.y)}px`
        surface.style.right = 'auto'
        surface.style.bottom = 'auto'
        surface.style.transform = 'none'
        surface.style.margin = '0'
        surface.dataset['placement'] = placement

        if (arrow && arrow === this.options.getArrowElement?.() && result.middlewareData.arrow) {
            const { x, y } = result.middlewareData.arrow
            const side = OppositeSide[getDirectionFromPlacement(placement)]
            arrow.style.left = x != null ? `${Math.round(x)}px` : ''
            arrow.style.top = y != null ? `${Math.round(y)}px` : ''
            arrow.style.right = ''
            arrow.style.bottom = ''
            arrow.style[side] = '-5px'
        }
        this.options.onResolvedPlacementChange?.(placement)
    }
}
