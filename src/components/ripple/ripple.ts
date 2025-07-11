/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import { type IAttachable, AttachableController } from '../../utils/controller/attachable-controller'
import { RippleAction } from './ripple-action'
import { styles } from './ripple.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-ripple": Ripple
    }
}

/**
 * Ripple is not a concept that is explicitly categorized as a component.
 *
 * The parent element of the focus ring used to provide perspective focus
 * must be set to relative.
 *
 * Ripple is often used for interactive buttons.
 * It provides a `hovered-state-layer` and a `pressed-state-layer` when the user interacts.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-ripple')
export class Ripple extends RippleAction implements IAttachable {

    static override styles = styles

    @query('.ripple')
    protected override readonly rippleElement!: HTMLElement | null

    private attachableController = new AttachableController(this, this.onControlChange.bind(this))

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

    protected override render() {
        return html`
            <span aria-hidden="true" aria-disabled=${this.disabled} class="ripple"></span>
        `
    }
}
