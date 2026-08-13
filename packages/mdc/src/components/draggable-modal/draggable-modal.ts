/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { LitElement, css, html, type PropertyValueMap } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DraggableModalController, type TPositioningMode } from './draggable-modal-controller'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-draggable-modal": MDCDraggableModal
    }
}

@customElement('mdc-draggable-modal')
export class MDCDraggableModal extends LitElement {

    static override styles = css`
        :host([position="fixed"]) {position: fixed;}
        :host([position="absolute"]) {position: absolute;}
    `

    @property({ type: Boolean, attribute: 'boundary-protection', reflect: true })
    public boundaryProtection: boolean = false

    @property({ type: String, reflect: true })
    public position: TPositioningMode = 'fixed'

    private controller = new DraggableModalController(this)

    public constructor() {
        super()
        this.addController(this.controller)
    }

    @query('.draggable-container')
    private readonly surfaceElement!: HTMLElement

    public override get clientWidth() {
        return this.surfaceElement.clientWidth
    }
    public override get offsetWidth() {
        return this.surfaceElement.offsetWidth
    }
    public override get offsetLeft() {
        return this.surfaceElement.offsetLeft
    }
    public override get clientHeight() {
        return this.surfaceElement.clientHeight
    }
    public override get offsetHeight() {
        return this.surfaceElement.offsetHeight
    }
    public override get offsetTop() {
        return this.surfaceElement.offsetTop
    }
    public override getClientRects(): DOMRectList {
        return this.surfaceElement.getClientRects()
    }
    public override getBoundingClientRect(): DOMRect {
        return this.surfaceElement.getBoundingClientRect()
    }

    protected override willUpdate(changedProperties: PropertyValueMap<this>): void {
        if (changedProperties.has('boundaryProtection')) {
            this.controller.boundaryProtection = this.boundaryProtection
        }
        if (changedProperties.has('position')) {
            this.controller.positioningMode = this.position
        }
    }

    protected override render() {
        const styles = {
            position: this.controller.positioningMode,
            left: `${this.controller.position.x}px`,
            top: `${this.controller.position.y}px`,
            cursor: this.controller.isDragging ? 'grabbing' : 'default',
        }
        return html`
            <div class="draggable-container" style=${styleMap(styles)} @mousedown=${this.handleInteractionStart} @touchstart=${this.handleInteractionStart}>
                <slot></slot>
            </div>
        `
    }

    private readonly handleInteractionStart = (event: MouseEvent | TouchEvent): void => {
        const target = event.target as HTMLElement
        const handle = target.closest('[data-drag-handle]')
        
        if (handle) {
            this.controller.startDrag(event)
        }
    }
}
