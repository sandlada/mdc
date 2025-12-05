/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { BaseFab } from './base-fab'

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

    @property({ type: Boolean })
    public extended: boolean = false

    @state()
    private hasLabel: boolean = false

    protected override render(): unknown {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                ${this.renderRipple()}
                ${this.renderFocusRing()}
                ${this.renderElevation()}

                ${this.renderIcon()}
                ${this.renderLabel()}
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
