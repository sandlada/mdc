/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import '../focus-ring/focus-ring'
import '../ripple/ripple'
import type { IMDCDockedToolbarAction, ToolbarVariant } from './toolbar.interface'
import { DockedToolbarActionStyles } from './docked-toolbar-action.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docked-toolbar-action': MDCDockedToolbarAction
    }
}

/**
 * `<mdc-docked-toolbar-action>` is a pill-shaped action button designed for use
 * inside `<mdc-docked-toolbar>`, supporting icon, optional label, selected state,
 * and standard/vibrant toolbar theming.
 */
@customElement('mdc-docked-toolbar-action')
export class MDCDockedToolbarAction extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
)(LitElement) implements IMDCDockedToolbarAction {

    public static override styles = DockedToolbarActionStyles

    public static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property({ type: String, reflect: true })
    public variant: ToolbarVariant = 'standard'

    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: String, reflect: true })
    public label: string = ''

    protected getRenderClasses() {
        return {
            'action': true,
            [this.variant]: true,
            'selected': this.selected,
        }
    }

    public override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <button
                id="action-button"
                type="button"
                class="${classMap(this.getRenderClasses())}"
                ?disabled="${this.disabled}"
                aria-pressed="${this.selected ? 'true' : 'false'}"
                aria-label="${ariaLabel || this.label || nothing}"
            >
                <mdc-focus-ring for="action-button"></mdc-focus-ring>
                <mdc-ripple for="action-button" ?disabled="${this.disabled}"></mdc-ripple>
                <span class="icon">
                    <slot name="icon"></slot>
                    <slot></slot>
                </span>
                <span class="label">${this.label}</span>
            </button>
        `
    }
}
