import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { NavigationRailSectionHeaderStyles } from './navigation-rail-section-header.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail-section-header': MDCNavigationRailSectionHeader
    }
}

@customElement('mdc-navigation-rail-section-header')
export class MDCNavigationRailSectionHeader extends LitElement {

    static override styles = NavigationRailSectionHeaderStyles

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
