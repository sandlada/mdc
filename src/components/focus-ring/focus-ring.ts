/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { isServer, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { AttachableController } from '../../utils/controller/attachable-controller'
import type { IFocusRing } from './focus-ring.interface'
import { FocusRingStyle } from './focus-ring.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-focus-ring": MDCFocusRing
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
 * @version
 * Material Design 3 - Non-Standardized
 */
@customElement('mdc-focus-ring')
export class MDCFocusRing extends LitElement implements IFocusRing {

    static override styles = FocusRingStyle

    @property({ type: Boolean, reflect: true })
    public inward = false

    @property({ type: Boolean, reflect: true, attribute: 'shape-inherit' })
    public shapeInherit = true

    @property({ type: Boolean, reflect: true, attribute: 'disable-animation' })
    public disableAnimation = false

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: Boolean, reflect: true, attribute: 'focus-on-hover' })
    public focusOnHover = false

    @property({ type: Boolean, reflect: true, noAccessor: true })
    public get focused() {
        return this.hasAttribute('focused')
    }
    public set focused(value: boolean) {
        if (value) {
            this.setAttribute('focused', '')
            return
        }

        this.removeAttribute('focused')
        this.removeAttribute('closing')
        this.clearTimer()
    }

    public constructor() {
        super()
        if(isServer) return
    }

    private readonly attachableController = new AttachableController(this, this.onControlChange.bind(this))

    private static readonly FocusRingEvents = [
        'focusin',
        'focusout',
        'pointerdown',
    ] as const

    private readonly boundHandleEvent = (e: Event) => this.handleEvent(e)
    private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
        if (isServer) return
        for (const event of MDCFocusRing.FocusRingEvents) {
            prev?.removeEventListener(event, this.boundHandleEvent)
            next?.addEventListener(event, this.boundHandleEvent)
        }
    }

    private timer: null | ReturnType<typeof setTimeout> = null
    private clearTimer() {
        if (!this.timer) return
        clearTimeout(this.timer)
        this.timer = null
    }

    private hide() {
        this.focused = false
    }

    private handleEvent(e: Event) {
        if(this.disabled) return
        const duration = parseFloat(getComputedStyle(this).getPropertyValue('--_duration')) || 0

        this.clearTimer()

        switch (e.type) {
            case 'focusin': {
                const isVisible = this.control?.matches(':focus-visible') ?? false
                if (isVisible) {
                    this.removeAttribute('closing')
                    this.focused = true
                }
                break
            }
            case 'focusout':
            case 'pointerdown':
                this.setAttribute('closing', '')
                this.timer = setTimeout(() => {
                    this.hide()
                }, duration * 0.5)
                break
            default:
                break
        }
    }

    public get htmlFor() {
        return this.attachableController.htmlFor
    }
    public set htmlFor(htmlFor: string | null) {
        this.attachableController.htmlFor = htmlFor
    }

    public get control() {
        return this.attachableController.control
    }
    public set control(control: HTMLElement | null) {
        this.attachableController.control = control
    }

    public attach(control: HTMLElement) {
        this.attachableController.attach(control)
    }
    public detach() {
        this.attachableController.detach()
    }

}
