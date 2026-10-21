/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Navigation Rail section header.
 *
 * The header labels the group of destinations held by an
 * `<mdc-navigation-rail-section>`. It is assigned to the `header` slot of the
 * section and carries its label through its default slot:
 *
 * ```plaintext
 * |-------------------------
 * | <mdc-navigation-rail>
 * |  |--------------------|
 * |  | Section Header     |
 * |  |--------------------|
 * |  | Destination 1      |
 * |  |--------------------|
 * |-------------------------
 * ```
 *
 * @example
 * ```html
 * <mdc-navigation-rail variant="expanded-docked">
 *   <mdc-navigation-rail-section>
 *     <mdc-navigation-rail-section-header slot="header">Main</mdc-navigation-rail-section-header>
 *     <mdc-navigation-tab name="rail-tabs" value="/home" label="Home" checked>
 *       <mdc-icon slot="inactive-icon">home</mdc-icon>
 *       <mdc-icon slot="active-icon" filled>home</mdc-icon>
 *     </mdc-navigation-tab>
 *   </mdc-navigation-rail-section>
 * </mdc-navigation-rail>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/navigation-rail/specs
 * https://m3.material.io/components/navigation-rail/guidelines
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { NavigationRailSectionHeaderStyles } from './navigation-rail-section-header.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail-section-header': MDCNavigationRailSectionHeader
    }
}

/**
 * Material Design 3 Navigation Rail section header.
 *
 * @version "Material Design 3 - Expressive"
 */
@customElement('mdc-navigation-rail-section-header')
export class MDCNavigationRailSectionHeader extends LitElement {

    static override styles = NavigationRailSectionHeaderStyles

    /**
     * The label of the section.
     *
     * @remarks
     * Reserved for an attribute-driven label. The rendered label comes from the
     * default slot, so this property has no effect yet.
     */
    @property({ attribute: 'header', type: String, })
    public header: string | null = null

    @state()
    protected hasLabel: boolean = false

    public override render(): TemplateResult<1> {
        return html`
            <span class="section-header">
                <slot @slotchange=${this.handleDefaultSlotChange}></slot>
            </span>
        `
    }

    protected handleDefaultSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasLabel = slot.assignedElements().length > 0
    }

}
