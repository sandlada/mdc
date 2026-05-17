/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../icon/icon'
import { MeasuredContentWidthController } from '../../../utils/controller/measured-content-width-controller'
import { BaseFab } from './base-fab'
import type { AriaMixinStrict } from '../../../utils/aria/aria'

/**
 * Extended Fab components provide an icon and an label (optional).
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/floating-action-button/overview
 */
export abstract class BaseExtendedFab extends BaseFab {

    @query('.label')
    private readonly labelElement!: HTMLElement | null

    @property({ type: Boolean, reflect:true })
    public extended: boolean = false

    @property({ type: Boolean, reflect:true, attribute: 'trailing-icon' })
    public trailingIcon: boolean = false

    @state()
    private hasLabel: boolean = false

    private readonly widthTransitionController = new MeasuredContentWidthController(this, { target: () => this.labelElement })

    public constructor() {
        super()
        if(isServer) return
        this.addController(this.widthTransitionController)
    }

    protected override render(): unknown {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                ${this.renderRipple()}
                ${this.renderFocusRing()}
                ${this.renderElevation()}

                ${!this.trailingIcon ? this.renderIcon() : nothing}
                ${this.renderLabel()}
                ${this.trailingIcon ? this.renderIcon() : nothing}
            </button>
        `
    }

    protected renderLabel() {
        return html`
            <span class="label">
                <slot @slotchange=${this.handleLabelSlotChange}></slot>
            </span>
        `
    }

    protected override getRenderClasses() {
        return ({
            ...super.getRenderClasses(),
            'has-label': this.hasLabel,
            'extended': this.extended,
        })
    }

    private handleLabelSlotChange(e: Event) {
        this.hasLabel = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

}
