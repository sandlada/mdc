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

    private dragBounds = {
        minX: -Infinity,
        maxX: Infinity,
        minY: -Infinity,
        maxY: Infinity,
    }

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
            this.calculateBounds()
        } else {
            this.dragBounds = {
                minX: -Infinity,
                maxX: Infinity,
                minY: -Infinity,
                maxY: Infinity,
            }
        }

        window.addEventListener('mousemove', this.boundDrag, { passive: false })
        window.addEventListener('touchmove', this.boundDrag, { passive: false })
        window.addEventListener('mouseup', this.boundEndDrag)
        window.addEventListener('touchend', this.boundEndDrag)

        this.host.requestUpdate()
    }

    private calculateBounds(): void {
        const hostWidth = this.host.offsetWidth
        const hostHeight = this.host.offsetHeight

        // 默认为视口尺寸
        let containerWidth = window.innerWidth
        let containerHeight = window.innerHeight

        // 如果是 absolute 定位，且存在定位父级 (relative/absolute/fixed 的祖先)
        // offsetParent 在 position: fixed 时通常为 null，但在 absolute 时为最近的定位祖先
        if (this.positioningMode === 'absolute' && this.host.offsetParent) {
            const parent = this.host.offsetParent as HTMLElement
            // 使用 clientWidth/Height 以排除边框，确保在内部拖拽
            containerWidth = parent.clientWidth
            containerHeight = parent.clientHeight
        }

        this.dragBounds = {
            minX: 0,
            maxX: Math.max(0, containerWidth - hostWidth), // 防止容器比组件还小导致负数
            minY: 0,
            maxY: Math.max(0, containerHeight - hostHeight)
        }
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
            newX = Math.max(this.dragBounds.minX, Math.min(newX, this.dragBounds.maxX))
            newY = Math.max(this.dragBounds.minY, Math.min(newY, this.dragBounds.maxY))
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
            const touch = event.touches[0] || event.changedTouches[0]
            return {
                clientX: touch.clientX,
                clientY: touch.clientY,
            }
        }
        return {
            clientX: event.clientX,
            clientY: event.clientY,
        }
    }
}
