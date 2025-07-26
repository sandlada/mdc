/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { AttachableController, type IAttachable } from '../../utils/controller/attachable-controller'
import { RippleAction, type IRipple } from './ripple-action'
import { styles } from './ripple.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-ripple": MDCRipple
    }
}

/**
 * Ripple is not a concept that is explicitly categorized as a component.
 *
 * The parent element of the focus ring used to provide perspective focus
 * must be set to relative.
 *
 * Ripple is often used for interactive buttons.
 * It provides a `hovered-state-layer`, a `focused-state-layer` and a `pressed-state-layer` when the user interacts.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-ripple')
export class MDCRipple extends LitElement implements IAttachable, IRipple {

    static override styles = styles

    @query('.ripple')
    protected readonly rippleElement!: HTMLElement | null
    @query('.hover-state-layer')
    protected readonly _hoverStateLayerElement!: HTMLElement
    @query('.focus-state-layer')
    protected readonly _focusStateLayerElement!: HTMLElement
    @query('.press-state-layer')
    protected readonly _pressStateLayerElement!: HTMLElement

    @property({ type: Boolean, attribute: 'disable-hover-state-layer', reflect: true, })
    public disableHoverStateLayer: boolean = false

    @property({ type: Boolean, attribute: 'disable-focus-state-layer', reflect: true, })
    public disableFocusStateLayer: boolean = false

    @property({ type: Boolean, attribute: 'disable-press-state-layer', reflect: true, })
    public disablePressStateLayer: boolean = false

    @property({ type: Boolean, reflect: true})
    public disabled: boolean = false

    private readonly action = new RippleAction(this)
    private readonly attachableController = new AttachableController(this, this.action.onControlChange.bind(this.action))

    protected override render() {
        return html`
            <span aria-hidden="true" aria-disabled=${this.disabled} class="ripple">
                <span class="hover-state-layer" aria-hidden="true"></span>
                <span class="focus-state-layer" aria-hidden="true"></span>
                <span class="press-state-layer" aria-hidden="true"></span>
            </span>
        `
    }

    public get hoverStateLayerElement() {
        return this._hoverStateLayerElement
    }
    public get focusStateLayerElement() {
        return this._focusStateLayerElement
    }
    public get pressStateLayerElement() {
        return this._pressStateLayerElement
    }

    public get hovered() {
        return this.hasAttribute('hovered')
    }
    public set hovered(hovered: boolean) {
        this.toggleAttribute('hovered', hovered)
    }
    public get focused() {
        return this.hasAttribute('focused')
    }
    public set focused(focused: boolean) {
        this.toggleAttribute('focused', focused)
    }
    public get pressed() {
        return this.hasAttribute('pressed')
    }
    public set pressed(pressed: boolean) {
        this.toggleAttribute('pressed', pressed)
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
