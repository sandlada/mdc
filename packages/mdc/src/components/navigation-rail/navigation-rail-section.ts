/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Navigation Rail section.
 *
 * A section groups the destinations of an `<mdc-navigation-rail>`. The group is
 * labelled by an `<mdc-navigation-rail-section-header>` assigned to the
 * `header` slot of the section:
 *
 * ```plaintext
 * |-------------------------
 * | <mdc-navigation-rail>
 * |  |--------------------|
 * |  | Section Header     |
 * |  |--------------------|
 * |  | Destination 1      |
 * |  | Destination 2      |
 * |  |--------------------|
 * |-------------------------
 * ```
 *
 * The section header is optional — a section without one is a plain group of
 * destinations. Section headers label a group, so they are meant for the
 * expanded variants; a collapsed or XR rail groups its destinations in
 * headerless sections.
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
 *     <mdc-navigation-tab name="rail-tabs" value="/search" label="Search">
 *       <mdc-icon slot="inactive-icon">search</mdc-icon>
 *       <mdc-icon slot="active-icon" filled>search</mdc-icon>
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
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationRailSectionStyles } from './navigation-rail-section.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail-section': MDCNavigationRailSection
    }
}

/**
 * Material Design 3 Navigation Rail section.
 *
 * @version "Material Design 3 - Expressive"
 */
@customElement('mdc-navigation-rail-section')
export class MDCNavigationRailSection extends LitElement {

    static override styles = NavigationRailSectionStyles

    @state()
    protected hasDefault: boolean = false
    @state()
    protected hasHeader: boolean = false

    public getContainerClasses() {
        return ({
            section: true,
            'has-header': this.hasHeader,
            'has-content': this.hasDefault,
        })
    }

    public override render(): TemplateResult<1> {
        return html`
            <div class=${classMap(this.getContainerClasses())}>
                ${this.renderHeaderSlot()}
                ${this.renderDefaultSlot()}
            </div>
        `
    }

    public renderDefaultSlot() {
        return html`<slot @slotchange=${this.handleDefaultSlotChange}></slot>`
    }

    public renderHeaderSlot() {
        return html`<slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>`
    }

    protected handleDefaultSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasDefault = slot.assignedElements().length > 0
    }

    protected handleHeaderSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasHeader = slot.assignedElements().length > 0
    }

}
