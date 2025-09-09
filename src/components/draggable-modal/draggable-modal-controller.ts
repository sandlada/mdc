/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

export type TPositioningMode = 'absolute' | 'fixed'

export type TDraggableModalControllerConfig = {
    initialX?: number
    initialY?: number
    positioningMode?: TPositioningMode
    boundaryProtection?: boolean
}

export class DraggableModalController implements ReactiveController {
    public readonly position: {
        x: number
        y: number
    } = { x: 0, y: 0}

    public positioningMode: TPositioningMode
    public boundaryProtection: boolean
    public isDragging: boolean = false

    private host: ReactiveControllerHost & HTMLElement

    private initialX: number = 0
    private initialY: number = 0
    private offsetX: number = 0
    private offsetY: number = 0

    private hostWidth: number = 0
    private hostHeight: number = 0

    private boundDrag: (event: MouseEvent | TouchEvent) => void
    private boundEndDrag: () => void

    public constructor(host: ReactiveControllerHost & HTMLElement, config?: TDraggableModalControllerConfig) {
        this.host = host

        this.position.x = config?.initialX ?? 0
        this.position.y = config?.initialY ?? 0
        this.positioningMode = config?.positioningMode ?? 'fixed'
        this.boundaryProtection = config?.boundaryProtection ?? false

        this.boundDrag = this.drag.bind(this)
        this.boundEndDrag = this.endDrag.bind(this)
    }

    public hostConnected(): void {}

    public startDrag(event: MouseEvent | TouchEvent): void {
        event.preventDefault()

        const { clientX, clientY } = this.getCoordinates(event)

        this.isDragging = true
        this.initialX = clientX
        this.initialY = clientY
        this.offsetX = this.position.x
        this.offsetY = this.position.y

        if (this.boundaryProtection && this.host instanceof HTMLElement) {
            this.hostWidth = this.host.offsetWidth
            this.hostHeight = this.host.offsetHeight
        }

        window.addEventListener('mousemove', this.boundDrag, { passive: false })
        window.addEventListener('touchmove', this.boundDrag, { passive: false })
        window.addEventListener('mouseup', this.boundEndDrag)
        window.addEventListener('touchend', this.boundEndDrag)

        this.host.requestUpdate()
    }

    private drag(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging) return
        event.preventDefault()

        const { clientX, clientY } = this.getCoordinates(event)
        const dx = clientX - this.initialX
        const dy = clientY - this.initialY

        let newX = this.offsetX + dx
        let newY = this.offsetY + dy

        if (this.boundaryProtection) {
            const maxX = window.innerWidth - this.hostWidth
            const maxY = window.innerHeight - this.hostHeight
            newX = Math.max(0, Math.min(newX, maxX))
            newY = Math.max(0, Math.min(newY, maxY))
        }

        this.position.x = newX
        this.position.y = newY
        
        this.host.requestUpdate()
    }

    private endDrag(): void {
        if (!this.isDragging) return

        this.isDragging = false

        window.removeEventListener('mousemove', this.boundDrag)
        window.removeEventListener('touchmove', this.boundDrag)
        window.removeEventListener('mouseup', this.boundEndDrag)
        window.removeEventListener('touchend', this.boundEndDrag)

        this.host.requestUpdate()
    }

    private getCoordinates(event: MouseEvent | TouchEvent): { clientX: number, clientY: number } {
        if (event instanceof TouchEvent) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
            }
        }
        return {
            clientX: event.clientX,
            clientY: event.clientY,
        }
    }
}
