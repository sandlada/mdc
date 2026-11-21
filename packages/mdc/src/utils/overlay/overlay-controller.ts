/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { VirtualElement } from '@floating-ui/dom'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { findNearestAncestorOverlayId, OverlayIdAttribute } from './overlay-boundary'
import { createVirtualPointElement, listenForOverlayDismissal, OverlayMotion, OverlayPositioning } from './internal'
import { getOverlayTree, type OverlayTreeManager } from './overlay-tree'
import { OverlayDismissReasons, type IOverlayControllerOptions } from './overlay-types'

type OverlayPhase = 'closed' | 'opening' | 'open' | 'closing'

interface IPendingOpen {
    readonly reference: VirtualElement | null
    readonly completion: PromiseWithResolvers<void>
}

let NextOverlayUid = 0

const getFocusedElementDeep = (document: Document): HTMLElement | null => {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active && 'focus' in active ? active as HTMLElement : null
}

export class OverlayController implements ReactiveController {
    public readonly overlayId: string

    private readonly positioning: OverlayPositioning
    private readonly motion = new OverlayMotion()
    private tree: OverlayTreeManager | null = null
    private phase: OverlayPhase = 'closed'
    private pendingOpen: IPendingOpen | null = null
    private isOpen = false
    private lifecycle = 0
    private virtualReference: VirtualElement | null = null
    private stopDismissal: (() => void) | null = null
    private returnFocusTarget: HTMLElement | null = null

    private readonly host: ReactiveControllerHost & HTMLElement
    private readonly options: IOverlayControllerOptions

    public constructor(
        host: ReactiveControllerHost & HTMLElement,
        options: IOverlayControllerOptions,
    ) {
        this.host = host
        this.options = options
        this.overlayId = options.id ?? `mdc-overlay-${++NextOverlayUid}`
        this.positioning = new OverlayPositioning(options)
        host.addController(this)
    }

    public get opened(): boolean {
        return this.isOpen
    }

    public hostConnected(): void {
        const document = this.host.ownerDocument
        if (!document) return
        const tree = this.options.tree ?? getOverlayTree(document)
        this.host.setAttribute(OverlayIdAttribute, this.overlayId)
        tree.register(this.overlayId, {
            parentId: this.resolveParentOverlayId(),
            group: this.options.exclusiveGroup ?? null,
            getSurface: () => this.options.getSurfaceElement(),
            onClose: (reason) => this.closeFromTree(reason as OverlayDismissReasons),
        })
        this.tree = tree
        const pending = this.pendingOpen
        this.pendingOpen = null
        if (pending) void this.open(pending.reference).then(pending.completion.resolve, pending.completion.reject)
    }

    public hostDisconnected(): void {
        this.begin('closed')
        this.tree?.unregister(this.overlayId)
        this.tree = null
        this.isOpen = false
        this.virtualReference = null
        this.returnFocusTarget = null
    }

    public hostUpdated(): void {
        if (
            this.phase === 'open'
            && !this.positioning.matches(this.options.getSurfaceElement() ?? null, this.resolveReference())
        ) {
            void this.updatePosition()
        }
    }

    public async show(): Promise<void> {
        await this.open(null)
    }

    public async showAt(x: number, y: number): Promise<void> {
        await this.open(createVirtualPointElement(x, y))
    }

    public async hide(reason: OverlayDismissReasons = OverlayDismissReasons.Programmatic): Promise<void> {
        const tree = this.tree
        this.pendingOpen?.completion.resolve()
        this.pendingOpen = null
        if (!tree || this.phase === 'closed' || this.phase === 'closing') return
        if (this.options.onBeforeHide?.(reason) === false) return

        const token = this.begin('closing')
        await tree.markClosed(this.overlayId, reason)
        if (token !== this.lifecycle) return

        if (this.isOpen) await this.animate('close')
        if (token !== this.lifecycle) return

        await this.finishClose(token, reason, true)
    }

    public async toggle(): Promise<void> {
        if (this.phase === 'open' || this.phase === 'opening') {
            await this.hide(OverlayDismissReasons.AnchorClick)
        } else {
            await this.show()
        }
    }

    public async updatePosition(): Promise<void> {
        if (!this.isOpen || this.phase === 'closing' || this.phase === 'closed') return
        const surface = this.options.getSurfaceElement() ?? null
        surface?.setAttribute(OverlayIdAttribute, this.overlayId)
        await this.positioning.update(surface, this.resolveReference(), this.virtualReference === null)
    }

    private resolveReference(): HTMLElement | VirtualElement | null {
        return this.virtualReference ?? this.options.getAnchorElement() ?? null
    }

    private resolveParentOverlayId(): string | null {
        const explicit = this.options.getParentOverlayId?.()
        return explicit === undefined ? findNearestAncestorOverlayId(this.host, this.overlayId) : explicit
    }

    private begin(phase: OverlayPhase): number {
        this.phase = phase
        const token = ++this.lifecycle
        this.stopDismissal?.()
        this.stopDismissal = null
        this.positioning.stop()
        this.motion.stop()
        return token
    }

    private async closeFromTree(reason: OverlayDismissReasons): Promise<void> {
        if (this.phase === 'closed') return
        await this.finishClose(this.begin('closing'), reason, false)
    }

    private async finishClose(token: number, reason: OverlayDismissReasons, restoreFocus: boolean): Promise<void> {
        this.phase = 'closed'
        this.virtualReference = null
        const target = this.returnFocusTarget
        this.returnFocusTarget = null
        if (this.isOpen) {
            this.isOpen = false
            this.options.onOpenChange(false)
            await this.host.updateComplete
        }
        if (token !== this.lifecycle) return

        if (
            restoreFocus
            && this.options.shouldRestoreFocus?.() !== false
            && (reason === OverlayDismissReasons.Escape || reason === OverlayDismissReasons.Programmatic)
            && target?.isConnected
            && target.ownerDocument === this.host.ownerDocument
        ) target.focus()

        if (token === this.lifecycle) this.options.onHidden?.(reason)
    }

    private async open(reference: VirtualElement | null): Promise<void> {
        const tree = this.tree
        if (!tree) {
            if (!this.host.ownerDocument) return
            this.pendingOpen?.completion.resolve()
            const completion = Promise.withResolvers<void>()
            this.pendingOpen = { reference, completion }
            return completion.promise
        }
        if (!reference && (this.phase === 'opening' || (this.phase === 'open' && !this.virtualReference))) return
        if (!this.isOpen && this.options.onBeforeShow?.() === false) return

        const token = this.begin('opening')
        this.virtualReference = reference
        tree.setParent(this.overlayId, this.resolveParentOverlayId())
        await tree.markOpen(this.overlayId)
        if (token !== this.lifecycle) return

        if (!this.isOpen) {
            this.returnFocusTarget = getFocusedElementDeep(this.host.ownerDocument)
            this.isOpen = true
            this.options.onOpenChange(true)
        }
        await this.host.updateComplete
        if (token !== this.lifecycle) return

        await this.updatePosition()
        if (token !== this.lifecycle) return

        const view = this.host.ownerDocument.defaultView
        if (view) this.stopDismissal = listenForOverlayDismissal({
            dismiss: (reason) => { void this.hide(reason) },
            getBoundaries: () => [
                this.options.getSurfaceElement(),
                this.options.getAnchorElement(),
                ...(this.options.getDismissIgnoreElements?.() ?? []),
                ...tree.getOpenDescendantSurfaces(this.overlayId),
            ],
            isActiveLeaf: () => tree.getDeepestActiveLeafId() === this.overlayId,
            closeOnScroll: () => this.options.getCloseOnScroll?.() === true,
        })(view)

        await this.animate('open')
        if (token !== this.lifecycle) return

        this.phase = 'open'
        this.options.onShown?.()
    }

    private async animate(mode: 'open' | 'close'): Promise<void> {
        if (this.options.getQuick?.()) return
        await this.motion.play(this.options.getSurfaceElement(), mode, this.options.getPlacement())
    }
}
