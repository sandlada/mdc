/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { isServer, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { type IAttachable, AttachableController } from '../../utils/controller/attachable-controller'
import { styles } from './focus-ring.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-focus-ring": FocusRing
    }
}

/**
 * The parent element of the focus ring used to provide perspective focus
 * must be set to relative and the tabindex must not be -1.
 *
 * @example
 * ```html
 * <div tabindex="0" class="my-box">
 *     <mdc-focus-ring></mdc-focus-ring>
 * </div>
 * <style>
 * .my-box {
 *     position: relative;
 *     height: 40px;
 *     width: 72px;
 *     background: red;
 *     border: none;
 *     outline: none;
 * }
 * </style>
 * ```
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-focus-ring')
export class FocusRing extends LitElement implements IAttachable {

    static override styles = styles

    @property({ type: Boolean })
    public inward = false

    @property({ type: Boolean, reflect: true, attribute: 'shape-inherit' })
    public shapeInherit = true

    private attachableController = new AttachableController(this, this.onControlChange.bind(this))

    get htmlFor() {
        return this.attachableController.htmlFor
    }
    set htmlFor(htmlFor: string | null) {
        this.attachableController.htmlFor = htmlFor
    }

    get control() {
        return this.attachableController.control
    }
    set control(control: HTMLElement | null) {
        this.attachableController.control = control
    }

    public attach(control: HTMLElement) {
        this.attachableController.attach(control)
    }
    public detach() {
        this.attachableController.detach()
    }

    public get visible() {
        return this.hasAttribute('visible')
    }
    public set visible(value: boolean) {
        this.toggleAttribute('visible', value)
    }

    private focusRingEvents = [
        'focusin',
        'focusout',
        'pointerdown'
    ]
    private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
        if (isServer) {
            return
        }
        for (const event of this.focusRingEvents) {
            prev?.removeEventListener(event, this.handleEvent.bind(this))
            next?.addEventListener(event, this.handleEvent.bind(this))
        }
    }
    private handleEvent(e: Event) {
        switch (e.type) {
            case 'focusin':
                this.visible = this.control?.matches(':focus-visible') ?? false
                break
            case 'focusout':
                this.visible = false
                break
            case 'pointerdown':
                this.visible = false
                break
            default:
                break
        }
    }
}
